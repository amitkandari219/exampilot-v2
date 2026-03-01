import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setLanguage, getLanguage } from '../lib/i18n';

export function useLanguage() {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  useEffect(() => {
    getLanguage().then(setCurrentLanguage);
  }, []);

  const toggleLanguage = useCallback(async () => {
    const newLang = currentLanguage === 'en' ? 'hi' : 'en';
    await setLanguage(newLang as 'en' | 'hi');
    setCurrentLanguage(newLang);
  }, [currentLanguage]);

  const changeLanguage = useCallback(async (lang: 'en' | 'hi') => {
    await setLanguage(lang);
    setCurrentLanguage(lang);
  }, []);

  return { currentLanguage, toggleLanguage, changeLanguage, t };
}
