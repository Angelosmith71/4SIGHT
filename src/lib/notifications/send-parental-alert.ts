import type { DbParentalAlert } from '@/lib/supabase/types';

export interface ParentAlertPayload {
  title: string;
  message: string;
  childName: string;
  severity: string;
}

export interface SendResult {
  channel: 'email' | 'sms';
  ok: boolean;
  demo?: boolean;
  error?: string;
  preview?: string;
}

function alertBody(alert: ParentAlertPayload) {
  return {
    subject: `[Guardian Family Watch] ${alert.severity.toUpperCase()}: ${alert.title}`,
    text: `4Sight Guardian AI — Family Watch Alert\n\nChild: ${alert.childName}\nSeverity: ${alert.severity.toUpperCase()}\n\n${alert.title}\n\n${alert.message}\n\nReview activity: ${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/parental-monitor`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:520px;background:#0a0c0e;color:#e8e8e8;padding:24px;border:1px solid #00E6FF33;border-radius:4px">
      <p style="color:#00E6FF;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px">4Sight Guardian AI · Family Watch</p>
      <h1 style="color:#fff;font-size:18px;margin:0 0 12px">${alert.title}</h1>
      <p style="color:#FF2E4C;font-size:12px;margin:0 0 16px"><strong>${alert.childName}</strong> · ${alert.severity.toUpperCase()}</p>
      <p style="color:#aaa;font-size:14px;line-height:1.5">${alert.message}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/parental-monitor" style="display:inline-block;margin-top:20px;padding:10px 16px;background:#00E6FF18;color:#00E6FF;border:1px solid #00E6FF55;text-decoration:none;font-size:12px;border-radius:4px">Open Family Watch</a>
    </div>`,
    sms: `Guardian Family Watch [${alert.severity.toUpperCase()}] ${alert.childName}: ${alert.title}. ${alert.message.slice(0, 120)}`,
  };
}

export async function sendParentalEmail(to: string, alert: ParentAlertPayload): Promise<SendResult> {
  const body = alertBody(alert);
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PARENT_ALERT_FROM_EMAIL ?? 'Guardian AI <onboarding@resend.dev>';

  if (!apiKey) {
    return { channel: 'email', ok: true, demo: true, preview: `To: ${to}\n${body.subject}\n\n${body.text}` };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject: body.subject, html: body.html, text: body.text }),
    });
    if (!res.ok) {
      const err = await res.text();
      return { channel: 'email', ok: false, error: err };
    }
    return { channel: 'email', ok: true };
  } catch (e: unknown) {
    return { channel: 'email', ok: false, error: e instanceof Error ? e.message : 'Email send failed' };
  }
}

export async function sendParentalSms(to: string, alert: ParentAlertPayload): Promise<SendResult> {
  const body = alertBody(alert);
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) {
    return { channel: 'sms', ok: true, demo: true, preview: `To: ${to}\n${body.sms}` };
  }

  try {
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const params = new URLSearchParams({ To: to, From: from, Body: body.sms });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!res.ok) {
      const err = await res.text();
      return { channel: 'sms', ok: false, error: err };
    }
    return { channel: 'sms', ok: true };
  } catch (e: unknown) {
    return { channel: 'sms', ok: false, error: e instanceof Error ? e.message : 'SMS send failed' };
  }
}

export function toPayload(alert: DbParentalAlert): ParentAlertPayload {
  return { title: alert.title, message: alert.message, childName: alert.child_name, severity: alert.severity };
}
