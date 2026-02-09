// Supabase database types
// These match the schema in supabase/schema.sql

export type Database = {
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
          sendgrid_verified: boolean | null;
          settings: Record<string, unknown> | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          from_name?: string | null;
          from_email?: string | null;
          reply_to_email?: string | null;
          sendgrid_verified?: boolean | null;
          settings?: Record<string, unknown> | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          from_name?: string | null;
          from_email?: string | null;
          reply_to_email?: string | null;
          sendgrid_verified?: boolean | null;
          settings?: Record<string, unknown> | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      org_members: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          organization_id: string | null;
          role: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          organization_id?: string | null;
          role?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          organization_id?: string | null;
          role?: string | null;
          created_at?: string | null;
        };
      };
      contacts: {
        Row: {
          id: string;
          organization_id: string | null;
          email: string;
          first_name: string | null;
          last_name: string | null;
          company: string | null;
          phone: string | null;
          status: string | null;
          tags: string[] | null;
          custom_fields: Record<string, unknown> | null;
          source: string | null;
          subscribed_at: string | null;
          unsubscribed_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          company?: string | null;
          phone?: string | null;
          status?: string | null;
          tags?: string[] | null;
          custom_fields?: Record<string, unknown> | null;
          source?: string | null;
          subscribed_at?: string | null;
          unsubscribed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          company?: string | null;
          phone?: string | null;
          status?: string | null;
          tags?: string[] | null;
          custom_fields?: Record<string, unknown> | null;
          source?: string | null;
          subscribed_at?: string | null;
          unsubscribed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      contact_lists: {
        Row: {
          id: string;
          organization_id: string | null;
          name: string;
          description: string | null;
          color: string | null;
          contact_count: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          name: string;
          description?: string | null;
          color?: string | null;
          contact_count?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          name?: string;
          description?: string | null;
          color?: string | null;
          contact_count?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      contact_list_members: {
        Row: {
          contact_id: string;
          list_id: string;
          added_at: string | null;
        };
        Insert: {
          contact_id: string;
          list_id: string;
          added_at?: string | null;
        };
        Update: {
          contact_id?: string;
          list_id?: string;
          added_at?: string | null;
        };
      };
      email_templates: {
        Row: {
          id: string;
          organization_id: string | null;
          name: string;
          subject: string | null;
          preview_text: string | null;
          html_content: string | null;
          design_json: Record<string, unknown> | null;
          thumbnail_url: string | null;
          category: string | null;
          is_system: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          name: string;
          subject?: string | null;
          preview_text?: string | null;
          html_content?: string | null;
          design_json?: Record<string, unknown> | null;
          thumbnail_url?: string | null;
          category?: string | null;
          is_system?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          name?: string;
          subject?: string | null;
          preview_text?: string | null;
          html_content?: string | null;
          design_json?: Record<string, unknown> | null;
          thumbnail_url?: string | null;
          category?: string | null;
          is_system?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      campaigns: {
        Row: {
          id: string;
          organization_id: string | null;
          name: string;
          subject: string;
          preview_text: string | null;
          from_name: string;
          from_email: string;
          reply_to: string | null;
          template_id: string | null;
          html_content: string;
          design_json: Record<string, unknown> | null;
          status: string | null;
          scheduled_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          total_recipients: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          name: string;
          subject: string;
          preview_text?: string | null;
          from_name: string;
          from_email: string;
          reply_to?: string | null;
          template_id?: string | null;
          html_content: string;
          design_json?: Record<string, unknown> | null;
          status?: string | null;
          scheduled_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          total_recipients?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          name?: string;
          subject?: string;
          preview_text?: string | null;
          from_name?: string;
          from_email?: string;
          reply_to?: string | null;
          template_id?: string | null;
          html_content?: string;
          design_json?: Record<string, unknown> | null;
          status?: string | null;
          scheduled_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          total_recipients?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
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
          organization_id: string | null;
          campaign_id: string | null;
          contact_id: string | null;
          sendgrid_message_id: string | null;
          status: string | null;
          sent_at: string | null;
          delivered_at: string | null;
          first_opened_at: string | null;
          last_opened_at: string | null;
          open_count: number | null;
          first_clicked_at: string | null;
          last_clicked_at: string | null;
          click_count: number | null;
          clicked_links: Record<string, unknown> | null;
          bounced_at: string | null;
          bounce_reason: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          campaign_id?: string | null;
          contact_id?: string | null;
          sendgrid_message_id?: string | null;
          status?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          first_opened_at?: string | null;
          last_opened_at?: string | null;
          open_count?: number | null;
          first_clicked_at?: string | null;
          last_clicked_at?: string | null;
          click_count?: number | null;
          clicked_links?: Record<string, unknown> | null;
          bounced_at?: string | null;
          bounce_reason?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          campaign_id?: string | null;
          contact_id?: string | null;
          sendgrid_message_id?: string | null;
          status?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          first_opened_at?: string | null;
          last_opened_at?: string | null;
          open_count?: number | null;
          first_clicked_at?: string | null;
          last_clicked_at?: string | null;
          click_count?: number | null;
          clicked_links?: Record<string, unknown> | null;
          bounced_at?: string | null;
          bounce_reason?: string | null;
          created_at?: string | null;
        };
      };
      campaign_stats: {
        Row: {
          campaign_id: string;
          total_sent: number | null;
          delivered: number | null;
          opened: number | null;
          unique_opens: number | null;
          clicked: number | null;
          unique_clicks: number | null;
          bounced: number | null;
          spam_reports: number | null;
          unsubscribed: number | null;
          open_rate: number | null;
          click_rate: number | null;
          updated_at: string | null;
        };
        Insert: {
          campaign_id: string;
          total_sent?: number | null;
          delivered?: number | null;
          opened?: number | null;
          unique_opens?: number | null;
          clicked?: number | null;
          unique_clicks?: number | null;
          bounced?: number | null;
          spam_reports?: number | null;
          unsubscribed?: number | null;
          open_rate?: number | null;
          click_rate?: number | null;
          updated_at?: string | null;
        };
        Update: {
          campaign_id?: string;
          total_sent?: number | null;
          delivered?: number | null;
          opened?: number | null;
          unique_opens?: number | null;
          clicked?: number | null;
          unique_clicks?: number | null;
          bounced?: number | null;
          spam_reports?: number | null;
          unsubscribed?: number | null;
          open_rate?: number | null;
          click_rate?: number | null;
          updated_at?: string | null;
        };
      };
    };
  };
};
