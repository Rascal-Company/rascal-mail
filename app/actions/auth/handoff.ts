"use server";

import { provisionOrganization } from "@/lib/provisioning/provision-organization";
import { createAuthServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function handleAuthHandoff(
  accessToken: string,
  refreshToken: string,
) {
  const supabase = await createAuthServerClient();

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    return { error: error.message };
  }

  const userId = data.session?.user.id;
  if (!userId) {
    return { error: "No user in session" };
  }

  const result = await provisionOrganization(supabase, userId);

  if (!result.allowed) {
    revalidatePath("/", "layout");
    redirect("/unauthorized");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
