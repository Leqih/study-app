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
// Rooms sit at a scope (your campus, your city, or open to everyone) and have a type of work.
// A wider scope includes the narrower ones; Friends shows any room a friend is in.
const ROOMS = [
  { n: 'Quiet library', s: 'No chat · cameras off', k: 12, f: ['Mia', 'Jun', 'Ava'], len: 25, left: 760, at: 'campus', type: 'Coursework' },
  { n: 'Exam sprint', s: '50-minute rounds', k: 34, f: ['Sam', 'Ava'], len: 50, left: 1860, at: 'city', type: 'Exams' },
  { n: 'Night owls', s: 'Open until 2 am', k: 8, f: ['Jun'], len: 25, left: 410, at: 'world', type: 'Writing' },
  { n: 'GRE morning club', s: 'Starts 7 am · cameras on', k: 9, f: [], host: 'Noa', len: 50, left: 1320, at: 'campus', type: 'Exams' },
  { n: 'Thesis corner', s: 'Bobst Library, 4th floor', k: 6, f: [], host: 'Ivy', len: 50, left: 2410, at: 'campus', type: 'Writing' },
  { n: 'Language exchange', s: 'Chat in the breaks', k: 21, f: [], host: 'Lin', len: 25, left: 980, at: 'city', type: 'Language' },
  { n: 'Makers’ desk', s: 'Code, design, slides', k: 48, f: [], host: 'Kai', len: 50, left: 600, at: 'city', type: 'Deep work' },
  { n: 'Job hunt hour', s: 'Applications and prep', k: 17, f: [], host: 'Ben', len: 50, left: 1700, at: 'city', type: 'Job hunt' },
  { n: 'Inbox zero', s: 'Emails, forms, chores', k: 130, f: [], host: 'Kai', len: 25, left: 300, at: 'world', type: 'Admin' },
  { n: 'Silent reading', s: 'Books and papers', k: 210, f: [], host: 'Lin', len: 50, left: 2050, at: 'world', type: 'Reading' },
];
// Explore is about place; friends have their own tab
const SCOPES = [['campus', 'NYU'], ['city', 'New York'], ['world', 'Everywhere']];
// the local board: top focus hours this week at each place; people you haven't added show as a first initial
const LOCAL = {
  campus: { me: 12, of: 340, top: [['Noa', 9.4], ['Kai', 8.8], ['Jun', 6.2], ['Lin', 5.9], ['Mia', 4.1]] },
  city: { me: 148, of: 5200, top: [['Ivy', 14.2], ['Ben', 12.7], ['Noa', 9.4], ['Ash', 9.1], ['Kai', 8.8]] },
  world: { me: 2304, of: 88000, top: [['Rae', 31.5], ['Oli', 28.0], ['Zed', 26.4], ['Ivy', 14.2], ['Ben', 12.7]] },
};
function renderLocal() {
  const L = LOCAL[RF.scope], best = L.top[0][1], label = SCOPES.find(([k]) => k === RF.scope)[1];
  setText($('local-title'), RF.scope === 'world' ? 'Top everywhere' : `Top at ${label}`);
  setHTML($('local-board'), L.top.map(([n, h], k) => lbRow(k + 1, n, h, best)).join('') + `<div class="lb-gap" aria-hidden="true">···</div>` + lbRow(L.me, 'Leqi', myHours.week || 0, best)
    + `<button class="lb-all" type="button" data-lb-all aria-haspopup="dialog">See the top 20${ICON.chev}</button>`);
}
// one row of a local board; anyone but you opens their sheet
function lbRow(rank, n, h, best) {
  const me = n === 'Leqi', friend = FRIENDS.some((f) => f.n === n), tag = me ? 'div' : 'button';
  return `<${tag} class="lb-row${me ? ' me' : ''}"${me ? '' : ` type="button" aria-haspopup="dialog" data-lb='${JSON.stringify([n, rank, h])}'`}><span class="lb-rk">${rank.toLocaleString('en-US')}</span>${face(n)}<span class="grow"><b>${me ? 'You' : friend ? n : `${n[0]}.`}</b>${friend ? '<span class="tag brand">Friend</span>' : ''}<span class="lb-bar"><i style="width:${Math.round(h / best * 100)}%"></i></span></span><b class="lb-h">${h.toFixed(1)}h</b></${tag}>`;
}
// the whole top 20 for this place, in a sheet that scrolls
const LB_MORE = ['Ash', 'Rae', 'Oli', 'Zed', 'Pia', 'Teo', 'Uma', 'Kit', 'Bo', 'Eli', 'Fay', 'Gus', 'Hal', 'Ida', 'Jo'];
function localSheet() {
  const L = LOCAL[RF.scope], best = L.top[0][1], label = SCOPES.find(([k]) => k === RF.scope)[1];
  const pool = LB_MORE.filter((n) => !L.top.some(([x]) => x === n)), last = L.top[L.top.length - 1][1], mine = myHours.week || 0, inTop = L.me <= 20;
  // ranks 6–20 step down from fifth place; if you're among them you sit at your rank and everyone else steps around you
  const top = inTop ? Math.max(mine, .1) : last;
  const all = [...L.top];
  for (let k = 6, p = 0; k <= 20; k++) {
    if (inTop && k === L.me) { all.push(['Leqi', mine]); continue; }
    const h = inTop && k < L.me ? last - (last - top) * (k - 5) / (L.me - 5) : (inTop ? top : last) * Math.pow(.96, k - (inTop ? L.me : 5));
    all.push([pool[p++], +h.toFixed(1)]);
  }
  showSheet(`<div class="ls-head"><h3>${RF.scope === 'world' ? 'Top everywhere' : `Top at ${label}`}</h3></div>
    <div class="ls-list" id="local-all">${all.map(([n, h], k) => lbRow(k + 1, n, h, best)).join('')}${inTop ? '' : `<div class="lb-gap" aria-hidden="true">···</div>${lbRow(L.me, 'Leqi', mine, best)}`}</div>`, localSheet);
}
const ROOM_TYPES = ['All', 'Exams', 'Coursework', 'Language', 'Writing', 'Deep work', 'Admin', 'Job hunt', 'Reading'];
const AT_LABEL = { campus: 'NYU', city: 'New York', world: 'Online' };
const WHERE = { friends: 'with friends', campus: 'at NYU', city: 'in New York', world: 'everywhere' };
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
// Baking now on Home: the friends who are baking right now, as faces. Tap one for their sheet (cheer, or join their bake); Rooms is where you browse everyone
function renderJoinCard() {
  const el = $('join-card'), live = FRIENDS.filter((f) => f.left > 0), more = live.length - 3;
  if (!FRIENDS.length) { setHTML(el, '<p class="k">Baking now</p><button class="btn soft small rounded jc-btn" type="button" data-go="invite">Invite a friend</button>'); return; }
  if (!live.length) { setHTML(el, '<p class="k">Baking now</p><span class="faces-sh">' + '<span class="frame empty"></span>'.repeat(3) + '</span><p class="num">None<small> yet</small></p>'); return; }
  setHTML(el, `<p class="k"><i class="live-dot" aria-hidden="true"></i>Baking now</p>
    <span class="faces-sh">${live.slice(0, 3).map((f) => `<button class="frame pat" type="button" data-f="${f.n}" aria-haspopup="dialog" aria-label="${f.n}, ${f.left} minutes left">${face(f.n)}</button>`).join('')}${more > 0 ? `<button class="frame more" type="button" data-tab="rooms" aria-label="${more} more in Rooms"><span>+${more}</span></button>` : ''}</span>
    <p class="num">${live.length}<small> baking</small></p>`);
}
$('join-card').addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (b) { buzz(6); friendSheet(b.dataset.f); } });
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let TRAY = [], TRAY_SHARE = 43;
// every weekday has its own shape from the avatar library and its own colour, Sunday first: today's cookie wears today's, and the week tray shows each day's own
// demo: ?day=0 (Sunday) to ?day=6 shows that weekday's shape
const DOW = (() => { const d = new URLSearchParams(location.search).get('day'); return d !== null && d !== '' && +d >= 0 && +d <= 6 ? Math.floor(+d) : new Date().getDay(); })();
// [library shape, colour, how far out from the centre a face still fits inside it (measured, in the shape's 100-unit box)]
const DAY_LOOK = [['flower6', '#BCCBF9', 42.5], ['clover', '#BDE8A6', 32.5], ['wavy', '#FFE98A', 35], ['pillow', '#FFC4F8', 35], ['cog', '#FFD0A8', 36], ['scallop', '#E3B8FA', 44.5], ['petal8', '#A9E6DA', 30.5]];
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
// a table of people you don't know: bake for what's left of its round, no names in the toast
function joinTable(i) {
  const r = ROOMS[i], min = Math.max(1, Math.ceil(r.left / 60));
  together = r.host; P.together = true;
  recipe = recipeById(['macaron', 'shortcake', 'latte', 'cupcake'][i % 4]) || recipe; renderRecipes();
  startBake(min, CARRY);
  toast(`<b>You took a seat at ${esc(r.n)}</b><span>The round ends in ${min} min</span>`);
}
const inviteRow = (s) => `<div class="row"><span class="tile success rounded">${ICON.plus}</span><span class="grow"><span class="t">Bake with a friend</span><span class="s">${s}</span></span><button class="btn soft small rounded" type="button" data-go="invite">Invite</button></div>`;
// friends as bubbles: each face in a ring that fills as their bake goes, minutes left on a tag; tap one for their sheet
const friendBubble = (f) => { const p = Math.round((1 - f.left / (LEN[f.d] || 50)) * 100); return `<button class="fb" type="button" aria-haspopup="dialog" data-f="${f.n}" style="--p:${p}" aria-label="${f.n}, ${f.subj || f.d}, ${f.left} minutes left"><span class="fring"><svg class="ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47" fill="none" stroke="rgba(140,167,244,.2)" stroke-width="4"/><circle cx="50" cy="50" r="47" fill="none" stroke="#8CA7F4" stroke-width="4" stroke-linecap="round" pathLength="100" stroke-dasharray="${p} 100" transform="rotate(-90 50 50)"/></svg>${face(f.n)}</span><span class="fbm"><b data-to="${f.left}">${f.left}</b>m</span><span class="fbn">${f.n}</span><span class="fbs">${esc(f.subj || f.d)}</span></button>`; };

// a room: name, rules, who's in it in their shapes, the live count in a scallop, and join
const ROOM_SH = [['scallop', '#F3DDFC'], ['flower8', '#E3E9FD'], ['star', '#DDEB9E']];
// a room card: the table scene, then this round's clock and who's in, then one button
const ROOM_BG = ['#f3ddfc', '#e3e9fd', '#f5edc8'], ROOM_DEEP = ['#e3a6f7', '#bccaf9', '#ecd77f'];
// c picks the colour: cards cycle pink, blue, yellow in the order they're shown, so neighbours never match
function roomCard(r, i, c = i) {
  const who = FRIENDS.find((f) => r.f.includes(f.n)), p = 1 - r.left / (r.len * 60);
  // friends by face and name; everyone else only as a count
  const fr = r.f.filter((n) => FRIENDS.some((f) => f.n === n));
  const names = fr.length === 1 ? fr[0] : fr.length === 2 ? `${fr[0]} & ${fr[1]}` : `${fr[0]}, ${fr[1]} +${fr.length - 2}`;
  const crowd = fr.length ? `<span class="rm-fr">${fr.slice(0, 3).map((n) => face(n)).join('')}<b>${names}</b></span><br>+${r.k - fr.length} others`
    : `<b>${r.k}</b> bakers`;
  return `<div class="rm-slot" style="--room-color:${ROOM_BG[c % 3]};--deep:${ROOM_DEEP[c % 3]}"><div class="rm-card" data-card="${i}" role="button" tabindex="0" aria-haspopup="dialog" aria-label="${r.n}, ${r.k} baking">
    <div class="rm-head"><div><h3>${r.n}</h3></div><span class="cnt"><b>${r.k}</b> here</span></div>
    ${roomTable(r, i, c)}
    <div class="rm-round"><div><p class="lbl">Round ends in</p><p class="tclock">${mmss(r.left)}</p></div><p class="sm">${crowd}</p></div>
    <span class="rbar"><i style="width:${(p * 100).toFixed(1)}%"></i></span>
    <button class="btn rounded rm-join" type="button" data-seat="${i}" data-who="${r.f[0] || r.host}">${who ? `Join ${who.n} · ${who.left} min` : `Take a seat · ${Math.ceil(r.left / 60)} min`}</button></div></div>`;
}
// which rooms show: the scope (friends, campus, city, everywhere) and one type, remembered between visits
const RF_KEY = 'sweet-study-room-filter-v1', RANK = { campus: 1, city: 2, world: 3 };
let RF = { scope: 'campus', type: 'All' };
try { const s = JSON.parse(localStorage.getItem(RF_KEY) || 'null'); if (s && SCOPES.some(([k]) => k === s.scope) && ROOM_TYPES.includes(s.type)) RF = s; } catch (_) {}
const inScope = (r, scope) => scope === 'friends' ? r.f.length > 0 : RANK[r.at] <= RANK[scope];
const shownRooms = () => ROOMS.filter((r) => inScope(r, RF.scope) && (RF.type === 'All' || r.type === RF.type));
function renderRooms() {
  setText($('scope-name'), SCOPES.find(([k]) => k === RF.scope)[1]);
  setHTML($('type-row'), ROOM_TYPES.map((t) => `<button type="button" role="tab" data-rtype="${t}" aria-selected="${t === RF.type}">${t}</button>`).join(''));
  const list = shownRooms(), wider = SCOPES[SCOPES.findIndex(([k]) => k === RF.scope) + 1];
  setHTML($('rooms'), list.length ? list.map((r, pos) => roomCard(r, ROOMS.indexOf(r), pos)).join('')
    : `<div class="rm-slot"><div class="rm-empty"><b>No ${RF.type === 'All' ? '' : RF.type.toLowerCase() + ' '}tables ${WHERE[RF.scope]} right now</b><span>Start one, or look a little further out.</span>
      <div class="acts">${wider ? `<button class="btn soft small rounded" type="button" data-scope="${wider[0]}">Look ${WHERE[wider[0]]}</button>` : ''}<button class="btn small rounded" type="button" data-go="pick">Start a table</button></div></div></div>`);
  setHTML($('room-dots'), list.length > 1 ? list.map(() => '<i></i>').join('') : '');
  $('rooms').scrollLeft = 0; layoutRooms(); renderLocal();
}
function setRoomFilter(next) {
  RF = { ...RF, ...next }; try { localStorage.setItem(RF_KEY, JSON.stringify(RF)); } catch (_) {}
  buzz(6); renderRooms(); stagger($('rooms'));
}
function scopeMenu(open) {
  const m = $('scope-menu'); m.hidden = !open; $('scope-btn').setAttribute('aria-expanded', String(open));
  if (open) setHTML(m, SCOPES.map(([k, label]) => { const n = ROOMS.filter((r) => inScope(r, k)).length; return `<button type="button" role="menuitemradio" aria-checked="${k === RF.scope}" data-scope="${k}"><span class="grow">${label}</span><span class="n">${n} ${n === 1 ? 'table' : 'tables'}</span><svg class="ok" width="14" height="12" viewBox="0 0 12 10" aria-hidden="true"><path d="M1 5l3.5 3.5L11 1" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>`; }).join(''));
}
$('scope-btn').addEventListener('click', (e) => { e.stopPropagation(); scopeMenu($('scope-menu').hidden); });
// Rooms has two circles: Friends (plans, who's baking, the board — no place filter) and Explore (open tables by place)
const RTAB_KEY = 'sweet-study-rooms-tab-v1';
let rtab = 'friends';
try { if (localStorage.getItem(RTAB_KEY) === 'explore') rtab = 'explore'; } catch (_) {}
function showRoomsTab(t, animate) {
  rtab = t; try { localStorage.setItem(RTAB_KEY, t); } catch (_) {}
  $('rm-tabs').querySelectorAll('[data-rtab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.rtab === t)));
  const tabs = $('rm-tabs'); tabs.dataset.on = t;
  placeRoomLine(animate);
  $('pane-friends').hidden = t !== 'friends'; $('pane-explore').hidden = t !== 'explore';
  scopeMenu(false);
  if (t === 'explore') { layoutRooms(); if (animate) stagger($('rooms')); }
  else if (animate) { stagger($('friends-all').querySelector('.bubbles')); stagger($('leaderboard')); }
}
// the switch is two words with a wavy line of frosting under the chosen one; switching slides the line across and pipes it again
function placeRoomLine(animate) {
  const tabs = $('rm-tabs'), b = tabs.querySelector('[aria-selected="true"]'), line = tabs.querySelector('.rm-line'), path = line.querySelector('path');
  if (!b.offsetWidth) return; // Rooms isn't on screen yet; placed again when it is
  line.style.width = `${b.offsetWidth}px`; line.style.translate = `${b.offsetLeft}px 0`;
  if (!animate || reduced) return;
  path.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 100, offset: .2 }, { strokeDashoffset: 0 }], { duration: 560, easing: 'ease-out' });
}
$('rm-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-rtab]'); if (!b || b.dataset.rtab === rtab) return; buzz(6); showRoomsTab(b.dataset.rtab, true); });
showRoomsTab(rtab);
$('s-rooms').addEventListener('click', (e) => {
  const s = e.target.closest('[data-scope]'), t = e.target.closest('[data-rtype]');
  if (s) { scopeMenu(false); setRoomFilter({ scope: s.dataset.scope }); return; }
  if (t) { setRoomFilter({ type: t.dataset.rtype }); t.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' }); return; }
  if (!$('scope-menu').hidden && !e.target.closest('#scope-menu')) scopeMenu(false);
});
/* ---------- sheets: tapping a table, a friend or someone on a board slides up their details; swipe the scrim to close ---------- */
let sheetRedraw = null; // redraws the open sheet when friendships change underneath it
function showSheet(html, redraw) { setHTML($('shop-body'), html); sheetRedraw = redraw || null; openSheet('sheet-shop'); }
// a table: its clock, who's at it (friends by name, everyone else as a count), its rules, then open the room or sit down
let sheetRoom = -1;
function roomSheet(i) {
  const r = ROOMS[i], c = [...$('rooms').querySelectorAll('.rm-card')].findIndex((x) => +x.dataset.card === i);
  const fr = r.f.filter((n) => FRIENDS.some((f) => f.n === n)), others = ['Noa', 'Kai', 'Lin', 'Ivy', 'Ben'].filter((n) => !r.f.includes(n)).slice(0, 3);
  const subj = (n) => (FRIENDS.find((f) => f.n === n) || {}).subj || 'Studying', who = FRIENDS.find((f) => r.f.includes(f.n));
  sheetRoom = i; const k = Math.max(c, 0) % 3;
  // the hero is the card's own awning and table, bigger: the dessert on its stand, who's sitting, and your empty seat
  showSheet(`<div class="rs">
    <div class="ph rs-hero" style="--tint:${ROOM_BG[k]};--deep:${ROOM_DEEP[k]}"><div class="rs-top"><span class="rs-live"><i></i><b>${r.k}</b> here</span></div>
      <h3>${r.n}</h3><p>${r.s} · ${LOCKS[P.lock].name} lock</p>${roomTable(r, i, k)}</div>
    <div class="stks">${sticker(CLOCK, `<span class="tclock">${mmss(r.left)}</span>`, `left this round<span class="rbar"><i style="width:${((1 - r.left / (r.len * 60)) * 100).toFixed(1)}%"></i></span>`, 0)}${sticker(PEOPLE, fr.length ? `${fr.length} ${fr.length === 1 ? 'friend' : 'friends'}` : 'No friends yet', fr.length ? `${r.k - fr.length} others` : `${r.k} bakers`, 1)}${sticker(TOQUE_IC, `${r.len} min`, 'per round', 2)}</div>
    <p class="mh">At the table</p>${fr.map((n) => `<button class="mrow" type="button" data-person="${n}">${face(n)}<span class="grow"><b>${n}</b><span>${subj(n)}</span></span><span class="tag brand">Friend</span></button>`).join('')}
    <div class="mrow others"><span class="faces">${others.map((n) => face(n)).join('')}</span><span class="grow"><b>${r.k - fr.length} ${fr.length ? 'others' : 'bakers'}</b></span></div></div>
    <div class="acts"><button class="btn soft rounded" type="button" data-go="room" data-i="${i}">Open the room</button><button class="btn rounded" type="button" data-sheet-seat="${i}">${who ? `Join ${who.n} · ${who.left} min` : `Take a seat · ${Math.ceil(r.left / 60)} min`}</button></div>`, () => roomSheet(i));
}
// a person's sheet opens on a hero in their colour with a scalloped hem: their face, gently bobbing,
// inside a thin ring that fills as their bake goes; the details below are paper stickers, each a little askew
const HEART = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.4h2c.7-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>';
const PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.4 7-12a7 7 0 0 0-14 0c0 5.6 7 12 7 12z" fill="#BCCBF9"/><circle cx="12" cy="10" r="2.6" fill="#fff"/></svg>';
const CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="#DDEB9E"/><path d="M12 7v5l3.4 2" fill="none" stroke="#111113" stroke-width="2" stroke-linecap="round"/></svg>';
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z" fill="#F5C542"/></svg>';
const PEOPLE = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="4" fill="#E3A6F7"/><path d="M2 20c0-4 3-6.5 7-6.5s7 2.5 7 6.5z" fill="#E3A6F7"/><circle cx="17" cy="9" r="3" fill="#BCCBF9"/><path d="M14.5 14.2c.8-.3 1.6-.4 2.5-.4 3 0 5 2 5 5.2h-5" fill="#BCCBF9"/></svg>';
const TOQUE_IC = '<svg viewBox="0 0 30 26" aria-hidden="true"><path d="M8 23v-6a5 5 0 0 1-1.6-9.7A6 6 0 0 1 15 5a6 6 0 0 1 8.6 2.3A5 5 0 0 1 22 17v6z" fill="#fff" stroke="#C9CBD6" stroke-width="1.4"/><path d="M8 19h14v4H8z" fill="#ECD77F"/></svg>';
const CHEERS = {};
// what people say about themselves: a line, and tags for school, rhythm, streak and favourite dessert
const BIO = {
  Mia: ['Math major. Coffee first, proofs second.', [['cap', 'NYU Math'], ['moon', 'Night owl'], ['flame', '12 days'], ['heart', 'Macarons']]],
  Jun: ['Writing a thesis on city parks.', [['cap', 'NYU Urban'], ['sun', 'Early bird'], ['flame', '30 days'], ['heart', 'Shortcake']]],
  Ava: ['Off to Tokyo next spring.', [['cap', 'Parsons'], ['globe', 'Japanese'], ['flame', '5 days'], ['heart', 'Cupcakes']]],
  Sam: ['Two books a week, notes on all of them.', [['cap', 'NYU English'], ['moon', 'Night owl'], ['heart', 'Lattes']]],
  Noa: ['Pre-med. Flashcards everywhere.', [['cap', 'NYU Chem'], ['sun', 'Early bird'], ['flame', '21 days']]],
  Kai: ['Designing things that help people focus.', [['cap', 'Pratt'], ['moon', 'Night owl'], ['heart', 'Macarons']]],
  Lin: ['Piano by day, theory by night.', [['cap', 'Juilliard'], ['moon', 'Night owl']]],
  Ivy: ['Essays, one paragraph at a time.', [['cap', 'NYU History'], ['sun', 'Early bird']]],
  Ben: ['Learning SQL for a data job.', [['globe', 'Career switch'], ['flame', '9 days']]],
};
const TAG_IC = {
  cap: '<path d="M2 9l10-5 10 5-10 5z" fill="#8CA7F4"/><path d="M6 11.5V16c3.5 2.4 8.5 2.4 12 0v-4.5L12 14.5z" fill="#BCCBF9"/>',
  moon: '<path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5z" fill="#8CA7F4"/>',
  sun: '<circle cx="12" cy="12" r="5" fill="#F5C542"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" stroke="#F5C542" stroke-width="2" stroke-linecap="round"/>',
  flame: '<path d="M12 22c-4 0-7-2.8-7-6.6 0-3.4 2.6-5.3 3.6-8.4.6 1.6 1.6 2.6 2.6 3 .2-3.4 1.8-6.2 4.3-8 0 4 4.5 6.4 4.5 12.5 0 4.4-3.4 7.5-8 7.5z" fill="#FF8A5B"/><path d="M12 22c-1.9 0-3.2-1.3-3.2-3 0-2 1.6-3 2.2-4.8 1.6 1.3 4.2 2.6 4.2 5 0 1.7-1.3 2.8-3.2 2.8z" fill="#FFD36B"/>',
  heart: '<path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.4h2c.7-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" fill="#E36BC0"/>',
  globe: '<circle cx="12" cy="12" r="9.5" fill="#9ED7B0"/><path d="M2.5 12h19M12 2.5c3 3 3 16 0 19M12 2.5c-3 3-3 16 0 19" fill="none" stroke="#fff" stroke-width="1.6"/>',
};
const tagChips = (tags) => tags.length ? `<div class="ph-tags">${tags.map(([k, t]) => `<button class="ph-tag" type="button"><svg viewBox="0 0 24 24" aria-hidden="true">${TAG_IC[k]}</svg>${t}</button>`).join('')}</div>` : '';
// the tags fall in and all land on the hem in one row; when they're too wide they crowd together,
// each one's empty right end tucked under the next, so none is left hanging in the air
function pileTags(box) {
  const tags = [...box.children], W = box.clientWidth, w = tags.map((t) => t.offsetWidth), sum = w.reduce((a, b) => a + b, 0);
  const gap = tags.length > 1 ? Math.min(8, (W - sum) / (tags.length - 1)) : 0; // goes negative when they have to overlap
  let x = Math.max(0, (W - sum - gap * (tags.length - 1)) / 2);
  tags.forEach((t, k) => {
    const r = [-3, 2.5, -2, 3.5][k % 4] * (gap < 0 ? 1.4 : 1);
    t.style.left = `${x}px`; t.style.top = '0px'; t.style.zIndex = k + 1; t.dataset.r = r; t.style.transform = `rotate(${r}deg)`;
    x += w[k] + gap;
  });
  return tags.map((t, i) => i);
}
// one fall: from above the hero with a spin, a hard land, two small bounces, settling on its angle
function dropTag(t, delay) {
  if (reduced) return;
  const r = +t.dataset.r, from = -(t.offsetTop + 120), spin = (Math.random() < .5 ? -1 : 1) * (30 + Math.random() * 40);
  t.animate([
    { transform: `translateY(${from}px) rotate(${r + spin}deg)`, easing: 'cubic-bezier(.45,0,.9,.5)' },
    { transform: `translateY(0) rotate(${r - spin * .08}deg)`, offset: .55, easing: 'cubic-bezier(.2,.6,.4,1)' },
    { transform: `translateY(-16px) rotate(${r + spin * .04}deg)`, offset: .72, easing: 'cubic-bezier(.6,0,.9,.5)' },
    { transform: `translateY(0) rotate(${r}deg)`, offset: .86, easing: 'cubic-bezier(.2,.6,.4,1)' },
    { transform: `translateY(-4px) rotate(${r}deg)`, offset: .93 },
    { transform: `translateY(0) rotate(${r}deg)` },
  ], { duration: 900, delay, fill: 'backwards' });
}
// tapping a tag: it hops where it is, flips a little and lands back on its angle; the tags beside it get nudged as it lands
function hopTag(t) {
  if (reduced) return;
  const r = +t.dataset.r, s = Math.random() < .5 ? -1 : 1;
  t.getAnimations().forEach((a) => a.cancel());
  t.animate([
    { transform: `translateY(0) rotate(${r}deg)`, easing: 'cubic-bezier(.2,.7,.4,1)' },
    { transform: `translateY(-24px) rotate(${r + s * 14}deg)`, offset: .4, easing: 'cubic-bezier(.6,0,.9,.5)' },
    { transform: `translateY(0) rotate(${r - s * 3}deg)`, offset: .7, easing: 'cubic-bezier(.2,.6,.4,1)' },
    { transform: `translateY(-4px) rotate(${r}deg)`, offset: .85 },
    { transform: `translateY(0) rotate(${r}deg)` },
  ], { duration: 560 });
  [t.previousElementSibling, t.nextElementSibling].forEach((n, k) => {
    if (!n) return; const nr = +n.dataset.r, d = k ? 3 : -3;
    n.animate([{ transform: `rotate(${nr}deg)` }, { transform: `translateX(${d}px) rotate(${nr + d * .8}deg)` }, { transform: `rotate(${nr}deg)` }], { duration: 300, delay: 380, easing: 'ease-out' });
  });
}
function dropTags(root) {
  const box = root.querySelector('.ph-tags'); if (!box) return;
  const order = pileTags(box);
  order.forEach((i, k) => dropTag(box.children[i], 260 + k * 110));
}
// the backdrop: candy sprinkles scattered round the edges, placed the same way for each person every time
function phBackdrop(n) {
  let s = [...n].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7) >>> 0;
  const rnd = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296;
  const sp = []; let tries = 0;
  while (sp.length < 22 && tries++ < 200) {
    const x = rnd() * 360, y = rnd() * 330; if (x > 70 && x < 290 && y < 300) continue; // keep the middle clear for the face, name and tags
    sp.push(`<rect x="${(x - 7).toFixed(0)}" y="${(y - 2.5).toFixed(0)}" width="14" height="5" rx="2.5" transform="rotate(${(rnd() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})" style="fill:${['#fff', 'var(--spr)', '#fff', '#FFE38A'][sp.length % 4]}"/>`);
  }
  return `<svg class="ph-bg" viewBox="0 0 360 330" preserveAspectRatio="xMidYMin slice" aria-hidden="true">${sp.join('')}</svg>`;
}
function personHero(n, tint, p, pill, title, sub, tags = []) {
  const ring = p == null ? '' : `<svg class="ph-arc" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="3.5"/><circle cx="50" cy="50" r="47" fill="none" style="stroke:var(--arc)" stroke-width="3.5" stroke-linecap="round" pathLength="100" stroke-dasharray="${p} 100" transform="rotate(-90 50 50)"/></svg>`;
  return `<div class="ph person" style="--tint:${tint}">${phBackdrop(n)}<span class="ph-ring">${ring}<span class="bob">${face(n)}</span>${pill ? `<span class="ph-pill">${pill}</span>` : ''}</span><h3>${title}</h3><p>${sub}</p>${tagChips(tags)}</div>`;
}
const sticker = (icon, big, small, k) => `<span class="stk" style="--r:${[-3, 2.5, -1.5][k]}deg;--bgc:${['#FCEBFE', '#ECF0FE', '#F4F9DE'][k]}"><span class="ic">${icon}</span><b>${big}</b><small>${small}</small></span>`;
// a friend: who they are, what they're on, how far along, where, then cheer or join
function friendSheet(n) {
  const f = FRIENDS.find((x) => x.n === n); if (!f) return;
  const p = Math.round((1 - f.left / (LEN[f.d] || 50)) * 100), room = ROOMS.find((r) => r.f.includes(f.n)), wk = (LEAD.week.find(([x]) => x === n) || [])[1] || 0;
  const dish = (RECIPES.find((r) => r.name === f.d) || recipeById('macaron')).id, ch = CHEERS[n] || 0;
  const [bio, tags] = BIO[n] || ['', []];
  showSheet(`${personHero(n, f.c, p, `<b>${f.left}</b>m left`, n, esc(bio || f.subj || f.d), tags)}
    <div class="stks">${sticker(art(dish), esc(f.subj || f.d), f.d.replace('Strawberry ', '').toLowerCase(), 0)}${sticker(PIN, room ? room.n : 'Solo', room ? `${room.k} at the table` : 'baking alone', 1)}${sticker(CLOCK, `${wk.toFixed(1)}h`, 'this week', 2)}</div>
    <div class="acts ps-acts"><button class="cheer" type="button" data-cheer="${n}" aria-label="Cheer ${n}">${HEART}<span>${ch ? `× ${ch}` : 'Cheer'}</span></button><button class="btn rounded" type="button" data-go="join" data-who="${n}">Join · ${f.left} min</button></div>`);
  dropTags($('shop-body'));
}
// someone you haven't added: an initial, where they rank, and a way to ask
function strangerSheet(n, rank, h, where) {
  showSheet(`${personHero(n, '#E9E9EF', null, '', `${n[0]}.`, '')}
    <div class="stks">${sticker(STAR, `#${rank}`, where.replace(/^(at|in) /, ''), 0)}${sticker(CLOCK, `${h.toFixed(1)}h`, 'this week', 1)}${sticker(HEART, 'Not yet', 'friends', 2)}</div>
    <div class="acts">${SENT.has(n) ? '<button class="btn soft rounded" type="button" disabled>Requested · waiting for them</button>' : `<button class="btn rounded" type="button" data-fr="add" data-n="${n}">Ask to be friends</button>`}</div>`, () => strangerSheet(n, rank, h, where));
}
const personSheet = (n, rank, h, where) => n === 'Leqi' ? null : FRIENDS.some((f) => f.n === n) ? friendSheet(n) : strangerSheet(n, rank, h, where);
$('shop-body').addEventListener('click', (e) => {
  const s = e.target.closest('[data-sheet-seat]'), p = e.target.closest('[data-person]'), c = e.target.closest('[data-cheer]'), g = e.target.closest('[data-go="join"], [data-go="room"]');
  if (s) { closeSheet('sheet-shop'); const b = $('rooms').querySelector(`[data-seat="${s.dataset.sheetSeat}"]`); b.scrollIntoView({ block: 'nearest', inline: 'center' }); setTimeout(() => b.click(), 380); }
  else if (p) personSheet(p.dataset.person);
  else if (e.target.closest('.ph-tag')) { buzz(6); hopTag(e.target.closest('.ph-tag')); }
  else if (e.target.closest('[data-lb]')) { const [n, rank, h] = JSON.parse(e.target.closest('[data-lb]').dataset.lb); personSheet(n, rank, h, WHERE[RF.scope]); }
  else if (c) {
    const n = c.dataset.cheer; CHEERS[n] = (CHEERS[n] || 0) + 1; buzz([8, 20, 8]);
    setText(c.querySelector('span'), `× ${CHEERS[n]}`); c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
    hearts($('shop-body').querySelector('.ph-ring')); if (CHEERS[n] === 1) toast(`<b>Cheer sent</b><span>${esc(n)} sees it when their round ends</span>`);
  }
  else if (g) closeSheet('sheet-shop');
});
// a chef's toque: three puffs over a band; `ghost` is the dashed one waiting on your seat
const toque = (ghost) => ghost
  ? '<svg class="toque ghost" viewBox="0 0 30 24" aria-hidden="true"><path d="M8 21v-6a5 5 0 0 1-1.6-9.7A6 6 0 0 1 15 3a6 6 0 0 1 8.6 2.3A5 5 0 0 1 22 15v6z" fill="#F3DDFC" stroke="#C349EE" stroke-width="1.4" stroke-dasharray="2.4 2"/></svg>'
  : '<svg class="toque" viewBox="0 0 30 24" aria-hidden="true"><path d="M8 21v-6a5 5 0 0 1-1.6-9.7A6 6 0 0 1 15 3a6 6 0 0 1 8.6 2.3A5 5 0 0 1 22 15v6z" fill="#fff" stroke="#DCDCE4" stroke-width="1"/><path d="M8 15c3 1.6 11 1.6 14 0v1.2c-3 1.6-11 1.6-14 0z" fill="#E9E9EF"/><path d="M8 17h14v4H8z" fill="#EFEFF4"/><path d="M11 8.5c.6-2 2.4-3.2 4.3-3.2" stroke="#E9E9EF" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>';
// the table scene, seen from the front: people sit behind the table with the tabletop hiding their lower half,
// the room's dessert stands on a cake stand in the middle, the cloth hangs down with a scalloped hem, two legs, a soft floor shadow
const TABLE_TC = ['#F3DDFC', '#E3E9FD', '#EBF6C9'], TABLE_EDGE = ['#E3A6F7', '#BCCBF9', '#DDEB9E'];
const SEATS = [26, 72, 196, 242];
function roomTable(r, i, c = i) {
  const people = [...r.f, ...['Noa', 'Kai', 'Lin', 'Ivy', 'Ben'].filter((n) => !r.f.includes(n))].slice(0, 3), dessert = ['macaron', 'shortcake', 'latte', 'cupcake'][i % 4];
  const seat = (x, k) => k < 3
    ? `<span class="seat" style="left:${x}px;--tilt:${[-7, 5, -4][k]}deg"><span class="bob" style="--dl:${-k * .8}s">${toque()}${face(people[k])}</span></span>`
    : `<span class="seat empty" style="left:${x}px">${toque(true)}<span class="you">You</span></span>`;
  const hem = Array.from({ length: 12 }, (_, k) => `<circle cx="${11 + k * 22}" cy="0" r="11"/>`).join('');
  return `<div class="scene" style="--tc:${TABLE_TC[c % 3]};--te:${TABLE_EDGE[c % 3]}">${SEATS.map(seat).join('')}
    <span class="stand" aria-hidden="true">${art(dessert, 'class="dish"')}<i class="plate-t"></i><i class="stem"></i></span>
    <span class="tbl" aria-hidden="true"><i class="top"></i><i class="cloth"><svg viewBox="0 0 264 11" preserveAspectRatio="none" class="hem"><g style="fill:var(--tc)">${hem}</g></svg></i><i class="leg l"></i><i class="leg r"></i></span></div>`;
}
// the strangers at the table you sat down at, offered as friends on the result screen
let metNext = null;
function tableMates(i) {
  const r = ROOMS[i], people = [...r.f, ...['Noa', 'Kai', 'Lin', 'Ivy', 'Ben'].filter((n) => !r.f.includes(n))].slice(0, 3);
  metNext = { room: r.n, people: people.filter((n) => !FRIENDS.some((f) => f.n === n) && !REQS.some((q) => q.n === n)) };
}
// taking a seat: your face flies from the button to the free seat, sits down, and the bake starts with the room
$('rooms').addEventListener('click', (e) => {
  const b = e.target.closest('[data-seat]'); if (!b) return; e.stopPropagation();
  const card = b.closest('.rm-card'), empty = card.querySelector('.seat.empty'); if (!empty) return;
  const app = $('app').getBoundingClientRect(), k = APP_W / app.width, from = b.getBoundingClientRect(), to = empty.getBoundingClientRect();
  const fly = document.createElement('span'); fly.className = 'flyer'; fly.innerHTML = avatarSvg('Leqi'); $('app').appendChild(fly);
  const x0 = (from.left + from.width / 2 - app.left) * k - 19, y0 = (from.top - app.top) * k - 10, x1 = (to.left - app.left) * k, y1 = (to.top - app.top) * k;
  fly.style.left = '0px'; fly.style.top = '0px';
  const land = () => { fly.remove(); empty.classList.remove('empty'); empty.classList.add('taken'); empty.innerHTML = `<span class="bob">${toque()}${face('Leqi')}</span>`; buzz([10, 30, 16]); setText(b, 'Tying your apron…'); tableMates(+b.dataset.seat); setTimeout(() => FRIENDS.some((f) => f.n === b.dataset.who) ? joinFriend(b.dataset.who) : joinTable(+b.dataset.seat), 650); };
  if (reduced) { land(); return; }
  fly.animate([{ transform: `translate(${x0}px, ${y0}px) scale(.8)` }, { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 60}px) scale(1.15)`, offset: .5 }, { transform: `translate(${x1}px, ${y1}px) scale(1)` }],
    { duration: 650, easing: 'cubic-bezier(.3,.1,.3,1)', fill: 'forwards' }).onfinish = land;
}, true);
// tapping a card (not its button) slides its details up in a sheet
$('rooms').addEventListener('click', (e) => {
  if (e.target.closest('[data-go], [data-seat]')) return;
  const c = e.target.closest('.rm-card'); if (!c) return;
  buzz(6); roomSheet(+c.dataset.card);
});
$('rooms').addEventListener('keydown', (e) => { const c = e.target.closest('.rm-card'); if (c && e.target === c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); roomSheet(+c.dataset.card); } });
function layoutRooms() {
  const rail = $('rooms'), slots = [...rail.querySelectorAll('.rm-slot')];
  if (!slots.length) return;
  const center = rail.getBoundingClientRect().left + rail.clientWidth / 2;
  let closest = 0, distance = Infinity;
  slots.forEach((slot, i) => {
    const rect = slot.getBoundingClientRect(), delta = Math.abs(rect.left + rect.width / 2 - center);
    if (delta < distance) { distance = delta; closest = i; }
  });
  $('room-dots').querySelectorAll('i').forEach((dot, i) => dot.classList.toggle('on', i === closest));
}
$('rooms').addEventListener('scroll', layoutRooms, { passive: true });
// the focus board: a podium for the top three (first in the middle, tallest), then where you stand if you're not on it;
// switching Today / Week grows the blocks to their new heights and counts the hours
let leadP = 'week', myHours = { today: 0, week: 0 };
const LEAD = { week: [['Jun', 6.2], ['Mia', 4.1], ['Ava', 3.2], ['Sam', 1.5]], today: [['Jun', 1.5], ['Mia', .8], ['Ava', 1.2], ['Sam', .3]] };
const POD = [[1, 'second'], [0, 'first'], [2, 'third']];
function renderBoardWeek(myHrs, todayHrs) {
  if (myHrs !== undefined) { myHours = { week: myHrs, today: todayHrs }; renderLocal(); }
  const rows = [...LEAD[leadP].filter(([n]) => FRIENDS.some((f) => f.n === n)), ['Leqi', myHours[leadP]]].sort((a, b) => b[1] - a[1]);
  const top = Math.max(rows[0][1], .1), el = $('leaderboard');
  // each column: the face sits on its block (first place wears a crown); name, hours and rank are on the block itself
  const crown = '<svg class="crown" viewBox="0 0 24 16" aria-hidden="true"><path d="M2 14 3 4l5 4 4-7 4 7 5-4 1 10z" fill="#F5C542"/><path d="M2 14h20v2H2z" fill="#E2AE2C"/></svg>';
  if (!el.querySelector('.podium')) el.innerHTML = `<div class="podium">${POD.map(([, c]) => `<div class="pcol ${c}">${c === 'first' ? crown : ''}<span class="who"></span><div class="blockp"><span class="nm"></span><b data-to="0">0.0h</b><i></i></div></div>`).join('')}</div><div class="mine" id="mine"></div>`;
  POD.forEach(([rank, c]) => {
    const col = el.querySelector(`.pcol.${c}`), [n, h] = rows[rank] || ['', 0];
    const who = col.querySelector('.who');
    if (who.dataset.n !== n) { who.dataset.n = n; who.innerHTML = n ? face(n) : ''; who.classList.remove('swap'); void who.offsetWidth; who.classList.add('swap'); }
    col.classList.toggle('me', n === 'Leqi');
    col.querySelector('.nm').textContent = n === 'Leqi' ? 'You' : n;
    const num = col.querySelector('[data-to]'); num.dataset.to = h; roll(num, h, (v) => `${v.toFixed(1)}h`, 700);
    col.querySelector('.blockp').style.height = `${Math.round(92 + (h / top) * 36)}px`;
    col.querySelector('.blockp i').textContent = rank + 1;
  });
  const mi = rows.findIndex(([n]) => n === 'Leqi'), ahead = rows[mi - 1];
  setHTML($('mine'), mi > 2 ? `<span class="rk">#${mi + 1}</span>${face('Leqi')}<span class="grow"><b>You</b><span>${ahead[1] - rows[mi][1] < .05 ? `Tied with ${ahead[0]}` : `${(ahead[1] - rows[mi][1]).toFixed(1)}h behind ${ahead[0]}`}</span><span class="gap"><i style="width:${Math.round(rows[mi][1] / Math.max(ahead[1], .1) * 100)}%"></i></span></span><b class="hrs">${rows[mi][1].toFixed(1)}h</b>`
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
// each lane's colour, and a deeper one for the part of a live bake that has already gone by
const SCH_BG = { 0: '#F3DDFC', 1: '#E3E9FD', 2: '#EBF6C9', 3: '#FBE4F7' }, SCH_DONE = { 0: '#E7BDF7', 1: '#C9D5FA', 2: '#DCEBA6', 3: '#F4C9EE' };
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
  return Array.from({ length: 5 }, (_, i) => { const x = new Date(d.getTime() + i * 864e5); return `<button type="button" data-day="${i}" class="${i === SCH.day ? 'on' : ''}">${i ? x.toLocaleDateString('en-US', { weekday: 'short' }) : 'Today'} <b>${x.getDate()}</b></button>`; }).join('');
}
function schedLanes() {
  const s0 = dayStart(), now = nowH(), all = schedEvents(), nowX = (now - s0) * HOUR_W;
  // an hour label the Now tag would sit on is hidden rather than drawn underneath it
  const underNow = (i) => !SCH.day && i * HOUR_W + 4 < nowX + 26 && i * HOUR_W + 40 > nowX - 20;
  return `<div class="sch-hours">${Array.from({ length: 9 }, (_, i) => `<span class="${underNow(i) ? 'hid' : ''}">${(s0 + i) % 24}:00</span>`).join('')}</div>`
    + (SCH.day ? '' : `<span class="sch-now" style="left:${(now - s0) * HOUR_W}px"></span>`)
    + all.map((e, i) => {
      const live = isLive(e), done = live ? Math.round((now - e.at) / (e.len / 60) * 100) : 0, bg = SCH_BG[e.lane % 4];
      const fill = e.plan ? '' : `background:${live ? `linear-gradient(90deg, ${SCH_DONE[e.lane % 4]} ${done}%, ${bg} ${done}%)` : bg}`;
      return `<button type="button" class="sch-ev ${e.plan ? 'plan' : ''} ${i === SCH.sel ? 'sel' : ''} ${live ? 'running' : ''} ${e.with?.includes('Leqi') ? 'going' : ''}" data-ev="${i}" style="left:${(e.at - s0) * HOUR_W}px;top:${28 + e.lane * 44}px;width:${Math.max(176, e.len / 60 * HOUR_W)}px;${fill}">${e.plan ? '<span class="pl">＋ Plan a bake</span>' : `${face(e.who)}<span class="lb">${esc(e.label)}</span><small>${e.len}m</small>`}</button>`;
    }).join('');
}
// the day's bakes plus one free slot to plan in (on the third lane, a couple of hours out), wherever it fits
function schedEvents() {
  const list = SCHED[SCH.day];
  if (SCH.plan) return [...list, { plan: true, at: SCH.plan.at, len: SCH.plan.len, lane: 2 }];
  // the first hour on the third lane, a couple of hours out, that no pill there already covers
  const busy = (h) => list.some((e) => e.lane === 2 && h < e.at + Math.max(2.1, e.len / 60) && h + 2.1 > e.at);
  let at = SCH.day ? 18 : Math.ceil(nowH() + 2.6); while (busy(at) && at < 23) at++;
  return [...list, { plan: true, at, len: 50, lane: 2 }];
}
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
  const live = isLive(e), going = e.with.includes('Leqi'), mine = e.who === 'Leqi';
  const left = Math.max(1, Math.round(e.len - (nowH() - e.at) * 60)), until = Math.round((e.at - nowH()) * 60) + (SCH.day * 1440);
  const inT = until >= 60 ? `${Math.floor(until / 60)}h ${until % 60}m` : `${Math.max(1, until)}m`;
  const waiting = (e.invited || []).filter((n) => !e.with.includes(n));
  const meta = live ? `<b class="lv">Live</b> · ${left} min left · ${e.with.length} going`
    : mine ? `Starts in ${inT} · ${e.len} min · ${e.with.length} going`
    : going ? `<b class="lv">You’re in</b> · starts in ${inT} · ${e.len} min`
    : `${hhmm(e.at)} · ${e.len} min · ${e.with.length === 1 ? 'be the second one in' : `${e.with.length} going`}`;
  // a booking only opens 10 minutes before it starts; until then it's a reservation, not a way to start early
  const soon = until <= 10, opens = hhmm(e.at - 1 / 6);
  const note = mine && waiting.length ? `<p class="sch-note">Waiting for ${waiting.join(', ')}</p>`
    : (going || mine) && !soon ? `<p class="sch-note">We’ll remind you at ${opens} to pick your dessert.</p>` : '';
  const ready = soon ? `<button class="btn rounded m" type="button" data-sch="ready">Get ready · starts in ${inT}</button>`
    : `<button class="btn rounded m" type="button" disabled>Opens at ${opens}</button>`;
  const acts = live ? `<button class="btn rounded m" type="button" data-sch="join">Join now · ${left} min left</button>`
    : mine ? `<button class="btn soft rounded m" type="button" data-sch="share">Share link</button>${ready}`
    : going ? `<button class="btn soft rounded m" type="button" data-sch="in">Leave</button>${ready}`
    : `<button class="btn rounded m" type="button" data-sch="in">I’m in · remind me</button>`;
  return `<div class="row sch-sum">${face(e.who, 'lead')}<div class="grow"><b class="k">${esc(e.label)}</b><p class="kk">${meta}</p></div><span class="faces sch-faces">${e.with.filter((n) => n !== e.who).slice(0, 3).map((n) => face(n)).join('')}</span></div>${note}
    <div class="sch-acts">${acts}</div>`;
}
function drawSched(scrollToNow) {
  const keepX = $('sch-wrap')?.scrollLeft || 0, list = SCHED[SCH.day], live = list.filter(isLive).length;
  const dayName = SCH.day ? new Date(Date.now() + SCH.day * 864e5).toLocaleDateString('en-US', { weekday: 'long' }) : 'Today';
  // the schedule is yours and your friends' plans, wherever they are; open tables by place are further down
  setHTML($('live-hero'), `<div class="ach"><p class="k">${dayName}’s plans</p></div>
    <div class="sch-days">${schedDays()}</div><div class="sch-wrap" id="sch-wrap"><div class="sch-lanes">${schedLanes()}</div></div><div class="sch-card" id="sch-card" style="background:${cardTint()}">${schedCard()}</div>`);
  // keep the timeline where it was, unless we're arriving or switching day
  // another day opens on its first bake (or the free slot), not on an empty morning
  const first = SCH.day && schedEvents().reduce((a, e) => (a && a.at <= e.at ? a : e), null);
  if (scrollToNow) $('sch-wrap').scrollLeft = SCH.day ? Math.max(0, (first.at - dayStart()) * HOUR_W - 20) : Math.max(0, (nowH() - dayStart()) * HOUR_W - 60); else $('sch-wrap').scrollLeft = keepX;
}
const cardTint = () => { const e = schedEvents()[SCH.sel]; return e && !e.plan ? SCH_BG[e.lane % 4] : 'var(--brand-tint)'; };
function schedCardSwap() { const c = $('sch-card'); c.style.background = cardTint(); c.innerHTML = schedCard(); if (!reduced) c.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' }); }
$('live-hero').addEventListener('click', (e) => {
  const d = e.target.closest('[data-day]'), ev = e.target.closest('[data-ev]'), a = e.target.closest('[data-sch]');
  // a new day starts on the bake that's live now, else its first one
  if (d) { SCH.day = +d.dataset.day; SCH.plan = null; SCH.sel = Math.max(0, schedEvents().findIndex(isLive)); buzz(6); drawSched(true); return; }
  if (ev) { const w = $('sch-wrap'), x = w.scrollLeft, mid = ev.offsetLeft + ev.offsetWidth / 2 - w.clientWidth / 2; SCH.sel = +ev.dataset.ev; buzz(6); $('live-hero').querySelector('.sch-lanes').innerHTML = schedLanes(); w.scrollLeft = x; w.scrollTo({ left: Math.max(0, mid), behavior: reduced ? 'auto' : 'smooth' }); schedCardSwap(); return; }
  const at = e.target.closest('[data-pat]'), ln = e.target.closest('[data-plen]'), inv = e.target.closest('[data-inv]');
  if (at) { SCH.plan.at = +at.dataset.pat; buzz(6); schedCardSwap(); return; }
  if (ln) { SCH.plan.len = +ln.dataset.plen; buzz(6); schedCardSwap(); return; }
  if (inv) { const w = SCH.plan.who, n = inv.dataset.inv; w.includes(n) ? w.splice(w.indexOf(n), 1) : w.push(n); buzz(6); schedCardSwap(); return; }
  if (!a) return;
  const act = a.dataset.sch, list = SCHED[SCH.day], cur = schedEvents()[SCH.sel];
  if (act === 'join') { const f = FRIENDS.find((x) => x.n === cur.who); if (f) joinFriend(f.n); else { together = cur.who; startBake(Math.max(5, Math.round(cur.len - (nowH() - cur.at) * 60)), CARRY); } }
  else if (act === 'remind') { buzz(8); toast(`<b>Reminder set</b><span>10 min before ${esc(cur.label)}${isLive(cur) ? '’s next round' : ` at ${hhmm(cur.at)}`}</span>`); }
  else if (act === 'in') { const i = cur.with.indexOf('Leqi'); if (i < 0) { cur.with.push('Leqi'); toast(`<b>You’re in</b><span>${esc(cur.label)} at ${hhmm(cur.at)} · reminder set</span>`); } else { cur.with.splice(i, 1); toast('<span>You left. The reminder is off.</span>'); } buzz([8, 20, 8]); drawSched(); }
  // getting ready: the recipe whose length matches, so the bake is set up before it starts
  else if (act === 'ready') { const r = RECIPES.find((x) => x.rounds * x.len === cur.len) || RECIPES.find((x) => x.rounds * x.len >= cur.len) || recipe; pickRecipe(r.id); present('recipe'); }
  else if (act === 'share') toast('<b>Link copied</b><span>Anyone with it can pull up a stool</span>');
  else if (act === 'cancel') { SCH.plan = null; SCH.sel = 0; drawSched(); }
  else if (act === 'send') {
    // the plan becomes a real bake on the timeline, with you and whoever you invited
    const pl = SCH.plan, ev = { who: 'Leqi', label: 'Your bake', at: pl.at, len: pl.len, lane: 2, with: ['Leqi'], invited: [...pl.who] }; list.push(ev);
    ev.invited.forEach((n, k) => setTimeout(() => { if (k > 1) return; ev.with.push(n); buzz([8, 20, 8]); toast(`<b>${esc(n)}’s in</b><span>${esc(ev.label)} at ${hhmm(ev.at)}</span>`); if (tab === 'rooms' && !stack.length) drawSched(); }, 2600 + k * 2200));
    SCH.plan = null; SCH.sel = list.length - 1; buzz([10, 30, 10]); drawSched();
    toast(`<b>${pl.who.length ? `Invited ${pl.who.join(', ')}` : 'Bake planned'}</b><span>${hhmm(pl.at)} · ${pl.len} min</span>`);
  }
});

// each room's round counts down in real seconds; a new round starts when it hits zero
function tickRooms() {
  if (tab !== 'rooms' || stack.length) { clearInterval(roomClock); roomClock = null; return; }
  ROOMS.forEach((r, i) => {
    r.left = r.left > 1 ? r.left - 1 : r.len * 60;
    if (i === sheetRoom && $('sheet-shop').classList.contains('on')) { const s = $('shop-body'); setText(s.querySelector('.tclock'), mmss(r.left)); s.querySelector('.rbar i').style.width = ((1 - r.left / (r.len * 60)) * 100).toFixed(1) + '%'; }
    const c = $('rooms').querySelector(`.rm-card[data-card="${i}"]`); if (!c) return;
    setText(c.querySelector('.tclock'), mmss(r.left));
    c.querySelector('.rbar i').style.width = ((1 - r.left / (r.len * 60)) * 100).toFixed(1) + '%';
  });
}
function liveTick() {
  if (tab !== 'rooms' || stack.length) { clearInterval(liveTimer); liveTimer = null; return; }
  const i = Math.floor(Math.random() * ROOMS.length);
  ROOMS[i].k++;
  const card = $('rooms').querySelector(`.rm-card[data-card="${i}"]`);
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
  const b = e.target.closest('.fb'); if (!b) return;
  buzz(8); friendSheet(b.dataset.f);
});
// the boards: tap a face on the podium or a row to see that person
$('leaderboard').addEventListener('click', (e) => { const w = e.target.closest('.who[data-n]'); if (w) personSheet(w.dataset.n); });
$('local-board').addEventListener('click', (e) => {
  const r = e.target.closest('[data-lb]'); if (r) { const [n, rank, h] = JSON.parse(r.dataset.lb); personSheet(n, rank, h, WHERE[RF.scope]); return; }
  if (e.target.closest('[data-lb-all]')) localSheet();
});
// arriving on Rooms: the live count counts up, cards and rows arrive, numbers and bars fill
function playRooms() {
  placeRoomLine(); drawSched(true);
  layoutRooms(); stagger($('rooms'));
  stagger($('friends-all').querySelector('.bubbles')); stagger($('leaderboard'));
  $('leaderboard').querySelectorAll('.pcol .blockp').forEach((i) => { const h = i.style.height; i.style.transition = 'none'; i.style.height = '0'; void i.offsetWidth; i.style.transition = ''; i.style.height = h; });
  $('friends-all').querySelectorAll('[data-to]').forEach((b) => { rolling.set(b, 0); roll(b, +b.dataset.to); });
  $('leaderboard').querySelectorAll('[data-to]').forEach((b) => { rolling.set(b, 0); roll(b, +b.dataset.to, (v) => `${v.toFixed(1)}h`); });
  clearInterval(liveTimer); liveTimer = setInterval(liveTick, 9000);
  clearInterval(roomClock); roomClock = setInterval(tickRooms, 1000);
}
const TABLE_KEY = 'sweet-study-table-v1';
let tableBakes = [];
try {
  const saved = JSON.parse(localStorage.getItem(TABLE_KEY) || '[]');
  if (Array.isArray(saved)) tableBakes = saved.filter(x => x && recipeById(x.recipe) && Number.isFinite(x.minutes) && x.minutes > 0 && typeof x.day === 'string');
} catch (_) {}
function tableDay() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function renderDessertTable() {
  const today = tableBakes.filter(x => x.day === tableDay());
  const mins = today.reduce((n, x) => n + x.minutes, 0);
  setText($('dessert-total'), `${today.length} ${today.length === 1 ? 'bake' : 'bakes'}`);
  setText($('dessert-note'), today.length ? 'A little collection of your day.' : 'A quiet table, for now.');
  setHTML($('dessert-table'), today.length ? today.map((x, i) => `<button type="button" class="table-dessert" data-bake="${i}" style="--dessert-size:${Math.round(54 + 46 * Math.min(x.minutes, 90) / 90)}px" aria-label="${esc(recipeById(x.recipe).name)}, ${x.minutes} minutes"><span class="dessert-art">${art(x.recipe)}</span><span class="dessert-minutes">${x.minutes}m</span></button>`).join('') : '<span class="empty-plate" aria-hidden="true"></span>');
}
function collectTableBake() {
  const minutes = Math.round((B.total - B.left) / 60);
  if (minutes <= 0) return;
  tableBakes.push({ recipe: recipe.id, minutes, day: tableDay() });
  try { localStorage.setItem(TABLE_KEY, JSON.stringify(tableBakes)); } catch (_) {}
  renderDessertTable();
}
$('dessert-table').addEventListener('click', e => {
  const button = e.target.closest('.table-dessert'); if (!button) return;
  if (!reduced) button.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(0)' }], { duration: 400 });
  const item = tableBakes.filter(x => x.day === tableDay())[Number(button.dataset.bake)];
  if (item) setText($('dessert-note'), `${recipeById(item.recipe).name} · ${item.minutes} min of focus`);
});
setInterval(renderDessertTable, 60000);
function renderTabs() {
  renderDessertTable();
  // Home: friends baking now, each face inside its own flat shape
  const frames = [['flower6', '#E3A6F7'], ['star', '#8CA7F4'], ['scallop', '#DDEB9E']];
  const more = FRIENDS.length - 3;
  renderJoinCard();
  const last = CASE[0];
  // the last dessert: what it was and how it came out, the whole block opens the case
  setHTML($('recent'), last ? `<span class="badge">${shape('star', '#8CA7F4')}${art(last.r, 'class="art"')}</span><span class="g"><span class="kk">Recently baked · ${last.when}</span><b>${recipeById(last.r).name}</b></span><span class="pill mint">${last.min} min</span>${ICON.chev}`
    : '<span class="g"><span class="kk">Recently baked</span><b>Your first dessert shows up here</b></span>');
  setText($('me-case'), CASE.length ? String(CASE.length) : '');
  setHTML($('friends-all'), FRIENDS.length ? `<div class="bubbles">${FRIENDS.map(friendBubble).join('')}</div>` : inviteRow('Nobody here yet. Invite a classmate.'));
  renderRooms();
  setHTML($('case-grid'), CASE.length ? CASE.map((c, i) => `<button type="button" data-go="case" data-i="${i}" class="case-item rounded ${c.isNew ? 'new' : ''}"><div class="art">${art(c.r)}</div><p class="t">${recipeById(c.r).name}</p><p class="s">${c.when} · ${c.min} min · ${c.tops} toppings</p><span><span class="tag hi rounded">${c.grade}</span></span></button>`).join('')
    : `<div class="empty-card rounded">${art('cupcake')}<p class="t">Your first dessert lands here</p><p class="s">Every bake you finish is kept in the case, burnt ones too.</p></div>`);
  setHTML($('shops'), SHOPS.map((s, i) => `<button class="row" type="button" data-go="shop" data-i="${i}"><span class="tile rounded" style="background:${s.c}">${art(s.menu[0][0], 'class="art"')}</span><span class="grow"><span class="t">${s.n}</span><span class="s">${s.walk}</span></span><span class="tag hi rounded">${s.off}</span>${ICON.chev}</button>`).join(''));
  setHTML($('map'), `<span class="pin me" style="left:48%;top:56%"></span>` + SHOPS.map((s, i) => `<span class="pin" style="left:${s.x}%;top:${s.y}%"><svg viewBox="0 0 30 36" width="30" height="36"><polygon points="4,0 26,0 30,4 30,22 15,36 0,22 0,4" fill="#10131A"/><polygon points="9,7 21,7 23,9 23,17 21,19 9,19 7,17 7,9" fill="${s.c}"/></svg></span>`).join(''));
  // the week as minutes per day; every number on Home and Me is summed from it
  // each bake is [recipe, minutes]; today's come from the case, so a joined 18-minute bake counts as 18
  const today = tableBakes.filter(c => c.day === tableDay()).map(c => [c.recipe, c.minutes]);
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
  TRAY = last7; TRAY_SHARE = Math.round(share);
  $('ticks').style.setProperty('--today', DAY_LOOK[DOW][1]); // today's tray cookie wears today's colour, like the big one
  setHTML($('ticks'), last7.map((d, i) => {
    const f = Math.min(1, mins(d[1]) / share), h = (f * 100).toFixed(1), id = `ck${i}`;
    return `<button type="button" class="${i === 6 ? 'now' : ''}${f >= 1 ? ' full' : ''}" data-i="${i}" aria-haspopup="dialog" aria-label="${DAY_NAMES[(DOW - (6 - i) + 14) % 7]}, ${mins(d[1])} minutes"><svg viewBox="0 0 100 100"><defs><clipPath id="${id}">${AV_SHAPES[DAY_LOOK[(DOW - (6 - i) + 14) % 7][0]](0)}</clipPath></defs>`
      + `<g clip-path="url(#${id})"><rect width="100" height="100" class="e"/><rect y="${100 - h}" width="100" height="${h}" class="f"/></g></svg><small>${d[0]}</small></button>`;
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
  setText($('hello-sub'), todayMin ? 'your day, in little moments.' : 'a little space for today.');
  // today in three numbers, like a daily focus report: score weighted by minutes, minutes with the phone down, times you left
  const todayBakes = CASE.filter((c) => c.when === 'Just now');
  const scored = todayBakes.reduce((a, c) => [a[0] + (c.score ?? 100) * c.min, a[1] + c.min], [0, 0]);
  // before today's first bake the score slot shows your average so far, greyed, instead of a dash
  const allScored = CASE.reduce((a, c) => [a[0] + (c.score ?? 100) * c.min, a[1] + c.min], [0, 0]), sc = $('ts-score');
  if (scored[1]) { roll(sc, Math.round(scored[0] / scored[1])); sc.classList.remove('muted'); setText($('ts-score-l'), 'Focus score'); }
  else if (allScored[1]) { setText(sc, String(Math.round(allScored[0] / allScored[1]))); sc.classList.add('muted'); setText($('ts-score-l'), 'Your average'); }
  else { setText(sc, '–'); sc.classList.add('muted'); setText($('ts-score-l'), 'First bake sets it'); }
  roll($('ts-free'), todayMin, (v) => { v = Math.round(v); return v >= 60 ? `${Math.floor(v / 60)}h ${v % 60}m` : `${v}m`; });
  setText($('ts-exits'), String(todayBakes.reduce((a, c) => a + (c.exits || 0), 0)));
  // today's cookie, large: the same shape as today's cookie in the week tray below, sitting right over the neck that joins them
  const tf = Math.min(1, todayMin / share);
  setCookieMood(cookieMood(tf, todayMin, streak));
  TODAY = { min: todayMin, of: Math.round(share) };
  const [dShape, dColour] = DAY_LOOK[DOW];
  // the body is the library shape in a flat colour, its corners rounded the same way the avatars' are
  setHTML($('today-ck'), `<svg viewBox="-4 -4 108 108"><g fill="${dColour}" stroke="${dColour}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">${AV_SHAPES[dShape](0)}</g></svg>`);
}

// tap a cookie in the week tray: that day's shape, its minutes against the daily share, and the desserts it made
function daySheet(i) {
  const d = TRAY[i], dow = (DOW - (6 - i) + 14) % 7, [shp, col] = DAY_LOOK[dow], total = d[1].reduce((a, b) => a + b[1], 0), pct = Math.min(100, Math.round(total / Math.max(1, TRAY_SHARE) * 100));
  showSheet(`<div class="ds"><span class="ds-shape"><svg viewBox="-4 -4 108 108" aria-hidden="true"><g fill="${col}" stroke="${col}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">${AV_SHAPES[shp](0)}</g></svg></span>
    <h3>${i === 6 ? 'Today' : DAY_NAMES[dow]}</h3>
    <p class="ds-min"><b>${total}</b> min</p>
    <span class="ds-bar"><i style="width:${pct}%;background:${col}"></i></span>
    <div class="ds-row">${d[1].length ? d[1].map(([r, m]) => `<span class="ds-d">${art(r)}<small>${m}m</small></span>`).join('') : '<span class="ds-none">No bakes</span>'}</div></div>`);
}
$('ticks').addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (!b) return; buzz(6); daySheet(+b.dataset.i); });
// with nothing baked yet the + in the menu hops now and then
function hopPlus() {
  const b = document.querySelector('#tabbar [data-go="pick"]'); if (!b || reduced) return;
  b.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-11px) scale(1.06)', offset: .35, easing: 'ease-in' }, { transform: 'translateY(0) scale(1.04, .94)', offset: .65 }, { transform: 'translateY(-3px)', offset: .82 }, { transform: 'translateY(0)' }], { duration: 640 });
}

/* today's cookie is the character: the flower is its body, and the face is bloub's.
   The face system below is ported from bloub (https://github.com/jeremy-prt/bloub), MIT licensed:

   MIT License. Copyright (c) 2026 Jérémy Perret.
   Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
   (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
   publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
   subject to the following conditions: the above copyright notice and this permission notice shall be included in all copies or
   substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
   BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
   ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

   The face is two capsules painted on a sphere: a head orientation (yaw, pitch, roll) sets where the eyes sit and how they foreshorten,
   and each eye has its own width, height, tilt and openness. Sixteen resting expressions are just sixteen sets of those numbers.
   Life is a deterministic gaze drift and a blink schedule, both pure functions of time. Changing expression glides on an ease-out, and
   the constants are the ones measured off the reference, so they are left as they are. */
const BL_TAU = Math.PI * 2, BL_clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v), BL_lerp = (a, b, t) => a + (b - a) * t;
const BL_easeOutQuint = (t) => 1 - (1 - t) ** 5;
function BL_loopNoise(t, period, seed = 0) {
  const p = (t / period) * BL_TAU;
  return 0.55 * Math.sin(p + seed) + 0.3 * Math.sin(2 * p + seed * 1.7 + 1.1) + 0.15 * Math.sin(3 * p + seed * 2.3 + 2.4);
}
function BL_rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const BL_EYE_SPLIT = 15.46, BL_EYE_W = 0.186, BL_EYE_H = 0.412, BL_REST_GAZE = { yaw: 28.49, pitch: 28.62, roll: -13 };
const BL_deg = (d) => (d * Math.PI) / 180;
function BL_spin(u, v, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [[u[0] * c + v[0] * s, u[1] * c + v[1] * s, u[2] * c + v[2] * s], [v[0] * c - u[0] * s, v[1] * c - u[1] * s, v[2] * c - u[2] * s]];
}
// where the two eyes sit on the sphere for a head orientation; index 0 is the inner eye, 1 the outer
function BL_eyePoses(gaze, scale, split = BL_EYE_SPLIT) {
  let f = [0, 0, 1], right = [1, 0, 0], down = [0, 1, 0];
  [f, right] = BL_spin(f, right, BL_deg(gaze.yaw));
  [down, f] = BL_spin(down, f, BL_deg(gaze.pitch));
  [right, down] = BL_spin(right, down, BL_deg(gaze.roll));
  const build = (side) => { const [ef, er] = BL_spin(f, right, BL_deg(split * side)); return { x: ef[0] * scale, y: ef[1] * scale, a: er[0], b: er[1], c: down[0], d: down[1], depth: ef[2] }; };
  return [build(-1), build(1)];
}
// blinks: a pre-drawn schedule, 1.9 to 4.6 s apart, now and then a double
const BL_BLINKS = (() => {
  const rng = BL_rng(0x5eed), out = []; let t = 1.4;
  while (t < 900) { out.push(t); t += 1.9 + rng() * 2.7; if (rng() < 0.18) { out.push(t); t += 0.24; } }
  return out;
})();
function BL_blinkLid(t) {
  for (let i = 0; i < BL_BLINKS.length; i++) {
    const start = BL_BLINKS[i]; if (t < start) break;
    const k = (t - start) / 0.18;
    if (k >= 0 && k <= 1) return k < 0.45 ? 1 - k / 0.45 : (k - 0.45) / 0.55;
  }
  return 1;
}
const BL_blinkScale = (lid) => 0.06 + 0.94 * BL_clamp(lid);
function BL_life(t, wander = 1) {
  return { dYaw: (BL_loopNoise(t, 11.3, 0.4) * 5.5 + BL_loopNoise(t, 3.7, 2.1) * 1.6) * wander, dPitch: (BL_loopNoise(t, 9.1, 1.3) * 4.2 + BL_loopNoise(t, 4.3, 0.7) * 1.3) * wander, dRoll: BL_loopNoise(t, 13.7, 3.2) * 2.2 * wander, lid: BL_blinkLid(t) };
}
function BL_capsule(w, h) {
  const hw = Math.max(w, 0.01) / 2, hh = Math.max(h, 0.01) / 2, r = Math.min(hw, hh), f = (v) => Math.round(v * 100) / 100;
  return `M${f(-hw)} ${f(-hh + r)}A${f(r)} ${f(r)} 0 0 1 ${f(-hw + r)} ${f(-hh)}L${f(hw - r)} ${f(-hh)}A${f(r)} ${f(r)} 0 0 1 ${f(hw)} ${f(-hh + r)}L${f(hw)} ${f(hh - r)}A${f(r)} ${f(r)} 0 0 1 ${f(hw - r)} ${f(hh)}L${f(-hw + r)} ${f(hh)}A${f(r)} ${f(r)} 0 0 1 ${f(-hw)} ${f(hh - r)}Z`;
}
// the sixteen resting expressions: head orientation, eye spacing, and each eye's width, height, tilt (degrees, mirrored for the other eye) and openness
const BL_eye = (w, h, tilt = 0, open = 1) => ({ w, h, tilt, open });
const BL_pair = (w, h, tilt = 0, open = 1) => [BL_eye(w, h, tilt, open), BL_eye(w, h, -tilt, open)];
const BL_EXPR = {
  neutre: { gaze: { ...BL_REST_GAZE }, split: BL_EYE_SPLIT, eyes: [BL_eye(BL_EYE_W, BL_EYE_H), BL_eye(BL_EYE_W, BL_EYE_H)] },
  attentif: { gaze: { yaw: 4, pitch: 5, roll: -4 }, split: 16, eyes: BL_pair(0.21, 0.44) },
  surpris: { gaze: { yaw: 3, pitch: -3, roll: 0 }, split: 19, eyes: BL_pair(0.45, 0.47) },
  excite: { gaze: { yaw: 6, pitch: -14, roll: 0 }, split: 19.5, eyes: BL_pair(0.4, 0.56, -10) },
  heureux: { gaze: { yaw: 5, pitch: 9, roll: 0 }, split: 17, eyes: BL_pair(0.27, 0.17, 14) },
  hilare: { gaze: { yaw: 4, pitch: 14, roll: 0 }, split: 18, eyes: BL_pair(0.34, 0.13, 20) },
  colere: { gaze: { yaw: 3, pitch: 7, roll: 0 }, split: 17, eyes: BL_pair(0.34, 0.15, 30) },
  triste: { gaze: { yaw: 3, pitch: -13, roll: 0 }, split: 16, eyes: BL_pair(0.22, 0.4, -28) },
  effraye: { gaze: { yaw: 2, pitch: -20, roll: 0 }, split: 20.5, eyes: BL_pair(0.4, 0.6) },
  mefiant: { gaze: { yaw: 12, pitch: 6, roll: -6 }, split: 16, eyes: [BL_eye(0.21, 0.4), BL_eye(0.22, 0.15)] },
  confus: { gaze: { yaw: -14, pitch: 3, roll: 8 }, split: 16.5, eyes: [BL_eye(0.2, 0.44, -18), BL_eye(0.28, 0.17, 14)] },
  curieux: { gaze: { yaw: 16, pitch: -9, roll: -15 }, split: 16.5, eyes: [BL_eye(0.24, 0.46, -8), BL_eye(0.2, 0.38, -8)] },
  fier: { gaze: { yaw: 5, pitch: 17, roll: 0 }, split: 17, eyes: BL_pair(0.3, 0.15, 18) },
  timide: { gaze: { yaw: -19, pitch: -14, roll: -7 }, split: 14, eyes: BL_pair(0.17, 0.3) },
  blase: { gaze: { yaw: -22, pitch: 2, roll: 0 }, split: 16, eyes: BL_pair(0.3, 0.12) },
  somnolent: { gaze: { yaw: 6, pitch: -9, roll: -3 }, split: 16, eyes: BL_pair(0.2, 0.42, 0, 0.42) },
};
// English names, so ?mood=happy works as well as ?mood=heureux
const BL_NAMES = { calm: 'neutre', focused: 'attentif', surprised: 'surpris', excited: 'excite', happy: 'heureux', laughing: 'hilare', angry: 'colere', sad: 'triste', scared: 'effraye', suspicious: 'mefiant', confused: 'confus', curious: 'curieux', proud: 'fier', shy: 'timide', bored: 'blase', sleepy: 'somnolent' };
// the six states of today, as expressions
const CK_EXPR = { sleepy: 'somnolent', curious: 'curieux', smile: 'heureux', focus: 'attentif', joy: 'hilare', worried: 'effraye' };
const BL_blendExpr = (a, b, t) => ({
  gaze: { yaw: BL_lerp(a.gaze.yaw, b.gaze.yaw, t), pitch: BL_lerp(a.gaze.pitch, b.gaze.pitch, t), roll: BL_lerp(a.gaze.roll, b.gaze.roll, t) },
  split: BL_lerp(a.split, b.split, t),
  eyes: [0, 1].map((i) => ({ w: BL_lerp(a.eyes[i].w, b.eyes[i].w, t), h: BL_lerp(a.eyes[i].h, b.eyes[i].h, t), tilt: BL_lerp(a.eyes[i].tilt || 0, b.eyes[i].tilt || 0, t), open: BL_lerp(a.eyes[i].open, b.eyes[i].open, t) })),
});
// small props that make a mood easier to read, drawn big on purpose
const spk = (x, y, r, c = '#FFC21A') => `<path class="spark" d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="${c}"/>`;
const SWEAT = '<path class="drop" d="M27 -30C33 -21 35 -16 33 -12C31 -7 23 -7 21 -12C19 -16 21 -21 27 -30Z" fill="#6FBFFF"/><path d="M24 -14q1 3 4 3" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>';
const CK_ACC = {
  hilare: spk(27, -26, 10) + spk(-29, -15, 6.5, '#FF8FC8') + spk(31, -4, 5),
  excite: spk(27, -26, 10) + spk(-29, -15, 6.5, '#FF8FC8'),
  effraye: SWEAT, triste: SWEAT, timide: SWEAT,
  curieux: '<text class="qm" x="21" y="-17" font-size="26" font-weight="800" fill="#6A4DFF" font-family="inherit">?</text>',
  confus: '<text class="qm" x="21" y="-17" font-size="26" font-weight="800" fill="#6A4DFF" font-family="inherit">?</text>',
};
const CK_TIP = {
  curious: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#E3E9FD"/><path d="M12 7v5l3.4 2" fill="none" stroke="#2F4FC0" stroke-width="2.2" stroke-linecap="round"/></svg>',
  worried: '<svg viewBox="0 0 24 24"><path d="M12 22c-4 0-7-2.8-7-6.6 0-3.4 2.6-5.3 3.6-8.4.6 1.6 1.6 2.6 2.6 3 .2-3.4 1.8-6.2 4.3-8 0 4 4.5 6.4 4.5 12.5 0 4.4-3.4 7.5-8 7.5z" fill="#FF8A5B"/><path d="M12 22c-1.9 0-3.2-1.3-3.2-3 0-2 1.6-3 2.2-4.8 1.6 1.3 4.2 2.6 4.2 5 0 1.7-1.3 2.8-3.2 2.8z" fill="#FFD36B"/></svg>',
  joy: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z" fill="#F5C542"/></svg>',
};
// which mood today is in
function cookieMood(tf, todayMin, streak) {
  if (B.timer && B.left > 0) return 'focus';
  if (tf >= 1) return 'joy';
  const soon = (SCHED[0] || []).some((e) => e.with?.includes('Leqi') && e.at > nowH() && (e.at - nowH()) * 60 <= 60);
  if (soon) return 'curious';
  if (!todayMin) return new Date().getHours() >= 20 && streak > 0 ? 'worried' : 'sleepy';
  return 'smile';
}
// the face's live state
const EYE = { prev: BL_EXPR.somnolent, cur: BL_EXPR.somnolent, id: 'somnolent', since: -9, base: 'somnolent', react: null, mood: 'sleepy', blinkAt: -9, fy: 0, fp: 0, ty: 0, tp: 0, lookAt: 0 };
// demo: ?mood=happy (or any of the 16 names, or sleepy / curious / smile / focus / worried / joy) shows that face whatever today holds
const MOOD_DEMO = new URLSearchParams(location.search).get('mood');
const demoExpr = (m) => (BL_EXPR[m] ? m : BL_NAMES[m] || CK_EXPR[m] || null);
// glide to another expression from wherever the face is now, with a blink to cover the change
function glideTo(id, t) {
  if (id === EYE.id) return;
  const k = BL_easeOutQuint(BL_clamp((t - EYE.since) / 0.55));
  EYE.prev = k < 1 ? BL_blendExpr(EYE.prev, EYE.cur, k) : EYE.cur; EYE.cur = BL_EXPR[id]; EYE.id = id; EYE.since = t; EYE.blinkAt = t;
}
function setCookieMood(mood) {
  const want = demoExpr(MOOD_DEMO) || CK_EXPR[mood];
  const fc = $('today-face'); if (fc.dataset.mood === mood + want) return;
  const first = !fc.firstChild;
  if (first) fc.innerHTML = '<svg viewBox="-36 -36 72 72" aria-hidden="true"><path class="eye"/><path class="eye"/><g class="acc"></g></svg>';
  fc.dataset.mood = mood + want; $('today-btn').dataset.mood = mood; EYE.mood = mood; EYE.base = want;
  fc.querySelector('.acc').innerHTML = CK_ACC[want] || '';
  $('ck-tip').innerHTML = CK_TIP[mood] || '';
  if (first) { EYE.prev = EYE.cur = BL_EXPR[want]; EYE.id = want; }
  // a change of mood starts with a quick squash, like drawing a breath
  else if (!reduced) fc.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1, .86)', offset: .35 }, { transform: 'scale(.98, 1.04)', offset: .7 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
  drawFace(performance.now());
}
// a reaction laid over the mood for a moment (a tap makes it surprised), then back
const reactFace = (id, ms) => { EYE.react = { id, until: performance.now() + ms }; };
function drawFace(now) {
  const svg = $('today-face').firstChild; if (!svg) return;
  const t = now / 1000;
  glideTo(EYE.react && now < EYE.react.until ? EYE.react.id : EYE.base, t);
  const E = BL_blendExpr(EYE.prev, EYE.cur, BL_easeOutQuint(BL_clamp((t - EYE.since) / 0.55)));
  const life = BL_life(t, EYE.mood === 'sleepy' ? .5 : 1);
  // it looks about on its own: a quick turn to somewhere, a hold, now and then back to the middle (a sleepy face hardly moves)
  if (now > EYE.lookAt) {
    const sleepy = EYE.mood === 'sleepy';
    EYE.lookAt = now + (EYE.mood === 'curious' ? 800 : 1500) + Math.random() * (EYE.mood === 'curious' ? 1200 : 2600);
    if (Math.random() < .28) { EYE.ty = 0; EYE.tp = 0; } else { EYE.ty = (Math.random() * 2 - 1) * (sleepy ? 6 : 28); EYE.tp = (Math.random() * 2 - 1) * (sleepy ? 4 : 20); }
  }
  EYE.fy += (EYE.ty - EYE.fy) * .2; EYE.fp += (EYE.tp - EYE.fp) * .2;
  const gaze = { yaw: E.gaze.yaw + life.dYaw + EYE.fy, pitch: E.gaze.pitch + life.dPitch + EYE.fp, roll: E.gaze.roll + life.dRoll };
  // a blink on top of the schedule whenever the expression changes
  const forced = BL_clamp((t - EYE.blinkAt) / 0.2), lid = Math.min(life.lid, forced < 1 ? Math.abs(forced * 2 - 1) : 1);
  const R = DAY_LOOK[DOW][2] * 0.6667 * 0.92, poses = BL_eyePoses(gaze, R, E.split), f = (v) => Math.round(v * 100) / 100;
  svg.querySelectorAll('.eye').forEach((el, i) => {
    const e = poses[i], cfg = E.eyes[i];
    if (e.depth <= 0.02) { el.setAttribute('opacity', 0); return; }
    // the eye's own tilt is composed with the sphere's tangent frame, then a blink squashes it vertically on screen
    const phi = (cfg.tilt * Math.PI) / 180, cp = Math.cos(phi), sp = Math.sin(phi);
    const ax = e.a * cp + e.c * sp, ay = e.b * cp + e.d * sp, cx = -e.a * sp + e.c * cp, cy = -e.b * sp + e.d * cp, k = BL_blinkScale(Math.min(lid, cfg.open));
    el.setAttribute('d', BL_capsule(cfg.w * R, cfg.h * R));
    el.setAttribute('transform', `matrix(${f(ax)},${f(ay * k)},${f(cx)},${f(cy * k)},${f(e.x)},${f(e.y)})`);
    el.setAttribute('fill', '#1B1D2A'); el.setAttribute('opacity', f(BL_clamp(e.depth / 0.12)));
  });
}
(function faceLoop(now) {
  if (tab === 'home' && !stack.length && !document.hidden) drawFace(now);
  requestAnimationFrame(faceLoop);
})(performance.now());
// arriving on Home it wakes: a blink, then the eyes open
function wakeFace() {
  EYE.blinkAt = performance.now() / 1000;
  if (!reduced) $('today-btn').querySelector('.ck-hop').animate([{ transform: 'scale(.55) rotate(-14deg)', opacity: 0 }, { transform: 'scale(1.12) rotate(4deg)', opacity: 1, offset: .55 }, { transform: 'scale(.97)', offset: .8 }, { transform: 'none' }], { duration: 560, easing: 'cubic-bezier(.3,1.3,.5,1)' });
}
let TODAY = { min: 0, of: 0 }, bubTimer = null, ckTapped = false, ckTick = 0;
// the idle clock: blinks, floating z's or steam, and the hop with its icon
setInterval(() => {
  if (tab !== 'home' || stack.length || reduced) return;
  ckTick++;
  const f = $('today-face'), mood = f.dataset.mood;
  if (mood === 'sleepy' && ckTick % 2 === 0) {
    const z = document.createElement('span'); z.className = `ck-puff ${mood}`; z.textContent = mood === 'sleepy' ? 'z' : '';
    $('today-btn').appendChild(z);
    z.animate([{ opacity: 0, transform: 'translate(0,0) scale(.6)' }, { opacity: 1, offset: .25 }, { opacity: 0, transform: `translate(${mood === 'sleepy' ? 16 : 4}px, -34px) scale(1.25)` }], { duration: 2200, easing: 'ease-out' }).onfinish = () => z.remove();
  }
  if (ckTick % 17 === 4) ckSay();
  if (ckTick % 11 === 7 && TODAY.min === 0) hopPlus();
  // the hop: often until you've tapped it once, then now and then
  if (ckTick % (ckTapped ? 24 : 7) === 0) {
    $('today-btn').querySelector('.ck-hop').animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-12px) rotate(-7deg)', offset: .35, easing: 'ease-in' }, { transform: 'translateY(0) scale(1.06,.92)', offset: .65 }, { transform: 'translateY(-3px)', offset: .82 }, { transform: 'translateY(0)' }], { duration: 640 });
    const tip = $('ck-tip');
    if (tip.innerHTML) tip.animate([{ opacity: 0, transform: 'translate(0,6px) scale(.5)' }, { opacity: 1, transform: 'translate(0,0) scale(1)', offset: .2 }, { opacity: 1, transform: 'translate(0,-4px) scale(1)', offset: .8 }, { opacity: 0, transform: 'translate(0,-8px) scale(.8)' }], { duration: 2000, easing: 'ease-out' });
  }
}, 800);
// every so often, while Home is quiet, it says something short about what you can do
// every face has its own words, keyed by the expression it is showing. What it says when it is quiet:
const CK_SAY = {
  neutre: ['Hello there', 'Ready when you are'],
  attentif: ['Door stays shut', 'Almost there'],
  surpris: ['Whoa, already?', 'Did you see that?'],
  excite: ['A new bake?!', 'Friends are baking!'],
  heureux: ['Nice start!', 'One more round?', 'Friends are baking now'],
  hilare: ['Today’s goal done!', 'You’ve earned a rest'],
  colere: ['No phones allowed!', 'Distractions: out!'],
  triste: ['I missed you today', 'Nothing baked yet…'],
  effraye: ['Bake today to keep your streak', 'Even 25 min counts'],
  mefiant: ['Was that a notification?', 'Hmm, are you sure?'],
  confus: ['Where did today go?', 'Which dessert today?'],
  curieux: ['Your bake starts soon', 'Get ready in Rooms'],
  fier: ['Look at your streak!', 'Best week so far'],
  timide: ['Not sure where to start?', 'A short bake is fine'],
  blase: ['Same old day…', 'Surprise me with a bake'],
  somnolent: ['Nothing baked yet', 'Press + when you’re ready', 'Plan a bake in Rooms'],
};
// and what it says when you poke it: [words, the face it makes while it says them]
const CK_TAP = {
  neutre: [['Hi!', 'heureux'], ['Need something?', 'curieux']],
  attentif: [['Shh, focus time', 'attentif'], ['Door’s still shut', 'mefiant'], ['Keep going!', 'fier']],
  surpris: [['Whoa!', 'surpris'], ['Again?!', 'excite']],
  excite: [['Let’s bake!', 'excite'], ['So excited!', 'hilare']],
  heureux: [['Hehe, that tickles', 'hilare'], ['You’re doing great', 'fier'], ['I like this table', 'heureux'], ['Poke!', 'surpris']],
  hilare: [['Yay!', 'excite'], ['Best day ever!', 'hilare'], ['Do it again!', 'excite'], ['We did it!', 'fier']],
  colere: [['Grr, no phones!', 'colere'], ['Stay focused!', 'attentif']],
  triste: [['I missed you…', 'triste'], ['Bake with me?', 'timide']],
  effraye: [['Please bake today…', 'triste'], ['My streak!', 'effraye'], ['Just 25 minutes?', 'timide'], ['Don’t leave me hanging', 'triste']],
  mefiant: [['Hmm, suspicious…', 'mefiant'], ['Is that your phone?', 'colere']],
  confus: [['Huh?', 'confus'], ['What day is it?', 'curieux']],
  curieux: [['Ooh, what’s next?', 'curieux'], ['Is it time yet?', 'attentif'], ['I heard a timer!', 'surpris'], ['Peek-a-boo!', 'excite']],
  fier: [['Look at me!', 'fier'], ['Top baker!', 'hilare']],
  timide: [['Oh! Hi…', 'timide'], ['Just a short one?', 'heureux']],
  blase: [['Meh.', 'blase'], ['Wake me for dessert', 'somnolent']],
  somnolent: [['Zzz… five more minutes', 'somnolent'], ['Hey, I’m sleeping!', 'surpris'], ['Mm? Is it morning?', 'confus'], ['Just a little nap…', 'somnolent']],
};
let tapN = 0, tapPick = 0;
let sayN = 0, sayTimer = null;
function ckSay() {
  const bub = $('today-bub'), el = $('ck-say'), lines = CK_SAY[EYE.base]; if (!lines || !bub.hidden) return;
  el.textContent = lines[sayN++ % lines.length]; el.hidden = false;
  if (!reduced) el.animate([{ opacity: 0, transform: 'translateY(6px) scale(.8)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.3,1.4,.5,1)' });
  clearTimeout(sayTimer); sayTimer = setTimeout(() => { if (reduced) { el.hidden = true; return; } el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220 }).onfinish = () => { el.hidden = true; }; }, 3600);
}
$('today-btn').addEventListener('click', () => {
  const b = $('today-btn'), bub = $('today-bub'); buzz([6, 30, 6]); ckTapped = true; $('ck-say').hidden = true;
  // squeeze shut, then pop wide open, then settle back into the mood
  if (!reduced) {
    b.animate([{ scale: '1 1', rotate: '0deg' }, { scale: '1.12 .86', rotate: '-6deg', offset: .25 }, { scale: '.92 1.1', rotate: '5deg', offset: .5 }, { scale: '1.04 .97', rotate: '-2deg', offset: .75 }, { scale: '1 1', rotate: '0deg' }], { duration: 520, easing: 'ease-out' });
    const app = $('app').getBoundingClientRect(), k = APP_W / app.width, r = b.getBoundingClientRect(), cx = (r.left + r.width / 2 - app.left) * k, cy = (r.top + r.height / 2 - app.top) * k;
    for (let i = 0; i < 9; i++) {
      const c = document.createElement('span'); c.className = 'crumb'; c.style.left = `${cx - 4}px`; c.style.top = `${cy - 4}px`; c.style.background = ['#8CA7F4', '#E3E9FD', '#F5C542', '#FFC4F8'][i % 4]; $('app').appendChild(c);
      const a = Math.PI * (1.05 + Math.random() * .9), d = 40 + Math.random() * 40;
      c.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d + 30}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }], { duration: 650 + Math.random() * 250, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => c.remove();
    }
  }
  const done = TODAY.min >= TODAY.of;
  // tapping it never starts a bake (that's the + in the menu): it answers in character, and every third tap shows how today is going
  tapN++;
  const lines = CK_TAP[EYE.base] || CK_TAP.heureux;
  if (tapN % 3 === 0) {
    bub.innerHTML = `<span>${TODAY.min}<small> / ${TODAY.of} min today</small></span><span class="tb"><i style="width:${Math.min(100, Math.round(TODAY.min / Math.max(1, TODAY.of) * 100))}%"></i></span>`;
    reactFace(done ? 'hilare' : 'heureux', 2000);
  } else {
    const [txt, face] = lines[tapPick++ % lines.length];
    bub.innerHTML = `<span>${txt}</span>`; reactFace(face, 2000);
  }
  bub.hidden = false; if (!reduced) bub.animate([{ opacity: 0, scale: .6 }, { opacity: 1, scale: 1 }], { duration: 300, easing: 'cubic-bezier(.3,1.5,.5,1)' });
  clearTimeout(bubTimer); bubTimer = setTimeout(() => { bub.hidden = true; }, 3200);
});

// arriving on Home: the greeting comes into focus, numbers count up from zero and every cookie fills from empty
function playHome() {
  wakeFace();
  rewind($('ts-free'), $('ts-score'), $('week-pct'), $('today-min'));
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
function closeSheet(id) { if (id === 'sheet-shop') { sheetRedraw = null; sheetRoom = -1; } $(id).classList.remove('on'); $(id).setAttribute('aria-hidden', 'true'); $('scrim').classList.remove('on'); }
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
  if (!B.timer) return;
  collectTableBake();
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
  metNow = metNext; metNext = null; renderMet();
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
