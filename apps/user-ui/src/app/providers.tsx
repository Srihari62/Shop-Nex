"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { WebSocketProvider } from "../context/web-socket-context";
import useUser from "../hooks/useUser";

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

  React.useEffect(() => {
    const fetchLocation = async () => {
      try {
        const stored = localStorage.getItem("user_location");
        if (stored) return;

        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        if (data.country_name && data.city) {
          localStorage.setItem(
            "user_location",
            JSON.stringify({
              country: data.country_name,
              city: data.city,
              region: data.region,
              timestamp: Date.now(),
            }),
          );
          window.dispatchEvent(new Event("storage_update"));
        }
      } catch (error) {
        console.error("Location fetch failed:", error);
      }
    };
    fetchLocation();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" reverseOrder={false} />
      <ProvidersWithWs>{children}</ProvidersWithWs>
    </QueryClientProvider>
  );
};

const ProvidersWithWs = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  return (
    <WebSocketProvider user={user}>
      {children}
    </WebSocketProvider>
  );
};


export default Providers;
