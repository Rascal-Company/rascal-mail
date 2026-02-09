'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CampaignStatsCards } from '@/components/campaigns/CampaignStats';
import { useCampaign, useCampaignStats } from '@/hooks/useCampaigns';
import { useCampaignAnalytics } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { formatDateTime, formatNumber } from '@/lib/utils/formatters';

const statusLabels: Record<string, string> = {
  draft: 'Luonnos',
  scheduled: 'Ajastettu',
  sending: 'Lähetetään',
  sent: 'Lähetetty',
  paused: 'Keskeytetty',
  cancelled: 'Peruutettu',
};

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: campaign, isLoading } = useCampaign(id);
  const { data: stats } = useCampaignStats(id);
  const { data: analytics } = useCampaignAnalytics(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  if (!campaign) return <p>Kampanjaa ei löytynyt</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{campaign.name}</h1>
          <p className="text-muted-foreground">{campaign.subject}</p>
        </div>
        <Badge variant={campaign.status === 'sent' ? 'success' : 'secondary'}>
          {statusLabels[campaign.status]}
        </Badge>
      </div>

      {/* Campaign info */}
      <Card>
        <CardHeader>
          <CardTitle>Kampanjan tiedot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Lähettäjä</p>
            <p className="font-medium">{campaign.from_name} &lt;{campaign.from_email}&gt;</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Vastaanottajia</p>
            <p className="font-medium">{formatNumber(campaign.total_recipients)}</p>
          </div>
          {campaign.started_at && (
            <div>
              <p className="text-sm text-muted-foreground">Lähetetty</p>
              <p className="font-medium">{formatDateTime(campaign.started_at)}</p>
            </div>
          )}
          {campaign.scheduled_at && campaign.status === 'scheduled' && (
            <div>
              <p className="text-sm text-muted-foreground">Ajastettu</p>
              <p className="font-medium">{formatDateTime(campaign.scheduled_at)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      {stats && <CampaignStatsCards stats={stats} />}

      {/* Recent activity */}
      {analytics?.sends && analytics.sends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Viimeisimmät tapahtumat</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kontakti</TableHead>
                  <TableHead>Tila</TableHead>
                  <TableHead>Avaukset</TableHead>
                  <TableHead>Klikkaukset</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.sends.slice(0, 20).map((send) => (
                  <TableRow key={send.id}>
                    <TableCell>{send.contact_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{send.status}</Badge>
                    </TableCell>
                    <TableCell>{send.open_count}</TableCell>
                    <TableCell>{send.click_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
