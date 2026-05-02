"use client";

import { useAuthActions } from "@convex-dev/auth/react";

export function SignOutButton() {
  const { signOut } = useAuthActions();
  return (
    <button
      onClick={() => void signOut()}
      className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    >
      Sign out
    </button>
  );
}
