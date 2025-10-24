"use client";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import WebSocketChat from "./components/WebSocketChat";
import QRAuth from "./components/QRAuth";
import AvatarSelection from "./components/AvatarSelection";

function AppContent() {
  const { isAuthenticated, isAvatarSelected } = useAuth();

  const renderCurrentStep = () => {
    if (!isAuthenticated) {
      return <QRAuth />;
    }

    if (isAuthenticated && !isAvatarSelected) {
      return <AvatarSelection />;
    }

    return <WebSocketChat />;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {renderCurrentStep()}
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
