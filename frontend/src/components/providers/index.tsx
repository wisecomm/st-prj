"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { isDev } from "@/lib/env";
import { ToastProvider } from "@/hooks/use-toast";
import { SessionWatcher } from "./session-watcher";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <SessionWatcher />
        <ToastProvider>
          {children}
          {isDev && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </ToastProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
