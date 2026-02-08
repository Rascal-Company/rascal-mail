'use client';

import { useDashboardStats } from '@/hooks/useAnalytics';
import { useCampaigns, useCampaignStats } from '@/hooks/useCampaigns';
import { OverviewCards } from '@/components/analytics/OverviewCards';
import { TopCampaigns } from '@/components/analytics/TopCampaigns';
import { StatCardSkeleton, CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { CampaignStats } from '@/types';

export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns('sent');

  // Build stats map for top campaigns
  const campaignStats: Record<string, CampaignStats> = {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytiikka</h1>
        <p className="text-muted-foreground">Seuraa sähköpostimarkkinointisi tuloksia</p>
      </div>

      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : stats ? (
        <OverviewCards stats={stats} />
      ) : null}

      {campaignsLoading ? (
        <CardSkeleton />
      ) : campaigns ? (
        <TopCampaigns campaigns={campaigns.slice(0, 10)} stats={campaignStats} />
      ) : null}
    </div>
  );
}
