(() => {
  'use strict';
  const MK = window.MK;

  const DECK = [
    { k: ['جراب', 'Case'], n: ['جراب جلد فاخر', 'Premium leather case'], img: 'case-leather', q: 'جراب جلد', g: 'linear-gradient(160deg,#9b2c45,#3d0b1b)' },
    { k: ['آيفون', 'iPhone'], n: ['آيفون 16 برو', 'iPhone 16 Pro'], img: 'phone-blue', q: 'آيفون 16 برو', g: 'linear-gradient(160deg,#3e5d93,#0d1830)' },
    { k: ['جديد', 'New'], n: ['آيفون 17 برو ماكس', 'iPhone 17 Pro Max'], img: 'phone-orange', q: 'آيفون 17', g: 'linear-gradient(160deg,#ffa25a,#c43d05)' },
    { k: ['آيفون', 'iPhone'], n: ['آيفون 16 بلس', 'iPhone 16 Plus'], img: 'phone-front', q: 'آيفون 16 بلس', g: 'linear-gradient(160deg,#ff7a3d,#7a1e3a)' },
    { k: ['جراب', 'Case'], n: ['جراب شفاف MagSafe', 'Clear MagSafe case'], img: 'case-clear', q: 'جراب شفاف', g: 'linear-gradient(160deg,#5a4a42,#1b120c)' },
    { k: ['آيفون', 'iPhone'], n: ['آيفون 16', 'iPhone 16'], img: 'phone-silver', q: 'آيفون 16', g: 'linear-gradient(160deg,#d8cfc6,#6f655c)' }
  ];
  const LEFT = ['#ff5b14', '#ff6f2e', '#ff8547', '#ff9c63', '#ffb383', '#ffcaa6'];
  const RIGHT = ['#7a1e3a', '#93284a', '#ad375c', '#c64e72', '#d9708f', '#e897ae'];
  const SPARK = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/></svg>';

  MK.pages.home = function init() {
    const { $, esc, money, t } = MK;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const li = () => (MK.lang() === 'en' ? 1 : 0);

    requestAnimationFrame(() => document.body.classList.add('ready'));

    const mq = $('#mq');
    const renderMq = () => {
      const own = String(MK.cfgL('marquee') || '').split(/\n+/).map(x => x.trim()).filter(Boolean).slice(0, 12);
      const items = (own.length ? own : t('mq')).map(w => `<span>${esc(w)}${SPARK}</span>`).join('');
      mq.innerHTML = items + items + items + items;
    };
    renderMq();

    document.querySelectorAll('.bento .tile').forEach((el, i) => el.style.setProperty('--i', i));
    document.querySelectorAll('.steps li').forEach((el, i) => el.style.setProperty('--dl', (i * .1) + 's'));

    const io = 'IntersectionObserver' in window && !reduce
      ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .15, rootMargin: '0px 0px -40px 0px' })
      : null;
    const observe = root => root.querySelectorAll('.rv:not(.in)').forEach(el => io ? io.observe(el) : el.classList.add('in'));
    observe(document);

    const art = $('#heroArt');
    const imgs = { o: $('.ph-o', art), b: $('.ph-b', art), s: $('.ph-s', art) };
    let mx = 0, my = 0, sy = 0, raf = 0, ax = 0, ay = 0, as = 0;
    const paint = () => {
      raf = 0;
      ax += (mx - ax) * .12; ay += (my - ay) * .12; as += (sy - as) * .18;
      const done = Math.abs(mx - ax) < .001 && Math.abs(my - ay) < .001 && Math.abs(sy - as) < .5;
      if (done) { ax = mx; ay = my; as = sy; }
      const p = Math.min(1, as / innerHeight);
      imgs.o.style.transform = `translate3d(${ax * 14}px,${ay * 10 - p * 60}px,0) rotate(${ax * 3}deg)`;
      imgs.b.style.transform = `translate3d(${ax * -10 - p * 40}px,${ay * -6 + p * 30}px,0) rotate(${-12 - p * 10}deg)`;
      imgs.s.style.transform = `translate3d(${ax * -10 + p * 40}px,${ay * -6 + p * 30}px,0) rotate(${12 + p * 10}deg)`;
      if (!done) req();
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(paint); };
    if (!reduce) {
      addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; req(); }, { passive: true });
      addEventListener('scroll', () => { sy = scrollY; req(); }, { passive: true });
    }
    paint();

    const deck = $('#deck'), track = $('#deckTrack'), hint = $('#deckHint');
    const n = DECK.length, mid = (n - 1) / 2;
    const order = DECK.map((_, i) => i).sort((a, b) => Math.abs(b - mid) - Math.abs(a - mid));
    const renderDeck = () => {
      const l = li();
      deck.innerHTML = DECK.map((d, i) => `<a class="dcard" role="listitem" href="main.html?q=${encodeURIComponent(d.q)}" data-i="${i}" aria-label="${esc(d.n[l])}">
  <span class="dc-num">${String(i + 1).padStart(2, '0')}</span>
  <img src="img/products/${d.img}.webp" alt="" width="497" height="900" decoding="async"${Math.abs(i - mid) < 1 ? '' : ' loading="lazy"'}>
  <span class="dc-txt"><span class="dc-k">${esc(d.k[l])}</span><span class="dc-n">${esc(d.n[l])}</span></span>
</a>`).join('');
      [...deck.children].forEach((c, i) => { c.style.setProperty('--g', DECK[i].g); c.style.zIndex = order.indexOf(i) + 1; });
      cur = -1; layout();
    };
    const ease = x => 1 - Math.pow(1 - x, 3);
    let draf = 0, cur = -1;
    function layout() {
      draf = 0;
      const cards = [...deck.children]; if (!cards.length) return;
      let goal = 1;
      if (!reduce) {
        const r = track.getBoundingClientRect();
        const span = r.height - innerHeight;
        goal = span > 0 ? Math.min(1, Math.max(0, (-r.top) / span * 1.3)) : 1;
      }
      cur = cur < 0 ? goal : cur + (goal - cur) * .14;
      if (Math.abs(goal - cur) < .002) cur = goal; else dreq();
      const p = cur;
      const e = ease(p);
      const W = deck.clientWidth, cw = cards[0].offsetWidth;
      const gap = Math.min(cw * 0.64, (W - cw - 24) / (n - 1));
      const dir = MK.lang() === 'en' ? 1 : -1;
      cards.forEach((c, i) => {
        const k = i - mid;
        const x = k * gap * e * dir;
        const y = k * k * 8 * e - (Math.abs(k) < 1 ? 12 * e : 0);
        const rot = k * 7 * e * dir;
        const s = 1 - (1 - e) * Math.min(Math.abs(k), 2) * 0.03;
        c.style.transform = `translate3d(${x}px,${y}px,0) rotate(${rot}deg) scale(${s})`;
        c.style.filter = e < .05 && Math.abs(k) >= 1 ? 'brightness(.85)' : '';
      });
      hint.style.opacity = p > .6 ? '0' : '1';
    }
    const dreq = () => { if (!draf) draf = requestAnimationFrame(layout); };
    addEventListener('scroll', dreq, { passive: true });
    addEventListener('resize', dreq);
    renderDeck();

    const stage = $('#fanStage'), panels = $('#fanPanels');
    panels.innerHTML = LEFT.map((c, i) => [c, -(i + 1) * 8, 1 - i * 0.12, i]).concat(RIGHT.map((c, i) => [c, (i + 1) * 8, 1 - i * 0.12, i]))
      .map(([c, a, o, i]) => `<span class="fpan" data-v="${c},${a},${o.toFixed(2)},${(i * 0.07).toFixed(2)}"></span>`).join('');
    panels.querySelectorAll('.fpan').forEach(el => { const [c, a, o, d] = el.dataset.v.split(','); el.style.setProperty('--c', c); el.style.setProperty('--a', a + 'deg'); el.style.setProperty('--o', o); el.style.setProperty('--d', d + 's'); el.removeAttribute('data-v'); });
    if (!io) stage.classList.add('on');
    else {
      const so = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { stage.classList.add('on'); so.disconnect(); } }), { threshold: .3 });
      so.observe(stage);
    }

    const feat = $('#feat'), fg = $('#featGrid');
    const renderFeat = () => {
      const d = MK.data;
      const list = d ? d.products.filter(p => p.in_stock).slice(0, 4) : [];
      feat.hidden = !list.length;
      if (!list.length) return;
      const cur = esc(MK.cur());
      fg.innerHTML = list.map((p, i) => {
        const prices = (p.options.length ? p.options.map(o => o.p != null ? o.p : p.price) : [p.price]).filter(x => x > 0);
        const pr = prices.length ? Math.min(...prices) : 0;
        const name = MK.L(p, 'name');
        return `<a class="fcard rv" href="main.html#p=${encodeURIComponent(p.id)}">
  <div class="fm">${p.image ? `<img src="${esc(p.image)}" alt="${esc(name)}" width="400" height="400" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : '<img class="ph" src="img/logo.webp" alt="" width="120" height="120">'}</div>
  <div class="fi"><h3>${esc(name)}</h3><p class="fp">${pr ? (prices.length > 1 ? esc(t('from')) + ' ' : '') + money(pr) + ' ' + cur : esc(t('ask'))}</p></div>
</a>`;
      }).join('');
      [...fg.children].forEach((el, i) => el.style.setProperty('--dl', (i * .08) + 's'));
      fg.querySelectorAll('img').forEach(im => im.addEventListener('error', () => { im.className = 'ph'; im.src = 'img/logo.webp'; }, { once: true }));
      observe(fg);
    };
    MK.subscribe(renderFeat);
    MK.subscribe(renderMq);
    MK.onLang(() => { renderMq(); renderDeck(); renderFeat(); });
  };
})();
