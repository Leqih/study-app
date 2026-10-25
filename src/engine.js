const C = {
  ink: '#10131A', pink: '#FF9EF2', pinkL: '#FFB6F6', pinkD: '#E57BD6',
  sky: '#22BFFF', skyL: '#7FD9FF', skyLL: '#A6E6FF', skyD: '#1AA6E0', skyDD: '#1590C4',
  mint: '#14DFC6', lemon: '#FFE600', lemonL: '#FFF07A', lemonD: '#F2C400', caramel: '#DE9F38', caramelD: '#C2852A',
  cream: '#FFF6E6', creamD: '#EADCC0', white: '#FFFFFF', flour: '#FFFFFF', flourD: '#EFE6D8', flourDD: '#E2D6C2',
  wall: '#FFF6E6', wallL: '#FFFAF1', wallD: '#FBEEDB', counter: '#F6E1B8', counterL: '#FAEBCB', counterD: '#EFD3A0',
};
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const APP_W = 402, APP_H = 874; // iPhone 16 Pro screen, in points
const CW = APP_W, H = 444;      // kitchen canvas, full screen width
const OX = (CW - 358) / 2;      // scene art is laid out on a 358-wide stage, centred
const COUNTER_Y = 336;
const MAX_G = 900, G_PER_GRAIN = 1.5, GRAIN_VOLUME = 2.4;
let RECIPE_G = 500; const PERFECT_WINDOW = 30; // set from the chosen recipe
const IDEAS = ['Learn Unit 3 vocabulary', 'Finish 12 math problems', 'Outline the essay', 'Review lecture notes'];
const $ = (id) => document.getElementById(id);
const buzz = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = { out: (t) => 1 - Math.pow(1 - t, 3), inOut: (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 };
const esc = (s) => s.replace(/[<&>"]/g, (ch) => ({ '<': '&lt;', '&': '&amp;', '>': '&gt;', '"': '&quot;' }[ch]));
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- canvas ---------- */
const cv = $('cv'), ctx = cv.getContext('2d');
const fx = $('fx'), fctx = fx.getContext('2d');
let dpr = 1;
function fit() {
  // Phone-sized windows show the bare app filling the screen; anything wider shows it in a device frame.
  const bare = innerWidth <= 480, studio = $('studio');
  studio.classList.toggle('bare', bare);
  const w = bare ? APP_W : 424, h = bare ? APP_H : 896, pad = bare ? 0 : 24;
  const s = Math.min(bare ? Infinity : 1, (innerWidth - pad) / w, (innerHeight - pad) / h);
  $('device').style.setProperty('--s', String(s));
  dpr = Math.min(3, (window.devicePixelRatio || 1) * Math.max(1, s));
  cv.width = CW * dpr; cv.height = H * dpr;
  const r = $('app').getBoundingClientRect();
  fx.width = r.width * dpr; fx.height = r.height * dpr;
}
fit(); addEventListener('resize', fit);
function poly(c, pts, fill) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fillStyle = fill; c.fill(); }
function oct(cx, cy, r) { const k = r * .414; return [cx - k, cy - r, cx + k, cy - r, cx + r, cy - k, cx + r, cy + k, cx + k, cy + r, cx - k, cy + r, cx - r, cy + k, cx - r, cy - k]; }
// Paper grain multiplied over the kitchen, so flat fills read as paper while edges stay crisp.
const grain = (() => {
  const g = document.createElement('canvas'); g.width = g.height = 128;
  const gc = g.getContext('2d'), img = gc.createImageData(128, 128), r = rng(7);
  for (let i = 0; i < img.data.length; i += 4) { const v = 222 + r() * 33; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  gc.putImageData(img, 0, 0); return g;
})();
let grainPattern = null;

/* ---------- state ---------- */
const S = {
  scene: 'pour', prevScene: null, sceneT: 1,
  grams: 0, pouring: false, bagAngle: 0.17, bagVel: 0, sink: 0, sinkVel: 0, jitter: 0, spawnAcc: 0,
  grains: [], dust: [], heights: new Float32Array(34), landed: 0,
  eggsUsed: [false, false, false], crack: null, yolks: [], goals: [], asking: null, editing: null, autoTarget: 0,
  turns: 0, lastAngle: null, stirring: false, whisk: { x: 179, y: 120, vx: 0, vy: 0, tx: 179, ty: 120 }, trail: [],
  lastMoveT: 0, tooFast: 0, splash: [], drag: null, eggBack: null, flash: 0, pourSrc: null,
  breathT: 0, shake: 0, confetti: [], done: false, lastBucket: 0, cueTick: -1,
};
const lumps = (() => {
  const r = rng(42), out = [];
  for (let i = 0; i < 18; i++) { const flour = i % 3 !== 0; out.push({ a: r() * Math.PI * 2, rad: 18 + r() * 80, size: (flour ? 9 : 7) + r() * 12, spin: r() * Math.PI, flour, sides: 5 + (i % 3) }); }
  return out;
})();

/* ---------- shared art (stage coordinates, 358 wide) ---------- */
const BOWL = { cx: 179, rimY: 200, rimHalf: 116, botHalf: 62, botY: 284 };
const PILE = { x0: 78, x1: 280, baseY: 207 };
const BAG = { x: 92, y: 128, len: 104 };
const colW = (PILE.x1 - PILE.x0) / S.heights.length;
const CB = { cx: 179, rimY: 246, rimHalf: 112, botHalf: 60, botY: 318 };
const SLOTS = [89, 179, 269], EGG_Y = 372;
const WB = { cx: 179, cy: 182, r: 136, batter: 114 };

function drawWall(c) {
  // glazed tiles with grout, each tile split into a lit and a plain triangle
  poly(c, [0, 0, CW, 0, CW, COUNTER_Y, 0, COUNTER_Y], '#F1E0C2');
  const T = 46;
  for (let y = 0; y < COUNTER_Y; y += T) for (let x = 0; x < CW; x += T) {
    poly(c, [x + 2, y + 2, x + T - 1, y + 2, x + T - 1, y + T - 1, x + 2, y + T - 1], C.wall);
    poly(c, [x + 2, y + 2, x + T - 1, y + 2, x + 2, y + T - 1], C.wallL);
  }
  // wooden shelf with a sugar jar and a sprinkle jar
  const sx = 262, sy = 92;
  poly(c, [sx + 14, sy + 10, sx + 22, sy + 10, sx + 22, sy + 30, sx + 14, sy + 22], C.caramelD);
  poly(c, [sx + 108, sy + 10, sx + 116, sy + 10, sx + 116, sy + 22, sx + 108, sy + 30], C.caramelD);
  poly(c, [sx, sy, CW, sy, CW, sy + 10, sx, sy + 10], C.caramel);
  poly(c, [sx, sy, sx + 50, sy, sx + 46, sy + 4, sx, sy + 4], '#F0BE68');
  jar(c, sx + 22, sy, 30, 46, C.pink, '#FFFFFF', 'SUGAR');
  jar(c, sx + 70, sy, 26, 36, C.mint, null, null);
  // the shelf throws a hard shadow on the tiles
  poly(c, [sx, sy + 10, CW, sy + 10, CW, sy + 16, sx + 6, sy + 16], 'rgba(150,96,30,.14)');
  // counter: front edge, planks and facets
  poly(c, [0, COUNTER_Y, CW, COUNTER_Y, CW, COUNTER_Y + 8, 0, COUNTER_Y + 8], C.caramel);
  poly(c, [0, COUNTER_Y, CW, COUNTER_Y, CW, COUNTER_Y + 2, 0, COUNTER_Y + 2], '#F0BE68');
  poly(c, [0, COUNTER_Y + 8, CW, COUNTER_Y + 8, CW, H, 0, H], C.counter);
  poly(c, [0, COUNTER_Y + 8, 150, COUNTER_Y + 8, 40, H, 0, H], C.counterL);
  poly(c, [CW, COUNTER_Y + 30, CW, H, 260, H], C.counterD);
  c.fillStyle = 'rgba(150,96,30,.16)'; for (let x = 66; x < CW; x += 80) c.fillRect(x, COUNTER_Y + 8, 2, H - COUNTER_Y);
}
function jar(c, x, base, w, h, lid, sticker, label) {
  const top = base - h;
  poly(c, [x, top + 8, x + w, top + 8, x + w, base, x, base], 'rgba(205,242,255,.75)');
  poly(c, [x + w * .62, top + 8, x + w, top + 8, x + w, base, x + w * .62, base], 'rgba(127,217,255,.55)');
  poly(c, [x + 3, top + 12, x + 7, top + 12, x + 7, base - 4, x + 3, base - 4], 'rgba(255,255,255,.8)');
  if (sticker) { // sugar: white crystals, pink label
    poly(c, [x + 2, base - h * .55, x + w - 2, base - h * .55, x + w - 2, base - 2, x + 2, base - 2], '#FFFFFF');
    poly(c, [x + 4, base - 22, x + w - 4, base - 22, x + w - 4, base - 12, x + 4, base - 12], lid);
    c.fillStyle = C.ink; c.font = '500 6px "DM Mono", ui-monospace, monospace'; c.textAlign = 'center'; c.fillText(label, x + w / 2, base - 15);
  } else { // sprinkles
    const cols = [C.pink, C.sky, C.lemon, C.caramel, '#FFFFFF'];
    for (let k = 0; k < 18; k++) { c.fillStyle = cols[k % 5]; c.fillRect(x + 3 + (k * 7) % (w - 8), base - 4 - Math.floor(k / 4) * 4, 4, 2); }
  }
  poly(c, [x - 2, top, x + w + 2, top, x + w + 2, top + 9, x - 2, top + 9], lid);
  poly(c, [x + w * .6, top, x + w + 2, top, x + w + 2, top + 9, x + w * .6, top + 9], 'rgba(16,19,26,.15)');
}
function drawCounterTop(c) {
  // top-down butcher block: planks with seams, plus a striped tea towel in the corner
  for (let y = 0, k = 0; y < H; y += 54, k++) {
    poly(c, [0, y, CW, y, CW, y + 54, 0, y + 54], k % 2 ? '#F3DAAD' : C.counter);
    poly(c, [0, y, CW, y, CW, y + 2, 0, y + 2], 'rgba(150,96,30,.18)');
    poly(c, [(k * 97) % CW, y + 2, (k * 97) % CW + 120, y + 2, (k * 97) % CW + 100, y + 54, (k * 97) % CW - 20, y + 54], 'rgba(255,255,255,.22)');
  }
  c.save(); c.translate(18, 330); c.rotate(-.18);
  poly(c, [0, 0, 110, 0, 110, 120, 0, 120], '#FFFFFF');
  for (let s = 10; s < 110; s += 26) poly(c, [s, 0, s + 8, 0, s + 8, 120, s, 120], C.mint);
  poly(c, [0, 0, 110, 0, 110, 6, 0, 6], '#DCE9E6');
  c.restore();
}
// Five vertical planes from lit (left) to shaded (right), so the bowl reads as a faceted ceramic body.
const BOWL_PLANES = ['#8FDDFF', '#5ACEFF', '#33C4FF', '#1DAFEA', '#1593CA'];
function contactShadow(c, cx, y, half) { poly(c, [cx - half, y, cx + half, y, cx + half - 14, y + 7, cx - half + 14, y + 7], 'rgba(150,96,30,.18)'); }
function drawBowlSide(c, cx, rimY, half, botHalf, botY, back) {
  if (back) {
    // inner wall seen through the opening, darker on the far side
    poly(c, [cx - half + 6, rimY + 4, cx, rimY + 4, cx, rimY + 24, cx - half + 26, rimY + 20], '#137FAE');
    poly(c, [cx, rimY + 4, cx + half - 6, rimY + 4, cx + half - 26, rimY + 20, cx, rimY + 24], '#1A92C8');
    return;
  }
  contactShadow(c, cx, botY + 10, botHalf + 18);
  const n = BOWL_PLANES.length;
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n;
    poly(c, [lerp(cx - half, cx + half, t0), rimY + 9, lerp(cx - half, cx + half, t1), rimY + 9, lerp(cx - botHalf, cx + botHalf, t1), botY, lerp(cx - botHalf, cx + botHalf, t0), botY], BOWL_PLANES[i]);
  }
  // glaze highlight sliver on the lit side
  c.globalAlpha = .55; poly(c, [cx - half + 30, rimY + 16, cx - half + 40, rimY + 16, cx - botHalf + 22, botY - 10, cx - botHalf + 16, botY - 10], '#FFFFFF'); c.globalAlpha = 1;
  // foot ring
  poly(c, [cx - 44, botY, cx + 44, botY, cx + 40, botY + 11, cx - 40, botY + 11], '#1DAFEA');
  poly(c, [cx + 8, botY, cx + 44, botY, cx + 40, botY + 11, cx + 8, botY + 11], '#1593CA');
  // rim lip: thick, lit on top, a dark line under it
  poly(c, [cx - half - 6, rimY, cx + half + 6, rimY, cx + half + 2, rimY + 10, cx - half - 2, rimY + 10], '#A6E6FF');
  poly(c, [cx - half - 6, rimY, cx - half + 76, rimY, cx - half + 72, rimY + 10, cx - half - 2, rimY + 10], '#CDF2FF');
  poly(c, [cx + half - 70, rimY, cx + half + 6, rimY, cx + half + 2, rimY + 10, cx + half - 74, rimY + 10], '#7FD9FF');
  poly(c, [cx - half - 2, rimY + 10, cx + half + 2, rimY + 10, cx + half, rimY + 12, cx - half, rimY + 12], '#1593CA');
}
function drawPile(c, dy, scale) {
  // Faceted mound from the heightmap: each column's slope picks its plane (light left face, dark right face).
  const hs = S.heights, n = hs.length, pts = [];
  for (let i = 0; i <= n; i++) { const h = i === 0 ? hs[0] * .3 : i === n ? hs[n - 1] * .3 : (hs[i - 1] + hs[i]) / 2; pts.push(PILE.x0 + i * colW, PILE.baseY + dy - h * scale); }
  for (let i = 0; i < n; i++) {
    const x0 = pts[i * 2], y0 = pts[i * 2 + 1], x1 = pts[i * 2 + 2], y1 = pts[i * 2 + 3];
    if (y0 >= PILE.baseY + dy - .5 && y1 >= PILE.baseY + dy - .5) continue;
    const slope = y1 - y0;
    poly(c, [x0, y0, x1, y1, x1, PILE.baseY + dy + 4, x0, PILE.baseY + dy + 4], slope < -1.2 ? C.flour : slope > 1.2 ? C.flourDD : C.flourD);
  }
}

/* ---------- POUR ---------- */
function bagLift() { let m = 0; for (const h of S.heights) m = Math.max(m, h); return Math.min(34, Math.max(0, m - 24)); }
function bagMouth() { const a = S.bagAngle; return { x: BAG.x + Math.sin(a) * BAG.len, y: BAG.y - bagLift() - Math.cos(a) * BAG.len, dx: Math.sin(a), dy: -Math.cos(a) }; }
function drawBag(c) {
  c.save(); c.translate(BAG.x, BAG.y - bagLift()); c.rotate(S.bagAngle + S.jitter);
  // kraft paper body in three planes, with a crease and a gusset at the bottom
  poly(c, [-40, 0, 40, 0, 34, -92, -34, -92], '#F1E2C8');
  poly(c, [-40, 0, -12, 0, -16, -92, -34, -92], '#F8EEDC');
  poly(c, [14, 0, 40, 0, 34, -92, 10, -92], '#E3CFAC');
  poly(c, [-40, 0, 40, 0, 38, -8, -38, -8], '#D9C29A');
  // folded top: two zigzag folds
  poly(c, [-34, -92, 34, -92, 31, -100, 20, -96, 8, -102, -6, -96, -18, -102, -31, -98], '#E8D6B6');
  poly(c, [-31, -98, -18, -102, -6, -96, 8, -102, 20, -96, 31, -100, 27, -110, -27, -110], '#F6EAD3');
  c.fillStyle = '#C9AE82'; for (let x = -26; x <= 26; x += 7) c.fillRect(x, -94, 4, 1.6); // stitching
  // label with a wheat ear
  poly(c, [-30, -64, 30, -64, 31, -22, -31, -22], C.sky); poly(c, [0, -64, 30, -64, 31, -22, 0, -22], C.skyD);
  poly(c, [-31, -27, 31, -27, 31, -22, -31, -22], '#1593CA');
  c.fillStyle = '#fff'; c.font = '500 12px "DM Mono", ui-monospace, monospace'; c.textAlign = 'center'; c.fillText('FLOUR', 0, -32);
  poly(c, [-1, -60, 1, -60, 1, -42, -1, -42], '#FFF6E6');
  [[-49], [-53], [-57]].forEach(([y]) => { poly(c, [0, y, -6, y - 3, -4, y + 2], C.lemon); poly(c, [0, y, 6, y - 3, 4, y + 2], C.lemonD); });
  c.restore();
}
function drawScale(c, dy) {
  contactShadow(c, 179, 352, 160);
  // feet
  poly(c, [44, 352, 66, 352, 64, 358, 46, 358], C.caramelD); poly(c, [292, 352, 314, 352, 312, 358, 294, 358], C.caramelD);
  // body: four planes
  poly(c, [24, 306, 334, 306, 320, 354, 38, 354], C.pink);
  poly(c, [24, 306, 132, 306, 64, 354, 38, 354], C.pinkL);
  poly(c, [250, 306, 334, 306, 320, 354, 214, 354], C.pinkD);
  poly(c, [38, 350, 320, 350, 320, 354, 38, 354], '#D467C4');
  // stainless platform with thickness, pressed down by the weight
  poly(c, [70, 292 + dy, 288, 292 + dy, 292, 298 + dy, 66, 298 + dy], '#E9EEF2');
  poly(c, [66, 298 + dy, 292, 298 + dy, 290, 304 + dy, 68, 304 + dy], '#BFC9D2');
  poly(c, [70, 292 + dy, 150, 292 + dy, 146, 298 + dy, 66, 298 + dy], '#FFFFFF');
  poly(c, [150, 304 + dy, 208, 304 + dy, 204, 307, 154, 307], '#9AA7B3');
  // buttons
  poly(c, oct(54, 330, 7), C.mint); poly(c, [54, 323, 57, 323, 61, 327, 61, 333, 57, 337, 54, 337], '#0FBFA8');
  poly(c, oct(78, 330, 7), C.lemon); poly(c, [78, 323, 81, 323, 85, 327, 85, 333, 81, 337, 78, 337], C.lemonD);
  poly(c, [130, 312, 228, 312, 228, 348, 130, 348], '#2B303C'); // display bezel
  // The display blinks mint after a perfect pour.
  const blink = S.flash > 0 && Math.floor(S.flash * 8) % 2 === 0;
  poly(c, [134, 316, 224, 316, 224, 344, 134, 344], blink ? C.mint : C.ink);
  c.fillStyle = blink ? C.ink : C.lemon; c.font = '500 18px "DM Mono", ui-monospace, monospace'; c.textAlign = 'center'; c.fillText((S.pouring ? Math.round(S.grams / 10) : minutes()) + ' min', 179, 337); // the scale reads out study time
  // Recipe mark on the platform edge: a small flag that turns mint once you're in the window.
  const near = Math.abs(S.grams - RECIPE_G) <= PERFECT_WINDOW;
  poly(c, [258, 318, 304, 318, 300, 342, 254, 342], near ? C.mint : '#FFFFFF');
  c.fillStyle = C.ink; c.font = '500 11px "DM Mono", ui-monospace, monospace'; c.fillText(`${RECIPE_G / 10} min`, 279, 334);
}
function landGrain(col) { S.heights[col] += GRAIN_VOLUME; S.landed++; S.grams = Math.min(MAX_G, S.landed * G_PER_GRAIN); }
function stepPour(dt) {
  S.bagVel += (((S.pouring ? .92 : .17) - S.bagAngle) * 90 - S.bagVel * 11) * dt; S.bagAngle += S.bagVel * dt;
  S.jitter = S.pouring && !reduced ? Math.sin(performance.now() / 38) * .025 : S.jitter * .8;
  S.sinkVel += (((S.grams / MAX_G) * 7 - S.sink) * 160 - S.sinkVel * 12) * dt; S.sink += S.sinkVel * dt;
  if (S.pouring && S.grams < MAX_G && S.bagAngle > .7) {
    const m = bagMouth(); S.spawnAcc += 130 * dt;
    while (S.spawnAcc > 1) { S.spawnAcc -= 1; S.grains.push({ x: m.x + (Math.random() - .5) * 8, y: m.y + (Math.random() - .5) * 4, vx: m.dx * 22 + (Math.random() - .5) * 16, vy: m.dy * 30 + Math.random() * 20, s: 2 + Math.random() * 2.5 }); }
  }
  // "Use the recipe" stops once what's in the air will bring it to the mark.
  if (S.pouring && S.autoTarget && S.grams + S.grains.length * G_PER_GRAIN >= S.autoTarget) stopPour();
  const hs = S.heights;
  for (let i = S.grains.length - 1; i >= 0; i--) {
    const g = S.grains[i]; g.vy += 900 * dt; g.x += g.vx * dt; g.y += g.vy * dt;
    const col = Math.floor((g.x - PILE.x0) / colW);
    if (col >= 0 && col < hs.length && g.y >= PILE.baseY + S.sink - hs[col]) {
      landGrain(col);
      if (Math.random() < .25) S.dust.push({ x: g.x, y: g.y, vx: (Math.random() - .5) * 60, vy: -30 - Math.random() * 40, life: 1 });
      S.grains.splice(i, 1);
    } else if (g.y > H) S.grains.splice(i, 1);
  }
  // Steep neighbours shed into each other, so the heap slumps into a mound.
  for (let k = 0; k < 2; k++) for (let i = 0; i < hs.length - 1; i++) { const d = hs[i] - hs[i + 1]; if (Math.abs(d) > 3.2) { const t = (Math.abs(d) - 3.2) * .25 * Math.sign(d); hs[i] -= t; hs[i + 1] += t; } }
  hs[0] = Math.min(hs[0], hs[1] * .7); hs[hs.length - 1] = Math.min(hs[hs.length - 1], hs[hs.length - 2] * .7);
  for (let i = S.dust.length - 1; i >= 0; i--) { const d = S.dust[i]; d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 40 * dt; d.life -= dt * 1.8; if (d.life <= 0) S.dust.splice(i, 1); }
}
function drawPour(c) {
  drawWall(c);
  c.save(); c.translate(OX, 0);
  const dy = S.sink;
  drawScale(c, dy);
  drawBowlSide(c, BOWL.cx, BOWL.rimY + dy, BOWL.rimHalf, BOWL.botHalf, BOWL.botY + dy, true);
  drawPile(c, dy, 1);
  drawBowlSide(c, BOWL.cx, BOWL.rimY + dy, BOWL.rimHalf, BOWL.botHalf, BOWL.botY + dy, false);
  S.grains.forEach((g, i) => { c.fillStyle = i % 3 ? C.flourDD : C.flour; c.fillRect(g.x - g.s / 2, g.y - g.s / 2, g.s, g.s); });
  for (const d of S.dust) { c.globalAlpha = Math.max(0, d.life) * .9; c.fillStyle = C.flourD; c.fillRect(d.x - 3, d.y - 3, 6, 6); }
  c.globalAlpha = 1;
  drawBag(c);
  c.restore();
}

/* ---------- CRACK ---------- */
function eggShape(c, x, y, rot, cracked, which) {
  c.save(); c.translate(x, y); c.rotate(rot);
  if (which === undefined) {
    // six planes: lit crown, cream face, shaded right side and underside, plus a few speckles
    poly(c, [0, -26, 15, -17, 20, 0, 16, 18, 0, 26, -16, 18, -20, 0, -15, -17], C.cream);
    poly(c, [0, -26, 15, -17, 20, 0, 16, 18, 4, 4], '#F1E3C8');
    poly(c, [20, 0, 16, 18, 0, 26, 4, 4], C.creamD);
    poly(c, [-16, 18, 0, 26, 4, 4, -20, 0], '#F6EBD6');
    poly(c, [-15, -17, 0, -26, -4, -8], '#FFFFFF');
    poly(c, [-20, 0, -15, -17, -4, -8], '#FFFCF4');
    c.fillStyle = '#D8B98A'; [[6, -10], [-8, 6], [10, 10], [-3, 15]].forEach(([x, y]) => c.fillRect(x, y, 1.8, 1.8));
    if (cracked > 0) { c.strokeStyle = C.caramelD; c.lineWidth = 1.6; c.lineJoin = 'miter'; c.beginPath(); c.moveTo(-20, 0); c.lineTo(-11, -5); c.lineTo(-4, 3); if (cracked > 1) { c.lineTo(4, -5); c.lineTo(12, 2); c.lineTo(20, -2); } c.stroke(); }
  } else if (which === 'L') { poly(c, [-20, 0, -11, -5, -4, 3, 0, -2, 0, -26, -15, -17], C.cream); poly(c, [-15, -17, 0, -26, -6, -8], '#fff'); }
  else { poly(c, [0, -2, 4, -5, 12, 2, 20, -2, 15, -17, 0, -26], C.creamD); }
  c.restore();
}
function yolkShape(c, x, y, sx, sy, white) {
  c.save(); c.translate(x, y); c.scale(sx, sy);
  if (white) { // the egg white settles around the yolk once it's in the bowl
    c.globalAlpha = .85; poly(c, [-24, -4, -14, -15, 4, -17, 20, -10, 25, 3, 16, 13, -2, 16, -18, 11], '#FFFFFF'); c.globalAlpha = 1;
    poly(c, [4, -17, 20, -10, 25, 3, 16, 13, 6, 4], '#F4F0EA');
  }
  poly(c, oct(0, 0, 12), C.lemon);
  poly(c, [0, -12, 5, -12, 12, -5, 12, 5, 5, 12, 0, 12], C.lemonD);
  poly(c, [0, 12, -5, 12, -12, 5, -6, 2], '#FFD200');
  poly(c, [-7, -7, -3, -10, -4, -3], '#FFFDE0');
  c.restore();
}
function crackEgg(i, from) {
  if (S.eggsUsed[i] || S.crack || S.asking || S.editing !== null) return;
  S.eggsUsed[i] = true; S.crack = { i, t0: performance.now(), from: from || { x: SLOTS[i], y: EGG_Y } }; $('egg-' + i).disabled = true; update();
  // Timers drive the flow, so a throttled frame rate can never strand the egg mid-air.
  setTimeout(() => { buzz(12); S.shake = reduced ? 0 : 3; }, 520);
  setTimeout(() => { buzz(20); S.shake = reduced ? 0 : 5; }, 700);
  setTimeout(() => { const x = 150 + i * 30; S.yolks.push({ x, y: yolkRestY(x), egg: i }); S.crack = null; askGoal(i); }, 1350);
}
// In the crack view the heap is drawn shifted to this bowl and squashed to 80%; yolks rest on its surface.
const PILE_SCALE_CRACK = .8;
function heapTopY(x) {
  const col = clamp(Math.floor((x - PILE.x0) / colW), 0, S.heights.length - 1);
  return PILE.baseY + (CB.rimY - BOWL.rimY) - S.heights[col] * PILE_SCALE_CRACK;
}
function yolkRestY(x) { return Math.min(CB.rimY - 4, heapTopY(x) - 2); }
function drawCrack(c, now) {
  drawWall(c);
  c.save(); c.translate(OX, 0);
  drawBowlSide(c, CB.cx, CB.rimY, CB.rimHalf, CB.botHalf, CB.botY, true);
  c.save(); c.translate(0, CB.rimY - BOWL.rimY); drawPile(c, 0, PILE_SCALE_CRACK); c.restore();
  drawBowlSide(c, CB.cx, CB.rimY, CB.rimHalf, CB.botHalf, CB.botY, false);
  for (const y of S.yolks) yolkShape(c, y.x, y.y, 1, .78, true); // resting on the flour, above the rim
  // egg carton at the front of the counter: open lid behind, pressed-pulp cups in front
  contactShadow(c, 179, 412, 176);
  poly(c, [16, 332, 342, 332, 348, 346, 10, 346], '#F2D660');
  poly(c, [16, 332, 120, 332, 116, 346, 10, 346], '#FFE88A');
  poly(c, [10, 346, 348, 346, 338, 414, 20, 414], '#FFF0A0');
  poly(c, [10, 346, 140, 346, 60, 414, 20, 414], '#FFF9C7');
  poly(c, [270, 346, 348, 346, 338, 414, 230, 414], '#FBE07C');
  for (let k = 0; k < 3; k++) {
    const x = SLOTS[k];
    poly(c, [x - 30, 362, x + 30, 362, x + 24, 406, x - 24, 406], '#F2D660');
    poly(c, [x - 30, 362, x - 6, 362, x - 10, 406, x - 24, 406], '#E8C94A');
    poly(c, [x - 30, 362, x + 30, 362, x + 28, 366, x - 28, 366], '#D9B83C');
  }
  const dr = S.drag, back = S.eggBack;
  for (let k = 0; k < 3; k++) {
    if (S.eggsUsed[k] || (dr && dr.i === k && dr.moved) || (back && back.i === k)) continue;
    eggShape(c, SLOTS[k], EGG_Y + (reduced ? 0 : Math.sin(now / 420 + k * 1.3) * 3), Math.sin(now / 700 + k) * .05, 0);
  }
  if (back) { // a dropped-short egg springs home
    const u = clamp((now - back.t0) / 260, 0, 1), e = ease.out(u);
    eggShape(c, lerp(back.x, SLOTS[back.i], e), lerp(back.y, EGG_Y, e) - Math.sin(u * Math.PI) * 16, (1 - e) * .4, 0);
    if (u >= 1) S.eggBack = null;
  }
  if (dr && dr.moved) {
    // While an egg is held over the rim, the rim lights up to say "drop here".
    if (overRim(dr)) poly(c, [CB.cx - CB.rimHalf - 6, CB.rimY, CB.cx + CB.rimHalf + 6, CB.rimY, CB.cx + CB.rimHalf + 2, CB.rimY + 10, CB.cx - CB.rimHalf - 2, CB.rimY + 10], C.mint);
    eggShape(c, dr.x, dr.y, clamp((dr.x - dr.px) * .04, -.5, .5), 0);
  }
  const cr = S.crack;
  if (cr) {
    const t = (now - cr.t0) / 1000, sx = cr.from.x, sy = cr.from.y, rimX = CB.cx + 6, rimTop = CB.rimY - 30;
    // From the carton it's a big arc; dropped near the rim it's a short hop.
    const arc = Math.min(70, Math.hypot(sx - rimX, sy - rimTop) * .4);
    if (t < .45) { const u = ease.out(t / .45); eggShape(c, lerp(sx, rimX, u), lerp(sy, rimTop, u) - Math.sin(u * Math.PI) * arc, (1 - u) * (cr.i - 1) * -1.2, 0); }
    else if (t < .78) { const k = (t - .45) / .33; eggShape(c, rimX, rimTop + Math.max(0, Math.sin(k * Math.PI * 2)) * 4, Math.sin(k * Math.PI * 2) * -.35, t > .7 ? 2 : t > .52 ? 1 : 0); }
    else {
      const k = clamp((t - .78) / .5, 0, 1);
      c.globalAlpha = 1 - k;
      eggShape(c, rimX - k * 46, rimTop - Math.sin(k * Math.PI) * 18 + k * 40, -k * 1.4, 0, 'L');
      eggShape(c, rimX + k * 46, rimTop - Math.sin(k * Math.PI) * 18 + k * 40, k * 1.4, 0, 'R');
      c.globalAlpha = 1;
      const fall = clamp((t - .8) / .35, 0, 1), y = lerp(rimTop + 4, yolkRestY(rimX), fall * fall);
      const squash = fall >= 1 ? 1 - Math.sin(clamp((t - 1.15) / .2, 0, 1) * Math.PI) * .35 : 1;
      yolkShape(c, rimX, y, 1 + (1 - squash) * .6, squash * (fall < 1 ? 1.15 : .78));
      if (t > 1.15) { const s = clamp((t - 1.15) / .3, 0, 1); c.globalAlpha = 1 - s; c.fillStyle = C.lemon; [[-26, -14], [-12, -24], [13, -22], [27, -12]].forEach(([dx, d2]) => c.fillRect(rimX + dx * s - 3, yolkRestY(rimX) + d2 * s + s * 10 - 3, 6, 6)); c.globalAlpha = 1; }
    }
  }
  c.restore();
}

/* ---------- WHISK ---------- */
function stepWhisk(dt) {
  const w = S.whisk;
  w.vx += ((w.tx - w.x) * 260 - w.vx * 22) * dt; w.vy += ((w.ty - w.y) * 260 - w.vy * 22) * dt; w.x += w.vx * dt; w.y += w.vy * dt;
  S.breathT += dt;
  for (let i = S.trail.length - 1; i >= 0; i--) { S.trail[i].life -= dt * 1.6; if (S.trail[i].life <= 0) S.trail.splice(i, 1); }
  S.tooFast = Math.max(0, S.tooFast - dt * 1.4);
  for (let i = S.splash.length - 1; i >= 0; i--) { const s = S.splash[i]; s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= .9; s.vy *= .9; s.life -= dt * 2.2; if (s.life <= 0) S.splash.splice(i, 1); }
}
function drawWhisk(c) {
  drawCounterTop(c);
  c.save(); c.translate(OX, 0);
  const p = clamp(S.turns / 3, 0, 1), cx = WB.cx, cy = WB.cy;
  // Breathing halo: a 6 s cycle that swells on the in-breath.
  const phase = S.stirring ? (Math.sin((S.breathT / 8) * Math.PI * 2 - Math.PI / 2) + 1) / 2 : .5, hr = WB.r + 6 + phase * 22;
  poly(c, oct(cx, cy, hr), '#FFE3F9'); poly(c, oct(cx, cy, hr - 12), '#FFF0FC');
  // bowl from above: a shadow on the counter, a faceted rim (eight wedges, lit from the top left), then the inner wall
  poly(c, oct(cx + 8, cy + 10, WB.r), 'rgba(150,96,30,.16)');
  const outer = oct(cx, cy, WB.r), inner = oct(cx, cy, WB.batter + 10);
  const rimShades = ['#A6E6FF', '#7FD9FF', '#33C4FF', '#1DAFEA', '#1593CA', '#1DAFEA', '#5ACEFF', '#8FDDFF'];
  for (let k = 0; k < 8; k++) {
    const a = k * 2, b = ((k + 1) % 8) * 2;
    poly(c, [outer[a], outer[a + 1], outer[b], outer[b + 1], inner[b], inner[b + 1], inner[a], inner[a + 1]], rimShades[k]);
  }
  poly(c, oct(cx, cy, WB.batter + 10), '#1A92C8');
  poly(c, [cx - (WB.batter + 10) * .414, cy - WB.batter - 10, cx + (WB.batter + 10) * .414, cy - WB.batter - 10, cx + WB.batter + 10, cy - (WB.batter + 10) * .414, cx, cy], '#137FAE');
  poly(c, oct(cx, cy, WB.batter), p < 1 ? `rgb(255,${Math.round(lerp(243, 226, p))},${Math.round(lerp(201, 122, p))})` : '#FFE27A');
  c.save(); c.translate(cx, cy); c.rotate(S.turns * Math.PI * 2);
  c.strokeStyle = `rgba(242,196,0,${(1 - p) * .55 + .12})`; c.lineWidth = 4; c.lineJoin = 'miter'; c.beginPath();
  for (let k = 0; k < 26; k++) { const a = k * .55, r = 8 + k * 4; k ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  c.stroke(); c.restore();
  for (const l of lumps) {
    const s = l.size * Math.pow(1 - p, .8); if (s < 1.5) continue;
    const a = l.a + S.turns * Math.PI * 2 * (1.2 - l.rad / 150), x = cx + Math.cos(a) * l.rad, y = cy + Math.sin(a) * l.rad, pts = [];
    for (let k = 0; k < l.sides; k++) { const t = l.spin + a + k / l.sides * Math.PI * 2; pts.push(x + Math.cos(t) * s, y + Math.sin(t) * s * .85); }
    poly(c, pts, l.flour ? C.white : C.lemonD);
  }
  c.lineJoin = 'miter'; c.lineCap = 'butt';
  for (let k = 1; k < S.trail.length; k++) { const a = S.trail[k - 1], b = S.trail[k]; c.strokeStyle = `rgba(255,251,230,${b.life * .8})`; c.lineWidth = 10 * b.life + 2; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
  if (p >= 1) { c.globalAlpha = .55; poly(c, [cx - 70, cy - 90, cx - 20, cy - 104, cx - 50, cy - 50], '#fff'); poly(c, [cx + 40, cy + 60, cx + 80, cy + 40, cx + 60, cy + 84], '#fff'); c.globalAlpha = 1; }
  // batter flung out by stirring too fast
  for (const s of S.splash) { c.globalAlpha = Math.max(0, s.life); c.save(); c.translate(s.x, s.y); c.rotate(s.x * .1); poly(c, [-s.s, 0, 0, -s.s * .7, s.s, 0, 0, s.s * .7], '#FFE27A'); c.restore(); }
  c.globalAlpha = 1;
  const w = S.whisk, ang = Math.atan2(w.y - cy, w.x - cx), hx = w.x + Math.cos(ang) * 70, hy = w.y + Math.sin(ang) * 70;
  c.globalAlpha = S.stirring ? 1 : .75;
  c.save(); c.translate(w.x, w.y); c.rotate(ang + Math.PI / 2); c.strokeStyle = C.skyL; c.lineWidth = 3; c.lineJoin = 'miter';
  [[16, 22], [10, 24], [4, 26]].forEach(([rx, ry]) => { c.beginPath(); c.moveTo(0, 30); c.lineTo(-rx, 6); c.lineTo(-rx * .6, -ry * .7); c.lineTo(0, -ry); c.lineTo(rx * .6, -ry * .7); c.lineTo(rx, 6); c.closePath(); c.stroke(); });
  c.restore();
  c.strokeStyle = C.caramel; c.lineWidth = 8; c.beginPath(); c.moveTo(w.x + Math.cos(ang) * 28, w.y + Math.sin(ang) * 28); c.lineTo(hx, hy); c.stroke();
  c.strokeStyle = C.caramelD; c.lineWidth = 3; c.beginPath(); c.moveTo(w.x + Math.cos(ang) * 30 + Math.sin(ang) * 2, w.y + Math.sin(ang) * 30 - Math.cos(ang) * 2); c.lineTo(hx + Math.sin(ang) * 2, hy - Math.cos(ang) * 2); c.stroke();
  c.globalAlpha = 1;
  c.restore();
}

/* ---------- input ---------- */
// Capture keeps a drag alive when the finger slides off; it can throw for pointers the browser doesn't track.
function capture(el, e) { try { el.setPointerCapture(e.pointerId); } catch (err) {} }
function local(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * CW / r.width - OX, y: (e.clientY - r.top) * H / r.height }; }
cv.addEventListener('pointerdown', (e) => {
  const p = local(e);
  if (S.scene === 'pour' && p.x < 160 && p.y < 200) { capture(cv, e); startPour(e, 'bag'); return; } // the bag pours too
  if (S.scene !== 'whisk' || Math.hypot(p.x - WB.cx, p.y - WB.cy) > WB.r + 10) return;
  capture(cv, e); S.stirring = true; S.lastAngle = Math.atan2(p.y - WB.cy, p.x - WB.cx); S.lastMoveT = e.timeStamp || performance.now(); S.whisk.tx = p.x; S.whisk.ty = p.y; update();
});
const FAST = 13; // rad/s, about two laps a second: past this the batter splashes and stirring counts for less
cv.addEventListener('pointermove', (e) => {
  if (!S.stirring) return;
  const p = local(e), a = Math.atan2(p.y - WB.cy, p.x - WB.cx);
  let d = a - S.lastAngle; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
  const t = e.timeStamp || performance.now(), dts = Math.max(.008, (t - S.lastMoveT) / 1000); S.lastMoveT = t;
  const speed = Math.abs(d) / dts;
  let gain = 1;
  if (speed > FAST && S.turns < 3) {
    gain = .35;
    if (S.tooFast < .2) buzz(5);
    S.tooFast = 1;
    if (!reduced && S.splash.length < 40) for (let k = 0; k < 2; k++) {
      const out = Math.atan2(p.y - WB.cy, p.x - WB.cx) + (Math.random() - .5) * .8;
      S.splash.push({ x: p.x, y: p.y, vx: Math.cos(out) * (120 + Math.random() * 120), vy: Math.sin(out) * (120 + Math.random() * 120), life: 1, s: 4 + Math.random() * 4 });
    }
  }
  const before = S.turns;
  S.turns = Math.min(3, S.turns + Math.abs(d) / (2 * Math.PI) * gain); if (S.turns > 2.97) S.turns = 3;
  if (before < 3 && S.turns >= 3) slip('Smooth', 'No lumps left');
  S.lastAngle = a; S.whisk.tx = p.x; S.whisk.ty = p.y;
  S.trail.push({ x: p.x, y: p.y, life: 1 }); if (S.trail.length > 18) S.trail.shift();
  if (Math.floor(before) !== Math.floor(S.turns)) buzz(S.turns >= 3 ? [12, 50, 24] : 14);
  update();
});
const endStir = () => { if (!S.stirring) return; S.stirring = false; S.lastAngle = null; update(); };
cv.addEventListener('pointerup', () => { endStir(); stopPour(); }); cv.addEventListener('pointercancel', () => { endStir(); stopPour(); });

let pourTimer = null;
function startPour(e, src) {
  if (e && e.preventDefault) e.preventDefault();
  if (S.pouring || S.grams >= MAX_G) return;
  S.pouring = true; S.pourSrc = src; update();
  // In a background tab frames stall; keep the weight flowing on a timer so the scale still moves.
  pourTimer = setInterval(() => { if (document.hidden && S.grams < MAX_G) { for (let k = 0; k < 6; k++) landGrain(16 + (k % 3)); update(); } }, 100);
}
function stopPour() {
  if (!S.pouring) return;
  S.pouring = false; S.autoTarget = 0; S.pourEndedAt = performance.now(); clearInterval(pourTimer);
  buzz(10); S.judgePending = true; // judged once the flour still in the air has landed
  update();
}
function judgePour() {
  S.judgePending = false;
  const m = minutes(), rounds = Math.max(1, Math.ceil(m / 25));
  if (Math.abs(S.grams - RECIPE_G) <= PERFECT_WINDOW) { S.flash = 1; buzz([10, 40, 10, 40, 24]); slip(`${m} min · spot on`, `${Math.round(S.grams)} g, ${rounds} ${rounds > 1 ? 'rounds' : 'round'}`); }
  else if (S.grams >= 100) slip(`${m} min`, `${Math.round(S.grams)} g, ${rounds} ${rounds > 1 ? 'rounds' : 'round'}`);
  update();
}

