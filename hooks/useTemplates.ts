"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "./useOrganization";
import type { EmailTemplate } from "@/types";
import { toast } from "@/hooks/useToast";

// Simplified demo version - hard-coded templates instead of database queries
const DEMO_TEMPLATES: EmailTemplate[] = [
  {
    id: "template-1",
    organization_id: "demo-org",
    name: "Welcome Email",
    subject: "Welcome to our newsletter!",
    preview_text: "Thanks for subscribing",
    html_content:
      "<h1>Welcome!</h1><p>Thank you for subscribing to our newsletter.</p>",
    design_json: null,
    thumbnail_url: "",
    category: "onboarding",
    is_system: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "template-2",
    organization_id: "demo-org",
    name: "Newsletter Template",
    subject: "Monthly Update",
    preview_text: "Here are the latest news",
    html_content: "<h1>Monthly Update</h1><p>Here are the latest news...</p>",
    design_json: null,
    thumbnail_url: "",
    category: "newsletter",
    is_system: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useTemplates() {
  const { currentOrg } = useOrganization();

  return useQuery({
    queryKey: ["templates", currentOrg?.id],
    queryFn: async () => {
      return DEMO_TEMPLATES;
    },
    enabled: !!currentOrg,
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ["template", id],
    queryFn: async () => {
      return DEMO_TEMPLATES.find((t) => t.id === id) || null;
    },
    enabled: !!id,
  });
}

// Demo version: Templates are read-only, but we provide placeholder CRUD hooks
// to prevent build errors in components that use them

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Partial<EmailTemplate>) => {
      toast({
        title: "Demo mode",
        description: "Template creation is disabled in demo version",
        variant: "destructive",
      });
      throw new Error("Template creation not available in demo");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<EmailTemplate> & { id: string }) => {
      toast({
        title: "Demo mode",
        description: "Template editing is disabled in demo version",
        variant: "destructive",
      });
      throw new Error("Template editing not available in demo");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      toast({
        title: "Demo mode",
        description: "Template deletion is disabled in demo version",
        variant: "destructive",
      });
      throw new Error("Template deletion not available in demo");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
