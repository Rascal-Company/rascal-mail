'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Organization } from '@/types';
import React from 'react';

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
  const supabase = createClient();

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: members } = await supabase
          .from('org_members')
          .select('organization_id')
          .eq('user_id', user.id);

        if (members && members.length > 0) {
          const orgIds = members.map((m) => m.organization_id);
          const { data: orgs } = await supabase
            .from('organizations')
            .select('*')
            .in('id', orgIds);

          if (orgs) {
            setOrganizations(orgs);
            const savedOrgId = localStorage.getItem('currentOrgId');
            const savedOrg = orgs.find((o) => o.id === savedOrgId);
            setCurrentOrg(savedOrg || orgs[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrgs();
  }, [supabase]);

  const switchOrg = useCallback((orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem('currentOrgId', orgId);
    }
  }, [organizations]);

  return React.createElement(
    OrganizationContext.Provider,
    { value: { currentOrg, organizations, loading, switchOrg } },
    children
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
}
