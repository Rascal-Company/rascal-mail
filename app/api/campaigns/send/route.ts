import { NextRequest, NextResponse } from "next/server";
import { createAirtableBase } from "@/lib/airtable/client";

// Simplified demo version - no actual email sending, just update campaign status
export async function POST(request: NextRequest) {
  try {
    const { campaignId } = await request.json();
    const base = createAirtableBase();

    // Get campaign details
    const campaign = await base("Campaigns").find(campaignId);

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    // Update campaign status to 'sent' (mock sending)
    await base("Campaigns").update(campaignId, {
      status: "sent",
      total_recipients: 100, // Mock recipient count
      updated_at: new Date().toISOString(),
    });

    // Create mock email_sends records
    const mockSends = [];
    for (let i = 0; i < 10; i++) {
      mockSends.push({
        campaign_id: [campaignId],
        contact_id: [`contact-${i}`],
        status: "sent",
        sent_at: new Date().toISOString(),
      });
    }

    await base("Email Sends").create(
      mockSends.map((send) => ({ fields: send })),
    );

    return NextResponse.json({ success: true, recipientCount: 100 });
  } catch (error) {
    console.error("Campaign send error:", error);
    return NextResponse.json(
      { error: "Failed to send campaign" },
      { status: 500 },
    );
  }
}
