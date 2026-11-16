import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import pt from './locales/pt.js';
import en from './locales/en.js';
import es from './locales/es.js';
import fr from './locales/fr.js';
import de from './locales/de.js';

export const LANGUAGES = [
  { code: 'pt', label: 'Português', short: 'PT', locale: 'pt-PT', htmlLang: 'pt-PT' },
  { code: 'en', label: 'English', short: 'EN', locale: 'en-GB', htmlLang: 'en' },
  { code: 'es', label: 'Español', short: 'ES', locale: 'es-ES', htmlLang: 'es' },
  { code: 'fr', label: 'Français', short: 'FR', locale: 'fr-FR', htmlLang: 'fr' },
  { code: 'de', label: 'Deutsch', short: 'DE', locale: 'de-DE', htmlLang: 'de' },
];

export const dictionaries = { pt, en, es, fr, de };
const STORAGE_KEY = 'bigstock-lang';

function detectLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && dictionaries[saved]) return saved;
  } catch { /* armazenamento indisponível */ }
  const candidates = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'pt']);
  for (const candidate of candidates) {
    const code = String(candidate).slice(0, 2).toLowerCase();
    if (dictionaries[code]) return code;
  }
  return 'pt';
}

const I18nContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectLanguage);

  const value = useMemo(() => {
    const info = LANGUAGES.find((item) => item.code === lang) || LANGUAGES[0];
    const dictionary = dictionaries[lang];
    const t = (key, vars) => {
      let text = dictionary[key] ?? pt[key] ?? key;
      if (vars) Object.keys(vars).forEach((name) => { text = text.split(`{${name}}`).join(String(vars[name])); });
      return text;
    };
    const setLang = (code) => {
      if (!dictionaries[code]) return;
      setLangState(code);
      try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignorar */ }
    };
    return { lang, locale: info.locale, info, t, setLang };
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = value.info.htmlLang;
    document.title = value.t('meta.title');
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', value.t('meta.description'));
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', value.t('meta.title'));
  }, [value]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n deve ser usado dentro de LanguageProvider');
  return context;
}
