import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  createAdminClient,
  createAuthServerClient,
} from "@/lib/supabase/server";

export type AuthContext = {
  client: SupabaseClient;
  userId: string;
  organizationId: string;
  role: string;
  request: NextRequest;
};

type AuthHandler = (ctx: AuthContext) => Promise<NextResponse>;

export function withAuth(handler: AuthHandler) {
  return async (
    request: NextRequest,
    routeContext?: { params: Promise<Record<string, string>> },
  ) => {
    try {
      const authClient = await createAuthServerClient();
      const {
        data: { user },
      } = await authClient.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const adminClient = createAdminClient();

      const { data: member } = await adminClient
        .from("org_members")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .single();

      if (!member) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const ctx: AuthContext = {
        client: adminClient,
        userId: user.id,
        organizationId: member.organization_id,
        role: member.role,
        request,
      };

      return await handler(ctx);
    } catch (error) {
      console.error("API error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}
