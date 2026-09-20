export interface LanguageItem {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageItem[] = [
  { code: 'th', name: 'ภาษาไทย', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'zh', name: '中文', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
];

export const DEFAULT_LANGUAGE = 'th';

