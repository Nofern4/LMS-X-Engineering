'use client';

import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { Language } from '@/lib/i18n';

export const LanguageSwitcher: React.FC = () => {
  const [lang, setLang] = useState<Language>('th');

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as Language;
    if (saved) setLang(saved);
  }, []);

  const toggleLanguage = (newLang: Language) => {
    localStorage.setItem('app_lang', newLang);
    setLang(newLang);
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
      <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
      <button
        onClick={() => toggleLanguage('th')}
        className={`px-2 py-0.5 rounded font-semibold transition-all ${
          lang === 'th' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        TH
      </button>
      <button
        onClick={() => toggleLanguage('en')}
        className={`px-2 py-0.5 rounded font-semibold transition-all ${
          lang === 'en' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        EN
      </button>
    </div>
  );
};
