import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";

export const POST = withAuth(async ({ client, organizationId, request }) => {
  const { campaignId } = await request.json();

  const { data: campaign, error: campaignError } = await client
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .eq("organization_id", organizationId)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const { data: recipients } = await client
    .from("campaign_recipients")
    .select("list_id")
    .eq("campaign_id", campaignId);

  const listIds = (recipients ?? []).map((r) => r.list_id);

  let totalRecipients = 0;
  if (listIds.length > 0) {
    const { count } = await client
      .from("contact_list_members")
      .select("contact_id", { count: "exact", head: true })
      .in("list_id", listIds);
    totalRecipients = count ?? 0;
  }

  await client
    .from("campaigns")
    .update({
      status: "sent",
      total_recipients: totalRecipients,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId)
    .eq("organization_id", organizationId);

  return NextResponse.json({ success: true, recipientCount: totalRecipients });
});
