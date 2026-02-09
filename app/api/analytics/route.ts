import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/server";
import { createDataClient } from "@/lib/airtable/client";

export async function GET(request: NextRequest) {
  try {
    const authClient = await createAuthServerClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const organizationId = searchParams.get("organizationId");
    const campaignId = searchParams.get("campaignId");

    // Get dashboard stats (mock for demo)
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

    // Get campaign stats (mock for demo)
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

    // Get campaign analytics (mock for demo)
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

    // Get recent campaigns
    if (type === "recent-campaigns") {
      if (!organizationId) {
        return NextResponse.json(
          { error: "Organization ID required" },
          { status: 400 },
        );
      }

      const limit = parseInt(searchParams.get("limit") || "5");
      const dataClient = createDataClient();

      const { data, error } = await dataClient
        .from("Campaigns")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .range(0, limit - 1)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data: data || [] });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
