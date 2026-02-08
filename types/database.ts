export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          from_name: string | null;
          from_email: string | null;
          reply_to_email: string | null;
          sendgrid_verified: boolean;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          from_name?: string | null;
          from_email?: string | null;
          reply_to_email?: string | null;
          sendgrid_verified?: boolean;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          from_name?: string | null;
          from_email?: string | null;
          reply_to_email?: string | null;
          sendgrid_verified?: boolean;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      org_members: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          organization_id: string;
          role: 'owner' | 'admin' | 'member';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          organization_id: string;
          role?: 'owner' | 'admin' | 'member';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          organization_id?: string;
          role?: 'owner' | 'admin' | 'member';
          created_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          company: string | null;
          phone: string | null;
          status: 'subscribed' | 'unsubscribed' | 'bounced' | 'complained';
          tags: string[];
          custom_fields: Json;
          source: string;
          subscribed_at: string;
          unsubscribed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          company?: string | null;
          phone?: string | null;
          status?: 'subscribed' | 'unsubscribed' | 'bounced' | 'complained';
          tags?: string[];
          custom_fields?: Json;
          source?: string;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          company?: string | null;
          phone?: string | null;
          status?: 'subscribed' | 'unsubscribed' | 'bounced' | 'complained';
          tags?: string[];
          custom_fields?: Json;
          source?: string;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contact_lists: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          color: string;
          contact_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          color?: string;
          contact_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          contact_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      contact_list_members: {
        Row: {
          contact_id: string;
          list_id: string;
          added_at: string;
        };
        Insert: {
          contact_id: string;
          list_id: string;
          added_at?: string;
        };
        Update: {
          contact_id?: string;
          list_id?: string;
          added_at?: string;
        };
      };
      email_templates: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          subject: string | null;
          preview_text: string | null;
          html_content: string | null;
          design_json: Json | null;
          thumbnail_url: string | null;
          category: string;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          subject?: string | null;
          preview_text?: string | null;
          html_content?: string | null;
          design_json?: Json | null;
          thumbnail_url?: string | null;
          category?: string;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          subject?: string | null;
          preview_text?: string | null;
          html_content?: string | null;
          design_json?: Json | null;
          thumbnail_url?: string | null;
          category?: string;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          subject: string;
          preview_text: string | null;
          from_name: string;
          from_email: string;
          reply_to: string | null;
          template_id: string | null;
          html_content: string;
          design_json: Json | null;
          status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
          scheduled_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          total_recipients: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          subject: string;
          preview_text?: string | null;
          from_name: string;
          from_email: string;
          reply_to?: string | null;
          template_id?: string | null;
          html_content: string;
          design_json?: Json | null;
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
          scheduled_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          total_recipients?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          subject?: string;
          preview_text?: string | null;
          from_name?: string;
          from_email?: string;
          reply_to?: string | null;
          template_id?: string | null;
          html_content?: string;
          design_json?: Json | null;
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
          scheduled_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          total_recipients?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaign_recipients: {
        Row: {
          campaign_id: string;
          list_id: string;
        };
        Insert: {
          campaign_id: string;
          list_id: string;
        };
        Update: {
          campaign_id?: string;
          list_id?: string;
        };
      };
      email_sends: {
        Row: {
          id: string;
          organization_id: string;
          campaign_id: string;
          contact_id: string;
          sendgrid_message_id: string | null;
          status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'dropped' | 'spam' | 'unsubscribed';
          sent_at: string | null;
          delivered_at: string | null;
          first_opened_at: string | null;
          last_opened_at: string | null;
          open_count: number;
          first_clicked_at: string | null;
          last_clicked_at: string | null;
          click_count: number;
          clicked_links: Json;
          bounced_at: string | null;
          bounce_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          campaign_id: string;
          contact_id: string;
          sendgrid_message_id?: string | null;
          status?: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'dropped' | 'spam' | 'unsubscribed';
          sent_at?: string | null;
          delivered_at?: string | null;
          first_opened_at?: string | null;
          last_opened_at?: string | null;
          open_count?: number;
          first_clicked_at?: string | null;
          last_clicked_at?: string | null;
          click_count?: number;
          clicked_links?: Json;
          bounced_at?: string | null;
          bounce_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          campaign_id?: string;
          contact_id?: string;
          sendgrid_message_id?: string | null;
          status?: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'dropped' | 'spam' | 'unsubscribed';
          sent_at?: string | null;
          delivered_at?: string | null;
          first_opened_at?: string | null;
          last_opened_at?: string | null;
          open_count?: number;
          first_clicked_at?: string | null;
          last_clicked_at?: string | null;
          click_count?: number;
          clicked_links?: Json;
          bounced_at?: string | null;
          bounce_reason?: string | null;
          created_at?: string;
        };
      };
      campaign_stats: {
        Row: {
          campaign_id: string;
          total_sent: number;
          delivered: number;
          opened: number;
          unique_opens: number;
          clicked: number;
          unique_clicks: number;
          bounced: number;
          spam_reports: number;
          unsubscribed: number;
          open_rate: number;
          click_rate: number;
          updated_at: string;
        };
        Insert: {
          campaign_id: string;
          total_sent?: number;
          delivered?: number;
          opened?: number;
          unique_opens?: number;
          clicked?: number;
          unique_clicks?: number;
          bounced?: number;
          spam_reports?: number;
          unsubscribed?: number;
          open_rate?: number;
          click_rate?: number;
          updated_at?: string;
        };
        Update: {
          campaign_id?: string;
          total_sent?: number;
          delivered?: number;
          opened?: number;
          unique_opens?: number;
          clicked?: number;
          unique_clicks?: number;
          bounced?: number;
          spam_reports?: number;
          unsubscribed?: number;
          open_rate?: number;
          click_rate?: number;
          updated_at?: string;
        };
      };
    };
  };
}
