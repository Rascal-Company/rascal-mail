'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useOrganization } from './useOrganization';
import { Campaign, CampaignInsert, CampaignUpdate, CampaignStats } from '@/types';
import { toast } from './useToast';

export function useCampaigns(status?: string) {
  const { currentOrg } = useOrganization();
  const supabase = createClient();

  return useQuery({
    queryKey: ['campaigns', currentOrg?.id, status],
    queryFn: async () => {
      if (!currentOrg) return [];
      let query = supabase
        .from('campaigns')
        .select('*')
        .eq('organization_id', currentOrg.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!currentOrg,
  });
}

export function useCampaign(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Campaign;
    },
    enabled: !!id,
  });
}

export function useCampaignStats(campaignId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['campaign-stats', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_stats')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();
      if (error) throw error;
      return data as CampaignStats;
    },
    enabled: !!campaignId,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { currentOrg } = useOrganization();

  return useMutation({
    mutationFn: async (campaign: Omit<CampaignInsert, 'organization_id'>) => {
      if (!currentOrg) throw new Error('No organization selected');
      const { data, error } = await supabase
        .from('campaigns')
        .insert({ ...campaign, organization_id: currentOrg.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Kampanja luotu' });
    },
    onError: (error: Error) => {
      toast({ title: 'Virhe', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...update }: CampaignUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('campaigns')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Kampanja päivitetty' });
    },
    onError: (error: Error) => {
      toast({ title: 'Virhe', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Kampanja poistettu' });
    },
    onError: (error: Error) => {
      toast({ title: 'Virhe', description: error.message, variant: 'destructive' });
    },
  });
}
