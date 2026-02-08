'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StepDetails } from './StepDetails';
import { StepContent } from './StepContent';
import { StepRecipients } from './StepRecipients';
import { StepReview } from './StepReview';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { useOrganization } from '@/hooks/useOrganization';
import { CampaignWizardData } from '@/types';
import { cn } from '@/lib/utils/cn';

const STEPS = [
  { id: 1, label: 'Perustiedot' },
  { id: 2, label: 'Sisältö' },
  { id: 3, label: 'Vastaanottajat' },
  { id: 4, label: 'Tarkista' },
];

export function CampaignWizard() {
  const router = useRouter();
  const { currentOrg } = useOrganization();
  const createCampaign = useCreateCampaign();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<Partial<CampaignWizardData>>({
    name: '',
    subject: '',
    previewText: '',
    fromName: currentOrg?.from_name || '',
    fromEmail: currentOrg?.from_email || '',
    replyTo: currentOrg?.reply_to_email || '',
    htmlContent: '',
    designJson: null,
    templateId: null,
    listIds: [],
    totalRecipients: 0,
    sendNow: true,
    scheduledAt: null,
  });

  const updateData = (updates: Partial<CampaignWizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    if (!data.htmlContent || !data.subject || !data.fromName || !data.fromEmail) return;

    createCampaign.mutate(
      {
        name: data.name || data.subject || 'Nimetön kampanja',
        subject: data.subject,
        preview_text: data.previewText,
        from_name: data.fromName,
        from_email: data.fromEmail,
        reply_to: data.replyTo || undefined,
        html_content: data.htmlContent,
        design_json: data.designJson as any,
        template_id: data.templateId || undefined,
        status: data.sendNow ? 'sending' : 'scheduled',
        scheduled_at: data.scheduledAt,
        total_recipients: data.totalRecipients,
      },
      {
        onSuccess: (campaign) => {
          if (data.sendNow) {
            // Trigger send
            fetch('/api/campaigns/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                campaignId: campaign.id,
                listIds: data.listIds,
              }),
            });
          }
          router.push(`/dashboard/campaigns/${campaign.id}`);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => step.id < currentStep && setCurrentStep(step.id)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                currentStep === step.id
                  ? 'bg-primary text-primary-foreground'
                  : currentStep > step.id
                  ? 'bg-primary/20 text-primary cursor-pointer'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {step.id}
            </button>
            <span
              className={cn(
                'ml-2 text-sm hidden sm:inline',
                currentStep === step.id ? 'font-medium' : 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
            {index < STEPS.length - 1 && (
              <div className={cn('mx-4 h-px w-8', currentStep > step.id ? 'bg-primary' : 'bg-muted')} />
            )}
          </div>
        ))}
      </div>

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
          {currentStep === 4 && (
            <StepReview data={data} />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()}
        >
          {currentStep > 1 ? 'Edellinen' : 'Peruuta'}
        </Button>
        <div className="flex gap-3">
          {currentStep < 4 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Seuraava
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createCampaign.isPending}>
              {createCampaign.isPending
                ? 'Lähetetään...'
                : data.sendNow
                ? 'Lähetä nyt'
                : 'Ajasta'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
