'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CampaignWizard } from '@/components/campaigns/CampaignWizard';
import { useRouter } from 'next/navigation';

export default function NewCampaignPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Uusi kampanja</h1>
      </div>
      <CampaignWizard />
    </div>
  );
}
