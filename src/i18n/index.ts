import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from '../locales/en.json';
import bo from '../locales/bo.json';

// The translations
const resources = {
  en: {
    translation: en
  },
  bo: {
    translation: bo
  }
};

// Simple language detection function
const detectLanguage = (): string => {
  // Check localStorage first
  const savedLanguage = localStorage.getItem('i18nextLng');
  if (savedLanguage && ['en', 'bo'].includes(savedLanguage)) {
    return savedLanguage;
  }

  // Check browser language
  const browserLanguage = navigator.language || navigator.languages?.[0];
  if (browserLanguage) {
    // Extract language code (e.g., 'en-US' -> 'en')
    const langCode = browserLanguage.split('-')[0];
    if (['en', 'bo'].includes(langCode)) {
      return langCode;
    }
  }

  // Default to English
  return 'en';
};

// Detect the initial language
const initialLanguage = detectLanguage();

i18n
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    
    // Language to use if translations in user language are not available
    fallbackLng: 'en',
    
    // Default language
    lng: initialLanguage,
    
    // Debug mode for development
    debug: process.env.NODE_ENV === 'development',
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    // Available languages
    supportedLngs: ['en', 'bo'],
    
    // Don't load a fallback
    load: 'languageOnly',
    
    // Tell i18next we have bundled languages and don't need backend
    initImmediate: false,
    partialBundledLanguages: true,
    
    // Explicitly disable backend loading
    backend: false,
    
    // Don't try to load missing resources
    saveMissing: false,
    saveMissingTo: 'fallback',
    
    // Don't update missing resources
    updateMissing: false,
    
    // Cleanup
    cleanCode: true,
    
    // React specific options
    react: {
      // Use React Suspense for loading translations
      useSuspense: false,
      
      // Bind i18n instance
      bindI18n: 'languageChanged loaded',
      
      // Bind store
      bindI18nStore: false,
      
      // Translation components
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    }
  });

// Save language changes to localStorage
i18n.on('languageChanged', (lng: string) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;
