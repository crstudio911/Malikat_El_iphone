(() => {
  'use strict';
  const MK = window.MK;

  MK.pages.main = function init(host) {
    const { $, esc, money } = MK;
    const q = $('#q', host), catsEl = $('#cats', host), shop = $('#shop', host), countEl = $('#count', host);
    const bar = $('#cartbar', host), barBtn = $('#cartOpen', host);
    const pd = $('#pd', host), pdBody = $('#pdBody', host), pdFoot = $('#pdFoot', host);
    const cartDlg = $('#cart', host), linesEl = $('#cartLines', host), totalEl = $('#cartTotal', host), noteEl = $('#cartNote', host);
    const fName = $('#fName', host), fAddr = $('#fAddr', host), fNote = $('#fNote', host), fNameErr = $('#fNameErr', host);

    const LOGO = 'img/logo.webp';
    const CART_KEY = 'mk_cart_v1', CUST_KEY = 'mk_customer_v1';
    const MAX_LINES = 30, MAX_QTY = 99;

    let cat = 'all', query = '';
    let byId = new Map();
    let cart = loadCart();
    let pdState = null;

    MK.initDialog(pd); MK.initDialog(cartDlg);
    const cfg = () => MK.cfg();
    const ordersOpen = () => cfg().orders_enabled !== false;
    const cur = () => esc(cfg().currency);

    const norm = s => String(s == null ? '' : s).toLowerCase()
      .replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
      .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632)).replace(/\s+/g, ' ').trim();

    const optOf = (p, label) => p.options.find(o => o.l === label) || null;
    const priceFor = (p, label) => { const o = optOf(p, label); return o && o.p != null ? o.p : p.price; };
    const allPrices = p => (p.options.length ? p.options.map(o => (o.p != null ? o.p : p.price)) : [p.price]).filter(n => n > 0);
    const fromPrice = p => { const a = allPrices(p); return a.length ? Math.min(...a) : 0; };
    const hasRange = p => new Set(allPrices(p)).size > 1;
    const needsPick = p => p.options.length > 1 || p.colors.length > 1;

    const ICON_PHONE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 5h3"/></svg>';
    const ICON_CASE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="5.5" y="2" width="13" height="20" rx="3.5"/><rect x="8" y="4.5" width="4.5" height="4.5" rx="1.2"/><circle cx="12" cy="14.5" r="2.6"/></svg>';
    const ICON_TAG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/></svg>';
    const catIcon = n => /جراب|كفر|case/i.test(n) ? ICON_CASE : /تليفون|موبايل|هاتف|هواتف|ايفون|أيفون|آيفون|phone/i.test(n) ? ICON_PHONE : ICON_TAG;

    function imgTag(p, eager) {
      if (!p.image) return `<img class="ph" src="${LOGO}" alt="" width="120" height="120" decoding="async">`;
      return `<img src="${esc(p.image)}" alt="${esc(p.name)}" width="400" height="400" ${eager ? '' : 'loading="lazy" '}decoding="async" referrerpolicy="no-referrer">`;
    }
    host.addEventListener('error', e => {
      const t = e.target;
      if (t && t.tagName === 'IMG' && !t.classList.contains('ph')) {
        t.classList.add('ph'); t.removeAttribute('loading'); t.alt = ''; t.src = LOGO;
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
      else if (cart.length >= MAX_LINES) { MK.toast('السلة وصلت للحد الأقصى'); return false; }
      else cart.push({ id: p.id, o, c, q: Math.min(MAX_QTY, qty) });
      saveCart(); renderBar();
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

    function renderBar() {
      const t = totals();
      bar.hidden = t.n === 0;
      if (!t.n) return;
      barBtn.innerHTML = `<span class="n">${t.n}</span><span>عرض الطلب</span><span class="tot">${t.sum > 0 ? money(t.sum) + ' ' + cur() : ''}</span>`;
    }
    function priceHTML(p) {
      const price = fromPrice(p);
      if (!price) return '<span class="ask">السعر عند التواصل</span>';
      const range = hasRange(p);
      return `${range ? '<span class="from">من</span>' : ''}<b>${money(price)}</b><span class="cur">${cur()}</span>` +
        (!range && p.old_price > price ? `<s>${money(p.old_price)}</s>` : '');
    }

    function cardHTML(p, i) {
      const out = !p.in_stock;
      const closed = !ordersOpen();
      const label = out ? 'غير متوفر' : closed ? 'الطلبات متوقفة' : needsPick(p) ? 'اختار وأضف' : 'أضف للطلب';
      const badge = out ? '<span class="badge out">نفد</span>' : p.badge ? `<span class="badge">${esc(p.badge)}</span>` : '';
      return `<article class="card" data-id="${esc(p.id)}">
  <button class="card-hit" type="button" aria-label="تفاصيل ${esc(p.name)}">
    <div class="media">${imgTag(p, i < 4)}${badge}</div>
    <div class="info">
      ${p.brand ? `<span class="brand-s">${esc(p.brand)}</span>` : ''}
      <h3 class="name">${esc(p.name)}</h3>
      <p class="price">${priceHTML(p)}</p>
    </div>
  </button>
  <button class="add" type="button" ${out || closed ? 'disabled' : ''}>${label}</button>
</article>`;
    }

    function matches(p) {
      if (cat !== 'all' && p.category !== cat) return false;
      if (!query) return true;
      return query.split(' ').every(w => p._s.includes(w));
    }

    function renderChips() {
      const cats = MK.data.categories;
      catsEl.hidden = cats.length < 2;
      if (cats.length < 2) return;
      const mk = (val, text) => `<button class="chip" type="button" data-cat="${esc(val)}" aria-pressed="${cat === val}">${text}</button>`;
      catsEl.innerHTML = mk('all', 'الكل') + cats.map(c => mk(c.name, catIcon(c.name) + esc(c.name))).join('');
    }

    function renderShop() {
      const d = MK.data;
      if (!d) {
        const msg = MK.errorMsg || 'اتأكد إن النت شغّال وحاول تاني.';
        shop.innerHTML = `<div class="empty"><strong>مش قادرين نحمّل المنتجات دلوقتي</strong>${esc(msg)}<br><button class="btn btn-gold" type="button" id="retry">حاول تاني</button></div>`;
        countEl.textContent = '';
        return;
      }
      const list = d.products.filter(matches);
      countEl.textContent = d.products.length ? `${list.length} منتج` : '';

      if (!d.products.length) { shop.innerHTML = '<div class="empty"><strong>المنتجات جاية قريب</strong>لسه مفيش منتجات متضافة.</div>'; return; }
      if (!list.length) { shop.innerHTML = '<div class="empty"><strong>مفيش نتايج</strong>جرّب كلمة تانية أو اختار «الكل».</div>'; return; }

      let n = 0;
      const grid = items => `<div class="grid">${items.map(p => cardHTML(p, n++)).join('')}</div>`;

      if (!query && cat === 'all') {
        const known = new Set(d.categories.map(c => c.name));
        const groups = d.categories.map(c => ({ t: c.name, ic: catIcon(c.name), items: list.filter(p => p.category === c.name) })).filter(g => g.items.length);
        const rest = list.filter(p => !known.has(p.category));
        if (rest.length) groups.push({ t: groups.length ? 'منتجات أخرى' : 'المنتجات', items: rest });
        shop.innerHTML = groups.map(g => `<h2 class="group-title">${g.ic || ''}${esc(g.t)}</h2>${grid(g.items)}`).join('');
      } else {
        shop.innerHTML = grid(list);
      }
    }

    function onData(d) {
      if (d) {
        d.products.forEach(p => { p._s = norm([p.name, p.brand, p.category, ...p.options.map(o => o.l), ...p.colors].join(' ')); });
        byId = new Map(d.products.map(p => [p.id, p]));
        if (cat !== 'all' && !d.categories.some(c => c.name === cat)) cat = 'all';
        cleanCart();
        renderChips();
        if (pd.open && pdState) { const p = byId.get(pdState.p.id); if (p) { pdState.p = p; renderPD(); } else pd.close(); }
        if (cartDlg.open) { renderCart(); }
      }
      renderShop(); renderBar();
    }
    function openProduct(id) {
      const p = byId.get(id); if (!p) return;
      pdState = { p, o: p.options[0] ? p.options[0].l : '', c: p.colors[0] || '', q: 1 };
      renderPD(true);
      MK.open(pd);
      pdBody.scrollTop = 0;
    }

    function renderPD() {
      const { p, o, c, q: qty } = pdState;
      const price = priceFor(p, o);
      const keep = pdBody.scrollTop;
      $('#pdHead', host).textContent = p.name;
      const out = !p.in_stock, closed = !ordersOpen();
      const badge = out ? '<span class="badge out">نفد</span>' : p.badge ? `<span class="badge">${esc(p.badge)}</span>` : '';

      pdBody.innerHTML = `
<div class="pd-media media">${imgTag(p, true)}${badge}</div>
<div>
  ${p.brand ? `<p class="brand-s">${esc(p.brand)}</p>` : ''}
  <h3 class="pd-title">${esc(p.name)}</h3>
</div>
<p class="pd-price">${price > 0
    ? `${money(price)} <span class="cur">${cur()}</span>${p.old_price > price && !optOf(p, o)?.p ? `<s>${money(p.old_price)}</s>` : ''}`
    : '<span class="cur">السعر عند التواصل</span>'}</p>
${p.options.length > 1 ? `
<div class="field"><span class="field-label" id="lbO">الخيار</span>
  <div class="opts" role="radiogroup" aria-labelledby="lbO">${p.options.map(x =>
    `<button class="opt" type="button" role="radio" aria-checked="${x.l === o}" data-opt="${esc(x.l)}">${esc(x.l)}</button>`).join('')}</div></div>` :
    (p.options.length === 1 ? `<p class="pd-desc">الخيار: ${esc(p.options[0].l)}</p>` : '')}
${p.colors.length > 1 ? `
<div class="field"><span class="field-label" id="lbC">اللون</span>
  <div class="opts" role="radiogroup" aria-labelledby="lbC">${p.colors.map(x =>
    `<button class="opt" type="button" role="radio" aria-checked="${x === c}" data-color="${esc(x)}">${esc(x)}</button>`).join('')}</div></div>` :
    (p.colors.length === 1 ? `<p class="pd-desc">اللون: ${esc(p.colors[0])}</p>` : '')}
${p.description ? `<p class="pd-desc">${esc(p.description)}</p>` : ''}`;
      pdBody.scrollTop = keep;

      const label = out ? 'غير متوفر حاليًا' : closed ? 'الطلبات متوقفة مؤقتًا'
        : `أضف للطلب${price > 0 ? ' · ' + money(price * qty) + ' ' + cfg().currency : ''}`;
      pdFoot.innerHTML = `<div class="pd-actions">
  <div class="qty" role="group" aria-label="الكمية"><button type="button" data-q="1" aria-label="زيادة">+</button><span aria-live="polite">${qty}</span><button type="button" data-q="-1" aria-label="نقص">−</button></div>
  <button class="btn btn-gold" type="button" id="pdAdd" ${out || closed ? 'disabled' : ''}>${esc(label)}</button>
</div>`;
    }

    pd.addEventListener('click', e => {
      const t = e.target.closest('button'); if (!t || !pdState) return;
      if (t.dataset.opt != null) { pdState.o = t.dataset.opt; renderPD(); }
      else if (t.dataset.color != null) { pdState.c = t.dataset.color; renderPD(); }
      else if (t.dataset.q) { pdState.q = Math.max(1, Math.min(MAX_QTY, pdState.q + Number(t.dataset.q))); renderPD(); }
      else if (t.id === 'pdAdd') {
        const { p, o, c, q: qty } = pdState;
        if (addToCart(p, o, c, qty)) { pd.close(); MK.toast('اتضاف للطلب'); }
      }
    });
    function renderCart() {
      if (!cart.length) { cartDlg.close(); return; }
      linesEl.innerHTML = cart.map((i, idx) => {
        const p = byId.get(i.id); const pr = priceFor(p, i.o);
        const variant = [i.o, i.c].filter(Boolean).map(esc).join(' · ');
        return `<div class="line" data-i="${idx}">
  <div class="thumb media">${imgTag(p, true)}</div>
  <div>
    <h3>${esc(p.name)}</h3>
    ${variant ? `<p class="var">${variant}</p>` : ''}
    <div class="row">
      <div class="qty" role="group" aria-label="الكمية"><button type="button" data-act="inc" aria-label="زيادة">+</button><span>${i.q}</span><button type="button" data-act="dec" aria-label="نقص">−</button></div>
      <span class="lt">${pr > 0 ? money(pr * i.q) + ' ' + cur() : 'السعر عند التواصل'}</span>
    </div>
    <button class="link-del" type="button" data-act="del">حذف</button>
  </div>
</div>`;
      }).join('');
      const t = totals();
      totalEl.innerHTML = t.sum > 0 ? `${money(t.sum)} ${cur()}` : '—';
      noteEl.hidden = !t.unpriced;
      noteEl.textContent = t.unpriced ? 'في منتجات سعرها عند التواصل ومش داخلة في الإجمالي.' : '';
      $('#fAddrWrap', host).hidden = cfg().ask_address === false;
      const closed = !ordersOpen();
      $('#sendOrder', host).disabled = closed;
    }

    function openCart() {
      try {
        const c = JSON.parse(localStorage.getItem(CUST_KEY) || '{}');
        if (!fName.value && c.name) fName.value = String(c.name).slice(0, 60);
        if (!fAddr.value && c.address) fAddr.value = String(c.address).slice(0, 200);
      } catch (_) { }
      fNameErr.hidden = true; fName.classList.remove('bad');
      renderCart();
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

    $('#clearCart', host).addEventListener('click', () => { cart = []; saveCart(); renderBar(); cartDlg.close(); MK.toast('اتفرّغت السلة'); });
    const wa = s => String(s == null ? '' : s).replace(/[*_~`]/g, '').replace(/\s+/g, ' ').trim();

    function waNumber() {
      let n = String(cfg().whatsapp_number || '').replace(/\D/g, '').replace(/^00/, '');
      if (/^0\d{10}$/.test(n)) n = '20' + n.slice(1);
      return n.length >= 8 && n.length <= 15 ? n : '';
    }

    function buildMessage(name, address, note) {
      const c = cfg(); const t = totals(); const lines = [];
      if (c.order_header) lines.push(wa(c.order_header), '');
      lines.push('*الطلب:*');
      cart.forEach((i, k) => {
        const p = byId.get(i.id); const pr = priceFor(p, i.o);
        const v = [i.o, i.c].filter(Boolean).map(wa).join(' - ');
        lines.push(`${k + 1}) ${wa(p.name)}${v ? ' (' + v + ')' : ''} × ${i.q}` + (pr > 0 ? ` = ${money(pr * i.q)} ${c.currency}` : ' (السعر عند التواصل)'));
      });
      lines.push('');
      if (t.sum > 0) lines.push(`*الإجمالي:* ${money(t.sum)} ${c.currency}` + (t.unpriced ? ' (+ منتجات سعرها عند التواصل)' : ''));
      lines.push('', `*الاسم:* ${wa(name)}`);
      if (address) lines.push(`*العنوان:* ${wa(address)}`);
      if (note) lines.push(`*ملاحظات:* ${wa(note)}`);
      if (c.order_footer) lines.push('', wa(c.order_footer));
      return lines.join('\n');
    }

    $('#sendOrder', host).addEventListener('click', () => {
      if (!ordersOpen()) { MK.toast(cfg().closed_message); return; }
      const num = waNumber();
      if (!num) { MK.toast('رقم الواتساب لسه متضبطش — كلّمنا من أي وسيلة تانية'); return; }
      const name = fName.value.trim().slice(0, 60);
      if (!name) { fNameErr.hidden = false; fName.classList.add('bad'); fName.focus(); return; }
      fNameErr.hidden = true; fName.classList.remove('bad');
      const address = cfg().ask_address === false ? '' : fAddr.value.trim().slice(0, 200);
      const note = fNote.value.trim().slice(0, 300);
      if (!cart.length) return;

      try { localStorage.setItem(CUST_KEY, JSON.stringify({ name, address })); } catch (_) { }
      const url = `https://wa.me/${num}?text=${encodeURIComponent(buildMessage(name, address, note))}`;
      const w = window.open(url, '_blank');
      if (w) w.opener = null; else location.href = url;
      MK.toast('اتفتح واتساب — اضغط إرسال عشان الطلب يوصلنا', 4200);
    });
    fName.addEventListener('input', () => { fNameErr.hidden = true; fName.classList.remove('bad'); });
    let qTimer;
    q.addEventListener('input', () => {
      clearTimeout(qTimer);
      qTimer = setTimeout(() => { query = norm(q.value); renderShop(); }, 120);
    });

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
        if (addToCart(p, p.options[0] ? p.options[0].l : '', p.colors[0] || '', 1)) MK.toast('اتضاف للطلب');
      } else if (e.target.closest('.card-hit')) {
        openProduct(p.id);
      }
    });

    barBtn.addEventListener('click', openCart);

    MK.showcase(host, v => { q.value = v; query = norm(v); cat = 'all'; renderChips(); renderShop(); $('.toolbar', host).scrollIntoView({ behavior: 'smooth', block: 'start' }); });

    MK.subscribe(onData);
  };
})();
