"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const WebSocketContext = createContext<any>(null);

export const WebSocketProvider = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) => {
  const [wsReady, setWsReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [unReadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user?.id) {
      setWsReady(false);
      return;
    }
    
    const ws = new WebSocket(
      process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI ||
        process.env.NEXT_PUBLIC_CHAATTING_WEBSOCKET_URI ||
        ""
    );
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(`user_${user.id}`);
      setWsReady(true);
    };

    ws.onmessage = (evnt) => {
      try {
        const data = JSON.parse(evnt.data);
        if (data.type === "UNSEEN_COUNT_UPDATE") {
          const { conversationId, count } = data.payload;
          setUnreadCounts((prev) => ({
            ...prev,
            [conversationId]: count,
          }));
        }
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
      }
    };

    ws.onclose = () => {
      setWsReady(false);
    };

    return () => {
      ws.close();
    };
  }, [user?.id]);

  const value = useMemo(() => ({
    ws: wsRef.current,
    unReadCounts,
    setUnreadCounts,
    wsReady
  }), [unReadCounts, wsReady]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};


export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
};

