import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";

export const GET = withAuth(async ({ client, organizationId }) => {
  const { data, error } = await client
    .from("contacts")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data || [],
    total: data?.length || 0,
  });
});

export const POST = withAuth(async ({ client, organizationId, request }) => {
  const body = await request.json();
  const { organizationId: _ignored, ...contactData } = body;

  const { data, error } = await client
    .from("contacts")
    .insert({
      ...contactData,
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
    return NextResponse.json({ error: "Contact ID required" }, { status: 400 });
  }

  const { data, error } = await client
    .from("contacts")
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
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json(
      { error: "Contact IDs required" },
      { status: 400 },
    );
  }

  const ids = idsParam.split(",");

  const { error } = await client
    .from("contacts")
    .delete()
    .in("id", ids)
    .eq("organization_id", organizationId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
});
