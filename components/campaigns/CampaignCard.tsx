'use client';

import { Send, MoreHorizontal, Pencil, Trash2, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Campaign } from '@/types';
import { formatRelativeTime, formatNumber } from '@/lib/utils/formatters';
import Link from 'next/link';

const statusLabels: Record<string, string> = {
  draft: 'Luonnos',
  scheduled: 'Ajastettu',
  sending: 'Lähetetään',
  sent: 'Lähetetty',
  paused: 'Keskeytetty',
  cancelled: 'Peruutettu',
};

const statusVariants: Record<string, 'secondary' | 'warning' | 'default' | 'success' | 'destructive'> = {
  draft: 'secondary',
  scheduled: 'warning',
  sending: 'default',
  sent: 'success',
  paused: 'secondary',
  cancelled: 'destructive',
};

interface CampaignCardProps {
  campaign: Campaign;
  onDelete: (id: string) => void;
}

export function CampaignCard({ campaign, onDelete }: CampaignCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <Link href={`/dashboard/campaigns/${campaign.id}`} className="flex-1">
          <CardTitle className="text-lg">{campaign.name}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{campaign.subject}</p>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {campaign.status === 'sent' && (
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/campaigns/${campaign.id}`}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Tilastot
                </Link>
              </DropdownMenuItem>
            )}
            {campaign.status === 'draft' && (
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Muokkaa
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(campaign.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Poista
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <Link href={`/dashboard/campaigns/${campaign.id}`}>
          <div className="flex items-center justify-between">
            <Badge variant={statusVariants[campaign.status]}>
              {statusLabels[campaign.status]}
            </Badge>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {campaign.total_recipients > 0 && (
                <span>{formatNumber(campaign.total_recipients)} vastaanottajaa</span>
              )}
              <span>{formatRelativeTime(campaign.created_at)}</span>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
