import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe subset of the auth config: no providers, so no mongoose/model
 * imports reach anything that pulls this in. src/proxy.ts (Next middleware,
 * which always runs on the Edge runtime) builds its own NextAuth instance
 * from this file - it only needs to decode/verify the JWT, never touch the
 * DB. src/lib/auth.ts spreads this and adds the two Credentials providers
 * for use everywhere else (Node.js runtime: route handlers, server actions,
 * server components).
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
};
