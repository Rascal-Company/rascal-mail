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

    const dataClient = await createDataClient();

    // Get org memberships for this user
    const { data: members, error: membersError } = await dataClient
      .from("org_members")
      .select("*")
      .eq("user_id", user.id);

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
    const orgIds = members.map((m: any) => m.organization_id).filter(Boolean);

    const { data: orgs, error: orgsError } = await dataClient
      .from("organizations")
      .select("*")
      .in("id", orgIds);

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

    const dataClient = await createDataClient();

    // Update organization
    const { data, error } = await dataClient
      .from("organizations")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

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
    const dataClient = await createDataClient();

    // Create organization
    const { data: org, error: orgError } = await dataClient
      .from("organizations")
      .insert(body)
      .select()
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: orgError?.message || "Failed to create organization" },
        { status: 500 },
      );
    }

    // Create org membership
    await dataClient.from("org_members").insert({
      user_id: user.id,
      email: user.email!,
      organization_id: org.id,
      role: "owner",
    });

    return NextResponse.json({ data: org });
  } catch (error) {
    console.error("Organizations POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
