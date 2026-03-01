import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en.json';
import hi from '../locales/hi.json';

const LANGUAGE_KEY = 'exampilot_language';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

// Load saved language preference
AsyncStorage.getItem(LANGUAGE_KEY).then((lang) => {
  if (lang && (lang === 'en' || lang === 'hi')) {
    i18n.changeLanguage(lang);
  }
});

export async function setLanguage(lang: 'en' | 'hi') {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  await i18n.changeLanguage(lang);
}

export async function getLanguage(): Promise<string> {
  return (await AsyncStorage.getItem(LANGUAGE_KEY)) || 'en';
}

export default i18n;
