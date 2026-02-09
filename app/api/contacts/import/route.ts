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

    const dataClient = createDataClient();

    let imported = 0;
    const batchSize = 10; // Airtable batch limit

    // Process contacts in batches
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      const insertData = batch.map((contact) => ({
        organization_id: [organizationId],
        email: contact.email,
        first_name: contact.first_name || "",
        last_name: contact.last_name || "",
        status: "subscribed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      try {
        const { data } = await dataClient.from("Contacts").insert(insertData);
        imported += data?.length || 0;
      } catch (error) {
        console.error("Batch import error:", error);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
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
