"use client";

import { useQuery } from "@tanstack/react-query";
import { useOrganization } from "./useOrganization";
import type { DashboardStats } from "@/types";

// Simplified demo version - mock stats from API
export function useDashboardStats() {
  const { currentOrg } = useOrganization();

  return useQuery({
    queryKey: ["dashboard-stats", currentOrg?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!currentOrg)
        return {
          totalContacts: 0,
          emailsSent30d: 0,
          openRate: 0,
          clickRate: 0,
        };

      const response = await fetch("/api/analytics?type=dashboard");
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");

      const { data } = await response.json();
      return data;
    },
    enabled: !!currentOrg,
  });
}

export function useRecentCampaigns(limit = 5) {
  const { currentOrg } = useOrganization();

  return useQuery({
    queryKey: ["recent-campaigns", currentOrg?.id, limit],
    queryFn: async () => {
      if (!currentOrg) return [];

      const response = await fetch(
        `/api/analytics?type=recent-campaigns&organizationId=${currentOrg.id}&limit=${limit}`,
      );
      if (!response.ok) throw new Error("Failed to fetch recent campaigns");

      const { data } = await response.json();
      return data || [];
    },
    enabled: !!currentOrg,
  });
}

export function useCampaignAnalytics(campaignId: string) {
  return useQuery({
    queryKey: ["campaign-analytics", campaignId],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics?type=campaign-analytics&campaignId=${campaignId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch campaign analytics");

      const { data } = await response.json();
      return data;
    },
    enabled: !!campaignId,
  });
}
