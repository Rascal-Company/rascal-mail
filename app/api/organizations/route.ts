import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";

export const GET = withAuth(async ({ client, userId }) => {
  const { data: members, error: membersError } = await client
    .from("org_members")
    .select("*")
    .eq("user_id", userId);

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 500 });
  }

  if (!members || members.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const orgIds = members.map((m: any) => m.organization_id).filter(Boolean);

  const { data: orgs, error: orgsError } = await client
    .from("organizations")
    .select("*")
    .in("id", orgIds);

  if (orgsError) {
    return NextResponse.json({ error: orgsError.message }, { status: 500 });
  }

  return NextResponse.json({ data: orgs || [] });
});

export const PUT = withAuth(async ({ client, organizationId, request }) => {
  const body = await request.json();
  const { id, ...updateData } = body;

  if (id !== organizationId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await client
    .from("organizations")
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", organizationId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
});
