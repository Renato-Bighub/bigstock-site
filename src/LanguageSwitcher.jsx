import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { LANGUAGES, useI18n } from './i18n.jsx';

export default function LanguageSwitcher() {
  const { lang, info, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => { if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false); };
    const onKeyDown = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('pointerdown', onPointerDown); document.removeEventListener('keydown', onKeyDown); };
  }, [open]);

  return <div className="lang-switcher" ref={rootRef}>
    <button type="button" className="lang-button" aria-haspopup="true" aria-expanded={open} aria-label={`${t('a11y.language')}: ${info.label}`} onClick={() => setOpen((value) => !value)}>
      <Globe size={15} /><span>{info.short}</span><ChevronDown size={13} className={open ? 'lang-chevron-open' : ''} />
    </button>
    {open && <ul className="lang-menu" role="menu">
      {LANGUAGES.map((item) => <li key={item.code} role="none">
        <button type="button" role="menuitemradio" aria-checked={item.code === lang} lang={item.htmlLang} className={item.code === lang ? 'lang-option lang-option-active' : 'lang-option'} onClick={() => { setLang(item.code); setOpen(false); }}>
          <span className="lang-code">{item.short}</span><span className="lang-name">{item.label}</span>{item.code === lang && <Check size={14} />}
        </button>
      </li>)}
    </ul>}
  </div>;
}
