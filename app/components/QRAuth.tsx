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

  const qrCodeData = "PLAY_AUTH_TOKEN_123456789";

  const handleQRScan = () => {
    setIsScanning(true);

    setTimeout(() => {
      const userData = {
        id: "user_" + Date.now(),
        name: "Play Customer",
      };

      login(userData);
      setIsScanning(false);
    }, 2000);
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
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Modern Header */}
      <header className="sticky top-0 z-10 border-b bg-gradient-to-r from-purple-600 to-purple-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  Play Virtual Assistant
                </h1>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-purple-500 text-white border-none"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Step 1 of 3
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column - QR Code & Action */}
            <div className="space-y-6">
              <Card className="border-2 shadow-lg border-purple-100">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <QrCode className="w-6 h-6 mr-3 text-purple-600" />
                    Witaj w Play!
                  </CardTitle>
                  <CardDescription className="text-base">
                    Zeskanuj kod QR swoim smartfonem, aby połączyć się z
                    wirtualnym doradcą Play i odkryć najlepsze oferty telefonii
                    komórkowej
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <QRCodePattern />
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 text-center border border-purple-200">
                    <p className="text-sm font-medium mb-2">
                      📱 Otwórz aparat w telefonie i skieruj na kod QR
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bez pobierania aplikacji • Działa na każdym smartfonie
                    </p>
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

              {/* Security Notice */}
              <Card className="border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1 text-green-900 dark:text-green-100">
                        Twoja prywatność jest chroniona
                      </h4>
                      <p className="text-xs text-green-800 dark:text-green-200">
                        Wszystkie rozmowy są szyfrowane i automatycznie usuwane
                        po zakończeniu sesji. Nigdy nie przechowujemy danych
                        osobowych.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - How it Works */}
            <div className="space-y-6">
              <Card className="border-2 shadow-lg border-purple-100">
                <CardHeader>
                  <CardTitle className="text-xl text-purple-700">
                    Jak działa wirtualny asystent Play
                  </CardTitle>
                  <CardDescription>
                    Trzy proste kroki do spersonalizowanej obsługi
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">
                        Skanuj i połącz się
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Po prostu zeskanuj kod QR aparatem swojego telefonu. Nie
                        musisz instalować żadnej aplikacji - działa natychmiast.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">
                        Wybierz styl doradcy
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Wybierz osobowość AI, która odpowiada Twoim preferencjom
                        - od profesjonalnego doradcy po przyjaznego pomocnika.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">
                        Otrzymaj spersonalizowane porady
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Zadawaj pytania, otrzymuj sugestie dotyczące ofert,
                        sprawdzaj dostępność i otrzymuj porady ekspertów.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="border-2 shadow-lg border-purple-100">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center text-purple-700">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                    Co możesz zrobić z asystentem Play
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Sprawdzić oferty abonamentów i taryf prepaid",
                      "Zamówić nową usługę lub zmienić obecny plan",
                      "Porównać modele telefonów i akcesoriów",
                      "Sprawdzić dostępność urządzeń w sklepie",
                      "Dowiedzieć się o promocjach i ofertach specjalnych",
                      "Uzyskać pomoc techniczną i rozwiązać problemy",
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <ArrowRight className="w-3 h-3 text-purple-600" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRAuth;
