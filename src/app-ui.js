/* ================================================================
   App layer: data, navigation, and every screen around the prep kitchen.
   ================================================================ */
const RECIPES = [
  { id: 'latte', name: 'Latte', tool: 'Coffee machine', type: 'Quick tasks', rounds: 1, len: 15, grams: 150 },
  { id: 'macaron', name: 'Strawberry macaron', tool: 'Oven', type: 'Classic Pomodoro', rounds: 1, len: 25, grams: 250 },
  { id: 'cupcake', name: 'Strawberry cupcake', tool: 'Oven', type: 'Deep work', rounds: 2, len: 25, grams: 500, order: true },
  { id: 'shortcake', name: 'Strawberry shortcake', tool: 'Oven + fridge', type: 'Long sprint', rounds: 3, len: 25, grams: 750 },
];
const FRIENDS = [
  { n: 'Mia', c: '#FFC4F8', d: 'Strawberry macaron', left: 18 },
  { n: 'Jun', c: '#A6E6FF', d: 'Strawberry shortcake', left: 42 },
  { n: 'Ava', c: '#9FF0E4', d: 'Strawberry cupcake', left: 31 },
  { n: 'Sam', c: '#FFF07A', d: 'Latte', left: 6 },
];
const ROOMS = [
  { n: 'Quiet library', s: 'No chat · cameras off', k: 12, f: ['Mia', 'Jun', 'Ava'] },
  { n: 'Exam sprint', s: '50-minute rounds', k: 34, f: ['Sam', 'Ava'] },
  { n: 'Night owls', s: 'Open until 2 am', k: 8, f: ['Jun'] },
];
const SHOPS = [
  { n: 'Corner Patisserie', d: '350 m', walk: '4 min walk', off: '10% off', c: '#FFC4F8', x: 28, y: 36, menu: [['cupcake', 'Strawberry cupcake', 4.8], ['macaron', 'Strawberry macaron', 2.6], ['shortcake', 'Shortcake slice', 5.9]] },
  { n: 'Bloom Café', d: '600 m', walk: '8 min walk', off: '10% off', c: '#A6E6FF', x: 72, y: 26, menu: [['latte', 'Latte', 4.2], ['macaron', 'Macaron', 2.4]] },
  { n: 'Sugar & Co', d: '1.1 km', walk: '14 min walk', off: 'Free topping', c: '#FFF07A', x: 64, y: 78, menu: [['cupcake', 'Cupcake', 4.5], ['shortcake', 'Shortcake slice', 6.2]] },
];
const LOCKS = [
  { t: 160, name: 'Light', d: 'Video & games', note: 'Locks short video and games. Leaving for more than 30 s starts to burn the bake.', blocks: ['video', 'games'] },
  { t: 180, name: 'Standard', d: '4 app types', note: 'Locks social, short video, games and shopping. Leaving for more than 10 s starts to burn the bake.', blocks: ['social', 'video', 'games', 'shopping'] },
  { t: 220, name: 'Strict', d: 'All but tools', note: 'Only the tools you allow stay open. Any exit burns the bake.', blocks: ['social', 'video', 'games', 'shopping', 'messages'] },
];
const APPS = [
  { id: 'social', n: 'Social', s: 'Instagram, WeChat Moments, X', c: '#FFC4F8', g: 'S' },
  { id: 'video', n: 'Short video', s: 'TikTok, Reels, Bilibili', c: '#A6E6FF', g: '▶' },
  { id: 'games', n: 'Games', s: 'Everything in the Games category', c: '#FFF07A', g: 'G' },
  { id: 'shopping', n: 'Shopping', s: 'Taobao, Amazon', c: '#9FF0E4', g: '$' },
  { id: 'messages', n: 'Messages', s: 'Calls from favourites still ring', c: '#E6DED6', g: '✉' },
];
const ALLOWED = ['Dictionary', 'Calculator', 'Music', 'Notes', 'Camera'];
const SOUNDS = ['Oven hum', 'Rainy window', 'Café', 'Fireplace'];
const TOPPINGS = {
  strawberry: { n: 'Strawberry', svg: '<polygon points="15,27 5,13 9,6 21,6 25,13" fill="#FF4FC8"/><polygon points="15,27 15,6 21,6 25,13" fill="#E0389F"/><polygon points="9,6 15,2 21,6 15,9" fill="#14DFC6"/><rect x="11" y="13" width="2" height="2" fill="#FFE600"/><rect x="17" y="17" width="2" height="2" fill="#FFE600"/>' },
  blueberry: { n: 'Blueberry', svg: '<polygon points="10,5 20,5 26,11 26,19 20,25 10,25 4,19 4,11" fill="#5A6BFF"/><polygon points="15,5 20,5 26,11 26,19 20,25 15,25" fill="#4152E0"/><polygon points="13,9 17,9 15,12" fill="#2A35A8"/>' },
  mint: { n: 'Mint', svg: '<polygon points="4,24 10,8 24,4 20,18" fill="#14DFC6"/><polygon points="4,24 24,4 20,18" fill="#0FBFA8"/>' },
  gold: { n: 'Gold leaf', svg: '<polygon points="6,8 22,4 26,18 12,26 4,18" fill="#FFE600"/><polygon points="22,4 26,18 12,26" fill="#F2C400"/><polygon points="8,10 14,8 10,14" fill="#FFF7A8"/>' },
  sprinkles: { n: 'Sprinkles', svg: '<rect x="4" y="6" width="9" height="3" fill="#FF4FC8" transform="rotate(-20 8 7)"/><rect x="16" y="9" width="9" height="3" fill="#22BFFF" transform="rotate(25 20 10)"/><rect x="7" y="17" width="9" height="3" fill="#FFE600" transform="rotate(10 11 18)"/><rect x="17" y="20" width="9" height="3" fill="#14DFC6" transform="rotate(-30 21 21)"/>' },
  choc: { n: 'Choc chips', svg: '<polygon points="15,4 25,24 5,24" fill="#7A4A26"/><polygon points="15,4 25,24 15,24" fill="#5E3519"/>' },
};
const tip = (id) => `<svg viewBox="0 0 30 30" aria-hidden="true">${TOPPINGS[id].svg}</svg>`;
const ICON = {
  note: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18V5l11-2v13"/><path d="M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>',
  chev: '<svg class="chev" width="10" height="16" viewBox="0 0 10 16" aria-hidden="true"><path d="M2 2l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>',
  tick: '<svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true"><path d="M1 5l3.5 3.5L11 1" fill="none" stroke="#FFFFFF" stroke-width="2.4"/></svg>',
  lock: '<svg width="14" height="16" viewBox="0 0 18 20" aria-hidden="true"><path d="M3 9h12v10H3zM5.5 9V6a3.5 3.5 0 0 1 7 0v3" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>',
};
const art = (name, attrs = '') => `<svg viewBox="0 0 200 172" ${attrs} aria-hidden="true">${ART[name]}</svg>`;
const recipeById = (id) => RECIPES.find((r) => r.id === id);
// Paper-cut portraits: background colour, hair colour, hair style.
const AV = { Mia: ['#FFC4F8', '#7A4A26', 'bob'], Jun: ['#A6E6FF', '#10131A', 'spiky'], Ava: ['#9FF0E4', '#C2852A', 'bun'], Sam: ['#FFF07A', '#5E3519', 'cap'],
  Noa: ['#FFE3C8', '#10131A', 'bun'], Kai: ['#D9F3FF', '#7A4A26', 'spiky'], Lin: ['#E7FBF8', '#10131A', 'bob'], Ivy: ['#FFF0FC', '#C2852A', 'bob'], Ben: ['#FFF7A8', '#5E3519', 'spiky'], Leqi: ['#FFE600', '#10131A', 'bob'] };
function avatarSvg(n) {
  const [bg, hair, st] = AV[n] || ['#E6DED6', '#4A4F5C', 'bob'];
  const hairs = {
    bob: `<polygon points="8,24 10,12 16,7 24,7 30,12 32,24 29,24 28,15 12,15 11,24" fill="${hair}"/>`,
    spiky: `<polygon points="10,17 11,10 14,12 16,6 19,10 22,5 24,10 28,8 29,13 31,17 28,14 12,14" fill="${hair}"/>`,
    bun: `<polygon points="16,3 24,3 26,7 14,7" fill="${hair}"/><polygon points="10,18 12,10 18,7 22,7 28,10 30,18 27,14 13,14" fill="${hair}"/>`,
    cap: `<polygon points="10,15 12,8 20,6 28,8 30,15" fill="#FF4FC8"/><polygon points="22,15 36,15 34,18 22,18" fill="#E0389F"/>`,
  };
  return `<svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true"><rect width="40" height="40" fill="${bg}"/><polygon points="5,40 10,33 30,33 35,40" fill="#10131A" opacity=".85"/><polygon points="16,30 24,30 24,34 16,34" fill="#F6D2B0"/><polygon points="14,12 26,12 30,17 30,25 26,31 14,31 10,25 10,17" fill="#FFE3C8"/><polygon points="20,12 26,12 30,17 30,25 26,31 20,31" fill="#F9D9BC"/>${hairs[st]}<rect x="14.5" y="20" width="2.4" height="3.2" fill="#10131A"/><rect x="23" y="20" width="2.4" height="3.2" fill="#10131A"/><rect x="12" y="24.5" width="3.5" height="2" fill="#FF9EF2"/><rect x="24.5" y="24.5" width="3.5" height="2" fill="#FF9EF2"/><polygon points="18,27 22,27 21,28.5 19,28.5" fill="#B4219A"/></svg>`;
}
const face = (n, cls = '') => `<span class="avatar cut ${cls}">${avatarSvg(n)}</span>`;
const APP_ICONS = { social: 'M4 5h16v11H9l-5 4z', video: 'M4 5h16v14H4z M10 9l5 3-5 3z', games: 'M3 9h18v8H3z M7 11v4 M5 13h4 M15 12h1 M18 14h1', shopping: 'M5 8h14l-1 12H6z M9 8V6a3 3 0 0 1 6 0v2', messages: 'M3 6h18v12H3z M3 6l9 7 9-7' };
const appIcon = (id) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#10131A" stroke-width="2" aria-hidden="true">${APP_ICONS[id].split(' M').map((x, i) => `<path d="${i ? 'M' + x : x}"/>`).join('')}</svg>`;
const mmss = (s) => { s = Math.max(0, Math.ceil(s)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
function setHTML(el, html) { if (el.innerHTML !== html) el.innerHTML = html; }
function setText(el, text) { if (el.textContent !== text) el.textContent = text; }
document.querySelectorAll('[data-art]').forEach((el) => { el.innerHTML = ART[el.dataset.art]; });
document.querySelectorAll('.progress').forEach((el) => { el.innerHTML = [1, 2, 3, 4, 5, 6].map((k) => `<i class="${k <= +el.dataset.step ? 'on' : ''}"></i>`).join(''); });

/* ---------- toast & alert ---------- */
let toastTimer = null;
function toast(html, ms = 2400) {
  const t = $('toast'); t.innerHTML = html; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}
function slip(head, sub) { toast(`<b>${esc(head)}</b><span>${sub ? esc(sub) : ''}</span>`); }
function ask({ title, text, no, yes }) {
  return new Promise((res) => {
    $('alert-h').textContent = title; $('alert-p').textContent = text; $('alert-no').textContent = no; $('alert-yes').textContent = yes;
    $('alert').classList.add('on'); $('scrim').classList.add('on'); $('scrim').dataset.for = 'alert';
    const done = (v) => { $('alert').classList.remove('on'); $('scrim').classList.remove('on'); $('alert-no').onclick = $('alert-yes').onclick = null; res(v); };
    $('alert-no').onclick = () => done(false); $('alert-yes').onclick = () => done(true);
    setTimeout(() => $('alert-no').focus(), 50);
  });
}

/* ---------- navigation: five tabs, and a full-screen bake flow presented over them ---------- */
const scr = (id) => $('s-' + id);
let tab = 'home', base = 'modal';
const stack = [];
function setTab(t) {
  if (stack.length) return;
  scr(tab).classList.remove('on', 'left'); scr(t).classList.add('on'); scr(t).querySelector('.scroll').scrollTop = 0; tab = t;
  document.querySelectorAll('.tabbar [data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
  renderTabs();
}
function place(el, cls) { el.style.transition = 'none'; el.classList.remove('on', 'left', 'below'); if (cls) el.classList.add(cls); void el.offsetWidth; el.style.transition = ''; }
function present(id) {
  // a page opened from a tab (a room, say) closes underneath the new flow
  if (base === 'tab' && stack.length) { stack.forEach((p) => place(scr(p))); place(scr(tab), 'on'); }
  base = 'modal'; stack.length = 0; stack.push(id);
  const s = scr(id); place(s, 'below'); s.classList.remove('below'); s.classList.add('on');
  $('tabbar').classList.add('away');
}
function push(id) {
  const cur = scr(stack[stack.length - 1]); cur.classList.remove('on'); cur.classList.add('left');
  const s = scr(id); place(s); s.classList.add('on'); stack.push(id);
  const sc = s.querySelector('.scroll'); if (sc) sc.scrollTop = 0;
}
function openPage(id) {
  base = 'tab'; stack.length = 0; stack.push(id);
  const cur = scr(tab); cur.classList.remove('on'); cur.classList.add('left');
  const s = scr(id); place(s); s.classList.add('on'); const sc = s.querySelector('.scroll'); if (sc) sc.scrollTop = 0;
  $('tabbar').classList.add('away');
}
function pop() {
  if (stack.length < 2 && base === 'tab') {
    scr(stack.pop()).classList.remove('on'); const t = scr(tab); t.classList.remove('left'); t.classList.add('on');
    $('tabbar').classList.remove('away'); return;
  }
  if (stack.length < 2) return dismiss();
  const cur = scr(stack.pop()); cur.classList.remove('on');
  const prev = scr(stack[stack.length - 1]); prev.classList.remove('left'); prev.classList.add('on');
}
function dismiss(toTab) {
  const cur = scr(stack[stack.length - 1]); cur.classList.remove('on'); cur.classList.add('below');
  stack.forEach((id) => { if (scr(id) !== cur) place(scr(id)); });
  stack.length = 0; $('tabbar').classList.remove('away');
  if (toTab) setTab(toTab); else renderTabs();
}
document.querySelectorAll('.tabbar [data-tab]').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));
$('app').addEventListener('click', (e) => {
  const t = e.target.closest('[data-tab]'); if (t && !t.closest('.tabbar')) { setTab(t.dataset.tab); return; }
  const g = e.target.closest('[data-go]'); if (!g) return;
  const go = g.dataset.go;
  if (go === 'start') { pickRecipe('cupcake'); present('recipe'); }
  else if (go === 'pick') { present('recipe'); }
  else if (go === 'join') { together = g.dataset.who || 'Mia'; present('recipe'); }
  else if (go === 'back') pop();
  else if (go === 'close') {
    if (S.grams > 0 || S.goals.length) ask({ title: 'Leave this bake?', text: 'Your flour and goals will be thrown out.', no: 'Keep prepping', yes: 'Leave' }).then((y) => { if (y) dismiss(); });
    else dismiss();
  } else if (go === 'shop') openShop(+g.dataset.i);
});

/* ---------- tab content ---------- */
const CASE = [
  { r: 'macaron', when: 'Thursday', min: 25, grade: 'Golden perfect', tops: 4 },
  { r: 'latte', when: 'Wednesday', min: 15, grade: 'Nicely baked', tops: 2 },
  { r: 'cupcake', when: 'Monday', min: 50, grade: 'Golden perfect', tops: 7 },
  { r: 'shortcake', when: 'Last Sunday', min: 75, grade: 'A little burnt', tops: 3 },
];
let together = 'Mia';
const LEN = { 'Strawberry macaron': 25, 'Strawberry shortcake': 75, 'Strawberry cupcake': 50, Latte: 15 };
function friendRow(f) {
  const p = Math.round((1 - f.left / (LEN[f.d] || 50)) * 100);
  return `<div class="row">${face(f.n)}<span class="grow"><span class="t">${f.n}</span><span class="s">${f.d} · ${f.left} min left</span><span class="bar"><i style="width:${p}%"></i></span></span><button class="btn soft cut small" type="button" data-go="join" data-who="${f.n}">Join</button></div>`;
}
function renderTabs() {
  setHTML($('friends'), FRIENDS.slice(0, 3).map(friendRow).join(''));
  setHTML($('friends-all'), FRIENDS.map(friendRow).join(''));
  setHTML($('rooms'), ROOMS.map((r, i) => `<div class="row" data-go="room" data-i="${i}" role="button" tabindex="0"><span class="faces">${r.f.map((n) => face(n)).join('')}</span><span class="grow"><span class="t">${r.n}</span><span class="s"><span class="live">${r.k} baking</span> · ${r.s}</span></span>${ICON.chev}</div>`).join(''));
  setHTML($('case-grid'), CASE.map((c, i) => `<button type="button" data-go="case" data-i="${i}" class="case-item cut ${c.isNew ? 'new' : ''}"><div class="art">${art(c.r)}</div><p class="t">${recipeById(c.r).name}</p><p class="s">${c.when} · ${c.min} min · ${c.tops} toppings</p><span><span class="tag hi cut">${c.grade}</span></span></button>`).join(''));
  setText($('case-sub'), `${CASE.length} desserts · ${(CASE.reduce((a, c) => a + c.min, 0) / 60).toFixed(1)} h of focus`);
  setHTML($('shops'), SHOPS.map((s, i) => `<button class="row" type="button" data-go="shop" data-i="${i}"><span class="tile cut" style="background:${s.c}">${art(s.menu[0][0], 'class="art"')}</span><span class="grow"><span class="t">${s.n}</span><span class="s">${s.d} · ${s.walk}</span></span><span class="tag hi cut">${s.off}</span>${ICON.chev}</button>`).join(''));
  setHTML($('map'), `<span class="pin me" style="left:48%;top:56%"></span>` + SHOPS.map((s, i) => `<span class="pin" style="left:${s.x}%;top:${s.y}%"><svg viewBox="0 0 30 36" width="30" height="36"><polygon points="4,0 26,0 30,4 30,22 15,36 0,22 0,4" fill="#10131A"/><polygon points="9,7 21,7 23,9 23,17 21,19 9,19 7,17 7,9" fill="${s.c}"/></svg></span>`).join(''));
  const fresh = CASE.filter((c) => c.when === 'Just now'), today = fresh.map((c) => c.r), week = 6 + today.length, hrs = 4.5 + fresh.reduce((a, c) => a + c.min, 0) / 60;
  setText($('me-bakes'), String(week)); setText($('me-hours'), hrs.toFixed(1) + 'h');
  setText($('week-sum'), `${week} bakes · ${hrs.toFixed(1)} h focused`);
  const WEEK = [['M', ['cupcake', 'latte']], ['T', ['macaron']], ['W', ['latte']], ['T', ['macaron']], ['F', ['cupcake']], ['S', today, true], ['S', []]];
  setHTML($('week'), WEEK.map(([d, list, now]) => `<div class="day ${now ? 'today' : ''}"><span class="slot ${list.length ? '' : 'empty'}">${list.length ? art(list[0]) : ''}${list.length > 1 ? `<span class="x2">×${list.length}</span>` : ''}</span>${now ? 'Today' : d}</div>`).join(''));
}

/* ---------- 1. recipe ---------- */
let recipe = recipeById('cupcake');
function pickRecipe(id) { recipe = recipeById(id); renderRecipes(); }
function renderRecipes() {
  setHTML($('recipes'), RECIPES.map((r) => `<button class="recipe cut" type="button" role="radio" aria-checked="${r === recipe}" data-r="${r.id}">${art(r.id)}<span class="grow"><span class="t">${r.name}</span><span class="s">${r.order ? '<span class="tag hi cut">Today’s order</span>' : ''}${r.tool} · ${r.type}</span><span class="blocks">${Array.from({ length: r.rounds }, (_, k) => `${k ? '<i class="brk"></i>' : ''}<i style="width:${r.len * 1.1}px"></i>`).join('')}<span>${r.rounds} × ${r.len} min</span></span></span><span class="radio cut">${r === recipe ? ICON.tick : ''}</span></button>`).join(''));
  setText($('recipe-go'), `Start prepping · ${r_total(recipe)} min`);
  // the session this recipe makes, to scale: prep, focus rounds with short breaks, then the decorating break
  const parts = [['Prep', 3, 'prep']];
  for (let k = 0; k < recipe.rounds; k++) { if (k) parts.push(['Break', 5, 'break']); parts.push([`Bake ${recipe.rounds > 1 ? k + 1 : ''}`.trim(), recipe.len, 'bake']); }
  parts.push(['Decorate', 5, 'deco']);
  const all = parts.reduce((a, p) => a + p[1], 0);
  setHTML($('plan'), `<h3>Your session · about ${all} min</h3><div class="timeline">${parts.map(([n, m, c]) => `<div class="k-${c}" style="flex:${m}"><i></i><span>${m >= 10 ? `${n} · ${m}m` : ''}</span></div>`).join('')}</div><p>The oven stays shut while you bake. Leave the app and it starts to burn.</p>`);
}
const r_total = (r) => r.rounds * r.len;
$('recipes').addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (b) pickRecipe(b.dataset.r); });
$('recipe-go').addEventListener('click', () => { startPrep(); push('prep'); });

/* ---------- 2. prep: the kitchen mini-games ---------- */
const SCENES = ['pour', 'crack', 'whisk'];
const STEP_NAMES = ['Flour', 'Eggs', 'Whisk'];
const minutes = () => Math.round(S.grams / 50) * 5;
const rounds = (m) => Math.max(1, Math.ceil(m / 25));
const status = () => ({ weighed: S.grams >= 100 && !S.pouring, cracked: S.goals.length > 0, whisked: S.turns >= 3 });
function unlocked(scene) { const st = status(); return scene === 'pour' || (scene === 'crack' && st.weighed) || (scene === 'whisk' && st.weighed && st.cracked); }
const LOCK_NOTE = { crack: 'Weigh the flour first. The eggs go in after.', whisk: 'Crack at least one egg before you whisk.' };
let lockTimer = null;
function goto(scene) {
  if (scene === S.scene) return;
  stopPour(); endStir();
  S.prevScene = S.scene; S.scene = scene; S.sceneT = 0;
  update();
}
SCENES.forEach((s) => $('tab-' + s).addEventListener('click', () => {
  if (S.asking || S.editing !== null) return;
  if (!unlocked(s)) {
    const el = $('tab-' + s); el.classList.remove('nudge'); void el.offsetWidth; el.classList.add('nudge');
    S.lockNote = LOCK_NOTE[s]; buzz(12); update();
    clearTimeout(lockTimer); lockTimer = setTimeout(() => { S.lockNote = ''; update(); }, 2600); return;
  }
  goto(s);
}));
function overRim(p) { return Math.abs(p.x - CB.cx) < CB.rimHalf + 10 && p.y > CB.rimY - 70 && p.y < CB.rimY + 40; }
[0, 1, 2].forEach((i) => {
  const b = $('egg-' + i);
  b.style.left = ((SLOTS[i] + OX - 32) / CW * 100) + '%'; b.style.top = ((EGG_Y - 36) / H * 100) + '%';
  b.addEventListener('pointerdown', (e) => {
    if (S.eggsUsed[i] || S.crack || S.asking || S.editing !== null) return;
    capture(b, e); const p = local(e);
    S.drag = { i, x: SLOTS[i], y: EGG_Y, px: SLOTS[i], ox: p.x - SLOTS[i], oy: p.y - EGG_Y, sx: p.x, sy: p.y, moved: false };
  });
  b.addEventListener('pointermove', (e) => {
    const d = S.drag; if (!d || d.i !== i) return;
    const p = local(e);
    if (!d.moved && Math.hypot(p.x - d.sx, p.y - d.sy) > 8) { d.moved = true; buzz(6); }
    d.px = d.x; d.x = p.x - d.ox; d.y = p.y - d.oy;
    const over = overRim(d); if (over && !d.over) buzz(8); d.over = over;
  });
  const release = () => {
    const d = S.drag; if (!d || d.i !== i) return; S.drag = null;
    if (!d.moved) crackEgg(i);
    else if (overRim(d)) crackEgg(i, { x: d.x, y: d.y });
    else S.eggBack = { i, x: d.x, y: d.y, t0: performance.now() };
  };
  b.addEventListener('pointerup', release); b.addEventListener('pointercancel', release);
  b.addEventListener('click', (e) => { if (e.detail === 0) crackEgg(i); });
});
function pourToRecipe() {
  if (S.pouring || S.grams >= RECIPE_G - PERFECT_WINDOW) return;
  S.autoTarget = RECIPE_G; startPour(null, 'auto');
}
function scoop(g) {
  if (S.pouring || S.grams <= 0) return;
  const next = Math.max(0, S.grams - g), k = S.grams ? next / S.grams : 0;
  for (let i = 0; i < S.heights.length; i++) S.heights[i] *= k;
  S.landed = Math.round(next / G_PER_GRAIN); S.grams = Math.min(MAX_G, S.landed * G_PER_GRAIN);
  for (let k2 = 0; k2 < 6; k2++) S.dust.push({ x: 150 + Math.random() * 60, y: PILE.baseY - 30, vx: (Math.random() - .5) * 80, vy: -40 - Math.random() * 40, life: 1 });
  buzz(8); slip(`${minutes()} min`, `${Math.round(S.grams)} g after scooping`); update();
}
let toolsKey = '';
function setTools(items) {
  const key = items.map((t) => t[0]).join('|'); if (key === toolsKey) return; toolsKey = key;
  const t = $('tools'); t.innerHTML = '';
  items.forEach(([label, fn]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn soft cut small'; b.textContent = label; b.onclick = fn; t.appendChild(b); });
}
function update() {
  const st = status(), all = st.weighed && st.cracked && st.whisked, m = minutes(), laps = Math.floor(S.turns);
  const bucket = Math.floor(S.grams / 100); if (S.pouring && bucket > S.lastBucket) buzz(6); S.lastBucket = bucket;
  [0, 1, 2].forEach((i) => { $('egg-' + i).hidden = S.scene !== 'crack'; $('egg-' + i).disabled = S.eggsUsed[i]; });

  SCENES.forEach((s, i) => {
    const el = $('tab-' + s), open = unlocked(s), ok = [st.weighed, st.cracked, st.whisked][i];
    el.setAttribute('aria-selected', String(S.scene === s)); el.setAttribute('aria-disabled', String(!open));
    setHTML(el, `${ok ? `<span class="tick cut">${ICON.tick}</span>` : open ? `<span class="num cut">${i + 1}</span>` : `<span class="num cut">${ICON.lock}</span>`}${STEP_NAMES[i]}`);
  });
  const shown = S.pouring ? Math.round(S.grams / 10) : m; // counts up by the minute while pouring, then settles on 5s
  if (S.scene === 'pour') setHTML($('readout'), `<b>${shown} min</b><span>${Math.round(S.grams)} g${S.grams >= 100 ? ` · ${rounds(shown)} × 25 min` : ''}</span>`);
  else if (S.scene === 'crack') setHTML($('readout'), `<b>${S.goals.length} of 3</b><span>goals, one per egg</span>`);
  else setHTML($('readout'), `<b>${laps} of 3</b><span>laps</span>`);
  if (S.scene === 'crack') setHTML($('goal-rows'), [0, 1, 2].map((k) => S.goals[k]
    ? `<button class="goal-row cut" type="button" data-k="${k}"><span class="n cut">${k + 1}</span><span class="x">${esc(S.goals[k].text)}</span>${ICON.chev}</button>`
    : `<div class="goal-row empty cut"><span class="n cut">${k + 1}</span><span class="x">Crack an egg to add a goal</span></div>`).join(''));
  else if (S.scene === 'whisk') setHTML($('goal-rows'), `<div class="steps">${[0, 1, 2].map((k) => `<i class="${S.turns >= k + 1 ? 'on' : ''}"></i>`).join('')}</div>`);
  else setHTML($('goal-rows'), '');

  const hint = $('hint');
  hint.classList.toggle('cue', S.scene === 'whisk' && S.stirring && !S.lockNote);
  if (S.lockNote) { setText(hint, S.lockNote); setTools([]); }
  else if (S.scene === 'pour') {
    setText(hint, S.pouring ? (S.pourSrc === 'auto' ? 'Pouring to the recipe…' : 'Let go just before the mark. The flour in the air still lands.')
      : S.grams ? `Every 100 g is 10 minutes. The recipe asks for ${RECIPE_G / 10}.` : `Hold to pour. Every 100 g of flour is 10 minutes of study.`);
    const tools = [];
    if (!S.pouring && S.grams < RECIPE_G - PERFECT_WINDOW) tools.push([`Pour to recipe · ${RECIPE_G / 10} min`, pourToRecipe]);
    if (!S.pouring && S.grams >= 50) tools.push(['Remove 50 g', () => scoop(50)]);
    setTools(tools);
  } else if (S.scene === 'crack') { setText(hint, S.crack ? 'Crack!' : S.goals.length ? '' : 'Tap an egg, or drag it to the rim of the bowl.'); setTools([]); }
  else { setText(hint, whiskCue()); setTools([]); }

  const prim = $('primary'), sec = $('secondary'), label = $('primary-label'), fill = $('fill');
  prim.classList.remove('pink'); prim.removeAttribute('aria-disabled'); sec.hidden = true; fill.style.width = '0';
  const off = (text) => { prim.setAttribute('aria-disabled', 'true'); setText(label, text); prim.dataset.act = ''; };
  const go = (text, act) => { prim.classList.add('pink'); setText(label, text); prim.dataset.act = act; };
  if (all && !S.pouring) go(`Preheat the oven · ${m} min`, 'preheat');
  else if (S.scene === 'pour') {
    if (S.pouring && S.pourSrc === 'primary') { setText(label, 'Pouring…'); prim.dataset.act = 'hold'; fill.style.width = (S.grams / MAX_G * 100) + '%'; }
    else if (S.pouring && S.pourSrc === 'auto') off('Pouring…');
    else if (S.grams >= 100) { sec.hidden = false; setText(sec, S.pouring ? 'Pouring' : 'Pour more'); go('Next: eggs', 'next'); }
    else if (S.grams >= MAX_G) off('The bag is empty');
    else { setText(label, S.pouring ? 'Pouring…' : 'Hold to pour'); prim.dataset.act = 'hold'; fill.style.width = (S.grams / MAX_G * 100) + '%'; }
  } else if (S.scene === 'crack') {
    if (st.cracked && !S.asking && !S.crack && S.editing === null) go('Next: whisk', 'next');
    else off('Crack an egg');
  } else off(st.whisked ? 'Done' : 'Stir in the bowl');
  if (all && !S.done) { S.done = true; celebrate(); }
}
function whiskCue() {
  if (S.turns >= 3) return 'Smooth. No lumps left.';
  if (!S.stirring) return 'Press in the bowl and go round, slowly. Breathe with the halo.';
  if (S.tooFast > .3) return 'Slower. You’ll splash it.';
  const t = S.breathT % 8, n = Math.floor(t % 4) + 1;
  return `${t < 4 ? 'Breathe in' : 'Breathe out'} · ${[1, 2, 3, 4].slice(0, n).join(' · ')}`;
}
const prim = $('primary');
prim.addEventListener('pointerdown', (e) => { if (prim.dataset.act === 'hold') { capture(prim, e); startPour(e, 'primary'); } });
prim.addEventListener('pointerup', stopPour); prim.addEventListener('pointercancel', stopPour); prim.addEventListener('lostpointercapture', stopPour);
prim.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat && prim.dataset.act === 'hold') startPour(e, 'primary'); });
prim.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') stopPour(); });
prim.addEventListener('contextmenu', (e) => e.preventDefault());
prim.addEventListener('click', () => {
  if (performance.now() - (S.pourEndedAt || 0) < 350) return; // a long pour released here isn't a tap
  const act = prim.dataset.act;
  if (act === 'next') goto(S.scene === 'pour' ? 'crack' : 'whisk');
  else if (act === 'preheat') { renderPreheat(); push('preheat'); }
});
const sec = $('secondary');
sec.addEventListener('pointerdown', (e) => { capture(sec, e); startPour(e, 'secondary'); });
sec.addEventListener('pointerup', stopPour); sec.addEventListener('pointercancel', stopPour); sec.addEventListener('lostpointercapture', stopPour);
function celebrate() { buzz([30, 60, 18]); slip('Batter ready', `${minutes()} min · ${S.goals.length} ${S.goals.length > 1 ? 'goals' : 'goal'}`); }

// Goals: a sheet slides up after each crack; tap a goal row later to change or remove it.
function openSheet(id) { $(id).classList.add('on'); $(id).setAttribute('aria-hidden', 'false'); $('scrim').classList.add('on'); $('scrim').dataset.for = id; }
function closeSheet(id) { $(id).classList.remove('on'); $(id).setAttribute('aria-hidden', 'true'); $('scrim').classList.remove('on'); }
function openWrite({ title, value, ideas, alt, ok }) {
  setText($('goal-title'), title); $('goal').value = value; $('goal-ok').disabled = !value.trim(); setText($('goal-ok'), ok);
  setText($('goal-alt'), alt);
  $('ideas').innerHTML = ideas.map((g) => `<button class="chip cut" type="button">${esc(g)}</button>`).join('');
  $('ideas').querySelectorAll('button').forEach((b) => { b.onclick = () => { $('goal').value = b.textContent; $('goal-ok').disabled = false; $('goal').focus(); }; });
  openSheet('sheet-goal'); update();
  setTimeout(() => $('goal').focus({ preventScroll: true }), 300);
}
function askGoal(egg) {
  S.asking = { egg };
  openWrite({ title: `Egg ${S.goals.length + 1} is for…`, value: '', ideas: IDEAS.filter((g) => !S.goals.some((x) => x.text === g)).slice(0, 3), alt: 'Put the egg back', ok: 'Add goal' });
}
function editGoal(k) {
  if (S.asking || S.crack) return;
  S.editing = k;
  openWrite({ title: `Goal ${k + 1}`, value: S.goals[k].text, ideas: [], alt: 'Remove goal', ok: 'Save' });
}
function closeWrite() { S.asking = null; S.editing = null; $('goal').blur(); closeSheet('sheet-goal'); update(); }
$('goal').addEventListener('input', () => { $('goal-ok').disabled = !$('goal').value.trim(); });
$('sheet-goal').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $('goal').value.trim(); if (!text) return;
  if (S.editing !== null) S.goals[S.editing].text = text;
  else if (S.asking) { S.goals.push({ text, egg: S.asking.egg }); buzz([10, 40, 10]); }
  closeWrite();
});
$('goal-alt').addEventListener('click', () => { if (S.editing !== null) removeGoal(S.editing); else if (S.asking) returnEgg(S.asking.egg); });
$('goal-rows').addEventListener('click', (e) => { const b = e.target.closest('.goal-row[data-k]'); if (b) editGoal(+b.dataset.k); });
function returnEgg(egg) {
  S.eggsUsed[egg] = false; S.yolks = S.yolks.filter((y) => y.egg !== egg);
  S.eggBack = { i: egg, x: CB.cx, y: CB.rimY - 30, t0: performance.now() };
  closeWrite();
}
function removeGoal(k) { const g = S.goals[k]; S.goals.splice(k, 1); S.done = false; returnEgg(g.egg); if (!S.goals.length && S.scene === 'whisk') goto('crack'); }
$('scrim').addEventListener('click', () => {
  const f = $('scrim').dataset.for;
  if (f === 'sheet-goal') { if (S.asking) returnEgg(S.asking.egg); else closeWrite(); }
  else if (f === 'sheet-shop') closeSheet('sheet-shop');
});
function startPrep() {
  stopPour(); endStir();
  RECIPE_G = recipe.grams;
  Object.assign(S, { scene: 'pour', prevScene: null, sceneT: 1, grams: 0, landed: 0, grains: [], dust: [], eggsUsed: [false, false, false], crack: null, yolks: [], goals: [], asking: null, editing: null, turns: 0, trail: [], done: false, lastBucket: 0, confetti: [], splash: [], tooFast: 0, drag: null, eggBack: null, flash: 0, judgePending: false, autoTarget: 0, lockNote: '' });
  S.heights.fill(0);
  setText($('prep-dessert'), recipe.name);
  update();
}

/* ---------- 3. preheat: focus lock, allowed tools, sound ---------- */
const P = { lock: 1, allowed: new Set(['Dictionary', 'Calculator', 'Music']), sounds: new Set(['Oven hum', 'Rainy window']), together: true };
function renderPreheat() {
  const L = LOCKS[P.lock];
  setHTML($('lock-opts'), LOCKS.map((l, i) => `<button class="lock-opt cut" type="button" role="radio" aria-checked="${i === P.lock}" data-i="${i}"><b>${l.t}°</b><span>${l.name}</span><small>${l.d}</small></button>`).join(''));
  setText($('lock-note'), L.note);
  setHTML($('blocked'), APPS.map((a) => { const on = L.blocks.includes(a.id); return `<div class="row"><span class="tile cut" style="background:${a.c}">${appIcon(a.id)}</span><span class="grow"><span class="t">${a.n}</span><span class="s">${a.s}</span></span><span class="switch cut" role="switch" aria-checked="${on}" aria-label="${a.n} locked"></span></div>`; }).join(''));
  setHTML($('allowed'), ALLOWED.map((a) => `<button class="chip cut" type="button" aria-pressed="${P.allowed.has(a)}" data-a="${esc(a)}">${esc(a)}</button>`).join(''));
  setHTML($('sounds'), SOUNDS.map((a) => `<button class="chip cut" type="button" aria-pressed="${P.sounds.has(a)}" data-s="${esc(a)}">${ICON.note}${esc(a)}</button>`).join(''));
  setHTML($('together-faces'), face(together) + face(together === 'Jun' ? 'Mia' : 'Jun'));
  $('together').setAttribute('aria-checked', String(P.together));
  setText($('preheat-go'), `Close the door · bake ${minutes()} min`);
}
$('lock-opts').addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) { P.lock = +b.dataset.i; buzz(8); renderPreheat(); } });
$('allowed').addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a; P.allowed.has(a) ? P.allowed.delete(a) : P.allowed.add(a); renderPreheat(); });
$('sounds').addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (!b) return; const a = b.dataset.s; P.sounds.has(a) ? P.sounds.delete(a) : P.sounds.add(a); renderPreheat(); });
$('together').addEventListener('click', () => { P.together = !P.together; renderPreheat(); });
$('preheat-go').addEventListener('click', startBake);

/* ---------- 4. bake: the timer, with the door shut ---------- */
const B = { total: 0, left: 0, speed: 60, timer: null, last: 0, exits: 0, burnt: false, early: false, goals: [], awayAt: 0, awayTimer: null };
const PHASES = [['Preheat', .08], ['Rise', .55], ['Brown', .92], ['Done', 1]];
function startBake() {
  const m = minutes();
  Object.assign(B, { total: m * 60, left: m * 60, exits: 0, burnt: false, early: false, goals: S.goals.map((g) => ({ text: g.text, done: false })) });
  $('oven-food').innerHTML = ART[recipe.id] || ART.cupcake;
  setText($('bake-dessert'), recipe.name);
  setText($('lock-name'), `${LOCKS[P.lock].name} lock`); setText($('lock-count'), `${LOCKS[P.lock].blocks.length} app types locked`);
  setText($('bake-sound'), P.sounds.size ? [...P.sounds].join(' + ') : 'No sound');
  $('bake-friends').hidden = !P.together; setText($('bake-friends'), `${together} and ${together === 'Jun' ? 'Mia' : 'Jun'} baking too`);
  $('door').classList.add('open'); push('bake');
  setTimeout(() => { $('door').classList.remove('open'); $('oven-light').classList.add('on'); buzz(20); }, 500);
  B.last = performance.now(); clearInterval(B.timer); B.timer = setInterval(tickBake, 200);
  if (P.together) setTimeout(() => { if (B.timer && PREFS.notifyJoin) notify(`${together} joined your oven`, `Baking next to you in Quiet library`); }, 3500);
  renderBake();
}
function tickBake() {
  const now = performance.now(); B.left -= (now - B.last) / 1000 * B.speed; B.last = now;
  if (B.left <= 0) { B.left = 0; finishBake(); }
  renderBake();
}
function renderBake() {
  const p = B.total ? 1 - B.left / B.total : 0, elapsed = B.total - B.left;
  setText($('clock'), mmss(B.left)); setText($('oven-clock'), mmss(B.left));
  const nr = Math.max(1, Math.ceil(B.total / 1500)), r = Math.min(nr, Math.floor(elapsed / 1500) + 1);
  setText($('bake-round'), nr > 1 ? `Round ${r} of ${nr} · ${recipe.name}` : recipe.name);
  const k = PHASES.findIndex(([, e]) => p < e || e === 1);
  setHTML($('phases'), PHASES.map(([n], i) => `<div class="${i <= k ? 'on' : ''} ${i === k ? 'now' : ''}"><i></i>${n}</div>`).join(''));
  const s = .55 + .45 * Math.min(1, p / .55);
  $('oven-food').style.transform = `scale(${s.toFixed(3)})`;
  $('oven-food').style.filter = B.burnt ? 'brightness(.62) saturate(.7)' : p > .55 ? `brightness(${(1 - (p - .55) * .18).toFixed(3)})` : '';
  setText($('exit-count'), `${B.exits} ${B.exits === 1 ? 'exit' : 'exits'}`);
  setText($('goal-count'), `${B.goals.filter((g) => g.done).length} of ${B.goals.length} done`);
  setHTML($('bake-goals'), B.goals.map((g, i) => `<button class="row check-row" type="button" role="checkbox" aria-checked="${g.done}" data-g="${i}"><span class="check cut" aria-checked="${g.done}">${g.done ? ICON.tick : ''}</span><span class="grow"><span class="t">${esc(g.text)}</span></span></button>`).join(''));
  setText($('speed'), B.speed === 1 ? '1×' : '60×');
}
$('bake-goals').addEventListener('click', (e) => { const b = e.target.closest('[data-g]'); if (!b) return; const g = B.goals[+b.dataset.g]; g.done = !g.done; if (g.done) buzz([10, 30, 10]); renderBake(); });
$('speed').addEventListener('click', () => { B.speed = B.speed === 1 ? 60 : 1; toast(B.speed === 1 ? '<span>Real time</span>' : '<b>60×</b><span>Demo speed: a minute passes every second</span>'); renderBake(); });
$('emergency').addEventListener('click', () => ask({ title: 'Open the oven early?', text: 'Your dessert comes out half-baked and the bake counts as an exit.', no: 'Keep baking', yes: 'Open it' }).then((y) => { if (y) { B.early = true; B.exits++; finishBake(); } }));
// Leaving the app is the thing the oven guards against. The demo shows what happens; a real tab switch counts too.
function leave() {
  if (!B.timer) return;
  B.exits++; let n = LOCKS[P.lock].t === 160 ? 30 : LOCKS[P.lock].t === 220 ? 0 : 10;
  if (n === 0) B.burnt = true;
  setText($('away-n'), String(n)); setText($('away-h'), n ? `Your ${recipe.name.split(' ').pop()} is getting hot` : 'Strict lock: it’s burning');
  drawHomeScreen(); $('away').classList.add('on'); $('app').classList.add('darkbar'); buzz([40, 60, 40]);
  liveActivity('expanded'); setTimeout(() => { if ($('away').classList.contains('on')) liveActivity('compact'); }, 2600);
  clearInterval(B.awayTimer);
  B.awayTimer = setInterval(() => {
    if (n <= 0) return; n--; setText($('away-n'), String(n));
    if (n === 0) { B.burnt = true; setText($('away-h'), 'Too late: it’s starting to burn'); buzz(80); liveActivity('expanded burnt'); }
  }, 1000);
  renderBake();
}
$('leave').addEventListener('click', leave);
$('away-back').addEventListener('click', () => { clearInterval(B.awayTimer); $('away').classList.remove('on'); $('app').classList.remove('darkbar'); liveActivity(''); toast(B.burnt ? '<span>Back, but the edges caught</span>' : `<span>Back in time. That was exit ${B.exits}.</span>`); renderBake(); });
document.addEventListener('visibilitychange', () => {
  if (!B.timer || $('away').classList.contains('on')) return;
  if (document.hidden) B.awayAt = performance.now();
  else if (B.awayAt) { const secs = (performance.now() - B.awayAt) / 1000; B.awayAt = 0; B.exits++; if (secs > 10) B.burnt = true; toast(`<span>You were away ${Math.round(secs)} s${secs > 10 ? ', it started to burn' : ''}</span>`); renderBake(); }
});
function finishBake() {
  clearInterval(B.timer); B.timer = null;
  $('oven-light').classList.remove('on'); $('door').classList.add('open'); buzz([30, 80, 30, 80, 60]);
  renderResult(); setTimeout(() => push('result'), 900);
}

/* ---------- 5. result ---------- */
let earned = [];
function renderResult() {
  const done = B.goals.filter((g) => g.done).length, mins = Math.round((B.total - B.left) / 60);
  const [k, h, p] = B.early ? ['OPENED EARLY', 'Half-baked', 'Still gooey in the middle. You can bake again any time.']
    : B.burnt ? ['A BIT TOO LONG AWAY', 'A little burnt', 'You left the kitchen for too long. Still edible.']
    : B.exits ? ['DING!', 'Nicely baked', `Out of the oven, with ${B.exits} ${B.exits > 1 ? 'exits' : 'exit'}.`]
    : ['DING!', 'Golden perfect', 'The door stayed shut the whole time.'];
  setText($('v-k'), k); setText($('v-h'), h); setText($('v-p'), p);
  $('result-food').innerHTML = ART[recipe.id] || ART.cupcake;
  $('result-food').style.filter = B.burnt ? 'brightness(.62) saturate(.7)' : B.early ? 'saturate(.55) brightness(1.08)' : '';
  setText($('r-min'), String(mins)); setText($('r-exits'), String(B.exits)); setText($('r-goals'), `${done}/${B.goals.length}`);
  earned = [['strawberry', B.early ? 1 : rounds(minutes()) + 1], ['sprinkles', done * 2 + 1], ['blueberry', B.early ? 0 : 2], ['mint', done ? 1 : 0], ['gold', !B.early && !B.burnt && !B.exits ? 1 : 0], ['choc', 0]];
  setHTML($('earned'), earned.filter(([, n]) => n).map(([id, n]) => `<span class="chip white cut"><svg viewBox="0 0 30 30" width="20" height="20" aria-hidden="true">${TOPPINGS[id].svg}</svg>${TOPPINGS[id].n}<span class="n">× ${n}</span></span>`).join(''));
  setText($('to-deco'), B.early ? 'Decorate anyway' : 'Decorate · 5-min break');
  setHTML($('r-goal-list'), B.goals.map((g) => `<div class="row check-row" aria-checked="${g.done}"><span class="check cut" aria-checked="${g.done}">${g.done ? ICON.tick : ''}</span><span class="grow"><span class="t">${esc(g.text)}</span><span class="s">${g.done ? 'Done' : 'Carries over to your next bake'}</span></span></div>`).join(''));
  B.grade = h;
}
$('to-deco').addEventListener('click', () => { startDecorate(); push('decorate'); });

/* ---------- 6. decorate: the break ---------- */
const D = { left: 300, timer: null, last: 0, placed: [], counts: {} };
function startDecorate() {
  D.left = 300; D.placed = []; D.counts = Object.fromEntries(earned);
  $('deco-food').innerHTML = ART[recipe.id] || ART.cupcake; $('deco-food').style.filter = $('result-food').style.filter;
  $('deco').querySelectorAll('.topping').forEach((t) => t.remove());
  renderTray();
  D.last = performance.now(); clearInterval(D.timer);
  D.timer = setInterval(() => { const now = performance.now(); D.left = Math.max(0, D.left - (now - D.last) / 1000 * B.speed); D.last = now; setText($('break-clock'), mmss(D.left)); if (!D.left) { clearInterval(D.timer); setText($('deco-hint'), 'Break’s over. Save it, or order the real one.'); buzz([20, 40, 20]); } }, 200);
  setText($('break-clock'), mmss(D.left)); setText($('deco-hint'), 'Tap a topping to add it, then drag it into place.');
}
function renderTray() {
  setHTML($('tray'), Object.keys(TOPPINGS).map((id) => { const n = D.counts[id] || 0, had = earned.some(([e, k]) => e === id && k); return `<button type="button" data-t="${id}" ${n ? '' : 'disabled'}>${tip(id)}<span>${TOPPINGS[id].n}</span><span class="n">${had ? '× ' + n : 'not earned'}</span></button>`; }).join(''));
}
$('tray').addEventListener('click', (e) => {
  const b = e.target.closest('[data-t]'); if (!b || b.disabled) return; const id = b.dataset.t;
  D.counts[id]--; renderTray();
  // lands somewhere on the frosting (the top two-thirds of the dessert)
  const x = 85 + Math.random() * 130, y = 60 + Math.random() * 70;
  const el = document.createElement('span'); el.className = 'topping'; el.innerHTML = tip(id);
  el.style.left = x + 'px'; el.style.top = (y - 40) + 'px'; el.style.transform = `rotate(${Math.round(Math.random() * 60 - 30)}deg)`;
  $('deco').appendChild(el); requestAnimationFrame(() => { el.style.transition = 'top .3s cubic-bezier(.3,1.4,.5,1)'; el.style.top = y + 'px'; });
  D.placed.push(id); buzz(8);
  let drag = null;
  el.addEventListener('pointerdown', (ev) => { capture(el, ev); el.style.transition = 'none'; drag = { dx: ev.clientX, dy: ev.clientY, x: parseFloat(el.style.left), y: parseFloat(el.style.top) }; });
  el.addEventListener('pointermove', (ev) => { if (!drag) return; const r = $('deco').getBoundingClientRect(), k = 300 / r.width; el.style.left = clamp(drag.x + (ev.clientX - drag.dx) * k, 10, 290) + 'px'; el.style.top = clamp(drag.y + (ev.clientY - drag.dy) * k, 10, 250) + 'px'; });
  el.addEventListener('pointerup', () => { drag = null; }); el.addEventListener('pointercancel', () => { drag = null; });
});
$('save-case').addEventListener('click', () => {
  clearInterval(D.timer);
  CASE.forEach((c) => { c.isNew = false; });
  CASE.unshift({ r: recipe.id, when: 'Just now', min: Math.round((B.total - B.left) / 60), grade: B.grade, tops: D.placed.length, isNew: true });
  dismiss('case'); toast(`<span>Saved to your dessert case</span>`);
});
$('order-real').addEventListener('click', () => openShop(0, recipe.id));

/* ---------- nearby: order the real dessert ---------- */
let cart = {};
function openShop(i, want) {
  const s = SHOPS[i]; cart = {}; if (want && s.menu.some((m) => m[0] === want)) cart[want] = 1;
  const draw = () => {
    const total = s.menu.reduce((a, [id, , p]) => a + (cart[id] || 0) * p, 0), off = s.off === '10% off' ? total * .1 : 0;
    setHTML($('shop-body'), `<div class="stack">
      <div class="head-row"><span class="tile cut" style="background:${s.c}">${art(s.menu[0][0], 'class="art"')}</span><div class="grow"><h3 id="shop-title">${s.n}</h3><p class="t-subhead muted">${s.d} · ${s.walk} · pickup</p></div><span class="tag hi cut">${s.off}</span></div>
      ${s.menu.map(([id, n, p]) => `<div class="menu-item cut">${art(id)}<div class="grow"><p class="name">${n}</p><p class="p">${s.off === '10% off' ? `<s>$${p.toFixed(2)}</s>$${(p * .9).toFixed(2)}` : `$${p.toFixed(2)}`}</p></div><div class="stepper"><button type="button" data-m="${id}" data-d="-1" aria-label="One fewer ${n}">−</button><span>${cart[id] || 0}</span><button type="button" data-m="${id}" data-d="1" aria-label="One more ${n}">+</button></div></div>`).join('')}
      <div class="acts"><button class="btn soft cut" type="button" id="shop-close">Close</button><button class="btn cut" type="button" id="shop-order" ${total ? '' : 'disabled'}>${total ? `Order · $${(total - off).toFixed(2)}` : 'Add something'}</button></div></div>`);
    $('shop-close').onclick = () => closeSheet('sheet-shop');
    $('shop-order').onclick = () => { setHTML($('shop-body'), `<div class="stack center"><span class="done-mark cut">${ICON.tick.replace('width="12" height="10"', 'width="30" height="24"')}</span><h3>Order sent to ${s.n}</h3><p class="t-callout muted">Ready for pickup in about 10 minutes. This is a demo, so nothing was charged.</p><button class="btn cut" type="button" id="shop-done">Done</button></div>`); $('shop-done').onclick = () => closeSheet('sheet-shop'); };
  };
  $('shop-body').onclick = (e) => { const b = e.target.closest('[data-m]'); if (!b) return; cart[b.dataset.m] = Math.max(0, (cart[b.dataset.m] || 0) + +b.dataset.d); draw(); };
  draw(); openSheet('sheet-shop');
}
$('app').addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if ($('sheet-shop').classList.contains('on')) closeSheet('sheet-shop');
  else if ($('sheet-goal').classList.contains('on')) $('scrim').click();
});

renderTabs(); renderRecipes();
// Test hook, only with ?debug: move the oven timer forward.
if (/[?&]debug\b/.test(location.search)) window.__bake = (sec) => { B.left = Math.max(0, B.left - sec); B.last = performance.now(); tickBake(); };
