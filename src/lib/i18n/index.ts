import th from './th.json';
import en from './en.json';

export type Language = 'th' | 'en';

const dictionaries: Record<Language, Record<string, string>> = {
  th,
  en,
};

export function getTranslation(key: string, lang: Language = 'th'): string {
  const dict = dictionaries[lang] || dictionaries.th;
  return dict[key] || dictionaries.en[key] || key;
}
