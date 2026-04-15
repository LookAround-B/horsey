import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        // Store Google tokens on first sign-in
        token.googleIdToken = account.id_token
        token.googleAccessToken = account.access_token
        token.googleEmail = profile?.email
        token.googleName = profile?.name
        token.googleImage = (profile as any)?.picture
      }
      return token
    },
    async session({ session, token }) {
      // Expose Google tokens to client for API exchange
      ;(session as any).googleIdToken = token.googleIdToken
      ;(session as any).googleEmail = token.googleEmail
      ;(session as any).googleName = token.googleName
      ;(session as any).googleImage = token.googleImage
      return session
    },
    async signIn({ account, profile }) {
      // Only allow verified Google accounts
      if (account?.provider === "google") {
        return !!(profile?.email)
      }
      return true
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "horsey-nextauth-secret-dev",
}
