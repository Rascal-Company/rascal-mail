import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";

export const GET = withAuth(async ({ client, request }) => {
  const url = new URL(request.url);
  const segments = url.pathname.split("/");
  const listId = segments[segments.indexOf("lists") + 1];

  const { data: members, error: membersError } = await client
    .from("contact_list_members")
    .select("*")
    .eq("list_id", listId);

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 500 });
  }

  if (!members || members.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const contactIds = members.map((m: any) => m.contact_id);

  const { data: contacts, error: contactsError } = await client
    .from("contacts")
    .select("*")
    .in("id", contactIds);

  if (contactsError) {
    return NextResponse.json({ error: contactsError.message }, { status: 500 });
  }

  return NextResponse.json({ data: contacts || [] });
});
