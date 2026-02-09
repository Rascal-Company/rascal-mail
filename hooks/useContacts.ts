"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "./useOrganization";
import type { Contact, ContactInsert, ContactUpdate } from "@/types";
import { toast } from "./useToast";

// Simplified demo version - no pagination, search, or status filters
export function useContacts() {
  const { currentOrg } = useOrganization();

  return useQuery({
    queryKey: ["contacts", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return { data: [], total: 0 };

      const response = await fetch(
        `/api/contacts?organizationId=${currentOrg.id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch contacts");

      return response.json();
    },
    enabled: !!currentOrg,
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ["contact", id],
    queryFn: async () => {
      const response = await fetch(`/api/contacts?id=${id}`);
      if (!response.ok) throw new Error("Failed to fetch contact");

      const { data } = await response.json();
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  const { currentOrg } = useOrganization();

  return useMutation({
    mutationFn: async (contact: Omit<ContactInsert, "organization_id">) => {
      if (!currentOrg) throw new Error("No organization selected");

      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contact, organizationId: currentOrg.id }),
      });

      if (!response.ok) throw new Error("Failed to create contact");

      const { data } = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({ title: "Kontakti luotu onnistuneesti" });
    },
    onError: (error: Error) => {
      toast({
        title: "Virhe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...update }: ContactUpdate & { id: string }) => {
      const response = await fetch("/api/contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...update }),
      });

      if (!response.ok) throw new Error("Failed to update contact");

      const { data } = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({ title: "Kontakti päivitetty" });
    },
    onError: (error: Error) => {
      toast({
        title: "Virhe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteContacts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch(`/api/contacts?ids=${ids.join(",")}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete contacts");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({ title: "Kontaktit poistettu" });
    },
    onError: (error: Error) => {
      toast({
        title: "Virhe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
