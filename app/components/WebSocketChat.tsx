"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useWebSocket } from "../hooks/useWebSocket";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  Mic,
  Loader2,
  Send,
  LogOut,
  MessageSquare,
  RefreshCw,
  Smartphone,
  Wifi,
  Phone,
  MicOff,
} from "lucide-react";

const WebSocketChat = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [listening, setListening] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isGreeting, setIsGreeting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const {
    messages,
    connectionStatus,
    error,
    connect,
    sendMessage,
    isConnected,
  } = useWebSocket("ws://localhost:8000/ws");

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "pl-PL";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setListening(false);
        };

        recognition.onend = () => {
          setListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    connect();
  }, [connect]);

  // Cleanup media recorder on unmount
  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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

  const toggleListening = async () => {
    if (listening) {
      // Stop recording
      setListening(false);

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      return;
    }

    // Start recording
    setListening(true);

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Create MediaRecorder with 2-second chunks
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      // Handle audio chunks (every 2 seconds)
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const timestamp = Date.now();
          const formData = new FormData();
          formData.append("audio", event.data);
          formData.append("timestamp", timestamp.toString());

          try {
            // Step 1: Save the audio chunk
            const saveResponse = await fetch("/api/save-audio", {
              method: "POST",
              body: formData,
            });

            const saveData = await saveResponse.json();
            if (saveData.success) {
              console.log(`Saved audio chunk: ${saveData.filename}`);

              // Wait a moment to ensure file is fully written to disk
              await new Promise((resolve) => setTimeout(resolve, 150));

              // Step 2: Transcribe the saved audio chunk
              try {
                const transcriptionResponse = await fetch(
                  "/api/transcription",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      filename: saveData.filename,
                    }),
                  }
                );

                const transcriptionData = await transcriptionResponse.json();
                if (transcriptionData.success) {
                  console.log(
                    `Transcription: ${transcriptionData.transcription}`
                  );

                  // Step 3: Send the transcribed text to chat if connected
                  if (transcriptionData.transcription.trim() && isConnected) {
                    sendMessage(transcriptionData.transcription.trim());
                  }
                } else {
                  // Log error but don't stop recording - invalid chunks can happen
                  console.warn(
                    "Transcription failed (chunk may be invalid):",
                    transcriptionData.error
                  );
                }
              } catch (transcriptionError) {
                console.error(
                  "Error calling transcription API:",
                  transcriptionError
                );
              }
            } else {
              console.error("Failed to save audio chunk:", saveData.error);
            }
          } catch (error) {
            console.error("Error saving audio chunk:", error);
          }
        }
      };

      mediaRecorder.onstop = () => {
        console.log("Recording stopped");
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setListening(false);
      };

      // Start recording with 2-second chunks
      mediaRecorder.start(4000); // 2000ms = 2 seconds
      console.log("Recording started - saving 2-second chunks");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Nie udało się uzyskać dostępu do mikrofonu.");
      setListening(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pl-PL", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = () => {
    const statusConfig = {
      connected: {
        variant: "default" as const,
        text: "Połączono",
        color: "bg-green-600",
      },
      connecting: {
        variant: "secondary" as const,
        text: "Łączenie...",
        color: "bg-yellow-600",
      },
      error: {
        variant: "destructive" as const,
        text: "Błąd połączenia",
        color: "bg-red-600",
      },
      disconnected: {
        variant: "outline" as const,
        text: "Rozłączono",
        color: "bg-gray-600",
      },
    };

    const config = statusConfig[connectionStatus];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (
    connectionStatus === "connecting" ||
    connectionStatus === "disconnected"
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Łączenie z Wirtualnym Doradcą Play
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Przygotowujemy dla Ciebie spersonalizowane doświadczenie...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter out silent messages (greeting prompts)
  const aiMessages = messages.filter((m) => m.type === "received" && !m.silent);
  const userMessages = messages.filter((m) => m.type === "sent" && !m.silent);

  const getAssistantName = () => {
    return user?.avatar?.name || "Doradca Play";
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Play-branded Header */}
      <header className="sticky top-0 z-10 border-b bg-gradient-to-r from-purple-600 to-purple-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  Wirtualny Doradca Play
                </h1>
                <div className="flex items-center space-x-2">
                  {getStatusBadge()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user && (
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-white/10 backdrop-blur">
                <Avatar className="w-8 h-8">
                  <AvatarFallback
                    avatarId={user.avatar?.id}
                    className={
                      user.avatar?.bgColor || "bg-white text-purple-600"
                    }
                  >
                    {user.avatar?.emoji || user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-xs text-white/70">Rozmawiam z</p>
                  <p className="text-sm font-medium text-white">
                    {getAssistantName()}
                  </p>
                </div>
              </div>
            )}
            <Button onClick={logout} size="sm" variant="secondary">
              <LogOut className="w-4 h-4 mr-2" />
              Zakończ
            </Button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* AI Responses Panel */}
        <div className="w-1/2 flex flex-col border-r">
          <div className="px-6 py-4 border-b bg-purple-50 dark:bg-purple-950/20">
            <h2 className="text-sm font-semibold flex items-center text-purple-900 dark:text-purple-100">
              <MessageSquare className="w-4 h-4 mr-2 text-purple-600" />
              Odpowiedzi {getAssistantName()}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {aiMessages.length === 0 && isGreeting ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                </div>
                <h3 className="font-semibold mb-2">
                  Przygotowuję się do rozmowy...
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Za chwilę Cię przywitam!
                </p>
              </div>
            ) : aiMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">
                  Cześć! Jestem {getAssistantName()}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Zadaj mi pytanie o usługi Play, a postaram się jak najlepiej
                  Ci pomóc!
                </p>
              </div>
            ) : (
              aiMessages.map((message) => (
                <Card
                  key={message.id}
                  className="border-l-4 border-l-purple-600"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3 mb-2">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback
                          avatarId={user?.avatar?.id}
                          className={user?.avatar?.bgColor || "bg-purple-600"}
                        >
                          {user?.avatar?.emoji || "🎯"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-purple-600">
                            {getAssistantName()}
                          </p>
                          {message.isStreaming && (
                            <div className="flex items-center space-x-1">
                              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-pulse"></div>
                              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-pulse delay-75"></div>
                              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-pulse delay-150"></div>
                            </div>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                          {message.isStreaming && (
                            <span className="inline-block w-1 h-4 bg-purple-600 ml-0.5 animate-pulse"></span>
                          )}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      {formatTime(message.timestamp)}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* User Messages Panel */}
        <div className="w-1/2 flex flex-col">
          <div className="px-6 py-4 border-b bg-purple-50 dark:bg-purple-950/20">
            <h2 className="text-sm font-semibold flex items-center text-purple-900 dark:text-purple-100">
              <Send className="w-4 h-4 mr-2 text-purple-600" />
              Twoje Wiadomości
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {userMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                  <Send className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Czekam na Twoje pytanie</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  Wpisz pytanie poniżej lub użyj mikrofonu, aby podyktować
                  wiadomość
                </p>
                <div className="space-y-3 w-full max-w-md">
                  <p className="text-xs font-semibold text-purple-600">
                    Przykładowe pytania:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Phone, text: "Jakie mam abonamenty?" },
                      { icon: Wifi, text: "Oferta internetu" },
                      { icon: Smartphone, text: "Nowy telefon" },
                      { icon: MessageSquare, text: "Aktywuj kartę SIM" },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputMessage(item.text)}
                        className="flex items-center space-x-2 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800 transition-colors text-left"
                      >
                        <item.icon className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <span className="text-xs font-medium">{item.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              userMessages.map((message) => (
                <div key={message.id} className="flex justify-end w-full">
                  <Card className="bg-purple-600 text-white max-w-[90%]">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold opacity-70 mb-1">
                            Ty
                          </p>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-white text-purple-600">
                            {user?.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <p className="text-xs opacity-70 text-right">
                        {formatTime(message.timestamp)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="border-t bg-card">
            <div className="px-6 py-4">
              {listening && (
                <div className="mb-3 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-purple-900 dark:text-purple-100 font-medium">
                    Słucham... Mów teraz
                  </span>
                  <Loader2 className="w-4 h-4 text-purple-600 animate-spin ml-auto" />
                </div>
              )}
              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Zapytaj o abonamenty, usługi, telefony, internet..."
                    disabled={!isConnected || listening}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant={listening ? "default" : "outline"}
                    onClick={toggleListening}
                    disabled={!isConnected}
                    title={listening ? "Zatrzymaj nagrywanie" : "Wpisz głosem"}
                    className={
                      listening
                        ? "bg-red-600 hover:bg-red-700"
                        : "hover:bg-purple-50"
                    }
                  >
                    {listening ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isConnected || !inputMessage.trim() || listening}
                    className="px-6 bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Wyślij
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Enter - wyślij • Shift+Enter - nowa linia • Mikrofon -
                    dyktuj
                  </span>
                  {messages.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-purple-600 hover:text-purple-700"
                      onClick={() => window.location.reload()}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Nowa rozmowa
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-6 py-3 bg-destructive/10 border-t border-destructive/20">
          <p className="text-sm text-destructive">
            Błąd połączenia: {error} - Odśwież stronę lub skontaktuj się z
            pracownikiem salonu Play.
          </p>
        </div>
      )}
    </div>
  );
};

export default WebSocketChat;
