'use client';

import { Users, Send, Eye, MousePointer, Plus, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDashboardStats, useRecentCampaigns } from '@/hooks/useAnalytics';
import { StatCardSkeleton } from '@/components/shared/LoadingSkeleton';
import { formatNumber, formatPercent, formatRelativeTime } from '@/lib/utils/formatters';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  draft: 'secondary',
  scheduled: 'warning',
  sending: 'default',
  sent: 'success',
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentCampaigns, isLoading: campaignsLoading } = useRecentCampaigns();

  const statCards = [
    { label: 'Kontaktit yhteensä', value: stats?.totalContacts || 0, icon: Users, format: formatNumber },
    { label: 'Lähetetyt (30pv)', value: stats?.emailsSent30d || 0, icon: Send, format: formatNumber },
    { label: 'Avausprosentti', value: stats?.openRate || 0, icon: Eye, format: formatPercent },
    { label: 'Klikkausprosentti', value: stats?.clickRate || 0, icon: MousePointer, format: formatPercent },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Etusivu</h1>
          <p className="text-muted-foreground">Tervetuloa Rascal Mailiin</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/contacts/import">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Tuo kontakteja
            </Button>
          </Link>
          <Link href="/dashboard/campaigns/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Uusi kampanja
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.format(stat.value)}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Recent campaigns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Viimeisimmät kampanjat</CardTitle>
          <Link href="/dashboard/campaigns">
            <Button variant="ghost" size="sm">Näytä kaikki</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {campaignsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : recentCampaigns && recentCampaigns.length > 0 ? (
            <div className="space-y-3">
              {recentCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/dashboard/campaigns/${campaign.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={(statusColors[campaign.status] || 'secondary') as any}>
                      {campaign.status === 'sent' ? 'Lähetetty' :
                       campaign.status === 'sending' ? 'Lähetetään' :
                       campaign.status === 'scheduled' ? 'Ajastettu' : campaign.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatRelativeTime(campaign.created_at)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Ei kampanjoita vielä. Luo ensimmäinen kampanja!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
