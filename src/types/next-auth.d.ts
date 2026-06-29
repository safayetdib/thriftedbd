import type { DefaultSession } from "@auth/core/types";

export type AppRole = "admin" | "customer";

// next-auth v5 re-exports Session/User/JWT from @auth/core rather than
// declaring them locally, so the augmentation has to target @auth/core
// directly — augmenting "next-auth"/"next-auth/jwt" does not merge.
declare module "@auth/core/types" {
  interface User {
    role: AppRole;
  }

  interface Session {
    user: {
      id: string;
      role: AppRole;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
  }
}
