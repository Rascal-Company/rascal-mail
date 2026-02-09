import { NextRequest, NextResponse } from "next/server";
import { createDataClient } from "@/lib/airtable/client";

// Simplified demo version - no actual email sending, just update campaign status
export async function POST(request: NextRequest) {
  try {
    const { campaignId } = await request.json();
    const dataClient = await createDataClient();

    // Get campaign details
    const { data: campaign, error: campaignError } = await dataClient
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    // Update campaign status to 'sent' (mock sending)
    await dataClient
      .from("campaigns")
      .update({
        status: "sent",
        total_recipients: 100, // Mock recipient count
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaignId);

    // Create mock email_sends records
    const mockSends = [];
    for (let i = 0; i < 10; i++) {
      mockSends.push({
        campaign_id: campaignId,
        organization_id: campaign.organization_id,
        contact_id: `contact-mock-${i}`,
        status: "sent",
        sent_at: new Date().toISOString(),
      });
    }

    await dataClient.from("email_sends").insert(mockSends);

    return NextResponse.json({ success: true, recipientCount: 100 });
  } catch (error) {
    console.error("Campaign send error:", error);
    return NextResponse.json(
      { error: "Failed to send campaign" },
      { status: 500 },
    );
  }
}
