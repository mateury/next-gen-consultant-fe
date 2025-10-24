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

interface Avatar {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
  textColor: string;
}

const getAvatars = (t: (key: string) => string): Avatar[] => [
  {
    id: "professional",
    name: t("avatar.professional"),
    emoji: "👔",
    bgColor: "bg-blue-600",
    textColor: "text-white",
  },
  {
    id: "creative",
    name: t("avatar.creative"),
    emoji: "🎨",
    bgColor: "bg-purple-600",
    textColor: "text-white",
  },
  {
    id: "friendly",
    name: t("avatar.friendly"),
    emoji: "😊",
    bgColor: "bg-green-600",
    textColor: "text-white",
  },
  {
    id: "tech",
    name: t("avatar.techSavvy"),
    emoji: "🤖",
    bgColor: "bg-orange-600",
    textColor: "text-white",
  },
];

const AvatarSelection = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const { user, updateUserAvatar } = useAuth();
  const { t } = useLanguage();

  const avatars = getAvatars(t);

  const handleAvatarSelect = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
  };

  const handleConfirm = () => {
    if (selectedAvatar && user) {
      setIsConfirming(true);

      // Simulate a brief loading state
      setTimeout(() => {
        updateUserAvatar(selectedAvatar);
        setIsConfirming(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <Card className="w-full">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl mb-2">
                {t("avatar.title")}
              </CardTitle>
              <CardDescription>
                {t("avatar.welcome")}, {user?.name}! {t("avatar.subtitle")}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {avatars.map((avatar) => (
                  <Button
                    key={avatar.id}
                    variant={
                      selectedAvatar?.id === avatar.id ? "default" : "outline"
                    }
                    onClick={() => handleAvatarSelect(avatar)}
                    className="p-6 h-auto flex-col space-y-3 hover:scale-105 transition-transform"
                  >
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${avatar.bgColor}`}
                    >
                      {avatar.emoji}
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium">{avatar.name}</h3>
                    </div>
                    {selectedAvatar?.id === avatar.id && (
                      <Badge variant="secondary" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>

              {selectedAvatar && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${selectedAvatar.bgColor}`}
                      >
                        {selectedAvatar.emoji}
                      </div>
                      <div>
                        <h4 className="font-medium">{selectedAvatar.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t("avatar.selectedPreview")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={handleConfirm}
                disabled={!selectedAvatar || isConfirming}
                className="w-full"
                size="lg"
              >
                {isConfirming ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>{t("avatar.settingUp")}</span>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{t("avatar.continue")}</span>
                  </div>
                )}
              </Button>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-sm">
                    {t("avatar.features")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• {t("avatar.feature1")}</li>
                    <li>• {t("avatar.feature2")}</li>
                    <li>• {t("avatar.feature3")}</li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Information Sidebar */}
        <div className="hidden lg:block">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Avatar Personalities</CardTitle>
                <CardDescription>
                  Each avatar represents a unique personality type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-lg">
                      👔
                    </div>
                    <div>
                      <h4 className="font-medium">Professional</h4>
                      <p className="text-xs text-muted-foreground">
                        Business-focused and formal communication style
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-lg">
                      🎨
                    </div>
                    <div>
                      <h4 className="font-medium">Creative</h4>
                      <p className="text-xs text-muted-foreground">
                        Artistic and innovative approach to conversations
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-lg">
                      😊
                    </div>
                    <div>
                      <h4 className="font-medium">Friendly</h4>
                      <p className="text-xs text-muted-foreground">
                        Warm and approachable communication
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-lg">
                      🤖
                    </div>
                    <div>
                      <h4 className="font-medium">Tech Savvy</h4>
                      <p className="text-xs text-muted-foreground">
                        Technical and modern communication style
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chat Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Real-time messaging</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Avatar customization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Multi-language support</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Secure WebSocket connection</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelection;
