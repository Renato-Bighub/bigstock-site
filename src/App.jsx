import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, Check, ChevronDown, CircleCheck,
  Code2, Copy, Heart, Image as ImageIcon, Layers3,
  Menu, Search, Sparkles, X, UsersRound, CheckCircle2
} from 'lucide-react';
import { dictionaries, useI18n } from './i18n.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';

// Fotos de demonstração. Ao publicar, troque as URLs externas por ativos
// licenciados do próprio catálogo. Os ficheiros locais são recortes do mockup
// aprovado, usados como fallback para visualização sem ligação à internet.
const photography = {
  woman: { remote: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=85', fallback: '/images/hero-woman.jpg' },
  city: { remote: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=85', fallback: '/images/hero-city.jpg' },
  warehouse: { remote: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=85', fallback: '/images/hero-logistics.jpg' },
  business: { remote: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=85', fallback: '/images/gallery-business.jpg' },
  logistics: { remote: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=85', fallback: '/images/gallery-logistics.jpg' },
  architecture: { remote: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=85', fallback: '/images/gallery-architecture.jpg' },
  technology: { remote: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85', fallback: '/images/gallery-technology.jpg' },
  ecommerce: { remote: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=900&q=85', fallback: '/images/gallery-ecommerce.jpg' },
  lifestyle: { remote: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=85', fallback: '/images/gallery-lifestyle.jpg' },
  team: { remote: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85', fallback: '/images/gallery-team.jpg' },
  nature: { remote: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=85', fallback: '/images/gallery-nature.jpg' },
  studio: { remote: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85', fallback: '/images/studio-office.jpg' },
  'studio-1': { remote: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=700&q=85', fallback: '/images/studio-thumb-1.jpg' },
  'studio-2': { remote: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=85', fallback: '/images/studio-thumb-2.jpg' },
  'studio-3': { remote: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=700&q=85', fallback: '/images/studio-thumb-3.jpg' },
  'studio-4': { remote: 'https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?auto=format&fit=crop&w=700&q=85', fallback: '/images/studio-thumb-4.jpg' },
  camera: { remote: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85', fallback: '/images/footer-camera.jpg' },
};

// Todos os botões e links que levam ao sistema usam este endereço.
const LOGIN_URL = 'https://app.bigstock.tech/login';

// Identificadores de categoria; os rótulos vêm das traduções (cat.*).
const categories = ['all', 'business', 'logistics', 'technology', 'ecommerce', 'people', 'architecture', 'nature', 'lifestyle'];
const gallery = [
  { id: 'business', category: 'business', photo: 'business' },
  { id: 'logistics', category: 'logistics', photo: 'logistics' },
  { id: 'architecture', category: 'architecture', photo: 'architecture' },
  { id: 'technology', category: 'technology', photo: 'technology' },
  { id: 'ecommerce', category: 'ecommerce', photo: 'ecommerce' },
  { id: 'lifestyle', category: 'lifestyle', photo: 'lifestyle' },
  { id: 'team', category: 'people', photo: 'team' },
  { id: 'nature', category: 'nature', photo: 'nature' },
];

const pricing = [
  { id: 'essential', name: 'Essential', monthly: 19, yearly: 15.2, features: 4 },
  { id: 'creator', name: 'Creator', monthly: 59, yearly: 47.2, featured: true, features: 5 },
  { id: 'business', name: 'Business', monthly: 149, yearly: 119.2, features: 5 },
];

const faqIds = [1, 2, 3, 4, 5, 6];

// Imagens locais usadas no fundo animado da secção de API.
const gridMotionImages = [
  'hero-city', 'gallery-business', 'gallery-logistics', 'gallery-architecture', 'gallery-technology',
  'gallery-ecommerce', 'gallery-lifestyle', 'gallery-team', 'gallery-nature', 'studio-office',
  'studio-thumb-1', 'studio-thumb-2', 'studio-thumb-3', 'studio-thumb-4',
].map((name) => `/images/${name}.jpg`);

// Fundo "Grid Motion" (inspirado em reactbits.dev): grelha inclinada cujas linhas
// deslizam em sentidos opostos conforme o rato, com uma deriva suave quando parado.
function GridMotion({ images, rows = 4, columns = 7 }) {
  const rootRef = useRef(null);
  const rowRefs = useRef([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const maxMove = 300;
    const offsets = rowRefs.current.map(() => 0);
    let ratio = 0.5;
    let visible = true;
    let frame = 0;
    const onMove = (event) => { ratio = event.clientX / window.innerWidth; };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(rootRef.current);
    const tick = (time) => {
      frame = window.requestAnimationFrame(tick);
      if (!visible) return;
      rowRefs.current.forEach((row, index) => {
        if (!row) return;
        const direction = index % 2 === 0 ? 1 : -1;
        const drift = Math.sin(time / 2600 + index * 1.7) * 40;
        const target = ((ratio * maxMove) - maxMove / 2 + drift) * direction;
        offsets[index] += (target - offsets[index]) * (0.05 - index * 0.007);
        row.style.transform = `translate3d(${offsets[index].toFixed(2)}px, 0, 0)`;
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return <div className="grid-motion" ref={rootRef} aria-hidden="true">
    <div className="grid-motion-grid">
      {Array.from({ length: rows }, (_, row) => <div className="grid-motion-row" key={row} ref={(element) => { rowRefs.current[row] = element; }}>
        {Array.from({ length: columns }, (_, column) => <div className="grid-motion-item" key={column}>
          <img src={images[(row * 5 + column) % images.length]} alt="" loading="lazy" draggable="false" />
        </div>)}
      </div>)}
    </div>
  </div>;
}

function Photo({ photo, alt, className = '', loading = 'lazy' }) {
  const image = photography[photo];
  return <img
    key={photo}
    className={`img-fade ${className}`.trim()}
    ref={(element) => { if (element && element.complete && element.naturalWidth) element.classList.add('is-loaded'); }}
    onLoad={(event) => event.currentTarget.classList.add('is-loaded')}
    src={image.remote}
    alt={alt}
    loading={loading}
    onError={(event) => {
      const element = event.currentTarget;
      if (element.dataset.fallback !== 'yes') {
        element.dataset.fallback = 'yes';
        element.src = image.fallback;
      }
    }}
  />;
}

function Logo({ inverse = false }) {
  const { t } = useI18n();
  return <a href="#inicio" className={`logo ${inverse ? 'logo-inverse' : ''}`} aria-label={t('a11y.logo')}>
    <span className="logo-big">BIG</span><span className="logo-stock">stock</span>
    <span className="logo-by">by BIGhub</span>
  </a>;
}

function Eyebrow({ children }) {
  return <div className="eyebrow"><span className="eyebrow-dot" />{children}</div>;
}

function ButtonArrow({ children, href, onClick, kind = 'primary', className = '', type = 'button' }) {
  const classes = `button button-${kind} ${className}`;
  return href
    ? <a className={classes} href={href}>{children}<ArrowRight size={17} strokeWidth={2.1} /></a>
    : <button className={classes} type={type} onClick={onClick}>{children}<ArrowRight size={17} strokeWidth={2.1} /></button>;
}

function SectionHeading({ eyebrow, children, description, id }) {
  return <div className="section-heading" id={id}>
    <div data-reveal><Eyebrow>{eyebrow}</Eyebrow><h2>{children}</h2></div>
    {description && <p className="section-heading-description" data-reveal data-delay="140">{description}</p>}
  </div>;
}

function Modal({ children, title, onClose, className = '' }) {
  const { t } = useI18n();
  const ref = useRef(null);
  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = oldOverflow; };
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={`modal-panel ${className}`} ref={ref} role="dialog" aria-modal="true" aria-label={title}>
      <button className="modal-close" onClick={onClose} aria-label={t('a11y.modalClose')}><X size={21} /></button>
      {children}
    </div>
  </div>;
}

function AccessModal({ plan, onClose }) {
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  return <Modal title={t('access.title')} onClose={onClose} className="access-modal">
    <Eyebrow>{t('access.eyebrow')}</Eyebrow>
    <h2>{t('access.h1')}<br /><em>{t('access.h2')}</em></h2>
    <p>{plan ? t('access.introPlan', { plan }) : t('access.introGeneric')}</p>
    {!submitted ? <form className="access-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
      <label>{t('access.name')}<input type="text" name="name" placeholder={t('access.namePh')} required autoComplete="name" /></label>
      <label>{t('access.email')}<input type="email" name="email" placeholder={t('access.emailPh')} required autoComplete="email" /></label>
      <label>{t('access.interest')}<select name="interest" defaultValue={plan || ''} required>
        <option value="" disabled>{t('access.choose')}</option>
        {['Essential', 'Creator', 'Business', 'API', 'Enterprise'].map((option) => <option key={option} value={option}>{t(`access.opt.${option}`)}</option>)}
      </select></label>
      <label className="checkbox-field"><input type="checkbox" required /><span>{t('access.check')}</span></label>
      <ButtonArrow type="submit" className="button-full">{t('access.submit')}</ButtonArrow>
    </form> : <div className="demo-confirmation"><CircleCheck size={42} /><h3>{t('access.doneTitle')}</h3><p>{t('access.doneText')}</p><ButtonArrow kind="dark" onClick={onClose}>{t('access.close')}</ButtonArrow></div>}
  </Modal>;
}

export default function App() {
  const { t, locale } = useI18n();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [category, setCategory] = useState('all');
  const [draftQuery, setDraftQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('bigstock-favorites') || '[]')); }
    catch { return new Set(); }
  });
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [accessPlan, setAccessPlan] = useState(null);
  const [accessOpen, setAccessOpen] = useState(false);
  const [billing, setBilling] = useState('monthly');
  const [activeFaq, setActiveFaq] = useState(0);
  const [apiTab, setApiTab] = useState('request');
  const [aiPrompt, setAiPrompt] = useState(null); // null = usar o texto de exemplo do idioma atual
  const [aiFormat, setAiFormat] = useState('16:9');
  const [aiStyle, setAiStyle] = useState('photo');
  const [aiQuality, setAiQuality] = useState('high');
  const [aiPhoto, setAiPhoto] = useState('studio');
  const [aiInfo, setAiInfo] = useState(false);
  const [toast, setToast] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const galleryRef = useRef(null);
  const progressRef = useRef(null);
  const aiTimer = useRef(0);

  const promptValue = aiPrompt ?? t('studio.prompt');
  const itemTitle = (item) => t(`g.${item.id}.title`);
  const itemSubtitle = (item) => t(`g.${item.id}.sub`);

  useEffect(() => {
    localStorage.setItem('bigstock-favorites', JSON.stringify([...favorites]));
  }, [favorites]);
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 3600);
    return () => clearTimeout(timeout);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase(locale);
    return gallery.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (onlyFavorites && !favorites.has(item.id)) return false;
      if (!q) return true;
      // A pesquisa considera o idioma atual e também palavras-chave em português e inglês.
      const haystack = [
        t(`g.${item.id}.title`), t(`g.${item.id}.sub`), t(`cat.${item.category}`), t(`g.${item.id}.tags`),
        dictionaries.pt[`g.${item.id}.tags`], dictionaries.en[`g.${item.id}.tags`],
      ].join(' ').toLocaleLowerCase(locale);
      return haystack.includes(q);
    });
  }, [category, searchQuery, onlyFavorites, favorites, locale, t]);

  const revealKey = `${category}|${searchQuery}|${onlyFavorites}`;

  // Barra de progresso de scroll e sombra do cabeçalho.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
      setScrolled(window.scrollY > 8);
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Entrada gradual: revela elementos [data-reveal] quando entram no ecrã.
  // Depois da animação o atributo é removido, devolvendo o controlo ao CSS normal (hover, etc.).
  useEffect(() => {
    if (!document.documentElement.classList.contains('motion-ok')) return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        observer.unobserve(element);
        element.classList.add('is-visible');
        window.setTimeout(() => {
          element.removeAttribute('data-reveal');
          element.classList.remove('is-visible');
          element.style.removeProperty('--d');
        }, Number(element.dataset.delay || 0) + 1100);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((element) => {
      if (element.dataset.delay) element.style.setProperty('--d', `${element.dataset.delay}ms`);
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, [revealKey]);

  useEffect(() => () => window.clearTimeout(aiTimer.current), []);
  const generateImage = () => {
    setAiInfo(false); setAiLoading(true);
    window.clearTimeout(aiTimer.current);
    aiTimer.current = window.setTimeout(() => { setAiLoading(false); setAiInfo(true); }, 1500);
  };

  const openAccess = (plan = null) => { setAccessPlan(plan); setSelectedPhoto(null); setAccessOpen(true); };
  const handleSearch = (event) => {
    event.preventDefault();
    setCategory('all'); setOnlyFavorites(false); setSearchQuery(draftQuery);
    galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const toggleFavorite = (id) => setFavorites((previous) => {
    const copy = new Set(previous);
    if (copy.has(id)) copy.delete(id); else copy.add(id);
    return copy;
  });

  const requestSnippet = `curl --request GET \\\n  --url 'https://api.bigstock.example/v1/images/search?q=${t('snippet.query')}' \\\n  --header 'Authorization: Bearer ${t('snippet.key')}' \\\n  --header 'Accept: application/json'`;
  const responseSnippet = `{
  "page": 1,
  "total": 12480,
  "results": [
    {
      "id": "img_demo_001",
      "title": "${t('snippet.title')}",
      "preview_url": "https://cdn.example/image.jpg",
      "license": "standard"
    }
  ]
}`;
  const copyApi = async () => {
    try { await navigator.clipboard.writeText(apiTab === 'request' ? requestSnippet : responseSnippet); setToast(t('api.copied')); }
    catch { setToast(t('api.copyFail')); }
  };

  const NavLinks = () => <>
    <a onClick={() => setMobileMenu(false)} href="#biblioteca">{t('nav.library')}</a>
    <a onClick={() => setMobileMenu(false)} href="#ia-studio">{t('nav.studio')}</a>
    <a onClick={() => setMobileMenu(false)} href="#api">{t('nav.api')}</a>
    <a onClick={() => setMobileMenu(false)} href="#precos">{t('nav.pricing')}</a>
    <a onClick={() => setMobileMenu(false)} href="#faq">{t('nav.faq')}</a>
  </>;

  const stripLinks = [
    ['business', 'strip.business'], ['logistics', 'strip.logistics'], ['technology', 'strip.technology'],
    ['people', 'strip.people'], ['nature', 'strip.nature'], ['architecture', 'strip.architecture'],
  ];
  const formatNumber = (value, digits) => value.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: 2 });

  return <>
    <div className="scroll-progress" ref={progressRef} aria-hidden="true" />
    <div className="announcement"><span className="announcement-dot" /> {t('announce.tag')} <span className="announcement-detail">{t('announce.detail')}</span> <a href="#ia-studio">{t('announce.cta')} <ArrowRight size={12} /></a></div>
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`} id="inicio">
      <div className="container header-inner">
        <Logo />
        <nav className={`navigation ${mobileMenu ? 'navigation-open' : ''}`} aria-label={t('a11y.nav')}><NavLinks /></nav>
        <div className="header-actions"><a className="ecosystem-link" href="https://www.bighub.tech/pt/" target="_blank" rel="noreferrer">{t('nav.ecosystem')} <ArrowUpRight size={14} /></a><LanguageSwitcher /><ButtonArrow kind="dark" className="nav-cta" href={LOGIN_URL}>{t('nav.cta')}</ButtonArrow><button className="mobile-menu-button" aria-label={mobileMenu ? t('a11y.menuClose') : t('a11y.menuOpen')} aria-expanded={mobileMenu} onClick={() => setMobileMenu((v) => !v)}>{mobileMenu ? <X /> : <Menu />}</button></div>
      </div>
    </header>

    <main>
      <section className="hero-section">
        <div className="container hero-layout">
          <div className="hero-content">
            <Eyebrow>{t('hero.eyebrow')}</Eyebrow>
            <h1>{t('hero.h1a')}<br />{t('hero.h1b')}<br /><em>{t('hero.h1c')}</em></h1>
            <p>{t('hero.text')}</p>
            <form className="hero-search" onSubmit={handleSearch} role="search"><Search size={19} /><input type="search" aria-label={t('hero.searchLabel')} value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder={t('hero.searchPlaceholder')} /><button aria-label={t('hero.searchBtn')} type="submit"><Search size={19} /></button></form>
            <div className="hero-buttons"><ButtonArrow href="#biblioteca">{t('hero.cta1')}</ButtonArrow><ButtonArrow kind="outline" href="#precos">{t('hero.cta2')}</ButtonArrow></div>
            <div className="hero-checks"><span><Check />{t('hero.check1')}</span><span><Check />{t('hero.check2')}</span><span><Check />{t('hero.check3')}</span></div>
          </div>
          <div className="hero-showcase" aria-label={t('hero.showcase')}>
            <div className="hero-main-photo"><Photo photo="woman" alt={t('hero.alt1')} loading="eager" /></div>
            <div className="hero-side-photos"><div><Photo photo="city" alt={t('hero.alt2')} loading="eager" /></div><div><Photo photo="warehouse" alt={t('hero.alt3')} loading="eager" /></div></div>
            <div className="hero-search-tag"><Search size={18} color="var(--brand)" /><span><b>{t('hero.tagTitle')}</b><small>{t('hero.tagSub')}</small></span><ArrowRight size={14} color="#1d9a63" /></div>
            <div className="hero-license-tag"><CheckCircle2 size={17} color="#00ad74" /> {t('hero.license')}</div>
          </div>
        </div>
      </section>

      <div className="category-strip"><div className="container category-strip-inner" data-reveal="fade"><span>{t('strip.l1')}<br />{t('strip.l2')}</span>{stripLinks.map(([id, key]) => <a key={id} href="#biblioteca" onClick={() => setCategory(id)}>{t(key)}</a>)}<a href="#biblioteca" onClick={() => setCategory('all')}>{t('strip.all')} <ChevronDown size={13} /></a></div></div>

      <section className="section features-section" id="funcionalidades"><div className="container">
        <SectionHeading eyebrow={t('features.eyebrow')} description={t('features.desc')}>{t('features.t1')}<br /><em>{t('features.t2')}</em></SectionHeading>
        <div className="features-grid">
          <article data-reveal data-delay="0" className="feature-card"><div className="feature-icon"><ImageIcon size={27} /></div><h3>{t('features.lib.title')}</h3><p>{t('features.lib.text')}</p><a href="#biblioteca">{t('features.lib.cta')} <ArrowRight size={16} /></a></article>
          <article data-reveal data-delay="120" className="feature-card feature-card-red"><div className="feature-icon"><Sparkles size={27} /></div><h3>{t('features.ai.title')}</h3><p>{t('features.ai.text')}</p><a href="#ia-studio">{t('features.ai.cta')} <ArrowRight size={16} /></a></article>
          <article data-reveal data-delay="240" className="feature-card"><div className="feature-icon"><Layers3 size={27} /></div><h3>{t('features.api.title')}</h3><p>{t('features.api.text')}</p><a href="#api">{t('features.api.cta')} <ArrowRight size={16} /></a></article>
        </div>
      </div></section>

      <section className="section gallery-section" id="biblioteca" ref={galleryRef}><div className="container">
        <div className="gallery-heading"><div data-reveal><Eyebrow>{t('gallery.eyebrow')}</Eyebrow><h2>{t('gallery.t1')}<br /><em>{t('gallery.t2')}</em></h2><p>{t('gallery.text')}</p></div><ButtonArrow href="#precos" kind="outline">{t('gallery.plans')}</ButtonArrow></div>
        <div className="gallery-toolbar" data-reveal data-delay="100"><div className="chips" role="group" aria-label={t('gallery.filterLabel')}>{categories.map((cat) => <button key={cat} className={`chip ${category === cat && !onlyFavorites ? 'chip-active' : ''}`} onClick={() => { setCategory(cat); setOnlyFavorites(false); }} aria-pressed={category === cat && !onlyFavorites}>{t(`cat.${cat}`)}</button>)}</div><button className={`fav-filter ${onlyFavorites ? 'fav-filter-active' : ''}`} title={t('gallery.favoritesTitle')} aria-pressed={onlyFavorites} onClick={() => { setOnlyFavorites(!onlyFavorites); setCategory('all'); }}><Heart size={18} fill={onlyFavorites ? 'currentColor' : 'none'} /><span>{t('gallery.favorites')}</span></button></div>
        {searchQuery && <div className="search-feedback">{t('gallery.feedback')} <strong>“{searchQuery}”</strong> <button onClick={() => { setSearchQuery(''); setDraftQuery(''); }}><X size={13} /> {t('gallery.clear')}</button></div>}
        {filtered.length ? <div className="gallery-grid" key={revealKey}>{filtered.map((item, index) => <article className="photo-card" key={item.id} data-reveal="zoom" data-delay={(index % 4) * 90}>
          <button className="photo-open" onClick={() => setSelectedPhoto(item)} aria-label={t('gallery.view', { title: itemTitle(item) })}><Photo photo={item.photo} alt={itemTitle(item)} /></button>
          <button className={`favorite-button ${favorites.has(item.id) ? 'favorited' : ''}`} onClick={() => toggleFavorite(item.id)} aria-label={favorites.has(item.id) ? t('gallery.favRemove', { title: itemTitle(item) }) : t('gallery.favAdd', { title: itemTitle(item) })} aria-pressed={favorites.has(item.id)}><Heart size={19} fill={favorites.has(item.id) ? 'currentColor' : 'none'} /></button>
          <button className="photo-meta" onClick={() => setSelectedPhoto(item)}><span><strong>{itemTitle(item)}</strong><small>{itemSubtitle(item)}</small></span><ArrowUpRight size={16} /></button>
        </article>)}</div> : <div className="empty-state"><Search size={28} /><h3>{t('gallery.emptyTitle')}</h3><p>{t('gallery.emptyText')}</p><button className="button button-outline" onClick={() => { setCategory('all'); setSearchQuery(''); setDraftQuery(''); setOnlyFavorites(false); }}>{t('gallery.emptyClear')}</button></div>}
        <div className="gallery-footnote" data-reveal="fade"><span><span className="footnote-dot" /> {t('gallery.footnote')}</span><a href="#ia-studio">{t('gallery.studioLink')} <ArrowRight size={15} /></a></div>
      </div></section>

      <section className="section ai-section" id="ia-studio"><div className="container ai-layout"><div className="ai-copy" data-reveal="left"><Eyebrow>{t('ai.eyebrow')}</Eyebrow><div className="ai-symbol"><Sparkles size={28} /></div><h2>{t('ai.t1')}<br />{t('ai.t2')}<br /><em>{t('ai.t3')}</em></h2><p>{t('ai.text')}</p><ul className="check-list"><li><Check />{t('ai.c1')}</li><li><Check />{t('ai.c2')}</li><li><Check />{t('ai.c3')}</li><li><Check />{t('ai.c4')}</li></ul><ButtonArrow onClick={() => document.getElementById('ai-prompt')?.focus()}>{t('ai.cta')}</ButtonArrow></div>
      <div className="ai-studio-card" data-reveal="right" data-delay="120"><div className="studio-top"><div><span className="mini-big">BIG</span><strong>{t('studio.name')}</strong></div><span className="studio-demo-label">{t('studio.demo')}</span></div>
        <div className={`studio-image ${aiLoading ? 'studio-loading' : ''}`}><Photo photo={aiPhoto} alt={t('studio.alt')} />{aiLoading && <div className="studio-overlay" role="status"><span className="spinner" />{t('studio.loading')}</div>}</div>
        <div className="studio-controls"><label htmlFor="ai-prompt" className="sr-only">{t('studio.promptLabel')}</label><textarea id="ai-prompt" value={promptValue} onChange={(event) => { setAiPrompt(event.target.value); setAiInfo(false); }} rows={2} maxLength={300} placeholder={t('studio.placeholder')} />
          <div className="studio-setting-row"><label>{t('studio.format')}<select value={aiFormat} onChange={(e) => setAiFormat(e.target.value)}><option>16:9</option><option>1:1</option><option>4:5</option><option>9:16</option></select></label><label>{t('studio.style')}<select value={aiStyle} onChange={(e) => setAiStyle(e.target.value)}>{['photo', 'editorial', 'minimal', '3d'].map((id) => <option key={id} value={id}>{t(`style.${id}`)}</option>)}</select></label><label>{t('studio.quality')}<select value={aiQuality} onChange={(e) => setAiQuality(e.target.value)}>{['high', 'standard'].map((id) => <option key={id} value={id}>{t(`quality.${id}`)}</option>)}</select></label><button className="button button-primary studio-generate" onClick={generateImage} disabled={!promptValue.trim() || aiLoading}>{aiLoading ? <><span className="spinner spinner-small" />{t('studio.generating')}</> : <>{t('studio.generate')} <ArrowRight size={15} /></>}</button></div>
          {aiInfo && <div className="ai-demo-notice" role="status"><Sparkles size={16} /><span><b>{t('studio.noticeTitle')}</b> {t('studio.notice', { format: aiFormat, style: t(`style.${aiStyle}`), quality: t(`quality.${aiQuality}`) })}</span></div>}
        </div><div className="studio-thumbnails">{['studio-1', 'studio-2', 'studio-3', 'studio-4'].map((id) => <button key={id} onClick={() => { setAiPhoto(id); setAiInfo(false); }} className={aiPhoto === id ? 'selected' : ''} title={t('studio.thumbTitle', { n: id.slice(-1) })}><Photo photo={id} alt={t('studio.thumbAlt')} /></button>)}</div>
      </div></div></section>

      <section className="api-section" id="api"><div className="container api-panel"><GridMotion images={gridMotionImages} /><div className="api-content" data-reveal="left"><Eyebrow>{t('api.eyebrow')}</Eyebrow><h2>{t('api.t1')}<br />{t('api.t2')}<br /><em>{t('api.t3')}</em></h2><p>{t('api.text')}</p><ul className="check-list"><li><Check />{t('api.c1')}</li><li><Check />{t('api.c2')}</li><li><Check />{t('api.c3')}</li><li><Check />{t('api.c4')}</li></ul><ButtonArrow kind="white" href={LOGIN_URL}>{t('api.cta')}</ButtonArrow></div>
      <div className="code-card" data-reveal="right" data-delay="120"><div className="code-card-top"><div className="window-dots"><i /><i /><i /></div><span>API EXAMPLE · /v1/images/search</span><button onClick={copyApi} title={t('api.copyTitle')}><Copy size={14} /> {t('api.copy')}</button></div><div className="code-tabs"><button className={apiTab === 'request' ? 'code-tab-active' : ''} onClick={() => setApiTab('request')}>{t('api.tabRequest')}</button><button className={apiTab === 'response' ? 'code-tab-active' : ''} onClick={() => setApiTab('response')}>{t('api.tabResponse')}</button></div><pre key={apiTab} className="code-fade"><code>{apiTab === 'request' ? requestSnippet : responseSnippet}</code></pre><div className="code-card-bottom"><CircleCheck size={15} /> {t('api.note')}</div></div></div></section>

      <section className="ecosystem-section"><div className="container ecosystem-layout"><div data-reveal><Eyebrow>{t('eco.eyebrow')}</Eyebrow><h2>{t('eco.t1')}<br /><em>{t('eco.t2')}</em></h2></div><div className="ecosystem-desc" data-reveal data-delay="140"><p>{t('eco.text')}</p><span>{t('eco.know')}</span><div className="ecosystem-pills"><a href="https://www.bighub.tech/pt/" target="_blank" rel="noreferrer">BIGhub <ArrowUpRight size={12} /></a><a href="https://biglogistics.bighub.tech/" target="_blank" rel="noreferrer">BIGlogistics <ArrowUpRight size={12} /></a><a href="#api">BIGstock API <Code2 size={12} /></a></div></div></div></section>

      <section className="section pricing-section" id="precos"><div className="container"><div className="pricing-heading"><div data-reveal><Eyebrow>{t('pricing.eyebrow')}</Eyebrow><h2>{t('pricing.t1')}<br /><em>{t('pricing.t2')}</em></h2><p>{t('pricing.text')}</p></div><div className="billing-control" data-reveal data-delay="140"><span className={billing === 'monthly' ? 'billing-active' : ''}>{t('pricing.monthly')}</span><button type="button" role="switch" aria-label={t('pricing.switch')} aria-checked={billing === 'yearly'} className={`switch ${billing === 'yearly' ? 'switch-on' : ''}`} onClick={() => setBilling((b) => b === 'monthly' ? 'yearly' : 'monthly')}><span /></button><span className={billing === 'yearly' ? 'billing-active' : ''}>{t('pricing.yearly')}</span><strong>−20%</strong></div></div>
      <div className="pricing-grid">{pricing.map((plan, index) => <article key={plan.id} data-reveal data-delay={index * 120} className={`pricing-card ${plan.featured ? 'pricing-featured' : ''}`}>{plan.featured && <div className="pricing-ribbon">{t('pricing.popular')}</div>}<h3>{plan.name}</h3><p className="plan-description">{t(`pricing.${plan.id}.for`)}</p><div className="plan-price">€ <strong key={billing} className="price-pop">{formatNumber(billing === 'monthly' ? plan.monthly : plan.yearly, billing === 'yearly' ? 2 : 0)}</strong><span>{t('pricing.perMonth')}</span></div><small className="plan-caption">{billing === 'monthly' ? t('pricing.captionMonthly') : t('pricing.captionYearly', { total: formatNumber(plan.yearly * 12, 2) })}</small><ButtonArrow kind={plan.featured ? 'primary' : 'outline'} href={LOGIN_URL} className="button-full">{t('pricing.choose', { name: plan.name })}</ButtonArrow><div className="plan-separator" /><ul>{Array.from({ length: plan.features }, (_, i) => <li key={i}><Check size={15} />{t(`pricing.${plan.id}.f${i + 1}`)}</li>)}</ul></article>)}</div>
      <div className="enterprise-bar" data-reveal><div className="enterprise-icon"><UsersRound size={25} /></div><div><strong>{t('enterprise.title')}</strong><p>{t('enterprise.text')}</p></div><ButtonArrow kind="dark" onClick={() => openAccess('Enterprise')}>{t('enterprise.cta')}</ButtonArrow></div>
      <p className="pricing-disclaimer">{t('pricing.disclaimer')}</p>
      <div className="credit-line" data-reveal><div><Eyebrow>{t('credits.eyebrow')}</Eyebrow><h3>{t('credits.t1')}<br />{t('credits.t2')}</h3><p>{t('credits.text')}</p></div><div className="credit-cards">{[{ qty: 50, price: 9 }, { qty: 250, price: 39 }, { qty: 1000, price: 129 }].map((pack) => <a key={pack.qty} href={LOGIN_URL}><strong>{pack.qty.toLocaleString(locale)}</strong><small>{t('credits.unit')}</small><span>€ {pack.price}*</span></a>)}</div></div>
      </div></section>

      <section className="section faq-section" id="faq"><div className="container faq-layout"><div data-reveal><Eyebrow>{t('faq.eyebrow')}</Eyebrow><h2>{t('faq.t1')}<br /><em>{t('faq.t2')}</em></h2><p>{t('faq.text')}</p><ButtonArrow kind="outline" onClick={() => openAccess()}>{t('faq.more')}</ButtonArrow></div><div className="faq-list" data-reveal data-delay="140">{faqIds.map((n, index) => <div className={`faq-item ${activeFaq === index ? 'faq-item-open' : ''}`} key={n}><button aria-expanded={activeFaq === index} onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}><span>{t(`faq.q${n}`)}</span><ChevronDown size={17} /></button><div className="faq-answer"><div><p>{t(`faq.a${n}`)}</p></div></div></div>)}</div></div></section>

      <section className="bottom-cta"><div className="container bottom-cta-inner"><div data-reveal><Eyebrow>{t('cta.eyebrow')}</Eyebrow><h2>{t('cta.t1')}<br />{t('cta.t2')}</h2><p>{t('cta.text')}</p></div><div className="cta-camera" aria-hidden="true"><Photo photo="camera" alt="" /></div><ButtonArrow kind="white" href={LOGIN_URL}>{t('cta.btn')}</ButtonArrow></div></section>
    </main>

    <footer className="footer"><div className="container footer-main" data-reveal="fade"><div className="footer-about"><Logo inverse /><p>{t('footer.about')}</p><a href="https://www.bighub.tech/pt/" target="_blank" rel="noreferrer">{t('footer.solution')} <ArrowUpRight size={12} /></a></div><div className="footer-column"><strong>{t('footer.platform')}</strong><a href="#biblioteca">{t('nav.library')}</a><a href="#ia-studio">{t('nav.studio')}</a><a href="#api">{t('nav.api')}</a><a href="#precos">{t('footer.pricing')}</a></div><div className="footer-column"><strong>{t('footer.resources')}</strong><a href="#funcionalidades">{t('footer.features')}</a><a href="#faq">{t('footer.faq')}</a><button onClick={() => openAccess('API')}>{t('footer.enterprise')}</button><button onClick={() => openAccess()}>{t('footer.contactTeam')}</button></div><div className="footer-column"><strong>{t('footer.ecosystem')}</strong><a href="https://www.bighub.tech/pt/" target="_blank" rel="noreferrer">BIGhub <ArrowUpRight size={12} /></a><a href="https://biglogistics.bighub.tech/" target="_blank" rel="noreferrer">BIGlogistics <ArrowUpRight size={12} /></a></div><div className="footer-column"><strong>{t('footer.company')}</strong><a href="https://www.bighub.tech/pt/" target="_blank" rel="noreferrer">{t('footer.aboutHub')}</a><button onClick={() => openAccess()}>{t('footer.contact')}</button></div></div><div className="container footer-bottom"><span>{t('footer.copyright', { year: new Date().getFullYear() })}</span><span>{t('footer.samples')} <a href="#inicio">{t('footer.top')}</a></span></div></footer>

    {selectedPhoto && <Modal title={itemTitle(selectedPhoto)} onClose={() => setSelectedPhoto(null)} className="photo-modal"><div className="photo-modal-preview"><Photo photo={selectedPhoto.photo} alt={itemTitle(selectedPhoto)} /></div><div className="photo-modal-content"><Eyebrow>{t('photo.eyebrow')}</Eyebrow><h2>{itemTitle(selectedPhoto)}</h2><p>{t('photo.text', { subtitle: itemSubtitle(selectedPhoto) })}</p><div className="photo-modal-actions"><ButtonArrow href={LOGIN_URL}>{t('photo.request')}</ButtonArrow><button className="button button-outline" onClick={() => toggleFavorite(selectedPhoto.id)}><Heart size={17} fill={favorites.has(selectedPhoto.id) ? 'currentColor' : 'none'} /> {favorites.has(selectedPhoto.id) ? t('photo.faved') : t('photo.fav')}</button></div></div></Modal>}
    {accessOpen && <AccessModal plan={accessPlan} onClose={() => setAccessOpen(false)} />}
    {toast && <div className="toast" role="status"><CircleCheck size={17} />{toast}</div>}
  </>;
}
