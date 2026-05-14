export const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://milieumeetnet.nl',
};

export async function parseFormFields<T extends Record<string, string>>(
  request: Request,
  fields: (keyof T)[]
): Promise<T> {
  const contentType = request.headers.get('content-type') || '';
  const result = {} as Record<string, string>;

  if (
    contentType.includes('multipart/form-data') ||
    contentType.includes('application/x-www-form-urlencoded')
  ) {
    const formData = await request.formData();
    for (const field of fields) {
      result[field as string] = formData.get(field as string)?.toString().trim() || '';
    }
    result['bot-field'] = formData.get('bot-field')?.toString() || '';
  } else {
    const body = (await request.json()) as Record<string, string>;
    for (const field of fields) {
      result[field as string] = body[field as string]?.trim() || '';
    }
    result['bot-field'] = body['bot-field'] || '';
  }

  return result as T;
}

export function checkHoneypot(botField: string): Response | null {
  if (botField) {
    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  }
  return null;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function sendEmail(
  apiKey: string,
  options: { to: string[]; subject: string; text: string; from?: string; replyTo?: string }
): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: options.from || 'Milieumeetnet Nederland <noreply@sajrecherche.com>',
      to: options.to,
      ...(options.replyTo ? { reply_to: options.replyTo } : {}),
      subject: options.subject,
      text: options.text,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('Resend API error:', res.status, errorBody);
    throw new Error(`Resend API error: ${res.status}`);
  }
}

export function errorResponse(message: string, status = 400): Response {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { status, headers: corsHeaders }
  );
}

export function successResponse(): Response {
  return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
}

export function emailMeta(request: Request): string {
  return [
    '---',
    `Verzonden via: ${request.headers.get('referer') || 'onbekend'}`,
    `IP: ${request.headers.get('cf-connecting-ip') || 'onbekend'}`,
    `Tijdstip: ${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}`,
  ].join('\n');
}
