'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnlayerEditor } from '@/components/templates/UnlayerEditor';
import { useTemplates } from '@/hooks/useTemplates';
import { FileText } from 'lucide-react';
import { CampaignWizardData } from '@/types';

interface Props {
  data: Partial<CampaignWizardData>;
  onUpdate: (updates: Partial<CampaignWizardData>) => void;
}

export function StepContent({ data, onUpdate }: Props) {
  const { data: templates } = useTemplates();
  const [showEditor, setShowEditor] = useState(!!data.htmlContent);

  const handleSave = (html: string, design: object) => {
    onUpdate({ htmlContent: html, designJson: design });
  };

  const handleSelectTemplate = (template: any) => {
    onUpdate({
      htmlContent: template.html_content,
      designJson: template.design_json,
      templateId: template.id,
    });
    setShowEditor(true);
  };

  if (showEditor) {
    return (
      <UnlayerEditor
        initialDesign={data.designJson as object | undefined}
        onSave={handleSave}
        onCancel={() => setShowEditor(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Mallipohjat</TabsTrigger>
          <TabsTrigger value="new">Tyhjä pohja</TabsTrigger>
        </TabsList>
        <TabsContent value="templates" className="mt-4">
          {templates && templates.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium">{template.name}</p>
                  {template.subject && (
                    <p className="text-sm text-muted-foreground">{template.subject}</p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Ei mallipohjia. Luo uusi tai aloita tyhjästä.
            </p>
          )}
        </TabsContent>
        <TabsContent value="new" className="mt-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Aloita tyhjästä ja rakenna sähköpostisi editorilla</p>
            <Button onClick={() => setShowEditor(true)}>Avaa editori</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
