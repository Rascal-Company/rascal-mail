'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useOrganization } from './useOrganization';
import { DashboardStats } from '@/types';

export function useDashboardStats() {
  const { currentOrg } = useOrganization();
  const supabase = createClient();

  return useQuery({
    queryKey: ['dashboard-stats', currentOrg?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!currentOrg) return { totalContacts: 0, emailsSent30d: 0, openRate: 0, clickRate: 0 };

      // Total contacts
      const { count: totalContacts } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrg.id)
        .eq('status', 'subscribed');

      // Emails sent in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: emailsSent30d } = await supabase
        .from('email_sends')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrg.id)
        .gte('sent_at', thirtyDaysAgo.toISOString());

      // Average open/click rates from recent campaigns
      const { data: recentStats } = await supabase
        .from('campaign_stats')
        .select('open_rate, click_rate, campaign_id')
        .in(
          'campaign_id',
          (await supabase
            .from('campaigns')
            .select('id')
            .eq('organization_id', currentOrg.id)
            .eq('status', 'sent')
            .order('completed_at', { ascending: false })
            .limit(10)
          ).data?.map((c) => c.id) || []
        );

      const avgOpenRate = recentStats?.length
        ? recentStats.reduce((sum, s) => sum + Number(s.open_rate), 0) / recentStats.length
        : 0;

      const avgClickRate = recentStats?.length
        ? recentStats.reduce((sum, s) => sum + Number(s.click_rate), 0) / recentStats.length
        : 0;

      return {
        totalContacts: totalContacts || 0,
        emailsSent30d: emailsSent30d || 0,
        openRate: Math.round(avgOpenRate * 10) / 10,
        clickRate: Math.round(avgClickRate * 10) / 10,
      };
    },
    enabled: !!currentOrg,
  });
}

export function useRecentCampaigns(limit = 5) {
  const { currentOrg } = useOrganization();
  const supabase = createClient();

  return useQuery({
    queryKey: ['recent-campaigns', currentOrg?.id, limit],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('organization_id', currentOrg.id)
        .in('status', ['sent', 'sending', 'scheduled'])
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
  });
}

export function useCampaignAnalytics(campaignId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['campaign-analytics', campaignId],
    queryFn: async () => {
      const { data: sends, error } = await supabase
        .from('email_sends')
        .select('*')
        .eq('campaign_id', campaignId);
      if (error) throw error;

      const { data: stats } = await supabase
        .from('campaign_stats')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      return { sends: sends || [], stats };
    },
    enabled: !!campaignId,
  });
}
