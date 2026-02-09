import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";

export const POST = withAuth(async ({ client, organizationId, request }) => {
  const body = await request.json();
  const { contacts } = body;

  if (!contacts || !Array.isArray(contacts)) {
    return NextResponse.json(
      { error: "Contacts array required" },
      { status: 400 },
    );
  }

  const insertData = contacts.map((contact) => ({
    organization_id: organizationId,
    email: contact.email,
    first_name: contact.first_name || null,
    last_name: contact.last_name || null,
    status: "subscribed",
  }));

  const { data, error } = await client
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
});
