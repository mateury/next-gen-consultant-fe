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
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  Check,
  Loader2,
  User,
  Sparkles,
  ArrowRight,
  Shield,
  Smartphone,
} from "lucide-react";

interface AvatarType {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
  textColor: string;
  description: string;
  traits: string[];
}

const getAvatars = (t: (key: string) => string): AvatarType[] => [
  {
    id: "professional",
    name: "Ekspert Techniczny",
    emoji: "👔",
    bgColor: "bg-purple-600",
    textColor: "text-white",
    description: "Szczegółowe informacje techniczne i profesjonalne doradztwo",
    traits: [
      "Formalny i precyzyjny",
      "Dane techniczne",
      "Porównania specyfikacji",
    ],
  },
  {
    id: "creative",
    name: "Doradca Lifestyle",
    emoji: "🎨",
    bgColor: "bg-pink-600",
    textColor: "text-white",
    description: "Kreatywne pomysły i najnowsze trendy w mobilności",
    traits: ["Kreatywny i inspirujący", "Najnowsze trendy", "Stylowe zestawy"],
  },
  {
    id: "friendly",
    name: "Przyjazny Doradca",
    emoji: "😊",
    bgColor: "bg-green-600",
    textColor: "text-white",
    description: "Ciepła, swobodna rozmowa jak z przyjacielem",
    traits: ["Swobodny i przyjazny", "Bez żargonu", "Rozumie potrzeby"],
  },
  {
    id: "tech",
    name: "Smart Navigator",
    emoji: "🤖",
    bgColor: "bg-blue-600",
    textColor: "text-white",
    description: "Szybkie odpowiedzi i inteligentne porównania ofert",
    traits: ["Szybki i efektywny", "Funkcje smart", "Analiza danych"],
  },
];

const AvatarSelection = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const { user, updateUserAvatar } = useAuth();
  const { t } = useLanguage();

  const avatars = getAvatars(t);

  const handleAvatarSelect = (avatar: AvatarType) => {
    setSelectedAvatar(avatar);
  };

  const handleConfirm = () => {
    if (selectedAvatar && user) {
      setIsConfirming(true);

      setTimeout(() => {
        updateUserAvatar(selectedAvatar);
        setIsConfirming(false);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Modern Header */}
      <header className="sticky top-0 z-10 border-b bg-gradient-to-r from-purple-600 to-purple-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  Wybierz swojego wirtualnego doradcę Play
                </h1>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-purple-500 text-white border-none"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Krok 2 z 3
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user && (
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-purple-500/50">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-white text-purple-600">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline text-white">
                  {user.name}
                </span>
              </div>
            )}
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Avatar Selection */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-2 shadow-lg border-purple-100">
                <CardHeader>
                  <CardTitle className="text-2xl text-purple-700">
                    Witaj, {user?.name}!
                  </CardTitle>
                  <CardDescription className="text-base">
                    Wybierz osobowość asystenta, która najlepiej pasuje do
                    Twojego stylu. Każdy oferuje ekspercką pomoc w unikalny
                    sposób.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {avatars.map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() => handleAvatarSelect(avatar)}
                        className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedAvatar?.id === avatar.id
                            ? "border-purple-600 bg-purple-50 dark:bg-purple-950/20 shadow-lg scale-[1.02]"
                            : "border-border hover:border-purple-400 hover:bg-muted/50"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div
                              className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${avatar.bgColor} shadow-md`}
                            >
                              {avatar.emoji}
                            </div>
                            {selectedAvatar?.id === avatar.id && (
                              <Badge className="bg-purple-600">
                                <Check className="w-3 h-3 mr-1" />
                                Wybrano
                              </Badge>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-1">
                              {avatar.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {avatar.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {avatar.traits.map((trait, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {trait}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedAvatar && (
                    <Card className="border-l-4 border-l-purple-600 bg-purple-50 dark:bg-purple-950/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${selectedAvatar.bgColor} shadow-md flex-shrink-0`}
                            >
                              {selectedAvatar.emoji}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">
                                Wybrałeś: {selectedAvatar.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedAvatar.description}
                              </p>
                            </div>
                          </div>
                          <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    onClick={handleConfirm}
                    disabled={!selectedAvatar || isConfirming}
                    className="w-full h-14 text-lg bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {isConfirming ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Przygotowujemy asystenta...
                      </>
                    ) : (
                      <>
                        Rozpocznij rozmowę z{" "}
                        {selectedAvatar?.name || "asystentem"}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Information */}
            <div className="space-y-6">
              <Card className="border-2 shadow-lg border-purple-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-purple-700">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                    Osobowości asystentów
                  </CardTitle>
                  <CardDescription>
                    Każdy asystent oferuje unikalną ekspercką wiedzę
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${avatar.bgColor} flex-shrink-0`}
                      >
                        {avatar.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{avatar.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {avatar.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-600 bg-purple-50 dark:bg-purple-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center text-purple-700">
                    <Smartphone className="w-4 h-4 mr-2 text-purple-600" />
                    Co może zrobić Twój asystent Play
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>
                        Odpowiedzieć na pytania o oferty, urządzenia i usługi
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>
                        Pomóc wybrać najlepszy abonament dla Twoich potrzeb
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>Porównać telefony i akcesoria dostępne w Play</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>
                        Sprawdzić promocje i pomóc zamówić nowe usługi
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1 text-green-900 dark:text-green-100">
                        Możesz zmienić w każdej chwili
                      </h4>
                      <p className="text-xs text-green-800 dark:text-green-200">
                        Nie jesteś zadowolony z wyboru? Możesz przełączyć się na
                        innego asystenta w każdej chwili podczas sesji.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelection;
