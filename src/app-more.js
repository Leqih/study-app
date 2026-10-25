/* ================================================================
   System-level pieces: launch screen, notification banners, the Live Activity
   in the Dynamic Island, swipe-to-go-back, and the detail pages.
   ================================================================ */

/* ---------- launch screen ---------- */
setTimeout(() => $('splash').classList.add('gone'), /[?&]debug\b/.test(location.search) ? 50 : 1300);

/* ---------- notification banners ---------- */
let bannerTimer = null;
function notify(title, body, ms = 3800) {
  setText($('banner-t'), title); setText($('banner-b'), body);
  $('banner').classList.add('on'); buzz([12, 40, 12]);
  clearTimeout(bannerTimer); bannerTimer = setTimeout(() => $('banner').classList.remove('on'), ms);
}
$('banner').addEventListener('click', () => $('banner').classList.remove('on'));
setTimeout(() => { if (!stack.length) notify('Jun took a shortcake out of the oven', '75 minutes, golden perfect. Send a cheer?'); }, 6000);

/* ---------- Live Activity: the bake keeps showing in the Dynamic Island while you're away ---------- */
function liveActivity(mode) {
  const la = $('live-act');
  la.className = 'live-act ' + (mode || '');
  if (!mode) return;
  $('la-art').innerHTML = ART[recipe.id] || ART.cupcake;
}
function tickLive() {
  if (!$('live-act').classList.contains('compact') && !$('live-act').classList.contains('expanded')) return;
  setText($('la-time'), mmss(B.left)); setText($('la-time2'), mmss(B.left));
  const p = B.total ? 1 - B.left / B.total : 0; $('la-bar').style.width = (p * 100).toFixed(1) + '%';
}
setInterval(tickLive, 250);

/* ---------- leaving the app: the phone's home screen, with the locked apps greyed out ---------- */
const HOME_APPS = [
  ['Photos', '#FFC4F8', 'M4 6h16v12H4z M8 14l3-3 3 3 2-2 4 4'], ['Social', '#FF9EF2', 'M4 5h16v11H9l-5 4z', 'social'],
  ['Clips', '#A6E6FF', 'M4 5h16v14H4z M10 9l5 3-5 3z', 'video'], ['Games', '#FFF07A', 'M3 9h18v8H3z M7 11v4 M5 13h4 M15 12h1 M18 14h1', 'games'],
  ['Shop', '#9FF0E4', 'M5 8h14l-1 12H6z M9 8V6a3 3 0 0 1 6 0v2', 'shopping'], ['Messages', '#BDF5C8', 'M3 6h18v12H3z M3 6l9 7 9-7', 'messages'],
  ['Dictionary', '#FFE3C8', 'M5 4h12v16H5z M9 8h5 M9 12h5', 'tool'], ['Calculator', '#E6DED6', 'M6 3h12v18H6z M9 7h6 M9 12h1 M14 12h1 M9 16h1 M14 16h1', 'tool'],
];
function drawHomeScreen() {
  const blocked = LOCKS[P.lock].blocks;
  setHTML($('hs-grid'), HOME_APPS.map(([n, c, d, kind]) => {
    const locked = kind && kind !== 'tool' && blocked.includes(kind);
    return `<button class="hs-app ${locked ? 'locked' : ''}" type="button" data-n="${n}" data-locked="${locked}"><span class="ico cut" style="background:${c}"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#10131A" stroke-width="2">${d.split(' M').map((x, i) => `<path d="${i ? 'M' + x : x}"/>`).join('')}</svg>${locked ? `<span class="lk">${ICON.lock}</span>` : ''}</span><span class="nm">${n}</span></button>`;
  }).join(''));
}
$('hs-grid').addEventListener('click', (e) => {
  const b = e.target.closest('.hs-app'); if (!b) return;
  if (b.dataset.locked === 'true') { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); buzz([30, 30, 30]); notify('Locked while you bake', `${b.dataset.n} opens again when your ${recipe.name.toLowerCase()} is done.`, 2600); }
  else notify(`${b.dataset.n} is allowed`, 'Tools you allowed don’t count as leaving.', 2400);
});
$('live-act').addEventListener('click', () => { if ($('away').classList.contains('on')) $('away-back').click(); });

/* ---------- swipe from the left edge to go back ---------- */
let swipe = null;
$('app').addEventListener('pointerdown', (e) => {
  const top = stack[stack.length - 1]; if (!top || ['bake', 'result', 'decorate'].includes(top)) return;
  const r = $('app').getBoundingClientRect(), k = APP_W / r.width, x = (e.clientX - r.left) * k;
  if (x > 22 || $('scrim').classList.contains('on')) return;
  e.stopPropagation(); e.preventDefault();
  swipe = { id: e.pointerId, x0: e.clientX, k, el: scr(top) }; capture($('app'), e); swipe.el.style.transition = 'none';
}, true);
$('app').addEventListener('pointermove', (e) => {
  if (!swipe || e.pointerId !== swipe.id) return;
  const dx = Math.max(0, (e.clientX - swipe.x0) * swipe.k); swipe.dx = dx; swipe.el.style.transform = `translateX(${dx}px)`;
}, true);
const endSwipe = (e) => {
  if (!swipe || e.pointerId !== swipe.id) return;
  const { el, dx = 0 } = swipe; swipe = null; el.style.transition = ''; el.style.transform = '';
  if (dx > 110) $('app').querySelector(`#s-${stack[stack.length - 1]} .nav [data-go]`)?.click(); // same as tapping back (or close, which asks first)
};
$('app').addEventListener('pointerup', endSwipe, true); $('app').addEventListener('pointercancel', endSwipe, true);

/* ---------- study room page ---------- */
const EXTRA = ['Noa', 'Kai', 'Lin', 'Ivy', 'Ben'];
function openRoom(i) {
  const r = ROOMS[i];
  setText($('room-title'), r.n);
  const people = [...r.f, ...EXTRA].slice(0, 6).map((n, k) => { const d = RECIPES[(k + i) % 4]; return { n, d, left: Math.min([18, 42, 31, 6, 23, 12][k], d.rounds * d.len - 3) }; });
  setHTML($('room-body'), `
    <div class="section"><div class="room-head card cut"><div><p class="live">${r.k} baking now</p><h2>${r.n}</h2><p class="t-subhead muted">${r.s}</p></div><div class="faces">${r.f.map((n) => face(n)).join('')}</div></div></div>
    <div class="section tight"><div class="chips"><span class="chip white cut">${ICON.lock}Standard lock</span><span class="chip white cut">${ICON.note}Rainy window</span><span class="chip white cut">Silent room</span></div></div>
    <div class="section"><div class="section-h"><h2>Ovens in this room</h2></div>
      <div class="ovens">${people.map((p) => { const tot = p.d.rounds * p.d.len, pc = Math.round((1 - p.left / tot) * 100); return `<div class="oven-card card cut"><div class="oc-top">${face(p.n, 's')}<span class="grow"><b>${p.n}</b><span class="muted">${p.d.name.replace('Strawberry ', '')}</span></span></div><div class="oc-art">${art(p.d.id)}</div><span class="oc-time">${p.left} min left</span><span class="bar"><i style="width:${pc}%"></i></span></div>`; }).join('')}</div>
    </div><div class="spacer"></div>`);
  $('room-join').dataset.who = r.f[0];
  openPage('room');
}

/* ---------- settings page ---------- */
const PREFS = { notifyJoin: true, notifyDone: true, remind: false, haptics: true };
function renderSettings() {
  const sw = (k, label, sub) => `<div class="row"><span class="grow"><span class="t">${label}</span><span class="s">${sub}</span></span><button class="switch cut" type="button" role="switch" aria-checked="${PREFS[k]}" data-pref="${k}" aria-label="${label}"></button></div>`;
  setHTML($('settings-body'), `
    <div class="section"><div class="section-h"><h2>Default focus lock</h2></div><div class="list cut">${LOCKS.map((l, i) => `<button class="row" type="button" data-lock="${i}"><span class="grow"><span class="t">${l.name} · ${l.t}°</span><span class="s">${l.d}</span></span><span class="check cut" aria-checked="${i === P.lock}">${i === P.lock ? ICON.tick : ''}</span></button>`).join('')}</div></div>
    <div class="section"><div class="section-h"><h2>Notifications</h2></div><div class="list cut">${sw('notifyJoin', 'A friend joins your oven', 'Shown as a banner while you bake')}${sw('notifyDone', 'Your bake is ready', 'Also in the Dynamic Island')}${sw('remind', 'Daily reminder', 'Weekdays at 7 pm')}</div></div>
    <div class="section"><div class="section-h"><h2>Feel</h2></div><div class="list cut">${sw('haptics', 'Haptics', 'Taps when flour lands and eggs crack')}</div></div>
    <div class="section"><div class="list cut"><div class="row"><span class="grow"><span class="t">Sweet Study</span><span class="s">Version 1.0 · concept demo</span></span></div></div></div><div class="spacer"></div>`);
}
$('settings-body').addEventListener('click', (e) => {
  const s = e.target.closest('[data-pref]'); if (s) { PREFS[s.dataset.pref] = !PREFS[s.dataset.pref]; buzz(8); renderSettings(); return; }
  const l = e.target.closest('[data-lock]'); if (l) { P.lock = +l.dataset.lock; buzz(8); renderSettings(); renderMe(); }
});
function renderMe() { setText($('me-lock'), `${LOCKS[P.lock].name} · ${LOCKS[P.lock].t}°`); }

/* ---------- dessert case detail ---------- */
function openCase(i) {
  const c = CASE[i], r = recipeById(c.r);
  setHTML($('shop-body'), `<div class="stack">
    <div class="plate compact">${art(c.r)}</div>
    <div class="verdict"><span><span class="tag hi cut">${c.grade}</span></span><h3>${r.name}</h3><p class="t-subhead muted">${c.when} · ${r.type}</p></div>
    <div class="stats"><div class="stat cut"><b>${c.min}</b><span>minutes</span></div><div class="stat cut"><b>${c.tops}</b><span>toppings</span></div><div class="stat cut"><b>${c.grade === 'Golden perfect' ? 0 : 1}</b><span>exits</span></div></div>
    <div class="acts"><button class="btn soft cut" type="button" id="case-close">Close</button><button class="btn cut" type="button" id="case-again">Bake this again</button></div></div>`);
  $('case-close').onclick = () => closeSheet('sheet-shop');
  $('case-again').onclick = () => { closeSheet('sheet-shop'); pickRecipe(c.r); present('recipe'); };
  openSheet('sheet-shop');
}

$('app').addEventListener('click', (e) => {
  const g = e.target.closest('[data-go]'); if (!g) return;
  const go = g.dataset.go;
  if (go === 'room') openRoom(+g.dataset.i);
  else if (go === 'settings') { renderSettings(); openPage('settings'); }
  else if (go === 'case') openCase(+g.dataset.i);
  else if (go === 'me') setTab('me');
});
document.querySelectorAll('[data-me]').forEach((el) => { el.innerHTML = avatarSvg('Leqi'); });
renderMe();
