"use client";

import { useLanguage, Language } from "../context/LanguageContext";

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle = ({ className = "" }: LanguageToggleProps) => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "pl" : "en");
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {t("common.language")}:
      </span>
      <button
        onClick={toggleLanguage}
        className="flex items-center space-x-1 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
        title={`${t("common.language")}: ${
          language === "en" ? t("common.english") : t("common.polish")
        }`}
      >
        <span className="text-lg">{language === "en" ? "🇺🇸" : "🇵🇱"}</span>
        <span className="text-gray-700 dark:text-gray-300">
          {language === "en" ? "EN" : "PL"}
        </span>
      </button>
    </div>
  );
};

export default LanguageToggle;
