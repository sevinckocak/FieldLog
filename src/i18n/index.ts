import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enAuth from '../locales/en/auth.json';
import enCommon from '../locales/en/common.json';
import enMap from '../locales/en/map.json';
import enProfile from '../locales/en/profile.json';
import enTasks from '../locales/en/tasks.json';
import trAuth from '../locales/tr/auth.json';
import trCommon from '../locales/tr/common.json';
import trMap from '../locales/tr/map.json';
import trProfile from '../locales/tr/profile.json';
import trTasks from '../locales/tr/tasks.json';
import deAuth from '../locales/de/auth.json';
import deCommon from '../locales/de/common.json';
import deMap from '../locales/de/map.json';
import deProfile from '../locales/de/profile.json';
import deTasks from '../locales/de/tasks.json';
import frAuth from '../locales/fr/auth.json';
import frCommon from '../locales/fr/common.json';
import frMap from '../locales/fr/map.json';
import frProfile from '../locales/fr/profile.json';
import frTasks from '../locales/fr/tasks.json';
import esAuth from '../locales/es/auth.json';
import esCommon from '../locales/es/common.json';
import esMap from '../locales/es/map.json';
import esProfile from '../locales/es/profile.json';
import esTasks from '../locales/es/tasks.json';

export const LANGUAGES = {
  tr: 'Türkçe',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
} as const;

export type Locale = keyof typeof LANGUAGES;

export const DEFAULT_LOCALE: Locale = 'tr';

export const SUPPORTED_LOCALES = Object.keys(LANGUAGES) as Locale[];

i18n.use(initReactI18next).init({
  resources: {
    tr: { common: trCommon, auth: trAuth, map: trMap, tasks: trTasks, profile: trProfile },
    en: { common: enCommon, auth: enAuth, map: enMap, tasks: enTasks, profile: enProfile },
    de: { common: deCommon, auth: deAuth, map: deMap, tasks: deTasks, profile: deProfile },
    fr: { common: frCommon, auth: frAuth, map: frMap, tasks: frTasks, profile: frProfile },
    es: { common: esCommon, auth: esAuth, map: esMap, tasks: esTasks, profile: esProfile },
  },
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  defaultNS: 'common',
  ns: ['common', 'auth', 'map', 'tasks', 'profile'],
  interpolation: { escapeValue: false },
  initImmediate: false,
  compatibilityJSON: 'v4',
});

export default i18n;
