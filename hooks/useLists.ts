'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useOrganization } from './useOrganization';
import { ContactList, ContactListInsert, ContactListUpdate } from '@/types';
import { toast } from './useToast';

export function useLists() {
  const { currentOrg } = useOrganization();
  const supabase = createClient();

  return useQuery({
    queryKey: ['lists', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from('contact_lists')
        .select('*')
        .eq('organization_id', currentOrg.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ContactList[];
    },
    enabled: !!currentOrg,
  });
}

export function useList(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['list', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_lists')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ContactList;
    },
    enabled: !!id,
  });
}

export function useListContacts(listId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['list-contacts', listId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_list_members')
        .select('contact_id, contacts(*)')
        .eq('list_id', listId);
      if (error) throw error;
      return data.map((m: any) => m.contacts);
    },
    enabled: !!listId,
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { currentOrg } = useOrganization();

  return useMutation({
    mutationFn: async (list: Omit<ContactListInsert, 'organization_id'>) => {
      if (!currentOrg) throw new Error('No organization selected');
      const { data, error } = await supabase
        .from('contact_lists')
        .insert({ ...list, organization_id: currentOrg.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast({ title: 'Lista luotu onnistuneesti' });
    },
    onError: (error: Error) => {
      toast({ title: 'Virhe', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...update }: ContactListUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('contact_lists')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast({ title: 'Lista päivitetty' });
    },
    onError: (error: Error) => {
      toast({ title: 'Virhe', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_lists')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast({ title: 'Lista poistettu' });
    },
    onError: (error: Error) => {
      toast({ title: 'Virhe', description: error.message, variant: 'destructive' });
    },
  });
}

export function useAddContactsToList() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ listId, contactIds }: { listId: string; contactIds: string[] }) => {
      const rows = contactIds.map((contactId) => ({
        contact_id: contactId,
        list_id: listId,
      }));
      const { error } = await supabase
        .from('contact_list_members')
        .upsert(rows, { onConflict: 'contact_id,list_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['list-contacts'] });
      toast({ title: 'Kontaktit lisätty listalle' });
    },
    onError: (error: Error) => {
      toast({ title: 'Virhe', description: error.message, variant: 'destructive' });
    },
  });
}
