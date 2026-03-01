import NextAuth from 'next-auth'
import Strava from 'next-auth/providers/strava'
import { supabaseAdmin } from '@/lib/supabase'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Strava({
      clientId: process.env.STRAVA_CLIENT_ID!,
      clientSecret: process.env.STRAVA_CLIENT_SECRET!,
      authorization: {
        params: { scope: 'read,profile:read_all,activity:read_all' },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = profile as any

        // Upsert user into Supabase on every new login
        await supabaseAdmin.from('users').upsert(
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
        )

        token.stravaId = Number(p.id)
        token.username = p.username
        token.avatar = p.profile_medium || p.profile || null
        token.stravaAccessToken = account.access_token
        token.stravaRefreshToken = account.refresh_token
        token.stravaTokenExpiresAt = account.expires_at  // Unix seconds
      }

      // Refresh access token if it's expiring within 5 minutes
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
      session.user.stravaId = token.stravaId as number
      session.user.username = token.username as string
      session.user.image = (token.avatar as string) ?? session.user.image
      session.user.stravaAccessToken = token.stravaAccessToken as string
      return session
    },
  },

  pages: {
    signIn: '/login',
  },
})
