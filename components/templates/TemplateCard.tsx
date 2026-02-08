'use client';

import { FileText, MoreHorizontal, Pencil, Trash2, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { EmailTemplate } from '@/types';
import { formatRelativeTime } from '@/lib/utils/formatters';
import Link from 'next/link';

interface TemplateCardProps {
  template: EmailTemplate;
  onDelete: (id: string) => void;
}

export function TemplateCard({ template, onDelete }: TemplateCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          {template.subject && (
            <p className="text-sm text-muted-foreground mt-1">{template.subject}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/templates/${template.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Muokkaa
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(template.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Poista
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-3">
          {template.thumbnail_url ? (
            <img src={template.thumbnail_url} alt={template.name} className="rounded-md object-cover w-full h-full" />
          ) : (
            <FileText className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{template.category}</Badge>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(template.updated_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
