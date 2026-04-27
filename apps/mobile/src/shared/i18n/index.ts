import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from './locales/en.json';
import ru from './locales/ru.json';
import es from './locales/es.json';

const SUPPORTED = ['en', 'ru', 'es'] as const;
type Supported = (typeof SUPPORTED)[number];

function detectLanguage(): Supported {
  const code = getLocales()[0]?.languageCode ?? 'en';
  return (SUPPORTED as readonly string[]).includes(code) ? (code as Supported) : 'en';
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    es: { translation: es },
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export { i18n };
