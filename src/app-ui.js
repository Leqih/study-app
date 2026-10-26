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
  { n: 'Mia', c: '#FFC4F8', d: 'Strawberry macaron', left: 18, subj: 'Calculus problem set' },
  { n: 'Jun', c: '#C9D5FA', d: 'Strawberry shortcake', left: 42, subj: 'Thesis draft' },
  { n: 'Ava', c: '#BCCBF9', d: 'Strawberry cupcake', left: 31, subj: 'Japanese N3 vocab' },
  { n: 'Sam', c: '#FFF07A', d: 'Latte', left: 6, subj: 'Reading notes' },
];
const ROOMS = [
  { n: 'Quiet library', s: 'No chat · cameras off', k: 12, f: ['Mia', 'Jun', 'Ava'], len: 25, left: 760 },
  { n: 'Exam sprint', s: '50-minute rounds', k: 34, f: ['Sam', 'Ava'], len: 50, left: 1860 },
  { n: 'Night owls', s: 'Open until 2 am', k: 8, f: ['Jun'], len: 25, left: 410 },
];
const SHOPS = [
  { n: 'Corner Patisserie', d: '350 m', walk: '4 min walk', off: '10% off', c: '#FFC4F8', x: 28, y: 36, menu: [['cupcake', 'Strawberry cupcake', 4.8], ['macaron', 'Strawberry macaron', 2.6], ['shortcake', 'Shortcake slice', 5.9]] },
  { n: 'Bloom Café', d: '600 m', walk: '8 min walk', off: '10% off', c: '#C9D5FA', x: 72, y: 26, menu: [['latte', 'Latte', 4.2], ['macaron', 'Macaron', 2.4]] },
  { n: 'Sugar & Co', d: '1.1 km', walk: '14 min walk', off: 'Free topping', c: '#FFF07A', x: 64, y: 78, menu: [['cupcake', 'Cupcake', 4.5], ['shortcake', 'Shortcake slice', 6.2]] },
];
// grace: seconds away before the bake starts to burn; null never burns (Gentle only counts exits,
// for people who haven't granted Screen Time access). Locking the screen never counts as leaving.
const LOCKS = [
  { t: 140, name: 'Gentle', d: 'Nothing locked', note: 'Nothing is locked. Leaving is only counted, never burns.', blocks: [], grace: null },
  { t: 160, name: 'Light', d: 'Video & games', note: 'Locks short video and games. Away for more than 60 s and it starts to burn.', blocks: ['video', 'games'], grace: 60 },
  { t: 180, name: 'Standard', d: '4 app types', note: 'Locks social, short video, games and shopping. Away for more than 20 s and it starts to burn.', blocks: ['social', 'video', 'games', 'shopping'], grace: 20 },
  { t: 220, name: 'Strict', d: 'All but tools', note: 'Only the tools you allow stay open. Opening anything else burns the bake.', blocks: ['social', 'video', 'games', 'shopping', 'messages'], grace: 0 },
];
// ?new shows the first day: no friends, no bakes, no streak
const NEW = /[?&]new\b/.test(location.search);
if (NEW) FRIENDS.length = 0;
// unfinished goals ride along to the next bake
let CARRY = NEW ? [] : ['Review chapter 4 notes'];
const PREFS = { notifyJoin: true, notifyDone: true, remind: false, haptics: true, goal: 120, restDay: true };
const APPS = [
  { id: 'social', n: 'Social', s: 'Instagram, WeChat Moments, X', c: '#FFC4F8', g: 'S' },
  { id: 'video', n: 'Short video', s: 'TikTok, Reels, Bilibili', c: '#C9D5FA', g: '▶' },
  { id: 'games', n: 'Games', s: 'Everything in the Games category', c: '#FFF07A', g: 'G' },
  { id: 'shopping', n: 'Shopping', s: 'Taobao, Amazon', c: '#BCCBF9', g: '$' },
  { id: 'messages', n: 'Messages', s: 'Calls from favourites still ring', c: '#E6DED6', g: '✉' },
];
const ALLOWED = ['Notes', 'Dictionary', 'Calculator', 'Music', 'Camera', 'Browser', 'Class chat'];
const SOUNDS = ['Oven hum', 'Rainy window', 'Café', 'Fireplace'];
const TOPPINGS = {
  strawberry: { n: 'Strawberry', svg: '<polygon points="15,27 5,13 9,6 21,6 25,13" fill="#FF4FC8"/><polygon points="15,27 15,6 21,6 25,13" fill="#E0389F"/><polygon points="9,6 15,2 21,6 15,9" fill="#8CA7F4"/><rect x="11" y="13" width="2" height="2" fill="#FFE600"/><rect x="17" y="17" width="2" height="2" fill="#FFE600"/>' },
  blueberry: { n: 'Blueberry', svg: '<polygon points="10,5 20,5 26,11 26,19 20,25 10,25 4,19 4,11" fill="#5A6BFF"/><polygon points="15,5 20,5 26,11 26,19 20,25 15,25" fill="#4152E0"/><polygon points="13,9 17,9 15,12" fill="#2A35A8"/>' },
  mint: { n: 'Mint', svg: '<polygon points="4,24 10,8 24,4 20,18" fill="#8CA7F4"/><polygon points="4,24 24,4 20,18" fill="#6F8DEB"/>' },
  gold: { n: 'Gold leaf', svg: '<polygon points="6,8 22,4 26,18 12,26 4,18" fill="#FFE600"/><polygon points="22,4 26,18 12,26" fill="#F2C400"/><polygon points="8,10 14,8 10,14" fill="#FFF7A8"/>' },
  sprinkles: { n: 'Sprinkles', svg: '<rect x="4" y="6" width="9" height="3" fill="#FF4FC8" transform="rotate(-20 8 7)"/><rect x="16" y="9" width="9" height="3" fill="#6F8DEB" transform="rotate(25 20 10)"/><rect x="7" y="17" width="9" height="3" fill="#FFE600" transform="rotate(10 11 18)"/><rect x="17" y="20" width="9" height="3" fill="#8CA7F4" transform="rotate(-30 21 21)"/>' },
  choc: { n: 'Choc chips', svg: '<polygon points="15,4 25,24 5,24" fill="#7A4A26"/><polygon points="15,4 25,24 15,24" fill="#5E3519"/>' },
};
const tip = (id) => `<svg viewBox="0 0 30 30" aria-hidden="true">${TOPPINGS[id].svg}</svg>`;
const ICON = {
  note: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18V5l11-2v13"/><path d="M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>',
  chev: '<svg class="chev" width="10" height="16" viewBox="0 0 10 16" aria-hidden="true"><path d="M2 2l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>',
  tick: '<svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true"><path d="M1 5l3.5 3.5L11 1" fill="none" stroke="#FFFFFF" stroke-width="2.4"/></svg>',
  lock: '<svg width="14" height="16" viewBox="0 0 18 20" aria-hidden="true"><path d="M3 9h12v10H3zM5.5 9V6a3.5 3.5 0 0 1 7 0v3" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>',
  plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
};
const art = (name, attrs = '') => `<svg viewBox="0 0 200 172" ${attrs} aria-hidden="true">${ART[name]}</svg>`;
const recipeById = (id) => RECIPES.find((r) => r.id === id);
const short = (n) => n.replace('Strawberry ', '').replace(/^./, (c) => c.toUpperCase());
// flat shapes on a 100 × 100 box: flowers are circles around a centre, stars and scallops are paths
const shPt = (r, a) => `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
const SHAPES = {
  scallop: () => { let d = ''; for (let i = 0; i < 14; i++) d += `${i ? '' : 'M' + shPt(42, 0)} A 10.5 10.5 0 0 1 ${shPt(42, ((i + 1) / 14) * 2 * Math.PI)} `; return `<path d="${d}Z"/>`; },
  star: () => `<path d="M${Array.from({ length: 16 }, (_, i) => shPt(i % 2 ? 34 : 50, (i / 16) * 2 * Math.PI - Math.PI / 2)).join(' L')}Z"/>`,
  ...Object.fromEntries([['flower6', 6, 28, 20], ['flower8', 8, 30, 17], ['flower12', 12, 34, 14]].map(([k, n, dist, pr]) => [k, () =>
    Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI - Math.PI / 2; return `<circle cx="${(50 + dist * Math.cos(a)).toFixed(2)}" cy="${(50 + dist * Math.sin(a)).toFixed(2)}" r="${pr}"/>`; }).join('') + `<circle cx="50" cy="50" r="${dist}"/>`])),
};
const shape = (k, fill) => `<svg class="sh" viewBox="0 0 100 100" aria-hidden="true"><g fill="${fill}">${SHAPES[k]()}</g></svg>`;
const SMILE = '<svg viewBox="0 0 42 42" aria-hidden="true"><circle cx="21" cy="21" r="20" fill="#8CA7F4"/><circle cx="15" cy="17" r="2.4" fill="#111113"/><circle cx="27" cy="17" r="2.4" fill="#111113"/><path d="M13 25c2.4 3.4 13.6 3.4 16 0" fill="none" stroke="#111113" stroke-width="2.4" stroke-linecap="round"/></svg>';
document.querySelectorAll('[data-shape]').forEach((el) => { el.innerHTML = el.dataset.shape === 'smile' ? SMILE : shape(el.dataset.shape, el.dataset.fill); });
// a segmented arc: n segments from angle a0 to a1, the first `done` in mint, the next one pink
function arcSegs(cx, cy, r, a0, a1, n, done, w, gap) {
  const span = (a1 - a0) / n, p = (a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  return Array.from({ length: n }, (_, i) => `<path d="M${p(a0 + (i + gap / 2) * span)} A ${r} ${r} 0 0 1 ${p(a0 + (i + 1 - gap / 2) * span)}" fill="none" stroke="${i < done ? '#8CA7F4' : i === done ? '#C349EE' : 'rgba(17,17,19,.1)'}" stroke-width="${w}" stroke-linecap="round"/>`).join('');
}
// one continuous half arc: a grey track, the done part in mint, a pink dot where today stands
function arcBar(cx, cy, r, frac, w) {
  const f = Math.max(0, Math.min(1, frac)), a = Math.PI + f * Math.PI, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
  const track = `<path d="M${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="rgba(17,17,19,.08)" stroke-width="${w}" stroke-linecap="round"/>`;
  const done = f > 0 ? `<path d="M${cx - r} ${cy} A ${r} ${r} 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}" fill="none" stroke="#8CA7F4" stroke-width="${w}" stroke-linecap="round"/>` : '';
  return track + done + `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${w / 2 + 2}" fill="#C349EE" stroke="#fff" stroke-width="3"/>`;
}
// Avatars: each person is one shape from a library of circle-like forms (sunbursts, wavy blobs, asterisks, dot
// rings, tulips, targets, daisies, cogs, diamond clusters, hearts, six-point stars…). Every shape is a flat solid
// colour; corners are rounded by stroking the shape in its own colour with round joins, and a white edge behind
// keeps overlapping shapes apart. Line-built shapes take the extra width `w` so their edge grows with them.
const polar = (f, n = 120) => 'M' + Array.from({ length: n }, (_, i) => { const t = i / n * 2 * Math.PI, r = f(t); return `${(50 + r * Math.cos(t)).toFixed(2)} ${(50 + r * Math.sin(t)).toFixed(2)}`; }).join(' L') + 'Z';
const starPts = (n, ro, ri, rot = -Math.PI / 2) => 'M' + Array.from({ length: n * 2 }, (_, i) => { const a = rot + i / (n * 2) * 2 * Math.PI, r = i % 2 ? ri : ro; return `${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`; }).join(' L') + 'Z';
const rays = (n, r0, r1, sw, w) => Array.from({ length: n }, (_, i) => { const a = i / n * 2 * Math.PI; return `<line x1="${(50 + r0 * Math.cos(a)).toFixed(1)}" y1="${(50 + r0 * Math.sin(a)).toFixed(1)}" x2="${(50 + r1 * Math.cos(a)).toFixed(1)}" y2="${(50 + r1 * Math.sin(a)).toFixed(1)}" stroke-width="${sw + w}" fill="none"/>`; }).join('');
const ringAt = (n, r, d) => Array.from({ length: n }, (_, i) => { const a = i / n * 2 * Math.PI; return `<circle cx="${(50 + r * Math.cos(a)).toFixed(1)}" cy="${(50 + r * Math.sin(a)).toFixed(1)}" r="${d}"/>`; }).join('');
const petals = (n, off, rx, ry, rot = 0) => Array.from({ length: n }, (_, i) => `<ellipse cx="50" cy="${50 - off}" rx="${rx}" ry="${ry}" transform="rotate(${rot + i * 360 / n} 50 50)"/>`).join('');
const AV_SHAPES = {
  sunburst: (w) => rays(16, 8, 42, 7, w),
  wavy: () => `<path d="${polar((t) => 38 + 6 * Math.sin(7 * t))}"/>`,
  asterisk: (w) => [0, 45, 90, 135].map((d) => `<line x1="10" y1="50" x2="90" y2="50" stroke-width="${15 + w}" transform="rotate(${d} 50 50)" fill="none"/>`).join(''),
  dotring: () => `<circle cx="50" cy="50" r="6"/>${ringAt(6, 17, 5)}${ringAt(12, 31, 4.6)}${ringAt(18, 44, 4)}`,
  tulip: () => '<path d="M14 12 H38 Q50 30 62 12 H86 V54 A36 36 0 0 1 14 54 Z"/>',
  target: (w) => [42, 31, 20].map((r) => `<circle cx="50" cy="50" r="${r}" fill="none" stroke-width="${6 + w}"/>`).join('') + '<circle cx="50" cy="50" r="6"/>',
  daisy: () => `${petals(4, 24, 9, 22, 45)}${ringAt(4, 26, 16)}<circle cx="50" cy="50" r="8" fill="#fff" stroke="none"/>`,
  snow: (w) => [0, 60, 120].map((d) => `<line x1="12" y1="50" x2="88" y2="50" stroke-width="${16 + w}" transform="rotate(${d + 90} 50 50)" fill="none"/>`).join(''),
  cog: () => `<path d="${polar((t) => 39 + 6 * Math.tanh(3 * Math.sin(10 * t)))}"/>`,
  diamonds: () => [[50, 24], [76, 50], [50, 76], [24, 50]].map(([x, y]) => `<rect x="${x - 11}" y="${y - 11}" width="22" height="22" transform="rotate(45 ${x} ${y})"/>`).join(''),
  blobring: () => `<path fill-rule="evenodd" d="${polar((t) => 38 + 6 * Math.sin(4 * t + .5) + 3 * Math.sin(3 * t))} M50 37 a13 13 0 1 0 .01 0Z"/>`,
  dots: () => [20, 50, 80].map((y) => [20, 50, 80].map((x) => `<circle cx="${x}" cy="${y}" r="10"/>`).join('')).join(''),
  pillow: () => '<path d="M12 12 Q50 24 88 12 Q76 50 88 88 Q50 76 12 88 Q24 50 12 12Z"/>',
  spark: () => '<path d="M8 8 Q50 34 92 8 Q66 50 92 92 Q50 66 8 92 Q34 50 8 8Z"/>',
  crossflower: () => `${petals(4, 26, 7, 20, 45)}${ringAt(4, 24, 17)}<circle cx="50" cy="50" r="18"/>`,
  petal12: () => `<path d="${starPts(12, 44, 22)}"/>`,
  petal8: () => petals(8, 22, 8, 22),
  scallopring: () => `<path fill-rule="evenodd" d="${polar((t) => 40 + 5 * Math.cos(10 * t))} M50 34 a16 16 0 1 0 .01 0Z"/>`,
  scallop: () => `<path d="${polar((t) => 41 + 4 * Math.abs(Math.cos(6 * t)))}"/>`,
  hourglass: () => '<path d="M16 14 H84 L56 50 L84 86 H16 L44 50 Z"/>',
  bowtie: () => '<path d="M14 16 V84 L50 56 L86 84 V16 L50 44 Z"/>',
  heart: () => '<path d="M50 86 C20 66 8 48 12 32 C16 16 38 12 50 28 C62 12 84 16 88 32 C92 48 80 66 50 86Z"/>',
  hexagram: () => `<path d="${starPts(6, 46, 26)}"/>`,
  star5: () => `<path d="${starPts(5, 46, 22)}"/>`,
  sun: (w) => `<circle cx="50" cy="50" r="22"/>${rays(12, 32, 43, 7, w)}`,
  clover: () => ringAt(4, 22, 20) + '<circle cx="50" cy="50" r="18"/>',
  sparkle: () => '<path d="M50 4 Q56 44 96 50 Q56 56 50 96 Q44 56 4 50 Q44 44 50 4Z"/>',
  flower6: () => SHAPES.flower6(), flower8: () => SHAPES.flower8(),
};
// solid colours only: the three brand colours, a lighter orchid and sky, and black
const AV_COLORS = ['#C349EE', '#8CA7F4', '#A9C24A', '#E3A6F7', '#6F8DEB', '#111113'];
const AV_OF = { Mia: ['wavy', 0], Jun: ['asterisk', 1], Ava: ['daisy', 2], Sam: ['tulip', 3], Noa: ['target', 4], Kai: ['dots', 2], Lin: ['heart', 0], Ivy: ['hexagram', 1], Ben: ['cog', 2] };
// yours is chosen in Me; it starts as a black eight-petal flower
const MY_SHAPE = { k: 'flower8', c: '#111113' };
function shapeSvg(k, c) {
  const g = AV_SHAPES[k] || AV_SHAPES.scallop, j = 'stroke-linejoin="round" stroke-linecap="round"';
  return `<svg class="sav" viewBox="-8 -8 116 116" width="100%" height="100%" aria-hidden="true"><g fill="#fff" stroke="#fff" stroke-width="17" ${j}>${g(10)}</g><g fill="${c}" stroke="${c}" stroke-width="7" ${j}>${g(0)}</g></svg>`;
}
function avatarSvg(n) {
  if (n === 'Leqi') return shapeSvg(MY_SHAPE.k, MY_SHAPE.c);
  const keys = Object.keys(AV_SHAPES), [k, c] = AV_OF[n] || [keys[n.charCodeAt(0) % keys.length], n.length % 3];
  return shapeSvg(k, AV_COLORS[c]);
}
const face = (n, cls = '') => `<span class="avatar ${cls}">${avatarSvg(n)}</span>`;
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
  renderTabs(); shownTab(t);
}
// what each tab does as it comes in: numbers count up, rows arrive one by one
function shownTab(t) {
  if (t === 'home') playHome();
  else if (t === 'rooms') playRooms();
  else if (t === 'case') { if (caseMode === 'board') renderBoard(); else stagger($('case-grid')); }
  else if (t === 'nearby') stagger($('shops'));
  else if (t === 'me') { stagger(document.querySelector('#s-me .stats')); stagger(document.querySelector('#s-me .list')); }
}
// and each pushed screen
function shown(id) {
  if (id === 'recipe') playRecipe();
}
function place(el, cls) { el.style.transition = 'none'; el.classList.remove('on', 'left', 'below'); if (cls) el.classList.add(cls); void el.offsetWidth; el.style.transition = ''; }
function present(id) {
  // a page opened from a tab (a room, say) closes underneath the new flow
  if (base === 'tab' && stack.length) { stack.forEach((p) => place(scr(p))); place(scr(tab), 'on'); }
  base = 'modal'; stack.length = 0; stack.push(id);
  const s = scr(id); place(s, 'below'); s.classList.remove('below'); s.classList.add('on');
  $('tabbar').classList.add('away'); shown(id);
}
function push(id) {
  const cur = scr(stack[stack.length - 1]); cur.classList.remove('on'); cur.classList.add('left');
  const s = scr(id); place(s); s.classList.add('on'); stack.push(id);
  const sc = s.querySelector('.scroll'); if (sc) sc.scrollTop = 0;
  shown(id);
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
  // one tap from Home: today's recipe with the saved lock and sounds, straight into the oven
  if (go === 'start') { pickRecipe('cupcake'); startBake(r_total(recipe), CARRY); }
  else if (go === 'pick') { present('recipe'); }
  else if (go === 'feed') { pickRecipe(g.dataset.r); present('recipe'); }
  else if (go === 'join') joinFriend(g.dataset.who || 'Mia');
  else if (go === 'invite') toast('<span>On iPhone this opens the share sheet with your invite link</span>');
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
if (NEW) CASE.length = 0;
let together = 'Mia';
const LEN = { 'Strawberry macaron': 25, 'Strawberry shortcake': 75, 'Strawberry cupcake': 50, Latte: 15 };
// joining skips setup: bake the friend's dessert for exactly the time they have left, side by side
function joinFriend(who) {
  const f = FRIENDS.find((x) => x.n === who) || { n: who, d: 'Strawberry macaron', left: 25 };
  together = f.n; P.together = true;
  recipe = RECIPES.find((r) => r.name === f.d) || recipeById('macaron'); renderRecipes();
  startBake(f.left, CARRY);
  toast(`<b>Joined ${esc(f.n)}</b><span>You’ll both finish in ${f.left} min</span>`);
}
const inviteRow = (s) => `<div class="row"><span class="tile success rounded">${ICON.plus}</span><span class="grow"><span class="t">Bake with a friend</span><span class="s">${s}</span></span><button class="btn soft small rounded" type="button" data-go="invite">Invite</button></div>`;
// friends as bubbles: each face in a ring that fills as their bake goes, minutes left on a tag, sizes and heights varied
let fbSel = '';
const FB_SIZE = [78, 62, 70, 58], FB_DY = [0, 22, 6, 28];
const friendBubble = (f, i) => { const p = Math.round((1 - f.left / (LEN[f.d] || 50)) * 100); return `<button class="fb${f.n === fbSel ? ' sel' : ''}" type="button" data-f="${f.n}" style="--p:${p};--sz:${FB_SIZE[i % 4]}px;--dy:${FB_DY[i % 4]}px" aria-label="${f.n}, ${f.left} minutes left"><span class="fring"><svg class="ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47" fill="none" stroke="rgba(17,17,19,.08)" stroke-width="4"/><circle cx="50" cy="50" r="47" fill="none" stroke="#8CA7F4" stroke-width="4" stroke-linecap="round" pathLength="100" stroke-dasharray="${p} 100" transform="rotate(-90 50 50)"/></svg>${face(f.n)}</span><span class="fbm"><b data-to="${f.left}">${f.left}</b>m</span><span class="fbn">${f.n}</span></button>`; };

// the panel under the bubbles: what they're studying, how far along, and join or cheer
function friendPanel() {
  const f = FRIENDS.find((x) => x.n === fbSel);
  if (!f) return `<p class="fp-hint">Tap a friend to see what they’re working on</p>`;
  const p = Math.round((1 - f.left / (LEN[f.d] || 50)) * 100), room = ROOMS.find((r) => r.f.includes(f.n));
  return `<div class="fp">${face(f.n)}<div class="grow"><b>${f.n}</b><span>${f.subj || f.d}</span></div><span class="fp-min"><b>${f.left}</b> min left</span></div>
    <span class="fp-bar"><i style="width:${p}%"></i></span><p class="fp-s">${f.d}${room ? ` · ${room.n}` : ''}</p>
    <div class="fp-acts"><button class="btn soft small rounded" type="button" data-cheer="${f.n}"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.4h2c.7-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>Cheer</button><button class="btn small rounded" type="button" data-go="join" data-who="${f.n}">Join · ${f.left} min</button></div>`;
}
// a room: name, rules, who's in it in their shapes, the live count in a scallop, and join
const ROOM_SH = [['scallop', '#F3DDFC'], ['flower8', '#E3E9FD'], ['star', '#DDEB9E']];
// a room card: the table scene, then this round's clock and who's in, then one button
function roomCard(r, i) {
  const who = FRIENDS.find((f) => r.f.includes(f.n)), p = 1 - r.left / (r.len * 60);
  return `<div class="rm-slot"><div class="rm-card" data-card="${i}" role="button" tabindex="0" aria-expanded="false" aria-label="${r.n}, ${r.k} baking">
    <div class="rm-head"><div><h3>${r.n}</h3><p class="rm-s">${r.s}</p></div><span class="cnt"><b>${r.k}</b> here</span></div>
    ${roomTable(r, i)}
    <div class="rm-round"><div><p class="lbl">Round ends in</p><p class="tclock">${mmss(r.left)}</p></div><p class="sm"><b>${r.f.length}</b> ${r.f.length > 1 ? 'friends' : 'friend'} · +${r.k - r.f.length} bakers<br>${r.len}-min rounds</p></div>
    <span class="rbar"><i style="width:${(p * 100).toFixed(1)}%"></i></span>
    <div class="rm-more"><div>${roomMore(r, i)}</div></div>
    <button class="btn rounded rm-join" type="button" data-seat="${i}" data-who="${r.f[0]}">${who ? `Pull up a stool · ${who.left} min with ${who.n}` : 'Pull up a stool'}</button></div></div>`;
}
// what a card shows when it's opened: who's at the table and on what, the room's rules, and the way into the room
const OTHER_SUBJ = { Noa: 'Organic chemistry', Kai: 'Portfolio review', Lin: 'Piano theory', Ivy: 'Essay outline', Ben: 'SQL practice' };
function roomMore(r, i) {
  const people = [...r.f, ...['Noa', 'Kai', 'Lin', 'Ivy', 'Ben'].filter((n) => !r.f.includes(n))].slice(0, 3);
  const subj = (n) => (FRIENDS.find((f) => f.n === n) || {}).subj || OTHER_SUBJ[n] || 'Studying';
  return `<p class="mh">At the table</p>${people.map((n) => `<div class="mrow">${face(n)}<span class="grow"><b>${n}</b><span>${subj(n)}</span></span>${r.f.includes(n) ? '<span class="tag brand">Friend</span>' : ''}</div>`).join('')}
    <div class="chips mchips">${r.s.split(' · ').map((x) => `<span class="chip rounded">${x}</span>`).join('')}<span class="chip rounded">${LOCKS[P.lock].name} lock</span></div>
    <button class="mopen" type="button" data-go="room" data-i="${i}">Open the room${ICON.chev}</button>`;
}
// a chef's toque: three puffs over a band; `ghost` is the dashed one waiting on your seat
const toque = (ghost) => ghost
  ? '<svg class="toque ghost" viewBox="0 0 30 24" aria-hidden="true"><path d="M8 21v-6a5 5 0 0 1-1.6-9.7A6 6 0 0 1 15 3a6 6 0 0 1 8.6 2.3A5 5 0 0 1 22 15v6z" fill="#F3DDFC" stroke="#C349EE" stroke-width="1.4" stroke-dasharray="2.4 2"/></svg>'
  : '<svg class="toque" viewBox="0 0 30 24" aria-hidden="true"><path d="M8 21v-6a5 5 0 0 1-1.6-9.7A6 6 0 0 1 15 3a6 6 0 0 1 8.6 2.3A5 5 0 0 1 22 15v6z" fill="#fff" stroke="#DCDCE4" stroke-width="1"/><path d="M8 15c3 1.6 11 1.6 14 0v1.2c-3 1.6-11 1.6-14 0z" fill="#E9E9EF"/><path d="M8 17h14v4H8z" fill="#EFEFF4"/><path d="M11 8.5c.6-2 2.4-3.2 4.3-3.2" stroke="#E9E9EF" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>';
// the table scene, seen from the front: people sit behind the table with the tabletop hiding their lower half,
// the room's dessert stands on a cake stand in the middle, the cloth hangs down with a scalloped hem, two legs, a soft floor shadow
const TABLE_TC = ['#F3DDFC', '#E3E9FD', '#EBF6C9'], TABLE_EDGE = ['#E3A6F7', '#BCCBF9', '#DDEB9E'];
const SEATS = [26, 72, 196, 242];
function roomTable(r, i) {
  const people = [...r.f, ...['Noa', 'Kai', 'Lin', 'Ivy', 'Ben'].filter((n) => !r.f.includes(n))].slice(0, 3), dessert = ['macaron', 'shortcake', 'latte'][i % 3];
  const seat = (x, k) => k < 3
    ? `<span class="seat" style="left:${x}px;--tilt:${[-7, 5, -4][k]}deg"><span class="bob" style="--dl:${-k * .8}s">${toque()}${face(people[k])}</span></span>`
    : `<span class="seat empty" style="left:${x}px">${toque(true)}<span class="you">You</span></span>`;
  const hem = Array.from({ length: 12 }, (_, k) => `<circle cx="${11 + k * 22}" cy="0" r="11"/>`).join('');
  return `<div class="scene" style="--tc:${TABLE_TC[i % 3]};--te:${TABLE_EDGE[i % 3]}">${SEATS.map(seat).join('')}
    <span class="stand" aria-hidden="true">${art(dessert, 'class="dish"')}<i class="plate-t"></i><i class="stem"></i></span>
    <span class="tbl" aria-hidden="true"><i class="top"></i><i class="cloth"><svg viewBox="0 0 264 11" preserveAspectRatio="none" class="hem"><g style="fill:var(--tc)">${hem}</g></svg></i><i class="leg l"></i><i class="leg r"></i></span></div>`;
}
// taking a seat: your face flies from the button to the free seat, sits down, and the bake starts with the room
$('rooms').addEventListener('click', (e) => {
  const b = e.target.closest('[data-seat]'); if (!b) return; e.stopPropagation();
  const card = b.closest('.rm-card'), empty = card.querySelector('.seat.empty'); if (!empty) return;
  const app = $('app').getBoundingClientRect(), k = APP_W / app.width, from = b.getBoundingClientRect(), to = empty.getBoundingClientRect();
  const fly = document.createElement('span'); fly.className = 'flyer'; fly.innerHTML = avatarSvg('Leqi'); $('app').appendChild(fly);
  const x0 = (from.left + from.width / 2 - app.left) * k - 19, y0 = (from.top - app.top) * k - 10, x1 = (to.left - app.left) * k, y1 = (to.top - app.top) * k;
  fly.style.left = '0px'; fly.style.top = '0px';
  const land = () => { fly.remove(); empty.classList.remove('empty'); empty.classList.add('taken'); empty.innerHTML = `<span class="bob">${toque()}${face('Leqi')}</span>`; buzz([10, 30, 16]); setText(b, 'Tying your apron…'); setTimeout(() => joinFriend(b.dataset.who), 650); };
  if (reduced) { land(); return; }
  fly.animate([{ transform: `translate(${x0}px, ${y0}px) scale(.8)` }, { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 60}px) scale(1.15)`, offset: .5 }, { transform: `translate(${x1}px, ${y1}px) scale(1)` }],
    { duration: 650, easing: 'cubic-bezier(.3,.1,.3,1)', fill: 'forwards' }).onfinish = land;
}, true);
// tapping a card (not its button) opens or closes its details where it is
$('rooms').addEventListener('click', (e) => {
  if (e.target.closest('[data-go], [data-seat]')) return;
  const c = e.target.closest('.rm-card'); if (!c) return;
  const open = !c.classList.contains('open'); c.classList.toggle('open', open); c.setAttribute('aria-expanded', String(open)); buzz(6);
});
const RM_PITCH = 312;
function layoutRooms() {
  const c = $('rooms'), x = c.scrollLeft;
  c.querySelectorAll('.rm-card').forEach((el, i) => { const a = Math.min(1, Math.abs(i * RM_PITCH - x) / RM_PITCH); el.style.transform = `translateY(${a * 14}px) scale(${1 - a * .07})`; el.style.filter = a > .5 ? 'saturate(.6)' : ''; });
  const k = Math.round(x / RM_PITCH);
  $('room-dots').querySelectorAll('i').forEach((d, i) => d.classList.toggle('on', i === k));
}
$('rooms').addEventListener('scroll', layoutRooms, { passive: true });
// the focus board: a podium for the top three (first in the middle, tallest), then where you stand if you're not on it;
// switching Today / Week grows the blocks to their new heights and counts the hours
let leadP = 'week', myHours = { today: 0, week: 0 };
const LEAD = { week: [['Jun', 6.2], ['Mia', 4.1], ['Ava', 3.2], ['Sam', 1.5]], today: [['Jun', 1.5], ['Mia', .8], ['Ava', 1.2], ['Sam', .3]] };
const POD = [[1, 'second'], [0, 'first'], [2, 'third']];
function renderBoardWeek(myHrs, todayHrs) {
  if (myHrs !== undefined) myHours = { week: myHrs, today: todayHrs };
  const rows = [...LEAD[leadP].filter(([n]) => FRIENDS.some((f) => f.n === n)), ['Leqi', myHours[leadP]]].sort((a, b) => b[1] - a[1]);
  const top = Math.max(rows[0][1], .1), el = $('leaderboard');
  if (!el.querySelector('.podium')) el.innerHTML = `<div class="podium">${POD.map(([, c]) => `<div class="pcol ${c}"><span class="who"></span><span class="nm"></span><b data-to="0">0.0h</b><div class="blockp"><i></i></div></div>`).join('')}</div><div class="mine" id="mine"></div>`;
  POD.forEach(([rank, c]) => {
    const col = el.querySelector(`.pcol.${c}`), [n, h] = rows[rank] || ['', 0];
    const who = col.querySelector('.who');
    if (who.dataset.n !== n) { who.dataset.n = n; who.innerHTML = n ? face(n) : ''; who.classList.remove('swap'); void who.offsetWidth; who.classList.add('swap'); }
    col.classList.toggle('me', n === 'Leqi');
    col.querySelector('.nm').textContent = n === 'Leqi' ? 'You' : n;
    const num = col.querySelector('[data-to]'); num.dataset.to = h; roll(num, h, (v) => `${v.toFixed(1)}h`, 700);
    col.querySelector('.blockp').style.height = `${Math.round(34 + (h / top) * 58)}px`;
    col.querySelector('.blockp i').textContent = rank + 1;
  });
  const mi = rows.findIndex(([n]) => n === 'Leqi'), ahead = rows[mi - 1];
  setHTML($('mine'), mi > 2 ? `<span class="rk">#${mi + 1}</span>${face('Leqi')}<span class="grow"><b>You</b><span>${(ahead[1] - rows[mi][1]).toFixed(1)}h behind ${ahead[0]}</span></span><b class="hrs">${rows[mi][1].toFixed(1)}h</b>`
    : `<span class="grow"><b>You’re #${mi + 1}</b><span>${mi ? `${(ahead[1] - rows[mi][1]).toFixed(1)}h to pass ${ahead[0]}` : 'Top of the board. Keep the oven warm.'}</span></span>`);
}
$('lead-mode').addEventListener('click', (e) => {
  const b = e.target.closest('[data-p]'); if (!b || b.dataset.p === leadP) return;
  leadP = b.dataset.p; buzz(8);
  $('lead-mode').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.p === leadP)));
  renderBoardWeek();
});
// while Rooms is open, someone sits down every so often and that room's count ticks up
const NEWCOMERS = ['Noa', 'Kai', 'Lin', 'Ivy', 'Ben'];
let liveTimer = null, roomClock = null;

/* ---------- today's baking schedule: planned and live bakes on a timeline, join one or plan your own ---------- */
// hours are counted from midnight; the lanes start an hour before now and run nine hours, 80 pt an hour
const HOUR_W = 80, nowH = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
const SCH_BG = { 0: '#F3DDFC', 1: '#E3E9FD', 2: '#EBF6C9', 3: '#FBE4F7' };
const t0 = Math.floor(nowH());
// each bake: who leads it, what, when (hours), how long (min), lane, who's going, and the room if it's a room's round
const SCHED = [
  [{ who: 'Mia', label: 'Calculus', at: t0 - .35, len: 50, lane: 0, with: ['Mia', 'Lin'] },
   { who: 'Jun', label: 'Exam sprint', at: t0 - .1, len: 100, lane: 1, with: ['Jun', 'Ivy', 'Sam'], room: 1 },
   { who: 'Ava', label: 'Japanese', at: t0 + 1.25, len: 50, lane: 2, with: ['Ava'] },
   { who: 'Sam', label: 'Reading', at: t0 + 2.4, len: 25, lane: 0, with: ['Sam', 'Ben'] },
   { who: 'Ivy', label: 'Night owls', at: t0 + 4.1, len: 75, lane: 1, with: ['Ivy', 'Jun'], room: 2 }],
  [{ who: 'Mia', label: 'Group revision', at: 15, len: 75, lane: 0, with: ['Mia', 'Ava', 'Jun'] }, { who: 'Jun', label: 'Thesis', at: 19.5, len: 50, lane: 1, with: ['Jun'] }],
  [{ who: 'Ava', label: 'Japanese', at: 16, len: 50, lane: 0, with: ['Ava', 'Sam'] }],
  [], [],
];
const SCH = { day: 0, sel: 1, plan: null };
const dayStart = () => SCH.day ? 9 : t0 - 1;
const hhmm = (h) => `${Math.floor(h) % 24}:${String(Math.round((h % 1) * 60) % 60).padStart(2, '0')}`;
const isLive = (e) => SCH.day === 0 && e.at <= nowH() && nowH() < e.at + e.len / 60;
function schedDays() {
  const d = new Date();
  return Array.from({ length: 5 }, (_, i) => { const x = new Date(d.getTime() + i * 864e5); return `<button type="button" data-day="${i}" class="${i === SCH.day ? 'on' : ''}"><b>${x.getDate()}</b>${i ? x.toLocaleDateString('en-US', { weekday: 'short' }) : 'Today'}</button>`; }).join('');
}
function schedLanes() {
  const s0 = dayStart(), now = nowH(), all = schedEvents();
  return `<div class="sch-hours">${Array.from({ length: 9 }, (_, i) => `<span>${(s0 + i) % 24}:00</span>`).join('')}</div>`
    + (SCH.day ? '' : `<span class="sch-now" style="left:${(now - s0) * HOUR_W}px"></span>`)
    + all.map((e, i) => `<button type="button" class="sch-ev ${e.plan ? 'plan' : ''} ${i === SCH.sel ? 'sel' : ''} ${isLive(e) ? 'live' : ''} ${e.with?.includes('Leqi') ? 'going' : ''}" data-ev="${i}" style="left:${(e.at - s0) * HOUR_W}px;top:${24 + e.lane * 48}px;width:${Math.max(140, e.len / 60 * HOUR_W)}px;${e.plan ? '' : `background:${SCH_BG[e.lane % 4]}`}">${e.plan ? '<span class="pl">＋ Plan a bake</span>' : `${face(e.who)}<span>${esc(e.label)} <small>${e.len}m</small></span>`}</button>`).join('');
}
// the day's bakes plus one free slot to plan in (on the third lane, a couple of hours out), wherever it fits
function schedEvents() { const list = SCHED[SCH.day], s0 = SCH.day ? 18 : Math.ceil(nowH() + 2.6); return list.some((e) => e.lane === 2 && Math.abs(e.at - s0) < 1) ? list : [...list, { plan: true, at: SCH.plan ? SCH.plan.at : s0, len: SCH.plan ? SCH.plan.len : 50, lane: 2 }]; }
function schedCard() {
  const e = schedEvents()[SCH.sel];
  if (!e) return `<p class="sch-empty">Nothing planned ${SCH.day ? 'that day' : 'yet'}. Tap “Plan a bake” to start one.</p>`;
  if (e.plan) {
    const pick = SCH.plan || { at: e.at, len: 50, who: [] };
    SCH.plan = pick;
    return `<div class="sch-plan"><b class="k">Plan a bake at ${hhmm(pick.at)}</b><p class="kk">Invite friends; they get a reminder 10 min before.</p>
      <div class="chips sch-chips">${[-1, 0, 1].map((d) => `<button type="button" class="chip rounded" data-pat="${pick.at + d}" aria-pressed="${!d}">${hhmm(pick.at + d)}</button>`).join('')}${[25, 50].map((l) => `<button type="button" class="chip rounded" data-plen="${l}" aria-pressed="${pick.len === l}">${l} min</button>`).join('')}</div>
      <div class="sch-who">${FRIENDS.map((f) => `<button type="button" data-inv="${f.n}" aria-pressed="${pick.who.includes(f.n)}">${face(f.n)}<span>${f.n}</span></button>`).join('')}</div>
      <div class="sch-acts"><button class="btn soft rounded m" type="button" data-sch="cancel">Not now</button><button class="btn rounded m" type="button" data-sch="send">${pick.who.length ? `Invite ${pick.who.length}` : 'Plan it'}</button></div></div>`;
  }
  const live = isLive(e), going = e.with.includes('Leqi');
  return `<div class="row sch-sum"><span class="faces sch-faces">${e.with.map((n) => face(n)).join('')}</span><div class="grow"><b class="k">${esc(e.label)}</b><p class="kk">${live ? '<b class="lv">Live</b> · started ' : 'Starts '}${hhmm(e.at)} · ${e.len} min · ${e.with.length} going</p></div></div>
    <div class="sch-acts">${live ? `<button class="btn soft rounded m" type="button" data-sch="remind">Remind me</button><button class="btn rounded m" type="button" data-sch="join">Join now · ${Math.max(1, Math.round(e.len - (nowH() - e.at) * 60))} min left</button>`
      : `<button class="btn soft rounded m" type="button" data-sch="remind">Remind me</button><button class="btn rounded m ${going ? 'in' : ''}" type="button" data-sch="in">${going ? 'You’re in ✓' : 'I’m in'}</button>`}</div>`;
}
function drawSched(scrollToNow) {
  const keepX = $('sch-wrap')?.scrollLeft || 0, list = SCHED[SCH.day], live = list.filter(isLive).length;
  setHTML($('live-hero'), `<div class="ach"><p class="k">Today’s bakes</p><span class="kk">${list.length} planned${live ? ` · ${live} live` : ''}</span></div>
    <div class="sch-days">${schedDays()}</div><div class="sch-wrap" id="sch-wrap"><div class="sch-lanes">${schedLanes()}</div></div><div class="sch-card" id="sch-card">${schedCard()}</div>`);
  // keep the timeline where it was, unless we're arriving or switching day
  if (scrollToNow) $('sch-wrap').scrollLeft = SCH.day ? 0 : Math.max(0, (nowH() - dayStart()) * HOUR_W - 60); else $('sch-wrap').scrollLeft = keepX;
}
function schedCardSwap() { const c = $('sch-card'); c.innerHTML = schedCard(); if (!reduced) c.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' }); }
$('live-hero').addEventListener('click', (e) => {
  const d = e.target.closest('[data-day]'), ev = e.target.closest('[data-ev]'), a = e.target.closest('[data-sch]');
  if (d) { SCH.day = +d.dataset.day; SCH.sel = 0; SCH.plan = null; buzz(6); drawSched(true); return; }
  if (ev) { const x = $('sch-wrap').scrollLeft; SCH.sel = +ev.dataset.ev; buzz(6); $('live-hero').querySelector('.sch-lanes').innerHTML = schedLanes(); $('sch-wrap').scrollLeft = x; schedCardSwap(); return; }
  const at = e.target.closest('[data-pat]'), ln = e.target.closest('[data-plen]'), inv = e.target.closest('[data-inv]');
  if (at) { SCH.plan.at = +at.dataset.pat; buzz(6); schedCardSwap(); return; }
  if (ln) { SCH.plan.len = +ln.dataset.plen; buzz(6); schedCardSwap(); return; }
  if (inv) { const w = SCH.plan.who, n = inv.dataset.inv; w.includes(n) ? w.splice(w.indexOf(n), 1) : w.push(n); buzz(6); schedCardSwap(); return; }
  if (!a) return;
  const act = a.dataset.sch, list = SCHED[SCH.day], cur = schedEvents()[SCH.sel];
  if (act === 'join') { const f = FRIENDS.find((x) => x.n === cur.who); if (f) joinFriend(f.n); else { together = cur.who; startBake(Math.max(5, Math.round(cur.len - (nowH() - cur.at) * 60)), CARRY); } }
  else if (act === 'remind') { buzz(8); toast(`<b>Reminder set</b><span>10 min before ${esc(cur.label)}${isLive(cur) ? '’s next round' : ` at ${hhmm(cur.at)}`}</span>`); }
  else if (act === 'in') { const i = cur.with.indexOf('Leqi'); if (i < 0) { cur.with.push('Leqi'); toast(`<b>You’re in</b><span>${esc(cur.label)} at ${hhmm(cur.at)} · we’ll remind you</span>`); } else cur.with.splice(i, 1); buzz([8, 20, 8]); drawSched(); }
  else if (act === 'cancel') { SCH.plan = null; SCH.sel = 0; drawSched(); }
  else if (act === 'send') {
    // the plan becomes a real bake on the timeline, with you and whoever you invited
    const pl = SCH.plan; list.push({ who: 'Leqi', label: 'Your bake', at: pl.at, len: pl.len, lane: 2, with: ['Leqi', ...pl.who] });
    SCH.plan = null; SCH.sel = list.length - 1; buzz([10, 30, 10]); drawSched();
    toast(`<b>${pl.who.length ? `Invited ${pl.who.join(', ')}` : 'Bake planned'}</b><span>${hhmm(pl.at)} · ${pl.len} min</span>`);
  }
});

// each room's round counts down in real seconds; a new round starts when it hits zero
function tickRooms() {
  if (tab !== 'rooms' || stack.length) { clearInterval(roomClock); roomClock = null; return; }
  const cards = $('rooms').querySelectorAll('.rm-card');
  ROOMS.forEach((r, i) => {
    r.left = r.left > 1 ? r.left - 1 : r.len * 60;
    const c = cards[i]; if (!c) return;
    setText(c.querySelector('.tclock'), mmss(r.left));
    c.querySelector('.rbar i').style.width = ((1 - r.left / (r.len * 60)) * 100).toFixed(1) + '%';
  });
}
function liveTick() {
  if (tab !== 'rooms' || stack.length) { clearInterval(liveTimer); liveTimer = null; return; }
  const i = Math.floor(Math.random() * ROOMS.length);
  ROOMS[i].k++;
  const card = $('rooms').querySelectorAll('.rm-card')[i];
  if (card) { const b = card.querySelector('.cnt b'); rolling.set(b, ROOMS[i].k - 1); roll(b, ROOMS[i].k); card.setAttribute('aria-label', `${ROOMS[i].n}, ${ROOMS[i].k} baking`); }
}
// tapping a bubble opens its panel (tap again to close); Cheer sends hearts up from their bubble
function hearts(el) {
  if (reduced) return;
  const [x, y] = centreOf(el);
  for (let k = 0; k < 7; k++) {
    const h = document.createElement('span'); h.className = 'heart';
    h.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.4h2c.7-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>';
    h.style.left = (x - 9) + 'px'; h.style.top = (y - 9) + 'px'; $('app').appendChild(h);
    const dx = (Math.random() - .5) * 70, up = 70 + Math.random() * 60;
    h.animate([{ transform: 'translate(0,0) scale(.4)', opacity: 1 }, { transform: `translate(${dx}px, ${-up}px) scale(${.8 + Math.random() * .5}) rotate(${dx / 3}deg)`, opacity: 0 }],
      { duration: 900 + Math.random() * 500, delay: k * 60, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'backwards' }).onfinish = () => h.remove();
  }
}
$('friends-all').addEventListener('click', (e) => {
  const c = e.target.closest('[data-cheer]');
  if (c) { const n = c.dataset.cheer; buzz([8, 20, 8]); toast(`<b>Cheer sent</b><span>${esc(n)} sees it when their round ends</span>`); hearts($('friends-all').querySelector(`.fb[data-f="${n}"] .fring`)); return; }
  const b = e.target.closest('.fb'); if (!b) return;
  fbSel = fbSel === b.dataset.f ? '' : b.dataset.f; buzz(8);
  $('friends-all').querySelectorAll('.fb').forEach((x) => x.classList.toggle('sel', x.dataset.f === fbSel));
  const panel = $('fpanel'); panel.firstElementChild.innerHTML = friendPanel(); panel.classList.toggle('open', !!fbSel);
  if (fbSel) { const bb = b.getBoundingClientRect(), pr = panel.getBoundingClientRect(); panel.style.setProperty('--ax', `${((bb.left + bb.width / 2 - pr.left) / pr.width * 100).toFixed(1)}%`); }
});
// arriving on Rooms: the live count counts up, cards and rows arrive, numbers and bars fill
function playRooms() {
  drawSched(true);
  layoutRooms(); stagger($('rooms'));
  stagger($('friends-all').querySelector('.bubbles')); stagger($('leaderboard'));
  $('leaderboard').querySelectorAll('.pcol .blockp').forEach((i) => { const h = i.style.height; i.style.transition = 'none'; i.style.height = '0'; void i.offsetWidth; i.style.transition = ''; i.style.height = h; });
  $('friends-all').querySelectorAll('[data-to]').forEach((b) => { rolling.set(b, 0); roll(b, +b.dataset.to); });
  $('leaderboard').querySelectorAll('[data-to]').forEach((b) => { rolling.set(b, 0); roll(b, +b.dataset.to, (v) => `${v.toFixed(1)}h`); });
  clearInterval(liveTimer); liveTimer = setInterval(liveTick, 9000);
  clearInterval(roomClock); roomClock = setInterval(tickRooms, 1000);
}
function renderTabs() {
  // Home: friends baking now, each face inside its own flat shape
  const frames = [['flower6', '#E3A6F7'], ['star', '#8CA7F4'], ['scallop', '#DDEB9E']];
  const more = FRIENDS.length - 3;
  setHTML($('friends'), (FRIENDS.slice(0, 3).map((f) => `<span class="frame pat">${face(f.n)}</span>`).join('') + (more > 0 ? `<span class="frame more"><span>+${more}</span></span>` : '')) || `<span class="frame">${shape('flower6', '#F2F2F4')}<span>+</span></span>`);
  roll($('friends-n'), FRIENDS.length);
  const last = CASE[0];
  // the last dessert: what it was and how it came out, the whole block opens the case
  setHTML($('recent'), last ? `<span class="badge">${shape('star', '#8CA7F4')}${art(last.r, 'class="art"')}</span><span class="g"><span class="kk">Recently baked · ${last.when}</span><b>${recipeById(last.r).name}</b></span><span class="pill mint">${last.min} min</span>${ICON.chev}`
    : '<span class="g"><span class="kk">Recently baked</span><b>Your first dessert shows up here</b></span>');
  setText($('me-case'), CASE.length ? `${CASE.length} desserts so far` : 'Nothing baked yet');
  setHTML($('friends-all'), FRIENDS.length ? `<div class="bubbles">${FRIENDS.map(friendBubble).join('')}</div><div class="fpanel${fbSel ? ' open' : ''}" id="fpanel"><div>${friendPanel()}</div></div>` : inviteRow('Nobody here yet. Invite a classmate.'));
  setText($('friends-count'), FRIENDS.length ? `${FRIENDS.length} in the oven` : '');
  setHTML($('rooms'), ROOMS.map(roomCard).join(''));
  setHTML($('room-dots'), ROOMS.map(() => '<i></i>').join(''));
  setHTML($('case-grid'), CASE.length ? CASE.map((c, i) => `<button type="button" data-go="case" data-i="${i}" class="case-item rounded ${c.isNew ? 'new' : ''}"><div class="art">${art(c.r)}</div><p class="t">${recipeById(c.r).name}</p><p class="s">${c.when} · ${c.min} min · ${c.tops} toppings</p><span><span class="tag hi rounded">${c.grade}</span></span></button>`).join('')
    : `<div class="empty-card rounded">${art('cupcake')}<p class="t">Your first dessert lands here</p><p class="s">Every bake you finish is kept in the case, burnt ones too.</p></div>`);
  setText($('case-sub'), CASE.length ? `${CASE.length} desserts · ${(CASE.reduce((a, c) => a + c.min, 0) / 60).toFixed(1)} h of focus` : 'Nothing baked yet');
  setHTML($('shops'), SHOPS.map((s, i) => `<button class="row" type="button" data-go="shop" data-i="${i}"><span class="tile rounded" style="background:${s.c}">${art(s.menu[0][0], 'class="art"')}</span><span class="grow"><span class="t">${s.n}</span><span class="s">${s.d} · ${s.walk}</span></span><span class="tag hi rounded">${s.off}</span>${ICON.chev}</button>`).join(''));
  setHTML($('map'), `<span class="pin me" style="left:48%;top:56%"></span>` + SHOPS.map((s, i) => `<span class="pin" style="left:${s.x}%;top:${s.y}%"><svg viewBox="0 0 30 36" width="30" height="36"><polygon points="4,0 26,0 30,4 30,22 15,36 0,22 0,4" fill="#10131A"/><polygon points="9,7 21,7 23,9 23,17 21,19 9,19 7,17 7,9" fill="${s.c}"/></svg></span>`).join(''));
  // the week as minutes per day; every number on Home and Me is summed from it
  // each bake is [recipe, minutes]; today's come from the case, so a joined 18-minute bake counts as 18
  const today = CASE.filter((c) => c.when === 'Just now').map((c) => [c.r, c.min]);
  const past = NEW ? [[], [], [], [], []] : [[['cupcake', 50], ['latte', 15]], [['macaron', 25]], [['latte', 15]], [['macaron', 25]], [['cupcake', 50]]];
  const WEEK = [...['M', 'T', 'W', 'T', 'F'].map((d, i) => [d, past[i]]), ['S', today, true], ['S', []]];
  const mins = (list) => list.reduce((a, b) => a + b[1], 0);
  const week = WEEK.reduce((a, d) => a + d[1].length, 0), hrs = WEEK.reduce((a, d) => a + mins(d[1]), 0) / 60;
  renderBoardWeek(+hrs.toFixed(1), +(mins(today) / 60).toFixed(1));
  setText($('me-bakes'), String(week)); setText($('me-hours'), hrs.toFixed(1) + 'h'); setText($('me-shut'), week ? '92%' : '–');
  // the week against a 5-hour goal as a tray of seven cookies: each fills from the bottom with that day's minutes,
  // a full cookie is a day that did its share (goal ÷ 7); the tray is the last seven days, so today is always the last cookie,
  // straight under the neck and today's big cookie in the greeting
  const weekGoal = 5, pct = Math.min(100, Math.round(hrs / weekGoal * 100)), on = Math.round(pct / 5);
  setText($('week-sum'), hrs >= weekGoal ? `${hrs.toFixed(1)} of ${weekGoal} h · done` : `${hrs.toFixed(1)} of ${weekGoal} h · ${(weekGoal - hrs).toFixed(1)} h to go`);
  roll($('week-pct'), pct, (v) => `${Math.round(v)}%`);
  const ti = WEEK.findIndex((d) => d[2]), share = weekGoal * 60 / 7;
  const last7 = [...WEEK.slice(ti + 1).map((d) => [d[0], []]), ...WEEK.slice(0, ti + 1)];
  setHTML($('ticks'), last7.map((d, i) => {
    const f = Math.min(1, mins(d[1]) / share), h = (f * 100).toFixed(1), id = `ck${i}`;
    return `<span class="${i === 6 ? 'now' : ''}${f >= 1 ? ' full' : ''}"><svg viewBox="0 0 100 100"><defs><clipPath id="${id}">${SHAPES.flower6()}</clipPath></defs>`
      + `<g clip-path="url(#${id})"><rect width="100" height="100" class="e"/><rect y="${100 - h}" width="100" height="${h}" class="f"/></g></svg><small>${d[0]}</small></span>`;
  }).join(''));
  // today: focus against a daily goal, and the streak of days with at least one bake
  const todayMin = mins(today), goal = PREFS.goal;
  roll($('today-min'), todayMin);
  setHTML($('gauge-arc'), arcBar(70, 68, 60, todayMin / goal, 10));
  setText($('today-hint'), todayMin >= goal ? 'Goal reached' : `${goal - todayMin} min to go`);
  const streak = (NEW ? 0 : 5) + (today.length ? 1 : 0);
  setText($('streak-n'), String(streak));
  setText($('streak-hint'), today.length ? 'kept today' : !streak ? 'first bake starts it' : PREFS.restDay ? 'bake today or rest' : 'bake today');
  setText($('goal-of'), `Goal ${goal} min`);
  // the greeting follows today's progress, not just whether a bake happened
  setText($('hello-sub'), todayMin >= goal ? 'goal reached.' : todayMin ? 'keep it going.' : 'ready to bake?');
  // today in three numbers, like a daily focus report: score weighted by minutes, minutes with the phone down, times you left
  const todayBakes = CASE.filter((c) => c.when === 'Just now');
  const scored = todayBakes.reduce((a, c) => [a[0] + (c.score ?? 100) * c.min, a[1] + c.min], [0, 0]);
  if (scored[1]) roll($('ts-score'), Math.round(scored[0] / scored[1])); else setText($('ts-score'), '–');
  roll($('ts-free'), todayMin, (v) => { v = Math.round(v); return v >= 60 ? `${Math.floor(v / 60)}h ${v % 60}m` : `${v}m`; });
  setText($('ts-exits'), String(todayBakes.reduce((a, c) => a + (c.exits || 0), 0)));
  // today's cookie, large: the same shape as today's cookie in the week tray below, sitting right over the neck that joins them
  const tf = Math.min(1, todayMin / share), th = (tf * 100).toFixed(1);
  setHTML($('today-ck'), `<svg viewBox="0 0 100 100"><defs><clipPath id="ck-today">${SHAPES.flower6()}</clipPath></defs><g clip-path="url(#ck-today)"><rect width="100" height="100" class="e"/><rect y="${100 - th}" width="100" height="${th}" class="f"/></g></svg>`);
}

// arriving on Home: the greeting comes into focus, numbers count up from zero and every cookie fills from empty
function playHome() {
  rewind($('ts-free'), $('ts-score'), $('week-pct'), $('today-min'), $('friends-n'));
  renderTabs();
  blurIn(document.querySelector('#s-home .hello p'));
  if (reduced) return;
  const fills = document.querySelectorAll('#s-home .f');
  fills.forEach((r) => { r.style.transition = 'none'; r.style.y = '100px'; r.style.height = '0px'; });
  requestAnimationFrame(() => requestAnimationFrame(() => fills.forEach((r, i) => { r.style.transition = ''; r.style.transitionDelay = (.25 + i * .06) + 's'; r.style.y = ''; r.style.height = ''; })));
}

/* ---------- 1. recipe ---------- */
let recipe = recipeById('cupcake');
// each dessert's stamp colour
const RCOL = { latte: '#E3E9FD', macaron: '#F3DDFC', cupcake: '#EBF6C9', shortcake: '#FBE4F7' };
const stampHTML = (id, attrs = '') => { const r = recipeById(id); return `<div class="stamp-w" ${attrs}><div class="stamp"><div class="pic" style="--c:${RCOL[id]}"><span class="val">${r.rounds * r.len} MIN</span>${art(id)}<div class="cap"><b>${r.name}</b><span>${r.rounds} × ${r.len} min · ${r.tool}</span></div></div></div></div>`; };
const PITCH = 216; // stamp width plus the gap
function pickRecipe(id, instant = true) {
  recipe = recipeById(id); renderRecipes();
  const i = RECIPES.indexOf(recipe), c = $('recipes');
  if (Math.round(c.scrollLeft / PITCH) !== i) c.scrollTo({ left: i * PITCH, behavior: instant ? 'instant' : 'smooth' });
  layoutCarousel();
}
// built once so the scroll position survives re-renders
setHTML($('recipes'), RECIPES.map((r) => `<div class="slotc">${stampHTML(r.id, `role="radio" tabindex="0" aria-checked="false" data-r="${r.id}" aria-label="${r.name}, ${r.rounds} × ${r.len} min"`)}</div>`).join(''));
setHTML($('names'), RECIPES.map((r) => `<span>${short(r.name)}</span>`).join(''));
function renderRecipes() {
  document.querySelectorAll('#recipes [data-r]').forEach((b) => { b.setAttribute('aria-checked', String(b.dataset.r === recipe.id)); if (b.dataset.r !== recipe.id) b.classList.remove('lifted'); });
  setText($('recipe-go'), `Start · ${r_total(recipe)} min`);
  setHTML($('recipe-meta'), `${recipe.order ? '<span class="tag brand">Today’s order</span>' : ''}<span>${recipe.tool} · ${recipe.type}</span>`);
  renderRoute();
}
// the session this recipe makes, as a route: bake stops, break stops, and the dessert at the end
function renderRoute(play) {
  const parts = [];
  for (let k = 0; k < recipe.rounds; k++) { if (k) parts.push(['break', 5]); parts.push(['bake', recipe.len]); }
  parts.push(['break', 5]); parts.push(['end', 0]);
  const all = parts.reduce((a, q) => a + q[1], 0), n = parts.length, W = 338;
  const pts = parts.map((_, i) => [18 + i * (W - 36) / (n - 1), i % 2 ? 38 : 72]);
  // a smooth line through every stop
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < n; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], mx = (x0 + x1) / 2; d += ` C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`; }
  const stops = parts.map(([k, m], i) => {
    const [x, y] = pts[i], label = k === 'bake' ? 'Bake' : k === 'break' ? 'Break' : short(recipe.name);
    const body = k === 'bake' ? `<g transform="translate(${x - 17} ${y - 17}) scale(.34)" fill="#fff">${SHAPES.scallop()}</g><text class="n" x="${x}" y="${y + 4}" text-anchor="middle">${m}</text>`
      : k === 'break' ? `<g transform="translate(${x - 10} ${y - 10}) scale(.2)" fill="#fff" opacity=".8">${SHAPES.flower6()}</g>`
      : `<circle cx="${x}" cy="${y}" r="21" fill="#fff"/><svg x="${x - 16}" y="${y - 14}" width="32" height="28" viewBox="0 0 200 172">${ART[recipe.id]}</svg>`;
    return `<g class="stop" style="--i:${i}">${body}<text x="${x}" y="${i % 2 ? y - 16 : y + (k === 'end' ? 36 : 30)}" text-anchor="middle">${label}${k === 'break' ? ' 5' : ''}</text></g>`;
  }).join('');
  setHTML($('route'), `<div class="rh"><b>Your session</b><span>${r_total(recipe)} min focus · ${all} min in all</span></div><svg viewBox="0 0 ${W} 112" aria-hidden="true"><path class="line" pathLength="1" d="${d}"/>${stops}</svg>`);
  if (play !== false) { const r = $('route'); r.classList.remove('play'); void r.offsetWidth; r.classList.add('play'); }
}
// the stamp in the middle is full size and straight; the others shrink, tilt and fade, and the names slide with them
function layoutCarousel() {
  const c = $('recipes'), x = c.scrollLeft;
  c.querySelectorAll('.stamp-w').forEach((el, i) => {
    const dd = (i * PITCH - x) / PITCH, a = Math.min(1, Math.abs(dd));
    if (!el.classList.contains('lifted')) el.style.transform = `translateY(${a * 16}px) scale(${1 - a * .16}) rotate(${(dd * 7).toFixed(2)}deg)`;
    el.style.opacity = String(1 - a * .35);
  });
  $('names').style.transform = `translateX(${APP_W / 2 - PITCH / 2 - x}px)`;
  $('names').querySelectorAll('span').forEach((el, i) => { el.style.opacity = String(Math.max(.18, 1 - Math.abs(i * PITCH - x) / PITCH * .82)); });
}
let settle = null;
$('recipes').addEventListener('scroll', () => {
  layoutCarousel();
  clearTimeout(settle);
  settle = setTimeout(() => { const r = RECIPES[clamp(Math.round($('recipes').scrollLeft / PITCH), 0, RECIPES.length - 1)]; if (r !== recipe) { recipe = r; buzz(6); renderRecipes(); } }, 110);
}, { passive: true });
// tap the stamp in the middle to lift it and read it; tap another to bring it to the middle
$('recipes').addEventListener('click', (e) => {
  const b = e.target.closest('[data-r]'); if (!b) return;
  if (b.dataset.r === recipe.id) { b.classList.toggle('lifted'); buzz(8); layoutCarousel(); }
  else pickRecipe(b.dataset.r, false);
});
$('recipes').addEventListener('keydown', (e) => {
  const i = RECIPES.indexOf(recipe);
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); pickRecipe(RECIPES[clamp(i + (e.key === 'ArrowRight' ? 1 : -1), 0, RECIPES.length - 1)].id, false); }
});
function playRecipe() { requestAnimationFrame(() => { pickRecipe(recipe.id); blurIn($('recipe-h')); renderRoute(true); }); }
const r_total = (r) => r.rounds * r.len;
$('recipe-go').addEventListener('click', () => startBake(r_total(recipe), CARRY));
$('recipe-prep').addEventListener('click', () => { startPrep(); push('prep'); });


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
  items.forEach(([label, fn]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn soft rounded small'; b.textContent = label; b.onclick = fn; t.appendChild(b); });
}
function update() {
  const st = status(), all = st.weighed && st.cracked && st.whisked, m = minutes(), laps = Math.floor(S.turns);
  const bucket = Math.floor(S.grams / 100); if (S.pouring && bucket > S.lastBucket) buzz(6); S.lastBucket = bucket;
  [0, 1, 2].forEach((i) => { $('egg-' + i).hidden = S.scene !== 'crack'; $('egg-' + i).disabled = S.eggsUsed[i]; });

  SCENES.forEach((s, i) => {
    const el = $('tab-' + s), open = unlocked(s), ok = [st.weighed, st.cracked, st.whisked][i];
    el.setAttribute('aria-selected', String(S.scene === s)); el.setAttribute('aria-disabled', String(!open));
    setHTML(el, `${ok ? `<span class="tick rounded">${ICON.tick}</span>` : open ? `<span class="num rounded">${i + 1}</span>` : `<span class="num rounded">${ICON.lock}</span>`}${STEP_NAMES[i]}`);
  });
  const shown = S.pouring ? Math.round(S.grams / 10) : m; // counts up by the minute while pouring, then settles on 5s
  // the scale already shows the minutes poured, so the readout shows them against the recipe
  if (S.scene === 'pour') setHTML($('readout'), `<b>${shown} / ${RECIPE_G / 10} min</b><span>${Math.round(S.grams)} g${S.grams >= 100 ? ` · ${rounds(shown)} × 25 min` : ''}</span>`);
  else if (S.scene === 'crack') setHTML($('readout'), `<b>${S.goals.length} of 3</b><span>goals, one per egg</span>`);
  else setHTML($('readout'), `<b>${laps} of 3</b><span>laps</span>`);
  if (S.scene === 'crack') setHTML($('goal-rows'), [0, 1, 2].map((k) => S.goals[k]
    ? `<button class="goal-row rounded" type="button" data-k="${k}"><span class="n rounded">${k + 1}</span><span class="x">${esc(S.goals[k].text)}</span>${ICON.chev}</button>`
    : `<div class="goal-row empty rounded"><span class="n rounded">${k + 1}</span><span class="x">Crack an egg to add a goal</span></div>`).join(''));
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
  $('ideas').innerHTML = ideas.map((g) => `<button class="chip rounded" type="button">${esc(g)}</button>`).join('');
  $('ideas').querySelectorAll('button').forEach((b) => { b.onclick = () => { $('goal').value = b.textContent; $('goal-ok').disabled = false; $('goal').focus(); }; });
  openSheet('sheet-goal'); update();
  setTimeout(() => $('goal').focus({ preventScroll: true }), 300);
}
function askGoal(egg) {
  S.asking = { egg };
  openWrite({ title: `Egg ${S.goals.length + 1} is for…`, value: '', ideas: [...CARRY, ...IDEAS].filter((g) => !S.goals.some((x) => x.text === g)).slice(0, 3), alt: 'Put the egg back', ok: 'Add goal' });
}
function editGoal(k) {
  if (S.asking || S.crack) return;
  S.editing = k;
  openWrite({ title: `Goal ${k + 1}`, value: S.goals[k].text, ideas: [], alt: 'Remove goal', ok: 'Save' });
}
// typing a goal straight onto the bake, no egg needed
let addingToBake = false;
function addBakeGoal() {
  addingToBake = true;
  openWrite({ title: 'Add a goal', value: '', ideas: [...CARRY, ...IDEAS].filter((g) => !B.goals.some((x) => x.text === g)).slice(0, 3), alt: 'Cancel', ok: 'Add goal' });
}
function closeWrite() { S.asking = null; S.editing = null; addingToBake = false; $('goal').blur(); closeSheet('sheet-goal'); update(); }
$('goal').addEventListener('input', () => { $('goal-ok').disabled = !$('goal').value.trim(); });
$('sheet-goal').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $('goal').value.trim(); if (!text) return;
  if (addingToBake) { B.goals.push({ text, done: false }); buzz([10, 40, 10]); closeWrite(); renderBake(); return; }
  if (S.editing !== null) S.goals[S.editing].text = text;
  else if (S.asking) { S.goals.push({ text, egg: S.asking.egg }); buzz([10, 40, 10]); }
  closeWrite();
});
$('goal-alt').addEventListener('click', () => { if (addingToBake) closeWrite(); else if (S.editing !== null) removeGoal(S.editing); else if (S.asking) returnEgg(S.asking.egg); });
$('goal-rows').addEventListener('click', (e) => { const b = e.target.closest('.goal-row[data-k]'); if (b) editGoal(+b.dataset.k); });
function returnEgg(egg) {
  S.eggsUsed[egg] = false; S.yolks = S.yolks.filter((y) => y.egg !== egg);
  S.eggBack = { i: egg, x: CB.cx, y: CB.rimY - 30, t0: performance.now() };
  closeWrite();
}
function removeGoal(k) { const g = S.goals[k]; S.goals.splice(k, 1); S.done = false; returnEgg(g.egg); if (!S.goals.length && S.scene === 'whisk') goto('crack'); }
$('scrim').addEventListener('click', () => {
  const f = $('scrim').dataset.for;
  if (f === 'sheet-goal') { if (S.asking && !addingToBake) returnEgg(S.asking.egg); else closeWrite(); }
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
const P = { lock: 2, allowed: new Set(['Dictionary', 'Calculator', 'Music']), sounds: new Set(['Oven hum', 'Rainy window']), together: true };
function renderPreheat() {
  const L = LOCKS[P.lock];
  setHTML($('lock-opts'), LOCKS.map((l, i) => `<button class="lock-opt rounded" type="button" role="radio" aria-checked="${i === P.lock}" data-i="${i}"><b>${l.t}°</b><span>${l.name}</span><small>${l.d}</small></button>`).join(''));
  setText($('lock-note'), L.note);
  setHTML($('blocked'), APPS.map((a) => { const on = L.blocks.includes(a.id); return `<div class="row"><span class="tile rounded" style="background:${a.c}">${appIcon(a.id)}</span><span class="grow"><span class="t">${a.n}</span><span class="s">${a.s}</span></span><span class="switch rounded" role="switch" aria-checked="${on}" aria-label="${a.n} locked"></span></div>`; }).join(''));
  setHTML($('allowed'), ALLOWED.map((a) => `<button class="chip rounded" type="button" aria-pressed="${P.allowed.has(a)}" data-a="${esc(a)}">${esc(a)}</button>`).join('') + `<button class="chip white rounded" type="button" data-pick>${ICON.plus.replace(/20/g, '16')}Choose apps</button>`);
  setHTML($('sounds'), SOUNDS.map((a) => `<button class="chip rounded" type="button" aria-pressed="${P.sounds.has(a)}" data-s="${esc(a)}">${ICON.note}${esc(a)}</button>`).join(''));
  setHTML($('together-faces'), face(together) + face(together === 'Jun' ? 'Mia' : 'Jun'));
  $('together').setAttribute('aria-checked', String(P.together));
  setText($('lock-note'), L.note + ' Locking your screen never counts.');
  setText($('preheat-go'), `Close the door · bake ${minutes()} min`);
}
$('lock-opts').addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) { P.lock = +b.dataset.i; buzz(8); renderPreheat(); } });
$('allowed').addEventListener('click', (e) => { if (e.target.closest('[data-pick]')) { toast('<span>On iPhone this opens the Screen Time app picker</span>'); return; } const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a; P.allowed.has(a) ? P.allowed.delete(a) : P.allowed.add(a); renderPreheat(); });
$('sounds').addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (!b) return; const a = b.dataset.s; P.sounds.has(a) ? P.sounds.delete(a) : P.sounds.add(a); renderPreheat(); });
$('together').addEventListener('click', () => { P.together = !P.together; renderPreheat(); });
$('preheat-go').addEventListener('click', () => startBake());

/* ---------- 4. bake: the timer, with the door shut ---------- */
// Rounds are 25 min with a 5-min break between them. One pause of up to 2 min per bake doesn't count against you,
// and nothing you do during a break or a pause counts as leaving.
const ROUND = 1500, MID_BREAK = 300, PAUSE = 120;
const B = { total: 0, left: 0, speed: 60, timer: null, last: 0, exits: 0, burnt: false, early: false, goals: [], awayAt: 0, awayTimer: null, rest: 0, restKind: '', pauses: 1, roundsDone: 0 };
const SESSION_KEY = 'sweet-study-session-v1';
function saveBake() {
  if (!B.timer) return;
  try {
    const { timer, last, awayTimer, awayAt, ...state } = B;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ state, recipe: recipe.id, lock: P.lock, sounds: [...P.sounds], savedAt: Date.now() }));
  } catch (_) { /* Storage may be unavailable in private browsing. */ }
}
function clearSavedBake() { try { localStorage.removeItem(SESSION_KEY); } catch (_) {} }
async function restoreBake() {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (_) { clearSavedBake(); return; }
  if (!saved) return;
  const state = saved.state;
  if (!state || !recipeById(saved.recipe) || !Number.isFinite(state.total) || state.total <= 0 || !Number.isFinite(state.left) || state.left <= 0 || state.left > state.total || !Array.isArray(state.goals) || !state.goals.every(g => typeof g.text === 'string' && typeof g.done === 'boolean') || ![1, 60].includes(state.speed) || !Number.isFinite(state.rest) || state.rest < 0 || !Number.isInteger(state.roundsDone) || state.roundsDone < 0 || !LOCKS[saved.lock] || !Array.isArray(saved.sounds)) { clearSavedBake(); return; }
  const resume = await ask({ title: 'Resume your bake?', text: 'Your timer and goals were saved. Time while this page was closed does not count as focus time.', no: 'Discard bake', yes: 'Resume' });
  if (!resume) { clearSavedBake(); return; }
  recipe = recipeById(saved.recipe); P.lock = saved.lock; P.sounds = new Set(saved.sounds);
  startBake(state.total / 60, []);
  Object.assign(B, state, { awayAt: 0, last: performance.now() });
  renderBake();
}
window.addEventListener('pagehide', saveBake);
setTimeout(restoreBake, 1600);
function startBake(m = minutes(), goals = S.goals.map((g) => g.text)) {
  Object.assign(B, { total: m * 60, left: m * 60, exits: 0, burnt: false, early: false, goals: goals.map((text) => ({ text, done: false })), rest: 0, restKind: '', pauses: 1, roundsDone: 0 });
  const L = LOCKS[P.lock];
  $('oven-food').innerHTML = ART[recipe.id] || ART.cupcake;
  setText($('bake-dessert'), recipe.name);
  setText($('lock-name'), `${L.name} lock`);
  $('bake-sound').innerHTML = ICON.note + esc(P.sounds.size ? [...P.sounds][0] + (P.sounds.size > 1 ? ` +${P.sounds.size - 1}` : '') : 'No sound');
  $('bake-friends').hidden = !P.together; setText($('bake-friends'), `${together} and ${together === 'Jun' ? 'Mia' : 'Jun'} are baking too`);
  if (stack.length) push('bake'); else present('bake'); // from Home it slides up as its own flow
  buzz(20);
  B.last = performance.now(); clearInterval(B.timer); B.timer = setInterval(tickBake, 200);
  if (P.together) setTimeout(() => { if (B.timer && PREFS.notifyJoin) notify(`${together} joined your oven`, `Baking next to you in Quiet library`); }, 3500);
  renderBake();
}
function tickBake() {
  const now = performance.now(), dt = (now - B.last) / 1000 * B.speed; B.last = now;
  if (B.rest > 0) {
    B.rest -= dt;
    if (B.rest <= 0) {
      const was = B.restKind; B.rest = 0; B.restKind = ''; buzz([20, 40, 20]);
      toast(was === 'pause' ? '<span>Pause over. Back to it.</span>' : `<b>Round ${B.roundsDone + 1}</b><span>The door’s closed again</span>`);
    }
  } else {
    B.left -= dt;
    // a multi-round bake stops for a break at each round boundary
    if (B.left > 0 && B.total - B.left >= (B.roundsDone + 1) * ROUND) {
      B.roundsDone++; B.rest = MID_BREAK; B.restKind = 'break'; buzz([30, 60, 30]);
      toast(`<b>Round ${B.roundsDone} done</b><span>5-min break. Leaving is fine now.</span>`);
    }
  }
  if (B.left <= 0) { B.left = 0; finishBake(); }
  renderBake();
}
function renderBake() {
  const p = B.total ? 1 - B.left / B.total : 0, elapsed = B.total - B.left, resting = B.rest > 0;
  const roundLeft = Math.min(B.left, Math.max(0, (B.roundsDone + 1) * ROUND - elapsed));
  setText($('clock'), mmss(resting ? B.rest : roundLeft));
  setText($('clock-label'), resting ? (B.restKind === 'pause' ? 'Pause remaining' : 'Break remaining') : 'This round remaining');
  setText($('session-left'), `${mmss(B.left)} focus remaining overall · ring shows total progress`);
  $('clock').classList.toggle('resting', resting);
  const nr = Math.max(1, Math.ceil(B.total / ROUND)), r = Math.min(nr, Math.floor(elapsed / ROUND) + 1);
  setText($('bake-round'), `${resting && B.restKind === 'break' ? B.roundsDone : r} / ${nr}`);
  setText($('bake-hint'), resting ? (B.restKind === 'pause' ? 'Paused. It resumes on its own, and leaving doesn’t count.' : `Break before round ${B.roundsDone + 1}. Leaving is fine now.`) : 'Keep the door shut. Locking your screen is fine.');
  // one ring: a white track, the baked part in Hydrangea Sky (orchid during a break or pause), a knob where it stands now
  const R = 126, C = 2 * Math.PI * R, ang = -Math.PI / 2 + p * 2 * Math.PI, col = resting ? '#C349EE' : '#8CA7F4';
  setHTML($('segs'), `<circle cx="140" cy="140" r="${R}" fill="none" stroke="#fff" stroke-width="14"/>`
    + `<circle class="prog" cx="140" cy="140" r="${R}" fill="none" stroke="${col}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - p)).toFixed(1)}" transform="rotate(-90 140 140)"/>`
    + `<circle cx="${(140 + R * Math.cos(ang)).toFixed(1)}" cy="${(140 + R * Math.sin(ang)).toFixed(1)}" r="11" fill="${col}" stroke="#fff" stroke-width="4"/>`);
  // the plan: rounds and breaks as bars sized to their minutes; the current one fills as it goes
  const steps = []; for (let i = 0; i < nr; i++) { if (i) steps.push(['Break', 5]); steps.push(['Bake', Math.round(Math.min(ROUND, B.total - i * ROUND) / 60)]); }
  const cur = resting && B.restKind === 'break' ? 2 * B.roundsDone - 1 : 2 * (r - 1);
  const inRound = resting ? (B.restKind === 'break' ? 1 - B.rest / MID_BREAK : 0) : (elapsed - (r - 1) * ROUND) / Math.min(ROUND, B.total - (r - 1) * ROUND);
  setHTML($('plan-shapes'), steps.map(([k, m], i) => `<div class="${i === cur ? 'now' : i < cur ? 'past' : ''}" style="flex:${m}"><i>${i === cur ? `<b style="width:${Math.round(clamp(inRound, 0, 1) * 100)}%"></b>` : ''}</i><span>${k === 'Bake' ? `Bake ${m}` : m}</span></div>`).join(''));
  const s = .55 + .45 * Math.min(1, p / .55);
  $('oven-food').style.transform = `scale(${s.toFixed(3)})`;
  $('oven-food').style.filter = B.burnt ? 'brightness(.62) saturate(.7)' : p > .55 ? `brightness(${(1 - (p - .55) * .18).toFixed(3)})` : '';
  setText($('exit-count'), String(B.exits));
  const done = B.goals.filter((g) => g.done).length;
  setText($('goal-count'), `${done} / ${B.goals.length}`);
  setHTML($('bake-goals'), B.goals.map((g, i) => `<button class="gi ${g.done ? 'done' : ''}" type="button" role="checkbox" aria-checked="${g.done}" data-g="${i}"><span class="c">${g.done ? ICON.tick : ''}</span><span>${esc(g.text)}</span></button>`).join('')
    + (B.goals.length < 5 ? `<button class="gi add" type="button" data-add><span class="c">${ICON.plus}</span><span>Add a goal</span></button>` : ''));
  const pause = $('pause');
  setText(pause, B.restKind === 'break' ? 'Skip break' : B.restKind === 'pause' ? 'Resume' : B.pauses ? 'Pause · 2 min' : 'Pause used');
  pause.disabled = !resting && !B.pauses;
  setText($('speed'), B.speed === 1 ? 'Real time · 1×' : 'Demo · 60×');
  saveBake();
}
$('bake-goals').addEventListener('click', (e) => {
  if (e.target.closest('[data-add]')) { addBakeGoal(); return; }
  const b = e.target.closest('[data-g]'); if (!b) return; const g = B.goals[+b.dataset.g]; g.done = !g.done; if (g.done) buzz([10, 30, 10]); renderBake();
});
$('pause').addEventListener('click', () => {
  if (B.rest > 0) { B.rest = .001; return; } // skip the break, or resume early: the next tick ends it
  if (!B.pauses) return;
  B.pauses--; B.rest = PAUSE; B.restKind = 'pause'; buzz(12);
  toast('<b>Paused</b><span>Up to 2 min. Leaving doesn’t count.</span>'); renderBake();
});
$('speed').addEventListener('click', () => { B.speed = B.speed === 1 ? 60 : 1; toast(B.speed === 1 ? '<span>Real time</span>' : '<b>60×</b><span>Demo speed: a minute passes every second</span>'); renderBake(); });
$('emergency').addEventListener('click', () => ask({ title: 'End this bake early?', text: 'It comes out half-baked and goes in your case. Unfinished goals carry over.', no: 'Keep baking', yes: 'End it' }).then((y) => { if (y) { B.early = true; finishBake(); } }));
// Leaving the app is what the oven guards against. Locking the screen isn't leaving; only opening another app is.
// The demo button shows what happens; a real tab switch counts too.
function leave() {
  if (!B.timer) return;
  if (B.rest > 0) { toast(`<span>${B.restKind === 'pause' ? 'Paused' : 'On a break'}: leaving doesn’t count</span>`); return; }
  const g = LOCKS[P.lock].grace; let n = g;
  B.exits++; if (n === 0) B.burnt = true;
  setText($('away-h'), n === null ? 'Counted as an exit' : n ? `Your ${recipe.name.split(' ').pop()} is getting hot` : 'Strict lock: it’s burning');
  setHTML($('away-p'), n === null ? 'Gentle lock: nothing is locked and nothing burns. Come back when you’re ready.'
    : n ? `Come back within <b id="away-n">${n}</b> s or it starts to burn. Locking your screen doesn’t count, only opening other apps.`
    : 'Opening another app burns a strict bake. Locked apps stay shut until it’s done.');
  drawHomeScreen(); $('away').classList.add('on'); $('app').classList.add('darkbar'); buzz([40, 60, 40]);
  liveActivity('expanded'); setTimeout(() => { if ($('away').classList.contains('on')) liveActivity('compact'); }, 2600);
  clearInterval(B.awayTimer);
  B.awayTimer = setInterval(() => {
    if (!n) return; n--; setText($('away-n'), String(n));
    if (n === 0) { B.burnt = true; setText($('away-h'), 'Too late: it’s starting to burn'); buzz(80); liveActivity('expanded burnt'); }
  }, 1000);
  renderBake();
}
$('leave').addEventListener('click', leave);
$('away-back').addEventListener('click', () => { clearInterval(B.awayTimer); $('away').classList.remove('on'); $('app').classList.remove('darkbar'); liveActivity(''); toast(B.burnt ? '<span>Back, but the edges caught</span>' : `<span>Back in time. That was exit ${B.exits}.</span>`); renderBake(); });
document.addEventListener('visibilitychange', () => {
  if (!B.timer || B.rest > 0 || $('away').classList.contains('on')) return;
  if (document.hidden) B.awayAt = performance.now();
  else if (B.awayAt) {
    const secs = (performance.now() - B.awayAt) / 1000, g = LOCKS[P.lock].grace, burn = g !== null && secs > g;
    B.awayAt = 0; B.exits++; if (burn) B.burnt = true;
    toast(`<span>You were away ${Math.round(secs)} s${burn ? ', it started to burn' : ''}</span>`); renderBake();
  }
});
function finishBake() {
  clearSavedBake();
  clearInterval(B.timer); B.timer = null; B.rest = 0; B.restKind = '';
  CARRY = B.goals.filter((g) => !g.done).map((g) => g.text);
  buzz([30, 80, 30, 80, 60]);
  renderResult(); setTimeout(() => { push('result'); playResult(); }, 900);
}

/* ---------- 5. result ---------- */
let earned = [];
// 100 with the door shut, 12 off per exit, 50 if ended early, 20 if burnt
const bakeScore = () => B.burnt ? 20 : B.early ? 50 : Math.max(40, 100 - B.exits * 12);
let receiptNo = 426;
function renderResult() {
  const done = B.goals.filter((g) => g.done).length, mins = Math.round((B.total - B.left) / 60), nr = Math.max(1, Math.ceil(B.total / ROUND));
  const [k, h, p] = B.early ? ['OPENED EARLY', 'Half-baked', 'Still gooey in the middle. You can bake again any time.']
    : B.burnt ? ['A BIT TOO LONG AWAY', 'A little burnt', 'You left the kitchen for too long. Still edible.']
    : B.exits ? ['DING!', 'Nicely baked', `Out of the oven, with ${B.exits} ${B.exits > 1 ? 'exits' : 'exit'}.`]
    : ['DING!', 'Golden perfect', 'The door stayed shut the whole time.'];
  setText($('v-k'), k); setText($('v-h'), h); setText($('v-p'), p);
  $('result-food').innerHTML = ART[recipe.id] || ART.cupcake;
  $('result-food').style.filter = B.burnt ? 'brightness(.62) saturate(.7)' : B.early ? 'saturate(.55) brightness(1.08)' : '';
  earned = [['strawberry', B.early ? 1 : rounds(Math.round(B.total / 60)) + 1], ['sprinkles', done * 2 + 1], ['blueberry', B.early ? 0 : 2], ['mint', done ? 1 : 0], ['gold', !B.early && !B.burnt && !B.exits ? 1 : 0], ['choc', 0]];
  const now = new Date(), when = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' · ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  receiptNo++;
  const body = `<p class="kick">Bake receipt · No. ${String(receiptNo).padStart(4, '0')}</p><p class="big">${esc(recipe.name)}</p><p class="sub">${when} · ${LOCKS[P.lock].name} lock</p>
    <div class="cut"><i></i><i></i></div>
    <div class="sl"><span>Focus time</span><b>${mins} min</b></div>
    <div class="sl"><span>Rounds</span><b>${nr} × ${Math.min(25, mins) || 25} min</b></div>
    <div class="sl"><span>Exits</span><b>${B.exits}</b></div>
    <div class="sl"><span>Goals done</span><b>${done} / ${B.goals.length}</b></div>
    <div class="sl total"><span>Focus score</span><b>${bakeScore()}</b></div>
    <div class="cut"><i></i><i></i></div>
    <p class="grp">Toppings earned</p>
    ${earned.filter(([, n]) => n).map(([id, n]) => `<div class="sl"><span>${tip(id)}${TOPPINGS[id].n}</span><b>× ${n}</b></div>`).join('')}
    ${B.goals.length ? `<p class="grp">Goals</p>${B.goals.map((g) => `<div class="sl"><span><i class="ok ${g.done ? 'on' : ''}">${g.done ? ICON.tick : ''}</i>${esc(g.text)}</span><b>${g.done ? 'Done' : 'Next bake'}</b></div>`).join('')}` : ''}
    <div class="cut"><i></i><i></i></div>
    <div class="slip-foot">${barcode(receiptNo % 7 + 3)}<small>Baked by Leqi<br>thanks for baking</small></div>`;
  setHTML($('r-slip'), slipHTML('Sweet Study oven', body));
  setText($('to-deco'), B.early ? 'Take a break anyway' : 'Take a 5-min break');
  B.grade = h;
}
// the big moment: the verdict comes into focus, toppings pop off the dessert, and the receipt prints
function playResult() {
  blurIn($('v-h'), 150);
  setTimeout(() => { if (B.grade !== 'A little burnt') { const [x, y] = centreOf($('result-food')); burst(x, y); } }, 350);
  setTimeout(() => printSlip($('r-slip')), 650);
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
  D.timer = setInterval(() => { const now = performance.now(); D.left = Math.max(0, D.left - (now - D.last) / 1000 * B.speed); D.last = now; setText($('break-clock'), mmss(D.left)); if (!D.left) { clearInterval(D.timer); setText($('deco-hint'), 'Break’s over. Save it to your case.'); buzz([20, 40, 20]); } }, 200);
  setText($('break-clock'), mmss(D.left)); showTray(false);
  // the real dessert is an occasional reward for a golden bake, not an upsell after every one
  $('order-real').hidden = B.grade !== 'Golden perfect';
}
// the break is for looking away from the screen; decorating is there if you want it
function showTray(on) {
  $('tray').hidden = !on; setText($('deco-toggle'), on ? 'Done decorating' : 'Decorate');
  setText($('deco-hint'), on ? 'Tap a topping to add it, then drag it into place.' : 'Look away from the screen for a bit: stretch, refill your water. Decorating is optional.');
}
$('deco-toggle').addEventListener('click', () => showTray($('tray').hidden));
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
  const score = bakeScore();
  CASE.unshift({ r: recipe.id, when: 'Just now', min: Math.round((B.total - B.left) / 60), grade: B.grade, tops: D.placed.length, exits: B.exits, score, isNew: true });
  dismiss('case'); toast(`<span>Saved to your dessert case</span>`);
});
$('order-real').addEventListener('click', () => openShop(0, recipe.id));

/* ---------- nearby: a shop's page, to order ahead or to study there ---------- */
let cart = {}, shopI = 0, shopCat = 'all';
const MENU_CAT = { cupcake: 'Cakes', shortcake: 'Cakes', macaron: 'Macarons', latte: 'Drinks' };
const SHOP_INFO = [
  { open: '07:00–21:30', score: 4.7, seats: '2 h seats', quiet: 'Quiet', stars: 5, sign: 'Study hours 14:00–17:00 · 10% off' },
  { open: '08:00–22:00', score: 4.4, seats: '3 h seats', quiet: 'Lively', stars: 4, sign: 'Free refill while you study' },
  { open: '10:00–20:00', score: 4.2, seats: '1 h seats', quiet: 'Quiet', stars: 4, sign: 'Free topping after a golden bake' },
];
// a little storefront: mint awning, pink sign, and the shop's signature dessert on the roof
function storefront(s) {
  return `<svg class="storefront" viewBox="0 0 360 200" aria-hidden="true">
    <polygon points="58,74 302,74 322,58 78,58" fill="#EEF2FE"/><polygon points="302,74 322,58 322,176 302,190" fill="#C9C9D1"/>
    <rect x="58" y="74" width="244" height="116" fill="#F4F4F6"/><rect x="58" y="74" width="244" height="22" fill="#8CA7F4"/>
    ${[0, 1, 2, 3, 4, 5].map((k) => `<polygon points="${58 + k * 40.6},96 ${78 + k * 40.6},96 ${68 + k * 40.6},112" fill="${k % 2 ? '#C349EE' : '#8CA7F4'}"/>`).join('')}
    <rect x="76" y="120" width="96" height="70" rx="4" fill="#BCCBF9" opacity=".55"/><rect x="186" y="120" width="98" height="70" rx="4" fill="#111113"/><rect x="194" y="128" width="40" height="62" fill="#8CA7F4" opacity=".35"/>
    <rect x="96" y="80" width="168" height="12" rx="3" fill="#111113"/><text x="180" y="89.5" text-anchor="middle" font-size="8.5" font-weight="900" fill="#fff" font-family="-apple-system, Segoe UI, sans-serif">${esc(s.n.toUpperCase())}</text>
    <rect x="0" y="190" width="360" height="10" fill="#8CA7F4"/>
    <g transform="translate(130 0) scale(.5)">${ART[s.menu[0][0]]}</g>
  </svg>`;
}
function openShop(i, want) {
  shopI = i; shopCat = 'all'; cart = {};
  const s = SHOPS[i]; if (want && s.menu.some((m) => m[0] === want)) cart[want] = 1;
  setText($('shop-nav'), s.n); drawShop();
  if (stack.length && base === 'modal') push('shop'); else openPage('shop');
}
function drawShop() {
  const s = SHOPS[shopI], info = SHOP_INFO[shopI] || SHOP_INFO[0], ten = s.off === '10% off';
  const cats = ['all', ...new Set(s.menu.map(([id]) => MENU_CAT[id]))];
  const items = s.menu.filter(([id]) => shopCat === 'all' || MENU_CAT[id] === shopCat);
  setHTML($('shop-page'), `
    <div class="shop-hero"><span class="billboard"><b>${esc(info.sign)}</b><i></i></span>${storefront(s)}</div>
    <div class="shop-card card rounded">
      <div class="head-row"><span class="tile rounded" style="background:${s.c}">${art(s.menu[0][0], 'class="art"')}</span><div class="grow"><h3>${esc(s.n)}</h3><p class="stars">${'★'.repeat(info.stars)}${'☆'.repeat(5 - info.stars)} <span>${s.d} · ${s.walk}</span></p></div><span class="tag brand rounded">${esc(s.off)}</span></div>
      <div class="shop-stats"><div class="score"><b>${info.score}</b><span>study<br>score</span></div><div class="grow"><p class="t-footnote"><b>Open</b> ${info.open}</p><div class="chips"><span class="chip rounded">${info.quiet}</span><span class="chip rounded">Plugs</span><span class="chip rounded">${info.seats}</span></div></div></div>
      <div class="shop-tabs"><button class="on" type="button">Order ahead</button><button type="button" data-go="study-here">Study here</button></div>
    </div>
    <div class="menu">
      <div class="rail">${cats.map((c) => `<button type="button" data-cat="${c}" aria-pressed="${c === shopCat}">${c === 'all' ? 'Picks' : c}</button>`).join('')}</div>
      <div class="items">${items.map(([id, n, p]) => `<div class="item"><span class="item-art rounded">${art(id)}</span><div class="grow"><p class="name">${esc(n)}</p><p class="desc">${MENU_CAT[id] === 'Drinks' ? 'Hot or iced' : 'Baked this morning'}</p><p class="price">${ten ? `$${(p * .9).toFixed(2)}<s>$${p.toFixed(2)}</s>` : `$${p.toFixed(2)}`}</p></div><div class="qty">${cart[id] ? `<button type="button" data-m="${id}" data-d="-1" aria-label="One fewer ${esc(n)}">−</button><span>${cart[id]}</span>` : ''}<button class="add" type="button" data-m="${id}" data-d="1" aria-label="Add ${esc(n)}">+</button></div></div>`).join('')}</div>
    </div><div class="spacer"></div>`);
  const count = Object.values(cart).reduce((a, n) => a + n, 0), total = s.menu.reduce((a, [id, , p]) => a + (cart[id] || 0) * p, 0) * (ten ? .9 : 1);
  setHTML($('cartbar'), count
    ? `<button class="cart rounded" type="button" data-go="shop-order"><span class="bag">${count}</span><span class="grow"><b>$${total.toFixed(2)}</b><small>Ready when your bake ends</small></span><span class="go-pill">Order</span></button>`
    : `<p class="cart-empty">Add something to order ahead. It’s made so it’s ready when your bake ends.</p>`);
}
// ordering prints a pickup ticket, ready for the end of the bake
function orderTicket() {
  const s = SHOPS[shopI], ten = s.off === '10% off', items = s.menu.filter(([id]) => cart[id]);
  const total = items.reduce((a, [id, , p]) => a + cart[id] * p, 0) * (ten ? .9 : 1);
  const ready = new Date(Date.now() + (B.timer ? B.left / B.speed * 1000 : 20 * 60000)).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const no = 3100 + Math.floor(Math.random() * 800);
  const body = `<p class="kick">Pickup ticket · No. ${no}</p><p class="big">Ready at ${ready}</p><p class="sub">${esc(s.n)} · ${s.d} · ${s.walk}</p>
    <div class="cut"><i></i><i></i></div>
    ${items.map(([id, n, p]) => `<div class="sl"><span>${cart[id]} × ${esc(n)}</span><b>$${(cart[id] * p * (ten ? .9 : 1)).toFixed(2)}</b></div>`).join('')}
    ${ten ? '<div class="sl"><span>Golden bake discount</span><b>−10%</b></div>' : ''}
    <div class="sl total"><span>Total</span><b>$${total.toFixed(2)}</b></div>
    <div class="cut"><i></i><i></i></div>
    <div class="slip-foot">${barcode(no % 7 + 2)}<small>Show this at the counter<br>Demo: nothing charged</small></div>`;
  setHTML($('shop-body'), `<div class="stack pickup"><div class="head"><h3>Order sent</h3><span class="ready">Made for ${ready}</span></div>${slipHTML(s.n, body)}
    <div class="acts"><button class="btn soft rounded" type="button" id="ticket-done">Done</button><button class="btn rounded" type="button" id="ticket-wallet">Add to Apple Wallet</button></div></div>`);
  $('ticket-done').onclick = () => closeSheet('sheet-shop');
  $('ticket-wallet').onclick = () => { closeSheet('sheet-shop'); toast('<b>Added to Wallet</b><span>It shows on your Lock Screen near the shop</span>'); };
  cart = {}; drawShop(); openSheet('sheet-shop');
  setTimeout(() => printSlip($('shop-body')), 380);
}
$('shop-page').addEventListener('click', (e) => {
  const m = e.target.closest('[data-m]'); if (m) { cart[m.dataset.m] = Math.max(0, (cart[m.dataset.m] || 0) + +m.dataset.d); buzz(8); drawShop(); return; }
  const c = e.target.closest('[data-cat]'); if (c) { shopCat = c.dataset.cat; drawShop(); }
});
$('app').addEventListener('click', (e) => {
  const g = e.target.closest('[data-go]'); if (!g) return;
  if (g.dataset.go === 'shop-order') orderTicket();
  else if (g.dataset.go === 'study-here') toast('<span>Check in at the counter to unlock the study-hours discount</span>');
  else if (g.dataset.go === 'shop-share') toast('<span>On iPhone this opens the share sheet</span>');
});
$('app').addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if ($('sheet-shop').classList.contains('on')) closeSheet('sheet-shop');
  else if ($('sheet-goal').classList.contains('on')) $('scrim').click();
});

renderTabs(); renderRecipes();
// Test hook, only with ?debug: move the oven timer forward.
if (/[?&]debug\b/.test(location.search)) window.__bake = (sec) => { B.left = Math.max(0, B.left - sec); B.last = performance.now(); tickBake(); };
