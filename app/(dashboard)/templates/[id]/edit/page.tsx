'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UnlayerEditor } from '@/components/templates/UnlayerEditor';
import { useTemplate, useUpdateTemplate } from '@/hooks/useTemplates';
import { Skeleton } from '@/components/shared/LoadingSkeleton';

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: template, isLoading } = useTemplate(id);
  const updateTemplate = useUpdateTemplate();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject || '');
    }
  }, [template]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (!template) return <p>Mallipohjaa ei löytynyt</p>;

  const handleSave = (html: string, design: object) => {
    updateTemplate.mutate(
      {
        id,
        name,
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
        <h1 className="text-3xl font-bold">Muokkaa mallipohjaa</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nimi</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Aihe</Label>
          <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
      </div>

      <UnlayerEditor
        initialDesign={template.design_json as object | undefined}
        onSave={handleSave}
        onCancel={() => router.back()}
      />
    </div>
  );
}
