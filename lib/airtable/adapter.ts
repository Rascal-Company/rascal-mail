import type Airtable from "airtable";
import type { FieldSet, Records } from "airtable";

type FilterOperator = "eq" | "in" | "ilike";

interface Filter {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

interface QueryBuilder<T extends FieldSet> {
  select: () => Promise<{ data: T[] | null; error: Error | null }>;
  insert: (
    data: Partial<T> | Partial<T>[],
  ) => Promise<{ data: T[] | null; error: Error | null }>;
  update: (
    data: Partial<T>,
  ) => Promise<{ data: T | null; error: Error | null }>;
  delete: () => Promise<{ error: Error | null }>;
  eq: (field: string, value: unknown) => QueryBuilder<T>;
  in: (field: string, values: unknown[]) => QueryBuilder<T>;
  ilike: (field: string, pattern: string) => QueryBuilder<T>;
  order: (field: string, options?: { ascending?: boolean }) => QueryBuilder<T>;
  range: (from: number, to: number) => QueryBuilder<T>;
}

export function createQueryBuilder<T extends FieldSet>(
  table: Airtable.Table<T>,
  tableName: string,
): QueryBuilder<T> {
  const filters: Filter[] = [];
  let orderBy: { field: string; ascending: boolean } | null = null;
  let rangeLimit: { from: number; to: number } | null = null;

  const buildFilterFormula = (): string | undefined => {
    if (filters.length === 0) return undefined;

    const formulas = filters.map((filter) => {
      switch (filter.operator) {
        case "eq":
          return `{${filter.field}} = ${typeof filter.value === "string" ? `'${filter.value}'` : filter.value}`;
        case "in":
          if (!Array.isArray(filter.value)) return "";
          const values = filter.value.map((v) =>
            typeof v === "string" ? `'${v}'` : v,
          );
          return `OR(${values.map((v) => `{${filter.field}} = ${v}`).join(", ")})`;
        case "ilike":
          return `SEARCH(LOWER('${filter.value}'), LOWER({${filter.field}}))`;
        default:
          return "";
      }
    });

    return filters.length === 1 ? formulas[0] : `AND(${formulas.join(", ")})`;
  };

  const builder: QueryBuilder<T> = {
    select: async () => {
      try {
        const filterFormula = buildFilterFormula();
        const query = table.select({
          ...(filterFormula && { filterByFormula: filterFormula }),
          ...(orderBy && {
            sort: [
              {
                field: orderBy.field,
                direction: orderBy.ascending ? "asc" : "desc",
              },
            ],
          }),
        });

        const records = await query.all();
        let data = records.map((record) => ({
          id: record.id,
          ...record.fields,
        })) as T[];

        // Apply range if specified
        if (rangeLimit) {
          data = data.slice(rangeLimit.from, rangeLimit.to + 1);
        }

        return { data, error: null };
      } catch (error) {
        return { data: null, error: error as Error };
      }
    },

    insert: async (data) => {
      try {
        const records = Array.isArray(data) ? data : [data];
        // Filter out null values to prevent Airtable errors
        const cleanRecords = records.map((record) => {
          const cleanedRecord: any = {};
          for (const [key, value] of Object.entries(record)) {
            if (value !== null) {
              cleanedRecord[key] = value;
            }
          }
          return { fields: cleanedRecord };
        });

        const created = await table.create(cleanRecords as any);

        const result = (created as any[]).map((record: any) => ({
          id: record.id,
          ...record.fields,
        })) as T[];

        return { data: result, error: null };
      } catch (error) {
        return { data: null, error: error as Error };
      }
    },

    update: async (data) => {
      try {
        // For update, we need a record ID in the filters
        const idFilter = filters.find(
          (f) => f.field === "id" && f.operator === "eq",
        );
        if (!idFilter || typeof idFilter.value !== "string") {
          throw new Error("Update requires an id filter");
        }

        // Filter out null values
        const cleanData: any = {};
        for (const [key, value] of Object.entries(data)) {
          if (value !== null) {
            cleanData[key] = value;
          }
        }

        const updated = await table.update(idFilter.value, cleanData as any);
        const result = {
          id: (updated as any).id,
          ...(updated as any).fields,
        } as T;

        return { data: result, error: null };
      } catch (error) {
        return { data: null, error: error as Error };
      }
    },

    delete: async () => {
      try {
        const idFilter = filters.find(
          (f) => f.field === "id" && f.operator === "eq",
        );
        if (!idFilter || typeof idFilter.value !== "string") {
          throw new Error("Delete requires an id filter");
        }

        await table.destroy(idFilter.value);
        return { error: null };
      } catch (error) {
        return { error: error as Error };
      }
    },

    eq: (field, value) => {
      filters.push({ field, operator: "eq", value });
      return builder;
    },

    in: (field, values) => {
      filters.push({ field, operator: "in", value: values });
      return builder;
    },

    ilike: (field, pattern) => {
      filters.push({ field, operator: "ilike", value: pattern });
      return builder;
    },

    order: (field, options = {}) => {
      orderBy = { field, ascending: options.ascending ?? true };
      return builder;
    },

    range: (from, to) => {
      rangeLimit = { from, to };
      return builder;
    },
  };

  return builder;
}

export function createDataAdapter(
  base: ReturnType<typeof Airtable.prototype.base>,
) {
  return {
    from: <T extends FieldSet>(tableName: string) => {
      const table = base<T>(tableName);
      return createQueryBuilder<T>(table, tableName);
    },
  };
}
