(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
  const money = n => nf.format(n);

  const MK = window.MK = { $, esc, money, pages: {}, data: null, status: 'loading', errorMsg: '', _subs: [] };
  const root = document.documentElement;
  const themeBtn = $('#themeBtn');
  const effective = () => root.getAttribute('data-theme') ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  function syncThemeUI() {
    const dark = effective() === 'dark';
    themeBtn.setAttribute('aria-label', dark ? 'التبديل للثيم الفاتح' : 'التبديل للثيم الغامق');
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => {
      m.setAttribute('content', dark ? '#17131B' : '#F3F2F6');
      m.removeAttribute('media');
    });
  }
  themeBtn.addEventListener('click', () => {
    const next = effective() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('mk_theme', next); } catch (_) { }
    syncThemeUI();
  });
  syncThemeUI();
  let toastTimer;
  MK.toast = (msg, ms = 2400) => {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  };
  MK.initDialog = d => {
    d.addEventListener('click', e => {
      if (e.target === d || e.target.closest('[data-close]')) d.close();
    });
    d.addEventListener('close', () => {
      if (!document.querySelector('dialog[open]')) root.classList.remove('lock');
    });
  };
  MK.open = d => { if (!d.open) d.showModal(); root.classList.add('lock'); };
  const API = (($('meta[name="api-base"]') || {}).content || '').trim().replace(/\/+$/, '');
  const CACHE_KEY = 'mk_store_v1';
  const FRESH_MS = 2 * 60 * 1000;
  let lastFetch = 0;

  const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };

  function shapeOk(d) {
    return d && typeof d === 'object' && Array.isArray(d.products) && Array.isArray(d.categories) && d.config && typeof d.config === 'object';
  }

  function readCache() {
    try { const j = JSON.parse(localStorage.getItem(CACHE_KEY)); if (j && shapeOk(j.data)) return j.data; } catch (_) { }
    return null;
  }
  function writeCache(d) { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: d })); } catch (_) { } }

  const isLocal = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$|\.lovable\.app$|\.lovableproject\.com$/.test(location.hostname);

  async function fetchStore() {
    if (!API) {
      if (isLocal) return demoData();
      throw new Error('api-base-missing');
    }
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
    MK.data = d; MK.status = 'ready'; MK.errorMsg = '';
    applyConfig(d.config || {});
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
    } catch (err) {
      console.error('[store]', err && err.message);
      if (!MK.data) {
        MK.status = 'error';
        MK.errorMsg = err && err.message === 'api-base-missing' ? 'رابط السيرفر (api-base) لسه متضبطش في index.html' : '';
        MK._subs.forEach(fn => fn(null));
      }
    }
  }

  MK.subscribe = fn => { MK._subs.push(fn); if (MK.data) fn(MK.data); else if (MK.status === 'error') fn(null); };
  MK.reload = () => { MK.status = 'loading'; load(); };
  MK.cfg = () => Object.assign({
    store_name: 'ملكة الأيفون', store_tagline: '', currency: 'ج.م', whatsapp_number: '',
    orders_enabled: true, closed_message: 'الطلبات متوقفة مؤقتًا.', ask_address: true,
    order_header: 'السلام عليكم، عايز أطلب:', order_footer: ''
  }, (MK.data && MK.data.config) || {});

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && MK.status === 'ready' && Date.now() - lastFetch > FRESH_MS) load();
  });
  const httpsOnly = u => { try { const x = new URL(u); return x.protocol === 'https:' ? x.href : ''; } catch (_) { return ''; } };

  function applyConfig(c) {
    const cfg = MK.cfg();
    $('#brandName').textContent = cfg.store_name;
    $('#footName').textContent = cfg.store_name;
    $('#brandTag').textContent = cfg.store_tagline;
    $('#brandTag').hidden = !cfg.store_tagline;
    document.title = cfg.store_name + (cfg.store_tagline ? ' | ' + cfg.store_tagline : '');

    const ann = $('#announce');
    const closed = cfg.orders_enabled === false;
    const text = closed ? cfg.closed_message : (c.announcement || '');
    ann.textContent = text;
    ann.classList.toggle('warn', closed);
    ann.hidden = !text;

    const hrs = $('#footHours'), adr = $('#footAddr');
    hrs.querySelector('span').textContent = cfg.open_hours || ''; hrs.hidden = !cfg.open_hours;
    adr.querySelector('span').textContent = cfg.address || ''; adr.hidden = !cfg.address;

    const soc = $('#footSocial');
    const links = [['facebook', 'فيسبوك'], ['instagram', 'إنستجرام'], ['tiktok', 'تيك توك']]
      .map(([k, label]) => [httpsOnly(cfg[k]), label]).filter(([u]) => u);
    soc.innerHTML = links.map(([u, l]) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(l)}</a>`).join('');
    soc.hidden = !links.length;
  }
  async function mount(name) {
    const host = $('#page');
    const ready = document.readyState === 'loading'
      ? new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true })) : Promise.resolve();
    try {
      const [html] = await Promise.all([
        fetch(`${name}/${name}.html`).then(r => { if (!r.ok) throw new Error('page'); return r.text(); }),
        ready
      ]);
      host.innerHTML = html;
      MK.pages[name](host);
    } catch (err) {
      console.error('[page]', err);
      host.innerHTML = '<div class="empty"><strong>حصلت مشكلة في تحميل الصفحة</strong><button class="btn btn-gold" type="button" id="reloadPage">حاول تاني</button></div>';
      $('#reloadPage').addEventListener('click', () => location.reload());
    }
  }
  function demoData() {
    const P = (id, category, name, brand, price, old, image, desc, options, colors, badge, in_stock = true) =>
      ({ id, category, name, brand, price, old_price: old, image: 'img/products/' + image + '.webp', description: desc, options, colors, badge, in_stock });
    return {
      config: { store_name: 'ملكة الأيفون', store_tagline: 'موبايلات وجرابات بأحسن سعر', currency: 'ج.م', whatsapp_number: '201000000000', orders_enabled: true, ask_address: true,
        announcement: 'شحن لكل المحافظات خلال 48 ساعة', open_hours: 'يوميًا من 10 ص حتى 11 م', address: 'القاهرة', order_header: 'السلام عليكم، عايز أطلب من ملكة الأيفون:', order_footer: 'شكرًا ليكم' },
      categories: [{ name: 'تليفونات', icon: '' }, { name: 'جرابات', icon: '' }],
      products: [
        P('d1', 'تليفونات', 'آيفون 17 برو ماكس', 'Apple', 82000, 0, 'phone-orange', 'كاميرا ثلاثية احترافية وبطارية تكمّل يومك.\nضمان سنة.', [{ l: '256GB', p: 82000 }, { l: '512GB', p: 95000 }], ['برتقالي كوني', 'أزرق', 'فضي'], 'جديد'),
        P('d2', 'تليفونات', 'آيفون 16 برو', 'Apple', 61000, 66000, 'phone-blue', 'تيتانيوم خفيف وشاشة 120Hz.', [{ l: '128GB', p: 61000 }, { l: '256GB', p: 68000 }], ['أزرق تيتانيوم', 'أسود'], 'خصم'),
        P('d3', 'تليفونات', 'آيفون 16', 'Apple', 42000, 0, 'phone-silver', 'كاميرا مزدوجة وزر الكاميرا الجديد.', [{ l: '128GB', p: 42000 }, { l: '256GB', p: 48000 }], ['أبيض', 'وردي'], ''),
        P('d4', 'تليفونات', 'آيفون 16 بلس', 'Apple', 47000, 0, 'phone-front', 'شاشة كبيرة 6.7 بوصة لأطول بطارية.', [{ l: '128GB', p: null }], ['بنفسجي'], 'الأكثر مبيعًا'),
        P('d5', 'جرابات', 'جراب شفاف MagSafe ضد الصدمات', 'Malikat', 450, 550, 'case-clear', 'زوايا مقوّاة وحلقة مغناطيسية للشحن.', [], ['شفاف'], 'خصم'),
        P('d6', 'جرابات', 'جراب جلد فاخر', 'Malikat', 900, 0, 'case-leather', 'جلد طبيعي بخياطة يدوية.', [], ['خمري', 'بني', 'أسود'], '')
      ]
    };
  }


  load();
  mount('main');
})();
