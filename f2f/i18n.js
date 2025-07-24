// i18n.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ur from './locales/ur.json';

// Language detection logic
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const savedLang = await AsyncStorage.getItem('user-lang');
      if (savedLang) {
        callback(savedLang);
      } else {
        const bestGuess = Localization.locale.startsWith('ur') ? 'ur' : 'en';
        callback(bestGuess);
      }
    } catch (error) {
      console.log('Language detection error:', error);
      callback('en'); // fallback
    }
  },
  init: () => {},
  cacheUserLanguage: async (lang) => {
    try {
      await AsyncStorage.setItem('user-lang', lang);
    } catch (e) {
      console.log('Failed to cache language:', e);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      ur: { translation: ur },
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Important for React Native!
    },
  });

export default i18n;
