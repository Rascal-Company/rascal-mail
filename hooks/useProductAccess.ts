"use client";

import { useState, useEffect } from "react";
import { createAuthClient } from "@/lib/supabase/client";

import type { User } from "@supabase/supabase-js";

type OrgProduct = {
  product_slug: string;
  product_name: string;
  product_icon: string | null;
  is_enabled: boolean;
  plan_tier: string;
  trial_ends_at: string | null;
  has_access: boolean;
};

type ProductAccessState = {
  hasAccess: boolean;
  products: OrgProduct[];
  currentProduct: OrgProduct | null;
  isLoading: boolean;
  orgId: string | null;
};

export function useProductAccess(productSlug: string): ProductAccessState {
  const [state, setState] = useState<ProductAccessState>({
    hasAccess: false,
    products: [],
    currentProduct: null,
    isLoading: true,
    orgId: null,
  });

  useEffect(() => {
    let cancelled = false;
    const supabase = createAuthClient();

    async function checkAccess(user: User) {
      try {
        const { data: member } = await supabase
          .from("org_members")
          .select("org_id")
          .eq("auth_user_id", user.id)
          .limit(1)
          .single();

        if (!member) {
          if (!cancelled) {
            setState({
              hasAccess: false,
              products: [],
              currentProduct: null,
              isLoading: false,
              orgId: null,
            });
          }
          return;
        }

        const { data: products } = await supabase.rpc("get_org_products", {
          p_org_id: member.org_id,
        });

        const orgProducts = (products ?? []) as OrgProduct[];
        const current =
          orgProducts.find((p) => p.product_slug === productSlug) ?? null;
        const hasAccess = current?.has_access === true;

        if (!cancelled) {
          setState({
            hasAccess,
            products: orgProducts,
            currentProduct: current,
            isLoading: false,
            orgId: member.org_id,
          });
        }
      } catch {
        if (!cancelled) {
          setState({
            hasAccess: false,
            products: [],
            currentProduct: null,
            isLoading: false,
            orgId: null,
          });
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;

      if (session?.user) {
        checkAccess(session.user);
      } else if (event === "SIGNED_OUT" || event === "INITIAL_SESSION") {
        setState({
          hasAccess: false,
          products: [],
          currentProduct: null,
          isLoading: false,
          orgId: null,
        });
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [productSlug]);

  return state;
}
