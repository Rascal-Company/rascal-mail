-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  from_name TEXT,
  from_email TEXT,
  reply_to_email TEXT,
  sendgrid_verified BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{"timezone": "Europe/Helsinki"}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members
CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Contacts
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  phone TEXT,
  status TEXT DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed', 'bounced', 'complained')),
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  source TEXT DEFAULT 'manual',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- Contact lists
CREATE TABLE contact_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#2563eb',
  contact_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact-list membership
CREATE TABLE contact_list_members (
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  list_id UUID REFERENCES contact_lists(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (contact_id, list_id)
);

-- Email templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT,
  preview_text TEXT,
  html_content TEXT,
  design_json JSONB,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'custom',
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to TEXT,
  template_id UUID REFERENCES email_templates(id),
  html_content TEXT NOT NULL,
  design_json JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_recipients INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign recipients
CREATE TABLE campaign_recipients (
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  list_id UUID REFERENCES contact_lists(id) ON DELETE CASCADE,
  PRIMARY KEY (campaign_id, list_id)
);

-- Email sends
CREATE TABLE email_sends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  sendgrid_message_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'dropped', 'spam', 'unsubscribed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  first_opened_at TIMESTAMPTZ,
  last_opened_at TIMESTAMPTZ,
  open_count INT DEFAULT 0,
  first_clicked_at TIMESTAMPTZ,
  last_clicked_at TIMESTAMPTZ,
  click_count INT DEFAULT 0,
  clicked_links JSONB DEFAULT '[]',
  bounced_at TIMESTAMPTZ,
  bounce_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign stats
CREATE TABLE campaign_stats (
  campaign_id UUID PRIMARY KEY REFERENCES campaigns(id) ON DELETE CASCADE,
  total_sent INT DEFAULT 0,
  delivered INT DEFAULT 0,
  opened INT DEFAULT 0,
  unique_opens INT DEFAULT 0,
  clicked INT DEFAULT 0,
  unique_clicks INT DEFAULT 0,
  bounced INT DEFAULT 0,
  spam_reports INT DEFAULT 0,
  unsubscribed INT DEFAULT 0,
  open_rate DECIMAL(5,2) DEFAULT 0,
  click_rate DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_status ON contacts(organization_id, status);
CREATE INDEX idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_email_sends_campaign ON email_sends(campaign_id);
CREATE INDEX idx_email_sends_contact ON email_sends(contact_id);
CREATE INDEX idx_email_sends_sendgrid ON email_sends(sendgrid_message_id);

-- RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_stats ENABLE ROW LEVEL SECURITY;

-- Function to get user org IDs
CREATE OR REPLACE FUNCTION public.user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id FROM org_members WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies
CREATE POLICY "org_members_own" ON org_members FOR ALL USING (user_id = auth.uid());
CREATE POLICY "organizations_member" ON organizations FOR ALL USING (id IN (SELECT public.user_org_ids()));
CREATE POLICY "contacts_org" ON contacts FOR ALL USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "contact_lists_org" ON contact_lists FOR ALL USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "contact_list_members_org" ON contact_list_members FOR ALL USING (list_id IN (SELECT id FROM contact_lists WHERE organization_id IN (SELECT public.user_org_ids())));
CREATE POLICY "email_templates_org" ON email_templates FOR ALL USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "campaigns_org" ON campaigns FOR ALL USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "campaign_recipients_org" ON campaign_recipients FOR ALL USING (campaign_id IN (SELECT id FROM campaigns WHERE organization_id IN (SELECT public.user_org_ids())));
CREATE POLICY "email_sends_org" ON email_sends FOR ALL USING (organization_id IN (SELECT public.user_org_ids()));
CREATE POLICY "campaign_stats_org" ON campaign_stats FOR ALL USING (campaign_id IN (SELECT id FROM campaigns WHERE organization_id IN (SELECT public.user_org_ids())));

-- Triggers
CREATE OR REPLACE FUNCTION update_list_contact_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE contact_lists SET contact_count = contact_count + 1, updated_at = NOW() WHERE id = NEW.list_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE contact_lists SET contact_count = contact_count - 1, updated_at = NOW() WHERE id = OLD.list_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contact_list_count_trigger
AFTER INSERT OR DELETE ON contact_list_members
FOR EACH ROW EXECUTE FUNCTION update_list_contact_count();

CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO campaign_stats (campaign_id) VALUES (NEW.campaign_id)
  ON CONFLICT (campaign_id) DO UPDATE SET
    total_sent = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND status != 'pending'),
    delivered = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND status IN ('delivered', 'opened', 'clicked')),
    opened = (SELECT SUM(open_count) FROM email_sends WHERE campaign_id = NEW.campaign_id),
    unique_opens = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND open_count > 0),
    clicked = (SELECT SUM(click_count) FROM email_sends WHERE campaign_id = NEW.campaign_id),
    unique_clicks = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND click_count > 0),
    bounced = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND status = 'bounced'),
    spam_reports = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND status = 'spam'),
    unsubscribed = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND status = 'unsubscribed'),
    open_rate = CASE WHEN (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND status IN ('delivered', 'opened', 'clicked')) > 0 THEN ROUND((SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND open_count > 0)::DECIMAL / (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND status IN ('delivered', 'opened', 'clicked')) * 100, 2) ELSE 0 END,
    click_rate = CASE WHEN (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND status IN ('delivered', 'opened', 'clicked')) > 0 THEN ROUND((SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND click_count > 0)::DECIMAL / (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND status IN ('delivered', 'opened', 'clicked')) * 100, 2) ELSE 0 END,
    updated_at = NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_sends_stats_trigger
AFTER INSERT OR UPDATE ON email_sends
FOR EACH ROW EXECUTE FUNCTION update_campaign_stats();
