'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CampaignWizardData } from '@/types';

interface Props {
  data: Partial<CampaignWizardData>;
  onUpdate: (updates: Partial<CampaignWizardData>) => void;
}

export function StepDetails({ data, onUpdate }: Props) {
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="name">Kampanjan nimi</Label>
        <Input
          id="name"
          value={data.name || ''}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="esim. Joulukampanja 2024"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Aihe *</Label>
        <Input
          id="subject"
          value={data.subject || ''}
          onChange={(e) => onUpdate({ subject: e.target.value })}
          placeholder="Sähköpostin aiherivi"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="previewText">Esikatseluteksti</Label>
        <Textarea
          id="previewText"
          value={data.previewText || ''}
          onChange={(e) => onUpdate({ previewText: e.target.value })}
          placeholder="Teksti joka näkyy aiherivien alla"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fromName">Lähettäjän nimi *</Label>
          <Input
            id="fromName"
            value={data.fromName || ''}
            onChange={(e) => onUpdate({ fromName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fromEmail">Lähettäjän osoite *</Label>
          <Input
            id="fromEmail"
            type="email"
            value={data.fromEmail || ''}
            onChange={(e) => onUpdate({ fromEmail: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="replyTo">Vastausosoite</Label>
        <Input
          id="replyTo"
          type="email"
          value={data.replyTo || ''}
          onChange={(e) => onUpdate({ replyTo: e.target.value })}
          placeholder="Sama kuin lähettäjän osoite"
        />
      </div>
    </div>
  );
}
