import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import enTranslations from './en.json';
import zhTranslations from './zh.json';

export type Language = 'en' | 'zh';

export interface Translations {
  systemTitle: string;
  systemDescription: string;
  apiKeyPlaceholder: string;
  saveButton: string;
  generateButton: string;
  clearButton: string;
  shareButton: string;
  copyButton: string;
  settingsButton: string;
  apiKeySettings: string;
  languageSettings: string;
  englishLanguage: string;
  chineseLanguage: string;
  confirmButton: string;
  cancelButton: string;
  emotionAcceptance: string;
  positiveAffirmation: string;
  cognitiveRestructuring: string;
  mindfulnessExercise: string;
  problemSolvingApproach: string;
  finalRule: string;
}

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

const translations: Record<Language, Translations> = {
  en: enTranslations,
  zh: zhTranslations
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getBrowserLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'zh' ? 'zh' : 'en';
  };

  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language') as Language | null;
    return savedLang || getBrowserLanguage();
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: keyof Translations): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};