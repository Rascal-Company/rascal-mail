"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "./useOrganization";
import type {
  Campaign,
  CampaignInsert,
  CampaignUpdate,
  CampaignStats,
} from "@/types";
import { toast } from "./useToast";

// Simplified demo version - no status filter
export function useCampaigns() {
  const { currentOrg } = useOrganization();

  return useQuery({
    queryKey: ["campaigns", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];

      const response = await fetch(
        `/api/campaigns?organizationId=${currentOrg.id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch campaigns");

      const { data } = await response.json();
      return data || [];
    },
    enabled: !!currentOrg,
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns?id=${id}`);
      if (!response.ok) throw new Error("Failed to fetch campaign");

      const { data } = await response.json();
      return data;
    },
    enabled: !!id,
  });
}

export function useCampaignStats(campaignId: string) {
  return useQuery({
    queryKey: ["campaign-stats", campaignId],
    queryFn: async (): Promise<CampaignStats> => {
      const response = await fetch(
        `/api/analytics?type=campaign-stats&campaignId=${campaignId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch campaign stats");

      const { data } = await response.json();
      return data;
    },
    enabled: !!campaignId,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { currentOrg } = useOrganization();

  return useMutation({
    mutationFn: async (campaign: Omit<CampaignInsert, "organization_id">) => {
      if (!currentOrg) throw new Error("No organization selected");

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...campaign, organizationId: currentOrg.id }),
      });

      if (!response.ok) throw new Error("Failed to create campaign");

      const { data } = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({ title: "Kampanja luotu" });
    },
    onError: (error: Error) => {
      toast({
        title: "Virhe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...update }: CampaignUpdate & { id: string }) => {
      const response = await fetch("/api/campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...update }),
      });

      if (!response.ok) throw new Error("Failed to update campaign");

      const { data } = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({ title: "Kampanja päivitetty" });
    },
    onError: (error: Error) => {
      toast({
        title: "Virhe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/campaigns?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete campaign");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({ title: "Kampanja poistettu" });
    },
    onError: (error: Error) => {
      toast({
        title: "Virhe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
