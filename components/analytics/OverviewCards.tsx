'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/types';
import { formatNumber, formatPercent } from '@/lib/utils/formatters';
import { Users, Send, Eye, MousePointer } from 'lucide-react';

interface Props {
  stats: DashboardStats;
}

export function OverviewCards({ stats }: Props) {
  const cards = [
    { label: 'Kontaktit', value: stats.totalContacts, icon: Users, format: formatNumber },
    { label: 'Lähetetyt (30pv)', value: stats.emailsSent30d, icon: Send, format: formatNumber },
    { label: 'Avausprosentti', value: stats.openRate, icon: Eye, format: formatPercent },
    { label: 'Klikkausprosentti', value: stats.clickRate, icon: MousePointer, format: formatPercent },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.label}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.format(card.value)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
