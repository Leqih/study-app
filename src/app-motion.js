/* ================================================================
   Motion kit and the printed slip, shared by every screen.
   - blurIn: a title comes into focus word by word
   - roll: a number counts to its new value
   - stagger: rows arrive one after another
   - burst: toppings pop out from a point, for the big moments
   - printSlip: a ticket feeds out of a slot, like a receipt printer
   Everything settles instantly under reduced motion.
   ================================================================ */

// wrap each word of an element's text in a span, once, then replay the focus-in
function blurIn(el, delay = 0) {
  if (!el) return;
  if (el.dataset.words !== el.textContent) {
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
          const s = document.createElement('span'); s.className = 'w'; s.textContent = w; frag.appendChild(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
    });
    walk(el);
    el.dataset.words = el.textContent;
  }
  el.querySelectorAll('.w').forEach((w, i) => w.style.setProperty('--i', i));
  el.style.setProperty('--d', delay + 'ms');
  el.classList.remove('focus-in'); void el.offsetWidth; el.classList.add('focus-in');
}

// count from what's showing now to `to`; fmt turns the number into text
const rolling = new WeakMap();
function roll(el, to, fmt = (v) => String(Math.round(v)), ms = 900) {
  if (!el) return;
  const text = fmt(to);
  if (typeof to !== 'number' || Number.isNaN(to)) { setText(el, String(to)); return; }
  const from = rolling.has(el) ? rolling.get(el) : 0;
  rolling.set(el, to);
  if (reduced || from === to) { setText(el, text); return; }
  const t0 = performance.now();
  const step = (now) => {
    if (rolling.get(el) !== to) return; // a newer value took over
    const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
    setText(el, k < 1 ? fmt(from + (to - from) * e) : text);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
// start a number from zero next time it rolls, so arriving on a screen counts up again
const rewind = (...els) => els.forEach((el) => el && rolling.set(el, 0));

// each child arrives 45 ms after the one before
function stagger(el) {
  if (!el) return;
  [...el.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 12)));
  el.classList.remove('stg'); void el.offsetWidth; el.classList.add('stg');
}

// toppings and flecks fly out from (x, y) in app points, fall a little and fade
function burst(x, y, n = 26) {
  if (reduced) return;
  const layer = $('burst');
  const ids = Object.keys(TOPPINGS), cols = ['#C349EE', '#8CA7F4', '#DDEB9E', '#FF9EF2', '#FFE600'];
  for (let i = 0; i < n; i++) {
    const p = document.createElement('span'), a = Math.random() * Math.PI * 2, d = 70 + Math.random() * 120;
    const dx = Math.cos(a) * d, dy = Math.sin(a) * d - 40, rot = Math.random() * 540 - 270;
    p.className = 'bit';
    if (i % 3 === 0) p.innerHTML = tip(ids[i % ids.length]);
    else { p.classList.add('fleck'); p.style.background = cols[i % cols.length]; }
    p.style.left = x + 'px'; p.style.top = y + 'px';
    layer.appendChild(p);
    p.animate([
      { transform: 'translate(-50%, -50%) scale(.3)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx * .8}px), calc(-50% + ${dy * .8}px)) rotate(${rot * .7}deg) scale(1)`, opacity: 1, offset: .55 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 60}px)) rotate(${rot}deg) scale(.8)`, opacity: 0 },
    ], { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => p.remove();
  }
}
// where an element's centre is, in app points
function centreOf(el) {
  const a = $('app').getBoundingClientRect(), r = el.getBoundingClientRect(), k = APP_W / a.width;
  return [(r.left + r.width / 2 - a.left) * k, (r.top + r.height / 2 - a.top) * k];
}

/* ---------- the printed slip ---------- */
// a dark slot with a ticket that feeds out of it; tapping the slot prints it again
function slipHTML(label, body) {
  return `<div class="printout"><button class="slot" type="button" aria-label="Print again"><span>${esc(label)}</span></button><div class="feed"><div class="paper">${body}</div><div class="tear" aria-hidden="true"></div></div></div>`;
}
const barcode = (seed = 7) => `<span class="barcode" aria-hidden="true">${Array.from({ length: 34 }, (_, i) => `<i style="width:${1 + ((i * seed + 3) % 4)}px"></i>`).join('')}</span>`;
function printSlip(root) {
  const feed = root?.querySelector('.feed'); if (!feed) return;
  feed.getAnimations().forEach((a) => a.cancel());
  if (reduced) return;
  buzz([6, 30, 6, 30, 6]);
  feed.animate([
    { transform: 'translateY(-100%) perspective(600px) rotateX(16deg)' },
    { transform: 'translateY(-38%) perspective(600px) rotateX(7deg)', offset: .62 },
    { transform: 'translateY(-6%) perspective(600px) rotateX(2deg)', offset: .86 },
    { transform: 'none' },
  ], { duration: 1700, easing: 'cubic-bezier(.35,.1,.25,1)', fill: 'backwards' });
}
// tapping any slot pulls the ticket back in and prints it again
$('app').addEventListener('click', (e) => {
  const s = e.target.closest('.slot'); if (!s) return;
  const root = s.closest('.printout'), feed = root.querySelector('.feed');
  if (reduced) return;
  feed.animate([{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 380, easing: 'cubic-bezier(.5,0,.75,0)' }).onfinish = () => printSlip(root);
});
