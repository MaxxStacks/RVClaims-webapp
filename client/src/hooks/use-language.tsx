import { useState, useEffect, createContext, useContext } from "react";
import { Language, translations } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Check if user has manually set a language preference
    const saved = localStorage.getItem('preferred-language');
    if (saved) {
      return saved as Language;
    }
    
    // Auto-detect browser language for Canadian market
    const detectBrowserLanguage = (): Language => {
      const browserLang = navigator.language || navigator.languages?.[0] || 'en';
      const langCode = browserLang.toLowerCase();
      
      // Check for French language variants (fr, fr-CA, fr-FR, etc.)
      if (langCode.startsWith('fr')) {
        return 'fr';
      }
      
      // Default to English for all other languages
      return 'en';
    };
    
    return detectBrowserLanguage();
  });

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const updateLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('preferred-language', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, t }}>
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
