"use client";

import { useLanguage } from "../context/LanguageContext";
import { Button } from "../../components/ui/button";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle = ({ className = "" }: LanguageToggleProps) => {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`${className} min-w-[120px]`}
        >
          <div className="flex items-center justify-center w-full">
            <Languages className="w-4 h-4 mr-2" />
            <span className="text-lg mr-2">
              {language === "en" ? "🇺🇸" : "🇵🇱"}
            </span>
            <span className="font-medium">
              {language === "en" ? "EN" : "PL"}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className={`cursor-pointer ${language === "en" ? "bg-muted" : ""}`}
        >
          <div className="flex items-center w-full">
            <span className="text-lg mr-3">🇺🇸</span>
            <span className="font-medium">English</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("pl")}
          className={`cursor-pointer ${language === "pl" ? "bg-muted" : ""}`}
        >
          <div className="flex items-center w-full">
            <span className="text-lg mr-3">🇵🇱</span>
            <span className="font-medium">Polski</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
