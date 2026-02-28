import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      stravaId: number
      username: string
    } & DefaultSession['user']
  }
}
