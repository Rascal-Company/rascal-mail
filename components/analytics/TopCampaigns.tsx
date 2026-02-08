'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Campaign, CampaignStats } from '@/types';
import { formatNumber, formatPercent } from '@/lib/utils/formatters';
import Link from 'next/link';

interface Props {
  campaigns: Campaign[];
  stats: Record<string, CampaignStats>;
}

export function TopCampaigns({ campaigns, stats }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Parhaat kampanjat</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kampanja</TableHead>
              <TableHead>Lähetetty</TableHead>
              <TableHead>Avattu</TableHead>
              <TableHead>Avaus-%</TableHead>
              <TableHead>Klikkaus-%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => {
              const stat = stats[campaign.id];
              return (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <Link href={`/dashboard/campaigns/${campaign.id}`} className="text-primary hover:underline font-medium">
                      {campaign.name}
                    </Link>
                  </TableCell>
                  <TableCell>{stat ? formatNumber(stat.total_sent) : '-'}</TableCell>
                  <TableCell>{stat ? formatNumber(stat.unique_opens) : '-'}</TableCell>
                  <TableCell>{stat ? formatPercent(Number(stat.open_rate)) : '-'}</TableCell>
                  <TableCell>{stat ? formatPercent(Number(stat.click_rate)) : '-'}</TableCell>
                </TableRow>
              );
            })}
            {campaigns.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Ei kampanjadataa vielä
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
