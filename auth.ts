import NextAuth from 'next-auth'
import Strava from 'next-auth/providers/strava'
import { supabaseAdmin } from '@/lib/supabase'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Strava({
      clientId: process.env.STRAVA_CLIENT_ID!,
      clientSecret: process.env.STRAVA_CLIENT_SECRET!,
      authorization: {
        params: { scope: 'read,profile:read_all' },
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
