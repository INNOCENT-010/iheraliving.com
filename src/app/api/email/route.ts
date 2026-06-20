import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL     = process.env.RESEND_FROM_EMAIL || "IHE'RA <iheraliving@gmail.com>"
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL        || 'admin@ihera.com'
const SITE_URL       = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

async function sendEmail(to: string | string[], subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log('[EMAIL MOCK] To:', to, '| Subject:', subject)
    return { mock: true }
  }
  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:    FROM_EMAIL,
      to:      Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Resend error')
  return data
}

function brandedEmail(body: string) {
  return `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 40px 32px;background:#0d0d0d;color:#f5f0e8;">
      <div style="margin-bottom:32px;">
        <h1 style="font-size:26px;letter-spacing:5px;color:#b8924a;margin:0 0 4px;">IHE'RA</h1>
        <p style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(245,240,232,0.35);margin:0;">Curated Living</p>
      </div>
      ${body}
      <div style="margin-top:40px;padding-top:20px;border-top:1px solid rgba(184,146,74,0.15);">
        <p style="font-size:10px;color:rgba(245,240,232,0.25);line-height:1.6;margin:0;">
          IHE'RA — Curated Living<br/>Lagos, Nigeria
        </p>
      </div>
    </div>
  `
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type } = body

  // enquiry_reply and enquiry_confirm come from both admin and public
  // so we check auth only for admin-only types
  const adminOnlyTypes = ['marketing']

  if (adminOnlyTypes.includes(type)) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  try {

    // ── Enquiry notification to admin ──
    if (type === 'enquiry_notify') {
      const { enquiryId } = body
      const { data: enquiry } = await supabase
        .from('enquiries')
        .select('*')
        .eq('id', enquiryId)
        .single()
      if (!enquiry) return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 })

      await sendEmail(
        ADMIN_EMAIL,
        `New Enquiry — ${enquiry.name}`,
        brandedEmail(`
          <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(245,240,232,0.4);margin:0 0 20px;">New Client Enquiry</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(184,146,74,0.12);color:rgba(245,240,232,0.4);font-size:10px;letter-spacing:2px;text-transform:uppercase;width:100px;vertical-align:top;">Name</td>
              <td style="padding:12px 0;border-bottom:1px solid rgba(184,146,74,0.12);color:#f5f0e8;font-size:14px;">${enquiry.name}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(184,146,74,0.12);color:rgba(245,240,232,0.4);font-size:10px;letter-spacing:2px;text-transform:uppercase;vertical-align:top;">Email</td>
              <td style="padding:12px 0;border-bottom:1px solid rgba(184,146,74,0.12);color:#f5f0e8;font-size:14px;">${enquiry.email}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid rgba(184,146,74,0.12);color:rgba(245,240,232,0.4);font-size:10px;letter-spacing:2px;text-transform:uppercase;vertical-align:top;">Phone</td>
              <td style="padding:12px 0;border-bottom:1px solid rgba(184,146,74,0.12);color:#f5f0e8;font-size:14px;">${enquiry.phone || '—'}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;color:rgba(245,240,232,0.4);font-size:10px;letter-spacing:2px;text-transform:uppercase;vertical-align:top;">Message</td>
              <td style="padding:12px 0;color:#f5f0e8;font-size:14px;line-height:1.8;">${enquiry.message}</td>
            </tr>
          </table>
          <div style="margin-top:28px;">
            <a href="${SITE_URL}/admin/enquiries" style="display:inline-block;background:#b8924a;color:#0d0d0d;padding:12px 28px;font-size:10px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;">
              View in Admin →
            </a>
          </div>
        `)
      )

      await supabase.from('enquiries').update({ email_sent: true }).eq('id', enquiryId)
      return NextResponse.json({ ok: true })
    }

    // ── Enquiry confirmation to client ──
    if (type === 'enquiry_confirm') {
      const { clientEmail, clientName } = body
      if (!clientEmail) return NextResponse.json({ error: 'Missing clientEmail' }, { status: 400 })

      await sendEmail(
        clientEmail,
        "We've received your enquiry — IHE'RA",
        brandedEmail(`
          <p style="font-size:15px;line-height:1.8;color:rgba(245,240,232,0.85);margin:0 0 16px;">Dear ${clientName || 'there'},</p>
          <p style="font-size:15px;line-height:1.8;color:rgba(245,240,232,0.85);margin:0 0 16px;">
            Thank you for reaching out. We have received your enquiry and one of our team will be in contact within 48 hours.
          </p>
          <p style="font-size:15px;line-height:1.8;color:rgba(245,240,232,0.85);margin:0 0 28px;">
            In the meantime, feel free to explore our collection.
          </p>
          <a href="${SITE_URL}/collection" style="display:inline-block;background:#b8924a;color:#0d0d0d;padding:14px 32px;font-size:10px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;">
            Explore Collection
          </a>
        `)
      )

      return NextResponse.json({ ok: true })
    }

    // ── Enquiry reply from admin dashboard ──
    if (type === 'enquiry_reply') {
      const { clientEmail, clientName, replyMessage, enquiryId } = body
      if (!clientEmail || !replyMessage) {
        return NextResponse.json({ error: 'Missing clientEmail or replyMessage' }, { status: 400 })
      }

      await sendEmail(
        clientEmail,
        `Re: Your IHE'RA Enquiry`,
        brandedEmail(`
          <p style="font-size:15px;line-height:1.8;color:rgba(245,240,232,0.85);margin:0 0 16px;">
            Dear ${clientName || 'there'},
          </p>
          <div style="margin:24px 0;padding:24px 28px;border-left:2px solid #b8924a;background:rgba(184,146,74,0.06);">
            <p style="font-size:14px;line-height:1.9;color:rgba(245,240,232,0.8);margin:0;white-space:pre-wrap;">${replyMessage}</p>
          </div>
          <p style="font-size:14px;line-height:1.8;color:rgba(245,240,232,0.5);margin:24px 0 0;">
            Warm regards,<br/>
            <span style="color:#b8924a;">IHE'RA Team</span>
          </p>
          <div style="margin-top:32px;">
            <a href="${SITE_URL}/collection" style="display:inline-block;background:#b8924a;color:#0d0d0d;padding:14px 32px;font-size:10px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;">
              Explore Collection
            </a>
          </div>
        `)
      )

      // Mark as replied in DB
      if (enquiryId) {
        await supabase
          .from('enquiries')
          .update({
            status:     'replied',
            email_sent: true,
          })
          .eq('id', enquiryId)
      }

      return NextResponse.json({ ok: true })
    }

    // ── Marketing campaign ──
    if (type === 'marketing') {
      const { data: { user } } = await supabase.auth.getUser()
      const { subject, message, recipients } = body
      if (!subject || !message || !recipients?.length) {
        return NextResponse.json({ error: 'Missing subject, message or recipients' }, { status: 400 })
      }

      let sent = 0
      for (const email of recipients as string[]) {
        try {
          await sendEmail(
            email,
            subject,
            brandedEmail(`
              <div style="font-size:15px;line-height:1.9;color:rgba(245,240,232,0.85);">
                ${message.replace(/\n/g, '<br/>')}
              </div>
              <div style="margin-top:32px;">
                <a href="${SITE_URL}/collection" style="display:inline-block;background:#b8924a;color:#0d0d0d;padding:14px 32px;font-size:10px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;">
                  Explore Collection
                </a>
              </div>
              <p style="margin-top:24px;font-size:10px;color:rgba(245,240,232,0.2);">
                You are receiving this because you contacted IHE'RA or subscribed on our website.<br/>
                <a href="${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color:rgba(245,240,232,0.2);">Unsubscribe</a>
              </p>
            `)
          )
          sent++
        } catch (err) {
          console.error(`Failed to send to ${email}:`, err)
        }
      }

      await supabase.from('email_campaigns').insert({
        subject,
        message,
        recipient_count: sent,
        sent_at:         new Date().toISOString(),
        sent_by:         user?.id,
      })

      const mock = !RESEND_API_KEY
      return NextResponse.json({ ok: true, sent, mock })
    }

    return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('Email route error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}