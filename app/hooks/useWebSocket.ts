"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  type: "sent" | "received";
}

export const useWebSocket = (url: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus("connecting");
    setError(null);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnectionStatus("connected");
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        const newMessage: Message = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          content: event.data,
          timestamp: new Date(),
          type: "received",
        };

        setMessages((prev) => [...prev, newMessage]);
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setConnectionStatus("disconnected");

        // Auto-reconnect logic
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const timeout = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, timeout);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("error");
        setError("Connection error occurred");
      };
    } catch (err) {
      console.error("Failed to create WebSocket connection:", err);
      setConnectionStatus("error");
      setError("Failed to create connection");
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnectionStatus("disconnected");
    reconnectAttempts.current = 0;
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && message.trim()) {
      wsRef.current.send(message);

      const newMessage: Message = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        content: message,
        timestamp: new Date(),
        type: "sent",
      };

      setMessages((prev) => [...prev, newMessage]);
      return true;
    }
    return false;
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    messages,
    connectionStatus,
    error,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
    isConnected: connectionStatus === "connected",
  };
};
