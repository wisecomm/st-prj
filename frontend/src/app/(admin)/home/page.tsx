"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-6">
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

      <div className="flex flex-1 items-center justify-center">
        <div className="grid w-full max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2">
          <button
            onClick={() => router.push("/menus")}
            className="flex flex-col items-center gap-4 rounded-xl border-2 border-primary/20 bg-card p-8 text-2xl font-semibold text-card-foreground shadow-sm transition-all hover:border-primary hover:bg-accent hover:text-accent-foreground"
          >
            🍽️ Menus
          </button>
          <button
            onClick={() => router.push("/orders")}
            className="flex flex-col items-center gap-4 rounded-xl border-2 border-primary/20 bg-card p-8 text-2xl font-semibold text-card-foreground shadow-sm transition-all hover:border-primary hover:bg-accent hover:text-accent-foreground"
          >
            📦 Orders
          </button>
        </div>
      </div>
    </div>
  );
}
