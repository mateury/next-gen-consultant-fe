"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  QrCode,
  Loader2,
  Shield,
  Sparkles,
  ArrowRight,
  Smartphone,
} from "lucide-react";

const QRAuth = () => {
  const [isScanning, setIsScanning] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();

  const qrCodeData = "M_OBYWATEL_123 / MPLAY24_456";

  const handleQRScan = () => {
    setIsScanning(true);

    // Small delay before starting the authentication process
    setTimeout(() => {
      // Create WebSocket connection to authenticate user
      const ws = new WebSocket("ws://localhost:8000/ws");
      let hasResponded = false;
      let fullResponse = "";
      let isStreamingComplete = false;
      let messageCount = 0; // Track message count to skip first message (system prompt)

      ws.onopen = () => {
        console.log("✅ WebSocket connected for authentication");
        // Send authentication prompt to get user's name
        console.log("📤 Sending authentication request...");
        ws.send("Podaj moje imie i nazwisko, mój pesel to 90020298765");
      };

      ws.onmessage = (event) => {
        messageCount++;
        console.log(`📥 Received message #${messageCount}:`, event.data);

        // Skip the first 2 messages (system prompt and initial response)
        if (messageCount <= 2) {
          console.log(`⏭️ Skipping message #${messageCount}`);
          return;
        }

        hasResponded = true;
        try {
          let userName = event.data;

          // Try to parse JSON response and extract name
          try {
            const parsedData = JSON.parse(event.data);
            console.log("📊 Parsed data:", parsedData);

            // Handle streaming responses
            if (
              parsedData.type === "stream_start" ||
              parsedData.type === "stream_chunk"
            ) {
              console.log("🔄 Streaming chunk received:", parsedData.content);
              fullResponse += parsedData.content || "";
              return; // Wait for more chunks
            } else if (parsedData.type === "stream_end") {
              console.log("✅ Stream ended, final chunk:", parsedData.content);
              fullResponse += parsedData.content || "";
              userName = fullResponse;
              isStreamingComplete = true;
            } else {
              // Handle non-streaming responses
              console.log("📨 Non-streaming response received");
              if (parsedData.message) {
                userName = parsedData.message;
              } else if (parsedData.content) {
                userName = parsedData.content;
              } else if (parsedData.text) {
                userName = parsedData.text;
              }
              isStreamingComplete = true;
            }
          } catch (error) {
            // If not JSON, use raw response as name
            console.log("📝 Plain text response received");
            userName = event.data;
            isStreamingComplete = true;
          }

          // Only process if we have the complete response
          if (isStreamingComplete) {
            console.log("✅ Complete response received:", userName);

            // Extract name from "Imię i nazwisko: Jan Kowalski" format
            let extractedName = userName.trim();
            const nameMatch = userName.match(/Imię i nazwisko:\s*(.+)/i);
            if (nameMatch && nameMatch[1]) {
              extractedName = nameMatch[1].trim();
              console.log("📝 Extracted name from format:", extractedName);
            }

            // Parse first name and last name from the extracted name
            const nameParts = extractedName.split(" ");
            const firstName = nameParts[0] || "Play";
            const lastName = nameParts.slice(1).join(" ") || "Customer";

            console.log("👤 Parsed name:", { firstName, lastName });

            // Create user data with received name
            const userData = {
              id: "user_" + Date.now(),
              name: extractedName || "Play Customer", // Use extracted name without prefix
              firstName,
              lastName,
            };

            console.log("🔐 Logging in with user data:", userData);
            login(userData);
            setIsScanning(false);

            // Close connection after a small delay to ensure all messages are processed
            setTimeout(() => {
              console.log("🔌 Closing authentication WebSocket");
              ws.close();
            }, 100);
          }
        } catch (error) {
          console.error("❌ Error processing authentication response:", error);
          // Fallback authentication
          const userData = {
            id: "user_" + Date.now(),
            name: "Play Customer",
            firstName: "Play",
            lastName: "Customer",
          };
          login(userData);
          setIsScanning(false);
          setTimeout(() => ws.close(), 100);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket authentication error:", error);
        if (!hasResponded) {
          // Fallback authentication on error only if we haven't received a response
          const userData = {
            id: "user_" + Date.now(),
            name: "Play Customer",
            firstName: "Play",
            lastName: "Customer",
          };
          login(userData);
          setIsScanning(false);
        }
      };

      ws.onclose = (event) => {
        console.log(
          "🔌 WebSocket authentication connection closed:",
          event.code,
          event.reason
        );
      };

      // Timeout fallback in case WebSocket doesn't respond
      const timeoutId = setTimeout(() => {
        console.log("⏱️ Authentication timeout reached");
        if (!hasResponded) {
          console.log("⚠️ No response received, using fallback");
          if (
            ws.readyState === WebSocket.OPEN ||
            ws.readyState === WebSocket.CONNECTING
          ) {
            ws.close();
          }
          const userData = {
            id: "user_" + Date.now(),
            name: "Play Customer",
            firstName: "Play",
            lastName: "Customer",
          };
          login(userData);
          setIsScanning(false);
        }
      }, 15000); // 15 second timeout (increased from 10)

      // Clean up timeout if connection closes early
      ws.addEventListener("close", () => {
        clearTimeout(timeoutId);
      });
    }, 800); // 800ms delay before starting authentication
  };

  const QRCodePattern = () => {
    const getPatternClass = (index: number) => {
      const row = Math.floor(index / 12);
      const col = index % 12;
      return (row + col) % 3 === 0 || (row * col) % 7 === 0
        ? "bg-black"
        : "bg-white";
    };

    return (
      <div className="relative bg-white p-8 rounded-2xl shadow-2xl border-4 border-purple-200">
        <div className="w-72 h-72 bg-black relative overflow-hidden rounded-xl">
          <div className="absolute inset-0 grid grid-cols-12 gap-0">
            {Array.from({ length: 144 }, (_, i) => (
              <div key={i} className={getPatternClass(i)} />
            ))}
          </div>

          {/* Corner markers */}
          <div className="absolute top-2 left-2 w-12 h-12 bg-black">
            <div className="absolute top-1.5 left-1.5 w-9 h-9 bg-white">
              <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-black"></div>
            </div>
          </div>
          <div className="absolute top-2 right-2 w-12 h-12 bg-black">
            <div className="absolute top-1.5 right-1.5 w-9 h-9 bg-white">
              <div className="absolute top-1.5 right-1.5 w-6 h-6 bg-black"></div>
            </div>
          </div>
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-black">
            <div className="absolute bottom-1.5 left-1.5 w-9 h-9 bg-white">
              <div className="absolute bottom-1.5 left-1.5 w-6 h-6 bg-black"></div>
            </div>
          </div>

          {isScanning && (
            <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center backdrop-blur-sm">
              <div className="w-full h-2 bg-purple-600 animate-pulse shadow-lg"></div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-mono text-muted-foreground bg-muted px-4 py-2 rounded-lg inline-block">
            {qrCodeData}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-background relative">
      {/* Language Toggle in top-right corner */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageToggle />
      </div>

      {/* Centered Content */}
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="border-2 shadow-lg border-purple-100">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center justify-center text-center">
                <QrCode className="w-6 h-6 mr-3 text-purple-600" />
                Witaj w Play!
              </CardTitle>
              <CardDescription className="text-base text-center">
                Zeskanuj kod QR przy uyciu aplikacji Play24 lub mObywatel aby
                przejść do rozmowy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <QRCodePattern />
              </div>

              <Button
                onClick={handleQRScan}
                disabled={isScanning}
                className="w-full h-14 text-lg bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Łączenie z asystentem...
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5 mr-2" />
                    Rozpocznij w trybie demo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Tryb demo: Kliknij przycisk, aby przetestować asystenta bez
                skanowania
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QRAuth;
