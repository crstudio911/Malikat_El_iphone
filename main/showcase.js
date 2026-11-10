(() => {
  'use strict';
  const MK = window.MK;

  const DECK = [
    { k: 'جراب', n: 'جراب جلد فاخر', img: 'case-leather', q: 'جراب جلد', g: 'linear-gradient(160deg,#9b2c45,#4a0f22)' },
    { k: 'آيفون', n: 'آيفون 16 برو', img: 'phone-blue', q: 'آيفون 16 برو', g: 'linear-gradient(160deg,#3e5d93,#101d3b)' },
    { k: 'جديد', n: 'آيفون 17 برو ماكس', img: 'phone-orange', q: 'آيفون 17', g: 'linear-gradient(160deg,#ff9a4a,#b8430d)' },
    { k: 'آيفون', n: 'آيفون 16 بلس', img: 'phone-front', q: 'آيفون 16 بلس', g: 'linear-gradient(160deg,#a66bff,#4b1d9e)' },
    { k: 'جراب', n: 'جراب شفاف MagSafe', img: 'case-clear', q: 'جراب شفاف', g: 'linear-gradient(160deg,#7fb2e6,#2f4f7d)' },
    { k: 'آيفون', n: 'آيفون 16', img: 'phone-silver', q: 'آيفون 16', g: 'linear-gradient(160deg,#c9ccd3,#6d717c)' }
  ];

  const LEFT = ['#ff2d55', '#ff3b47', '#f8505c', '#f76b78', '#f78c97', '#f9b0b8'];
  const RIGHT = ['#c21e7c', '#a32a9e', '#8c3cc0', '#9b62d0', '#b38ade', '#cdb2ec'];

  MK.showcase = (host, onPick) => {
    const { $, esc } = MK;
    const deck = $('#deck', host), track = $('#deckTrack', host), hint = $('#deckHint', host);
    const stage = $('#fanStage', host), panels = $('#fanPanels', host);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const n = DECK.length, mid = (n - 1) / 2;
    const order = DECK.map((_, i) => i).sort((a, b) => Math.abs(b - mid) - Math.abs(a - mid));
    deck.innerHTML = DECK.map((d, i) => `<button class="dcard" type="button" role="listitem" data-i="${i}" style="--g:${d.g};z-index:${order.indexOf(i) + 1}" aria-label="${esc(d.n)}">
  <span class="dc-num">${String(i + 1).padStart(2, '0')}</span>
  <img src="img/products/${d.img}.webp" alt="" width="497" height="900" decoding="async"${Math.abs(i - mid) < 1 ? '' : ' loading="lazy"'}>
  <span class="dc-txt"><span class="dc-k">${esc(d.k)}</span><span class="dc-n">${esc(d.n)}</span></span>
</button>`).join('');
    const cards = [...deck.children];

    deck.addEventListener('click', e => {
      const c = e.target.closest('.dcard'); if (!c) return;
      onPick(DECK[Number(c.dataset.i)].q);
    });
    host.addEventListener('click', e => {
      const a = e.target.closest('[data-go="shop"]'); if (!a) return;
      e.preventDefault();
      $('.toolbar', host).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    const ease = t => 1 - Math.pow(1 - t, 3);
    let raf = 0;
    function layout() {
      raf = 0;
      let t = 1;
      if (!reduce) {
        const r = track.getBoundingClientRect();
        const span = r.height - innerHeight;
        t = span > 0 ? Math.min(1, Math.max(0, (-r.top) / span * 1.25)) : 1;
      }
      const e = ease(t);
      const W = deck.clientWidth, cw = cards[0].offsetWidth;
      const gap = Math.min(cw * 0.62, (W - cw - 24) / (n - 1));
      cards.forEach((c, i) => {
        const k = i - mid;
        const x = k * gap * e;
        const y = k * k * 7 * e - (Math.abs(k) < 1 ? 10 * e : 0);
        const rot = k * 7 * e;
        const s = 1 - (1 - e) * Math.min(Math.abs(k), 2) * 0.03;
        c.style.transform = `translate3d(${-x}px,${y}px,0) rotate(${-rot}deg) scale(${s})`;
        c.style.filter = e < .05 && Math.abs(k) >= 1 ? 'brightness(.85)' : '';
      });
      hint.style.opacity = t > .6 ? '0' : '1';
    }
    const req = () => { if (!raf) raf = requestAnimationFrame(layout); };
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req);
    layout();

    panels.innerHTML = LEFT.map((c, i) => [c, -(i + 1) * 8, 1 - i * 0.12, i]).concat(RIGHT.map((c, i) => [c, (i + 1) * 8, 1 - i * 0.12, i]))
      .map(([c, a, o, i]) => `<span class="fpan" style="--c:${c};--a:${a}deg;--o:${o.toFixed(2)};--d:${(i * 0.07).toFixed(2)}s"></span>`).join('');

    if (reduce || !('IntersectionObserver' in window)) { stage.classList.add('on'); return; }
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { stage.classList.add('on'); io.disconnect(); } }), { threshold: .3 });
    io.observe(stage);
  };
})();
