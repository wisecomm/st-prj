"use client";

import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
        >
          Sign Out
        </button>
      </div>

      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-medium">Welcome back!</h3>
        <p className="mt-1 text-muted-foreground">
          You are logged in as{" "}
          <span className="font-medium">{session?.user?.username}</span>
        </p>
      </div>
    </div>
  );
}
