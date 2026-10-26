/* ================================================================
   System-level pieces: launch screen, notification banners, the Live Activity
   in the Dynamic Island, swipe-to-go-back, and the detail pages.
   ================================================================ */

/* ---------- launch screen ---------- */
setTimeout(() => { $('splash').classList.add('gone'); if (/[?&](new|intro)\b/.test(location.search)) openIntro(); else playHome(); }, /[?&]debug\b/.test(location.search) ? 50 : 1300);

/* ---------- notification banners ---------- */
let bannerTimer = null;
function setBanner(on) {
  const b = $('banner'), app = $('app');
  b.classList.toggle('on', on); app.classList.toggle('banner-on', on);
  if (on) app.style.setProperty('--banner-push', (b.offsetTop + b.offsetHeight + 8) + 'px');
}
function notify(title, body, ms = 3800) {
  setText($('banner-t'), title); setText($('banner-b'), body);
  setBanner(true); buzz([12, 40, 12]);
  clearTimeout(bannerTimer); bannerTimer = setTimeout(() => setBanner(false), ms);
}
$('banner').addEventListener('click', () => setBanner(false));
setTimeout(() => { if (!stack.length && FRIENDS.length) notify('Jun took a shortcake out of the oven', '75 minutes, golden perfect. Send a cheer?'); }, 6000);

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
  ['Clips', '#C9D5FA', 'M4 5h16v14H4z M10 9l5 3-5 3z', 'video'], ['Games', '#FFF07A', 'M3 9h18v8H3z M7 11v4 M5 13h4 M15 12h1 M18 14h1', 'games'],
  ['Shop', '#BCCBF9', 'M5 8h14l-1 12H6z M9 8V6a3 3 0 0 1 6 0v2', 'shopping'], ['Messages', '#BDF5C8', 'M3 6h18v12H3z M3 6l9 7 9-7', 'messages'],
  ['Dictionary', '#FFE3C8', 'M5 4h12v16H5z M9 8h5 M9 12h5', 'tool'], ['Calculator', '#E6DED6', 'M6 3h12v18H6z M9 7h6 M9 12h1 M14 12h1 M9 16h1 M14 16h1', 'tool'],
];
function drawHomeScreen() {
  const blocked = LOCKS[P.lock].blocks;
  setHTML($('hs-grid'), HOME_APPS.map(([n, c, d, kind]) => {
    const locked = kind && kind !== 'tool' && blocked.includes(kind);
    return `<button class="hs-app ${locked ? 'locked' : ''}" type="button" data-n="${n}" data-locked="${locked}"><span class="ico rounded" style="background:${c}"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#10131A" stroke-width="2">${d.split(' M').map((x, i) => `<path d="${i ? 'M' + x : x}"/>`).join('')}</svg>${locked ? `<span class="lk">${ICON.lock}</span>` : ''}</span><span class="nm">${n}</span></button>`;
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
    <div class="section"><div class="room-head card rounded"><div><p class="live">${r.k} baking now</p><h2>${r.n}</h2><p class="t-subhead muted">${r.s}</p></div><div class="faces">${r.f.map((n) => face(n)).join('')}</div></div></div>
    <div class="section tight"><div class="chips"><span class="chip white rounded">${ICON.lock}Standard lock</span><span class="chip white rounded">${ICON.note}Rainy window</span><span class="chip white rounded">Silent room</span></div></div>
    <div class="section"><div class="section-h"><h2>Ovens in this room</h2></div>
      <div class="ovens">${people.map((p) => { const tot = p.d.rounds * p.d.len, pc = Math.round((1 - p.left / tot) * 100); return `<div class="oven-card card rounded"><div class="oc-top">${face(p.n, 's')}<span class="grow"><b>${p.n}</b><span class="muted">${p.d.name.replace('Strawberry ', '')}</span></span></div><div class="oc-art">${art(p.d.id)}</div><span class="oc-time">${p.left} min left</span><span class="bar"><i style="width:${pc}%"></i></span></div>`; }).join('')}</div>
    </div><div class="spacer"></div>`);
  $('room-join').dataset.who = r.f[0];
  openPage('room');
}

/* ---------- settings page ---------- */
function renderSettings() {
  const sw = (k, label, sub) => `<div class="row"><span class="grow"><span class="t">${label}</span><span class="s">${sub}</span></span><button class="switch rounded" type="button" role="switch" aria-checked="${PREFS[k]}" data-pref="${k}" aria-label="${label}"></button></div>`;
  setHTML($('settings-body'), `
    <div class="section"><div class="section-h"><h2>Default focus lock</h2></div><div class="list rounded">${LOCKS.map((l, i) => `<button class="row" type="button" data-lock="${i}"><span class="grow"><span class="t">${l.name} · ${l.t}°</span><span class="s">${l.d}</span></span><span class="check rounded" aria-checked="${i === P.lock}">${i === P.lock ? ICON.tick : ''}</span></button>`).join('')}</div></div>
    <div class="section"><div class="section-h"><h2>Daily rhythm</h2></div><div class="list rounded">
      <div class="row"><span class="grow"><span class="t">Daily focus goal</span><span class="s">Minutes a day, shown on Home</span></span><div class="stepper"><button type="button" data-goal="-30" aria-label="30 min less">−</button><span>${PREFS.goal}</span><button type="button" data-goal="30" aria-label="30 min more">+</button></div></div>
      ${sw('restDay', 'One rest day a week', 'A day off doesn’t break your streak')}</div></div>
    <div class="section"><div class="section-h"><h2>Notifications</h2></div><div class="list rounded">${sw('notifyJoin', 'A friend joins your oven', 'Shown as a banner while you bake')}${sw('notifyDone', 'Your bake is ready', 'Also in the Dynamic Island')}${sw('remind', 'Daily reminder', 'Weekdays at 7 pm')}</div></div>
    <div class="section"><div class="section-h"><h2>Feel</h2></div><div class="list rounded">${sw('haptics', 'Haptics', 'Taps when flour lands and eggs crack')}</div></div>
    <div class="section"><div class="list rounded"><button class="row" type="button" data-go="intro"><span class="grow"><span class="t">Show the intro again</span><span class="s">Three pages on how baking works</span></span>${ICON.chev}</button><div class="row"><span class="grow"><span class="t">Sweet Study</span><span class="s">Version 1.0 · concept demo</span></span></div></div></div><div class="spacer"></div>`);
}
$('settings-body').addEventListener('click', (e) => {
  const s = e.target.closest('[data-pref]'); if (s) { PREFS[s.dataset.pref] = !PREFS[s.dataset.pref]; buzz(8); renderSettings(); renderTabs(); return; }
  const d = e.target.closest('[data-goal]'); if (d) { PREFS.goal = clamp(PREFS.goal + +d.dataset.goal, 30, 300); buzz(8); renderSettings(); renderTabs(); return; }
  const l = e.target.closest('[data-lock]'); if (l) { P.lock = +l.dataset.lock; buzz(8); renderSettings(); renderMe(); }
});
function renderMe() { setText($('me-lock'), `${LOCKS[P.lock].name} · ${LOCKS[P.lock].t}°`); }

/* ---------- monthly report: the month as a receipt, stamped with a cupcake-liner badge ---------- */
// October before today is fixed demo data; anything baked today is added on top
const MONTH = { bakes: 22, golden: 14, exits: 4, goals: [30, 37], best: 9, mins: 1080, fav: 'cupcake', favN: 9 };
function linerBadge(top, bottom) {
  const pts = [];
  for (let i = 0; i < 44; i++) { const a = Math.PI * i / 22, rr = i % 2 ? 40 : 44; pts.push(`${(46 + rr * Math.cos(a)).toFixed(1)},${(46 + rr * Math.sin(a)).toFixed(1)}`); }
  return `<svg viewBox="0 0 92 92"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E3A6F7"/><stop offset="1" stop-color="#C349EE"/></linearGradient></defs><polygon points="${pts.join(' ')}" fill="url(#lg)"/><circle cx="46" cy="46" r="31" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1.5" stroke-dasharray="3 3"/><text x="46" y="43" text-anchor="middle" font-size="13" font-weight="900" fill="#111113" font-family="-apple-system, sans-serif">${top}</text><text x="46" y="59" text-anchor="middle" font-size="13" font-weight="900" fill="#111113" font-family="-apple-system, sans-serif">${bottom}</text></svg>`;
}
function openReport() {
  const today = CASE.filter((c) => c.when === 'Just now');
  const m = { ...MONTH, bakes: MONTH.bakes + today.length, golden: MONTH.golden + today.filter((c) => c.grade === 'Golden perfect').length, mins: MONTH.mins + today.reduce((a, c) => a + c.min, 0) };
  const pct = Math.round(m.favN / m.bakes * 100), bars = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1];
  setHTML($('receipt'), slipHTML('Sweet Study · October', `<div class="rc"><div class="head"><div><h2>Sweet tooth*</h2><p class="who">@Leqi · October 2025</p></div><span class="xmark" aria-hidden="true"><span>×</span><span>×</span><span>×</span><span>×</span><span>×</span></span></div>
    <div class="fav">${art(m.fav)}<div><b>Favourite</b><p class="t-footnote muted">${recipeById(m.fav).name}</p></div><div style="margin-left:auto;text-align:right"><p class="pct">${pct}%</p><p class="t-caption muted">of your bakes</p></div></div>
    <div class="dash"></div>
    <div class="rline"><span>Bakes</span><b>${m.bakes}</b></div>
    <div class="rline"><span>Golden perfect</span><b>${m.golden}</b></div>
    <div class="rline"><span>Left the kitchen</span><b>${m.exits}×</b></div>
    <div class="rline"><span>Goals done</span><b>${m.goals[0]} / ${m.goals[1]}</b></div>
    <div class="rline"><span>Longest streak</span><b>${m.best} days</b></div>
    <div class="dash"></div>
    <div class="rtotal"><span>Total focus</span><b>${(m.mins / 60).toFixed(1)} h</b></div>
    <div class="foot"><div class="barcode" aria-hidden="true">${bars.map((w) => `<i style="width:${w}px"></i>`).join('')}</div><span class="tiny">thanks for baking</span></div></div>`));
  setHTML($('rc-cap'), linerBadge('FOCUS', 'STAR'));
  openPage('report');
  setTimeout(() => { printSlip($('receipt')); blurIn(document.querySelector('.rc-title h1')); }, 320);
}
$('rc-save').addEventListener('click', () => toast('<span>Saved to Photos</span>'));
$('rc-share').addEventListener('click', () => toast('<span>On iPhone this opens the share sheet</span>'));

/* ---------- dessert case detail ---------- */
function openCase(i) {
  const c = CASE[i], r = recipeById(c.r);
  setHTML($('shop-body'), `<div class="stack">
    <div class="plate compact">${art(c.r)}</div>
    <div class="verdict"><span><span class="tag hi rounded">${c.grade}</span></span><h3>${r.name}</h3><p class="t-subhead muted">${c.when} · ${r.type}</p></div>
    <div class="stats"><div class="stat rounded"><b>${c.min}</b><span>minutes</span></div><div class="stat rounded"><b>${c.tops}</b><span>toppings</span></div><div class="stat rounded"><b>${c.grade === 'Golden perfect' ? 0 : 1}</b><span>exits</span></div></div>
    <div class="acts"><button class="btn soft rounded" type="button" id="case-close">Close</button><button class="btn rounded" type="button" id="case-again">Bake this again</button></div></div>`);
  $('case-close').onclick = () => closeSheet('sheet-shop');
  $('case-again').onclick = () => { closeSheet('sheet-shop'); pickRecipe(c.r); present('recipe'); };
  openSheet('sheet-shop');
}

$('app').addEventListener('click', (e) => {
  const g = e.target.closest('[data-go]'); if (!g) return;
  const go = g.dataset.go;
  if (go === 'room') openRoom(+g.dataset.i);
  else if (go === 'settings') { renderSettings(); openPage('settings'); }
  else if (go === 'friends') { renderFriendsPage(); openPage('friends'); }
  else if (go === 'report') openReport();
  else if (go === 'case') openCase(+g.dataset.i);
  else if (go === 'me') setTab('me');
  else if (go === 'intro') openIntro();
  else if (go === 'my-shape') openShapes();
});
const drawMe = () => document.querySelectorAll('[data-me]').forEach((el) => { el.innerHTML = avatarSvg('Leqi'); });
drawMe();

/* ---------- friends: both people have to agree. Ways in: an invite link, a username, or a table you shared ---------- */
const REQS = NEW ? [] : [{ n: 'Noa', via: 'Quiet library · today' }, { n: 'Kai', via: 'By your username' }];
const MET = NEW ? [] : [{ n: 'Lin', where: 'Quiet library · today' }, { n: 'Ivy', where: 'Thesis corner · Thursday' }];
const SENT = new Set();
const USERNAMES = { Noa: 'noa.k', Kai: 'kai.builds', Lin: 'lin.piano', Ivy: 'ivy_writes', Ben: 'ben.sql', Ash: 'ash.reads' };
const PROFILE = { Noa: ['#C9D5FA', 'Organic chemistry'], Kai: ['#FFF07A', 'Portfolio review'], Lin: ['#FFC4F8', 'Piano theory'], Ivy: ['#BCCBF9', 'Essay outline'], Ben: ['#FFF07A', 'SQL practice'], Ash: ['#FFC4F8', 'Reading list'] };
let metNow = null; // the strangers you just shared a table with, offered on the result screen
const isFriend = (n) => FRIENDS.some((f) => f.n === n);
function addFriend(n) { if (isFriend(n)) return; const [c, subj] = PROFILE[n] || ['#F2F2F4', 'Studying']; FRIENDS.push({ n, c, d: 'Strawberry macaron', left: 25, subj }); }
function friendsChanged() {
  setText($('me-friends'), `${FRIENDS.length} ${FRIENDS.length === 1 ? 'friend' : 'friends'}`);
  $('me-req').hidden = !REQS.length; setText($('me-req'), String(REQS.length));
  renderTabs(); if (!$('s-friends').hidden) renderFriendsPage();
  if ($('r-met').innerHTML) renderMet();
  if (sheetRedraw && $('sheet-shop').classList.contains('on')) sheetRedraw();
}
const addBtn = (n) => isFriend(n) ? '<span class="tag brand">Friend</span>' : SENT.has(n) ? '<span class="sent">Requested</span>' : `<button class="btn small rounded" type="button" data-fr="add" data-n="${n}">Add</button>`;
function renderFriendsPage() {
  const q = ($('fr-search')?.value || '').trim().toLowerCase().replace(/^@/, '');
  const hits = q ? Object.entries(USERNAMES).filter(([n, u]) => u.includes(q) || n.toLowerCase().startsWith(q)) : [];
  const section = (title, body, aside = '') => `<div class="section"><div class="section-h"><h2>${title}</h2>${aside}</div>${body}</div>`;
  setHTML($('friends-body'), `
    <div class="section"><div class="invite rounded">
      <p class="t">Invite a classmate</p>
      <p class="s">Friends see each other’s plans, names and what you’re working on. It only works once you both say yes.</p>
      <div class="link-row"><span class="url" id="invite-url">sweetstudy.app/i/leqi</span><button class="btn soft small rounded" type="button" data-fr="copy">Copy</button></div>
      <button class="btn rounded" type="button" data-fr="share">Share invite</button>
    </div></div>
    ${section('Find by username', `<label class="field rounded"><input id="fr-search" autocomplete="off" placeholder="@username" value="${esc(q)}"></label>
      ${hits.length ? `<div class="list rounded fr-list">${hits.map(([n, u]) => `<div class="row">${face(n)}<span class="grow"><span class="t">${n}</span><span class="s">@${u}</span></span>${addBtn(n)}</div>`).join('')}</div>` : q ? '<p class="fr-none">No one with that username yet.</p>' : ''}`)}
    ${REQS.length ? section('Requests', `<div class="list rounded fr-list">${REQS.map((r) => `<div class="row">${face(r.n)}<span class="grow"><span class="t">${r.n}</span><span class="s">${r.via}</span></span><button class="fr-x" type="button" data-fr="decline" data-n="${r.n}" aria-label="Decline ${r.n}"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><button class="btn small rounded" type="button" data-fr="accept" data-n="${r.n}">Accept</button></div>`).join('')}</div>`, `<span class="aside">${REQS.length} waiting</span>`) : ''}
    ${MET.length ? section('People you studied with', `<div class="list rounded fr-list">${MET.map((m) => `<div class="row">${face(m.n)}<span class="grow"><span class="t">${isFriend(m.n) ? m.n : `${m.n[0]}.`}</span><span class="s">${m.where}</span></span>${addBtn(m.n)}</div>`).join('')}</div>`) : ''}
    ${section('Your friends', FRIENDS.length ? `<div class="list rounded fr-list">${FRIENDS.map((f) => `<div class="row">${face(f.n)}<span class="grow"><span class="t">${f.n}</span><span class="s">${esc(f.subj || f.d)}</span></span><button class="fr-remove" type="button" data-fr="remove" data-n="${f.n}">Remove</button></div>`).join('')}</div>` : '<p class="fr-none">No friends yet. Send your invite to a classmate.</p>', `<span class="aside">${FRIENDS.length}</span>`)}
    <div class="spacer"></div>`);
  const s = $('fr-search'); if (q && s) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); }
}
$('friends-body').addEventListener('input', (e) => { if (e.target.id === 'fr-search') renderFriendsPage(); });
// after a bake at an open table: the people you sat with, by initial, each with Add
function renderMet() {
  setHTML($('r-met'), metNow && metNow.people.length ? `<div class="met rounded"><p class="k">You studied with</p><p class="s">${metNow.room} · ask to be friends to see their names and plans next time</p>
    <div class="fr-list">${metNow.people.map((n) => `<div class="row">${face(n)}<span class="grow"><span class="t">${isFriend(n) ? n : `${n[0]}.`}</span><span class="s">${PROFILE[n] ? 'Same table, same round' : ''}</span></span>${addBtn(n)}</div>`).join('')}</div></div>` : '');
}
$('app').addEventListener('click', (e) => {
  const b = e.target.closest('[data-fr]'); if (!b) return;
  const act = b.dataset.fr, n = b.dataset.n;
  if (act === 'copy') {
    const url = 'https://' + $('invite-url').textContent;
    const done = () => toast('<b>Link copied</b><span>Whoever opens it can send you a request</span>');
    try { navigator.clipboard.writeText(url).then(done, () => toast('<span>Couldn’t copy. Press and hold the link to copy it.</span>')); } catch (_) { toast('<span>Couldn’t copy. Press and hold the link to copy it.</span>'); }
  } else if (act === 'share') toast('<b>Share invite</b><span>On iPhone this opens the share sheet</span>');
  else if (act === 'add') { SENT.add(n); buzz(8); toast(`<b>Request sent</b><span>You’ll be friends once ${isFriend(n) ? n : 'they'} accept</span>`); friendsChanged(); }
  else if (act === 'accept') { REQS.splice(REQS.findIndex((r) => r.n === n), 1); addFriend(n); buzz([8, 20, 8]); toast(`<b>You and ${n} are friends</b><span>You’ll see each other’s plans now</span>`); friendsChanged(); }
  else if (act === 'decline') { REQS.splice(REQS.findIndex((r) => r.n === n), 1); toast('<span>Request declined. They won’t be told.</span>'); friendsChanged(); }
  else if (act === 'remove') ask({ title: `Remove ${n}?`, text: 'You’ll stop seeing each other’s plans and names. You can add each other again later.', no: 'Cancel', yes: 'Remove' }).then((y) => { if (!y) return; FRIENDS.splice(FRIENDS.findIndex((f) => f.n === n), 1); friendsChanged(); });
});
friendsChanged();
/* ---------- your shape: the whole library in a grid, and the colours ---------- */
function openShapes() {
  const draw = () => setHTML($('shop-body'), `<div class="stack shapes-sheet"><div class="sh-head"><span class="sh-prev">${shapeSvg(MY_SHAPE.k, MY_SHAPE.c)}</span><div><h3>Your shape</h3><p class="t-subhead muted">Friends see it at the table, on the board and in rooms.</p></div></div>
    <div class="sh-colors">${AV_COLORS.map((c) => `<button type="button" class="sw" data-c="${c}" style="--sw:${c}" aria-pressed="${c === MY_SHAPE.c}" aria-label="Colour ${c}"></button>`).join('')}</div>
    <div class="sh-grid">${Object.keys(AV_SHAPES).map((k) => `<button type="button" data-k="${k}" aria-pressed="${k === MY_SHAPE.k}" aria-label="${k}">${shapeSvg(k, MY_SHAPE.c)}</button>`).join('')}</div>
    <button class="btn rounded" type="button" id="shape-done">Done</button></div>`);
  draw(); openSheet('sheet-shop');
  $('shop-body').onclick = (e) => {
    const k = e.target.closest('[data-k]'), c = e.target.closest('[data-c]');
    if (k) MY_SHAPE.k = k.dataset.k; else if (c) MY_SHAPE.c = c.dataset.c; else if (e.target.closest('#shape-done')) { $('shop-body').onclick = null; closeSheet('sheet-shop'); return; } else return;
    buzz(8); draw(); drawMe(); renderTabs();
  };
}
renderMe();

/* ---------- dessert case as a display board: stamps you arrange, like a collage ---------- */
let caseMode = 'grid', boardSel = -1;
const TILTS = [-7, 5, -3, 6, -5, 4, -6, 3, -4, 7];
const CARD_W = 112, CARD_H = 137;
const boardW = () => $('board').clientWidth || APP_W - 40;
function boardPos(c, i) {
  // three loose columns that overlap a little, the middle one dropped, like cards dealt onto a table
  if (!c.pos) { const col = i % 3, row = Math.floor(i / 3), step = (boardW() - CARD_W - 16) / 2; c.pos = { x: 8 + col * step + ((i * 7) % 9) - 4, y: 20 + row * 128 + (col === 1 ? 30 : 0), r: TILTS[i % TILTS.length], z: i + 1 }; }
  return c.pos;
}
function renderBoard() {
  const rows = Math.ceil(CASE.length / 3), h = Math.max(340, rows * 128 + 90);
  $('board').style.height = h + 'px';
  setHTML($('board'), CASE.map((c, i) => stampHTML(c.r, `data-b="${i}" role="button" tabindex="0" aria-label="${recipeById(c.r).name}, ${c.when}"`)).join('') || `<p class="board-cap" style="padding-top:150px"><span>Your desserts land here once you bake.</span></p>`);
  layoutBoard(); boardTools();
}
function layoutBoard() {
  const h = parseFloat($('board').style.height);
  $('board').querySelectorAll('[data-b]').forEach((el) => {
    const i = +el.dataset.b, q = boardPos(CASE[i], i), sel = i === boardSel;
    el.style.zIndex = sel ? 99 : q.z;
    el.style.transform = sel ? `translate(${boardW() / 2 - CARD_W / 2}px, ${h / 2 - CARD_H / 2}px) scale(1.55)` : `translate(${q.x}px, ${q.y}px) rotate(${q.r}deg)`;
    el.classList.toggle('sel', sel); el.classList.toggle('dim', boardSel >= 0 && !sel);
  });
  // the caption under the board names what's picked
  const c = CASE[boardSel];
  $('board-wrap').querySelector('.board-cap b').textContent = c ? recipeById(c.r).name : 'Leqi’s case';
  setText($('board-sub'), c ? `${c.when} · ${c.min} min · ${c.grade}` : `${CASE.length} desserts · tap one to move it`);
}
function boardTools() {
  setHTML($('board-tools'), boardSel >= 0
    ? `<button type="button" data-bt="back">Back</button><button type="button" data-bt="front">Front</button><button type="button" data-bt="tilt">Tilt</button><button class="primary" type="button" data-bt="open">Open</button>`
    : `<button type="button" data-bt="shuffle">Shuffle</button><button class="primary" type="button" data-bt="share">Share board</button>`);
}
function setCaseMode(m) {
  caseMode = m; boardSel = -1;
  $('case-mode').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
  $('grid-wrap').hidden = m !== 'grid'; $('board-wrap').hidden = m !== 'board';
  if (m === 'board') renderBoard(); else stagger($('case-grid'));
}
$('case-mode').addEventListener('click', (e) => { const b = e.target.closest('[data-mode]'); if (b && b.dataset.mode !== caseMode) { buzz(8); setCaseMode(b.dataset.mode); } });
$('board').addEventListener('click', (e) => {
  const c = e.target.closest('[data-b]');
  boardSel = c && +c.dataset.b !== boardSel ? +c.dataset.b : -1;
  buzz(boardSel >= 0 ? 10 : 6); layoutBoard(); boardTools();
});
$('board-tools').addEventListener('click', (e) => {
  const b = e.target.closest('[data-bt]'); if (!b) return; const act = b.dataset.bt, c = CASE[boardSel];
  const zs = CASE.map((x, i) => boardPos(x, i).z);
  if (act === 'front') c.pos.z = Math.max(...zs) + 1;
  else if (act === 'back') c.pos.z = Math.min(...zs) - 1;
  else if (act === 'tilt') c.pos.r = c.pos.r > 0 ? -(3 + Math.round(Math.random() * 5)) : 3 + Math.round(Math.random() * 5);
  else if (act === 'open') { openCase(boardSel); return; }
  else if (act === 'shuffle') CASE.forEach((x) => { x.pos.r = TILTS[Math.floor(Math.random() * TILTS.length)]; x.pos.z = Math.floor(Math.random() * 20); });
  else if (act === 'share') { toast('<b>Board saved</b><span>On iPhone this opens the share sheet</span>'); return; }
  buzz(8); layoutBoard();
});

/* ---------- first-run intro: three pages with a little route for progress ---------- */
let obPage = 0;
const OB = [
  { k: 'Study like you bake', h: 'One focus session is one bake.', p: 'Pick a dessert. Its recipe sets how long you study, and the oven keeps distracting apps shut.',
    vis: () => `<div class="ob-fan">${['latte', 'macaron', 'cupcake'].map((id) => stampHTML(id)).join('')}</div>` },
  { k: 'Bake together', h: 'Bake next to your friends.', p: 'See who has something in the oven right now, and join for exactly the time they have left.',
    vis: () => `<div class="ob-board"><div class="hd"><b>Baking now</b><span class="live">3 in Quiet library</span></div><div class="list" id="ob-rows">${[['Mia', 'Strawberry macaron', 18], ['Jun', 'Strawberry shortcake', 42], ['Ava', 'Strawberry cupcake', 31]].map(([n, d, m]) => `<div class="row">${face(n)}<span class="grow"><span class="t">${n}</span><span class="s">${d}</span></span><span><b data-to="${m}">0</b><small>min left</small></span></div>`).join('')}</div></div>` },
  { k: 'The real thing', h: 'Then go get the real one.', p: 'A golden bake unlocks 10% off the same dessert at shops nearby.',
    vis: () => `<div class="ob-prize"><span class="rays" aria-hidden="true"></span>${art('cupcake')}<span class="off">${linerBadge('10%', 'OFF')}</span></div>` },
];
const OB_PTS = [[15, 26], [75, 18], [135, 26]];
function drawIntro(dir = 1) {
  const pg = OB[obPage], last = obPage === OB.length - 1;
  setHTML($('intro'), `<button class="skip" type="button" data-ob="skip">Skip</button>
    <div class="ob-stage"><div class="ob-vis in" style="--from:${dir * 40}px">${pg.vis()}</div></div>
    <div class="ob-text"><p class="kick">${pg.k}</p><h1 id="ob-h">${pg.h}</h1><p>${pg.p}</p></div>
    ${last ? `<div class="ob-end"><button class="btn rounded" type="button" data-ob="start">Start my first bake</button><button class="link" type="button" data-ob="skip">Look around first</button></div>`
      : `<div class="ob-nav"><button class="rb light" type="button" data-ob="prev" aria-label="Back" ${obPage ? '' : 'disabled'}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button>
        <svg class="path" viewBox="0 0 150 40" aria-label="Page ${obPage + 1} of ${OB.length}"><path class="trail" d="M15 26 C45 26 45 18 75 18 S105 26 135 26"/><path class="done" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - obPage / 2}" d="M15 26 C45 26 45 18 75 18 S105 26 135 26"/>${OB_PTS.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === obPage ? 9 : 5}" fill="${i <= obPage ? '#C349EE' : '#D9D9DF'}" ${i === obPage ? 'stroke="#fff" stroke-width="3"' : ''}/>`).join('')}</svg>
        <button class="rb" type="button" data-ob="next" aria-label="Next"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div>`}`);
  const root = $('intro'); root.classList.remove('ob-in'); void root.offsetWidth; root.classList.add('ob-in');
  blurIn($('ob-h'), 120);
  if (obPage === 1) { stagger($('ob-rows')); $('ob-rows').querySelectorAll('[data-to]').forEach((b) => roll(b, +b.dataset.to, undefined, 1200)); }
  if (obPage === 2) setTimeout(() => { const v = $('intro').querySelector('.ob-prize > svg'); if (v) { const [x, y] = centreOf(v); burst(x, y, 30); buzz([20, 40, 20]); } }, 420);
}
function openIntro() { obPage = 0; $('intro').classList.remove('gone'); drawIntro(); }
function closeIntro() { $('intro').classList.add('gone'); playHome(); }
$('intro').addEventListener('click', (e) => {
  const b = e.target.closest('[data-ob]'); if (!b) return; const a = b.dataset.ob;
  if (a === 'next') { obPage++; buzz(8); drawIntro(1); }
  else if (a === 'prev') { obPage--; buzz(8); drawIntro(-1); }
  else if (a === 'skip') closeIntro();
  else if (a === 'start') { $('intro').classList.add('gone'); if (stack.length) dismiss(); present('recipe'); }
});
