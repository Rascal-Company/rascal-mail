import { Database } from './database';

// Table row types
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrgMember = Database['public']['Tables']['org_members']['Row'];
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type ContactList = Database['public']['Tables']['contact_lists']['Row'];
export type ContactListMember = Database['public']['Tables']['contact_list_members']['Row'];
export type EmailTemplate = Database['public']['Tables']['email_templates']['Row'];
export type Campaign = Database['public']['Tables']['campaigns']['Row'];
export type CampaignRecipient = Database['public']['Tables']['campaign_recipients']['Row'];
export type EmailSend = Database['public']['Tables']['email_sends']['Row'];
export type CampaignStats = Database['public']['Tables']['campaign_stats']['Row'];

// Insert types
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];
export type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
export type ContactListInsert = Database['public']['Tables']['contact_lists']['Insert'];
export type EmailTemplateInsert = Database['public']['Tables']['email_templates']['Insert'];
export type CampaignInsert = Database['public']['Tables']['campaigns']['Insert'];

// Update types
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update'];
export type ContactUpdate = Database['public']['Tables']['contacts']['Update'];
export type ContactListUpdate = Database['public']['Tables']['contact_lists']['Update'];
export type EmailTemplateUpdate = Database['public']['Tables']['email_templates']['Update'];
export type CampaignUpdate = Database['public']['Tables']['campaigns']['Update'];

// App-specific types
export interface UserSession {
  userId: string;
  email: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'member';
}

export interface DashboardStats {
  totalContacts: number;
  emailsSent30d: number;
  openRate: number;
  clickRate: number;
}

export interface CampaignAnalytics {
  sends: EmailSend[];
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CampaignWizardData {
  // Step 1 - Details
  name: string;
  subject: string;
  previewText: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  // Step 2 - Content
  htmlContent: string;
  designJson: object | null;
  templateId: string | null;
  // Step 3 - Recipients
  listIds: string[];
  totalRecipients: number;
  // Step 4 - Schedule
  sendNow: boolean;
  scheduledAt: string | null;
}

export interface ImportResult {
  total: number;
  imported: number;
  duplicates: number;
  errors: number;
}

export type { Database };
