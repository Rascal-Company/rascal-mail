// Airtable field definitions for each table
// These match the schema defined in the plan

export interface AirtableOrganization {
  id: string;
  name: string;
  slug: string;
  from_name: string;
  from_email: string;
  reply_to_email: string;
  created_at: string;
  updated_at: string;
}

export interface AirtableOrgMember {
  id: string;
  user_id: string;
  email: string;
  organization_id: string[];
  role: "owner" | "admin" | "member";
  created_at: string;
}

export interface AirtableContact {
  id: string;
  organization_id: string[];
  email: string;
  first_name: string;
  last_name: string;
  status: "subscribed" | "unsubscribed";
  created_at: string;
  updated_at: string;
}

export interface AirtableContactList {
  id: string;
  organization_id: string[];
  name: string;
  color: string;
  contact_count: number;
  created_at: string;
  updated_at: string;
}

export interface AirtableContactListMember {
  id: string;
  list_id: string[];
  contact_id: string[];
  created_at: string;
}

export interface AirtableCampaign {
  id: string;
  organization_id: string[];
  name: string;
  subject: string;
  from_name: string;
  from_email: string;
  html_content: string;
  status: "draft" | "sent";
  total_recipients: number;
  created_at: string;
  updated_at: string;
}

export interface AirtableEmailTemplate {
  id: string;
  organization_id: string[];
  name: string;
  description: string;
  html_content: string;
  design_json: string;
  thumbnail_url: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface AirtableEmailSend {
  id: string;
  campaign_id: string[];
  contact_id: string[];
  status: "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed";
  sent_at: string;
}
