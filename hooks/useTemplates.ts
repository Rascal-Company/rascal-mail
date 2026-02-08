'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useOrganization } from './useOrganization';
import { EmailTemplate, EmailTemplateInsert, EmailTemplateUpdate } from '@/types';
import { toast } from './useToast';

export function useTemplates() {
  const { currentOrg } = useOrganization();
  const supabase = createClient();

  return useQuery({
    queryKey: ['templates', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('organization_id', currentOrg.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EmailTemplate[];
    },
    enabled: !!currentOrg,
  });
}

export function useTemplate(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['template', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as EmailTemplate;
    },
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { currentOrg } = useOrganization();

  return useMutation({
    mutationFn: async (template: Omit<EmailTemplateInsert, 'organization_id'>) => {
      if (!currentOrg) throw new Error('No organization selected');
      const { data, error } = await supabase
        .from('email_templates')
        .insert({ ...template, organization_id: currentOrg.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({ title: 'Mallipohja tallennettu' });
    },
    onError: (error: Error) => {
      toast({ title: 'Virhe', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...update }: EmailTemplateUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('email_templates')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({ title: 'Mallipohja päivitetty' });
    },
    onError: (error: Error) => {
      toast({ title: 'Virhe', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({ title: 'Mallipohja poistettu' });
    },
    onError: (error: Error) => {
      toast({ title: 'Virhe', description: error.message, variant: 'destructive' });
    },
  });
}
