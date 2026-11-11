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
      footLinks: 'روابط', footVisit: 'زورنا', footFollow: 'تابعنا', rights: 'كل الحقوق محفوظة', madeBy: 'برمج و صمم هذا الموقع بواسطة',
      fb: 'فيسبوك', ig: 'إنستجرام', tt: 'تيك توك', wa: 'واتساب', defName: 'ملكة الأيفون',
      heroEyebrow: 'متجر آيفون وإكسسوارات', heroL1: 'موبايلك.', heroL2: 'جرابك.', heroL3: 'ستايلك.',
      heroSub: 'موبايلات أصلية بضمان، وجرابات تحمي وتجمّل. اختار اللي يعجبك واطلب على واتساب في ثواني.',
      ctaShop: 'ادخل المتجر', ctaMore: 'اكتشف أكتر',
      st1: 'أصلي', st1s: 'كل الأجهزة', st2: 'ضمان', st2s: 'على كل جهاز', st3: '48 ساعة', st3s: 'شحن للمحافظات',
      mq: ['أصلي 100%', 'ضمان حقيقي', 'شحن سريع', 'جرابات فاخرة', 'أحسن سعر', 'طلب على واتساب'],
      deckEyebrow: 'اختيارات الأسبوع', deckTitle: 'كل اللي تحبه، في كارت واحد.', deckHint: 'انزل لتحت عشان الكروت تتفرد',
      fanTitle: 'كل ألوانك. في مكان واحد.', fanSub: 'موبايلات وجرابات بكل الألوان اللي تحبها، بضمان وأحسن الأسعار.',
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
      fName: 'الاسم', fNameErr: 'اكتب اسمك عشان نعرف نكلمك.', fAddr: 'العنوان', fAddrErr: 'اكتب عنوانك بالتفصيل.', fPhone: 'رقم موبايل تاني للتواصل', fPhoneHint: 'رقم غير رقم الواتساب اللي هتبعت منه، عشان لو مقدرناش نوصلك.', fPhoneErr: 'اكتب رقم موبايل صحيح.', reqHint: 'الحقول اللي عليها * لازم تتملى.', fixForm: 'كمّل البيانات المطلوبة الأول.', annTag: 'إعلان', annOk: 'تمام', annShop: 'تسوق دلوقتي', annClose: 'إغلاق', waFloat: 'كلمنا على واتساب', caseEyebrow: 'جرابك مش لاقيه؟', caseTitle: 'قولنا موبايلك، ونجيبلك جرابه.', caseSub: 'لو الجراب اللي عايزه مش موجود في المتجر، اكتب نوع موبايلك وابعتلنا على واتساب ونوفرهولك.', caseModel: 'نوع الموبايل', caseModelPh: 'مثلاً: iPhone 15 Pro Max', caseDesc: 'شكل الجراب (اختياري)', caseDescPh: 'اللون، الخامة، أو أي تفاصيل', caseSend: 'ابعت طلب الجراب', caseErr: 'اكتب نوع موبايلك الأول.', fNote: 'ملاحظات (اختياري)',
      fMethod: 'طريقة الاستلام', mDel: 'توصيل', mDelS: 'لحد باب البيت', mPick: 'استلام من المحل', mPickS: 'من غير مصاريف شحن', fGov: 'المحافظة', fGovPh: 'اختار المحافظة', fGovErr: 'اختار المحافظة.', subTotal: 'المنتجات', shipFee: 'الشحن', shipFree: 'مجاني', shipPick: 'اختار المحافظة', shipAsk: 'هيتحدد على واتساب', grand: 'الإجمالي', pickAt: 'هتستلم طلبك من المحل', pickHours: 'المواعيد', noMethod: 'الطلبات مش متاحة دلوقتي.',
      send: 'إرسال الطلب على واتساب', clear: 'تفريغ السلة', cleared: 'اتفرّغت السلة',
      noWa: 'الطلب مش متاح دلوقتي، كلمنا من صفحاتنا.', waOpened: 'اتفتح واتساب، اضغط إرسال عشان الطلب يوصلنا',
      cart: 'السلة', pageFail: 'حصلت مشكلة، حاول تاني.'
    },
    en: {
      skip: 'Skip to content', home: 'Home', shop: 'Shop', langBtn: 'عربي', langAria: 'التبديل للعربي',
      themeDark: 'Switch to dark theme', themeLight: 'Switch to light theme', menu: 'Menu',
      footAbout: 'Genuine iPhones and premium cases at the best price, ordered straight through WhatsApp.',
      footLinks: 'Links', footVisit: 'Visit us', footFollow: 'Follow us', rights: 'All rights reserved', madeBy: 'Designed & developed by',
      fb: 'Facebook', ig: 'Instagram', tt: 'TikTok', wa: 'WhatsApp', defName: 'iPhone Queen',
      heroEyebrow: 'iPhone & accessories store', heroL1: 'Your phone.', heroL2: 'Your case.', heroL3: 'Your style.',
      heroSub: 'Genuine phones with warranty and cases that protect in style. Pick what you love and order on WhatsApp in seconds.',
      ctaShop: 'Enter the shop', ctaMore: 'Discover more',
      st1: 'Genuine', st1s: 'Every device', st2: 'Warranty', st2s: 'On every phone', st3: '48 hours', st3s: 'Nationwide shipping',
      mq: ['100% Genuine', 'Real warranty', 'Fast shipping', 'Premium cases', 'Best price', 'Order on WhatsApp'],
      deckEyebrow: 'Picks of the week', deckTitle: 'Everything you love, one card away.', deckHint: 'Scroll down to fan out the cards',
      fanTitle: 'Every color. One place.', fanSub: 'Phones and cases in every color you love, with warranty and the best prices.',
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
      fName: 'Name', fNameErr: 'Please enter your name so we can reach you.', fAddr: 'Address', fAddrErr: 'Please enter your full address.', fPhone: 'Another phone number', fPhoneHint: 'A number other than the WhatsApp one you order from, in case we cannot reach you.', fPhoneErr: 'Please enter a valid phone number.', reqHint: 'Fields marked * are required.', fixForm: 'Please complete the required details first.', annTag: 'Announcement', annOk: 'Got it', annShop: 'Shop now', annClose: 'Close', waFloat: 'Chat on WhatsApp', caseEyebrow: 'Can’t find your case?', caseTitle: 'Tell us your phone. We’ll get the case.', caseSub: 'If the case you want isn’t in the shop, type your phone model and message us on WhatsApp. We’ll source it for you.', caseModel: 'Phone model', caseModelPh: 'e.g. iPhone 15 Pro Max', caseDesc: 'Case details (optional)', caseDescPh: 'Color, material or any details', caseSend: 'Send case request', caseErr: 'Please enter your phone model first.', fNote: 'Notes (optional)',
      fMethod: 'How to receive', mDel: 'Delivery', mDelS: 'To your door', mPick: 'Store pickup', mPickS: 'No shipping fee', fGov: 'Governorate', fGovPh: 'Choose governorate', fGovErr: 'Please choose your governorate.', subTotal: 'Products', shipFee: 'Shipping', shipFree: 'Free', shipPick: 'Choose governorate', shipAsk: 'Confirmed on WhatsApp', grand: 'Total', pickAt: 'You will pick up your order from the store', pickHours: 'Hours', noMethod: 'Ordering is not available right now.',
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
    orders_enabled: true, closed_message: 'الطلبات متوقفة مؤقتًا.', delivery_enabled: true, pickup_enabled: true, shipping: '',
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
    whatsapp: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>'
  };

  function renderFooter() {
    const f = $('#foot'); if (!f) return;
    const t = MK.t, c = MK.cfg();
    const links = [['facebook', 'fb'], ['instagram', 'ig'], ['tiktok', 'tt']]
      .map(([k, l]) => [k, httpsOnly(c[k]), t(l)]).filter(x => x[1]);
    const num = String(c.whatsapp_number || '').replace(/\D/g, '');
    if (num.length >= 8) links.push(['whatsapp', 'https://wa.me/' + num, t('wa')]);
    const hours = MK.cfgL('open_hours'), addr = MK.cfgL('address');
    const tel = String(c.phone || '').replace(/[^\d+]/g, '').slice(0, 16);
    f.innerHTML = `<div class="wrap foot-grid">
  <div class="foot-brand">
    <a class="brand" href="index.html"><img class="brand-logo" src="img/logo.webp" width="44" height="44" alt="" decoding="async" loading="lazy"><span class="brand-name">${esc(MK.cfgL('store_name'))}</span></a>
    <p class="foot-about">${esc(t('footAbout'))}</p>
  </div>
  <nav class="foot-col" aria-label="${esc(t('footLinks'))}"><h2>${esc(t('footLinks'))}</h2><a href="index.html">${esc(t('home'))}</a><a href="main.html">${esc(t('shop'))}</a></nav>
  ${hours || addr || tel ? `<div class="foot-col"><h2>${esc(t('footVisit'))}</h2>${tel.length >= 6 ? `<a class="foot-line" href="tel:${esc(tel)}"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg><span dir="ltr">${esc(c.phone)}</span></a>` : ''}${hours ? `<p class="foot-line"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span>${esc(hours)}</span></p>` : ''}${addr ? `<p class="foot-line"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg><span>${esc(addr)}</span></p>` : ''}</div>` : ''}
  ${links.length ? `<div class="foot-col"><h2>${esc(t('footFollow'))}</h2><div class="social">${links.map(([k, u, l]) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(l)}">${ICON[k]}</a>`).join('')}</div></div>` : ''}
</div>
<div class="wrap foot-bottom"><span>© ${new Date().getFullYear()} ${esc(MK.cfgL('store_name'))}</span><span>${esc(t('rights'))}</span><span class="made">${esc(t('madeBy'))} <a class="mc" href="https://crstudio911.github.io/MC" target="_blank" rel="noopener noreferrer">MC</a></span></div>`;
  }

  MK.waNum = () => {
    let n = String(MK.cfg().whatsapp_number || '').replace(/\D/g, '').replace(/^00/, '');
    if (/^0\d{10}$/.test(n)) n = '20' + n.slice(1);
    return n.length >= 8 && n.length <= 15 ? n : '';
  };
  MK.openWa = text => {
    const n = MK.waNum(); if (!n) { MK.toast(MK.t('noWa')); return false; }
    const url = 'https://wa.me/' + n + (text ? '?text=' + encodeURIComponent(text) : '');
    const w = window.open(url, '_blank');
    if (w) w.opener = null; else location.href = url;
    return true;
  };

  function renderFloat() {
    let a = $('#waFloat');
    const n = MK.waNum();
    if (!n) { if (a) a.remove(); return; }
    if (!a) {
      a = document.createElement('a'); a.id = 'waFloat'; a.className = 'wa-float';
      a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.innerHTML = ICON.whatsapp.replace(/width="18" height="18"/, 'width="32" height="32"') + '<span class="wa-tip"></span>';
      document.body.appendChild(a);
    }
    a.href = 'https://wa.me/' + n;
    a.setAttribute('aria-label', MK.t('waFloat'));
    a.querySelector('.wa-tip').textContent = MK.t('waFloat');
  }

  function renderCaseReq() {
    const box = $('#caseReq'); if (!box) return;
    const t = MK.t;
    const keep = { m: ($('#crModel', box) || {}).value || '', d: ($('#crDesc', box) || {}).value || '' };
    box.innerHTML = `<div class="cr-box rv in">
  <div class="cr-copy">
    <p class="eyebrow"><span class="dot"></span><span>${esc(t('caseEyebrow'))}</span></p>
    <h2 class="sec-title" id="caseTitle">${esc(t('caseTitle'))}</h2>
    <p class="sec-sub">${esc(t('caseSub'))}</p>
  </div>
  <form class="cr-form" novalidate>
    <label><span>${esc(t('caseModel'))} <b class="star" aria-hidden="true">*</b></span><input id="crModel" type="text" maxlength="60" required aria-required="true" autocomplete="off" placeholder="${esc(t('caseModelPh'))}"><span class="err" hidden>${esc(t('caseErr'))}</span></label>
    <label><span>${esc(t('caseDesc'))}</span><input id="crDesc" type="text" maxlength="150" autocomplete="off" placeholder="${esc(t('caseDescPh'))}"></label>
    <button class="btn btn-main" type="submit">${ICON.whatsapp.replace(/width="18" height="18"/, 'width="20" height="20"')}<span>${esc(t('caseSend'))}</span></button>
  </form>
</div>`;
    const m = $('#crModel', box), d = $('#crDesc', box), err = $('.err', box);
    m.value = keep.m; d.value = keep.d;
    m.addEventListener('input', () => { err.hidden = true; m.classList.remove('bad'); });
    $('form', box).addEventListener('submit', e => {
      e.preventDefault();
      const model = m.value.replace(/\s+/g, ' ').trim(), desc = d.value.replace(/\s+/g, ' ').trim();
      if (!model) { err.hidden = false; m.classList.add('bad'); m.focus(); return; }
      const lines = ['السلام عليكم، عايز جراب مش لاقيه في المتجر.', '', '*نوع الموبايل:* ' + model];
      if (desc) lines.push('*شكل الجراب:* ' + desc);
      if (MK.openWa(lines.join('\n'))) MK.toast(t('waOpened'), 4200);
    });
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
    renderFooter(); renderFloat(); renderCaseReq(); renderPopup();
  }

  const hashStr = x => { let h = 5381; for (let i = 0; i < x.length; i++) h = (h * 33 + x.charCodeAt(i)) | 0; return String(h >>> 0); };
  function renderPopup() {
    if (!MK.data || MK.cfg().orders_enabled === false) return;
    const raw = String(MK.cfg().announcement || '').trim(); if (!raw) return;
    const key = hashStr(raw);
    let seen = ''; try { seen = localStorage.getItem('mk_ann') || ''; } catch (_) { }
    if (seen === key || $('#annPop')) return;
    const lines = MK.cfgL('announcement').split(/\n+/).map(x => x.trim()).filter(Boolean);
    const d = document.createElement('dialog');
    d.id = 'annPop'; d.className = 'ann-pop'; d.setAttribute('aria-labelledby', 'annH');
    const t = MK.t, shop = document.body.dataset.page !== 'main';
    d.innerHTML = `<button class="ann-x" type="button" aria-label="${esc(t('annClose'))}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
<span class="ann-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg></span>
<p class="ann-tag">${esc(t('annTag'))}</p>
<h2 id="annH">${esc(lines[0])}</h2>
${lines.slice(1).map(l => `<p class="ann-p">${esc(l)}</p>`).join('')}
<div class="ann-acts">${shop ? `<a class="btn btn-main" href="main.html">${esc(t('annShop'))}</a>` : ''}<button class="btn btn-ghost ann-ok" type="button">${esc(t('annOk'))}</button></div>`;
    document.body.appendChild(d);
    const close = () => { try { localStorage.setItem('mk_ann', key); } catch (_) { } d.classList.add('out'); setTimeout(() => { d.close(); d.remove(); }, 220); };
    d.querySelector('.ann-x').addEventListener('click', close);
    d.querySelector('.ann-ok').addEventListener('click', close);
    const a = d.querySelector('a'); if (a) a.addEventListener('click', () => { try { localStorage.setItem('mk_ann', key); } catch (_) { } });
    d.addEventListener('cancel', e => { e.preventDefault(); close(); });
    d.addEventListener('click', e => { if (e.target === d) close(); });
    setTimeout(() => { if (d.isConnected && typeof d.showModal === 'function') d.showModal(); }, 900);
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
