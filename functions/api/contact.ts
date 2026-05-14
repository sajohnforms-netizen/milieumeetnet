// Cloudflare Pages Function — POST /api/contact

import {
  parseFormFields, checkHoneypot, isValidEmail,
  sendEmail, errorResponse, successResponse, emailMeta,
} from '../lib/form-utils';

interface Env {
  RESEND_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const fields = await parseFormFields<{
    name: string; organisation: string; email: string; phone: string;
    subject: string; message: string; 'bot-field': string;
  }>(request, ['name', 'organisation', 'email', 'phone', 'subject', 'message']);

  const honeypot = checkHoneypot(fields['bot-field']);
  if (honeypot) return honeypot;

  if (!fields.name || !fields.email || !fields.message) {
    return errorResponse('Vul alle verplichte velden in.');
  }

  if (!isValidEmail(fields.email)) {
    return errorResponse('Ongeldig e-mailadres.');
  }

  const emailBody = [
    'Nieuw contactformulier bericht via milieumeetnet.nl',
    '',
    `Naam:          ${fields.name}`,
    `Organisatie:   ${fields.organisation || '—'}`,
    `E-mail:        ${fields.email}`,
    `Telefoon:      ${fields.phone || '—'}`,
    fields.subject ? `Onderwerp:     ${fields.subject}` : null,
    '',
    'Bericht:',
    fields.message,
    '',
    emailMeta(request),
  ]
    .filter((line) => line !== null)
    .join('\n');

  try {
    await sendEmail(env.RESEND_API_KEY, {
      to: ['info@milieumeetnet.nl'],
      replyTo: fields.email,
      subject: `Contact: ${fields.subject || 'Nieuw bericht'} — ${fields.name}`,
      text: emailBody,
    });
    return successResponse();
  } catch (err) {
    console.error('Contact form error:', err);
    return errorResponse('Er is iets misgegaan. Probeer het opnieuw of mail ons direct.', 500);
  }
};
