"use server";

import {
  createAdminClient,
  createAuthServerClient,
} from "@/lib/supabase/server";

type ProvisionResult =
  | { allowed: false }
  | { allowed: true; organizationId: string };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function provisionOrganization(
  authUserId: string,
): Promise<ProvisionResult> {
  const authClient = await createAuthServerClient();

  const { data: membership, error: membershipError } = await authClient
    .from("org_members")
    .select("org_id, role, email")
    .eq("auth_user_id", authUserId)
    .single();

  if (membershipError || !membership) {
    throw new Error("Could not find organization membership in Rascal AI");
  }

  const { data: orgData, error: orgError } = await authClient
    .from("users")
    .select(
      "company_name, logo_url, contact_person, contact_email, content_language, industry, features",
    )
    .eq("id", membership.org_id)
    .single();

  if (orgError || !orgData) {
    throw new Error("Could not find organization data in Rascal AI");
  }

  const features: string[] = orgData.features ?? [];
  if (!features.includes("Rascal Mail")) {
    return { allowed: false };
  }

  const adminClient = createAdminClient();

  const { data: existingMember } = await adminClient
    .from("org_members")
    .select("organization_id")
    .eq("user_id", authUserId)
    .single();

  if (existingMember) {
    return { allowed: true, organizationId: existingMember.organization_id };
  }

  const slug = slugify(orgData.company_name ?? "organization");

  const { data: org, error: createOrgError } = await adminClient
    .from("organizations")
    .insert({
      name: orgData.company_name ?? "Organization",
      slug,
      logo_url: orgData.logo_url,
      from_name: orgData.contact_person,
      from_email: orgData.contact_email,
      reply_to_email: orgData.contact_email,
      settings: {
        timezone: "Europe/Helsinki",
        content_language: orgData.content_language,
        industry: orgData.industry,
      },
    })
    .select("id")
    .single();

  if (createOrgError || !org) {
    throw new Error(
      `Failed to create organization: ${createOrgError?.message}`,
    );
  }

  const { error: createMemberError } = await adminClient
    .from("org_members")
    .insert({
      user_id: authUserId,
      email: membership.email ?? orgData.contact_email,
      organization_id: org.id,
      role: membership.role,
    });

  if (createMemberError) {
    throw new Error(
      `Failed to create org member: ${createMemberError.message}`,
    );
  }

  return { allowed: true, organizationId: org.id };
}
