'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UnlayerEditor } from '@/components/templates/UnlayerEditor';
import { useCreateTemplate } from '@/hooks/useTemplates';

export default function NewTemplatePage() {
  const router = useRouter();
  const createTemplate = useCreateTemplate();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');

  const handleSave = (html: string, design: object) => {
    createTemplate.mutate(
      {
        name: name || 'Nimetön mallipohja',
        subject,
        html_content: html,
        design_json: design as any,
      },
      { onSuccess: () => router.push('/dashboard/templates') }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Uusi mallipohja</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nimi</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mallipohjan nimi" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Aihe</Label>
          <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Sähköpostin aihe" />
        </div>
      </div>

      <UnlayerEditor onSave={handleSave} onCancel={() => router.back()} />
    </div>
  );
}
