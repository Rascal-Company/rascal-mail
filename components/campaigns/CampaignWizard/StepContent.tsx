"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnlayerEditor } from "@/components/templates/UnlayerEditor";
import { useTemplates } from "@/hooks/useTemplates";
import { CheckCircle, FileText, Pencil } from "lucide-react";
import { CampaignWizardData } from "@/types";

interface Props {
  data: Partial<CampaignWizardData>;
  onUpdate: (updates: Partial<CampaignWizardData>) => void;
}

export function StepContent({ data, onUpdate }: Props) {
  const { data: templates } = useTemplates();
  const [showEditor, setShowEditor] = useState(!!data.htmlContent);

  const handleSave = (html: string, design: object) => {
    onUpdate({ htmlContent: html, designJson: design });
    setShowEditor(false);
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

  if (data.htmlContent) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
          <p className="flex-1 font-medium text-green-800 dark:text-green-200">
            Sisältö tallennettu
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditor(true)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Muokkaa
          </Button>
        </div>
      </div>
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
                    <p className="text-sm text-muted-foreground">
                      {template.subject}
                    </p>
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
            <p className="text-muted-foreground mb-4">
              Aloita tyhjästä ja rakenna sähköpostisi editorilla
            </p>
            <Button onClick={() => setShowEditor(true)}>Avaa editori</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
