"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "./useOrganization";
import type {
  ContactList,
  ContactListInsert,
  ContactListUpdate,
} from "@/types";
import { toast } from "./useToast";

export function useLists() {
  const { currentOrg } = useOrganization();

  return useQuery({
    queryKey: ["lists", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];

      const response = await fetch(
        `/api/lists?organizationId=${currentOrg.id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch lists");

      const { data } = await response.json();
      return data || [];
    },
    enabled: !!currentOrg,
  });
}

export function useList(id: string) {
  return useQuery({
    queryKey: ["list", id],
    queryFn: async () => {
      const response = await fetch(`/api/lists?id=${id}`);
      if (!response.ok) throw new Error("Failed to fetch list");

      const { data } = await response.json();
      return data;
    },
    enabled: !!id,
  });
}

export function useListContacts(listId: string) {
  return useQuery({
    queryKey: ["list-contacts", listId],
    queryFn: async () => {
      const response = await fetch(`/api/lists/${listId}/contacts`);
      if (!response.ok) throw new Error("Failed to fetch list contacts");

      const { data } = await response.json();
      return data || [];
    },
    enabled: !!listId,
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();
  const { currentOrg } = useOrganization();

  return useMutation({
    mutationFn: async (list: Omit<ContactListInsert, "organization_id">) => {
      if (!currentOrg) throw new Error("No organization selected");

      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...list, organizationId: currentOrg.id }),
      });

      if (!response.ok) throw new Error("Failed to create list");

      const { data } = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      toast({ title: "Lista luotu onnistuneesti" });
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

export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...update
    }: ContactListUpdate & { id: string }) => {
      const response = await fetch("/api/lists", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...update }),
      });

      if (!response.ok) throw new Error("Failed to update list");

      const { data } = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      toast({ title: "Lista päivitetty" });
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

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/lists?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete list");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      toast({ title: "Lista poistettu" });
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

export function useAddContactsToList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      contactIds,
    }: {
      listId: string;
      contactIds: string[];
    }) => {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId, contactIds }),
      });

      if (!response.ok) throw new Error("Failed to add contacts to list");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["list-contacts"] });
      toast({ title: "Kontaktit lisätty listalle" });
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
