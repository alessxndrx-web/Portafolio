"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { es } from "@/translations/es";
import { en } from "@/translations/en";

type Language = "es" | "en";
type Translations = typeof es;

const TranslationContext = createContext<{
  t: Translations;
  language: Language;
  setLanguage: (lang: Language) => void;
} | null>(null);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("language") as Language | null;
      if (saved === "es" || saved === "en") {
        setLanguageState(saved);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("language", lang);
    } catch (error) {
      console.error(error);
    }
  };

  const translations = language === "es" ? es : en;

  return (
    <TranslationContext.Provider value={{ t: translations, language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within TranslationProvider");
  }
  return context;
}
