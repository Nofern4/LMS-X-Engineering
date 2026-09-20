import th from './th.json';
import en from './en.json';
import { TRANSLATIONS } from './translations';

export type Language = 'th' | 'en' | 'zh' | 'ja' | 'fr';

export * from './languages';
export * from './translations';
export * from './usePageTranslator';

const dictionaries: Record<string, Record<string, string>> = {
  th,
  en,
};

export function getTranslation(key: string, lang: Language = 'th'): string {
  if (lang === 'th') return key;
  if (TRANSLATIONS[key] && TRANSLATIONS[key][lang]) {
    return TRANSLATIONS[key][lang];
  }
  const dict = dictionaries[lang] || dictionaries.en;
  return dict?.[key] || key;
}

