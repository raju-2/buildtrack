import React, { createContext, useContext, useState, useCallback } from 'react';
import { translations } from '../i18n/translations.js';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('buildtrack_language') || 'en');

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
    localStorage.setItem('buildtrack_language', lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    changeLanguage(language === 'en' ? 'te' : 'en');
  }, [language, changeLanguage]);

  /**
   * Translates a key into the current language. Falls back to English,
   * then to the raw key itself, so missing translations never crash the UI.
   */
  const t = useCallback(
    (key) => {
      return translations[language]?.[key] ?? translations.en[key] ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
