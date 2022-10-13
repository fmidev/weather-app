import i18n, { LanguageDetectorAsyncModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform, NativeModules } from 'react-native';
import { getItem, LOCALE } from '../src/utils/async_storage';
import en from './en.json';

const languageResources = { en };

let systemLng =
  Platform.OS === 'ios'
    ? NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0]
    : NativeModules.I18nManager.localeIdentifier;

systemLng = systemLng.substr(0, systemLng.indexOf('_'));

if (Object.keys(languageResources).indexOf(systemLng) < 0) {
  systemLng = null;
}

const languageDetector = <LanguageDetectorAsyncModule>{
  init: () => {},
  type: 'languageDetector',
  async: true,
  detect: async (callback: any) => {
    const savedDataJSON = await getItem(LOCALE);
    const lng = savedDataJSON || null;
    const selectLanguage = lng || systemLng || 'en';
    callback(selectLanguage);
  },
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    resources: languageResources,
    ns: ['navigation'],
    defaultNS: 'navigation',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      bindI18n: 'languageChanged',
      bindI18nStore: false,
    },
  });

export default i18n;
