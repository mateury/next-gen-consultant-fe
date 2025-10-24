"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "pl";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Translation keys and values
const translations = {
  en: {
    // QR Auth
    "auth.title": "Secure Authentication",
    "auth.subtitle":
      "Scan the QR code below to authenticate and access the chat",
    "auth.scanButton": "Scan QR Code",
    "auth.authenticating": "Authenticating...",
    "auth.clickToScan": "Click the button above to simulate QR code scanning",
    "auth.howItWorks": "How it works:",
    "auth.step1": 'Click "Scan QR Code" to simulate authentication',
    "auth.step2": "The system will verify your credentials",
    "auth.step3": "Once authenticated, you'll access the chat",
    "auth.qrCode": "QR Code:",

    // Avatar Selection
    "avatar.title": "Choose Your Avatar",
    "avatar.subtitle": "Select an avatar that represents you",
    "avatar.welcome": "Welcome",
    "avatar.professional": "Professional",
    "avatar.creative": "Creative",
    "avatar.friendly": "Friendly",
    "avatar.techSavvy": "Tech Savvy",
    "avatar.selectedPreview": "This will be your avatar in the chat",
    "avatar.continue": "Continue to Chat",
    "avatar.settingUp": "Setting up your profile...",
    "avatar.features": "Avatar Features:",
    "avatar.feature1": "Your avatar will appear next to your messages",
    "avatar.feature2": "Other users will see your chosen avatar",
    "avatar.feature3": "You can change it later in settings",

    // WebSocket Chat
    "chat.title": "WebSocket Chat",
    "chat.connected": "Connected",
    "chat.connecting": "Connecting...",
    "chat.disconnected": "Disconnected",
    "chat.connectionError": "Connection Error",
    "chat.connect": "Connect",
    "chat.disconnect": "Disconnect",
    "chat.clear": "Clear",
    "chat.logout": "Logout",
    "chat.error": "Error:",
    "chat.noMessages": "No messages yet",
    "chat.startTyping": "Start typing to send a message",
    "chat.connectToStart": "Connect to the WebSocket server to begin chatting",
    "chat.typeMessage": "Type your message...",
    "chat.connectToMessage": "Connect to start messaging",
    "chat.send": "Send",
    "chat.enterToSend": "Press Enter to send • Shift+Enter for new line",

    // Common
    "common.language": "Language",
    "common.english": "English",
    "common.polish": "Polski",
  },
  pl: {
    // QR Auth
    "auth.title": "Bezpieczne Uwierzytelnienie",
    "auth.subtitle":
      "Zeskanuj kod QR poniżej, aby się uwierzytelnić i uzyskać dostęp do czatu",
    "auth.scanButton": "Skanuj Kod QR",
    "auth.authenticating": "Uwierzytelnianie...",
    "auth.clickToScan":
      "Kliknij przycisk powyżej, aby zasymulować skanowanie kodu QR",
    "auth.howItWorks": "Jak to działa:",
    "auth.step1": 'Kliknij "Skanuj Kod QR", aby zasymulować uwierzytelnienie',
    "auth.step2": "System zweryfikuje Twoje dane uwierzytelniające",
    "auth.step3": "Po uwierzytelnieniu uzyskasz dostęp do czatu",
    "auth.qrCode": "Kod QR:",

    // Avatar Selection
    "avatar.title": "Wybierz Swój Awatar",
    "avatar.subtitle": "Wybierz awatar, który Cię reprezentuje",
    "avatar.welcome": "Witaj",
    "avatar.professional": "Profesjonalny",
    "avatar.creative": "Kreatywny",
    "avatar.friendly": "Przyjazny",
    "avatar.techSavvy": "Techniczny",
    "avatar.selectedPreview": "To będzie Twój awatar w czacie",
    "avatar.continue": "Przejdź do Czatu",
    "avatar.settingUp": "Konfigurowanie profilu...",
    "avatar.features": "Funkcje Awatara:",
    "avatar.feature1": "Twój awatar pojawi się obok Twoich wiadomości",
    "avatar.feature2": "Inni użytkownicy zobaczą wybrany przez Ciebie awatar",
    "avatar.feature3": "Możesz go zmienić później w ustawieniach",

    // WebSocket Chat
    "chat.title": "Czat WebSocket",
    "chat.connected": "Połączony",
    "chat.connecting": "Łączenie...",
    "chat.disconnected": "Rozłączony",
    "chat.connectionError": "Błąd Połączenia",
    "chat.connect": "Połącz",
    "chat.disconnect": "Rozłącz",
    "chat.clear": "Wyczyść",
    "chat.logout": "Wyloguj",
    "chat.error": "Błąd:",
    "chat.noMessages": "Brak wiadomości",
    "chat.startTyping": "Zacznij pisać, aby wysłać wiadomość",
    "chat.connectToStart":
      "Połącz się z serwerem WebSocket, aby rozpocząć czat",
    "chat.typeMessage": "Napisz swoją wiadomość...",
    "chat.connectToMessage": "Połącz się, aby rozpocząć wysyłanie wiadomości",
    "chat.send": "Wyślij",
    "chat.enterToSend":
      "Naciśnij Enter, aby wysłać • Shift+Enter dla nowej linii",

    // Common
    "common.language": "Język",
    "common.english": "English",
    "common.polish": "Polski",
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return (
      translations[language][
        key as keyof (typeof translations)[typeof language]
      ] || key
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
