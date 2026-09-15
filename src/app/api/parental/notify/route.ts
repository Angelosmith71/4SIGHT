import { NextRequest, NextResponse } from 'next/server';
import { isDemoMode } from '@/lib/demo';
import { demoParentalAlerts } from '@/lib/demo/data';
import { sendParentalEmail, sendParentalSms, toPayload, type ParentAlertPayload } from '@/lib/notifications/send-parental-alert';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email: string | undefined = body.email?.trim();
    const phone: string | undefined = body.phone?.trim();
    const sendEmail = body.sendEmail !== false;
    const sendSms = body.sendSms !== false;

    if (!email && !phone) {
      return NextResponse.json({ error: 'Parent email or phone required' }, { status: 400 });
    }

    let payload: ParentAlertPayload;
    if (body.type === 'test') {
      payload = {
        title: 'Test alert — Family Watch is active',
        message: 'This is a test notification from 4Sight Guardian AI. You will receive email and SMS when flagged content is detected on a child device.',
        childName: 'Demo Child',
        severity: 'medium',
      };
    } else {
      const alertId = body.alertId as string | undefined;
      let alert = isDemoMode()
        ? demoParentalAlerts.find(a => a.id === alertId)
        : null;
      if (!alert && body.alert) {
        alert = body.alert;
      }
      if (!alert) {
        return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
      }
      payload = toPayload(alert);
    }

    const results = [];
    if (sendEmail && email) results.push(await sendParentalEmail(email, payload));
    if (sendSms && phone) results.push(await sendParentalSms(phone, payload));

    const allOk = results.every(r => r.ok);
    const demo = results.some(r => r.demo);

    return NextResponse.json({
      ok: allOk,
      demo,
      demoMode: isDemoMode(),
      message: demo
        ? 'Demo mode — notification preview generated (add RESEND_API_KEY / Twilio keys to send for real)'
        : allOk ? 'Notification sent' : 'Some channels failed',
      results,
    }, { status: allOk ? 200 : 502 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Notify failed' }, { status: 500 });
  }
}
