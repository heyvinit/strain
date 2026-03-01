import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'hello@getstrain.app'
const BASE_URL = 'https://getstrain.app'

// ─── Shared styles ─────────────────────────────────────────────────────────────

const styles = {
  body:    'margin:0;padding:0;background:#F8F8F7;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;',
  wrap:    'max-width:520px;margin:0 auto;padding:32px 20px 48px;',
  card:    'background:#fff;border-radius:20px;padding:32px;border:1px solid #F0F0EE;',
  label:   'font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#aaa;margin:0 0 4px;',
  h1:      'font-size:22px;font-weight:700;color:#111;margin:0 0 6px;',
  p:       'font-size:15px;color:#555;line-height:1.6;margin:0 0 20px;',
  cta:     'display:inline-block;background:#FC4C02;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:100px;',
  footer:  'text-align:center;font-size:12px;color:#bbb;margin-top:28px;',
  divider: 'border:none;border-top:1px solid #F0F0EE;margin:24px 0;',
  stat:    'display:inline-block;background:#F8F8F7;border-radius:12px;padding:10px 16px;margin:0 6px 8px 0;',
  statLbl: 'font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#aaa;display:block;margin-bottom:2px;',
  statVal: 'font-size:18px;font-weight:700;color:#111;',
}

function base(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="${styles.body}">
<div style="${styles.wrap}">
  <div style="text-align:center;margin-bottom:24px;">
    <span style="font-size:13px;font-weight:700;letter-spacing:0.12em;color:#FC4C02;text-transform:uppercase;">STRAIN</span>
  </div>
  <div style="${styles.card}">
    ${content}
  </div>
  <p style="${styles.footer}">
    Strain · <a href="${BASE_URL}" style="color:#bbb;">getstrain.app</a><br/>
    You're receiving this because you have a race logged on Strain.
  </p>
</div>
</body></html>`
}

// ─── Pre-race email (2 days before) ───────────────────────────────────────────

export async function sendPreRaceEmail({
  to, name, raceName, raceDate, distance, sport, raceId,
}: {
  to: string
  name: string
  raceName: string
  raceDate: string
  distance: string
  sport: string
  raceId: string
}) {
  const firstName = name.split(' ')[0]
  const formattedDate = new Date(raceDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  const html = base(`
    <p style="${styles.label}">Race day in 2 days</p>
    <h1 style="${styles.h1}">You've got this, ${firstName}. 🔥</h1>
    <hr style="${styles.divider}"/>
    <p style="${styles.p}">
      <strong style="color:#111;">${raceName}</strong> is on <strong style="color:#111;">${formattedDate}</strong>.
      Time to rest up, fuel well, and trust your training.
    </p>
    <div style="margin-bottom:24px;">
      <span style="${styles.stat}">
        <span style="${styles.statLbl}">Event</span>
        <span style="${styles.statVal}">${sport.charAt(0).toUpperCase() + sport.slice(1)}</span>
      </span>
      <span style="${styles.stat}">
        <span style="${styles.statLbl}">Distance</span>
        <span style="${styles.statVal}">${distance}</span>
      </span>
    </div>
    <a href="${BASE_URL}/dashboard/races/${raceId}" style="${styles.cta}">View race details</a>
  `)

  await resend.emails.send({
    from: FROM,
    to,
    subject: `2 days to go — ${raceName} 🏁`,
    html,
  })
}

// ─── Post-race email (1 day after) ────────────────────────────────────────────

export async function sendPostRaceEmail({
  to, name, raceName, raceDate, distance, sport,
}: {
  to: string
  name: string
  raceName: string
  raceDate: string
  distance: string
  sport: string
}) {
  const firstName = name.split(' ')[0]
  const formattedDate = new Date(raceDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  const html = base(`
    <p style="${styles.label}">How did it go?</p>
    <h1 style="${styles.h1}">Add your ${raceName} result 🎉</h1>
    <hr style="${styles.divider}"/>
    <p style="${styles.p}">
      Your race on <strong style="color:#111;">${formattedDate}</strong> has passed.
      Log your result to keep your passport up to date — and let the world know how you did.
    </p>
    <div style="margin-bottom:24px;">
      <span style="${styles.stat}">
        <span style="${styles.statLbl}">Event</span>
        <span style="${styles.statVal}">${sport.charAt(0).toUpperCase() + sport.slice(1)}</span>
      </span>
      <span style="${styles.stat}">
        <span style="${styles.statLbl}">Distance</span>
        <span style="${styles.statVal}">${distance}</span>
      </span>
    </div>
    <a href="${BASE_URL}/dashboard/add" style="${styles.cta}">Add your result</a>
  `)

  await resend.emails.send({
    from: FROM,
    to,
    subject: `How did ${raceName} go? Add your result 🏅`,
    html,
  })
}
