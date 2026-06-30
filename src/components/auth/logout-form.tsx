"use client";

import { signOut } from "next-auth/react";

/**
 * Logout form wrapper.
 * Calls signOut and redirects to home.
 * Wraps children (usually a button) in a form with hidden submit.
 */
export function LogoutForm({ children }: { children: React.ReactNode }) {
  const handleLogout = () => {
    signOut({ redirectTo: "/" });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleLogout();
      }}
    >
      <button
        type="submit"
        onClick={handleLogout}
        className="w-full"
        style={{ all: "unset", display: "block", cursor: "pointer" }}
      >
        {children}
      </button>
    </form>
  );
}
