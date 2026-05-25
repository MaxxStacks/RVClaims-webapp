import { useState, useEffect, createContext, useContext } from "react";
import { Language, translations } from "@/lib/i18n";
import { portalTranslations } from "@/i18n/portal";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Resolve a dot-path key in an object, returning the string or undefined
function resolve(obj: any, keys: string[]): string | undefined {
  let v = obj;
  for (const k of keys) {
    v = v?.[k];
    if (v === undefined) return undefined;
  }
  return typeof v === 'string' ? v : undefined;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>(() => {
    // ds360-lang is the canonical key used across all portal layouts
    const saved = localStorage.getItem('ds360-lang') || localStorage.getItem('preferred-language');
    if (saved === 'fr' || saved === 'en') return saved as Language;

    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    return browserLang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  });

  const t = (key: string): string => {
    const keys = key.split('.');

    // 1. Check portal translations first
    const portalResult = resolve((portalTranslations as any)[language], keys);
    if (portalResult !== undefined) return portalResult;

    // 2. Fall back to marketing/base translations
    const baseResult = resolve((translations as any)[language], keys);
    if (baseResult !== undefined) return baseResult;

    // 3. Return the key itself as a last resort (no crashes)
    return key;
  };

  const setLanguage = (lang: Language) => {
    setLang(lang);
    localStorage.setItem('ds360-lang', lang);
    localStorage.setItem('preferred-language', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Alias for page components
export const useTranslation = useLanguage;
