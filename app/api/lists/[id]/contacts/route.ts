import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/server";
import { createDataClient } from "@/lib/airtable/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authClient = await createAuthServerClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: listId } = await params;
    const dataClient = createDataClient();

    // Get contact list members for this list
    const { data: members, error: membersError } = await dataClient
      .from("Contact List Members")
      .eq("list_id", listId)
      .select();

    if (membersError) {
      return NextResponse.json(
        { error: membersError.message },
        { status: 500 },
      );
    }

    if (!members || members.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Get contact IDs (Airtable returns linked records as arrays)
    const contactIds = members.map((m: any) => m.contact_id[0]);

    // Fetch actual contacts
    const { data: contacts, error: contactsError } = await dataClient
      .from("Contacts")
      .in("id", contactIds)
      .select();

    if (contactsError) {
      return NextResponse.json(
        { error: contactsError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: contacts || [] });
  } catch (error) {
    console.error("List contacts GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
