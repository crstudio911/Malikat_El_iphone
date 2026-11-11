(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
  const money = n => nf.format(n);

  const MK = window.MK = { $, esc, money, pages: {}, data: null, status: 'loading', _subs: [], _langSubs: [] };
  const root = document.documentElement;

  const DICT = {
    ar: {
      skip: 'تخطّى للمحتوى', home: 'الرئيسية', shop: 'المتجر', langBtn: 'English', langAria: 'Switch to English',
      themeDark: 'التبديل للثيم الغامق', themeLight: 'التبديل للثيم الفاتح', menu: 'القائمة',
      footAbout: 'موبايلات أصلية وجرابات فاخرة بأحسن سعر، والطلب كله على واتساب.',
      footLinks: 'روابط', footVisit: 'زورنا', footFollow: 'تابعنا', rights: 'كل الحقوق محفوظة',
      fb: 'فيسبوك', ig: 'إنستجرام', tt: 'تيك توك', wa: 'واتساب', defName: 'ملكة الأيفون',
      heroEyebrow: 'متجر آيفون وإكسسوارات', heroL1: 'آيفون', heroL2: 'بلمسة', heroL3: 'ملكية.',
      heroSub: 'موبايلات أصلية بضمان، وجرابات تحمي وتجمّل. اختار اللي يعجبك واطلب على واتساب في ثواني.',
      ctaShop: 'ادخل المتجر', ctaMore: 'اكتشف أكتر',
      st1: 'أصلي', st1s: 'كل الأجهزة', st2: 'ضمان', st2s: 'على كل جهاز', st3: '48 ساعة', st3s: 'شحن للمحافظات',
      mq: ['أصلي 100%', 'ضمان حقيقي', 'شحن سريع', 'جرابات فاخرة', 'أحسن سعر', 'طلب على واتساب'],
      deckEyebrow: 'اختيارات الأسبوع', deckTitle: 'كل اللي تحبه، في كارت واحد.', deckHint: 'انزل لتحت عشان الكروت تتفرد',
      fanTitle: 'كل ألوانك. في مكان واحد.', fanSub: 'موبايلات وجرابات بكل الألوان اللي تحبها، بضمان وأسعار ملكة.',
      whyEyebrow: 'ليه ملكة الأيفون', whyTitle: 'تجربة شراء تليق بيك.',
      f1: 'أجهزة أصلية', f1s: 'كل جهاز مضمون ومتفحّص قبل ما يوصلك.',
      f2: 'ضمان على كل جهاز', f2s: 'لو حصلت أي مشكلة، إحنا معاك.',
      f3: 'شحن لكل المحافظات', f3s: 'طلبك يوصل لحد باب البيت بسرعة.',
      f4: 'طلب في ثواني', f4s: 'اختار، وابعت الطلب على واتساب، وخلاص.',
      howEyebrow: 'إزاي تطلب', howTitle: 'تلات خطوات وبس.',
      h1: 'اختار', h1s: 'لف في المتجر واختار الموبايل أو الجراب.', h2: 'حدّد', h2s: 'اختار المساحة واللون والكمية.', h3: 'ابعت', h3s: 'الطلب بيتبعت على واتساب جاهز.',
      featEyebrow: 'من المتجر', featTitle: 'وصل حديثًا.', featAll: 'كل المنتجات',
      endTitle: 'جاهز تختار موبايلك الجاي؟', endSub: 'المنتجات مستنياك في المتجر.',
      shopEyebrow: 'المتجر', shopTitle: 'اختار. أضف. اطلب.', shopSub: 'كل المنتجات بأسعارها، والطلب بيوصلنا على واتساب.',
      search: 'ابحث عن منتج', searchPh: 'ابحث عن موبايل أو جراب…', cats: 'الأقسام', all: 'الكل',
      loadFail: 'مش قادرين نحمّل المنتجات دلوقتي', loadFailS: 'اتأكد إن النت شغّال وحاول تاني.', retry: 'حاول تاني',
      soon: 'المنتجات جاية قريب', soonS: 'استنونا، المنتجات هتنزل قريب جدًا.',
      noRes: 'مفيش نتايج', noResS: 'جرّب كلمة تانية أو اختار «الكل».',
      items: n => n + ' منتج', other: 'منتجات أخرى', products: 'المنتجات',
      out: 'غير متوفر', outBadge: 'نفد', closedBtn: 'الطلبات متوقفة', pick: 'اختار وأضف', add: 'أضف للطلب',
      details: 'تفاصيل', from: 'من', ask: 'السعر عند التواصل', option: 'الخيار', color: 'اللون',
      outLong: 'غير متوفر حاليًا', closedLong: 'الطلبات متوقفة مؤقتًا', qty: 'الكمية', inc: 'زيادة', dec: 'نقص',
      added: 'اتضاف للطلب', full: 'السلة وصلت للحد الأقصى', viewCart: 'عرض الطلب', del: 'حذف',
      pdHead: 'تفاصيل المنتج', close: 'إغلاق', cartHead: 'طلبك', total: 'الإجمالي',
      unpriced: 'في منتجات سعرها عند التواصل ومش داخلة في الإجمالي.',
      fName: 'الاسم', fNameErr: 'اكتب اسمك عشان نعرف نكلمك.', fAddr: 'العنوان', fNote: 'ملاحظات (اختياري)',
      send: 'إرسال الطلب على واتساب', clear: 'تفريغ السلة', cleared: 'اتفرّغت السلة',
      noWa: 'الطلب مش متاح دلوقتي، كلمنا من صفحاتنا.', waOpened: 'اتفتح واتساب، اضغط إرسال عشان الطلب يوصلنا',
      cart: 'السلة', pageFail: 'حصلت مشكلة، حاول تاني.'
    },
    en: {
      skip: 'Skip to content', home: 'Home', shop: 'Shop', langBtn: 'عربي', langAria: 'التبديل للعربي',
      themeDark: 'Switch to dark theme', themeLight: 'Switch to light theme', menu: 'Menu',
      footAbout: 'Genuine iPhones and premium cases at the best price, ordered straight through WhatsApp.',
      footLinks: 'Links', footVisit: 'Visit us', footFollow: 'Follow us', rights: 'All rights reserved',
      fb: 'Facebook', ig: 'Instagram', tt: 'TikTok', wa: 'WhatsApp', defName: 'iPhone Queen',
      heroEyebrow: 'iPhone & accessories store', heroL1: 'iPhone,', heroL2: 'the royal', heroL3: 'way.',
      heroSub: 'Genuine phones with warranty and cases that protect in style. Pick what you love and order on WhatsApp in seconds.',
      ctaShop: 'Enter the shop', ctaMore: 'Discover more',
      st1: 'Genuine', st1s: 'Every device', st2: 'Warranty', st2s: 'On every phone', st3: '48 hours', st3s: 'Nationwide shipping',
      mq: ['100% Genuine', 'Real warranty', 'Fast shipping', 'Premium cases', 'Best price', 'Order on WhatsApp'],
      deckEyebrow: 'Picks of the week', deckTitle: 'Everything you love, one card away.', deckHint: 'Scroll down to fan out the cards',
      fanTitle: 'Every color. One place.', fanSub: 'Phones and cases in every color you love, with warranty and royal prices.',
      whyEyebrow: 'Why iPhone Queen', whyTitle: 'Shopping that feels made for you.',
      f1: 'Genuine devices', f1s: 'Every device is verified and checked before it reaches you.',
      f2: 'Warranty on everything', f2s: 'If anything goes wrong, we have your back.',
      f3: 'Nationwide shipping', f3s: 'Your order arrives at your door, fast.',
      f4: 'Order in seconds', f4s: 'Pick, send the order on WhatsApp, done.',
      howEyebrow: 'How to order', howTitle: 'Three steps. That is it.',
      h1: 'Pick', h1s: 'Browse the shop and choose a phone or case.', h2: 'Choose', h2s: 'Select storage, color and quantity.', h3: 'Send', h3s: 'Your order goes out on WhatsApp, ready.',
      featEyebrow: 'From the shop', featTitle: 'Just arrived.', featAll: 'All products',
      endTitle: 'Ready for your next iPhone?', endSub: 'Everything is waiting for you in the shop.',
      shopEyebrow: 'Shop', shopTitle: 'Pick. Add. Order.', shopSub: 'Every product with its price, and your order reaches us on WhatsApp.',
      search: 'Search products', searchPh: 'Search phones or cases…', cats: 'Categories', all: 'All',
      loadFail: 'We could not load the products right now', loadFailS: 'Check your connection and try again.', retry: 'Try again',
      soon: 'Products coming soon', soonS: 'Stay tuned, products are landing very soon.',
      noRes: 'No results', noResS: 'Try another word or choose “All”.',
      items: n => n + (n === 1 ? ' product' : ' products'), other: 'Other products', products: 'Products',
      out: 'Unavailable', outBadge: 'Sold out', closedBtn: 'Orders paused', pick: 'Choose & add', add: 'Add to order',
      details: 'Details of', from: 'From', ask: 'Price on request', option: 'Option', color: 'Color',
      outLong: 'Currently unavailable', closedLong: 'Orders are paused for now', qty: 'Quantity', inc: 'Increase', dec: 'Decrease',
      added: 'Added to your order', full: 'Your cart is full', viewCart: 'View order', del: 'Remove',
      pdHead: 'Product details', close: 'Close', cartHead: 'Your order', total: 'Total',
      unpriced: 'Some items are priced on request and are not included in the total.',
      fName: 'Name', fNameErr: 'Please enter your name so we can reach you.', fAddr: 'Address', fNote: 'Notes (optional)',
      send: 'Send order on WhatsApp', clear: 'Empty cart', cleared: 'Cart emptied',
      noWa: 'Ordering is not available right now, reach us on our pages.', waOpened: 'WhatsApp opened, tap send so your order reaches us',
      cart: 'Cart', pageFail: 'Something went wrong, please try again.'
    }
  };

  MK.lang = () => (root.lang === 'en' ? 'en' : 'ar');
  MK.t = k => { const v = DICT[MK.lang()][k]; return v == null ? DICT.ar[k] : v; };
  MK.cur = () => MK.lang() === 'en' ? 'EGP' : (MK.cfg().currency || 'ج.م');

  MK.L = (p, f) => {
    if (MK.lang() === 'en' && p && p.en && p.en[f]) return p.en[f];
    return p ? p[f] : '';
  };
  MK.optL = (p, label) => {
    if (MK.lang() !== 'en' || !p.en || !p.en.options) return label;
    const i = p.options.findIndex(o => o.l === label);
    return (i > -1 && p.en.options[i]) || label;
  };
  MK.colL = (p, c) => {
    if (MK.lang() !== 'en' || !p.en || !p.en.colors) return c;
    const i = p.colors.indexOf(c);
    return (i > -1 && p.en.colors[i]) || c;
  };
  MK.catL = name => {
    if (MK.lang() !== 'en' || !MK.data) return name;
    const c = MK.data.categories.find(x => x.name === name);
    return (c && c.en) || name;
  };
  MK.cfgL = k => {
    const c = MK.cfg();
    if (MK.lang() === 'en' && MK.data && MK.data.config_en && MK.data.config_en[k]) return MK.data.config_en[k];
    if (MK.lang() === 'en' && k === 'store_name' && c.store_name === DICT.ar.defName) return DICT.en.defName;
    return c[k] || '';
  };

  function applyStatic() {
    document.querySelectorAll('[data-t]').forEach(el => { el.textContent = MK.t(el.dataset.t); });
    document.querySelectorAll('[data-t-ph]').forEach(el => { el.placeholder = MK.t(el.dataset.tPh); });
    document.querySelectorAll('[data-t-al]').forEach(el => { el.setAttribute('aria-label', MK.t(el.dataset.tAl)); });
    const lb = $('#langBtn');
    if (lb) { lb.querySelector('span').textContent = MK.t('langBtn'); lb.setAttribute('aria-label', MK.t('langAria')); }
  }

  MK.setLang = l => {
    root.lang = l; root.dir = l === 'en' ? 'ltr' : 'rtl';
    try { localStorage.setItem('mk_lang', l); } catch (_) { }
    applyStatic(); syncThemeUI(); applyConfig();
    MK._langSubs.forEach(fn => fn(l));
  };
  MK.onLang = fn => MK._langSubs.push(fn);

  const effective = () => root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  function syncThemeUI() {
    const dark = effective() === 'dark';
    const tb = $('#themeBtn');
    if (tb) tb.setAttribute('aria-label', MK.t(dark ? 'themeLight' : 'themeDark'));
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => {
      m.setAttribute('content', dark ? '#0D0907' : '#FBF5EE');
      m.removeAttribute('media');
    });
  }

  let toastTimer;
  MK.toast = (msg, ms = 2400) => {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  };
  MK.initDialog = d => {
    d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
    d.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) root.classList.remove('lock'); });
  };
  MK.open = d => { if (!d.open) d.showModal(); root.classList.add('lock'); };

  const API = String((window.MK_CONFIG && window.MK_CONFIG.api) || '').trim().replace(/\/+$/, '');
  const CACHE_KEY = 'mk_store_v2';
  const FRESH_MS = 2 * 60 * 1000;
  let lastFetch = 0;
  const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  const shapeOk = d => d && typeof d === 'object' && Array.isArray(d.products) && Array.isArray(d.categories) && d.config && typeof d.config === 'object';

  function readCache() {
    try { const j = JSON.parse(localStorage.getItem(CACHE_KEY)); if (j && shapeOk(j.data)) return j.data; } catch (_) { }
    return null;
  }
  const writeCache = d => { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: d })); } catch (_) { } };

  async function fetchStore() {
    if (!API) throw new Error('no-api');
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 12000);
    try {
      const res = await fetch(API + '/api/store', { headers: { Accept: 'application/json' }, credentials: 'omit', mode: 'cors', signal: ctl.signal });
      if (!res.ok) throw new Error('status-' + res.status);
      const text = await res.text();
      const data = JSON.parse(text);
      if (!shapeOk(data)) throw new Error('bad-shape');
      data.rev = hash(text);
      return data;
    } finally { clearTimeout(timer); }
  }

  function setData(d) {
    MK.data = d; MK.status = 'ready';
    applyConfig();
    MK._subs.forEach(fn => fn(d));
  }

  async function load() {
    const cached = MK.data ? null : readCache();
    if (cached) setData(cached);
    try {
      const fresh = await fetchStore();
      lastFetch = Date.now();
      writeCache(fresh);
      if (!MK.data || MK.data.rev !== fresh.rev) setData(fresh);
    } catch (_) {
      if (!MK.data) { MK.status = 'error'; MK._subs.forEach(fn => fn(null)); }
    }
  }

  MK.subscribe = fn => { MK._subs.push(fn); if (MK.data) fn(MK.data); else if (MK.status === 'error') fn(null); };
  MK.reload = () => { MK.status = 'loading'; load(); };
  MK.cfg = () => Object.assign({
    store_name: DICT.ar.defName, store_tagline: '', currency: 'ج.م', whatsapp_number: '',
    orders_enabled: true, closed_message: 'الطلبات متوقفة مؤقتًا.', ask_address: true,
    order_header: 'السلام عليكم، عايز أطلب:', order_footer: ''
  }, (MK.data && MK.data.config) || {});

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && MK.status === 'ready' && Date.now() - lastFetch > FRESH_MS) load();
  });

  const httpsOnly = u => { try { const x = new URL(u); return x.protocol === 'https:' ? x.href : ''; } catch (_) { return ''; } };
  const ICON = {
    facebook: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.9v3h2.6V21z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M16.6 3c.4 2.2 1.8 3.6 4 3.8v3.1c-1.5.1-2.8-.4-4-1.2v6.1c0 3.5-2.6 5.9-5.8 5.9A5.8 5.8 0 0 1 5 14.9c0-3.6 3.1-6.2 6.7-5.7v3.2c-1.7-.4-3.4.7-3.4 2.5 0 1.5 1.2 2.6 2.6 2.6 1.6 0 2.6-1 2.6-3V3z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 1 1-4.3 15l-.3-.2-3.1.8.8-3-.2-.3A8.1 8.1 0 0 1 12.04 3.8zm-3.3 4.3c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.5-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4l-.5-.3-1.9-.9c-.3-.1-.4-.1-.6.1l-.9 1.1c-.2.2-.3.2-.6.1a6.5 6.5 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.9-2.1c-.2-.5-.4-.5-.6-.5z"/></svg>'
  };

  function renderFooter() {
    const f = $('#foot'); if (!f) return;
    const t = MK.t, c = MK.cfg();
    const links = [['facebook', 'fb'], ['instagram', 'ig'], ['tiktok', 'tt']]
      .map(([k, l]) => [k, httpsOnly(c[k]), t(l)]).filter(x => x[1]);
    const num = String(c.whatsapp_number || '').replace(/\D/g, '');
    if (num.length >= 8) links.push(['whatsapp', 'https://wa.me/' + num, t('wa')]);
    const hours = MK.cfgL('open_hours'), addr = MK.cfgL('address');
    f.innerHTML = `<div class="wrap foot-grid">
  <div class="foot-brand">
    <a class="brand" href="index.html"><img class="brand-logo" src="img/logo.webp" width="44" height="44" alt="" decoding="async" loading="lazy"><span class="brand-name">${esc(MK.cfgL('store_name'))}</span></a>
    <p class="foot-about">${esc(t('footAbout'))}</p>
  </div>
  <nav class="foot-col" aria-label="${esc(t('footLinks'))}"><h2>${esc(t('footLinks'))}</h2><a href="index.html">${esc(t('home'))}</a><a href="main.html">${esc(t('shop'))}</a></nav>
  ${hours || addr ? `<div class="foot-col"><h2>${esc(t('footVisit'))}</h2>${hours ? `<p class="foot-line"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span>${esc(hours)}</span></p>` : ''}${addr ? `<p class="foot-line"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg><span>${esc(addr)}</span></p>` : ''}</div>` : ''}
  ${links.length ? `<div class="foot-col"><h2>${esc(t('footFollow'))}</h2><div class="social">${links.map(([k, u, l]) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(l)}">${ICON[k]}</a>`).join('')}</div></div>` : ''}
</div>
<div class="wrap foot-bottom"><span>© ${new Date().getFullYear()} ${esc(MK.cfgL('store_name'))}</span><span>${esc(t('rights'))}</span></div>`;
  }

  function applyConfig() {
    const name = MK.cfgL('store_name'), tag = MK.cfgL('store_tagline');
    document.querySelectorAll('[data-brand-name]').forEach(el => { el.textContent = name; });
    const ann = $('#announce');
    if (ann) {
      const closed = MK.cfg().orders_enabled === false;
      const text = closed ? MK.cfgL('closed_message') : MK.cfgL('announcement');
      ann.querySelector('span').textContent = text;
      ann.classList.toggle('warn', closed);
      ann.hidden = !text;
    }
    const base = document.body.dataset.page === 'main' ? MK.t('shop') + ' | ' : '';
    document.title = base + name + (tag && !base ? ' | ' + tag : '');
    renderFooter();
  }

  function boot() {
    applyStatic(); syncThemeUI(); applyConfig();
    $('#themeBtn').addEventListener('click', () => {
      const next = effective() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('mk_theme', next); } catch (_) { }
      syncThemeUI();
    });
    $('#langBtn').addEventListener('click', () => MK.setLang(MK.lang() === 'en' ? 'ar' : 'en'));
    const top = $('.top');
    const onScroll = () => top.classList.toggle('scrolled', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    const name = document.body.dataset.page;
    try { if (MK.pages[name]) MK.pages[name](document); } catch (_) { MK.toast(MK.t('pageFail')); }
    load();
  }
  if (document.readyState === 'complete') boot(); else document.addEventListener('DOMContentLoaded', boot, { once: true });
})();
