import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendBulkEmails } from '@/lib/sendgrid/client';
import { getUnsubscribeUrl } from '@/lib/sendgrid/templates';

export async function POST(request: NextRequest) {
  try {
    const { campaignId, listIds } = await request.json();
    const supabase = createAdminClient();

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Get contacts from selected lists (exclude unsubscribed/bounced)
    const { data: listMembers } = await supabase
      .from('contact_list_members')
      .select('contact_id')
      .in('list_id', listIds);

    const contactIds = Array.from(new Set(listMembers?.map((m: any) => m.contact_id) || []));

    const { data: contacts } = await supabase
      .from('contacts')
      .select('*')
      .in('id', contactIds)
      .eq('status', 'subscribed');

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ error: 'No eligible recipients' }, { status: 400 });
    }

    // Update campaign status
    await supabase
      .from('campaigns')
      .update({
        status: 'sending',
        started_at: new Date().toISOString(),
        total_recipients: contacts.length,
      })
      .eq('id', campaignId);

    // Create email_sends records
    const emailSendsData = contacts.map((contact) => ({
      organization_id: campaign.organization_id,
      campaign_id: campaignId,
      contact_id: contact.id,
      status: 'pending' as const,
    }));

    await supabase.from('email_sends').insert(emailSendsData);

    // Prepare and send emails
    const recipients = contacts.map((contact) => ({
      email: contact.email,
      substitutions: {
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email,
        company: contact.company || '',
        unsubscribe_url: getUnsubscribeUrl(contact.email, campaign.organization_id),
      },
    }));

    await sendBulkEmails(
      recipients,
      {
        from: { email: campaign.from_email, name: campaign.from_name },
        replyTo: campaign.reply_to || undefined,
        subject: campaign.subject,
        html: campaign.html_content,
      },
      campaignId
    );

    // Update campaign as sent
    await supabase
      .from('campaigns')
      .update({
        status: 'sent',
        completed_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    // Update send statuses
    await supabase
      .from('email_sends')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('campaign_id', campaignId)
      .eq('status', 'pending');

    return NextResponse.json({ success: true, recipientCount: contacts.length });
  } catch (error) {
    console.error('Campaign send error:', error);
    return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 });
  }
}
