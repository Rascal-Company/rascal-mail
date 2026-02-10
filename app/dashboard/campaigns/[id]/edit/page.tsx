"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignWizard } from "@/components/campaigns/CampaignWizard";
import { useCampaign } from "@/hooks/useCampaigns";
import type { CampaignWizardData } from "@/types";

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: campaign, isLoading } = useCampaign(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initialData: Partial<CampaignWizardData> | undefined = campaign
    ? {
        name: campaign.name ?? "",
        subject: campaign.subject ?? "",
        previewText: campaign.preview_text ?? "",
        fromName: campaign.from_name ?? "",
        fromEmail: campaign.from_email ?? "",
        replyTo: campaign.reply_to ?? "",
        htmlContent: campaign.html_content ?? "",
        designJson: campaign.design_json as object | null,
        templateId: campaign.template_id ?? null,
        totalRecipients: campaign.total_recipients ?? 0,
        sendNow: !campaign.scheduled_at,
        scheduledAt: campaign.scheduled_at ?? null,
      }
    : undefined;

  const initialListIds: string[] | undefined =
    campaign?.campaign_recipients?.map((r: { list_id: string }) => r.list_id) ??
    undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Muokkaa kampanjaa</h1>
      </div>
      <CampaignWizard
        campaignId={id}
        initialData={initialData}
        initialListIds={initialListIds}
      />
    </div>
  );
}
