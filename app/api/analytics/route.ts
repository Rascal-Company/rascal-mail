import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";

export const GET = withAuth(async ({ client, organizationId, request }) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const campaignId = searchParams.get("campaignId");

  if (type === "dashboard") {
    return NextResponse.json({
      data: {
        totalContacts: 127,
        emailsSent30d: 1543,
        openRate: 42.5,
        clickRate: 18.2,
      },
    });
  }

  if (type === "campaign-stats" && campaignId) {
    return NextResponse.json({
      data: {
        campaign_id: campaignId,
        total_sent: 100,
        delivered: 98,
        opened: 45,
        unique_opens: 40,
        clicked: 12,
        unique_clicks: 10,
        bounced: 2,
        spam_reports: 0,
        unsubscribed: 0,
        open_rate: 45.9,
        click_rate: 12.2,
        updated_at: new Date().toISOString(),
      },
    });
  }

  if (type === "campaign-analytics" && campaignId) {
    return NextResponse.json({
      data: {
        sends: [],
        stats: {
          campaign_id: campaignId,
          total_recipients: 100,
          delivered: 98,
          opened: 45,
          clicked: 12,
          bounced: 2,
          open_rate: 45.9,
          click_rate: 12.2,
        },
      },
    });
  }

  if (type === "recent-campaigns") {
    const limit = parseInt(searchParams.get("limit") || "5");

    const { data, error } = await client
      .from("campaigns")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
});
