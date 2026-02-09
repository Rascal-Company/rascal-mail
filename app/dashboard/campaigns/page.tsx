'use client';

import { useState } from 'react';
import { Plus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useCampaigns, useDeleteCampaign } from '@/hooks/useCampaigns';
import Link from 'next/link';

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = useCampaigns();
  const deleteCampaign = useDeleteCampaign();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const drafts = campaigns?.filter((c) => c.status === 'draft') || [];
  const scheduled = campaigns?.filter((c) => c.status === 'scheduled') || [];
  const sent = campaigns?.filter((c) => ['sent', 'sending'].includes(c.status)) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kampanjat</h1>
          <p className="text-muted-foreground">Hallitse sähköpostikampanjoitasi</p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Luo kampanja
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : campaigns && campaigns.length > 0 ? (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Kaikki ({campaigns.length})</TabsTrigger>
            <TabsTrigger value="drafts">Luonnokset ({drafts.length})</TabsTrigger>
            <TabsTrigger value="scheduled">Ajastetut ({scheduled.length})</TabsTrigger>
            <TabsTrigger value="sent">Lähetetyt ({sent.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4 mt-4">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} onDelete={setDeleteId} />
            ))}
          </TabsContent>
          <TabsContent value="drafts" className="space-y-4 mt-4">
            {drafts.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} onDelete={setDeleteId} />
            ))}
          </TabsContent>
          <TabsContent value="scheduled" className="space-y-4 mt-4">
            {scheduled.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} onDelete={setDeleteId} />
            ))}
          </TabsContent>
          <TabsContent value="sent" className="space-y-4 mt-4">
            {sent.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} onDelete={setDeleteId} />
            ))}
          </TabsContent>
        </Tabs>
      ) : (
        <EmptyState
          icon={Send}
          title="Ei kampanjoita"
          description="Luo ensimmäinen kampanja"
          actionLabel="Luo kampanja"
          onAction={() => window.location.href = '/dashboard/campaigns/new'}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Poista kampanja"
        description="Haluatko varmasti poistaa tämän kampanjan?"
        confirmLabel="Poista"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) deleteCampaign.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
        loading={deleteCampaign.isPending}
      />
    </div>
  );
}
