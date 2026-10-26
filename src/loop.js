/* ---------- loop ---------- */
let last = performance.now();
function advance(dt) {
  stepPour(dt); stepWhisk(dt);
  if (S.pouring || S.grains.length) update();
  if (S.stirring && Math.floor(S.breathT * 4) !== S.cueTick) { S.cueTick = Math.floor(S.breathT * 4); if (S.scene === 'whisk') $('hint').textContent = whiskCue(); }
  S.sceneT = Math.min(1, S.sceneT + dt / (reduced ? .01 : .42));
  S.shake *= .85;
  S.flash = Math.max(0, (S.flash || 0) - dt * .7);
  if (S.judgePending && !S.pouring && (S.grains.length === 0 || performance.now() - S.pourEndedAt > 900)) judgePour();
  for (let i = S.confetti.length - 1; i >= 0; i--) { const p = S.confetti[i]; p.vy += 700 * dt; p.vx *= .99; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.life -= dt; if (p.life <= 0) S.confetti.splice(i, 1); }
}
function drawScene(s, now) { if (s === 'pour') drawPour(ctx); else if (s === 'crack') drawCrack(ctx, now); else drawWhisk(ctx); }
function render(now) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, CW, H);
  ctx.save();
  if (S.shake > .2) ctx.translate((Math.random() - .5) * S.shake, (Math.random() - .5) * S.shake);
  const u = ease.inOut(S.sceneT), dir = SCENES.indexOf(S.scene) > SCENES.indexOf(S.prevScene) ? 1 : -1;
  if (S.sceneT < 1 && S.prevScene) {
    ctx.save(); ctx.translate(-dir * u * CW, 0); drawScene(S.prevScene, now); ctx.restore();
    ctx.save(); ctx.translate(dir * (1 - u) * CW, 0); drawScene(S.scene, now); ctx.restore();
  } else drawScene(S.scene, now);
  ctx.restore();
  if (!grainPattern) grainPattern = ctx.createPattern(grain, 'repeat');
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .35; ctx.fillStyle = grainPattern; ctx.fillRect(0, 0, CW, H);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  const a = $('app').getBoundingClientRect(), sc = a.width / APP_W;
  fctx.setTransform(dpr * sc, 0, 0, dpr * sc, 0, 0); fctx.clearRect(0, 0, APP_W, APP_H * 2);
  for (const p of S.confetti) { fctx.save(); fctx.globalAlpha = Math.min(1, p.life * 1.5); fctx.translate(p.x, p.y); fctx.rotate(p.rot); fctx.fillStyle = p.c; fctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); fctx.restore(); }
}
// The kitchen only runs while the prep screen is showing.
function frame(now) { const dt = Math.min(.033, (now - last) / 1000); last = now; if (scr('prep').classList.contains('on')) { advance(dt); render(now); } requestAnimationFrame(frame); }
// Test hook, only with ?debug: run the simulation forward without waiting for real frames, then draw it.
if (/[?&]debug\b/.test(location.search)) window.__sim = (seconds) => { for (let i = 0; i < seconds * 60; i++) advance(1 / 60); render(performance.now()); };
// system fonts are already there, so the first frame can draw straight away
update(); requestAnimationFrame(frame);
