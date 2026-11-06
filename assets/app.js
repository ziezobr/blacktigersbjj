const page = document.body.dataset.page || 'home';
const callbackType = new URLSearchParams(location.hash.slice(1)).get('type');
if (page !== 'entrar' && (['recovery','invite'].includes(callbackType) || new URLSearchParams(location.hash.slice(1)).has('error'))) location.replace('/blacktigersbjj/entrar/?modo=redefinir' + location.hash);
const adminSection = document.body.dataset.adminSection || (location.pathname.replace(/^\/blacktigersbjj(?=\/|$)/,'').split('/').filter(Boolean)[1] || 'overview');
const root = document.getElementById('root');
const bt = window.BTI18n;
const tr = (key, fallback) => bt?.t(key, fallback) ?? fallback;
const cfg = window.BT_SUPABASE || {};
const sb = window.supabase && cfg.url && cfg.publishableKey
  ? window.supabase.createClient(cfg.url, cfg.publishableKey, {global:{fetch:window.BTSecurity.fetch}})
  : null;

const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[char]));
const slugify = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const money = cents => new Intl.NumberFormat(bt?.language || 'pt-BR', { style: 'currency', currency: 'BRL' }).format((Number(cents) || 0) / 100);
const duration = seconds => {
  const total = Number(seconds) || 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return h ? `${h}h ${String(m).padStart(2, '0')}min` : `${m || 1}min`;
};
const icon = (path, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
const icons = {
  play: icon('<path d="M8.2 5.5v13l10.5-6.5L8.2 5.5Z" fill="currentColor"/>'),
  search: icon('<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m15.7 15.7 4.3 4.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
  menu: icon('<path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
  close: icon('<path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
  chevron: icon('<path d="m9 7 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
  upload: icon('<path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15.5V20h14v-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
  video: icon('<rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m10 9 5 3-5 3V9Z" fill="currentColor"/>'),
  chart: icon('<path d="M4 19V9m5 10V5m6 14v-7m5 7V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
  folder: icon('<path d="M3 7.5h7l2-2h9v14H3v-12Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'),
  home: icon('<path d="m4 11 8-7 8 7v9H4v-9Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9.5 20v-6h5v6" fill="none" stroke="currentColor" stroke-width="1.7"/>'),
  eye: icon('<path d="M2.8 12s3.2-5.2 9.2-5.2 9.2 5.2 9.2 5.2-3.2 5.2-9.2 5.2S2.8 12 2.8 12Z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/>'),
  revenue: icon('<path d="M12 3v18M16.5 7H9.8a3 3 0 0 0 0 6h4.4a3 3 0 0 1 0 6H7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
  users: icon('<circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 20v-2a5.5 5.5 0 0 1 11 0v2M16 8.5a3 3 0 0 1 0 5.8M17 16a4.5 4.5 0 0 1 3.5 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
  lock: icon('<rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.7"/>'),
  heart: icon('<path d="M20.8 4.8a5.4 5.4 0 0 0-7.7 0L12 5.9l-1.1-1.1a5.4 5.4 0 1 0-7.7 7.7L12 21l8.8-8.5a5.4 5.4 0 0 0 0-7.7Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'),
  grid: icon('<rect x="4" y="4" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="4" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="4" y="14" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="14" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/>'),
  user: icon('<circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M5 20a7 7 0 0 1 14 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>')
  ,shield: icon('<path d="M12 3 20 6v5.5c0 4.6-3.2 7.8-8 9.5-4.8-1.7-8-4.9-8-9.5V6l8-3Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m8.8 12 2.1 2.1 4.5-4.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'),
  activity: icon('<path d="M3 12h4l2.3-6 4.2 12 2.3-6H21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
  bag: icon('<path d="M5 8h14l-1 12H6L5 8Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 9V6a3 3 0 0 1 6 0v3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
  bell: icon('<path d="M6.5 9a5.5 5.5 0 0 1 11 0c0 6 2 6.5 2 6.5h-15S6.5 15 6.5 9Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M10 19a2.2 2.2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
  message: icon('<path d="M5 5h14v10H9l-4 4V5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 9h6M9 12h4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
  calendar: icon('<rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 3v4m8-4v4M4 10h16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
  trophy: icon('<path d="M8 4h8v4a4 4 0 0 1-8 0V4Zm4 8v5m-4 3h8M6 6H3v1a4 4 0 0 0 4 4m11-5h3v1a4 4 0 0 1-4 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'),
  trash: icon('<path d="M5 7h14M9 7V4h6v3m2 0-1 13H8L7 7m3.5 4v5m3-5v5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>')
};

const fallbackCourses = [];

function languageControl(compact = false) {
  const options = (bt?.options || [['pt-BR', 'Português BR']]).map(([value, label]) =>
    `<option value="${value}" ${value === bt?.language ? 'selected' : ''}>${label}</option>`).join('');
  return `<label class="language-switch ${compact ? 'compact' : ''}"><span class="sr-only">Idioma</span><span aria-hidden="true">◎</span><select data-language aria-label="Idioma do site">${options}</select></label>`;
}

function brand(compact = false) {
  return `<a class="brand ${compact ? 'brand-compact' : ''}" href="/blacktigersbjj/" aria-label="Black Tigers BJJ">
    <span class="brand-mark brand-logo"><img src="/blacktigersbjj/assets/black-tigers-logo-small.png" alt=""></span>
    <span class="brand-copy"><strong>BLACK TIGERS</strong><small>BRAZILIAN JIU-JITSU</small></span>
  </a>`;
}

function previousHeader() {
  return `<header class="topbar-wrap stream-header"><div class="topbar">
    <div class="header-brand-group">${brand()}<a class="header-subscribe" href="/blacktigersbjj/planos/">${tr('nav.plans','Planos')}</a></div>
    <nav class="desktop-nav stream-nav" aria-label="Principal"><a class="${page === 'planos' ? 'active' : ''}" href="/blacktigersbjj/planos/">${tr('nav.plans', 'Planos')}</a><a class="${page === 'comunidade' ? 'active' : ''}" href="/blacktigersbjj/comunidade/">Comunidade</a><details class="student-menu"><summary>Área do aluno <span>⌄</span></summary><div><a href="/blacktigersbjj/catalogo/">${icons.grid}<span>Catálogo completo</span></a><a href="/blacktigersbjj/conta/">${icons.heart}<span>Minha lista</span></a><a href="/blacktigersbjj/conta/#progresso">${icons.chart}<span>Meu progresso</span></a><a data-admin-link hidden href="/blacktigersbjj/admin/">${icons.shield}<span>Painel admin</span></a></div></details></nav>
    <div class="top-actions"><button class="header-icon" id="streamSearchOpen" type="button" aria-label="Buscar">${icons.search}</button><a class="header-icon" href="/blacktigersbjj/planos/" aria-label="Carrinho e assinatura">${icons.bag}</a>${languageControl(true)}<a class="admin-nav-link" data-admin-link hidden href="/blacktigersbjj/admin/">Admin</a><a class="header-login header-avatar" href="/blacktigersbjj/entrar/" aria-label="Entrar">BT</a><a class="header-avatar" data-account-link href="/blacktigersbjj/conta/" hidden aria-label="Minha conta">BT</a><button class="mobile-menu-btn header-icon" type="button" aria-label="Abrir menu">${icons.menu}</button></div>
  </div><div class="mobile-nav" hidden><a href="/blacktigersbjj/">Início</a><a href="/blacktigersbjj/catalogo/">${tr('nav.catalog', 'Catálogo')}</a><a href="/blacktigersbjj/planos/">${tr('nav.plans', 'Planos')}</a><a href="/blacktigersbjj/comunidade/">Comunidade</a><a href="/blacktigersbjj/conta/">Minha lista e progresso</a><a data-admin-link hidden href="/blacktigersbjj/admin/">${tr('nav.admin', 'Admin')}</a><a href="/blacktigersbjj/entrar/">${tr('nav.login', 'Entrar')}</a>${languageControl()}</div></header>`;
}

function legacyFooter() {
  return `<footer class="footer stream-footer"><div class="stream-footer-inner"><div class="footer-brand">${brand(true)}<p>Jiu-jitsu de alto nível, organizado para você treinar onde estiver.</p></div><div><strong>PLATAFORMA</strong><a href="/blacktigersbjj/catalogo/">Catálogo</a><a href="/blacktigersbjj/planos/">Planos</a><a href="/blacktigersbjj/comunidade/">Comunidade</a><a href="/blacktigersbjj/conta/">Minha conta</a></div><div><strong>BLACK TIGERS</strong><a href="/blacktigersbjj/catalogo/?nivel=iniciante">Fundamentos</a><a href="/blacktigersbjj/catalogo/?nivel=intermediario">Intermediário</a><a href="/blacktigersbjj/catalogo/?nivel=avancado">Avançado</a></div><div><strong>ACESSO</strong><a href="/blacktigersbjj/entrar/">Entrar</a><a href="/blacktigersbjj/planos/">${tr('nav.plans','Planos')}</a><a data-admin-link hidden href="/blacktigersbjj/admin/">Painel admin</a></div></div><div class="footer-bottom">© ${new Date().getFullYear()} Black Tigers BJJ <span>•</span> Brazilian Jiu-Jitsu</div></footer>${mobileDock()}`;
}

function courseHref(item) {
  const remoteId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(item.id || ''));
  return remoteId ? `/blacktigersbjj/assistir/?id=${item.id}` : `/blacktigersbjj/curso/?curso=${encodeURIComponent(item.slug || item.id || '')}`;
}

function posterCard(item, rank = null) {
  const title = escapeHTML(item.title);
  const href = courseHref(item);
  const thumb = window.BTSecurity.safeImage(item.thumbnail_url);
  const free = item.access_level === 'free';
  return `<article class="poster-card ${rank ? 'ranked' : ''}" data-level="${escapeHTML(item.level || 'todos')}" data-search="${escapeHTML(`${item.title} ${item.description || ''} ${item.category?.name || ''}`.toLowerCase())}">${rank ? `<span class="rank-number">${rank}</span>` : ''}<a class="poster-link" href="${href}" aria-label="${title}"><img src="${escapeHTML(thumb)}" alt="" loading="lazy"><span class="poster-scrim"></span><span class="poster-kicker">${escapeHTML(item.category?.name || 'Black Tigers')}</span><span class="poster-copy"><b>${title}</b><small>${escapeHTML(item.short || item.description || 'Aula Black Tigers')}</small></span><span class="poster-access ${free ? 'free' : ''}">${free ? 'GRÁTIS' : 'PREMIUM'}</span><span class="poster-play">${icons.play}</span></a></article>`;
}

const courseCard = posterCard;

function mobileDock() {
  return `<nav class="mobile-dock" aria-label="Navegação móvel"><a class="${page === 'home' ? 'active' : ''}" href="/blacktigersbjj/">${icons.home}<span>Início</span></a><a class="${page === 'catalogo' ? 'active' : ''}" href="/blacktigersbjj/catalogo/">${icons.grid}<span>Cursos</span></a><button id="mobileSearchOpen" type="button">${icons.search}<span>Buscar</span></button><a class="${page === 'flow' ? 'active' : ''}" href="/blacktigersbjj/flow/">${icons.play}<span>Tiger Flow</span></a><a class="${page === 'conta' ? 'active' : ''}" href="/blacktigersbjj/conta/">${icons.user}<span>Perfil</span></a></nav>`;
}

function streamRow(title, subtitle, items, id, ranked = false) {
  return `<section class="stream-row"><div class="stream-row-head"><div><h2>${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ''}</div><div class="row-controls"><button type="button" data-row-prev="${id}" aria-label="Voltar">‹</button><button type="button" data-row-next="${id}" aria-label="Avançar">›</button></div></div><div class="poster-track" id="${id}">${items.map((item, index) => posterCard(item, ranked ? index + 1 : null)).join('')}</div></section>`;
}

function searchOverlay() {
  return `<div class="stream-search" id="streamSearch" hidden><div class="search-top">${brand(true)}<button id="streamSearchClose" type="button" aria-label="Fechar">${icons.close}</button></div><div class="search-inner"><span class="eyebrow">BUSCA BLACK TIGERS</span><label>${icons.search}<input id="globalSearchInput" type="search" autocomplete="off" placeholder="Busque por curso, posição ou técnica"></label><div class="search-results" id="globalSearchResults"><p>Digite para encontrar seu próximo treino.</p></div></div></div>`;
}

function pageLoader() {
  return `<div class="bt-loader" id="btLoader"><img src="/blacktigersbjj/assets/black-tigers-logo-small.png" alt=""><span>BLACK TIGERS</span><i></i></div>`;
}







function loginPage() {
  return `<main class="auth-wrap"><section class="auth-showcase"><a href="/blacktigersbjj/">${brand()}</a><div><span class="eyebrow">TREINE. APRENDA. EVOLUA.</span><h2>BLACK<br>TIGERS</h2><p>Seu tatame digital, disponível em qualquer lugar.</p></div><img src="/blacktigersbjj/assets/black-tigers-logo-small.png" alt=""></section><section class="auth-panel">${languageControl()}<div class="auth-card"><span class="eyebrow">${tr('auth.area','ÁREA DO ALUNO')}</span><h1>${tr('auth.welcome','Bem-vindo de volta.')}</h1><p>${tr('auth.subtitle','Entre para acessar suas aulas, trilhas e progresso.')}</p><div class="auth-tabs"><button class="active" data-auth-tab="login">${tr('auth.login','Entrar')}</button><button data-auth-tab="signup">${tr('auth.signup','Criar conta')}</button></div><form id="loginForm" class="auth-form"><label>${tr('auth.email','E-mail')}<input name="email" type="email" required autocomplete="email" placeholder="voce@email.com"></label><label>${tr('auth.password','Senha')}<input name="password" type="password" required minlength="6" autocomplete="current-password" placeholder="••••••••"></label><div class="form-row"><span></span><button class="inline-link" type="button" id="forgotPassword">${tr('auth.forgot','Esqueci minha senha')}</button></div><button class="btn btn-primary btn-block" type="submit">${tr('auth.login','Entrar')}</button></form><form id="signupForm" class="auth-form" hidden><label>${tr('auth.name','Nome')}<input name="name" required maxlength="80" autocomplete="name"></label><label>${tr('auth.email','E-mail')}<input name="email" type="email" required autocomplete="email"></label><label>${tr('auth.password','Senha')}<input name="password" type="password" required minlength="12" autocomplete="new-password"></label><button class="btn btn-primary btn-block" type="submit">${tr('auth.create','Criar minha conta')}</button></form><p class="auth-status" id="authStatus" role="status"></p><a class="back-link auth-back" href="/blacktigersbjj/">← Voltar ao site</a></div></section></main>`;
}

function accountPage() {
  return `${header()}<main><section class="page-hero compact-hero"><div class="container"><span class="eyebrow">MINHA CONTA</span><h1>Seu treino, organizado.</h1><p data-account-email>Entre para visualizar assinatura e progresso.</p></div></section><section class="section section-dark"><div class="container account-grid"><article class="account-card"><span class="eyebrow">ASSINATURA</span><h2 data-subscription-status>Plano gratuito</h2><p data-subscription-copy>Conteúdos gratuitos disponíveis. Assine para liberar a biblioteca completa.</p><a class="btn btn-primary" href="/blacktigersbjj/planos/">Gerenciar plano</a></article><article class="account-card"><span class="eyebrow">PROGRESSO</span><h2 data-progress-count>0 aulas concluídas</h2><p>Continue de onde parou e mantenha a consistência.</p><a class="btn btn-ghost" href="/blacktigersbjj/catalogo/">Ir para aulas</a></article><article class="account-card admin-account" data-admin-card hidden><span class="eyebrow">GESTÃO</span><h2>Painel administrativo</h2><p>Publique vídeos, organize categorias e acompanhe resultados.</p><a class="btn btn-light" href="/blacktigersbjj/admin/">Abrir painel</a></article><button class="btn btn-ghost" id="accountLogout" hidden>${tr('common.logout','Sair')}</button></div></section></main>${footer()}`;
}


function adminShell() {
  const active = section => adminSection === section ? 'active' : '';
  return `<div class="admin-app"><aside class="admin-sidebar">${brand(true)}<nav>
    <a class="${active('overview')}" href="/blacktigersbjj/admin/">${icons.home}<span>${tr('admin.overview','Visão geral')}</span></a>
    <a class="${active('videos')}" data-permission="manage_content" href="/blacktigersbjj/admin/videos/">${icons.video}<span>${tr('admin.videos','Vídeos')}</span></a>
    <a class="${active('categories')}" data-permission="manage_content" href="/blacktigersbjj/admin/categories/">${icons.folder}<span>${tr('admin.categories','Categorias')}</span></a>
    <a class="${active('analytics')}" data-permission="view_analytics" href="/blacktigersbjj/admin/analytics/">${icons.chart}<span>${tr('admin.analytics','Análises')}</span></a>
    <a class="${active('students')}" data-permission="manage_members" href="/blacktigersbjj/admin/students/">${icons.users}<span>Alunos</span></a>
    <a class="${active('subscriptions')}" data-permission="manage_members" href="/blacktigersbjj/admin/subscriptions/">${icons.bag}<span>Assinaturas</span></a>
    <a class="${active('administrators')}" data-permission="manage_admins" href="/blacktigersbjj/admin/administrators/">${icons.shield}<span>Administradores</span></a>
  </nav><div class="admin-sidebar-foot"><a href="/blacktigersbjj/">← Voltar ao site</a><button id="adminLogout">${tr('common.logout','Sair')}</button></div></aside><main class="admin-main"><header class="admin-top"><a class="admin-home-mobile" href="/blacktigersbjj/">${icons.home}<span>${tr('nav.home','Página inicial')}</span></a><div><span class="eyebrow">BLACK TIGERS STREAM</span><h1>${tr('admin.title','Painel administrativo')}</h1><p class="admin-breadcrumb" id="adminBreadcrumb">Gestão segura da plataforma</p></div><div>${languageControl(true)}<span class="admin-role-chip" id="adminRoleChip">Administrador</span><span class="admin-avatar" id="adminAvatar">BT</span></div></header><div class="admin-alert" id="adminAlert" hidden></div><section class="admin-auth-gate" id="adminGate"><div class="admin-spinner"></div><strong>Conectando ao painel…</strong><span>Validando acesso seguro pelo Supabase.</span></section><div id="adminContent" hidden>
    <section class="admin-view ${active('overview')}" data-admin-view="overview"><div class="admin-welcome"><div><span class="eyebrow">CENTRAL DE OPERAÇÕES</span><h2>Bem-vindo ao tatame digital.</h2><p>Publique aulas, acompanhe o desempenho e distribua o acesso da sua equipe em um só lugar.</p></div><div class="admin-quick-actions"><a data-permission="manage_content" href="/blacktigersbjj/admin/videos/">${icons.upload}<span><b>Nova aula</b><small>Enviar e publicar</small></span></a><a data-permission="manage_admins" href="/blacktigersbjj/admin/administrators/">${icons.users}<span><b>Adicionar admin</b><small>Gerenciar equipe</small></span></a></div></div><div class="metric-grid" id="metricGrid"></div><div class="admin-bento"><article class="admin-card chart-card"><div class="card-head"><div><span class="eyebrow">DESEMPENHO</span><h2>${tr('admin.topVideos','Vídeos mais vistos')}</h2></div><span class="live-dot">AO VIVO</span></div><div class="bar-chart" id="topVideoChart"></div></article><article class="admin-card health-card"><span class="eyebrow">PLATAFORMA</span><h2>Saúde do conteúdo</h2><div class="health-ring"><strong id="publishRate">0%</strong><span>publicado</span></div><div class="health-legend"><span><i class="green"></i>Publicados</span><span><i></i>Rascunhos</span></div></article><article class="admin-card recent-card" data-permission="view_analytics"><div class="card-head"><div><span class="eyebrow">RECEITA</span><h2>${tr('admin.revenueHistory','Histórico de receita')}</h2></div></div><div id="revenueList"></div></article></div></section>
    <section class="admin-view ${active('videos')}" data-admin-view="videos"><div class="admin-split"><article class="admin-card"><div class="card-head"><div><span class="eyebrow">CONTEÚDO</span><h2>${tr('admin.upload','Enviar novo vídeo')}</h2></div>${icons.upload}</div><form id="videoForm" class="admin-form"><label>${tr('admin.videoTitle','Título do vídeo')}<input name="title" required minlength="2" maxlength="160"></label><label>${tr('admin.description','Descrição')}<textarea name="description" rows="3"></textarea></label><div class="form-two"><label>${tr('admin.category','Categoria')}<select name="category_id" id="videoCategory"></select></label><label>Duração (minutos)<input name="duration" type="number" min="0" step="0.01" value="0"></label></div><label>Idioma do áudio<select name="audio_language"><option value="pt-BR">Português BR</option><option value="pt-PT">Português PT</option><option value="it">Italiano</option><option value="es">Español</option><option value="en">English</option></select></label><label>Formato<select name="format"><option value="lesson">Aula completa</option><option value="short">Tiger Flow · Vertical até 3 minutos</option></select></label><label>Miniatura (URL)<input name="thumbnail_url" type="url" placeholder="https://"></label><label>${tr('admin.access','Acesso')}<select name="access_level"><option value="subscriber">${tr('common.subscriber','Assinante')}</option><option value="free">${tr('common.free','Grátis')}</option></select></label><label>Onde o vídeo está hospedado?<select name="video_source"><option value="drive">Google Drive · cadastrar link</option><option value="upload">Supabase · enviar arquivo</option></select></label><div data-drive-fields><label>Link do vídeo no Google Drive<input name="drive_url" type="url" placeholder="https://drive.google.com/file/d/…/view" required></label><p class="drive-source-note">O vídeo fica no Google Drive. Para assistir sem login do Google, libere o arquivo para qualquer pessoa com o link e permita download nas configurações do Drive. Links podem circular fora do site e o Drive pode limitar reproduções. Use vídeos MP4/H.264 para melhor compatibilidade no celular. O player do site permite assistir sem baixar manualmente. O Drive pode aplicar limites de acesso.</p></div><label data-upload-fields hidden>${tr('admin.file','Arquivo de vídeo')}<input name="file" type="file" accept="video/*"><small>MP4, WebM ou MOV. Até 50 MB neste projeto.</small></label><div class="check-row"><label><input name="published" type="checkbox" checked>${tr('admin.publishNow','Publicar agora')}</label><label><input name="featured" type="checkbox">${tr('admin.featured','Destacar no início')}</label></div><button class="btn btn-primary" type="submit">${icons.upload}${tr('admin.send','Enviar vídeo')}</button><div class="upload-progress" id="uploadProgress" hidden><i></i><span>Enviando com segurança…</span></div></form></article><article class="admin-card table-card"><div class="card-head"><div><span class="eyebrow">BIBLIOTECA</span><h2>Conteúdo publicado</h2></div><span id="videoTotal">0 vídeos</span></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Vídeo</th><th>Acesso</th><th>Status</th><th>Views</th><th>Ações</th></tr></thead><tbody id="videoRows"></tbody></table></div></article></div></section>
    <section class="admin-view ${active('categories')}" data-admin-view="categories"><div class="admin-split categories-layout"><article class="admin-card"><span class="eyebrow">ORGANIZAÇÃO</span><h2>${tr('admin.newCategory','Nova categoria')}</h2><form id="categoryForm" class="admin-form"><label>Nome<input name="name" required minlength="2" maxlength="80"></label><label>${tr('admin.description','Descrição')}<textarea name="description" rows="4"></textarea></label><button class="btn btn-primary" type="submit">${tr('admin.createCategory','Criar categoria')}</button></form></article><article class="admin-card"><div class="card-head"><div><span class="eyebrow">TRILHAS</span><h2>Categorias ativas</h2></div></div><div class="category-list" id="categoryList"></div></article></div></section>
    <section class="admin-view ${active('analytics')}" data-admin-view="analytics"><div class="metric-grid" id="analyticsMetrics"></div><div class="admin-split analytics-layout"><article class="admin-card"><span class="eyebrow">AUDIÊNCIA</span><h2>Ranking de visualizações</h2><div class="ranking-list" id="rankingList"></div></article><article class="admin-card"><span class="eyebrow">NEGÓCIO</span><h2>Receita por período</h2><div class="revenue-big" id="revenueBig">R$ 0,00</div><p class="muted">Receitas pagas registradas pelo provedor de pagamento.</p><div class="mini-bars" id="revenueBars"></div></article></div></section>
    <section class="admin-view ${active('administrators')}" data-admin-view="administrators"><div class="admin-split admins-layout"><article class="admin-card invite-card"><div class="card-head"><div><span class="eyebrow">EQUIPE</span><h2>Adicionar administrador</h2></div>${icons.shield}</div><p class="muted">A pessoa deve criar e confirmar a conta primeiro. Depois, adicione o e-mail aqui. Acesso administrativo exige verificação em duas etapas.</p><form id="adminInviteForm" class="admin-form"><label>Nome<input name="name" required minlength="2" maxlength="80" placeholder="Nome da pessoa"></label><label>E-mail<input name="email" type="email" required autocomplete="email" placeholder="admin@empresa.com"></label><label>Função<select name="role"><option value="admin">Administrador</option><option value="owner">Proprietário</option></select></label><div class="role-preview" id="rolePreview"></div><button class="btn btn-primary" type="submit">${icons.users} Adicionar administrador</button></form></article><article class="admin-card table-card"><div class="card-head"><div><span class="eyebrow">ACESSOS</span><h2>Administradores</h2></div><span id="adminTotal">0 membros</span></div><div class="admin-member-list" id="adminMemberList"></div></article></div><article class="admin-card audit-card"><div class="card-head"><div><span class="eyebrow">SEGURANÇA</span><h2>Atividade administrativa</h2></div>${icons.activity}</div><div class="audit-list" id="auditList"></div></article></section>
    <section class="admin-view ${active('students')}" data-admin-view="students">${studentPanel()}</section>
    <section class="admin-view ${active('subscriptions')}" data-admin-view="subscriptions">${studentPanel(true)}</section>
  </div></main></div>`;
}

function flowBanner(){return `<a class="flow-banner" href="/blacktigersbjj/flow/"><span><small>TÉCNICA EM MOVIMENTO</small><strong>Tiger <em>Flow</em></strong><p>Pequenos ajustes. Grandes evoluções.</p></span><b>Explorar vídeos curtos ↗</b></a>`;}
function flowPage(){return `${header()}<main class="flow-page"><div class="flow-heading"><span class="eyebrow">BLACK TIGERS ORIGINAL</span><h1>Tiger <em>Flow</em></h1><p>Técnicas curtas para levar ao tatame.</p></div><div id="flowFeed" class="flow-feed" role="region" aria-label="Tiger Flow" tabindex="0"><div class="flow-empty">Carregando…</div></div></main>${footer()}`;}
async function loadPublicVideos(){return (await loadAllPublishedVideos()).filter(v=>v.format!=='short');}

function initAuthPage(){
  legacyAuthPage();
  const forgot = document.getElementById('forgotPassword');
  const replacement=forgot.cloneNode(true);forgot.replaceWith(replacement);
  const card = document.querySelector('.auth-card');
  card.insertAdjacentHTML('beforeend',`<form id="recoverForm" class="auth-form" hidden><h2>Redefinir senha</h2><p>Enviaremos um link seguro para seu e-mail.</p><label>E-mail<input name="email" type="email" required autocomplete="email"></label><button class="btn btn-primary" type="submit">Enviar link de recuperação</button><button class="btn btn-ghost" type="button" id="recoverBack">Voltar para entrar</button></form><form id="newPasswordForm" class="auth-form" hidden><h2>Crie sua nova senha</h2><label>Nova senha<input name="password" type="password" minlength="12" required autocomplete="new-password"></label><label>Confirmar senha<input name="confirm" type="password" minlength="12" required autocomplete="new-password"></label><button class="btn btn-primary" type="submit">Salvar nova senha</button></form>`);
  const recover=document.getElementById('recoverForm'), reset=document.getElementById('newPasswordForm');
  const hide = ()=>{document.getElementById('loginForm').hidden=true;document.getElementById('signupForm').hidden=true;document.querySelector('.auth-tabs').hidden=true;};
  replacement.onclick=()=>{hide();recover.hidden=false;recover.elements.email.value=document.getElementById('loginForm').elements.email.value;recover.elements.email.focus();setAuthStatus('');};
  document.getElementById('recoverBack').onclick=()=>location.assign('/blacktigersbjj/entrar/');
  let recoveryVerified=false;
  const showReset=()=>{recoveryVerified=true;hide();recover.hidden=true;reset.hidden=false;document.querySelector('.auth-card h1').textContent=bt.text('Redefinir senha');setAuthStatus('');history.replaceState(null,'','/blacktigersbjj/entrar/?modo=redefinir');};
  const params=new URLSearchParams(location.search), hash=new URLSearchParams(location.hash.slice(1));
  sb?.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY') showReset();});
  if(hash.get('error')||params.get('error')){hide();recover.hidden=false;setAuthStatus('Link inválido ou expirado. Solicite um novo link.','error');history.replaceState(null,'','/blacktigersbjj/entrar/');}
  if(hash.get('type')==='recovery') (async()=>{const {data:user,error}=await sb.auth.getUser(hash.get('access_token'));const {data}=await sb.auth.getSession();if(!error&&user.user&&data.session?.user.id===user.user.id)showReset();else{hide();recover.hidden=false;setAuthStatus('Link inválido ou expirado. Solicite um novo link.','error');}})();
  if(params.get('modo')==='redefinir' && !hash.has('access_token')) {hide();recover.hidden=false;setAuthStatus('Abra o link recebido por e-mail para criar uma nova senha.');}
  if(hash.get('type')==='invite') (async()=>{const {data:user,error}=await sb.auth.getUser(hash.get('access_token'));const {data}=await sb.auth.getSession();if(!error&&user.user&&data.session?.user.id===user.user.id)showReset();else{hide();recover.hidden=false;setAuthStatus('Link inválido ou expirado. Solicite um novo link.','error');}})();
  recover.onsubmit=async e=>{e.preventDefault();const button=recover.querySelector('[type=submit]');button.disabled=true;try{if(!sb)throw new Error('Serviço de login indisponível.');const {error}=await sb.auth.resetPasswordForEmail(recover.elements.email.value.trim(),{redirectTo:location.origin+'/blacktigersbjj/conta/'});if(error)throw error;setAuthStatus('Se houver uma conta com este e-mail, você receberá um link de recuperação. Verifique também o spam.','success');}catch(err){setAuthStatus(err.message,'error');}finally{button.disabled=false;}};
  reset.onsubmit=async e=>{e.preventDefault();if(!recoveryVerified)return setAuthStatus('Link inválido ou expirado. Solicite um novo link.','error');if(reset.elements.password.value!==reset.elements.confirm.value)return setAuthStatus('As senhas não coincidem.','error');const button=reset.querySelector('button');button.disabled=true;try{const {error}=await sb.auth.updateUser({password:reset.elements.password.value});if(error)throw error;await sb.auth.signOut();reset.hidden=true;setAuthStatus('Senha atualizada. Entre novamente com sua nova senha.','success');card.insertAdjacentHTML('beforeend','<a class="btn btn-primary" href="/blacktigersbjj/entrar/">Entrar</a>');}catch(err){setAuthStatus(err.message,'error');}finally{button.disabled=false;}};
}

function driveVideoId(value){
  const text=String(value||'').trim();
  if(/^gdrive:[A-Za-z0-9_-]{15,120}$/.test(text))return text.slice(7);
  try{const url=new URL(text);if(url.protocol!=='https:'||url.hostname!=='drive.google.com'||url.username||url.password)return null;const id=url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]{15,120})(?:\/|$)/)?.[1]||url.searchParams.get('id');return /^[A-Za-z0-9_-]{15,120}$/.test(id||'')?id:null;}catch{return null;}
}
function drivePlayerMarkup(fileId,title='Black Tigers BJJ'){
  if(!/^[A-Za-z0-9_-]{15,120}$/.test(fileId||''))return '';
  return `<iframe class="drive-video-frame" src="https://drive.google.com/file/d/${fileId}/preview" title="${escapeHTML(title)}" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
}
async function mayWatchDrive(video){
  const {data,error}=await sb.rpc('bt_video_access',{video_id:video.id});return !error&&data===true;
}
async function resolveVideoPlayback(video){
  if(!driveVideoId(video.storage_path))return sb.storage.from('bt-course-videos').createSignedUrl(video.storage_path,900);
  try{
    const bridge=window.BT_BUSINESS?.mediaBridge;
    if(bridge!=='https://ziezobr.github.io')throw new Error('Media service unavailable');
    const session=await getSession();
    const response=await window.BTSecurity.fetch(bridge+'/media/access/'+encodeURIComponent(video.id),{method:'POST',headers:session?.access_token?{Authorization:'Bearer '+session.access_token}:{}});
    const data=await response.json();
    if(!response.ok||typeof data.url!=='string'||!data.url.startsWith(bridge+'/media/play/'+video.id+'?'))throw new Error(data.error||'Media access denied');
    return {data:{signedUrl:data.url},error:null};
  }catch(error){return {data:null,error};}
}
function bindDriveSourceForm(){
  const form=document.getElementById('videoForm');if(!form)return;
  const source=form.elements.video_source;if(!source)return;
  const sync=()=>{const drive=source.value==='drive';form.querySelector('[data-drive-fields]').hidden=!drive;form.querySelector('[data-upload-fields]').hidden=drive;form.elements.file.required=!drive;form.elements.drive_url.required=drive;form.querySelector('button[type="submit"]').textContent=drive?'Salvar link do vídeo':'Enviar vídeo';};
  source.onchange=sync;form.addEventListener('reset',()=>setTimeout(sync,0));sync();
}
async function saveDriveVideo(formEl,session){
  const form=new FormData(formEl),id=driveVideoId(form.get('drive_url'));
  if(!id)return adminAlert('Cole um link válido de vídeo do Google Drive.','error');
  const duration=Math.round(Number(form.get('duration'))*60);
  if(!Number.isFinite(duration)||duration<=0)return adminAlert('Informe a duração do vídeo em minutos.','error');
  if(form.get('format')==='short'&&duration>180)return adminAlert('Tiger Flow aceita vídeos verticais de até 3 minutos.','error');
  const button=formEl.querySelector('button[type="submit"]');button.disabled=true;
  try{
    const title=String(form.get('title')).trim();
    const {data,error}=await sb.from('bt_videos').insert({title,slug:`${slugify(title)}-${Date.now().toString().slice(-6)}`,description:form.get('description')||null,category_id:form.get('category_id')||null,storage_path:'gdrive:'+id,duration_seconds:duration,format:form.get('format')||'lesson',audio_language:form.get('audio_language')||'pt-BR',thumbnail_url:form.get('thumbnail_url')||null,access_level:form.get('access_level'),published:form.get('published')==='on',featured:form.get('featured')==='on',created_by:session.user.id}).select('*, category:bt_categories(name)').single();
    if(error)throw error;adminState.videos.unshift(data);formEl.reset();renderAdmin();adminAlert('Link do Google Drive cadastrado. O arquivo não foi enviado ao Supabase.');
  }catch(error){adminAlert(error.message||'Não foi possível salvar o link.','error');}finally{button.disabled=false;}
}

function playerMarkup(url,poster='',vertical=false){return `<div class="tiger-player ${vertical?'vertical':''}" tabindex="0" aria-label="Player de vídeo"><video playsinline preload="metadata" ${vertical?'loop muted':''} poster="${escapeHTML(poster)}" src="${escapeHTML(url)}"></video><button class="player-center" data-play aria-label="Reproduzir">${icons.play}</button><div class="player-controls"><input class="player-seek" data-seek type="range" min="0" max="100" value="0" step="0.1" aria-label="Posição do vídeo"><div class="player-bar"><button data-play aria-label="Reproduzir">▶</button><button data-skip="-10" aria-label="Voltar 10 segundos">−10</button><button data-skip="10" aria-label="Avançar 10 segundos">+10</button><span data-time>0:00 / 0:00</span><button data-mute aria-label="Áudio">♪</button><input data-volume type="range" min="0" max="1" step="0.05" value="1" aria-label="Volume"><select data-speed aria-label="Velocidade">${[.5,.75,1,1.25,1.5,1.75,2].map(v=>`<option ${v===1?'selected':''}>${v}×</option>`).join('')}</select><button data-pip aria-label="Picture-in-picture">▣</button><button data-fullscreen aria-label="Tela cheia">⛶</button></div></div><p class="player-error" hidden>Não foi possível reproduzir o vídeo. Atualize a página para renovar o acesso.</p></div>`;}
function bindPlayer(host){
  const video=host.querySelector('video'),seek=host.querySelector('[data-seek]');
  const play=()=>video.paused?video.play().catch(()=>{host.querySelector('.player-error').hidden=false;}):video.pause();
  host.querySelectorAll('[data-play]').forEach(b=>b.onclick=play);video.onclick=play;
  host.querySelectorAll('[data-skip]').forEach(b=>b.onclick=()=>video.currentTime=Math.max(0,Math.min(video.duration||0,video.currentTime+Number(b.dataset.skip))));
  const time=n=>`${Math.floor((n||0)/60)}:${String(Math.floor((n||0)%60)).padStart(2,'0')}`;
  video.ontimeupdate=()=>{seek.value=video.duration?video.currentTime/video.duration*100:0;host.querySelector('[data-time]').textContent=time(video.currentTime)+' / '+time(video.duration);};
  seek.oninput=()=>{if(Number.isFinite(video.duration))video.currentTime=Number(seek.value)/100*video.duration;};
  const state=()=>{host.classList.toggle('playing',!video.paused);host.querySelector('.player-bar [data-play]').textContent=video.paused?'▶':'❚❚';};video.onplay=state;video.onpause=state;
  host.querySelector('[data-mute]').onclick=()=>{video.muted=!video.muted;host.querySelector('[data-mute]').textContent=video.muted?'♫̸':'♪';};
  host.querySelector('[data-volume]').oninput=e=>{video.volume=Number(e.target.value);video.muted=video.volume===0;};
  host.querySelector('[data-speed]').onchange=e=>video.playbackRate=parseFloat(e.target.value);
  const pip=host.querySelector('[data-pip]');pip.hidden=!document.pictureInPictureEnabled;pip.onclick=async()=>{try{if(document.pictureInPictureElement)await document.exitPictureInPicture();else await video.requestPictureInPicture();}catch{pip.hidden=true;}};
  host.querySelector('[data-fullscreen]').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(host.requestFullscreen)await host.requestFullscreen();else video.webkitEnterFullscreen?.();}catch{}};
  host.onkeydown=e=>{if(['INPUT','SELECT','BUTTON'].includes(e.target.tagName))return;if([' ','k','ArrowRight','ArrowLeft','m','f'].includes(e.key))e.preventDefault();if(e.key===' '||e.key==='k')play();if(e.key==='ArrowRight')video.currentTime=Math.min(video.duration||0,video.currentTime+10);if(e.key==='ArrowLeft')video.currentTime=Math.max(0,video.currentTime-10);if(e.key==='m')video.muted=!video.muted;if(e.key==='f')host.querySelector('[data-fullscreen]').click();};
  video.onerror=()=>host.querySelector('.player-error').hidden=false;
  return video;
}
async function initWatch(){
  const shell=document.getElementById('videoShell');
  if(!sb){shell.textContent=pro('loadError');return;}
  const id=new URLSearchParams(location.search).get('id');
  if(!id){shell.innerHTML='<div class="video-access-message"><h2>Escolha uma aula da biblioteca</h2><a class="btn btn-primary" href="/blacktigersbjj/catalogo/">Ver aulas disponíveis</a></div>';document.querySelector('.lesson-rail').hidden=true;return;}
  const {data:video,error}=await sb.from('bt_videos').select('*').eq('id',id).maybeSingle();
  if(error||!video){shell.innerHTML='<div class="video-access-message"><h2>Aula indisponível</h2><p>Entre com uma assinatura ativa para assistir.</p><a class="btn btn-primary" href="/blacktigersbjj/entrar/">Entrar</a></div>';document.querySelector('.lesson-rail').hidden=true;return;}
  document.getElementById('watchTitle').dataset.noTranslate='';document.getElementById('watchTitle').textContent=video.title;document.getElementById('watchDescription').textContent=video.description||'';
  const {data:signed,error:signError}=await resolveVideoPlayback(video);
  if(signError||!signed){shell.innerHTML='<div class="video-access-message"><h2>Conteúdo para assinantes</h2><a class="btn btn-primary" href="/blacktigersbjj/entrar/">Entrar</a></div>';return;}
  shell.innerHTML=playerMarkup(signed.signedUrl,window.BTSecurity.safeImage(video.thumbnail_url));const player=bindPlayer(shell.querySelector('.tiger-player'));let tokenExpiresAt=Date.now()+900000,lastPlaybackPosition=0;player.addEventListener('timeupdate',()=>lastPlaybackPosition=player.currentTime);player.addEventListener('error',async()=>{if(Date.now()<tokenExpiresAt-30000)return;tokenExpiresAt=Date.now()+900000;const {data,error}=await resolveVideoPlayback(video);if(error||!data)return;const position=lastPlaybackPosition;player.addEventListener('loadedmetadata',()=>{player.currentTime=position;shell.querySelector('.player-error').hidden=true;player.play().catch(()=>{});},{once:true});player.src=data.signedUrl;});attachCaptions(player,id,video.caption_tracks,video.audio_language);
  const session=await getSession();let lastSaved=0,tracked=false;
  if(session){const {data:progress}=await sb.from('bt_video_progress').select('watched_seconds,completed').eq('user_id',session.user.id).eq('video_id',id).maybeSingle();if(progress&&!progress.completed)player.addEventListener('loadedmetadata',()=>{if(progress.watched_seconds<player.duration)player.currentTime=progress.watched_seconds;},{once:true});}
  const save=async(force=false)=>{if(!session||(!force&&Date.now()-lastSaved<10000))return;lastSaved=Date.now();await sb.from('bt_video_progress').upsert({user_id:session.user.id,video_id:id,watched_seconds:Math.floor(player.currentTime),completed:!!player.duration&&player.currentTime/player.duration>=.9},{onConflict:'user_id,video_id'});};
  player.addEventListener('timeupdate',()=>save());player.addEventListener('pause',()=>save(true));player.addEventListener('ended',()=>save(true));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save(true);});
  player.addEventListener('play',async()=>{if(tracked)return;tracked=true;await sb.from('bt_video_views').insert({video_id:id,user_id:session?.user.id||null,session_id:crypto.randomUUID()});});
  const lessons=(await loadPublicVideos()).filter(v=>v.category_id===video.category_id);
  const rail=document.querySelector('.lesson-rail');rail.innerHTML='<div class="rail-head"><span>AULAS DA CATEGORIA</span></div>'+lessons.map((v,i)=>`<a class="${v.id===id?'active':''}" href="/blacktigersbjj/assistir/?id=${v.id}"><span>${i+1}</span><div><strong>${escapeHTML(v.title)}</strong><small>${duration(v.duration_seconds)}</small></div></a>`).join('');
  document.querySelector('.watch-copy').insertAdjacentHTML('beforeend','<p class="player-hint">Espaço: reproduzir · ← →: 10 segundos · F: tela cheia · M: áudio</p><button class="btn btn-ghost" id="theater">Modo cinema</button>');
  document.getElementById('theater').onclick=()=>document.querySelector('.watch-layout').classList.toggle('cinema');
}
async function initFlow(){
  const feed=document.getElementById('flowFeed');if(!feed)return;
  feed.setAttribute('aria-busy','true');
  try{
    if(!sb)throw new Error('Service unavailable');
    const {data:videos,error}=await sb.from('bt_videos').select('id,title,description,storage_path,thumbnail_url,access_level,duration_seconds').eq('published',true).eq('format','short').order('featured',{ascending:false}).order('created_at',{ascending:false});
    if(error)throw error;
    if(!videos?.length){feed.innerHTML='<div class="flow-empty"><span>↗</span><h2>Seu próximo ajuste começa aqui.</h2><p>Os vídeos curtos publicados pela equipe aparecerão no Tiger Flow.</p><a class="btn btn-primary" href="/blacktigersbjj/catalogo/">Explorar aulas</a></div>';return;}
    feed.innerHTML=videos.map(v=>`<article class="flow-item" id="flow-${v.id}"><div class="flow-media" data-flow-video="${v.id}" aria-live="polite"><div class="flow-loading" role="status">${pro('loading')}</div></div><div class="flow-caption"><span>TIGER FLOW</span><h2>${escapeHTML(v.title)}</h2><p>${escapeHTML(v.description||'')}</p><button class="btn btn-glass" data-flow-save="${v.id}">♡ Salvar</button><button class="btn btn-glass" data-flow-share="${v.id}">Compartilhar</button></div><div class="flow-arrows"><button data-flow-prev aria-label="Vídeo anterior">↑</button><button data-flow-next aria-label="Próximo vídeo">↓</button></div></article>`).join('');
    const items=[...feed.querySelectorAll('.flow-item')],pending=new Map(),loadedAt=new Map();let active=null;
    const loadPlayer=async(article,force=false)=>{
      const media=article.querySelector('.flow-media'),id=media.dataset.flowVideo;
      if(pending.has(id))return pending.get(id);
      const old=media.querySelector('video');
      if(!force&&old&&Date.now()-(loadedAt.get(id)||0)<13*60*1000)return old;
      const work=(async()=>{
        old?.pause();media.innerHTML=`<div class="flow-loading" role="status">${pro('loading')}</div>`;
        try{
          const v=videos.find(v=>v.id===id);
          const {data,error}=await resolveVideoPlayback(v);
          if(error||!data?.signedUrl)throw error||new Error('Media unavailable');
          media.innerHTML=playerMarkup(data.signedUrl,window.BTSecurity.safeImage(v.thumbnail_url),true);
          const host=media.querySelector('.tiger-player');host.classList.add('is-loading');
          host.insertAdjacentHTML('beforeend',`<span class="flow-loading" role="status">${pro('loading')}</span>`);
          const player=bindPlayer(host);player.muted=true;player.defaultMuted=true;player.playsInline=true;player.preload='auto';
          const ready=()=>{host.classList.remove('is-loading');host.querySelector('.player-error').hidden=true;};
          player.addEventListener('loadeddata',ready);player.addEventListener('playing',ready);player.addEventListener('waiting',()=>host.classList.add('is-loading'));
          player.addEventListener('error',()=>{
            host.classList.remove('is-loading','playing');const status=host.querySelector('.player-error');
            status.innerHTML=`<span>${pro(player.error?.code===4?'flowUnsupported':'loadError')}</span><button class="btn btn-primary" data-flow-reload>${pro('retry')}</button>`;status.hidden=false;
            status.querySelector('button').onclick=()=>activate(article,true);
          });
          loadedAt.set(id,Date.now());return player;
        }catch(error){
          const access=[400,401,403].includes(Number(error?.statusCode||error?.status));
          media.innerHTML=`<div class="flow-empty" role="alert"><p>${pro(access?'protected':'loadError')}</p><button class="btn btn-primary" data-flow-reload>${pro('retry')}</button>${access?`<a class="btn btn-glass" href="/blacktigersbjj/entrar/">${pro('signIn')}</a>`:''}</div>`;
          media.querySelector('button').onclick=()=>activate(article,true);return null;
        }
      })();pending.set(id,work);try{return await work;}finally{pending.delete(id);}
    };
    const activate=async(article,force=false)=>{
      if(!article)return;active=article;
      feed.querySelectorAll('video').forEach(v=>{if(v.closest('.flow-item')!==article)v.pause();});
      feed.querySelectorAll('.drive-flow-preview').forEach(preview=>{if(preview.closest('.flow-item')!==article){preview.querySelector('iframe')?.remove();preview.classList.remove('is-playing');preview.querySelector('[data-drive-play]').hidden=false;}});
      const player=await loadPlayer(article,force);
      if(player&&active===article&&!document.hidden){try{await player.play();}catch{player.closest('.tiger-player').classList.remove('playing','is-loading');}}
    };
    // Initialize the visible clip directly: mobile playback does not depend on an observer callback.
    const requested=new URLSearchParams(location.search).get('id');
    const initial=items.find(item=>item.id==='flow-'+requested)||items[0];
    if(initial!==items[0])feed.scrollTop=initial.offsetTop-items[0].offsetTop;
    activate(initial);
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting&&entry.intersectionRatio>=.6){if(active!==entry.target)activate(entry.target);}
        else{entry.target.querySelector('video')?.pause();if(active===entry.target)active=null;}
      }
    },{root:feed,threshold:[0,.6]});items.forEach(item=>observer.observe(item));
    const stepFlow=(article,direction)=>{const next=direction>0?article?.nextElementSibling:article?.previousElementSibling;if(next)feed.scrollTo({top:next.offsetTop-items[0].offsetTop,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
    feed.querySelectorAll('[data-flow-next],[data-flow-prev]').forEach(b=>b.onclick=()=>stepFlow(b.closest('article'),b.hasAttribute('data-flow-next')?1:-1));
    feed.addEventListener('keydown',event=>{if(event.target.closest('input,select,button'))return;if(['ArrowDown','ArrowUp','PageDown','PageUp'].includes(event.key)){event.preventDefault();stepFlow(active||items[0],['ArrowDown','PageDown'].includes(event.key)?1:-1);}});
    feed.querySelectorAll('[data-flow-save]').forEach(b=>b.onclick=()=>{const ids=window.BTSecurity.storedList('bt-flow-saved'),id=b.dataset.flowSave,saved=ids.includes(id);window.BTStorage.setItem('bt-flow-saved',JSON.stringify(saved?ids.filter(v=>v!==id):[...ids,id]));b.textContent=bt.text(saved?'♡ Salvar':'♥ Salvo');});
    feed.querySelectorAll('[data-flow-share]').forEach(b=>b.onclick=async()=>{const url=location.origin+'/blacktigersbjj/flow/?id='+b.dataset.flowShare;try{if(navigator.share)await navigator.share({title:'Tiger Flow',url});else{await navigator.clipboard.writeText(url);b.textContent=bt.text('Link copiado');}}catch{}});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){feed.querySelectorAll('video').forEach(v=>v.pause());feed.querySelectorAll('.drive-flow-preview').forEach(p=>{p.querySelector('iframe')?.remove();p.classList.remove('is-playing');p.querySelector('[data-drive-play]').hidden=false;});}else if(active)activate(active);});
    window.addEventListener('pagehide',()=>{observer.disconnect();feed.querySelectorAll('video').forEach(v=>v.pause());},{once:true});
  }catch{
    feed.innerHTML=`<div class="flow-empty" role="alert"><p>${pro('loadError')}</p><button class="btn btn-primary" data-flow-retry>${pro('retry')}</button></div>`;
    feed.querySelector('button').onclick=()=>initFlow();
  }finally{feed.setAttribute('aria-busy','false');}
}
function studentPanel(subs=false){return `<article class="admin-card"><div class="card-head"><div><span class="eyebrow">GESTÃO DE ACESSO</span><h2>${subs?'Assinaturas dos alunos':'Alunos'}</h2><p>Edite perfis e controle o acesso manual à biblioteca.</p></div></div><label class="search-box">${icons.search}<input data-student-search placeholder="Buscar por nome ou e-mail"></label><div class="student-list" data-student-list></div><div class="student-pager"><button class="btn btn-ghost" data-student-prev>Anterior</button><span data-student-page></span><button class="btn btn-ghost" data-student-next>Próxima</button></div></article><dialog id="${subs?'subscription':'student'}Dialog" class="student-dialog"></dialog>`;}
let studentPage=1,studentData=[];
async function invokeAdminFunction(name,options){
  const procedures={'bt-students':'bt_manage_students','bt-admin-members':'bt_manage_admins'};
  const procedure=procedures[name];if(!procedure)return {data:null,error:new Error('Invalid administration action')};
  return sb.rpc(procedure,{payload:options.body});
}

async function loadStudents(){
  document.querySelectorAll('[data-student-list]').forEach(list=>list.innerHTML='<p class="muted">Carregando…</p>');
  const {data,error}=await invokeAdminFunction('bt-students',{body:{action:'list',page:studentPage}});if(error||data?.error){adminAlert(data?.error||error.message,'error');return;}
  studentData=data.students||[];
  const render=()=>document.querySelectorAll('[data-student-list]').forEach(list=>{const term=list.closest('article').querySelector('[data-student-search]').value.toLowerCase();list.innerHTML=studentData.filter(u=>(u.name+' '+u.email).toLowerCase().includes(term)).map(u=>`<div class="student-row"><span class="member-avatar">${escapeHTML((u.name||u.email||'BT').slice(0,2).toUpperCase())}</span><div><strong>${escapeHTML(u.name||'Aluno')}</strong><small>${escapeHTML(u.email)}</small></div><span class="status-badge">${bt.text(u.subscription?.status||'inactive')}</span><span>${bt.text(u.subscription?.plan||'Plano gratuito')}</span><button class="btn btn-ghost" data-student-edit="${u.id}">${pro('studentAccess')}</button></div>`).join('')||'<p class="muted">Nenhum aluno encontrado.</p>';list.querySelectorAll('[data-student-edit]').forEach(b=>b.onclick=()=>editStudent(studentData.find(u=>u.id===b.dataset.studentEdit)));});
  document.querySelectorAll('[data-student-search]').forEach(input=>input.oninput=render);
  document.querySelectorAll('[data-student-page]').forEach(el=>el.textContent=studentPage);
  document.querySelectorAll('[data-student-prev]').forEach(b=>{b.disabled=studentPage===1;b.onclick=()=>{studentPage--;loadStudents();};});
  document.querySelectorAll('[data-student-next]').forEach(b=>{b.disabled=!data.hasMore;b.onclick=()=>{studentPage++;loadStudents();};});render();
}
function editStudent(student){
  const dialog=document.getElementById(adminSection==='subscriptions'?'subscriptionDialog':'studentDialog');const sub=student.subscription||{};
  dialog.innerHTML=`<button class="dialog-close" type="button" aria-label="Fechar">×</button><h2>Gerenciar aluno</h2><p>${escapeHTML(student.email)}</p><form class="admin-form" id="studentProfileForm"><label>Nome<input name="name" value="${escapeHTML(student.name)}" required minlength="2" maxlength="80"></label><button class="btn btn-ghost">Salvar perfil</button></form><hr><form class="admin-form" id="studentSubscriptionForm"><h3>${pro('studentAccess')}</h3><p>${pro('studentAccessHelp')}</p><label>Plano<select name="plan">${['monthly','annual','lifetime'].map(v=>`<option value="${v}" ${sub.plan===v?'selected':''}>${bt.text(v)}</option>`).join('')}</select></label><label>${pro('studentAccessState')}<select name="status">${['inactive','active'].map(v=>`<option value="${v}" ${(v==='active'&&['active','trialing','canceled'].includes(sub.status)&&(!sub.current_period_end||new Date(sub.current_period_end)>new Date()))?'selected':''}>${pro(v==='active'?'studentActive':'studentInactive')}</option>`).join('')}</select></label><label>Acesso até<input type="date" name="end" value="${sub.current_period_end?.slice(0,10)||''}"></label><p class="muted" data-access-hint></p><button class="btn btn-primary">${pro('studentAccessSave')}</button></form><p class="auth-status" role="status"></p>`;
  dialog.querySelector('.dialog-close').onclick=()=>dialog.close();dialog.showModal();
  const run=async(form,body)=>{const button=form.querySelector('button');button.disabled=true;try{const {data,error}=await invokeAdminFunction('bt-students',{body:{...body,user_id:student.id}});if(error||data?.error)throw new Error(data?.error||error.message);dialog.close();await loadStudents();await loadAdminData();adminAlert('Alterações salvas com sucesso.');}catch(err){dialog.querySelector('[role=status]').textContent=bt.text(err.message);}finally{button.disabled=false;}};
  const profile=dialog.querySelector('#studentProfileForm');profile.hidden=!!student.is_admin;profile.onsubmit=e=>{e.preventDefault();run(profile,{action:'profile',name:profile.elements.name.value});};
  const subscription=dialog.querySelector('#studentSubscriptionForm');
  const fields=subscription.elements;
  const updateAccessFields=()=>{
    const dated=fields.plan.value!=='lifetime';
    fields.end.disabled=!dated;
    fields.end.required=dated&&fields.status.value==='active';
    if(fields.end.required&&(!fields.end.value||new Date(fields.end.value+'T23:59:59')<=new Date())){
      const end=new Date();
      if(fields.plan.value==='annual')end.setFullYear(end.getFullYear()+1);else end.setMonth(end.getMonth()+1);
      fields.end.value=[end.getFullYear(),String(end.getMonth()+1).padStart(2,'0'),String(end.getDate()).padStart(2,'0')].join('-');
    }
    subscription.querySelector('[data-access-hint]').textContent=pro(fields.status.value==='active'?'studentActiveHelp':'studentInactiveHelp');
  };
  fields.plan.onchange=()=>{fields.end.value='';updateAccessFields();};
  fields.status.onchange=updateAccessFields;updateAccessFields();
  subscription.onsubmit=e=>{e.preventDefault();const f=subscription.elements;run(subscription,{action:'subscription',plan:f.plan.value,status:f.status.value,current_period_end:f.plan.value!=='lifetime'&&f.end.value?new Date(f.end.value+'T23:59:59').toISOString():null});};
}

function header(){
  const languageOptions=(bt?.options||[]).map(([value,label])=>`<option value="${value}" ${value===bt.language?'selected':''}>${({'pt-BR':'PT-BR','pt-PT':'PT-PT',en:'EN',es:'ES',it:'IT'})[value]}</option>`).join('');
  return `<header class="topbar-wrap stream-header pro-header"><div class="topbar"><div class="header-brand-group">${brand()}</div><nav class="desktop-nav stream-nav" aria-label="${tr('nav.home','Principal')}"><a href="/blacktigersbjj/catalogo/">${tr('nav.catalog','Catálogo')}</a><a href="/blacktigersbjj/planos/">${tr('nav.plans','Planos')}</a><a href="/blacktigersbjj/flow/">Tiger Flow</a><a href="/blacktigersbjj/ajuda/">${pro('help')}</a></nav><div class="top-actions"><button id="streamSearchOpen" class="header-icon" aria-label="${tr('catalog.search','Buscar')}" type="button">${icons.search}</button><label class="pro-language"><span class="sr-only">Idioma</span><select data-language aria-label="Idioma do site">${languageOptions}</select></label><a class="header-login pro-login" href="/blacktigersbjj/entrar/">${tr('auth.login','Entrar')}</a><a class="header-avatar" data-account-link href="/blacktigersbjj/conta/" hidden aria-label="${pro('accountData')}">BT</a><button class="mobile-menu-btn header-icon" aria-label="Abrir menu" type="button">${icons.menu}</button></div></div><nav class="mobile-nav" hidden><a href="/blacktigersbjj/catalogo/">${tr('nav.catalog','Catálogo')}</a><a href="/blacktigersbjj/planos/">${tr('nav.plans','Planos')}</a><a href="/blacktigersbjj/flow/">Tiger Flow</a><a href="/blacktigersbjj/conta/">${pro('accountData')}</a><a href="/blacktigersbjj/ajuda/">${pro('help')}</a><a data-admin-link hidden href="/blacktigersbjj/admin/">${tr('nav.admin','Admin')}</a></nav></header>`;
}

function pro(key){return window.BT_PRO_COPY?.[bt?.language]?.[key]||window.BT_PRO_COPY?.['pt-BR']?.[key]||key;}
function proEscape(value){return escapeHTML(String(value??''));}
function proStatus(){return window.BT_BUSINESS?.salesEnabled?'':`<div class="pro-status"><span></span>${pro('status')}</div>`;}
function proSupport(){const email=window.BT_BUSINESS?.supportEmail;if(email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return `<a class="btn btn-ghost" href="mailto:${proEscape(email)}">${proEscape(email)}</a>`;return `<p class="pro-muted">${pro('supportPending')}</p>`;}
function proPage(title,body){return `${header()}${proStatus()}<main id="main-content" class="pro-main"><div class="pro-document"><a class="pro-back" href="/blacktigersbjj/">← ${pro('back')}</a><h1>${title}</h1>${body}</div></main>${footer()}${searchOverlay()}`;}
function footer(){return `${legacyFooter()}<section class="pro-legal-footer"><nav aria-label="${pro('help')}">${[['ajuda','help'],['privacidade','privacy'],['termos','terms'],['reembolso','refund'],['acessibilidade','accessibility']].map(([path,key])=>`<a href="/blacktigersbjj/${path}/">${pro(key)}</a>`).join('')}</nav><p>${pro('audioNote')}</p><p>© ${new Date().getFullYear()} Black Tigers BJJ</p></section>`;}
function homePage(){return `${header()}${proStatus()}<main id="main-content" class="pro-home"><section class="pro-hero"><img src="/blacktigersbjj/assets/hero-bjj.jpg" alt="" fetchpriority="high" width="1536" height="1024"><div class="pro-hero-shade"></div><div class="pro-hero-inner"><span class="eyebrow">${pro('eyebrow')}</span><h1>${pro('hero1')}<br><em>${pro('hero2')}</em></h1><p>${pro('heroText')}</p><div class="pro-actions"><a class="btn btn-primary btn-large" href="/blacktigersbjj/catalogo/">${icons.play}${pro('catalog')}</a><a class="btn btn-glass btn-large" href="/blacktigersbjj/planos/">${pro('viewPlans')} ↗</a></div><div class="pro-hero-tags"><span class="bt-hero-label">BRAZILIAN JIU-JITSU</span><span>PT-BR</span><span>PT-PT</span><span>IT</span><span>ES</span><span>EN</span></div></div></section><div class="bt-discipline" aria-hidden="true"><span>TECHNIQUE</span><i>✳</i><span>FOCUS</span><i>✳</i><span>JIU-JITSU</span><i>✳</i><span>BLACK TIGERS</span></div><div class="pro-shell"><section class="bt-journey"><div class="bt-journey-photo"><img src="/blacktigersbjj/assets/course-guard.jpg" alt="" loading="lazy" width="1536" height="1024"><span>BLACK TIGERS / THE STUDY</span></div><div class="bt-journey-copy"><span class="eyebrow">BLACK TIGERS METHOD</span><h2>${pro('method')}</h2><p>${pro('methodText')}</p><ol>${[1,2,3].map(n=>`<li><span>0${n}</span><div><h3>${pro('feature'+n)}</h3><p>${pro('feature'+n+'Text')}</p></div></li>`).join('')}</ol><a class="btn btn-primary" href="/blacktigersbjj/catalogo/">${pro('catalog')} ↗</a></div></section><section class="pro-catalog-section"><div class="pro-section-head"><div><span class="eyebrow">BLACK TIGERS LIBRARY</span><h2>${pro('available')}</h2><p>${pro('accessNote')}</p></div><a href="/blacktigersbjj/catalogo/">${pro('catalog')} ↗</a></div><div class="catalog-grid poster-catalog" id="publicVideoGrid" aria-live="polite"><p class="pro-muted">${pro('loading')}</p></div></section><a class="pro-flow-feature" href="/blacktigersbjj/flow/"><div><span class="eyebrow">${pro('flow')}</span><h2>Tiger <em>Flow</em></h2><p>${pro('methodText')}</p></div><span aria-hidden="true">↗</span></a><section class="pro-global"><div class="pro-globe" aria-hidden="true">◎</div><div><span class="eyebrow">BR · PT · IT · ES · US · CA</span><h2>${pro('international')}</h2><p>${pro('internationalText')}</p><small>${pro('audioNote')}</small></div></section><section class="pro-faq"><h2>${pro('help')}</h2>${proFAQ()}<a class="btn btn-ghost" href="/blacktigersbjj/ajuda/">${pro('help')} ↗</a></section></div></main>${footer()}${searchOverlay()}`;}
function catalogPage(){return `${header()}${proStatus()}<main id="main-content" class="pro-main"><section class="pro-shell"><div class="pro-section-head"><div><span class="eyebrow">BLACK TIGERS LIBRARY</span><h1>${pro('available')}</h1><p>${pro('accessNote')}</p></div></div><label class="search-box pro-search">${icons.search}<span class="sr-only">${pro('catalog')}</span><input id="catalogSearch" type="search" placeholder="${tr('catalog.search','Buscar por técnica ou curso')}"></label><div class="catalog-grid poster-catalog" id="catalogGrid" aria-live="polite"><p>${pro('loading')}</p></div><p id="catalogEmpty" class="empty-state" hidden>${pro('empty')}</p><aside class="pro-info"><strong>${pro('audio')}</strong><p>${pro('audioNote')}</p></aside></section></main>${footer()}${searchOverlay()}`;}
function proLessonCard(item){const href=`/blacktigersbjj/curso/?id=${encodeURIComponent(item.id)}`;return `<article class="pro-lesson-card" data-no-translate data-search="${proEscape((item.title+' '+(item.description||'')).toLowerCase())}"><a href="${href}"><div class="pro-lesson-image"><img src="${proEscape(window.BTSecurity.safeImage(item.thumbnail_url))}" alt="" loading="lazy" width="640" height="360"><span class="pro-lesson-play">${icons.play}</span><small>${item.duration_seconds?duration(item.duration_seconds):'Black Tigers'}</small></div><div class="pro-lesson-copy"><span>${item.access_level==='free'?tr('common.free','Grátis'):tr('common.subscriber','Assinante')}</span><h3>${proEscape(item.title)}</h3><p>${proEscape(item.description||'')}</p></div></a></article>`;}
async function initCatalog(){
  const target=document.getElementById(page==='home'?'publicVideoGrid':'catalogGrid');if(!target)return;
  const load=async()=>{target.setAttribute('aria-busy','true');try{
    const videos=await loadPublicVideos();fallbackCourses.splice(0,fallbackCourses.length,...videos);
    target.innerHTML=videos.length?videos.slice(0,page==='home'?6:200).map(proLessonCard).join(''):`<div class="pro-empty"><span>${icons.video}</span><h3>${pro('empty')}</h3><p>${pro('emptyText')}</p><a class="btn btn-ghost" href="/blacktigersbjj/entrar/">${pro('signIn')}</a></div>`;
    const search=document.getElementById('catalogSearch');if(search)search.oninput=()=>{const value=search.value.trim().toLowerCase();let visible=0;target.querySelectorAll('[data-search]').forEach(card=>{card.hidden=!card.dataset.search.includes(value);if(!card.hidden)visible++;});document.getElementById('catalogEmpty').hidden=visible>0||!videos.length;};
  }catch{target.innerHTML=`<div class="pro-empty" role="alert"><p>${pro('loadError')}</p><button class="btn btn-ghost" id="retryCatalog">${pro('retry')}</button></div>`;document.getElementById('retryCatalog').onclick=load;}finally{target.setAttribute('aria-busy','false');}};await load();
}
function coursePage(){return proPage(pro('available'),`<div id="courseDetail" aria-live="polite"><p>${pro('loading')}</p></div>`);}
async function initCourse(){
  const target=document.getElementById('courseDetail');const params=new URLSearchParams(location.search);const id=params.get('id');const slug=params.get('curso');
  if(!sb||(!id&&!slug)||(id&&!window.BTSecurity.uuid(id))||(slug&&!/^[a-z0-9-]{1,160}$/.test(slug))){target.innerHTML=`<h2>${pro('unavailable')}</h2><p>${pro('protected')}</p><a class="btn btn-primary" href="/blacktigersbjj/catalogo/">${pro('catalog')}</a>`;return;}
  try{let query=sb.from('bt_videos').select('id,title,description,duration_seconds,thumbnail_url,access_level,published,format').eq('published',true);query=id?query.eq('id',id):query.eq('slug',slug);const {data:item,error}=await query.maybeSingle();if(error||!item)throw new Error('unavailable');
    target.innerHTML=`<article class="pro-course-detail" data-no-translate><img src="${proEscape(window.BTSecurity.safeImage(item.thumbnail_url))}" alt="" width="640" height="360"><div><span class="eyebrow">BLACK TIGERS</span><h2>${proEscape(item.title)}</h2><p>${proEscape(item.description||'')}</p><div class="pro-detail-meta"><span>${item.access_level==='free'?tr('common.free','Grátis'):tr('common.subscriber','Assinante')}</span>${item.duration_seconds?`<span>${duration(item.duration_seconds)}</span>`:''}</div><a class="btn btn-primary" href="${item.format==='short'?'/blacktigersbjj/flow/':'/blacktigersbjj/assistir/'}?id=${item.id}">${icons.play}${pro('viewLesson')}</a></div></article><aside class="pro-info"><strong>${pro('audio')}</strong><p>${pro('audioNote')}</p></aside><aside class="pro-info"><strong>${pro('safetyTitle')}</strong><p>${pro('safetyText')}</p></aside>`;
  }catch{target.innerHTML=`<h2>${pro('unavailable')}</h2><p>${pro('protected')}</p><a class="btn btn-primary" href="/blacktigersbjj/entrar/">${pro('signIn')}</a>`;}
}
function communityPage(){return proPage(pro('communityTitle'),`<p class="pro-lead">${pro('communityText')}</p><aside class="pro-info"><p>${pro('communityRules')}</p></aside><a class="btn btn-primary" href="/blacktigersbjj/catalogo/">${pro('catalog')}</a>`);}
function plansPage(){return `${header()}${proStatus()}<main id="main-content" class="pro-main"><section class="pro-shell"><div class="pro-section-head"><div><span class="eyebrow">BLACK TIGERS ACCESS</span><h1>${pro('plansTitle')}</h1><p>${pro('plansText')}</p></div></div><div class="pro-plan-grid">${['monthly','annual'].map(type=>`<article class="pro-plan"><span class="eyebrow">BLACK TIGERS</span><h2>${pro(type)}</h2><p>${pro(type+'Text')}</p><strong>${pro('pricePending')}</strong><a class="btn btn-ghost" href="/blacktigersbjj/checkout/?plano=${type==='annual'?'anual':'mensal'}">${pro('checkoutDisabled')}</a></article>`).join('')}</div><div class="pro-info"><label for="purchaseMarket">${pro('market')}</label><select id="purchaseMarket" data-market><option value="BR">Brasil · BRL</option><option value="EU">Italia / Portugal / España · EUR</option><option value="US">United States · USD</option><option value="CA">Canada · CAD</option><option value="LATAM">América Latina</option></select><p>${pro('marketNote')}</p></div><aside class="pro-info"><strong>${pro('audio')}</strong><p>${pro('audioNote')}</p></aside><a href="/blacktigersbjj/reembolso/">${pro('refund')} ↗</a></section></main>${footer()}${searchOverlay()}`;}
function checkoutPage(){return proPage(pro('checkoutTitle'),`<p class="pro-lead">${pro('checkoutText')}</p><div class="pro-info"><strong>${pro('plansText')}</strong><p>${pro('marketNote')}</p></div><div class="pro-actions"><button class="btn btn-ghost" type="button" disabled>${pro('checkoutDisabled')}</button><a class="btn btn-primary" href="/blacktigersbjj/catalogo/">${pro('catalog')}</a></div><p><a href="/blacktigersbjj/reembolso/">${pro('refund')}</a> · <a href="/blacktigersbjj/termos/">${pro('terms')}</a></p>`);}
function proFAQ(){return [['faq1','faq1Text'],['faq2','audioNote'],['faq3','checkoutText'],['faq4','faq4Text']].map(([q,a])=>`<details><summary>${pro(q)}</summary><p>${pro(a)}</p></details>`).join('');}
function helpPage(){return proPage(pro('help'),`<div class="pro-faq">${proFAQ()}</div><h2>${pro('help')}</h2>${proSupport()}<p><a href="/blacktigersbjj/entrar/">${pro('faq4')} ↗</a></p><p><a href="/blacktigersbjj/reembolso/">${pro('refund')} ↗</a></p>`);}
function legalPage(){
  const type=page;const key={privacidade:'privacy',termos:'terms',reembolso:'refund',acessibilidade:'accessibility'}[type];
  const biz=window.BT_BUSINESS;const notice=biz.legalApproved?'':`<aside class="pro-info pro-draft">${pro('legalStatus')}</aside>`;
  const supplier=biz.legalName?`<section><h2>${pro('supplier')}</h2><p>${[biz.legalName,biz.registration,biz.address,biz.country].filter(Boolean).map(proEscape).join('<br>')}</p>${proSupport()}</section>`:'';
  const paragraph=(heading,text)=>`<section><h2>${pro(heading)}</h2><p>${pro(text)}</p></section>`;
  let content='';
  if(type==='privacidade')content=paragraph('dataTitle','dataText')+paragraph('privacy','vendorsText')+paragraph('accountData','rightsText')+paragraph('privacy','cookiesText')+`<div class="pro-actions"><button class="btn btn-ghost" id="exportAccountData">${pro('export')}</button><button class="btn btn-ghost" id="clearLocalPreferences">${pro('clear')}</button></div><p id="privacyActionStatus" role="status"></p>`;
  if(type==='termos')content=paragraph('useTitle','useText')+paragraph('safetyTitle','safetyText')+paragraph('audio','audioNote');
  if(type==='reembolso')content=`<p class="pro-lead">${pro('refundText')}</p><p>${pro('refundRegions')}</p>${proSupport()}`;
  if(type==='acessibilidade')content=`<p class="pro-lead">${pro('accessText')}</p>${proSupport()}`;
  return proPage(pro(key),`${notice}${supplier}${content}<p class="pro-muted">${pro('updated')} 26/10/2026</p>`);
}
function securityPage(){return proPage(pro('security'),`<p class="pro-lead">${pro('securityText')}</p><div class="pro-security-card" id="securityContent"><p>${tr('common.loading','Carregando…')}</p></div>`);}
async function initSecurity(){
  const host=document.getElementById('securityContent');const session=await getSession();if(!session){host.innerHTML=`<a class="btn btn-primary" href="/blacktigersbjj/entrar/?next=/seguranca/">${pro('signIn')}</a>`;return;}
  const render=async()=>{const {data,error}=await sb.auth.mfa.listFactors();if(error){host.textContent=pro('mfaError');return;}const verified=(data.totp||[]).filter(f=>f.status==='verified');host.innerHTML=`<h2>${pro('security')}</h2><p>${verified.length?pro('mfaActive'):pro('mfaNone')}</p>${verified.length?'':`<button class="btn btn-primary" id="startMfa">${pro('mfaEnable')}</button>`}<div id="mfaEnrollment"></div><hr><button class="btn btn-ghost" id="logoutEverywhere">${pro('logoutAll')}</button><p id="securityActionStatus" role="status"></p>`;
    document.getElementById('logoutEverywhere').onclick=async()=>{if(!confirm(pro('logoutConfirm')))return;const {error}=await sb.auth.signOut({scope:'global'});if(error){document.getElementById('securityActionStatus').textContent=pro('mfaError');return;}location.assign('/blacktigersbjj/entrar/');};
    const start=document.getElementById('startMfa');if(start)start.onclick=async()=>{start.disabled=true;try{const {data,error}=await sb.auth.mfa.enroll({factorType:'totp',friendlyName:'Black Tigers '+new Date().toISOString().slice(0,16)});if(error)throw error;const target=document.getElementById('mfaEnrollment');const qr=data.totp.qr_code;if(!/^data:image\/svg\+xml[;,]/.test(qr))throw new Error('invalid qr');target.innerHTML=`<p>${pro('mfaScan')}</p><img class="mfa-qr" src="${proEscape(qr)}" alt="QR code" width="240" height="240"><form id="mfaEnrollForm" class="auth-form"><label>${pro('mfaCode')}<input name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" required></label><button class="btn btn-primary">${pro('mfaVerify')}</button><button type="button" class="btn btn-ghost" id="cancelMfa">${tr('common.cancel','Cancelar')}</button></form><p id="mfaEnrollStatus" role="status"></p>`;
      document.getElementById('cancelMfa').onclick=async()=>{await sb.auth.mfa.unenroll({factorId:data.id});await render();};
      document.getElementById('mfaEnrollForm').onsubmit=async e=>{e.preventDefault();const button=e.currentTarget.querySelector('button');button.disabled=true;try{const {error}=await sb.auth.mfa.challengeAndVerify({factorId:data.id,code:e.currentTarget.elements.code.value});if(error)throw error;await render();}catch{document.getElementById('mfaEnrollStatus').textContent=pro('mfaError');button.disabled=false;}};
    }catch{start.disabled=false;document.getElementById('securityActionStatus').textContent=pro('mfaError');}};
  };await render();
}
async function initPrivacy(){
  document.getElementById('clearLocalPreferences')?.addEventListener('click',()=>{['bt-language','bt-favorites','bt-flow-saved','bt-market','bt-session'].forEach(k=>window.BTStorage.removeItem(k));document.getElementById('privacyActionStatus').textContent=pro('clearDone');});
  const button=document.getElementById('exportAccountData');if(!button)return;button.onclick=async()=>{button.disabled=true;const status=document.getElementById('privacyActionStatus');try{const session=await getSession();if(!session){status.innerHTML=`<a href="/blacktigersbjj/entrar/?next=/privacidade/">${pro('signIn')}</a>`;return;}const {data:userData,error:userError}=await sb.auth.getUser();if(userError||!userData.user)throw userError;const user=userData.user;const tables=['bt_subscriptions','bt_video_progress','bt_video_views'];const results=await Promise.all(tables.map(table=>sb.from(table).select('*').eq('user_id',user.id).limit(1000)));const output={exported_at:new Date().toISOString(),account:{id:user.id,email:user.email,name:user.user_metadata?.name||'',created_at:user.created_at},data:{},notes:[]};results.forEach((result,index)=>{output.data[tables[index]]=result.data||[];if(result.error)output.notes.push(tables[index]+': unavailable');if(result.data?.length===1000)output.notes.push(tables[index]+': export limited to first 1000 records; request a complete export through support');});const blob=new Blob([JSON.stringify(output,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='black-tigers-account.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent=pro('export');}catch{status.textContent=pro('loadError');}finally{button.disabled=false;}};
}
function proReadiness(){const biz=window.BT_BUSINESS;return `<article class="admin-card"><h2>${pro('operation')}</h2><p>${pro('operationText')}</p><div class="pro-readiness">${[[pro('supplier'),Boolean(biz.legalName&&biz.registration&&biz.country&&biz.address)],[pro('help'),Boolean(biz.supportEmail&&biz.privacyEmail)],[pro('terms'),biz.legalApproved],['Supabase · RLS / MFA / backups',biz.backendAuditVerified],['Checkout / webhooks',biz.salesEnabled]].map(([label,ready])=>`<div><strong>${label}</strong><span class="status-badge ${ready?'published':'draft'}">${pro(ready?'configured':'pending')}</span></div>`).join('')}</div><a class="btn btn-ghost" href="/blacktigersbjj/ajuda/">${pro('help')}</a></article>`;}
function enhanceProfessionalUI(){
  const main=document.querySelector('main');if(main){main.id='main-content';main.tabIndex=-1;}document.body.insertAdjacentHTML('afterbegin',`<a class="skip-link" href="#main-content">${pro('skip')}</a>`);
  document.querySelector('.mobile-menu-btn')?.setAttribute('aria-expanded','false');document.querySelector('.mobile-menu-btn')?.addEventListener('click',e=>e.currentTarget.setAttribute('aria-expanded',String(!document.querySelector('.mobile-nav')?.hidden)));
  const search=document.getElementById('streamSearch');if(search){search.setAttribute('role','dialog');search.setAttribute('aria-modal','true');search.setAttribute('aria-label',tr('catalog.search','Buscar'));}
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&search&&!search.hidden)document.getElementById('streamSearchClose')?.click();if(e.key==='Tab'&&search&&!search.hidden){const focusable=[...search.querySelectorAll('a[href],button,input,select,[tabindex="0"]')].filter(el=>!el.hidden&&!el.disabled);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
  document.querySelectorAll('[data-market]').forEach(select=>{const saved=window.BTStorage.getItem('bt-market');if(['BR','EU','US','CA','LATAM'].includes(saved))select.value=saved;select.onchange=()=>window.BTStorage.setItem('bt-market',select.value);});
  if(page==='conta')document.querySelector('.account-grid')?.insertAdjacentHTML('beforeend',`<article class="account-card"><h2>${pro('security')}</h2><p>${pro('securityText')}</p><a class="btn btn-ghost" href="/blacktigersbjj/seguranca/">${pro('security')}</a></article><article class="account-card"><h2>${pro('accountData')}</h2><a class="btn btn-ghost" href="/blacktigersbjj/privacidade/">${pro('accountData')}</a></article>`);
  if(page==='entrar')document.querySelector('.auth-card')?.insertAdjacentHTML('beforeend',`<p class="pro-muted auth-policy-links"><a href="/blacktigersbjj/privacidade/">${pro('privacy')}</a> · <a href="/blacktigersbjj/termos/">${pro('terms')}</a> · <a href="/blacktigersbjj/ajuda/">${pro('help')}</a></p>`);
  if(page==='admin'){document.querySelector('.admin-sidebar nav')?.insertAdjacentHTML('beforeend',`<a data-permission="manage_admins" href="/blacktigersbjj/admin/launch/" class="${adminSection==='launch'?'active':''}">${icons.shield}<span>${pro('operation')}</span></a>`);document.getElementById('adminContent')?.insertAdjacentHTML('beforeend',`<section class="admin-view ${adminSection==='launch'?'active':''}" data-admin-view="launch">${proReadiness()}</section>`);}
  if(page==='curso')initCourse();if(page==='seguranca')initSecurity();if(page==='privacidade')initPrivacy();
  if(sb)sb.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'&&page==='admin')setTimeout(()=>location.replace('/blacktigersbjj/entrar/'),0);});
}

function watchPage(){return `${header()}<main id="main-content" class="watch-main"><div class="container watch-layout"><section><div class="video-shell" id="videoShell"><div class="pro-empty">${pro('loading')}</div></div><div class="watch-copy"><span class="eyebrow">BLACK TIGERS</span><h1 id="watchTitle">${pro('viewLesson')}</h1><p id="watchDescription"></p><p>${pro('audioNote')}</p><div id="captionOptions"></div></div></section><aside class="lesson-rail"><div class="rail-head">${pro('available')}</div></aside></div></main>${footer()}`;}
async function secureSignupSubmit(event){
  event.preventDefault();const form=event.currentTarget;const button=form.querySelector('[type=submit]');if(button.disabled)return;button.disabled=true;
  try{if(!sb)throw new TypeError('unavailable');const name=form.elements.name.value.trim();if(name.length<2||name.length>80||form.elements.password.value.length<12){setAuthStatus(pro('passwordHint'),'error');return;}const {data,error}=await sb.auth.signUp({email:form.elements.email.value.trim(),password:form.elements.password.value,options:{data:{name,application:'black-tigers-bjj'},emailRedirectTo:location.origin+'/blacktigersbjj/conta/'}});if(error)throw error;setAuthStatus(pro('signupCheck'),'success');if(data.session)location.assign('/blacktigersbjj/conta/?lang='+encodeURIComponent(bt.language));}catch(error){setAuthStatus(pro(error?.name==='AuthRetryableFetchError'||error instanceof TypeError||error?.name==='AbortError'?'authUnavailable':'authFailure'),'error');}finally{button.disabled=false;}
}

async function secureLoginSubmit(event){
  event.preventDefault();const form=event.currentTarget;const button=form.querySelector('[type=submit]');if(button.disabled)return;button.disabled=true;
  const fail=()=>setAuthStatus(pro('authFailure'),'error');
  const finish=async user=>{const requested=new URLSearchParams(location.search).get('next');const destination=requested?window.BTSecurity.returnPath(requested):(await isAdmin(user.id)?'/blacktigersbjj/admin/':'/blacktigersbjj/conta/');const url=new URL(destination,location.origin);url.searchParams.set('lang',bt.language);location.assign(url.href);};
  try{
    if(!sb)throw new Error('unavailable');const {data,error}=await sb.auth.signInWithPassword({email:form.elements.email.value.trim(),password:form.elements.password.value});if(error)throw error;
    const {data:assurance,error:assuranceError}=await sb.auth.mfa.getAuthenticatorAssuranceLevel();if(assuranceError)throw assuranceError;
    if(assurance.nextLevel==='aal2'&&assurance.currentLevel!=='aal2'){
      const {data:factors,error}=await sb.auth.mfa.listFactors();if(error)throw error;const factor=(factors.totp||[]).find(f=>f.status==='verified');if(!factor)throw new Error('factor unavailable');
      form.hidden=true;document.querySelector('.auth-tabs').hidden=true;
      const card=document.querySelector('.auth-card');card.insertAdjacentHTML('beforeend',`<form id="mfaLoginForm" class="auth-form"><label>${pro('mfaCode')}<input name="code" required inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code"></label><button class="btn btn-primary">${pro('mfaVerify')}</button><a href="/blacktigersbjj/entrar/">${pro('back')}</a></form>`);
      document.getElementById('mfaLoginForm').onsubmit=async e=>{e.preventDefault();const submit=e.currentTarget.querySelector('button');submit.disabled=true;try{const {error}=await sb.auth.mfa.challengeAndVerify({factorId:factor.id,code:e.currentTarget.elements.code.value});if(error)throw error;await finish(data.user);}catch{fail();submit.disabled=false;}};return;
    }
    await finish(data.user);
  }catch(error){setAuthStatus(pro(error?.name==='AuthRetryableFetchError'||error instanceof TypeError||error?.name==='AbortError'?'authUnavailable':'authFailure'),'error');}finally{button.disabled=false;}
}
function attachCaptions(player,videoId,serverTracks=[],audioLanguage='pt-BR'){
  const tracks=[...(Array.isArray(serverTracks)?serverTracks:[]),...(window.BT_BUSINESS?.captions?.[videoId]||[])].slice(0,10);const valid=tracks.filter(t=>['pt-BR','pt-PT','en','es','it'].includes(t.language)&&typeof t.src==='string'&&t.src.startsWith('/blacktigersbjj/assets/captions/')&&/\.vtt$/.test(t.src)&&!t.src.includes('..'));
  for(const item of valid){const track=document.createElement('track');track.kind='captions';track.label=item.label||item.language;track.srclang=item.language;track.src=item.src;track.default=item.language===bt.language;player.appendChild(track);}
  const host=document.getElementById('captionOptions');if(!host)return;
  if(!valid.length){host.innerHTML=`<p>${pro('audio')}: ${escapeHTML(audioLanguage)}</p><p class="pro-muted">${pro('noCaptions')}</p>`;return;}
  host.innerHTML=`<label>${pro('captions')}<select id="captionSelect"><option value="">—</option>${valid.map((t,i)=>`<option value="${i}" ${t.language===bt.language?'selected':''}>${escapeHTML(t.label||t.language)}</option>`).join('')}</select></label>`;
  document.getElementById('captionSelect').onchange=e=>{for(let i=0;i<player.textTracks.length;i++)player.textTracks[i].mode=e.target.value===String(i)?'showing':'disabled';};
}

const renderers = { ajuda: helpPage, privacidade: legalPage, termos: legalPage, reembolso: legalPage, acessibilidade: legalPage, seguranca: securityPage, flow: flowPage, home: homePage, catalogo: catalogPage, comunidade: communityPage, curso: coursePage, assistir: watchPage, planos: plansPage, entrar: loginPage, checkout: checkoutPage, conta: accountPage, admin: adminShell };
root.innerHTML = (renderers[page] || homePage)();


window.BTI18n.observe(root);

function bindGlobalUI() {
  document.querySelectorAll('[data-language]').forEach(select => select.addEventListener('change', event => bt?.set(event.target.value)));
  const menuButton = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  menuButton?.addEventListener('click', () => {
    const open = mobileNav.hasAttribute('hidden');
    mobileNav.toggleAttribute('hidden', !open);
    menuButton.innerHTML = open ? icons.close : icons.menu;
  });


  document.querySelectorAll('.student-menu a').forEach(link => link.addEventListener('click', () => link.closest('details')?.removeAttribute('open')));

  document.querySelectorAll('[data-row-prev],[data-row-next]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.rowPrev || button.dataset.rowNext;
    const row = document.getElementById(id);
    if (!row) return;
    row.scrollBy({ left: (button.dataset.rowNext ? 1 : -1) * Math.max(320, row.clientWidth * .82), behavior: 'smooth' });
  }));

  const search = document.getElementById('streamSearch');
  const searchInput = document.getElementById('globalSearchInput');
  const searchResults = document.getElementById('globalSearchResults');
  const openSearch = () => {
    if (!search) return;
    search.hidden = false;
    document.body.classList.add('search-open');
    setTimeout(() => searchInput?.focus(), 80);
  };
  const closeSearch = () => {
    if (!search) return;
    search.hidden = true;
    document.body.classList.remove('search-open');
  };
  document.getElementById('streamSearchOpen')?.addEventListener('click', openSearch);
  document.getElementById('mobileSearchOpen')?.addEventListener('click', openSearch);
  document.getElementById('streamSearchClose')?.addEventListener('click', closeSearch);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeSearch(); });
  searchInput?.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      searchResults.innerHTML = '<p>Digite para encontrar seu próximo treino.</p>';
      return;
    }
    const matches = fallbackCourses.filter(item => `${item.title} ${item.description} ${item.category?.name || ''}`.toLowerCase().includes(query));
    searchResults.innerHTML = matches.length ? matches.map(item => `<a href="${courseHref(item)}"><img src="${escapeHTML(window.BTSecurity.safeImage(item.thumbnail_url))}" alt=""><span><b>${escapeHTML(item.title)}</b><small>${escapeHTML(item.category?.name || item.level)}</small></span>${icons.chevron}</a>`).join('') : '<p>Nenhum curso encontrado. Tente outro termo.</p>';
  });

  const getFavorites = () => window.BTSecurity.storedList('bt-favorites');
  document.querySelectorAll('[data-favorite]').forEach(button => {
    const slug = button.dataset.favorite;
    const sync = () => button.classList.toggle('is-favorite', getFavorites().includes(slug));
    sync();
    button.addEventListener('click', () => {
      const current = getFavorites();
      const next = current.includes(slug) ? current.filter(item => item !== slug) : [...current, slug];
      window.BTStorage.setItem('bt-favorites', JSON.stringify(next));
      sync();
    });
  });

  const loader = document.getElementById('btLoader');
  if (loader) setTimeout(() => {
    loader.classList.add('loaded');
    setTimeout(() => loader.remove(), 520);
  }, document.readyState === 'complete' ? 450 : 700);
}

async function getSession() {
  if (!sb) return null;
  const { data } = await Promise.race([sb.auth.getSession(),new Promise(resolve=>setTimeout(()=>resolve({data:{session:null}}),15000))]);
  return data.session;
}

async function isAdmin(userId) {
  if (!sb || !userId) return false;
  const { data, error } = await sb.from('bt_admins').select('user_id,status').eq('user_id', userId).eq('status', 'active').maybeSingle();
  return !error && Boolean(data);
}

async function hydrateSessionUI() {
  const session = await getSession();
  if (!session) return;
  await sb.from('bt_students').upsert({user_id:session.user.id},{onConflict:'user_id',ignoreDuplicates:true});
  document.querySelectorAll('.header-login').forEach(el => el.hidden = true);
  document.querySelectorAll('[data-account-link]').forEach(el => {
    el.hidden = false;
    const name = session.user.user_metadata?.name || session.user.email || 'BT';
    el.textContent = name.slice(0, 2).toUpperCase();
  });
  if (await isAdmin(session.user.id)) document.querySelectorAll('[data-admin-link]').forEach(el => el.hidden = false);
}

async function loadAllPublishedVideos() {
  if (!sb) throw new Error('Authentication service unavailable');
  const { data, error } = await sb.from('bt_videos').select('*, category:bt_categories(name,slug)').eq('published', true).order('featured', { ascending: false }).order('created_at', { ascending: false });
  if(error)throw error;return data||[];
}

function setupCatalogFilters() {
  const input = document.getElementById('catalogSearch');
  const chips = [...document.querySelectorAll('[data-filter]')];
  let level = 'todos';
  const update = () => {
    const query = (input?.value || '').toLowerCase().trim();
    let visible = 0;
    document.querySelectorAll('#catalogGrid .poster-card').forEach(card => {
      const matches = (level === 'todos' || card.dataset.level === level) && card.textContent.toLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) visible++;
    });
    const empty = document.getElementById('catalogEmpty');
    if (empty) empty.hidden = visible > 0;
  };
  input?.addEventListener('input', update);
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(item => item.classList.remove('active'));
    chip.classList.add('active');
    level = chip.dataset.filter;
    update();
  }));
}


function setAuthStatus(message, type = '') {
  const el = document.getElementById('authStatus');
  if (!el) return;
  el.textContent = message;
  el.className = `auth-status ${type}`;
}

function legacyAuthPage() {
  const tabs = [...document.querySelectorAll('[data-auth-tab]')];
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(item => item.classList.toggle('active', item === tab));
    const login = tab.dataset.authTab === 'login';
    loginForm.hidden = !login;
    signupForm.hidden = login;
    setAuthStatus('');
  }));
  loginForm?.addEventListener('submit', secureLoginSubmit);
  signupForm?.addEventListener('submit', secureSignupSubmit);
  document.getElementById('forgotPassword')?.addEventListener('click', async () => {
    if (!sb) return;
    const email = loginForm?.elements.email.value;
    if (!email) return setAuthStatus('Informe seu e-mail primeiro.', 'error');
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/blacktigersbjj/conta/` });
    setAuthStatus(error ? error.message : 'Link de redefinição enviado para seu e-mail.', error ? 'error' : 'success');
  });
}

async function initAccount() {
  const session = await getSession();
  if (!session) {
    const email = document.querySelector('[data-account-email]');
    if (email) email.innerHTML = `Você ainda não entrou. <a href="/blacktigersbjj/entrar/">Acessar minha conta</a>`;
    return;
  }
  document.querySelector('[data-account-email]').textContent = session.user.email;
  const { data: subscriptions } = await sb.from('bt_subscriptions').select('*').eq('user_id', session.user.id).in('status', ['active','trialing','canceled']).order('created_at', { ascending: false }).limit(1);
  const subscription= subscriptions?.find(item=>!item.current_period_end || new Date(item.current_period_end)>new Date());
  if (subscription) {
    document.querySelector('[data-subscription-status]').textContent = `${bt.text(subscription.plan)} · ${bt.text(subscription.status)}`;
    document.querySelector('[data-subscription-copy]').textContent = subscription.current_period_end ? `${bt.text('Acesso até')} ${new Date(subscription.current_period_end).toLocaleDateString(bt?.language || 'pt-BR')}.` : bt.text('Acesso completo à biblioteca.');
  }
  const { count } = await sb.from('bt_video_progress').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id).eq('completed', true);
  document.querySelector('[data-progress-count]').textContent = `${count || 0} aulas concluídas`;
  if (await isAdmin(session.user.id)) document.querySelector('[data-admin-card]').hidden = false;
  const logout = document.getElementById('accountLogout');
  logout.hidden = false;
  logout.addEventListener('click', async () => { await sb.auth.signOut(); location.href = '/blacktigersbjj/'; });
}


function adminAlert(message, type = 'success') {
  const el = document.getElementById('adminAlert');
  if (!el) return;
  el.hidden = false;
  el.className = `admin-alert ${type}`;
  el.textContent = message;
  if(type!=='error') setTimeout(() => el.hidden = true, 5000);
}

const adminState = { videos: [], categories: [], subscriptions: [], revenue: [], admins: [], audit: [], currentAdmin: null };
const adminRoleLabels = { owner: 'Proprietário', admin: 'Administrador' };
const rolePermissions = {
  owner: ['manage_content','view_analytics','manage_members','manage_admins'],
  admin: ['manage_content','view_analytics','manage_members']
};
const permissionLabels = { manage_content: 'Publicar e organizar aulas', view_analytics: 'Visualizar métricas e receita', manage_members: 'Gerenciar alunos e assinaturas', manage_admins: 'Convidar e gerenciar administradores' };

function hasAdminPermission(permission) {
  const member = adminState.currentAdmin;
  return Boolean(member && member.status === 'active' && (member.role === 'owner' || (member.permissions || []).includes(permission)));
}

function applyAdminPermissions(session) {
  document.querySelectorAll('[data-permission]').forEach(element => {
    element.hidden = !hasAdminPermission(element.dataset.permission);
  });
  const sectionPermission = { launch: 'manage_admins', students: 'manage_members', subscriptions: 'manage_members', videos: 'manage_content', categories: 'manage_content', analytics: 'view_analytics', administrators: 'manage_admins' };
  if (sectionPermission[adminSection] && !hasAdminPermission(sectionPermission[adminSection])) {
    location.replace('/blacktigersbjj/admin/?acesso=restrito');
    return false;
  }
  const member = adminState.currentAdmin;
  const label = adminRoleLabels[member.role] || 'Administrador';
  const avatarName = member.name || session.user.user_metadata?.name || session.user.email || 'BT';
  const roleChip = document.getElementById('adminRoleChip');
  const avatar = document.getElementById('adminAvatar');
  const breadcrumb = document.getElementById('adminBreadcrumb');
  if (roleChip) roleChip.textContent = label;
  if (avatar) { avatar.textContent = avatarName.slice(0,2).toUpperCase(); avatar.title = `${avatarName} · ${label}`; }
  if (breadcrumb) breadcrumb.textContent = ({ overview: 'Visão geral e atalhos', videos: 'Biblioteca e publicação', categories: 'Organização do catálogo', analytics: 'Audiência e receita', administrators: 'Equipe, papéis e segurança' })[adminSection] || 'Gestão segura da plataforma';
  return true;
}

function metricCard(label, value, iconName, note) {
  return `<article class="metric-card"><div class="metric-icon">${icons[iconName]}</div><div><span>${label}</span><strong>${value}</strong><small>${note}</small></div></article>`;
}

function renderAdmin() {
  const views = adminState.videos.reduce((sum, item) => sum + Number(item.views_count || 0), 0);
  const paid = adminState.revenue.filter(item => item.status === 'paid').reduce((sum, item) => sum + Number(item.amount_cents || 0), 0);
  const active = adminState.subscriptions.filter(item => ['active','trialing'].includes(item.status)).length;
  const published = adminState.videos.filter(item => item.published).length;
  const metrics = [
    [tr('admin.revenue','Receita confirmada'), money(paid), 'revenue', 'dados do provedor'],
    [tr('admin.views','Visualizações'), views.toLocaleString(bt?.language || 'pt-BR'), 'eye', 'total acumulado'],
    [tr('admin.activeSubs','Assinaturas ativas'), active, 'users', 'alunos com acesso'],
    [tr('admin.published','Vídeos publicados'), published, 'video', `${adminState.videos.length - published} rascunhos`]
  ].map(args => metricCard(...args)).join('');
  document.getElementById('metricGrid').innerHTML = metrics;
  document.getElementById('analyticsMetrics').innerHTML = metrics;
  document.getElementById('videoTotal').textContent = `${adminState.videos.length} vídeos`;
  const rate = adminState.videos.length ? Math.round(published / adminState.videos.length * 100) : 0;
  document.getElementById('publishRate').textContent = `${rate}%`;
  document.querySelector('.health-ring').style.setProperty('--rate', `${rate * 3.6}deg`);
  const top = [...adminState.videos].sort((a,b) => Number(b.views_count)-Number(a.views_count)).slice(0,6);
  const max = Math.max(1, ...top.map(item => Number(item.views_count || 0)));
  document.getElementById('topVideoChart').innerHTML = top.length ? top.map(item => `<div class="bar-row"><span title="${escapeHTML(item.title)}">${escapeHTML(item.title)}</span><i><b style="width:${Math.max(5, Number(item.views_count || 0)/max*100)}%"></b></i><strong>${Number(item.views_count || 0)}</strong></div>`).join('') : `<p class="muted">${tr('admin.noData','Ainda não há dados.')}</p>`;
  document.getElementById('rankingList').innerHTML = top.length ? top.map((item,index) => `<div class="ranking-item"><b>${String(index+1).padStart(2,'0')}</b><div><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.category?.name || 'Sem categoria')}</span></div><em>${Number(item.views_count || 0).toLocaleString(bt?.language || 'pt-BR')} views</em></div>`).join('') : `<p class="muted">${tr('admin.noData','Ainda não há dados.')}</p>`;
  document.getElementById('revenueBig').textContent = money(paid);
  document.getElementById('revenueList').innerHTML = adminState.revenue.length ? adminState.revenue.slice(0,5).map(item => `<div class="revenue-row"><div><strong>${item.plan || 'Assinatura'}</strong><span>${new Date(item.occurred_at).toLocaleDateString(bt?.language || 'pt-BR')}</span></div><b>${money(item.amount_cents)}</b></div>`).join('') : `<div class="empty-admin">${icons.revenue}<p>A receita aparecerá aqui quando o gateway de pagamento registrar as vendas.</p></div>`;
  const revenuePeriods=Array.from({length:8},(_,index)=>{const start=new Date();start.setUTCDate(1);start.setUTCHours(0,0,0,0);start.setUTCMonth(start.getUTCMonth()-(7-index));const end=new Date(start);end.setUTCMonth(end.getUTCMonth()+1);return {start,total:adminState.revenue.filter(item=>item.status==='paid'&&new Date(item.occurred_at)>=start&&new Date(item.occurred_at)<end).reduce((sum,item)=>sum+Number(item.amount_cents||0),0)};});
  const maxRevenue=Math.max(1,...revenuePeriods.map(period=>period.total));
  document.getElementById('revenueBars').innerHTML=paid?revenuePeriods.map(period=>`<i style="height:${period.total/maxRevenue*100}%" title="${escapeHTML(period.start.toLocaleDateString(bt?.language||'pt-BR',{month:'short',year:'numeric'}))}: ${escapeHTML(money(period.total))}"></i>`).join(''):'';
  document.getElementById('videoRows').innerHTML = adminState.videos.length ? adminState.videos.map(item => `<tr><td><div class="table-title"><span>${icons.play}</span><div><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.category?.name || 'Sem categoria')}</small></div></div></td><td><button class="status-badge ${item.access_level==='free'?'free':''}" data-toggle-access="${item.id}">${item.access_level==='free'?tr('common.free','Grátis'):tr('common.subscriber','Assinante')}</button></td><td><button class="status-badge ${item.published?'published':'draft'}" data-toggle-published="${item.id}">${item.published?'Publicado':'Rascunho'}</button></td><td>${Number(item.views_count || 0).toLocaleString(bt?.language || 'pt-BR')}</td><td><a class="table-action" href="${item.format==='short'?'/blacktigersbjj/flow/':'/blacktigersbjj/assistir/'}?id=${item.id}" target="_blank" rel="noopener">Abrir</a><button class="table-action danger" data-video-delete="${item.id}" type="button">Excluir</button></td></tr>`).join('') : `<tr><td colspan="5"><div class="empty-admin">${icons.video}<p>${tr('admin.noData','Ainda não há dados.')}</p></div></td></tr>`;
  document.getElementById('categoryList').innerHTML = adminState.categories.length ? adminState.categories.map(category => {
    const linkedVideos = adminState.videos.filter(video => video.category_id === category.id).length;
    return `<div class="category-row"><div class="category-copy"><span class="category-icon">${icons.folder}</span><div><strong>${escapeHTML(category.name)}</strong><p>${escapeHTML(category.description || 'Categoria de aulas')} · ${linkedVideos} ${linkedVideos === 1 ? 'vídeo' : 'vídeos'}</p></div></div><div class="category-actions"><label class="switch" title="${category.active ? 'Desativar' : 'Ativar'} categoria"><input type="checkbox" data-category-active="${category.id}" ${category.active?'checked':''}><span></span></label><button class="category-delete" type="button" data-category-delete="${category.id}" aria-label="Excluir categoria ${escapeHTML(category.name)}" title="Excluir categoria">${icons.trash}<span>Excluir</span></button></div></div>`;
  }).join('') : `<p class="muted">${tr('admin.noData','Ainda não há dados.')}</p>`;
  document.getElementById('videoCategory').innerHTML = `<option value="">Sem categoria</option>${adminState.categories.filter(item=>item.active).map(item=>`<option value="${item.id}">${escapeHTML(item.name)}</option>`).join('')}`;
  renderAdminMembers();
  bindAdminActions();
  bindAdminMemberActions();
}

function renderAdminMembers() {
  const list = document.getElementById('adminMemberList');
  const total = document.getElementById('adminTotal');
  const audit = document.getElementById('auditList');
  if (total) total.textContent = `${adminState.admins.length} ${adminState.admins.length === 1 ? 'membro' : 'membros'}`;
  if (list) list.innerHTML = adminState.admins.length ? adminState.admins.map(member => {
    const isSelf = member.user_id === adminState.currentAdmin?.user_id;
    const status = member.status === 'active' ? 'Ativo' : member.status === 'invited' ? 'Convite pendente' : 'Suspenso';
    const initials = (member.name || member.email || 'BT').slice(0,2).toUpperCase();
    const roleOptions = Object.entries(adminRoleLabels).map(([value,label]) => `<option value="${value}" ${member.role === value ? 'selected' : ''}>${label}</option>`).join('');
    return `<article class="admin-member" data-admin-member="${member.user_id}"><span class="member-avatar">${escapeHTML(initials)}</span><div class="member-copy"><strong>${escapeHTML(member.name || 'Administrador')}</strong><span>${escapeHTML(member.email)}</span><small class="member-status ${escapeHTML(member.status)}">${status}${isSelf ? ' · você' : ''}</small></div><div class="member-controls"><select aria-label="Função de ${escapeHTML(member.name || member.email)}" data-admin-role="${member.user_id}" ${isSelf ? 'disabled' : ''}>${roleOptions}</select><button class="table-action" data-admin-status="${member.user_id}" data-next-status="${member.status === 'active' ? 'suspended' : 'active'}" ${isSelf ? 'disabled' : ''}>${member.status === 'active' ? 'Suspender' : 'Ativar'}</button><button class="icon-danger" data-admin-remove="${member.user_id}" aria-label="Remover administrador" ${isSelf ? 'disabled' : ''}>×</button></div></article>`;
  }).join('') : `<div class="empty-admin">${icons.users}<p>Nenhum administrador encontrado.</p></div>`;
  if (audit) audit.innerHTML = adminState.audit.length ? adminState.audit.map(item => `<div class="audit-row"><span class="audit-icon">${icons.activity}</span><div><strong>${escapeHTML(item.summary || item.action)}</strong><small>${escapeHTML(item.actor_email || 'Sistema')} · ${new Date(item.created_at).toLocaleString(bt?.language || 'pt-BR')}</small></div></div>`).join('') : `<div class="empty-admin">${icons.activity}<p>As próximas alterações de acesso aparecerão aqui.</p></div>`;
  const roleSelect = document.querySelector('#adminInviteForm select[name="role"]');
  const preview = document.getElementById('rolePreview');
  if (roleSelect && preview) {
    const renderPreview = () => preview.innerHTML = (rolePermissions[roleSelect.value] || []).map(permission => `<span>${icons.shield}${permissionLabels[permission]}</span>`).join('');
    roleSelect.onchange = renderPreview;
    renderPreview();
  }
}

async function runAdminMemberAction(body, successMessage) {
  const { data, error } = await invokeAdminFunction('bt-admin-members', { body });
  if (error || data?.error) {
    adminAlert(data?.error || error?.message || 'Não foi possível concluir a alteração.', 'error');
    return false;
  }
  await loadAdminMembers();
  adminAlert(successMessage);
  return true;
}

function bindAdminActions() {
  document.querySelectorAll('[data-video-delete]').forEach(button => button.onclick = async () => {
    const item = adminState.videos.find(v=>v.id===button.dataset.videoDelete);
    if (!item || !confirm(bt.text('Excluir este vídeo e seu arquivo? Esta ação não pode ser desfeita.'))) return;
    button.disabled = true;
    const {data,error} = await sb.from('bt_videos').delete().eq('id',item.id).select('id').maybeSingle();
    if(error || !data) {button.disabled=false;return adminAlert(error?.message||'Acesso não autorizado.','error');}
    let cleanupError;
    if(item.storage_path&&!driveVideoId(item.storage_path)) ({error:cleanupError}=await sb.storage.from('bt-course-videos').remove([item.storage_path]));
    adminState.videos=adminState.videos.filter(v=>v.id!==item.id);renderAdmin();
    adminAlert(cleanupError?'Vídeo removido. Não foi possível remover o arquivo do armazenamento.':'Vídeo excluído com sucesso.',cleanupError?'error':'success');
  });
  document.querySelectorAll('[data-toggle-access]').forEach(button => button.addEventListener('click', async () => {
    const item = adminState.videos.find(video => video.id === button.dataset.toggleAccess);
    const next = item.access_level === 'free' ? 'subscriber' : 'free';
    const { error } = await sb.from('bt_videos').update({ access_level: next }).eq('id', item.id);
    if (error) return adminAlert(error.message, 'error');
    item.access_level = next; renderAdmin(); adminAlert('Acesso do vídeo atualizado.');
  }));
  document.querySelectorAll('[data-toggle-published]').forEach(button => button.addEventListener('click', async () => {
    const item = adminState.videos.find(video => video.id === button.dataset.togglePublished);
    const { error } = await sb.from('bt_videos').update({ published: !item.published }).eq('id', item.id);
    if (error) return adminAlert(error.message, 'error');
    item.published = !item.published; renderAdmin(); adminAlert('Status de publicação atualizado.');
  }));
  document.querySelectorAll('[data-category-active]').forEach(input => input.addEventListener('change', async () => {
    const { error } = await sb.from('bt_categories').update({ active: input.checked }).eq('id', input.dataset.categoryActive);
    if (error) { input.checked = !input.checked; return adminAlert(error.message, 'error'); }
    const item = adminState.categories.find(category => category.id === input.dataset.categoryActive);
    if (item) item.active = input.checked;
    adminAlert('Categoria atualizada.');
  }));
  document.querySelectorAll('[data-category-delete]').forEach(button => button.addEventListener('click', async () => {
    const category = adminState.categories.find(item => item.id === button.dataset.categoryDelete);
    if (!category) return;
    const linkedVideos = adminState.videos.filter(video => video.category_id === category.id).length;
    const consequence = linkedVideos
      ? `\n\n${linkedVideos} ${linkedVideos === 1 ? 'vídeo será preservado' : 'vídeos serão preservados'} e ficará sem categoria.`
      : '';
    if (!confirm(`Excluir a categoria “${category.name}”?${consequence}\n\nEsta ação não pode ser desfeita.`)) return;
    button.disabled = true;
    const { data, error } = await sb.from('bt_categories').delete().eq('id', category.id).select('id').maybeSingle();
    if (error) {
      button.disabled = false;
      return adminAlert(error.message, 'error');
    }
    if (!data) {
      button.disabled = false;
      return adminAlert('A categoria não foi excluída. Verifique sua permissão administrativa.', 'error');
    }
    adminState.categories = adminState.categories.filter(item => item.id !== category.id);
    adminState.videos.forEach(video => {
      if (video.category_id === category.id) {
        video.category_id = null;
        video.category = null;
      }
    });
    renderAdmin();
    adminAlert(`Categoria “${category.name}” excluída com sucesso.`);
  }));
}

function bindAdminMemberActions() {
  document.querySelectorAll('[data-admin-role]').forEach(select => select.addEventListener('change', async () => {
    const previous = adminState.admins.find(item => item.user_id === select.dataset.adminRole)?.role;
    select.disabled = true;
    const ok = await runAdminMemberAction({ action: 'update', user_id: select.dataset.adminRole, role: select.value }, 'Função administrativa atualizada.');
    if (!ok) { select.value = previous; select.disabled = false; }
  }));
  document.querySelectorAll('[data-admin-status]').forEach(button => button.addEventListener('click', async () => {
    button.disabled = true;
    const next = button.dataset.nextStatus;
    const ok = await runAdminMemberAction({ action: 'update', user_id: button.dataset.adminStatus, status: next }, next === 'active' ? 'Administrador reativado.' : 'Administrador suspenso.');
    if (!ok) button.disabled = false;
  }));
  document.querySelectorAll('[data-admin-remove]').forEach(button => button.addEventListener('click', async () => {
    const member = adminState.admins.find(item => item.user_id === button.dataset.adminRemove);
    if (!member || !confirm(`Remover o acesso administrativo de ${member.name || member.email}?`)) return;
    button.disabled = true;
    const ok = await runAdminMemberAction({ action: 'remove', user_id: member.user_id }, 'Acesso administrativo removido.');
    if (!ok) button.disabled = false;
  }));
}

async function loadAdminData() {
  const [videos, categories, subscriptions, revenue] = await Promise.all([
    sb.from('bt_videos').select('*, category:bt_categories(name)').order('created_at', { ascending: false }),
    sb.from('bt_categories').select('*').order('position').order('name'),
    sb.from('bt_subscriptions').select('*').order('created_at', { ascending: false }),
    sb.from('bt_revenue_events').select('*').order('occurred_at', { ascending: false })
  ]);
  const failed=[videos,categories,subscriptions,revenue].find(result=>result.error);if(failed)throw failed.error;
  adminState.videos = videos.data || [];
  adminState.categories = categories.data || [];
  adminState.subscriptions = subscriptions.data || [];
  adminState.revenue = revenue.data || [];
  renderAdmin();
}

async function loadAdminMembers() {
  if (!hasAdminPermission('manage_admins')) return;
  const [members, audit] = await Promise.all([
    sb.from('bt_admins').select('user_id,email,name,role,status,permissions,created_at,invite_sent_at,last_seen_at').order('created_at'),
    sb.from('bt_admin_audit_log').select('id,action,summary,actor_email,target_email,created_at').order('created_at', { ascending: false }).limit(20)
  ]);
  if (members.error) throw members.error;
  adminState.admins = members.data || [];
  adminState.audit = audit.data || [];
  renderAdminMembers();
  bindAdminMemberActions();
}

function bindAdminForms(session) {
  bindDriveSourceForm();
  document.getElementById('categoryForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name')).trim();
    const { data, error } = await sb.from('bt_categories').insert({ name, slug: `${slugify(name)}-${Date.now().toString().slice(-5)}`, description: form.get('description') || null }).select().single();
    if (error) return adminAlert(error.message, 'error');
    adminState.categories.push(data); event.currentTarget.reset(); renderAdmin(); adminAlert('Categoria criada com sucesso.');
  });
  document.getElementById('videoForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    if(form.get('video_source')==='drive')return saveDriveVideo(formEl,session);
    const file = form.get('file');
    const title = String(form.get('title')).trim();
    if (!(file instanceof File) || !file.size) return adminAlert('Selecione um arquivo de vídeo.', 'error');
    const allowedTypes={'mp4':['video/mp4'],'webm':['video/webm'],'mov':['video/quicktime','video/mp4']};
    const extension=file.name.split('.').pop()?.toLowerCase();
    if(!allowedTypes[extension]||!allowedTypes[extension].includes(file.type)||file.size>50*1024**2)return adminAlert('Use MP4, WebM ou MOV de até 50 MB.','error');
    let mediaInfo;
    try { mediaInfo=await inspectVideoFile(file); } catch(err){return adminAlert(err.message,'error');}
    if(form.get('format')==='short' && (mediaInfo.duration>180 || mediaInfo.width>=mediaInfo.height)) return adminAlert('Tiger Flow exige vídeo vertical com até 3 minutos.','error');
    const progress = document.getElementById('uploadProgress');
    progress.hidden = false;
    formEl.querySelector('button[type="submit"]').disabled = true;
    const safeName = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ''))}.${file.name.split('.').pop().toLowerCase()}`;
    const storagePath = `${session.user.id}/${safeName}`;
    const { error: uploadError } = await sb.storage.from('bt-course-videos').upload(storagePath, file, { cacheControl: '3600', upsert: false, contentType: file.type });
    if (uploadError) { progress.hidden = true; formEl.querySelector('button[type="submit"]').disabled = false; return adminAlert(uploadError.message, 'error'); }
    const { data, error } = await sb.from('bt_videos').insert({
      title,
      format: form.get('format') || 'lesson',
      video_width: mediaInfo.width,
      video_height: mediaInfo.height,
      audio_language: form.get('audio_language') || 'pt-BR',
      thumbnail_url: form.get('thumbnail_url') || null,
      slug: `${slugify(title)}-${Date.now().toString().slice(-6)}`,
      description: form.get('description') || null,
      category_id: form.get('category_id') || null,
      storage_path: storagePath,
      duration_seconds: Math.round(mediaInfo.duration),
      access_level: form.get('access_level'),
      published: form.get('published') === 'on',
      featured: form.get('featured') === 'on',
      created_by: session.user.id
    }).select('*, category:bt_categories(name)').single();
    progress.hidden = true;
    formEl.querySelector('button[type="submit"]').disabled = false;
    if (error) { await sb.storage.from('bt-course-videos').remove([storagePath]); return adminAlert(error.message, 'error'); }
    adminState.videos.unshift(data); formEl.reset(); renderAdmin(); adminAlert('Vídeo enviado e salvo com sucesso.');
  });
  document.getElementById('adminInviteForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const button = formEl.querySelector('button[type="submit"]');
    button.disabled = true;
    const ok = await runAdminMemberAction({ action: 'invite', email: String(form.get('email')).trim(), name: String(form.get('name')).trim(), role: form.get('role') }, 'Acesso administrativo atualizado com sucesso.');
    button.disabled = false;
    if (ok) formEl.reset();
    renderAdminMembers();
  });
}

async function initAdmin() {
  const gate = document.getElementById('adminGate');
  if (!sb) {
    gate.innerHTML = `<strong>Supabase indisponível.</strong><span>Verifique a configuração da plataforma.</span>`;
    return;
  }
  const session = await getSession();
  if (!session) {
    gate.innerHTML = `${icons.lock}<strong>${tr('admin.requiresLogin','Entre com a conta de administrador para continuar.')}</strong><a class="btn btn-primary" href="/blacktigersbjj/entrar/?next=/admin/">${tr('nav.login','Entrar')}</a>`;
    return;
  }
  const { data: currentAdmin, error: adminError } = await sb.from('bt_admins').select('user_id,email,name,role,status,permissions').eq('user_id', session.user.id).eq('status', 'active').maybeSingle();
  if (adminError || !currentAdmin) {
    gate.innerHTML = `${icons.lock}<strong>${tr('admin.denied','Esta conta não tem permissão administrativa.')}</strong><a class="btn btn-ghost" href="/blacktigersbjj/">Voltar ao site</a>`;
    return;
  }
  const {data:assurance,error:assuranceError}=await sb.auth.mfa.getAuthenticatorAssuranceLevel();
  if(assuranceError||assurance?.currentLevel!=='aal2'){
    const needsChallenge=assurance?.nextLevel==='aal2';
    gate.innerHTML=`${icons.lock}<strong>${pro('adminMfaRequired')}</strong><a class="btn btn-primary" href="${needsChallenge?'/blacktigersbjj/entrar/?next=/admin/':'/blacktigersbjj/seguranca/'}">${pro(needsChallenge?'mfaVerify':'mfaEnable')}</a>`;
    return;
  }
  adminState.currentAdmin = currentAdmin;
  if (!applyAdminPermissions(session)) return;
  gate.hidden = true;
  document.getElementById('adminContent').hidden = false;
  document.getElementById('adminLogout').addEventListener('click', async () => { await sb.auth.signOut(); location.href = '/blacktigersbjj/'; });
  try {
    await loadAdminData();
    await loadAdminMembers();
    if (hasAdminPermission('manage_members') && ['students','subscriptions'].includes(adminSection)) await loadStudents();
    bindAdminForms(session);
  } catch (error) {
    adminAlert(error.message || 'Não foi possível carregar o painel.', 'error');
  }
}

function inspectVideoFile(file) {
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file),video=document.createElement('video');
    const finish=()=>{URL.revokeObjectURL(url);clearTimeout(timer);};
    const timer=setTimeout(()=>{finish();reject(new Error('Não foi possível ler o vídeo. Use MP4 ou WebM.'));},15000);
    video.preload='metadata';
    video.onloadedmetadata=()=>{const info={duration:video.duration,width:video.videoWidth,height:video.videoHeight};finish();Number.isFinite(info.duration)?resolve(info):reject(new Error('Duração do vídeo inválida.'));};
    video.onerror=()=>{finish();reject(new Error('Formato de vídeo não suportado.'));};
    video.src=url;
  });
}
bindGlobalUI();
enhanceProfessionalUI();
hydrateSessionUI();
if (['home','catalogo'].includes(page)) initCatalog();
if (page === 'entrar') initAuthPage();
if (page === 'conta') initAccount();
if (page === 'assistir') initWatch();
if (page === 'admin') initAdmin();
if (page === 'flow') initFlow();
