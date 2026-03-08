import { useState, useEffect } from 'react';
import { getLang, setLang, Language } from '@/lib/i18n';

export function useLanguage() {
  const [lang, setLangState] = useState<Language>(getLang());

  useEffect(() => {
    const handler = () => setLangState(getLang());
    window.addEventListener('langchange', handler);
    return () => window.removeEventListener('langchange', handler);
  }, []);

  const toggle = () => {
    const next = lang === 'en' ? 'hi' : 'en';
    setLang(next);
    setLangState(next);
  };

  return { lang, toggle };
}
