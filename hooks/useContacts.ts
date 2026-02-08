'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useOrganization } from './useOrganization';
import { Contact, ContactInsert, ContactUpdate } from '@/types';
import { toast } from './useToast';

export function useContacts(params?: { page?: number; pageSize?: number; search?: string; status?: string }) {
  const { currentOrg } = useOrganization();
  const supabase = createClient();
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 25;

  return useQuery({
    queryKey: ['contacts', currentOrg?.id, page, pageSize, params?.search, params?.status],
    queryFn: async () => {
      if (!currentOrg) return { data: [], total: 0 };

      let query = supabase
        .from('contacts')
        .select('*', { count: 'exact' })
        .eq('organization_id', currentOrg.id)
        .order('created_at', { ascending: false });

      if (params?.search) {
        query = query.or(`email.ilike.%${params.search}%,first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%`);
      }

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      return {
        data: data as Contact[],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
    enabled: !!currentOrg,
  });
}

export function useContact(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['contact', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Contact;
    },
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { currentOrg } = useOrganization();

  return useMutation({
    mutationFn: async (contact: Omit<ContactInsert, 'organization_id'>) => {
      if (!currentOrg) throw new Error('No organization selected');
      const { data, error } = await supabase
        .from('contacts')
        .insert({ ...contact, organization_id: currentOrg.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({ title: 'Kontakti luotu onnistuneesti' });
    },
    onError: (error: Error) => {
      toast({ title: 'Virhe', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...update }: ContactUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({ title: 'Kontakti päivitetty' });
    },
    onError: (error: Error) => {
      toast({ title: 'Virhe', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteContacts() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({ title: 'Kontaktit poistettu' });
    },
    onError: (error: Error) => {
      toast({ title: 'Virhe', description: error.message, variant: 'destructive' });
    },
  });
}
