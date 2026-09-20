'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LanguageItem } from '@/lib/i18n/languages';
import { translate } from '@/lib/i18n/translations';

export const LanguageSwitcher: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<string>(DEFAULT_LANGUAGE);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('app_lang');
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      setCurrentLang(saved);
    } else {
      setCurrentLang(DEFAULT_LANGUAGE);
      localStorage.setItem('app_lang', DEFAULT_LANGUAGE);
    }

    const handleLangChange = (e: any) => {
      if (e.detail?.lang) setCurrentLang(e.detail.lang);
    };
    window.addEventListener('language_changed', handleLangChange);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('language_changed', handleLangChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    localStorage.setItem('app_lang', langCode);
    setIsOpen(false);
    
    // Dispatch global event for instant reactivity across all layers without jarring reload
    window.dispatchEvent(new CustomEvent('language_changed', { detail: { lang: langCode } }));
  };

  const selectedItem = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Trigger Capsule Button */}
      <button
        id="lang-switcher-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/95 backdrop-blur-md hover:bg-slate-900 hover:text-[#CEF34B] text-slate-800 px-3.5 py-1.5 rounded-full shadow-lg border border-slate-200/90 flex items-center gap-2 text-xs font-bold transition-all group cursor-pointer active:scale-95 select-none"
        title={translate('เปลี่ยนภาษา', currentLang)}
      >
        <span className="text-sm leading-none flex-shrink-0">{selectedItem.flag}</span>
        <span className="font-extrabold truncate max-w-[90px] sm:max-w-none">{selectedItem.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#CEF34B] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Vertical Long Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-64 bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-2 z-50 animate-fadeIn overflow-hidden">
          
          {/* Dropdown Header */}
          <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{translate('เลือกภาษาที่ต้องการ', currentLang)}</span>
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-mono">
              {SUPPORTED_LANGUAGES.length} {translate('ภาษา', currentLang)}
            </span>
          </div>

          {/* Long Vertical List of Languages */}
          <div className="max-h-72 overflow-y-auto py-1.5 space-y-1 divide-y-0">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  id={`lang-opt-${lang.code}`}
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full px-3 py-2 rounded-2xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white font-black shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div className="text-left">
                      <div className="leading-tight">{lang.name}</div>
                      <div className={`text-[10px] font-normal ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {lang.nativeName}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#CEF34B] text-black flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
};
