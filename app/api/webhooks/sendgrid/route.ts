import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const events = await request.json();
    const supabase = createAdminClient();

    for (const event of events) {
      const {
        event: eventType,
        sg_message_id,
        email,
        timestamp,
        url,
        reason,
      } = event;

      const messageId = sg_message_id?.split('.')[0];
      if (!messageId) continue;

      const updateData: Record<string, any> = {};

      switch (eventType) {
        case 'delivered':
          updateData.status = 'delivered';
          updateData.delivered_at = new Date(timestamp * 1000).toISOString();
          break;

        case 'open':
          updateData.status = 'opened';
          updateData.last_opened_at = new Date(timestamp * 1000).toISOString();
          // Increment open_count
          const { data: currentOpen } = await supabase
            .from('email_sends')
            .select('open_count, first_opened_at')
            .eq('sendgrid_message_id', messageId)
            .single();

          if (currentOpen) {
            updateData.open_count = (currentOpen.open_count || 0) + 1;
            if (!currentOpen.first_opened_at) {
              updateData.first_opened_at = new Date(timestamp * 1000).toISOString();
            }
          }
          break;

        case 'click':
          updateData.status = 'clicked';
          updateData.last_clicked_at = new Date(timestamp * 1000).toISOString();

          const { data: currentClick } = await supabase
            .from('email_sends')
            .select('click_count, first_clicked_at, clicked_links')
            .eq('sendgrid_message_id', messageId)
            .single();

          if (currentClick) {
            updateData.click_count = (currentClick.click_count || 0) + 1;
            if (!currentClick.first_clicked_at) {
              updateData.first_clicked_at = new Date(timestamp * 1000).toISOString();
            }
            const links = Array.isArray(currentClick.clicked_links) ? currentClick.clicked_links : [];
            if (url && !links.includes(url)) {
              updateData.clicked_links = [...links, url];
            }
          }
          break;

        case 'bounce':
          updateData.status = 'bounced';
          updateData.bounced_at = new Date(timestamp * 1000).toISOString();
          updateData.bounce_reason = reason;

          await supabase
            .from('contacts')
            .update({ status: 'bounced' })
            .eq('email', email);
          break;

        case 'spamreport':
          updateData.status = 'spam';

          await supabase
            .from('contacts')
            .update({ status: 'complained' })
            .eq('email', email);
          break;

        case 'unsubscribe':
          updateData.status = 'unsubscribed';

          await supabase
            .from('contacts')
            .update({
              status: 'unsubscribed',
              unsubscribed_at: new Date().toISOString(),
            })
            .eq('email', email);
          break;
      }

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('email_sends')
          .update(updateData)
          .eq('sendgrid_message_id', messageId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SendGrid webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
