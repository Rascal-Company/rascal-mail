import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface SendEmailParams {
  to: string;
  from: { email: string; name: string };
  replyTo?: string;
  subject: string;
  html: string;
  customArgs?: Record<string, string>;
}

export async function sendEmail(params: SendEmailParams) {
  const msg = {
    to: params.to,
    from: params.from,
    replyTo: params.replyTo,
    subject: params.subject,
    html: params.html,
    customArgs: params.customArgs,
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
      subscriptionTracking: { enable: false },
    },
  };

  const response = await sgMail.send(msg);
  return response[0].headers['x-message-id'];
}

export async function sendBulkEmails(
  recipients: Array<{
    email: string;
    substitutions: Record<string, string>;
  }>,
  template: {
    from: { email: string; name: string };
    replyTo?: string;
    subject: string;
    html: string;
  },
  campaignId: string
) {
  const messages = recipients.map((recipient) => {
    let html = template.html;
    let subject = template.subject;

    // Replace merge tags
    for (const [key, value] of Object.entries(recipient.substitutions)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      html = html.replace(regex, value || '');
      subject = subject.replace(regex, value || '');
    }

    return {
      to: recipient.email,
      from: template.from,
      replyTo: template.replyTo,
      subject,
      html,
      customArgs: {
        campaign_id: campaignId,
        contact_email: recipient.email,
      },
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
        subscriptionTracking: { enable: false },
      },
    };
  });

  // SendGrid allows max 1000 per request
  const batches = chunk(messages, 1000);
  const results = [];

  for (const batch of batches) {
    const response = await sgMail.send(batch);
    results.push(response);
  }

  return results;
}

function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}
