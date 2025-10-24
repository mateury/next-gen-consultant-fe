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

const QRAuth = () => {
  const [isScanning, setIsScanning] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();

  // Fake QR code data - in a real app, this would be generated dynamically
  const qrCodeData = "AUTH_TOKEN_123456789";

  const handleQRScan = () => {
    setIsScanning(true);

    // Simulate scanning delay
    setTimeout(() => {
      // Simulate successful authentication
      const userData = {
        id: "user_" + Date.now(),
        name: "John Doe",
      };

      login(userData);
      setIsScanning(false);
    }, 2000);
  };

  // Simple QR code pattern using CSS with deterministic pattern
  const QRCodePattern = () => {
    // Create a deterministic pattern based on index to avoid hydration mismatch
    const getPatternClass = (index: number) => {
      // Use a simple deterministic algorithm based on index
      const row = Math.floor(index / 12);
      const col = index % 12;
      // Create a pattern that looks QR-code-like but is deterministic
      return (row + col) % 3 === 0 || (row * col) % 7 === 0
        ? "bg-black"
        : "bg-white";
    };

    return (
      <div className="relative bg-white p-4 rounded-lg shadow-lg">
        <div className="w-48 h-48 bg-black relative overflow-hidden">
          {/* QR Code pattern simulation */}
          <div className="absolute inset-0 grid grid-cols-12 gap-0">
            {Array.from({ length: 144 }, (_, i) => (
              <div key={i} className={getPatternClass(i)} />
            ))}
          </div>

          {/* Corner squares (typical QR code markers) */}
          <div className="absolute top-1 left-1 w-8 h-8 bg-black">
            <div className="absolute top-1 left-1 w-6 h-6 bg-white">
              <div className="absolute top-1 left-1 w-4 h-4 bg-black"></div>
            </div>
          </div>
          <div className="absolute top-1 right-1 w-8 h-8 bg-black">
            <div className="absolute top-1 right-1 w-6 h-6 bg-white">
              <div className="absolute top-1 right-1 w-4 h-4 bg-black"></div>
            </div>
          </div>
          <div className="absolute bottom-1 left-1 w-8 h-8 bg-black">
            <div className="absolute bottom-1 left-1 w-6 h-6 bg-white">
              <div className="absolute bottom-1 left-1 w-4 h-4 bg-black"></div>
            </div>
          </div>

          {/* Scanning animation overlay */}
          {isScanning && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
              <div className="w-full h-1 bg-blue-500 animate-pulse"></div>
            </div>
          )}
        </div>

        <div className="mt-2 text-center text-xs text-gray-600">
          {t("auth.qrCode")} {qrCodeData}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-end mb-4">
                <LanguageToggle />
              </div>
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl mb-2">{t("auth.title")}</CardTitle>
              <CardDescription>{t("auth.subtitle")}</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center space-y-6">
              <QRCodePattern />

              <div className="w-full space-y-4">
                <Button
                  onClick={handleQRScan}
                  disabled={isScanning}
                  className="w-full"
                  size="lg"
                >
                  {isScanning ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>{t("auth.authenticating")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        />
                      </svg>
                      <span>{t("auth.scanButton")}</span>
                    </div>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {t("auth.clickToScan")}
                </p>
              </div>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-sm">
                    {t("auth.howItWorks")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• {t("auth.step1")}</li>
                    <li>• {t("auth.step2")}</li>
                    <li>• {t("auth.step3")}</li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Information Panel */}
        <div className="hidden lg:block">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">{t("auth.title")}</CardTitle>
              <CardDescription className="text-base">
                Welcome to our secure WebSocket chat application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Secure Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                      QR code-based authentication ensures secure access to your
                      chat sessions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Real-time Communication</h3>
                    <p className="text-sm text-muted-foreground">
                      Experience instant messaging with WebSocket technology for
                      seamless conversations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Personalized Experience</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose your avatar and customize your chat experience to
                      match your personality.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Supported Languages</h4>
                <div className="flex space-x-2">
                  <Badge variant="secondary">🇺🇸 English</Badge>
                  <Badge variant="secondary">🇵🇱 Polski</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QRAuth;
