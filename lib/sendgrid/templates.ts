// Merge tag helpers for email template processing

export const MERGE_TAGS = {
  first_name: '{{first_name}}',
  last_name: '{{last_name}}',
  email: '{{email}}',
  company: '{{company}}',
  unsubscribe_url: '{{unsubscribe_url}}',
} as const;

export function replaceMergeTags(
  html: string,
  data: Record<string, string>
): string {
  let result = html;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value || '');
  }
  return result;
}

export function getUnsubscribeUrl(contactEmail: string, orgId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const params = new URLSearchParams({
    email: contactEmail,
    org: orgId,
  });
  return `${baseUrl}/api/unsubscribe?${params.toString()}`;
}
