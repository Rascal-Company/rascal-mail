'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CampaignStats as CampaignStatsType } from '@/types';
import { formatNumber, formatPercent } from '@/lib/utils/formatters';
import { Send, CheckCircle, Eye, MousePointer, AlertTriangle, Ban } from 'lucide-react';

interface Props {
  stats: CampaignStatsType;
}

export function CampaignStatsCards({ stats }: Props) {
  const statCards = [
    { label: 'Lähetetty', value: stats.total_sent, icon: Send, format: formatNumber },
    { label: 'Toimitettu', value: stats.delivered, icon: CheckCircle, format: formatNumber },
    { label: 'Avattu', value: stats.unique_opens, icon: Eye, format: formatNumber, rate: stats.open_rate },
    { label: 'Klikattu', value: stats.unique_clicks, icon: MousePointer, format: formatNumber, rate: stats.click_rate },
    { label: 'Virheet', value: stats.bounced, icon: AlertTriangle, format: formatNumber },
    { label: 'Peruutukset', value: stats.unsubscribed, icon: Ban, format: formatNumber },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              {stat.label}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.format(stat.value)}</div>
            {stat.rate !== undefined && (
              <p className="text-xs text-muted-foreground">{formatPercent(Number(stat.rate))}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
