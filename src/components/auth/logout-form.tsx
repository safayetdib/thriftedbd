"use client";

import { signOut } from "next-auth/react";

/**
 * Logout form wrapper - the client boundary around a server-rendered
 * sign-out button. The child must be the submit button itself (pass
 * `type="submit"`); wrapping it in another <button> here would nest
 * buttons, which is invalid HTML and breaks hydration.
 */
export function LogoutForm({ children }: { children: React.ReactNode }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        signOut({ redirectTo: "/" });
      }}
    >
      {children}
    </form>
  );
}
