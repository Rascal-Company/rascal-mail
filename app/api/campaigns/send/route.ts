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

  await client
    .from("campaigns")
    .update({
      status: "sent",
      total_recipients: 100,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId)
    .eq("organization_id", organizationId);

  const mockSends = [];
  for (let i = 0; i < 10; i++) {
    mockSends.push({
      campaign_id: campaignId,
      organization_id: organizationId,
      contact_id: `contact-mock-${i}`,
      status: "sent",
      sent_at: new Date().toISOString(),
    });
  }

  await client.from("email_sends").insert(mockSends);

  return NextResponse.json({ success: true, recipientCount: 100 });
});
