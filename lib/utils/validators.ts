import { z } from 'zod';

export const contactSchema = z.object({
  email: z.string().email('Virheellinen sähköpostiosoite'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const contactListSchema = z.object({
  name: z.string().min(1, 'Nimi on pakollinen'),
  description: z.string().optional(),
  color: z.string().default('#2563eb'),
});

export const emailTemplateSchema = z.object({
  name: z.string().min(1, 'Nimi on pakollinen'),
  subject: z.string().optional(),
  preview_text: z.string().optional(),
});

export const campaignDetailsSchema = z.object({
  name: z.string().min(1, 'Kampanjan nimi on pakollinen'),
  subject: z.string().min(1, 'Aihe on pakollinen'),
  previewText: z.string().optional().default(''),
  fromName: z.string().min(1, 'Lähettäjän nimi on pakollinen'),
  fromEmail: z.string().email('Virheellinen sähköpostiosoite'),
  replyTo: z.string().email('Virheellinen sähköpostiosoite').optional().or(z.literal('')),
});

export const organizationSchema = z.object({
  name: z.string().min(1, 'Organisaation nimi on pakollinen'),
  from_name: z.string().optional(),
  from_email: z.string().email('Virheellinen sähköpostiosoite').optional().or(z.literal('')),
  reply_to_email: z.string().email('Virheellinen sähköpostiosoite').optional().or(z.literal('')),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type ContactListFormData = z.infer<typeof contactListSchema>;
export type EmailTemplateFormData = z.infer<typeof emailTemplateSchema>;
export type CampaignDetailsFormData = z.infer<typeof campaignDetailsSchema>;
export type OrganizationFormData = z.infer<typeof organizationSchema>;
