import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";

export const GET = withAuth(async ({ client, organizationId, request }) => {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("id");

  if (campaignId) {
    const { data, error } = await client
      .from("campaigns")
      .select("*, campaign_recipients(list_id)")
      .eq("id", campaignId)
      .eq("organization_id", organizationId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  const { data, error } = await client
    .from("campaigns")
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
  const { organizationId: _ignored, list_ids, ...campaignData } = body;

  const { data, error } = await client
    .from("campaigns")
    .insert({
      ...campaignData,
      organization_id: organizationId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (Array.isArray(list_ids) && list_ids.length > 0 && data) {
    const recipients = list_ids.map((listId: string) => ({
      campaign_id: data.id,
      list_id: listId,
    }));
    await client.from("campaign_recipients").insert(recipients);
  }

  return NextResponse.json({ data });
});

export const PUT = withAuth(async ({ client, organizationId, request }) => {
  const body = await request.json();
  const { id, list_ids, ...updateData } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Campaign ID required" },
      { status: 400 },
    );
  }

  const { data, error } = await client
    .from("campaigns")
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

  if (Array.isArray(list_ids)) {
    await client.from("campaign_recipients").delete().eq("campaign_id", id);

    if (list_ids.length > 0) {
      const recipients = list_ids.map((listId: string) => ({
        campaign_id: id,
        list_id: listId,
      }));
      await client.from("campaign_recipients").insert(recipients);
    }
  }

  return NextResponse.json({ data });
});

export const DELETE = withAuth(async ({ client, organizationId, request }) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Campaign ID required" },
      { status: 400 },
    );
  }

  const { error } = await client
    .from("campaigns")
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
});
