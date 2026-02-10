"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StepDetails } from "./StepDetails";
import { StepContent } from "./StepContent";
import { StepRecipients } from "./StepRecipients";
import { StepReview } from "./StepReview";
import {
  useCreateCampaign,
  useAutoSaveCampaign,
  useUpdateCampaign,
} from "@/hooks/useCampaigns";
import { useOrganization } from "@/hooks/useOrganization";
import type { CampaignWizardData } from "@/types";
import { cn } from "@/lib/utils/cn";

const STEPS = [
  { id: 1, label: "Perustiedot" },
  { id: 2, label: "Sisältö" },
  { id: 3, label: "Vastaanottajat" },
  { id: 4, label: "Tarkista" },
];

const AUTO_SAVE_DELAY_MS = 2000;

type CampaignWizardProps = {
  campaignId?: string;
  initialData?: Partial<CampaignWizardData>;
  initialListIds?: string[];
};

export function CampaignWizard({
  campaignId,
  initialData,
  initialListIds,
}: CampaignWizardProps) {
  const router = useRouter();
  const { currentOrg } = useOrganization();
  const createCampaign = useCreateCampaign();
  const autoSave = useAutoSaveCampaign();
  const updateCampaign = useUpdateCampaign();
  const [currentStep, setCurrentStep] = useState(1);
  const [draftId, setDraftId] = useState<string | null>(campaignId ?? null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCreatingDraft = useRef(false);

  const [data, setData] = useState<Partial<CampaignWizardData>>({
    name: "",
    subject: "",
    previewText: "",
    fromName: currentOrg?.from_name || "",
    fromEmail: currentOrg?.from_email || "",
    replyTo: currentOrg?.reply_to_email || "",
    htmlContent: "",
    designJson: null,
    templateId: null,
    listIds: initialListIds ?? [],
    totalRecipients: 0,
    sendNow: true,
    scheduledAt: null,
    ...initialData,
  });

  useEffect(() => {
    if (saveStatus === "saved") {
      const timer = setTimeout(() => setSaveStatus("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const triggerAutoSave = useCallback(
    (updatedData: Partial<CampaignWizardData>) => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }

      autoSaveTimer.current = setTimeout(() => {
        if (isCreatingDraft.current) return;
        if (autoSave.isPending || createCampaign.isPending) return;

        const payload = {
          name: updatedData.name || null,
          subject: updatedData.subject || null,
          preview_text: updatedData.previewText || null,
          from_name: updatedData.fromName || null,
          from_email: updatedData.fromEmail || null,
          reply_to: updatedData.replyTo || null,
          html_content: updatedData.htmlContent || null,
          design_json: updatedData.designJson as any,
          template_id: updatedData.templateId || null,
          scheduled_at: updatedData.scheduledAt || null,
          total_recipients: updatedData.totalRecipients ?? 0,
          list_ids: updatedData.listIds ?? [],
        };

        if (draftId) {
          setSaveStatus("saving");
          autoSave.mutate(
            { id: draftId, ...payload },
            {
              onSuccess: () => setSaveStatus("saved"),
              onError: () => setSaveStatus("idle"),
            },
          );
        } else {
          isCreatingDraft.current = true;
          setSaveStatus("saving");
          createCampaign.mutate(
            { ...payload, status: "draft" },
            {
              onSuccess: (campaign) => {
                setDraftId(campaign.id);
                isCreatingDraft.current = false;
                setSaveStatus("saved");
              },
              onError: () => {
                isCreatingDraft.current = false;
                setSaveStatus("idle");
              },
            },
          );
        }
      }, AUTO_SAVE_DELAY_MS);
    },
    [draftId, autoSave, createCampaign],
  );

  const updateData = (updates: Partial<CampaignWizardData>) => {
    setData((prev) => {
      const next = { ...prev, ...updates };
      triggerAutoSave(next);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!data.htmlContent || !data.subject || !data.fromName || !data.fromEmail)
      return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    const finalPayload = {
      name: data.name || data.subject || "Nimetön kampanja",
      subject: data.subject,
      preview_text: data.previewText,
      from_name: data.fromName,
      from_email: data.fromEmail,
      reply_to: data.replyTo || undefined,
      html_content: data.htmlContent,
      design_json: data.designJson as any,
      template_id: data.templateId || undefined,
      status: data.sendNow ? ("sending" as const) : ("scheduled" as const),
      scheduled_at: data.scheduledAt,
      total_recipients: data.totalRecipients,
      list_ids: data.listIds ?? [],
    };

    if (draftId) {
      updateCampaign.mutate(
        { id: draftId, ...finalPayload },
        {
          onSuccess: (campaign) => {
            if (data.sendNow) {
              fetch("/api/campaigns/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ campaignId: campaign.id }),
              });
            }
            router.push(`/dashboard/campaigns/${campaign.id}`);
          },
        },
      );
    } else {
      createCampaign.mutate(finalPayload, {
        onSuccess: (campaign) => {
          if (data.sendNow) {
            fetch("/api/campaigns/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ campaignId: campaign.id }),
            });
          }
          router.push(`/dashboard/campaigns/${campaign.id}`);
        },
      });
    }
  };

  const handleSaveAsDraft = () => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    const payload = {
      name: data.name || null,
      subject: data.subject || null,
      preview_text: data.previewText || null,
      from_name: data.fromName || null,
      from_email: data.fromEmail || null,
      reply_to: data.replyTo || null,
      html_content: data.htmlContent || null,
      design_json: data.designJson as any,
      template_id: data.templateId || null,
      scheduled_at: data.scheduledAt || null,
      total_recipients: data.totalRecipients ?? 0,
      list_ids: data.listIds ?? [],
    };

    if (draftId) {
      autoSave.mutate(
        { id: draftId, ...payload },
        { onSuccess: () => router.push("/dashboard/campaigns") },
      );
    } else {
      createCampaign.mutate(
        { ...payload, status: "draft" },
        { onSuccess: () => router.push("/dashboard/campaigns") },
      );
    }
  };

  const isSavingDraft = autoSave.isPending || createCampaign.isPending;
  const isSubmitting = updateCampaign.isPending;

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => step.id < currentStep && setCurrentStep(step.id)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                currentStep === step.id
                  ? "bg-primary text-primary-foreground"
                  : currentStep > step.id
                    ? "bg-primary/20 text-primary cursor-pointer"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {step.id}
            </button>
            <span
              className={cn(
                "ml-2 hidden text-sm sm:inline",
                currentStep === step.id
                  ? "font-medium"
                  : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-4 h-px w-8",
                  currentStep > step.id ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Auto-save status */}
      {saveStatus !== "idle" && (
        <div className="text-center text-xs text-muted-foreground">
          {saveStatus === "saving" ? "Tallennetaan..." : "Tallennettu"}
        </div>
      )}

      {/* Step content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <StepDetails data={data} onUpdate={updateData} />
          )}
          {currentStep === 2 && (
            <StepContent data={data} onUpdate={updateData} />
          )}
          {currentStep === 3 && (
            <StepRecipients data={data} onUpdate={updateData} />
          )}
          {currentStep === 4 && <StepReview data={data} />}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() =>
            currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()
          }
        >
          {currentStep > 1 ? "Edellinen" : "Peruuta"}
        </Button>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleSaveAsDraft}
            disabled={isSavingDraft}
          >
            {isSavingDraft ? "Tallennetaan..." : "Tallenna luonnokseksi"}
          </Button>
          {currentStep < 4 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Seuraava
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? "Lähetetään..."
                : data.sendNow
                  ? "Lähetä nyt"
                  : "Ajasta"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
