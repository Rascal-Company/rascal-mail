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

    const dataClient = createDataClient();

    // Get org memberships for this user
    const { data: members, error: membersError } = await dataClient
      .from("Org Members")
      .eq("user_id", user.id)
      .select();

    if (membersError) {
      return NextResponse.json(
        { error: membersError.message },
        { status: 500 },
      );
    }

    if (!members || members.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Get organizations
    const orgIds = members
      .map((m: any) => {
        const orgId = m.organization_id;
        return Array.isArray(orgId) ? orgId[0] : orgId;
      })
      .filter(Boolean);

    const { data: orgs, error: orgsError } = await dataClient
      .from("Organizations")
      .in("id", orgIds)
      .select();

    if (orgsError) {
      return NextResponse.json({ error: orgsError.message }, { status: 500 });
    }

    return NextResponse.json({ data: orgs || [] });
  } catch (error) {
    console.error("Organizations GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authClient = await createAuthServerClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 },
      );
    }

    const dataClient = createDataClient();

    // Update organization
    const { data, error } = await dataClient
      .from("Organizations")
      .eq("id", id)
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Organizations PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authClient = await createAuthServerClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const dataClient = createDataClient();

    // Create organization
    const { data: orgs, error: orgError } = await dataClient
      .from("Organizations")
      .insert({
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (orgError || !orgs || orgs.length === 0) {
      return NextResponse.json(
        { error: orgError?.message || "Failed to create organization" },
        { status: 500 },
      );
    }

    // Create org membership
    await dataClient.from("Org Members").insert({
      user_id: user.id,
      email: user.email!,
      organization_id: [String(orgs[0].id)],
      role: "owner",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ data: orgs[0] });
  } catch (error) {
    console.error("Organizations POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
