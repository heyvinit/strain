import NextAuth from 'next-auth'
import Strava from 'next-auth/providers/strava'
import Google from 'next-auth/providers/google'
import { supabaseAdmin } from '@/lib/supabase'

// Generate a unique username from Google display name / email
async function generateUsername(name: string, email: string): Promise<string> {
  let base = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)
  if (base.length < 3) base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)
  if (base.length < 3) base = 'athlete'

  const { data } = await supabaseAdmin.from('users').select('id').eq('username', base).maybeSingle()
  if (!data) return base

  for (let i = 1; i <= 99; i++) {
    const candidate = `${base}${i}`
    const { data: exists } = await supabaseAdmin.from('users').select('id').eq('username', candidate).maybeSingle()
    if (!exists) return candidate
  }
  return `${base}${Date.now().toString().slice(-6)}`
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Strava({
      clientId: process.env.STRAVA_CLIENT_ID!,
      clientSecret: process.env.STRAVA_CLIENT_SECRET!,
      authorization: {
        params: { scope: 'read,profile:read_all,activity:read_all' },
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = profile as any

        if (account.provider === 'strava') {
          const { data: user } = await supabaseAdmin.from('users').upsert(
            {
              strava_id: Number(p.id),
              username: p.username,
              name: [p.firstname, p.lastname].filter(Boolean).join(' ') || p.username,
              avatar_url: p.profile_medium || p.profile || null,
              city: p.city || null,
              country: p.country || null,
              email: p.email || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'strava_id' }
          ).select('id, username').single()

          token.userId = user?.id
          token.stravaId = Number(p.id)
          token.username = p.username
          token.avatar = p.profile_medium || p.profile || null
          token.stravaAccessToken = account.access_token
          token.stravaRefreshToken = account.refresh_token
          token.stravaTokenExpiresAt = account.expires_at
        }

        if (account.provider === 'google') {
          const { data: existing } = await supabaseAdmin
            .from('users').select('id, username').eq('google_id', p.sub).maybeSingle()

          if (existing) {
            await supabaseAdmin.from('users').update({
              name: p.name || null,
              avatar_url: p.picture || null,
              email: p.email || null,
              updated_at: new Date().toISOString(),
            }).eq('id', existing.id)

            token.userId = existing.id
            token.username = existing.username
          } else {
            const username = await generateUsername(p.name || '', p.email || '')
            const { data: newUser } = await supabaseAdmin.from('users').insert({
              google_id: p.sub,
              username,
              name: p.name || null,
              avatar_url: p.picture || null,
              email: p.email || null,
              updated_at: new Date().toISOString(),
            }).select('id, username').single()

            token.userId = newUser?.id
            token.username = username
          }

          token.avatar = p.picture || null
        }
      }

      // Refresh Strava access token if expiring within 5 minutes
      const expiresAt = token.stravaTokenExpiresAt as number | undefined
      if (expiresAt && Date.now() / 1000 > expiresAt - 300) {
        try {
          const res = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: process.env.STRAVA_CLIENT_ID,
              client_secret: process.env.STRAVA_CLIENT_SECRET,
              grant_type: 'refresh_token',
              refresh_token: token.stravaRefreshToken,
            }),
          })
          if (res.ok) {
            const refreshed = await res.json()
            token.stravaAccessToken = refreshed.access_token
            token.stravaRefreshToken = refreshed.refresh_token
            token.stravaTokenExpiresAt = refreshed.expires_at
          }
        } catch { /* keep existing token */ }
      }

      return token
    },

    async session({ session, token }) {
      session.user.userId = token.userId as string
      session.user.stravaId = token.stravaId as number | undefined
      session.user.username = token.username as string
      session.user.image = (token.avatar as string) ?? session.user.image
      session.user.stravaAccessToken = token.stravaAccessToken as string | undefined
      return session
    },
  },

  pages: {
    signIn: '/login',
  },
})
