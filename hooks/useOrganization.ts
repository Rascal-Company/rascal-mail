"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { createAuthClient } from "@/lib/supabase/client";
import type { Organization } from "@/types";
import React from "react";

interface OrganizationContextType {
  currentOrg: Organization | null;
  organizations: Organization[];
  loading: boolean;
  switchOrg: (orgId: string) => void;
}

const OrganizationContext = createContext<OrganizationContextType>({
  currentOrg: null,
  organizations: [],
  loading: true,
  switchOrg: () => {},
});

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const authClient = createAuthClient();
        const {
          data: { user },
        } = await authClient.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch organizations from API
        const response = await fetch("/api/organizations");
        if (!response.ok) {
          throw new Error("Failed to fetch organizations");
        }

        const { data: orgs } = await response.json();

        if (orgs && orgs.length > 0) {
          setOrganizations(orgs);
          const savedOrgId = localStorage.getItem("currentOrgId");
          const savedOrg = orgs.find((o: Organization) => o.id === savedOrgId);
          setCurrentOrg(savedOrg || orgs[0]);
        }
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrgs();
  }, []);

  const switchOrg = useCallback(
    (orgId: string) => {
      const org = organizations.find((o) => o.id === orgId);
      if (org) {
        setCurrentOrg(org);
        localStorage.setItem("currentOrgId", orgId);
      }
    },
    [organizations],
  );

  return React.createElement(
    OrganizationContext.Provider,
    { value: { currentOrg, organizations, loading, switchOrg } },
    children,
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganization must be used within OrganizationProvider");
  }
  return context;
}
