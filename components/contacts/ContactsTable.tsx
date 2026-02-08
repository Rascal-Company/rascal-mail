'use client';

import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, ListPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Contact } from '@/types';
import { formatDate } from '@/lib/utils/formatters';
import Link from 'next/link';

const statusLabels: Record<string, string> = {
  subscribed: 'Tilaaja',
  unsubscribed: 'Peruuttanut',
  bounced: 'Virhe',
  complained: 'Valittanut',
};

const statusVariants: Record<string, 'success' | 'secondary' | 'destructive' | 'warning'> = {
  subscribed: 'success',
  unsubscribed: 'secondary',
  bounced: 'destructive',
  complained: 'warning',
};

interface ContactsTableProps {
  contacts: Contact[];
  onDelete: (ids: string[]) => void;
  onAddToList: (ids: string[]) => void;
}

export function ContactsTable({ contacts, onDelete, onAddToList }: ContactsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<Contact>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'email',
      header: 'Sähköposti',
      cell: ({ row }) => (
        <Link href={`/dashboard/contacts/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.email}
        </Link>
      ),
    },
    {
      accessorKey: 'first_name',
      header: 'Etunimi',
    },
    {
      accessorKey: 'last_name',
      header: 'Sukunimi',
    },
    {
      accessorKey: 'company',
      header: 'Yritys',
    },
    {
      accessorKey: 'status',
      header: 'Tila',
      cell: ({ row }) => (
        <Badge variant={statusVariants[row.original.status]}>
          {statusLabels[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Lisätty',
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/contacts/${row.original.id}`}>Näytä</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddToList([row.original.id])}>
              Lisää listalle
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete([row.original.id])}
            >
              Poista
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: contacts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: { sorting, rowSelection },
  });

  const selectedIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id);

  return (
    <div>
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedIds.length} valittu</span>
          <Button variant="outline" size="sm" onClick={() => onAddToList(selectedIds)}>
            <ListPlus className="mr-2 h-4 w-4" />
            Lisää listalle
          </Button>
          <Button variant="outline" size="sm" className="text-destructive" onClick={() => onDelete(selectedIds)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Poista
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Ei kontakteja
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
