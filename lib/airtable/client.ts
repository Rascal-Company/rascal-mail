import Airtable from "airtable";
import { createDataAdapter } from "./adapter";

/**
 * Server-side only Airtable client.
 * Uses non-public environment variables that are not exposed to the browser.
 */
export function createAirtableBase() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    throw new Error(
      "Missing Airtable credentials: AIRTABLE_API_KEY and AIRTABLE_BASE_ID required. These should be set in .env.local (server-side only, no NEXT_PUBLIC_ prefix)",
    );
  }

  const base = new Airtable({ apiKey }).base(baseId);
  return base;
}

// Returns a Supabase-compatible data client (server-side only)
export function createDataClient() {
  const base = createAirtableBase();
  return createDataAdapter(base);
}
