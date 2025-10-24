"use client";

import { useState, useRef, useEffect } from "react";
import { useWebSocket, Message } from "../hooks/useWebSocket";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";

const WebSocketChat = () => {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const {
    messages,
    connectionStatus,
    error,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
    isConnected,
  } = useWebSocket("ws://localhost:8000/ws");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && isConnected) {
      const success = sendMessage(inputMessage.trim());
      if (success) {
        setInputMessage("");
        inputRef.current?.focus();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-600";
      case "connecting":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return t("chat.connected");
      case "connecting":
        return t("chat.connecting");
      case "error":
        return t("chat.connectionError");
      default:
        return t("chat.disconnected");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("chat.title")}
          </h1>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "connecting"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            ></div>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          {user && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  user.avatar ? user.avatar.bgColor : "bg-blue-600"
                }`}
              >
                {user.avatar ? (
                  <span className="text-lg">{user.avatar.emoji}</span>
                ) : (
                  <span className="text-white font-medium text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span>
                {t("avatar.welcome")}, {user.name}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <LanguageToggle className="mr-2" />
          <Button
            onClick={connect}
            disabled={connectionStatus === "connecting" || isConnected}
            size="sm"
            variant="default"
          >
            {t("chat.connect")}
          </Button>
          <Button
            onClick={disconnect}
            disabled={!isConnected && connectionStatus !== "connecting"}
            size="sm"
            variant="destructive"
          >
            {t("chat.disconnect")}
          </Button>
          <Button onClick={clearMessages} size="sm" variant="outline">
            {t("chat.clear")}
          </Button>
          <Button onClick={logout} size="sm" variant="secondary">
            {t("chat.logout")}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400 dark:bg-red-900/20 dark:border-red-500">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">
                <strong>{t("chat.error")}</strong> {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            <p className="text-lg">{t("chat.noMessages")}</p>
            <p className="text-sm mt-2">
              {isConnected ? t("chat.startTyping") : t("chat.connectToStart")}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end space-x-2 ${
                message.type === "sent" ? "justify-end" : "justify-start"
              }`}
            >
              {message.type === "sent" && user?.avatar && (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${user.avatar.bgColor}`}
                >
                  <span className="text-sm">{user.avatar.emoji}</span>
                </div>
              )}
              <Card
                className={`max-w-xs lg:max-w-lg ${
                  message.type === "sent"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
              >
                <CardContent className="p-3">
                  <p className="text-sm wrap-break-word whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      message.type === "sent"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </CardContent>
              </Card>
              {message.type === "received" && (
                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center shrink-0">
                  <span className="text-sm">🤖</span>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <Input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isConnected ? t("chat.typeMessage") : t("chat.connectToMessage")
            }
            disabled={!isConnected}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!isConnected || !inputMessage.trim()}
            size="default"
          >
            {t("chat.send")}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          {t("chat.enterToSend")}
        </p>
      </div>
    </div>
  );
};

export default WebSocketChat;
