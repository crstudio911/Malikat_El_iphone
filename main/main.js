(() => {
  'use strict';
  const MK = window.MK;

  MK.pages.main = function init() {
    const { $, esc, money, t } = MK;
    const q = $('#q'), catsEl = $('#cats'), shop = $('#shop'), countEl = $('#count');
    const bar = $('#cartbar'), barBtn = $('#cartOpen');
    const pd = $('#pd'), pdBody = $('#pdBody'), pdFoot = $('#pdFoot');
    const cartDlg = $('#cart'), linesEl = $('#cartLines'), totalEl = $('#cartTotal'), noteEl = $('#cartNote');
    const fName = $('#fName'), fAddr = $('#fAddr'), fNote = $('#fNote'), fNameErr = $('#fNameErr');
    const fPhone = $('#fPhone'), fPhoneErr = $('#fPhoneErr'), fAddrErr = $('#fAddrErr');
    const fGov = $('#fGov'), fGovErr = $('#fGovErr');
    const LISTS = window.MK_LISTS || { ICONS: {}, GOV: [], parseShip: () => [] };

    const LOGO = 'img/logo.webp';
    const CART_KEY = 'mk_cart_v1', CUST_KEY = 'mk_customer_v1';
    const MAX_LINES = 30, MAX_QTY = 99;

    let cat = 'all', query = '';
    let byId = new Map();
    let cart = loadCart();
    let pdState = null;
    let pendingOpen = (location.hash.match(/^#p=(.+)$/) || [])[1] || '';

    MK.initDialog(pd); MK.initDialog(cartDlg);
    const cfg = () => MK.cfg();
    const ordersOpen = () => cfg().orders_enabled !== false;
    const cur = () => esc(MK.cur());

    const norm = s => String(s == null ? '' : s).toLowerCase()
      .replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
      .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632)).replace(/\s+/g, ' ').trim();

    const optOf = (p, label) => p.options.find(o => o.l === label) || null;
    const priceFor = (p, label) => { const o = optOf(p, label); return o && o.p != null ? o.p : p.price; };
    const allPrices = p => (p.options.length ? p.options.map(o => (o.p != null ? o.p : p.price)) : [p.price]).filter(n => n > 0);
    const fromPrice = p => { const a = allPrices(p); return a.length ? Math.min(...a) : 0; };
    const hasRange = p => new Set(allPrices(p)).size > 1;
    const needsPick = p => p.options.length > 1 || p.colors.length > 1;
    const nameOf = p => MK.L(p, 'name');

    const ICON_PHONE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 5h3"/></svg>';
    const ICON_CASE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="5.5" y="2" width="13" height="20" rx="3.5"/><rect x="8" y="4.5" width="4.5" height="4.5" rx="1.2"/><circle cx="12" cy="14.5" r="2.6"/></svg>';
    const ICON_TAG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/></svg>';
    const ICON_BAG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>';
    const catIcon = n => /جراب|كفر|case/i.test(n) ? ICON_CASE : /تليفون|موبايل|هاتف|هواتف|ايفون|أيفون|آيفون|phone/i.test(n) ? ICON_PHONE : ICON_TAG;

    const imgsOf = p => (Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []));
    function pdImg(p) {
      const u = imgsOf(p)[pdState.i || 0];
      return u ? `<img src="${esc(u)}" alt="${esc(nameOf(p))}" width="400" height="400" decoding="async" referrerpolicy="no-referrer">` : imgTag(p, true);
    }
    function imgTag(p, eager) {
      if (!p.image) return `<img class="ph" src="${LOGO}" alt="" width="120" height="120" decoding="async">`;
      return `<img src="${esc(p.image)}" alt="${esc(nameOf(p))}" width="400" height="400" ${eager ? '' : 'loading="lazy" '}decoding="async" referrerpolicy="no-referrer">`;
    }
    document.addEventListener('error', e => {
      const el = e.target;
      if (el && el.tagName === 'IMG' && !el.classList.contains('ph') && el.closest('.media')) {
        el.classList.add('ph'); el.removeAttribute('loading'); el.alt = ''; el.src = LOGO;
      }
    }, true);

    function loadCart() {
      try {
        const a = JSON.parse(localStorage.getItem(CART_KEY));
        if (Array.isArray(a)) {
          return a.filter(i => i && typeof i.id === 'string' && Number.isInteger(i.q) && i.q >= 1 && i.q <= MAX_QTY)
            .map(i => ({ id: i.id, o: String(i.o || ''), c: String(i.c || ''), q: i.q })).slice(0, MAX_LINES);
        }
      } catch (_) { }
      return [];
    }
    const saveCart = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (_) { } };
    function cleanCart() {
      cart = cart.filter(i => { const p = byId.get(i.id); return p && p.in_stock; }).map(i => {
        const p = byId.get(i.id);
        const o = p.options.some(x => x.l === i.o) ? i.o : (p.options[0] ? p.options[0].l : '');
        const c = p.colors.includes(i.c) ? i.c : (p.colors[0] || '');
        return { id: i.id, o, c, q: i.q };
      });
      saveCart();
    }

    function addToCart(p, o, c, qty) {
      const hit = cart.find(i => i.id === p.id && i.o === o && i.c === c);
      if (hit) hit.q = Math.min(MAX_QTY, hit.q + qty);
      else if (cart.length >= MAX_LINES) { MK.toast(t('full')); return false; }
      else cart.push({ id: p.id, o, c, q: Math.min(MAX_QTY, qty) });
      saveCart(); renderBar(true);
      return true;
    }

    function totals() {
      let n = 0, sum = 0, unpriced = false;
      cart.forEach(i => {
        const p = byId.get(i.id); if (!p) return;
        n += i.q;
        const pr = priceFor(p, i.o);
        if (pr > 0) sum += pr * i.q; else unpriced = true;
      });
      return { n, sum, unpriced };
    }

    function renderBar(bump) {
      const s = totals();
      bar.hidden = s.n === 0;
      document.body.classList.toggle('has-bar', !bar.hidden);
      if (!s.n) return;
      barBtn.innerHTML = `<span class="cb-l">${ICON_BAG}<span>${esc(t('viewCart'))}</span></span><span class="cb-r"><span class="tot">${s.sum > 0 ? money(s.sum) + ' ' + cur() : ''}</span><span class="n">${s.n}</span></span>`;
      if (bump) { barBtn.classList.remove('bump'); void barBtn.offsetWidth; barBtn.classList.add('bump'); }
    }

    function priceHTML(p) {
      const price = fromPrice(p);
      if (!price) return `<span class="ask">${esc(t('ask'))}</span>`;
      const range = hasRange(p);
      return `${range ? `<span class="from">${esc(t('from'))}</span>` : ''}<b>${money(price)}</b><span class="cur">${cur()}</span>` +
        (p.old_price > price ? `<s>${money(p.old_price)} ${cur()}</s>` : '');
    }
    const badgeHTML = p => !p.in_stock ? `<span class="badge out">${esc(t('outBadge'))}</span>` : p.badge ? `<span class="badge">${esc(MK.L(p, 'badge'))}</span>` : '';

    function cardHTML(p, i) {
      const out = !p.in_stock, closed = !ordersOpen();
      const label = out ? t('out') : closed ? t('closedBtn') : needsPick(p) ? t('pick') : t('add');
      return `<article class="card" data-id="${esc(p.id)}">
  <button class="card-hit" type="button" aria-label="${esc(t('details'))} ${esc(nameOf(p))}">
    <div class="media">${imgTag(p, i < 4)}${badgeHTML(p)}</div>
    <div class="info">
      ${p.brand ? `<span class="brand-s">${esc(p.brand)}</span>` : ''}
      <h3 class="name">${esc(nameOf(p))}</h3>
      <p class="price">${priceHTML(p)}</p>
    </div>
  </button>
  <button class="add" type="button" ${out || closed ? 'disabled' : ''}><span>${esc(label)}</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
</article>`;
    }

    function matches(p) {
      if (cat !== 'all' && p.category !== cat) return false;
      if (!query) return true;
      return query.split(' ').every(w => p._s.includes(w));
    }

    function renderChips() {
      if (!MK.data) return;
      const cats = MK.data.categories;
      catsEl.hidden = cats.length < 2;
      if (cats.length < 2) return;
      const mk = (val, text) => `<button class="chip" type="button" data-cat="${esc(val)}" aria-pressed="${cat === val}">${text}</button>`;
      catsEl.innerHTML = mk('all', esc(t('all'))) + cats.map(c => mk(c.name, (c.image ? `<img class="chip-img" src="${esc(c.image)}" alt="" width="26" height="26" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : (LISTS.ICONS[c.icon] ? LISTS.ICONS[c.icon].svg.replace(/width="22" height="22"/, 'width="18" height="18" class="chip-ic"') : catIcon(c.name + ' ' + (c.en || '')))) + esc(MK.catL(c.name)))).join('');
    }

    function renderShop() {
      const d = MK.data;
      if (!d) {
        if (MK.status !== 'error') return;
        shop.innerHTML = `<div class="empty"><strong>${esc(t('loadFail'))}</strong>${esc(t('loadFailS'))}<br><button class="btn btn-main" type="button" id="retry">${esc(t('retry'))}</button></div>`;
        countEl.textContent = '';
        return;
      }
      const list = d.products.filter(matches);
      countEl.textContent = d.products.length ? t('items')(list.length) : '';
      if (!d.products.length) { shop.innerHTML = `<div class="empty"><strong>${esc(t('soon'))}</strong>${esc(t('soonS'))}</div>`; return; }
      if (!list.length) { shop.innerHTML = `<div class="empty"><strong>${esc(t('noRes'))}</strong>${esc(t('noResS'))}</div>`; return; }

      let n = 0;
      const grid = items => `<div class="grid">${items.map(p => cardHTML(p, n++)).join('')}</div>`;
      if (!query && cat === 'all') {
        const known = new Set(d.categories.map(c => c.name));
        const groups = d.categories.map(c => ({ t: MK.catL(c.name), ic: catIcon(c.name + ' ' + (c.en || '')), items: list.filter(p => p.category === c.name) })).filter(g => g.items.length);
        const rest = list.filter(p => !known.has(p.category));
        if (rest.length) groups.push({ t: groups.length ? t('other') : t('products'), ic: ICON_TAG, items: rest });
        shop.innerHTML = groups.map(g => `<h2 class="group-title"><span class="gi">${g.ic}</span>${esc(g.t)}<span class="gc">${g.items.length}</span></h2>${grid(g.items)}`).join('');
      } else {
        shop.innerHTML = grid(list);
      }
      shop.querySelectorAll('.card').forEach((c, i) => c.style.setProperty('--dl', Math.min(i, 8) * .05 + 's'));
    }

    function indexSearch(d) {
      d.products.forEach(p => {
        const en = p.en || {};
        p._s = norm([p.name, p.brand, p.category, en.name, en.category, MK.catL(p.category), ...p.options.map(o => o.l), ...p.colors, ...(en.colors || [])].join(' '));
      });
    }

    function onData(d) {
      if (d) {
        indexSearch(d);
        byId = new Map(d.products.map(p => [p.id, p]));
        if (cat !== 'all' && !d.categories.some(c => c.name === cat)) cat = 'all';
        cleanCart();
        renderChips();
        if (pd.open && pdState) { const p = byId.get(pdState.p.id); if (p) { pdState.p = p; renderPD(); } else pd.close(); }
        if (cartDlg.open) renderCart();
        if (pendingOpen) { let id = ''; try { id = decodeURIComponent(pendingOpen); } catch (_) { } pendingOpen = ''; if (id && byId.has(id)) setTimeout(() => openProduct(id), 200); }
      }
      renderShop(); renderBar();
    }

    function openProduct(id) {
      const p = byId.get(id); if (!p) return;
      pdState = { p, o: p.options[0] ? p.options[0].l : '', c: p.colors[0] || '', q: 1 };
      renderPD();
      MK.open(pd);
      pdBody.scrollTop = 0;
      startAuto();
    }

    let autoT = 0;
    const AUTO_MS = 3500;
    const stopAuto = () => { clearInterval(autoT); autoT = 0; };
    function showImg(i) {
      if (!pdState) return;
      const list = imgsOf(pdState.p); if (list.length < 2) return;
      pdState.i = ((i % list.length) + list.length) % list.length;
      const im = pdBody.querySelector('.pd-media img');
      if (im) {
        im.classList.remove('swap'); void im.offsetWidth; im.classList.add('swap');
        im.src = list[pdState.i];
      }
      pdBody.querySelectorAll('.pd-th').forEach((t, k) => t.setAttribute('aria-pressed', String(k === pdState.i)));
    }
    function startAuto() {
      stopAuto();
      if (!pdState || imgsOf(pdState.p).length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      autoT = setInterval(() => { if (!pd.open || document.hidden) return; showImg((pdState.i || 0) + 1); }, AUTO_MS);
    }
    pd.addEventListener('close', stopAuto);

    function renderPD() {
      const { p, o, c, q: qty } = pdState;
      const price = priceFor(p, o);
      const keep = pdBody.scrollTop;
      $('#pdHead').textContent = nameOf(p);
      const out = !p.in_stock, closed = !ordersOpen();
      const desc = MK.L(p, 'description');
      pdBody.innerHTML = `
<div class="pd-media media">${pdImg(p)}${badgeHTML(p)}</div>
${imgsOf(p).length > 1 ? `<div class="pd-thumbs">${imgsOf(p).map((u, i) => `<button type="button" class="pd-th" data-img="${i}" aria-pressed="${i === (pdState.i || 0)}" aria-label="${i + 1}"><img src="${esc(u)}" alt="" width="64" height="64" decoding="async" referrerpolicy="no-referrer"></button>`).join('')}</div>` : ''}
<div>
  ${p.brand ? `<p class="brand-s">${esc(p.brand)}</p>` : ''}
  <h3 class="pd-title">${esc(nameOf(p))}</h3>
</div>
<p class="pd-price">${price > 0
    ? `${money(price)} <span class="cur">${cur()}</span>${p.old_price > price ? `<s>${money(p.old_price)} ${cur()}</s>` : ''}`
    : `<span class="cur">${esc(t('ask'))}</span>`}</p>
${p.options.length > 1 ? `
<div class="field"><span class="field-label" id="lbO">${esc(t('option'))}</span>
  <div class="opts" role="radiogroup" aria-labelledby="lbO">${p.options.map(x =>
    `<button class="opt" type="button" role="radio" aria-checked="${x.l === o}" data-opt="${esc(x.l)}">${esc(MK.optL(p, x.l))}</button>`).join('')}</div></div>` :
    (p.options.length === 1 ? `<p class="pd-desc">${esc(t('option'))}: ${esc(MK.optL(p, p.options[0].l))}</p>` : '')}
${p.colors.length > 1 ? `
<div class="field"><span class="field-label" id="lbC">${esc(t('color'))}</span>
  <div class="opts" role="radiogroup" aria-labelledby="lbC">${p.colors.map(x =>
    `<button class="opt" type="button" role="radio" aria-checked="${x === c}" data-color="${esc(x)}">${esc(MK.colL(p, x))}</button>`).join('')}</div></div>` :
    (p.colors.length === 1 ? `<p class="pd-desc">${esc(t('color'))}: ${esc(MK.colL(p, p.colors[0]))}</p>` : '')}
${desc ? `<p class="pd-desc">${esc(desc)}</p>` : ''}`;
      pdBody.scrollTop = keep;
      const label = out ? t('outLong') : closed ? t('closedLong') : t('add') + (price > 0 ? ' · ' + money(price * qty) + ' ' + MK.cur() : '');
      pdFoot.innerHTML = `<div class="pd-actions">
  <div class="qty" role="group" aria-label="${esc(t('qty'))}"><button type="button" data-q="-1" aria-label="${esc(t('dec'))}">−</button><span aria-live="polite">${qty}</span><button type="button" data-q="1" aria-label="${esc(t('inc'))}">+</button></div>
  <button class="btn btn-main" type="button" id="pdAdd" ${out || closed ? 'disabled' : ''}>${esc(label)}</button>
</div>`;
    }

    pd.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || !pdState) return;
      if (b.dataset.img != null) { showImg(Number(b.dataset.img) || 0); startAuto(); }
      else if (b.dataset.opt != null) { pdState.o = b.dataset.opt; renderPD(); }
      else if (b.dataset.color != null) { pdState.c = b.dataset.color; renderPD(); }
      else if (b.dataset.q) { pdState.q = Math.max(1, Math.min(MAX_QTY, pdState.q + Number(b.dataset.q))); renderPD(); }
      else if (b.id === 'pdAdd') {
        const { p, o, c, q: qty } = pdState;
        if (addToCart(p, o, c, qty)) { pd.close(); MK.toast(t('added')); }
      }
    });

    function renderCart() {
      if (!cart.length) { cartDlg.close(); return; }
      linesEl.innerHTML = cart.map((i, idx) => {
        const p = byId.get(i.id); const pr = priceFor(p, i.o);
        const variant = [i.o && MK.optL(p, i.o), i.c && MK.colL(p, i.c)].filter(Boolean).map(esc).join(' · ');
        return `<div class="line" data-i="${idx}">
  <div class="thumb media">${imgTag(p, true)}</div>
  <div>
    <h3>${esc(nameOf(p))}</h3>
    ${variant ? `<p class="var">${variant}</p>` : ''}
    <div class="row">
      <div class="qty" role="group" aria-label="${esc(t('qty'))}"><button type="button" data-act="dec" aria-label="${esc(t('dec'))}">−</button><span>${i.q}</span><button type="button" data-act="inc" aria-label="${esc(t('inc'))}">+</button></div>
      <span class="lt">${pr > 0 ? money(pr * i.q) + ' ' + cur() : esc(t('ask'))}</span>
    </div>
    <button class="link-del" type="button" data-act="del">${esc(t('del'))}</button>
  </div>
</div>`;
      }).join('');
      renderMethod();
      renderSums();
      syncSend();
    }

    const canDel = () => cfg().delivery_enabled !== false;
    const canPick = () => cfg().pickup_enabled !== false;
    const shipList = () => {
      const l = LISTS.parseShip(cfg().shipping);
      return l.length ? l.map(x => Object.assign({ known: true }, x)) : LISTS.GOV.map(g => ({ name: g[0], fee: 0, known: false }));
    };
    const govL = n => { if (MK.lang() !== 'en') return n; const g = LISTS.GOV.find(x => x[0] === n); return g ? g[1] : n; };
    function method() {
      const m = (cartDlg.querySelector('input[name=method]:checked') || {}).value;
      if (m === 'pickup' && canPick()) return 'pickup';
      if (canDel()) return 'delivery';
      return canPick() ? 'pickup' : '';
    }
    function shipNow() {
      if (method() !== 'delivery') return { fee: 0, state: 'none' };
      const g = shipList().find(x => x.name === fGov.value);
      if (!g) return { fee: 0, state: 'pick' };
      if (!g.known) return { fee: 0, state: 'ask' };
      return { fee: g.fee, state: g.fee > 0 ? 'fee' : 'free' };
    }
    function renderMethod() {
      const d = canDel(), pk = canPick();
      $('#mDelWrap').hidden = !d; $('#mPickWrap').hidden = !pk;
      $('#fMethod').hidden = !d && !pk;
      const m = method();
      cartDlg.querySelectorAll('input[name=method]').forEach(r => { r.checked = r.value === m; });
      const keep = fGov.value;
      fGov.innerHTML = `<option value="">${esc(t('fGovPh'))}</option>` + shipList().map(g => `<option value="${esc(g.name)}">${esc(govL(g.name))}${g.known ? ' — ' + (g.fee > 0 ? money(g.fee) + ' ' + cur() : esc(t('shipFree'))) : ''}</option>`).join('');
      if (shipList().some(g => g.name === keep)) fGov.value = keep;
      const del = m === 'delivery';
      $('#fGovWrap').hidden = !del; $('#fAddrWrap').hidden = !del; $('#shipRow').hidden = !del;
      const pi = $('#pickInfo');
      pi.hidden = m !== 'pickup';
      if (m === 'pickup') {
        const a = MK.cfgL('address'), h = MK.cfgL('open_hours');
        pi.innerHTML = `<b>${esc(t('pickAt'))}</b>${a ? `<span>${esc(a)}</span>` : ''}${h ? `<span>${esc(t('pickHours'))}: ${esc(h)}</span>` : ''}`;
      }
    }
    function renderSums() {
      const s = totals(), sh = shipNow();
      $('#cartSub').innerHTML = s.sum > 0 ? `${money(s.sum)} ${cur()}` : '—';
      $('#cartShip').innerHTML = sh.state === 'fee' ? `${money(sh.fee)} ${cur()}` : esc(t(sh.state === 'free' ? 'shipFree' : sh.state === 'ask' ? 'shipAsk' : 'shipPick'));
      const g = s.sum + sh.fee;
      totalEl.innerHTML = g > 0 ? `${money(g)} ${cur()}` : '—';
      noteEl.hidden = !s.unpriced;
      noteEl.textContent = s.unpriced ? t('unpriced') : '';
    }
    $('#fMethod').addEventListener('change', () => { renderMethod(); renderSums(); syncSend(); });
    fGov.addEventListener('change', () => { fGovErr.hidden = true; fGov.classList.remove('bad'); renderSums(); syncSend(); });

    function openCart() {
      try {
        const c = JSON.parse(localStorage.getItem(CUST_KEY) || '{}');
        if (c.name) $('#fRemember').checked = true;
        if (!fName.value && c.name) fName.value = String(c.name).slice(0, 60);
        if (!fAddr.value && c.address) fAddr.value = String(c.address).slice(0, 200);
        if (!fPhone.value && c.phone) fPhone.value = String(c.phone).slice(0, 20);
        if (c.method) { const r = cartDlg.querySelector(`input[name=method][value="${c.method === 'pickup' ? 'pickup' : 'delivery'}"]`); if (r) r.checked = true; }
        renderMethod();
        if (!fGov.value && c.gov && shipList().some(g => g.name === c.gov)) fGov.value = c.gov;
      } catch (_) { }
      [[fName, fNameErr], [fPhone, fPhoneErr], [fAddr, fAddrErr], [fGov, fGovErr]].forEach(([i, e]) => { e.hidden = true; i.classList.remove('bad'); });
      renderCart(); syncSend();
      if (cart.length) MK.open(cartDlg);
    }

    linesEl.addEventListener('click', e => {
      const b = e.target.closest('button[data-act]'); if (!b) return;
      const idx = Number(b.closest('.line').dataset.i); const it = cart[idx]; if (!it) return;
      if (b.dataset.act === 'inc') it.q = Math.min(MAX_QTY, it.q + 1);
      else if (b.dataset.act === 'dec') it.q = Math.max(1, it.q - 1);
      else if (b.dataset.act === 'del') cart.splice(idx, 1);
      saveCart(); renderBar(); renderCart();
    });

    $('#clearCart').addEventListener('click', () => { cart = []; saveCart(); renderBar(); cartDlg.close(); MK.toast(t('cleared')); });
    const wa = s => String(s == null ? '' : s).replace(/[*_~`]/g, '').replace(/\s+/g, ' ').trim();

    const needAddr = () => method() === 'delivery';
    const phoneOk = v => { const d = v.replace(/[\s\-()+]/g, ''); return /^\d{8,15}$/.test(d); };
    const checks = () => [
      [fName, fNameErr, fName.value.trim().length >= 2],
      [fPhone, fPhoneErr, !fPhone.value.trim() || phoneOk(fPhone.value.trim())],
      [fGov, fGovErr, !needAddr() || !!fGov.value],
      [fAddr, fAddrErr, !needAddr() || fAddr.value.trim().length >= 5]
    ];
    function syncSend() {
      const ok = checks().every(c => c[2]);
      const btn = $('#sendOrder');
      btn.disabled = !ordersOpen() || !cart.length || !method();
      btn.classList.toggle('not-ready', !ok);
    }

    function waNumber() {
      let n = String(cfg().whatsapp_number || '').replace(/\D/g, '').replace(/^00/, '');
      if (/^0\d{10}$/.test(n)) n = '20' + n.slice(1);
      return n.length >= 8 && n.length <= 15 ? n : '';
    }

    function orderRef() {
      const d = new Date(), z = n => String(n).padStart(2, '0');
      const r = Math.random().toString(36).slice(2, 6).toUpperCase();
      return `MK-${String(d.getFullYear()).slice(2)}${z(d.getMonth() + 1)}${z(d.getDate())}-${r}`;
    }
    function buildMessage(name, phone, address, note, gov) {
      const c = cfg(); const s = totals(); const sh = shipNow(); const m = method(); const cu = c.currency || 'ج.م';
      const d = new Date(), z = n => String(n).padStart(2, '0');
      const line = '━━━━━━━━━━━━━━', lines = [];
      const count = cart.reduce((a, i) => a + i.q, 0);
      lines.push(`*فاتورة طلب | ${wa(c.store_name || 'ملكة الأيفون')}*`);
      if (c.order_header) lines.push(`_${wa(c.order_header)}_`);
      lines.push(line);
      lines.push(`*كود الطلب:* \`${orderRef()}\``);
      lines.push(`*التاريخ:* ${z(d.getDate())}/${z(d.getMonth() + 1)}/${d.getFullYear()} - ${z(d.getHours())}:${z(d.getMinutes())}`);
      lines.push(line);
      lines.push('*الطلب:*');
      cart.forEach((i, k) => {
        const p = byId.get(i.id); const pr = priceFor(p, i.o);
        lines.push(`*${k + 1}.* ${wa(p.name)} \`${p.id}\``);
        const ex = [i.o && `الاختيار: ${wa(i.o)}`, i.c && `اللون: ${wa(i.c)}`].filter(Boolean);
        if (ex.length) lines.push(`    _${ex.join(' | ')}_`);
        lines.push(pr > 0 ? `    ${i.q} × ${money(pr)} = *${money(pr * i.q)} ${cu}*` : `    الكمية: ${i.q} | _السعر عند التواصل_`);
      });
      lines.push(line);
      lines.push(`*عدد المنتجات:* ${count}`);
      lines.push(`*إجمالي المنتجات:* ${s.sum > 0 ? money(s.sum) + ' ' + cu : 'عند التواصل'}`);
      if (m === 'delivery') lines.push(`*مصاريف الشحن:* ${sh.state === 'fee' ? money(sh.fee) + ' ' + cu : sh.state === 'ask' ? 'هتتحدد على واتساب' : 'مجاني'}`);
      lines.push(`*الإجمالي المطلوب:* *${s.sum + sh.fee > 0 ? money(s.sum + sh.fee) + ' ' + cu : 'عند التواصل'}*` + (s.unpriced ? ' _(+ منتجات سعرها عند التواصل)_' : ''));
      lines.push(line);
      lines.push('*بيانات العميل:*');
      lines.push(`*الاسم:* ${wa(name)}`);
      if (phone) lines.push(`*رقم تاني للتواصل:* ${wa(phone)}`);
      lines.push(`*طريقة الاستلام:* ${m === 'pickup' ? 'استلام من المحل' : 'توصيل للبيت'}`);
      if (m === 'delivery') { lines.push(`*المحافظة:* ${wa(gov)}`); lines.push(`*العنوان:* ${wa(address)}`); }
      else if (c.address) lines.push(`*عنوان المحل:* ${wa(c.address)}`);
      if (note) lines.push(`*ملاحظات:* _${wa(note)}_`);
      if (MK.lang() === 'en') lines.push('_(Customer browsed in English)_');
      lines.push(line);
      if (c.order_footer) lines.push(`_${wa(c.order_footer)}_`);
      return lines.join('\n');
    }

    $('#sendOrder').addEventListener('click', () => {
      if (!ordersOpen()) { MK.toast(MK.cfgL('closed_message')); return; }
      const num = waNumber();
      if (!num) { MK.toast(t('noWa')); return; }
      const bad = checks().filter(c => !c[2]);
      checks().forEach(([i, e, ok]) => { e.hidden = ok; i.classList.toggle('bad', !ok); });
      if (bad.length) { bad[0][0].focus(); MK.toast(t('fixForm')); return; }
      const name = fName.value.trim().slice(0, 60);
      const phone = fPhone.value.trim().slice(0, 20);
      const address = needAddr() ? fAddr.value.trim().slice(0, 200) : '';
      const gov = needAddr() ? fGov.value : '';
      if (!method()) { MK.toast(t('noMethod')); return; }
      const note = fNote.value.trim().slice(0, 300);
      if (!cart.length) return;
      if (!$('#fRemember').checked) { try { localStorage.removeItem(CUST_KEY); } catch (_) { } }
      else try { localStorage.setItem(CUST_KEY, JSON.stringify({ name, phone, address: address || (JSON.parse(localStorage.getItem(CUST_KEY) || '{}').address || ''), gov: gov || (JSON.parse(localStorage.getItem(CUST_KEY) || '{}').gov || ''), method: method() })); } catch (_) { }
      const url = `https://wa.me/${num}?text=${encodeURIComponent(buildMessage(name, phone, address, note, gov))}`;
      const w = window.open(url, '_blank');
      if (w) w.opener = null; else location.href = url;
      MK.toast(t('waOpened'), 4200);
    });
    [[fName, fNameErr], [fPhone, fPhoneErr], [fAddr, fAddrErr]].forEach(([i, e]) => i.addEventListener('input', () => { e.hidden = true; i.classList.remove('bad'); syncSend(); }));

    let qTimer;
    q.addEventListener('input', () => {
      clearTimeout(qTimer);
      qTimer = setTimeout(() => { query = norm(q.value); renderShop(); }, 120);
    });
    const initQ = new URLSearchParams(location.search).get('q');
    if (initQ) { q.value = initQ.slice(0, 60); query = norm(q.value); }

    catsEl.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      cat = b.dataset.cat;
      catsEl.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      renderShop();
    });

    shop.addEventListener('click', e => {
      if (e.target.closest('#retry')) { MK.reload(); return; }
      const card = e.target.closest('.card'); if (!card) return;
      const p = byId.get(card.dataset.id); if (!p) return;
      if (e.target.closest('.add')) {
        if (!p.in_stock || !ordersOpen()) return;
        if (needsPick(p)) { openProduct(p.id); return; }
        if (addToCart(p, p.options[0] ? p.options[0].l : '', p.colors[0] || '', 1)) MK.toast(t('added'));
      } else if (e.target.closest('.card-hit')) openProduct(p.id);
    });

    barBtn.addEventListener('click', openCart);

    MK.onLang(() => {
      if (MK.data) indexSearch(MK.data);
      renderChips(); renderShop(); renderBar();
      if (pd.open && pdState) renderPD();
      if (cartDlg.open) renderCart();
    });
    MK.subscribe(onData);
  };
})();
