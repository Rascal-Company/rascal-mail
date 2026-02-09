import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/server";
import { createDataClient } from "@/lib/airtable/client";

export async function POST(request: NextRequest) {
  try {
    const authClient = await createAuthServerClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, contacts } = body;

    if (!organizationId || !contacts || !Array.isArray(contacts)) {
      return NextResponse.json(
        { error: "Organization ID and contacts array required" },
        { status: 400 },
      );
    }

    const dataClient = await createDataClient();

    const insertData = contacts.map((contact) => ({
      organization_id: organizationId,
      email: contact.email,
      first_name: contact.first_name || null,
      last_name: contact.last_name || null,
      status: "subscribed",
    }));

    const { data, error } = await dataClient
      .from("contacts")
      .insert(insertData)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      total: contacts.length,
    });
  } catch (error) {
    console.error("Contact import error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
