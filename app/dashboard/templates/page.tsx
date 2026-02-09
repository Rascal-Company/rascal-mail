'use client';

import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useTemplates, useDeleteTemplate } from '@/hooks/useTemplates';
import Link from 'next/link';

export default function TemplatesPage() {
  const { data: templates, isLoading } = useTemplates();
  const deleteTemplate = useDeleteTemplate();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mallipohjat</h1>
          <p className="text-muted-foreground">Luo ja hallitse sähköpostimallipohjia</p>
        </div>
        <Link href="/dashboard/templates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Luo mallipohja
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} onDelete={setDeleteId} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="Ei mallipohjia"
          description="Luo ensimmäinen mallipohja kampanjoillesi"
          actionLabel="Luo mallipohja"
          onAction={() => window.location.href = '/dashboard/templates/new'}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Poista mallipohja"
        description="Haluatko varmasti poistaa tämän mallipohjan?"
        confirmLabel="Poista"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) deleteTemplate.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
        loading={deleteTemplate.isPending}
      />
    </div>
  );
}
