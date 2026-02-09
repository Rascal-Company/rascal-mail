import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";

export const GET = withAuth(async ({ client, organizationId, request }) => {
  const { searchParams } = new URL(request.url);
  const listId = searchParams.get("id");

  if (listId) {
    const { data, error } = await client
      .from("contact_lists")
      .select("*")
      .eq("id", listId)
      .eq("organization_id", organizationId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  const { data, error } = await client
    .from("contact_lists")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
});

export const POST = withAuth(async ({ client, organizationId, request }) => {
  const body = await request.json();
  const { contactIds, listId, organizationId: _ignored, ...listData } = body;

  if (contactIds && listId) {
    const rows = contactIds.map((contactId: string) => ({
      contact_id: contactId,
      list_id: listId,
    }));

    const { error } = await client.from("contact_list_members").insert(rows);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  const { data, error } = await client
    .from("contact_lists")
    .insert({
      ...listData,
      organization_id: organizationId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
});

export const PUT = withAuth(async ({ client, organizationId, request }) => {
  const body = await request.json();
  const { id, ...updateData } = body;

  if (!id) {
    return NextResponse.json({ error: "List ID required" }, { status: 400 });
  }

  const { data, error } = await client
    .from("contact_lists")
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
});

export const DELETE = withAuth(async ({ client, organizationId, request }) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "List ID required" }, { status: 400 });
  }

  const { error } = await client
    .from("contact_lists")
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
});
