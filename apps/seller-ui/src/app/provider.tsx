"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { WebSocketProvider } from "@/context/web-socket-context";
import useSeller from "@/hooks/useSeller";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" reverseOrder={false} />
      <ProvidersWithWs>{children}</ProvidersWithWs>
    </QueryClientProvider>
  );
};

const ProvidersWithWs = ({ children }: { children: React.ReactNode }) => {
  const { seller } = useSeller();
  return (
    <WebSocketProvider user={seller}>
      {children}
    </WebSocketProvider>
  );
};

export default Providers;
