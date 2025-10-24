"use client";

import { useLanguage } from "../context/LanguageContext";
import { Button } from "../../components/ui/button";

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle = ({ className = "" }: LanguageToggleProps) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    // Swap from right to left: PL -> EN, EN -> PL
    setLanguage(language === "pl" ? "en" : "pl");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className={`${className} min-w-[100px] transition-all duration-200 hover:scale-105`}
      title={`Switch to ${language === "pl" ? "English" : "Polski"}`}
    >
      <div className="flex items-center justify-center space-x-2">
        <span className="text-lg">{language === "pl" ? "🇵🇱" : "🇺🇸"}</span>
        <span className="font-medium">{language === "pl" ? "PL" : "EN"}</span>
        <span className="text-xs text-muted-foreground">→</span>
        <span className="text-lg">{language === "pl" ? "🇺🇸" : "🇵🇱"}</span>
        <span className="font-medium">{language === "pl" ? "EN" : "PL"}</span>
      </div>
    </Button>
  );
};

export default LanguageToggle;
