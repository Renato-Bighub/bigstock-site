import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, CircleCheck,
  Code2, Copy, ExternalLink, Heart, Image as ImageIcon, Layers3,
  Menu, Search, Sparkles, X, UsersRound, ShieldCheck, Camera,
  Boxes, Zap, SlidersHorizontal, Mail, Play, CheckCircle2
} from 'lucide-react';

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
const LOGIN_URL = 'https://bighub-bigshock.vercel.app/login';

const categories = ['Todos', 'Negócios', 'Logística', 'Tecnologia', 'E-commerce', 'Pessoas', 'Arquitetura', 'Natureza', 'Estilo de vida'];
const gallery = [
  { id: 'business', title: 'Negócios e liderança', category: 'Negócios', subtitle: 'Equipas, escritórios e profissionais', tags: 'negocios liderança empresas escritório empreendedor pessoas', photo: 'business' },
  { id: 'logistics', title: 'Logística e operações', category: 'Logística', subtitle: 'Armazéns, transportes e indústria', tags: 'logística indústria armazém transporte distribuição warehouse', photo: 'logistics' },
  { id: 'architecture', title: 'Arquitetura urbana', category: 'Arquitetura', subtitle: 'Cidades, edifícios e construção', tags: 'arquitetura cidade skyscraper edificios construção urbano', photo: 'architecture' },
  { id: 'technology', title: 'Tecnologia e inovação', category: 'Tecnologia', subtitle: 'Digital, software e dados', tags: 'tecnologia computador software laptop inovação dados analytics', photo: 'technology' },
  { id: 'ecommerce', title: 'E-commerce e produtos', category: 'E-commerce', subtitle: 'Produtos, compras e entregas', tags: 'ecommerce loja online produtos embalagens compras caixa', photo: 'ecommerce' },
  { id: 'lifestyle', title: 'Estilo de vida', category: 'Estilo de vida', subtitle: 'Momentos, pessoas e bem-estar', tags: 'pessoas lifestyle mulher viagem vida quotidiano', photo: 'lifestyle' },
  { id: 'team', title: 'Trabalho em equipa', category: 'Pessoas', subtitle: 'Reuniões e colaboração', tags: 'pessoas equipa reuniões empresas colaboração escritório', photo: 'team' },
  { id: 'nature', title: 'Natureza e paisagens', category: 'Natureza', subtitle: 'Florestas, rios e cenários naturais', tags: 'natureza floresta rio paisagem verde ambiente', photo: 'nature' },
];

const pricing = [
  { name: 'Essential', forWhom: 'Para criadores e pequenos projetos.', monthly: 19, yearly: 15.2, features: ['25 downloads por mês', '25 créditos de IA', 'Acesso ao acervo padrão', 'Licença comercial standard*'] },
  { name: 'Creator', forWhom: 'Para profissionais e equipas criativas.', monthly: 59, yearly: 47.2, featured: true, features: ['150 downloads por mês', '150 créditos de IA', 'Acesso à biblioteca completa', 'API com limites iniciais', 'Suporte prioritário'] },
  { name: 'Business', forWhom: 'Para empresas e projetos em escala.', monthly: 149, yearly: 119.2, features: ['750 downloads por mês', '500 créditos de IA', 'API com limites alargados', 'Gestão de equipa', 'Licenciamento empresarial*'] },
];

const questions = [
  { q: 'O que é o BIGstock?', a: 'É o conceito de um banco de imagens profissional com biblioteca de conteúdos licenciáveis, geração de imagens por inteligência artificial e integração por API, disponível de forma independente ou no ecossistema BIGhub.' },
  { q: 'Posso utilizar as imagens comercialmente?', a: 'A plataforma prevê licenças de utilização comercial para os ativos elegíveis. As permissões concretas, eventuais restrições e os direitos de terceiros terão de constar da licença aplicável a cada imagem.' },
  { q: 'Como funciona a geração de imagens por IA?', a: 'O utilizador introduz uma descrição, escolhe formato e qualidade e consome créditos conforme o modelo de geração. Nesta landing page, o IA Studio é apenas uma demonstração de interface: nenhuma imagem é realmente gerada.' },
  { q: 'A plataforma possui API?', a: 'A integração por API faz parte do produto planeado, incluindo pesquisa, seleção e acesso a ativos com autenticação e limites por plano. O exemplo de código apresentado é ilustrativo e não representa um endpoint ativo.' },
  { q: 'É necessário atribuir crédito ao autor?', a: 'Dependerá da origem e da licença de cada imagem. O catálogo deverá informar claramente se há exigência de atribuição, restrições editoriais ou permissões específicas.' },
  { q: 'Como posso contratar um plano?', a: 'Os planos desta demonstração são propostas de monetização com valores indicativos em euros, sem IVA. A subscrição real ficará disponível quando a plataforma, os pagamentos e os termos comerciais estiverem implementados.' },
];

const requestSnippet = `curl --request GET \\\n  --url 'https://api.bigstock.example/v1/images/search?q=escritorio' \\\n  --header 'Authorization: Bearer A_SUA_CHAVE_API' \\\n  --header 'Accept: application/json'`;
const responseSnippet = `{
  "page": 1,
  "total": 12480,
  "results": [
    {
      "id": "img_demo_001",
      "title": "Escritório moderno",
      "preview_url": "https://cdn.example/image.jpg",
      "license": "standard"
    }
  ]
}`;

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
  return <a href="#inicio" className={`logo ${inverse ? 'logo-inverse' : ''}`} aria-label="BIGstock, voltar ao início">
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
      <button className="modal-close" onClick={onClose} aria-label="Fechar janela"><X size={21} /></button>
      {children}
    </div>
  </div>;
}

function AccessModal({ plan, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  return <Modal title="Registo de interesse BIGstock" onClose={onClose} className="access-modal">
    <Eyebrow>BIGstock · ACESSO</Eyebrow>
    <h2>Faça parte do que<br /><em>vem a seguir.</em></h2>
    <p>Formulário demonstrativo para {plan ? `o plano ${plan}` : 'conhecer o BIGstock'}. Não existe envio nem armazenamento dos dados introduzidos.</p>
    {!submitted ? <form className="access-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
      <label>Nome completo<input type="text" name="name" placeholder="O seu nome" required autoComplete="name" /></label>
      <label>Email profissional<input type="email" name="email" placeholder="nome@empresa.pt" required autoComplete="email" /></label>
      <label>Principal interesse<select name="interest" defaultValue={plan || ''} required>
        <option value="" disabled>Escolha uma opção</option><option value="Essential">Plano Essential</option><option value="Creator">Plano Creator</option><option value="Business">Plano Business</option><option value="API">Integração API</option><option value="Enterprise">Solução Enterprise</option>
      </select></label>
      <label className="checkbox-field"><input type="checkbox" required /><span>Compreendo que este formulário é apenas demonstrativo e não envia os meus dados.</span></label>
      <ButtonArrow type="submit" className="button-full">Continuar demonstração</ButtonArrow>
    </form> : <div className="demo-confirmation"><CircleCheck size={42} /><h3>Demonstração concluída</h3><p>Os dados não foram enviados nem armazenados. Ligue este formulário ao seu backend/CRM antes de publicar.</p><ButtonArrow kind="dark" onClick={onClose}>Fechar</ButtonArrow></div>}
  </Modal>;
}

export default function App() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [category, setCategory] = useState('Todos');
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
  const [aiPrompt, setAiPrompt] = useState('Escritório moderno com vista para a cidade ao pôr do sol');
  const [aiFormat, setAiFormat] = useState('16:9');
  const [aiStyle, setAiStyle] = useState('Fotográfico');
  const [aiQuality, setAiQuality] = useState('Alta');
  const [aiPhoto, setAiPhoto] = useState('studio');
  const [aiInfo, setAiInfo] = useState(false);
  const [toast, setToast] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const galleryRef = useRef(null);
  const progressRef = useRef(null);
  const aiTimer = useRef(0);

  useEffect(() => {
    localStorage.setItem('bigstock-favorites', JSON.stringify([...favorites]));
  }, [favorites]);
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 3600);
    return () => clearTimeout(timeout);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase('pt-PT');
    return gallery.filter((item) =>
      (category === 'Todos' || item.category === category) &&
      (!onlyFavorites || favorites.has(item.id)) &&
      (!q || `${item.title} ${item.category} ${item.subtitle} ${item.tags}`.toLocaleLowerCase('pt-PT').includes(q))
    );
  }, [category, searchQuery, onlyFavorites, favorites]);

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
    setCategory('Todos'); setOnlyFavorites(false); setSearchQuery(draftQuery);
    galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const toggleFavorite = (id) => setFavorites((previous) => {
    const copy = new Set(previous);
    if (copy.has(id)) copy.delete(id); else copy.add(id);
    return copy;
  });
  const copyApi = async () => {
    try { await navigator.clipboard.writeText(apiTab === 'request' ? requestSnippet : responseSnippet); setToast('Exemplo copiado. Endpoints meramente ilustrativos.'); }
    catch { setToast('Não foi possível copiar automaticamente neste navegador.'); }
  };
  const NavLinks = () => <>
    <a onClick={() => setMobileMenu(false)} href="#biblioteca">Banco de imagens</a>
    <a onClick={() => setMobileMenu(false)} href="#ia-studio">IA Studio</a>
    <a onClick={() => setMobileMenu(false)} href="#api">API e integrações</a>
    <a onClick={() => setMobileMenu(false)} href="#precos">Preços</a>
    <a onClick={() => setMobileMenu(false)} href="#faq">FAQ</a>
  </>;

  return <>
    <div className="scroll-progress" ref={progressRef} aria-hidden="true" />
    <div className="announcement"><span className="announcement-dot" /> NOVIDADE NO ECOSSISTEMA BIGhub <span className="announcement-detail">· Imagens e IA para criar sem limites.</span> <a href="#ia-studio">Descubra agora <ArrowRight size={12} /></a></div>
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`} id="inicio">
      <div className="container header-inner">
        <Logo />
        <nav className={`navigation ${mobileMenu ? 'navigation-open' : ''}`} aria-label="Navegação principal"><NavLinks /></nav>
        <div className="header-actions"><a className="ecosystem-link" href="https://www.bighub.tech/pt/" target="_blank" rel="noreferrer">Ecossistema BIGhub <ArrowUpRight size={14} /></a><ButtonArrow kind="dark" className="nav-cta" href={LOGIN_URL}>Começar agora</ButtonArrow><button className="mobile-menu-button" aria-label={mobileMenu ? 'Fechar menu' : 'Abrir menu'} aria-expanded={mobileMenu} onClick={() => setMobileMenu((v) => !v)}>{mobileMenu ? <X /> : <Menu />}</button></div>
      </div>
    </header>

    <main>
      <section className="hero-section">
        <div className="container hero-layout">
          <div className="hero-content">
            <Eyebrow>BIGstock · FOTOS, VETORES E IMAGENS COM IA</Eyebrow>
            <h1>A imagem certa.<br />Para cada<br /><em>grande ideia.</em></h1>
            <p>Uma biblioteca de imagens profissionais para impulsionar campanhas, apresentar produtos, criar conteúdos e dar vida aos seus projetos.</p>
            <form className="hero-search" onSubmit={handleSearch} role="search"><Search size={19} /><input type="search" aria-label="Pesquisar imagens" value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder="O que procura hoje?" /><button aria-label="Pesquisar" type="submit"><Search size={19} /></button></form>
            <div className="hero-buttons"><ButtonArrow href="#biblioteca">Explorar a plataforma</ButtonArrow><ButtonArrow kind="outline" href="#precos">Descobrir planos e preços</ButtonArrow></div>
            <div className="hero-checks"><span><Check />Imagens royalty-free*</span><span><Check />Licenças flexíveis*</span><span><Check />Prontas a utilizar</span></div>
          </div>
          <div className="hero-showcase" aria-label="Fotografias demonstrativas do catálogo">
            <div className="hero-main-photo"><Photo photo="woman" alt="Mulher executiva em retrato profissional" loading="eager" /></div>
            <div className="hero-side-photos"><div><Photo photo="city" alt="Arquitetura de edifícios modernos" loading="eager" /></div><div><Photo photo="warehouse" alt="Centro de distribuição e logística" loading="eager" /></div></div>
            <div className="hero-search-tag"><Search size={18} color="var(--brand)" /><span><b>Mulher executiva</b><small>Pesquisa inteligente</small></span><ArrowRight size={14} color="#1d9a63" /></div>
            <div className="hero-license-tag"><CheckCircle2 size={17} color="#00ad74" /> Licença comercial prevista*</div>
          </div>
        </div>
      </section>

      <div className="category-strip"><div className="container category-strip-inner" data-reveal="fade"><span>EXPLORE A NOSSA BASE<br />POR CATEGORIAS</span><a href="#biblioteca" onClick={() => setCategory('Negócios')}>Negócios e Trabalho</a><a href="#biblioteca" onClick={() => setCategory('Logística')}>Logística e Indústria</a><a href="#biblioteca" onClick={() => setCategory('Tecnologia')}>Tecnologia</a><a href="#biblioteca" onClick={() => setCategory('Pessoas')}>Pessoas e Estilo de Vida</a><a href="#biblioteca" onClick={() => setCategory('Natureza')}>Natureza</a><a href="#biblioteca" onClick={() => setCategory('Arquitetura')}>Arquitetura</a><a href="#biblioteca" onClick={() => setCategory('Todos')}>Ver todas <ChevronDown size={13} /></a></div></div>

      <section className="section features-section" id="funcionalidades"><div className="container">
        <SectionHeading eyebrow="RECURSOS DA PLATAFORMA, MUITO ALÉM DAS FOTOS" description="Do acervo profissional ao poder da inteligência artificial, reunimos tudo o que precisa para criar, encontrar e utilizar imagens com agilidade, segurança e escala.">Mais do que um<br /><em>banco de imagens.</em></SectionHeading>
        <div className="features-grid">
          <article data-reveal data-delay="0" className="feature-card"><div className="feature-icon"><ImageIcon size={27} /></div><h3>Biblioteca de imagens</h3><p>Fotografias, vetores e recursos visuais organizados por tema, com pesquisa rápida e licenciamento previsto para uso comercial.</p><a href="#biblioteca">Explorar acervo <ArrowRight size={16} /></a></article>
          <article data-reveal data-delay="120" className="feature-card feature-card-red"><div className="feature-icon"><Sparkles size={27} /></div><h3>Geração de imagens por IA</h3><p>Transforme ideias em imagens exclusivas com modelos de inteligência artificial, de forma intuitiva e profissional.</p><a href="#ia-studio">Criar com IA <ArrowRight size={16} /></a></article>
          <article data-reveal data-delay="240" className="feature-card"><div className="feature-icon"><Layers3 size={27} /></div><h3>API para plataformas</h3><p>Integre o acervo da BIGstock no seu produto, sistema ou fluxo de trabalho através de uma API planeada para escalar.</p><a href="#api">Ver integração <ArrowRight size={16} /></a></article>
        </div>
      </div></section>

      <section className="section gallery-section" id="biblioteca" ref={galleryRef}><div className="container">
        <div className="gallery-heading"><div data-reveal><Eyebrow>INSPIRAÇÃO EM ALTA QUALIDADE</Eyebrow><h2>Encontre inspiração.<br /><em>Encontre a imagem.</em></h2><p>Uma curadoria visual do que o BIGstock poderá oferecer para negócios, marketing, e-commerce e conteúdos digitais.</p></div><ButtonArrow href="#precos" kind="outline">Ver os planos e coleções</ButtonArrow></div>
        <div className="gallery-toolbar" data-reveal data-delay="100"><div className="chips" role="group" aria-label="Filtrar imagens por categoria">{categories.map((cat) => <button key={cat} className={`chip ${category === cat && !onlyFavorites ? 'chip-active' : ''}`} onClick={() => { setCategory(cat); setOnlyFavorites(false); }} aria-pressed={category === cat && !onlyFavorites}>{cat}</button>)}</div><button className={`fav-filter ${onlyFavorites ? 'fav-filter-active' : ''}`} title="Mostrar favoritos" aria-pressed={onlyFavorites} onClick={() => { setOnlyFavorites(!onlyFavorites); setCategory('Todos'); }}><Heart size={18} fill={onlyFavorites ? 'currentColor' : 'none'} /><span>Favoritos</span></button></div>
        {searchQuery && <div className="search-feedback">Resultados de demonstração para <strong>“{searchQuery}”</strong> <button onClick={() => { setSearchQuery(''); setDraftQuery(''); }}><X size={13} /> Limpar</button></div>}
        {filtered.length ? <div className="gallery-grid" key={revealKey}>{filtered.map((item, index) => <article className="photo-card" key={item.id} data-reveal="zoom" data-delay={(index % 4) * 90}>
          <button className="photo-open" onClick={() => setSelectedPhoto(item)} aria-label={`Ver imagem: ${item.title}`}><Photo photo={item.photo} alt={item.title} /></button>
          <button className={`favorite-button ${favorites.has(item.id) ? 'favorited' : ''}`} onClick={() => toggleFavorite(item.id)} aria-label={favorites.has(item.id) ? `Retirar ${item.title} dos favoritos` : `Adicionar ${item.title} aos favoritos`} aria-pressed={favorites.has(item.id)}><Heart size={19} fill={favorites.has(item.id) ? 'currentColor' : 'none'} /></button>
          <button className="photo-meta" onClick={() => setSelectedPhoto(item)}><span><strong>{item.title}</strong><small>{item.subtitle}</small></span><ArrowUpRight size={16} /></button>
        </article>)}</div> : <div className="empty-state"><Search size={28} /><h3>Não existem imagens para esta seleção.</h3><p>Experimente outro termo ou remova os filtros.</p><button className="button button-outline" onClick={() => { setCategory('Todos'); setSearchQuery(''); setDraftQuery(''); setOnlyFavorites(false); }}>Limpar filtros</button></div>}
        <div className="gallery-footnote" data-reveal="fade"><span><span className="footnote-dot" /> Fotografias ilustrativas do conceito. O catálogo definitivo será integrado posteriormente.</span><a href="#ia-studio">Conhecer o IA Studio <ArrowRight size={15} /></a></div>
      </div></section>

      <section className="section ai-section" id="ia-studio"><div className="container ai-layout"><div className="ai-copy" data-reveal="left"><Eyebrow>CRIE IMAGENS COM IA</Eyebrow><div className="ai-symbol"><Sparkles size={28} /></div><h2>Imagine.<br />Descreva.<br /><em>Crie com IA.</em></h2><p>Transforme ideias em imagens únicas, com qualidade profissional e a liberdade criativa que o seu projeto precisa.</p><ul className="check-list"><li><Check />Geração rápida e intuitiva</li><li><Check />Estilos e formatos profissionais</li><li><Check />Créditos IA flexíveis</li><li><Check />Integração com a sua conta BIGstock</li></ul><ButtonArrow onClick={() => document.getElementById('ai-prompt')?.focus()}>Experimentar a interface IA</ButtonArrow></div>
      <div className="ai-studio-card" data-reveal="right" data-delay="120"><div className="studio-top"><div><span className="mini-big">BIG</span><strong>BIGstock IA Studio</strong></div><span className="studio-demo-label">DEMONSTRAÇÃO</span></div>
        <div className={`studio-image ${aiLoading ? 'studio-loading' : ''}`}><Photo photo={aiPhoto} alt="Pré-visualização de escritório moderno de demonstração" />{aiLoading && <div className="studio-overlay" role="status"><span className="spinner" />A criar a sua imagem…</div>}</div>
        <div className="studio-controls"><label htmlFor="ai-prompt" className="sr-only">Descrição da imagem pretendida</label><textarea id="ai-prompt" value={aiPrompt} onChange={(event) => { setAiPrompt(event.target.value); setAiInfo(false); }} rows={2} maxLength={300} placeholder="Descreva a imagem que pretende criar" />
          <div className="studio-setting-row"><label>Formato<select value={aiFormat} onChange={(e) => setAiFormat(e.target.value)}><option>16:9</option><option>1:1</option><option>4:5</option><option>9:16</option></select></label><label>Estilo<select value={aiStyle} onChange={(e) => setAiStyle(e.target.value)}><option>Fotográfico</option><option>Editorial</option><option>Minimalista</option><option>3D</option></select></label><label>Qualidade<select value={aiQuality} onChange={(e) => setAiQuality(e.target.value)}><option>Alta</option><option>Standard</option></select></label><button className="button button-primary studio-generate" onClick={generateImage} disabled={!aiPrompt.trim() || aiLoading}>{aiLoading ? <><span className="spinner spinner-small" />A gerar…</> : <>Gerar imagem <ArrowRight size={15} /></>}</button></div>
          {aiInfo && <div className="ai-demo-notice" role="status"><Sparkles size={16} /><span><b>Interface demonstrativa.</b> A geração real será ligada ao serviço de IA e ao sistema de créditos. Parâmetros escolhidos: {aiFormat}, {aiStyle.toLowerCase()}, {aiQuality.toLowerCase()}.</span></div>}
        </div><div className="studio-thumbnails">{['studio-1', 'studio-2', 'studio-3', 'studio-4'].map((id) => <button key={id} onClick={() => { setAiPhoto(id); setAiInfo(false); }} className={aiPhoto === id ? 'selected' : ''} title={`Ver amostra ${id.slice(-1)}`}><Photo photo={id} alt="Exemplo visual de escritório e arquitetura" /></button>)}</div>
      </div></div></section>

      <section className="api-section" id="api"><div className="container api-panel"><div className="api-content" data-reveal="left"><Eyebrow>PARA DEVELOPERS</Eyebrow><h2>Imagens na sua<br />plataforma.<br /><em>Sem complicações.</em></h2><p>Leve o acervo BIGstock para o seu produto, CMS ou construtor de websites através de uma integração moderna e segura.</p><ul className="check-list"><li><Check />Pesquisa e acesso ao catálogo</li><li><Check />Filtros inteligentes</li><li><Check />Autenticação por chave e quotas</li><li><Check />Documentação e integração planeadas</li></ul><ButtonArrow kind="white" href={LOGIN_URL}>Solicitar acesso à API</ButtonArrow></div>
      <div className="code-card" data-reveal="right" data-delay="120"><div className="code-card-top"><div className="window-dots"><i /><i /><i /></div><span>API EXAMPLE · /v1/images/search</span><button onClick={copyApi} title="Copiar exemplo"><Copy size={14} /> Copiar</button></div><div className="code-tabs"><button className={apiTab === 'request' ? 'code-tab-active' : ''} onClick={() => setApiTab('request')}>Requisição cURL</button><button className={apiTab === 'response' ? 'code-tab-active' : ''} onClick={() => setApiTab('response')}>Resposta JSON</button></div><pre key={apiTab} className="code-fade"><code>{apiTab === 'request' ? requestSnippet : responseSnippet}</code></pre><div className="code-card-bottom"><CircleCheck size={15} /> Endpoint fictício usado apenas para ilustrar a integração</div></div></div></section>

      <section className="ecosystem-section"><div className="container ecosystem-layout"><div data-reveal><Eyebrow>FAZ PARTE DO ECOSSISTEMA BIGHUB</Eyebrow><h2>Nasce no universo<br /><em>BIGhub.</em></h2></div><div className="ecosystem-desc" data-reveal data-delay="140"><p>O BIGstock foi pensado para funcionar de forma independente ou integrado com as soluções BIGhub, unindo criação, tecnologia e produtividade num só ecossistema.</p><span>Conheça o ecossistema BIGhub:</span><div className="ecosystem-pills"><a href="https://www.bighub.tech/pt/" target="_blank" rel="noreferrer">BIGhub <ArrowUpRight size={12} /></a><a href="https://biglogistics.bighub.tech/" target="_blank" rel="noreferrer">BIGlogistics <ArrowUpRight size={12} /></a><a href="#api">BIGstock API <Code2 size={12} /></a></div></div></div></section>

      <section className="section pricing-section" id="precos"><div className="container"><div className="pricing-heading"><div data-reveal><Eyebrow>PLANOS PARA CADA NECESSIDADE</Eyebrow><h2>Um plano para cada<br /><em>forma de criar.</em></h2><p>Acesso a imagens profissionais e créditos IA em modalidades flexíveis para pessoas, equipas e empresas.</p></div><div className="billing-control" data-reveal data-delay="140"><span className={billing === 'monthly' ? 'billing-active' : ''}>Mensal</span><button type="button" role="switch" aria-label="Alternar faturação anual" aria-checked={billing === 'yearly'} className={`switch ${billing === 'yearly' ? 'switch-on' : ''}`} onClick={() => setBilling((b) => b === 'monthly' ? 'yearly' : 'monthly')}><span /></button><span className={billing === 'yearly' ? 'billing-active' : ''}>Anual</span><strong>−20%</strong></div></div>
      <div className="pricing-grid">{pricing.map((plan, index) => <article key={plan.name} data-reveal data-delay={index * 120} className={`pricing-card ${plan.featured ? 'pricing-featured' : ''}`}>{plan.featured && <div className="pricing-ribbon">MAIS POPULAR</div>}<h3>{plan.name}</h3><p className="plan-description">{plan.forWhom}</p><div className="plan-price">€ <strong key={billing} className="price-pop">{(billing === 'monthly' ? plan.monthly : plan.yearly).toLocaleString('pt-PT', { maximumFractionDigits: 2, minimumFractionDigits: billing === 'yearly' ? 2 : 0 })}</strong><span>/mês</span></div><small className="plan-caption">{billing === 'monthly' ? 'Faturação mensal · sem IVA' : `Faturação anual: € ${(plan.yearly * 12).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · sem IVA`}</small><ButtonArrow kind={plan.featured ? 'primary' : 'outline'} href={LOGIN_URL} className="button-full">Escolher {plan.name}</ButtonArrow><div className="plan-separator" /><ul>{plan.features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul></article>)}</div>
      <div className="enterprise-bar" data-reveal><div className="enterprise-icon"><UsersRound size={25} /></div><div><strong>Precisa de um plano personalizado para a sua empresa?</strong><p>Fale com a nossa equipa sobre necessidades especiais de volume, licenças ou integração.</p></div><ButtonArrow kind="dark" onClick={() => openAccess('Enterprise')}>Falar com um especialista</ButtonArrow></div>
      <p className="pricing-disclaimer">* Valores, quantidades, quotas, descontos e termos de licença são exemplificativos e não constituem uma oferta comercial. A utilização comercial de imagens depende da licença final e dos direitos de cada ativo.</p>
      <div className="credit-line" data-reveal><div><Eyebrow>CRÉDITOS DE GERAÇÃO POR IA</Eyebrow><h3>A criatividade não tem de esperar<br />pelo próximo mês.</h3><p>Adquira créditos adicionais de IA quando precisar de mais gerações.</p></div><div className="credit-cards">{[{ qty: 50, price: 9 }, { qty: 250, price: 39 }, { qty: 1000, price: 129 }].map((pack) => <a key={pack.qty} href={LOGIN_URL}><strong>{pack.qty.toLocaleString('pt-PT')}</strong><small>créditos IA</small><span>€ {pack.price}*</span></a>)}</div></div>
      </div></section>

      <section className="section faq-section" id="faq"><div className="container faq-layout"><div data-reveal><Eyebrow>PERGUNTAS FREQUENTES</Eyebrow><h2>Tudo claro.<br /><em>Sem complicações.</em></h2><p>Respostas rápidas às perguntas mais comuns sobre o conceito BIGstock.</p><ButtonArrow kind="outline" onClick={() => openAccess()}>Tenho outra pergunta</ButtonArrow></div><div className="faq-list" data-reveal data-delay="140">{questions.map((item, index) => <div className={`faq-item ${activeFaq === index ? 'faq-item-open' : ''}`} key={item.q}><button aria-expanded={activeFaq === index} onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}><span>{item.q}</span><ChevronDown size={17} /></button><div className="faq-answer"><div><p>{item.a}</p></div></div></div>)}</div></div></section>

      <section className="bottom-cta"><div className="container bottom-cta-inner"><div data-reveal><Eyebrow>DESPERTE A SUA CRIATIVIDADE</Eyebrow><h2>As boas ideias merecem<br />imagens à altura.</h2><p>Imagens profissionais, criação com IA e integrações para levar o seu projeto mais longe.</p></div><div className="cta-camera" aria-hidden="true"><Photo photo="camera" alt="" /></div><ButtonArrow kind="white" href={LOGIN_URL}>Quero conhecer o BIGstock</ButtonArrow></div></section>
    </main>

    <footer className="footer"><div className="container footer-main" data-reveal="fade"><div className="footer-about"><Logo inverse /><p>A plataforma de imagens profissionais da BIGhub. Biblioteca visual, inteligência artificial e integrações para projetos digitais.</p><a href="https://www.bighub.tech/pt/" target="_blank" rel="noreferrer">Uma solução do ecossistema BIGhub <ArrowUpRight size={12} /></a></div><div className="footer-column"><strong>Plataforma</strong><a href="#biblioteca">Banco de imagens</a><a href="#ia-studio">IA Studio</a><a href="#api">API e integrações</a><a href="#precos">Planos e preços</a></div><div className="footer-column"><strong>Recursos</strong><a href="#funcionalidades">Funcionalidades</a><a href="#faq">Perguntas frequentes</a><button onClick={() => openAccess('API')}>Integrações para empresas</button><button onClick={() => openAccess()}>Contactar a equipa</button></div><div className="footer-column"><strong>Ecossistema</strong><a href="https://www.bighub.tech/pt/" target="_blank" rel="noreferrer">BIGhub <ArrowUpRight size={12} /></a><a href="https://biglogistics.bighub.tech/" target="_blank" rel="noreferrer">BIGlogistics <ArrowUpRight size={12} /></a></div><div className="footer-column"><strong>Empresa</strong><a href="https://www.bighub.tech/pt/" target="_blank" rel="noreferrer">Sobre a BIGhub</a><button onClick={() => openAccess()}>Contacto</button></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} BIGstock — conceito demonstrativo by BIGhub.</span><span>Imagens de amostra não incluídas numa licença comercial. <a href="#inicio">Voltar ao início ↑</a></span></div></footer>

    {selectedPhoto && <Modal title={selectedPhoto.title} onClose={() => setSelectedPhoto(null)} className="photo-modal"><div className="photo-modal-preview"><Photo photo={selectedPhoto.photo} alt={selectedPhoto.title} /></div><div className="photo-modal-content"><Eyebrow>BIBLIOTECA · PRÉ-VISUALIZAÇÃO</Eyebrow><h2>{selectedPhoto.title}</h2><p>{selectedPhoto.subtitle}. Esta fotografia representa o conteúdo visual de demonstração; o licenciamento e os downloads serão ativados com o catálogo definitivo.</p><div className="photo-modal-actions"><ButtonArrow href={LOGIN_URL}>Solicitar acesso</ButtonArrow><button className="button button-outline" onClick={() => toggleFavorite(selectedPhoto.id)}><Heart size={17} fill={favorites.has(selectedPhoto.id) ? 'currentColor' : 'none'} /> {favorites.has(selectedPhoto.id) ? 'Nos favoritos' : 'Guardar favorito'}</button></div></div></Modal>}
    {accessOpen && <AccessModal plan={accessPlan} onClose={() => setAccessOpen(false)} />}
    {toast && <div className="toast" role="status"><CircleCheck size={17} />{toast}</div>}
  </>;
}
