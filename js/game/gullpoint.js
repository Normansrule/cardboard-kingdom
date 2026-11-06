// Cardboard Kingdom - Chapter 9: The Keeper's Light.
// A frosted postcard in the box brings Sam and Jules to Gull Point, the Kingdom's winter coast,
// where a cardboard lighthouse leans out over a crumbling cliff. It was built by Jules's grandpa,
// a boy called Keeper Ike, who turns out to have been Grandma Rosie's best friend. The Shellbacks
// are raiding a seawall site, the Harbormaster wants to wall in the whole beach, and the answer is
// a living shoreline, and stepping back from the edge.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input, Data = CK.Data;
  const W = CK.W, H = CK.H, TS = 48;
  const C = D.C, TAU = Math.PI * 2;
  const CH = D.chars;
  const f = (k) => CK.flag(k);
  const S = CK.Story.scripts;
  const shore = () => f('gp_shore');
  const moved = () => f('gp_moved');
  const stroke = (ctx, lw, col) => { ctx.strokeStyle = col || C.ink; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };

  // ================================================================ CHARACTERS
  // Shellbacks: little hermit crabs living in whatever they can find (a soup can, a teacup, a
  // bottle cap). Angry, their eyes glow on their stalks and their claws go up. Calm, they're shy.
  const SHELLS = [
    { kind: 'can', col: '#c9ced6', band: '#ef6b6b' },
    { kind: 'cup', col: '#f6efe2', band: '#5aa9e6' },
    { kind: 'cap', col: '#ffd25a', band: '#c2410c' },
    { kind: 'conch', col: '#f2b8a0', band: '#fff3e8' },
  ];
  function drawShell(ctx, x, y, s, sh, big) {
    if (sh.kind === 'can' || big) {
      // a tin can lying on its side, or Old Tin's rusty paint bucket
      const w = (big ? 30 : 15) * s, h = (big ? 26 : 14) * s;
      D.box3(ctx, x - w / 2 - 4 * s, y - h - 4 * s, w, h, 6 * s, { r: 3 * s, lw: 2, fill: big ? '#b0603a' : sh.col, flute: false });
      ctx.save(); ctx.globalAlpha = 0.85;
      D.rr(ctx, x - w / 2 - 4 * s, y - h * 0.62 - 4 * s, w, h * 0.3, 1); ctx.fillStyle = big ? '#7a8a9a' : sh.band; ctx.fill();
      ctx.restore();
      if (big) {
        for (let i = 0; i < 5; i++) D.circle(ctx, x - w / 2 + U.hash(i, 3) * w, y - h + U.hash(i, 4) * h * 0.8 - 2 * s, (1.6 + U.hash(i, 5) * 2) * s, 'rgba(120,50,20,0.55)');
        D.text(ctx, 'PAINT', x - 4 * s, y - h * 0.44 - 4 * s, { size: Math.max(7, 8 * s), weight: 700, align: 'center', color: '#fff3e0' });
        ctx.beginPath(); ctx.arc(x - 4 * s, y - h - 4 * s, w * 0.42, Math.PI * 1.05, Math.PI * 1.95); stroke(ctx, 2 * s, '#5a5a62');
      }
    } else if (sh.kind === 'cup') {
      ctx.beginPath(); ctx.moveTo(x - 10 * s, y - 18 * s); ctx.lineTo(x + 6 * s, y - 18 * s); ctx.lineTo(x + 4 * s, y - 4 * s); ctx.lineTo(x - 8 * s, y - 4 * s); ctx.closePath();
      D.fillVol(ctx, x - 4 * s, y - 14 * s, 12 * s, sh.col, 2);
      D.line(ctx, x - 9.5 * s, y - 14 * s, x + 5.6 * s, y - 14 * s, sh.band, 2 * s);
      ctx.beginPath(); ctx.arc(x + 7 * s, y - 11 * s, 4 * s, -Math.PI / 2, Math.PI / 2); stroke(ctx, 2 * s);
    } else if (sh.kind === 'cap') {
      ctx.beginPath(); ctx.ellipse(x - 2 * s, y - 10 * s, 12 * s, 9 * s, 0, Math.PI, 0); ctx.closePath();
      D.fillVol(ctx, x - 4 * s, y - 14 * s, 12 * s, sh.col, 2);
      for (let i = -4; i <= 4; i++) D.line(ctx, x - 2 * s + i * 2.6 * s, y - 10 * s, x - 2 * s + i * 2.6 * s, y - 7 * s, C.ink, 1);
      D.line(ctx, x - 14 * s, y - 10 * s, x + 10 * s, y - 10 * s, C.ink, 2);
    } else {
      D.egg(ctx, x - 3 * s, y - 11 * s, 11 * s, 9 * s, sh.col, { rot: -0.4, lw: 2 });
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x - 3 * s, y - 11 * s, (3 + i * 2.6) * s, -0.4, 2.2); stroke(ctx, 1.2, '#b0705a'); }
    }
  }
  CH.crab = function (ctx, x, y, o) {
    const s = o.s || 1;
    const mood = o.mood;
    const seed = o.seed || 0;
    const big = !!o.big;
    const sh = SHELLS[seed % SHELLS.length];
    const scut = Math.sin(CK.time * 6 + seed) * (mood === 'angry' ? 1.6 : 0.6) * s;
    x += scut;
    const red = big ? '#d0603a' : '#e5774a';
    // little legs
    for (const k of [-1, 1]) for (let i = 0; i < 3; i++) {
      const lx = x + k * (6 + i * 3.5) * s, ly = y - 3 * s;
      ctx.beginPath(); ctx.moveTo(x + k * 4 * s, y - 6 * s); ctx.quadraticCurveTo(lx, ly - 5 * s, lx + k * 2 * s, y); stroke(ctx, 2 * s, '#a84a2a');
    }
    const sx = big ? 2 : 1;
    drawShell(ctx, x + 4 * s * sx, y, s, sh, big);
    // the crab peeking out of the front
    const bx = x - (big ? 10 : 6) * s, by = y - (big ? 12 : 7) * s;
    D.egg(ctx, bx, by, (big ? 11 : 7) * s, (big ? 8 : 5.5) * s, red, { lw: 2, k: 0.6 });
    // claws: raised when angry, tucked when calm
    const up = mood === 'angry' ? 1 : 0;
    for (const k of [-1, 1]) {
      const cx = bx + k * (big ? 14 : 9) * s, cy = by - (up ? (big ? 16 : 10) : 2) * s;
      D.line(ctx, bx + k * 4 * s, by, cx, cy + 4 * s, '#a84a2a', 2.4 * s);
      const pinch = 0.35 + Math.abs(Math.sin(CK.time * (up ? 7 : 2) + k)) * 0.35;
      ctx.beginPath(); ctx.arc(cx, cy, (big ? 7 : 4.6) * s, -Math.PI / 2 - pinch * 1.6 + (k < 0 ? 0 : 0), Math.PI * 1.5 - pinch); ctx.lineTo(cx, cy); ctx.closePath();
      D.fillVol(ctx, cx - 1 * s, cy - 2 * s, 5 * s, red, 1.8);
    }
    // eyes on stalks
    for (const k of [-1, 1]) {
      const ex = bx + k * (big ? 5 : 3.2) * s, ey = by - (big ? 14 : 9) * s + Math.sin(CK.time * 3 + k + seed) * 0.8 * s;
      D.line(ctx, bx + k * 2 * s, by - 3 * s, ex, ey + 2 * s, '#a84a2a', 1.8 * s);
      if (mood === 'angry') {
        const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, 6 * s);
        g.addColorStop(0, 'rgba(255,220,90,0.7)'); g.addColorStop(1, 'rgba(255,220,90,0)');
        ctx.fillStyle = g; ctx.fillRect(ex - 6 * s, ey - 6 * s, 12 * s, 12 * s);
        D.circle(ctx, ex, ey, (big ? 4 : 2.8) * s, '#ffe58a', C.ink, 1.4);
        D.circle(ctx, ex, ey, (big ? 1.6 : 1.1) * s, '#2a1408');
        D.line(ctx, ex - k * 3 * s, ey - 3.6 * s, ex + k * 2.6 * s, ey - 2.4 * s, C.ink, 1.5);
      } else {
        D.circle(ctx, ex, ey, (big ? 3.6 : 2.6) * s, '#fffaf0', C.ink, 1.2);
        if (mood === 'happy') { ctx.beginPath(); ctx.arc(ex, ey + 0.6 * s, 1.4 * s, Math.PI * 1.1, Math.PI * 1.9); stroke(ctx, 1.4); }
        else D.circle(ctx, ex, ey + 0.4 * s, (big ? 1.8 : 1.3) * s, '#2a1408');
      }
    }
    if (mood !== 'angry') D.blush(ctx, bx, by + 1 * s, (big ? 7 : 4.5) * s, 1.6 * s);
    D.mouth(ctx, bx, by + 2 * s, (big ? 4 : 2.4) * s, mood === 'sad' ? 'sad' : mood === 'angry' ? 'sad' : 'smile');
    if (big) {
      // a barnacle beard: Old Tin is very old
      for (let i = 0; i < 4; i++) D.circle(ctx, bx - 6 * s + i * 4 * s, by + 7 * s, 1.8 * s, '#e8e0d0', C.ink, 1);
    }
  };

  // Keeper Gale: a puffin lighthouse keeper in a yellow sou'wester and knitted jumper.
  CH.puffin = function (ctx, x, y, o) {
    const s = o.s || 1;
    const dir = o.dir || 'down';
    const side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    for (const k of [-1, 1]) D.egg(ctx, x + k * 5 * s, y - 1.5 * s, 5 * s, 2.5 * s, '#f07a3a', { lw: 1.5 });
    // round black body with white front, in a knitted jumper
    D.egg(ctx, x, y - 16 * s, 12 * s, 14 * s, '#2a2a33', { lw: 2.2, k: 0.6 });
    D.egg(ctx, x, y - 14 * s, 8 * s, 10 * s, '#f6f2ea', { lw: 0 });
    ctx.beginPath(); ctx.ellipse(x, y - 12 * s, 12.5 * s, 7 * s, 0, 0, Math.PI); ctx.closePath();
    D.fillVol(ctx, x - 2 * s, y - 12 * s, 12 * s, '#4a7ab0', 2);
    for (let i = -2; i <= 2; i++) D.line(ctx, x + i * 4 * s, y - 11 * s, x + i * 4 * s, y - 6 * s, 'rgba(255,255,255,0.35)', 1.2);
    for (const k of [-1, 1]) D.egg(ctx, x + k * 12 * s, y - 15 * s, 3.5 * s, 8 * s, '#2a2a33', { rot: k * -0.3, lw: 1.6 });
    // head
    const hy = y - 33 * s;
    D.ball(ctx, x, hy, 11 * s, '#2a2a33', { lw: 2.2, k: 0.6 });
    D.egg(ctx, x + side * 2 * s, hy + 1 * s, 8 * s, 7 * s, '#f6f2ea', { lw: 0 });
    if (dir !== 'up') {
      for (const k of [-1, 1]) {
        if (side && k === -side) continue;
        const ex = x + side * 3 * s + k * 4 * s, ey = hy - 1 * s;
        D.circle(ctx, ex, ey, 1.8 * s, '#120e14');
        D.line(ctx, ex + k * 1 * s, ey + 1.8 * s, ex + k * 3 * s, ey + 2.8 * s, '#8a8a90', 1);
      }
      D.blush(ctx, x + side * 2 * s, hy + 3 * s, 7 * s, 1.8 * s);
      // the big striped puffin beak
      const bx = x + side * 7 * s;
      const bp = side ? [bx, hy + 1 * s, bx + side * 10 * s, hy + 4 * s, bx, hy + 8 * s] : [x - 4 * s, hy + 2 * s, x + 4 * s, hy + 2 * s, x, hy + 12 * s];
      D.poly(ctx, bp, '#f07a3a', C.ink, 1.6);
      if (!side) { D.line(ctx, x - 2.6 * s, hy + 5 * s, x + 2.6 * s, hy + 5 * s, '#ffd25a', 1.6); D.line(ctx, x - 3.6 * s, hy + 2.2 * s, x + 3.6 * s, hy + 2.2 * s, '#5a6a8a', 1.4); }
    }
    // yellow sou'wester hat
    ctx.beginPath(); ctx.ellipse(x, hy - 7 * s, 17 * s, 4.5 * s, 0, 0, TAU); D.fillVol(ctx, x - 4 * s, hy - 8 * s, 16 * s, '#ffd25a', 2);
    ctx.beginPath(); ctx.arc(x, hy - 7 * s, 10 * s, Math.PI, 0); ctx.closePath(); D.fillVol(ctx, x - 3 * s, hy - 12 * s, 10 * s, '#ffd25a', 2);
  };

  // Harbormaster Brack: a big, gruff walrus in a navy peacoat and captain's cap. Not a villain.
  CH.walrus = function (ctx, x, y, o) {
    const s = o.s || 1;
    const mood = o.mood;
    const dir = o.dir || 'down';
    const side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const skin = '#a8846a';
    for (const k of [-1, 1]) D.egg(ctx, x + k * 9 * s, y - 2 * s, 7 * s, 3.5 * s, D.hexShade(skin, -0.15), { lw: 1.6 });
    // peacoat
    ctx.beginPath(); ctx.ellipse(x, y - 18 * s, 18 * s, 17 * s, 0, 0, TAU);
    D.fillVol(ctx, x - 4 * s, y - 22 * s, 19 * s, '#2f3e5e', 2.2);
    D.line(ctx, x, y - 32 * s, x, y - 3 * s, 'rgba(0,0,0,0.3)', 1.6);
    for (let i = 0; i < 3; i++) for (const k of [-1, 1]) D.circle(ctx, x + k * 5 * s, y - 27 * s + i * 7 * s, 1.6 * s, '#e8c060', C.ink, 0.8);
    for (const k of [-1, 1]) D.egg(ctx, x + k * 17 * s, y - 16 * s, 5 * s, 10 * s, '#2f3e5e', { rot: k * -0.25, lw: 1.8 });
    // head
    const hy = y - 42 * s;
    D.ball(ctx, x, hy, 15 * s, skin, { lw: 2.2, k: 0.7 });
    if (dir !== 'up') {
      for (const k of [-1, 1]) {
        if (side && k === -side) continue;
        const ex = x + side * 4 * s + k * 5.5 * s, ey = hy - 4 * s;
        D.circle(ctx, ex, ey, 1.9 * s, '#120e14');
        if (mood === 'angry') D.line(ctx, ex - k * 3 * s, ey - 4 * s, ex + k * 2.5 * s, ey - 2.4 * s, '#4a3a30', 1.8);
        else if (mood === 'sad') D.line(ctx, ex - k * 3 * s, ey - 2.4 * s, ex + k * 2.5 * s, ey - 4 * s, '#4a3a30', 1.8);
        else D.line(ctx, ex - 2.6 * s, ey - 3.6 * s, ex + 2.6 * s, ey - 3.8 * s, '#4a3a30', 1.4);
      }
      // muzzle, whiskers, a big white moustache and two small tusks
      const mx = x + side * 5 * s;
      for (const k of [-1, 1]) D.ball(ctx, mx + k * 5 * s, hy + 5 * s, 6 * s, '#c9a88a', { lw: 1.6 });
      for (const k of [-1, 1]) for (let i = 0; i < 3; i++) D.circle(ctx, mx + k * (3 + i * 2.4) * s, hy + 4 * s + (i % 2) * 2 * s, 0.7 * s, '#5a4030');
      D.egg(ctx, mx, hy + 1.5 * s, 2.6 * s, 1.7 * s, '#5a3a30', { lw: 0 });
      for (const k of [-1, 1]) D.poly(ctx, [mx + k * 2 * s, hy + 9 * s, mx + k * 5 * s, hy + 9 * s, mx + k * 3.6 * s, hy + 17 * s], '#fffaf0', C.ink, 1.4);
      D.blush(ctx, x + side * 3 * s, hy + 1 * s, 13 * s, 2 * s);
    }
    // captain's cap
    D.rr(ctx, x - 13 * s, hy - 22 * s, 26 * s, 9 * s, 3 * s); ctx.fillStyle = '#f6f2ea'; ctx.fill(); stroke(ctx, 2);
    D.rr(ctx, x - 13 * s, hy - 15 * s, 26 * s, 4 * s, 1.5 * s); ctx.fillStyle = '#2f3e5e'; ctx.fill(); stroke(ctx, 1.6);
    D.egg(ctx, x + side * 4 * s, hy - 10.5 * s, 10 * s, 2 * s, '#1f2433', { lw: 1.4 });
    D.circle(ctx, x, hy - 18 * s, 2.4 * s, '#e8c060', C.ink, 1);
  };

  // ================================================================ DATA
  Object.assign(Data.speakers, {
    gale: { name: 'Keeper Gale', look: 'puffin', ps: 2.2, py: 4, bg: '#e2eef8' },
    brack: { name: 'Harbormaster Brack', look: 'walrus', ps: 1.8, py: 34, bg: '#dfe6ee' },
    crab: { name: 'Shellback', look: 'crab', ps: 3.4, py: -18, bg: '#f8e6dc', o: { seed: 1 } },
    tin: { name: 'Old Tin', look: 'crab', ps: 2.2, py: -10, bg: '#f2dccc', o: { big: true } },
  });
  Data.enemies.crab = {
    name: 'Shellback', hp: 44, atk: 11, def: 2, xp: 10, scraps: 6, draw: 'crab',
    moves: [{ name: 'Pinch', power: 1, w: 3 }, { name: 'Sand Kick', power: 0.7, all: true, w: 1 }, { name: 'Tidepool Splash', power: 0.8, w: 1, water: true, soak: true }],
  };
  Data.enemies.oldtin = {
    name: 'Old Tin', hp: 360, atk: 13, def: 3, xp: 90, scraps: 60, draw: 'oldtin', boss: true,
    moves: [{ name: 'Bucket Bash', power: 1.4, w: 2 }, { name: 'Rogue Wave', power: 0.8, all: true, w: 2, water: true, soak: true }, { name: 'Shellbacks, Assemble!', summon: 'crab', w: 1 }],
  };
  Data.battles.gp_crabs = { enemies: ['crab', 'crab', 'crab'], season: 'winter' };
  Data.battles.gp_tin = { enemies: ['crab', 'oldtin', 'crab'], season: 'winter', boss: true, music: 'boss' };

  const baseEnemy = D.enemy;
  D.enemy = function (ctx, type, x, y, o = {}) {
    if (type !== 'crab' && type !== 'oldtin') return baseEnemy.call(this, ctx, type, x, y, o);
    const s = o.s || 1, mood = o.calm ? 'happy' : 'angry';
    ctx.save();
    if (type === 'crab') { D.shadow(ctx, x, y, 34 * s, 8 * s); CH.crab(ctx, x, y, { s: 2.6 * s, seed: o.seed || 0, mood }); }
    else { D.shadow(ctx, x, y, 60 * s, 12 * s); CH.crab(ctx, x, y, { s: 3.2 * s, big: true, mood: o.calm ? 'sad' : 'angry' }); }
    ctx.restore();
  };

  // ================================================================ MAP
  const lightX = () => (moved() ? 22 : 28);
  CK.Chapters.gullpoint = {
    id: 'gullpoint', name: 'Gull Point', w: 40, h: 24, season: 'winter', music: 'winter',
    start: [2, 12], noFlood: true,
    nightTint: () => 'rgba(16,26,60,0.6)',
    build(m) {
      m.scatter(',', 0.12, 91);
      // the sea along the east and south, a band of beach, and the headland in the middle
      m.rect(33, 0, 7, 24, '~');
      m.rect(18, 21, 22, 3, '~');
      m.rect(29, 2, 4, 19, 's');
      m.rect(18, 18, 15, 3, 's');
      m.ellipse(35, 4, 2, 1.5, 's');
      m.path([[1, 12], [27, 12]], '=');
      m.path([[14, 12], [14, 7]], '=');
      m.path([[25, 12], [25, 8], [27, 8]], '=');
      m.path([[20, 12], [20, 17]], '=');
      m.rect(30, 13, 3, 1, 'd');
      m.rect(32, 13, 2, 2, 'd');
      m.scatter('T', 0.05, 92);
      m.scatter('S', 0.015, 93);
      m.border('T');
      m.rect(1, 11, 1, 3, '=');
    },
    post(m) {
      for (const o of this.objects) if (o.type === 'building') m.rect(o.x - Math.floor(o.bw / 2), o.y - o.bh + 1, o.bw, o.bh + 1, '.');
      for (const o of this.objects) if (o.type === 'house') m.rect(o.x, o.y, 2, 2, '.');
      for (const o of this.objects) if (o.type !== 'building' && o.type !== 'trigger' && o.type !== 'house' && o.type !== 'deco' && !'=~bBds'.includes(m.get(o.x, o.y))) m.set(o.x, o.y, '.');
      m.rect(20, 3, 9, 6, '.');
      m.rect(19, 12, 9, 2, '.');
      m.rect(1, 11, 3, 3, '.');
      m.rect(1, 12, 3, 1, '=');
      m.rect(19, 13, 13, 1, '.');
      m.rect(27, 8, 2, 1, '=');
      // ice rocks along the waterline
      for (const [x, y] of [[29, 3], [32, 6], [32, 10], [29, 19], [24, 20], [32, 17]]) m.set(x, y, 'R');
    },
    objects: [
      { type: 'bench', x: 3, y: 14 },
      { type: 'sign', x: 3, y: 10, text: 'GULL POINT. Pop. 212 seabirds, 1 puffin, 1 walrus, ??? crabs. Mind the edge.' },
      // the lighthouse: on the crumbling edge, then rolled back to safety
      { type: 'building', id: 'light_edge', x: 28, y: 6, bw: 3, bh: 4, label: 'Gull Point Light', color: '#f6f2ea', roof: '#c25b4a', door: 'Look', style: 'lighthouse', script: 'gp_light', cond: () => !moved() },
      { type: 'building', id: 'light_safe', x: 22, y: 6, bw: 3, bh: 4, label: 'Gull Point Light', color: '#f6f2ea', roof: '#c25b4a', door: 'Climb', style: 'lighthouse', script: 'gp_light', cond: () => moved() },
      { type: 'deco', kind: 'rails', x: 25, y: 7, cond: () => shore() },
      { type: 'deco', kind: 'crack', x: 29, y: 7, cond: () => !moved() },
      { type: 'building', id: 'harbor', x: 14, y: 6, bw: 5, bh: 3, label: 'Harbor Office', color: '#6a8aa8', roof: '#2f3e5e', door: 'Knock', style: 'harbor', script: () => (f('gp_gale') && !f('gp_brack') ? 'gp_brack' : 'gp_brack_again') },
      { type: 'house', id: 'gp_a', x: 6, y: 7, roof: '#5aa9e6', style: 'snow', knock: 'gp_knock_a' },
      { type: 'house', id: 'gp_b', x: 9, y: 14, roof: '#ef6b6b', style: 'snow', knock: 'gp_knock_b' },
      { type: 'house', id: 'gp_c', x: 5, y: 17, roof: '#ffd25a', style: 'snow', knock: 'gp_knock_c' },
      { type: 'deco', kind: 'seawall', x: 28, y: 15, cond: () => !shore() },
      { type: 'deco', kind: 'tidepool', x: 22, y: 19 },
      { type: 'deco', kind: 'tidepool', x: 27, y: 19, o: { small: true } },
      { type: 'deco', kind: 'dunegrass', x: 30, y: 9, cond: () => shore() },
      { type: 'deco', kind: 'dunegrass', x: 30, y: 17, cond: () => shore() },
      { type: 'deco', kind: 'reef', x: 34, y: 9, cond: () => shore() },
      { type: 'deco', kind: 'reef', x: 34, y: 16, cond: () => shore() },
      { type: 'deco', kind: 'buoy', x: 35, y: 13 },
      { type: 'deco', kind: 'lantern', x: 11, y: 11 },
      { type: 'deco', kind: 'lantern', x: 19, y: 11 },
      { type: 'deco', kind: 'snowman', x: 11, y: 17 },
      { type: 'stand', x: 16, y: 14, color: '#3e6a8a', drink: 'clam chowder', who: 'otter', line: "Chowder! Hot enough to thaw a flipper. No clams were harmed; it's mostly potatoes.", vendor: { species: 'mouse', color: '#d6d0cc', hat: 'beanie', hatColor: '#5aa9e6' } },
      { type: 'chest', id: 'gp_chest', x: 37, y: 4, script: [{ narrate: 'A bottle bobbing in the shallows. Inside, a note in a kid\'s handwriting: "IF FOUND, PLEASE RETURN TO THE KEEPER. Reward: 1 cool shell."' }, { scraps: 20 }, { snacks: 1 }] },
      { type: 'campfire', x: 8, y: 20 },
      // people
      { type: 'npc', id: 'jules_gp', x: 4, y: 12, look: 'jules', talk: 'gp_jules', cond: () => !CK.coop && !f('gp_tin') },
      { type: 'npc', id: 'jules_gp2', x: 21, y: 9, look: 'jules', talk: 'gp_jules', cond: () => !CK.coop && f('gp_tin') },
      { type: 'npc', id: 'gale', x: 26, y: 9, look: 'puffin', talk: () => (!f('gp_gale') ? 'gp_gale' : shore() && !moved() ? 'gp_heave' : 'gp_gale_again') },
      { type: 'npc', id: 'brack_out', x: 24, y: 13, look: 'walrus', o: { s: 0.9 }, talk: 'gp_brack_again', cond: () => shore() },
      { type: 'npc', id: 'crab_a', x: 21, y: 18, look: 'crab', o: { s: 0.7, seed: 1, mood: 'happy' }, talk: 'gp_crab_talk', cond: () => f('gp_crabs') },
      { type: 'npc', id: 'crab_b', x: 24, y: 18, look: 'crab', o: { s: 0.65, seed: 2, mood: 'happy' }, talk: 'gp_crab_talk', cond: () => f('gp_tin') },
      { type: 'npc', id: 'oldtin', x: 26, y: 18, look: 'crab', o: { s: 0.85, big: true, mood: 'sad' }, talk: () => (f('gp_tin') ? 'gp_tin_again' : f('gp_crabs') ? 'gp_tin' : 'gp_tin_early') },
      { type: 'enemy', id: 'gp_crab1', x: 28, y: 13, look: 'crab', battle: 'gp_crabs', patrol: [[28, 13], [29, 11], [30, 12], [29, 14]], cond: () => f('gp_brack') && !f('gp_crabs') },
      { type: 'site', id: 'gp_site', x: 23, y: 16, script: 'gp_site', cond: () => f('gp_tin') && !shore() },
    ],
    objective(G) {
      if (!f('gp_gale')) return 'Find the lighthouse keeper (east, on the cliff)';
      if (!f('gp_brack')) return 'Ask the Harbormaster about the wall (Harbor Office)';
      if (!f('gp_crabs')) return 'Catch whoever is raiding the seawall site (the beach)';
      if (!f('gp_tin')) return "Find the Shellbacks' elder at the tidepools (south beach)";
      if (!shore()) return 'Design a living shoreline (blueprint on the beach)';
      if (!moved()) return 'Help Keeper Gale roll the lighthouse back from the edge';
      if (!f('gp_done')) return 'Night has fallen. Climb the lighthouse and light the lamp';
      return 'Free roam! Use the workbench by the road to travel anywhere.';
    },
  };

  // the box brings the postcard once the Lantern Festival is over
  const portalScript = S.ep_portal;
  S.ep_portal = [
    { if: () => f('lm_done') && !f('gullpoint_arrived'), then: [
      { narrate: 'The box is cold to the touch, and frosted at the corners. Inside the flap: a gull feather, and a postcard of a red-and-white lighthouse.' },
      { narrate: '"Gull Point needs a Keeper. Bring a warm hat."' },
      ['jules', "That's... that's my grandpa's handwriting.", 'shock'],
      { coop: [['sam', "Then let's go find out why.", 'happy']] },
      { solo: [['sam', "Then you're coming. Grab a warm hat.", 'happy']] },
      { chapter: 'gullpoint', label: 'Gull Point, deep in winter...' },
    ] },
  ].concat(portalScript);
  const campus = CK.Chapters.campus;
  const campusObjective = campus.objective;
  campus.objective = function (G) {
    if (f('lm_done') && !f('gullpoint_arrived')) return 'The box by the recycling center has frost on it. Something is inside';
    return campusObjective.call(this, G);
  };
  const baseTravel = CK.travelChoice;
  CK.travelChoice = function (text) {
    const c = baseTravel(text);
    if (f('gullpoint_arrived') && CK.G.chapter !== 'gullpoint') c.choice.options.splice(c.choice.options.length - 1, 0, { label: 'Gull Point (winter coast)', then: [{ chapter: 'gullpoint', label: 'Gull Point' }] });
    return c;
  };

  // ================================================================ SCRIPTS
  const rebuild = { fn: () => { if (CK.OW) CK.OW.buildEntities(); } };
  S.gullpoint_intro = [
    { card: { title: 'Chapter 9', sub: "The Keeper's Light" } },
    { narrate: "Gull Point, the Kingdom's winter coast. Snow on the dunes, ice on the rocks, and out on the cliff, a cardboard lighthouse leaning over the sea." },
    ['jules', "That's Grandpa's lighthouse. He drew it on every birthday card I ever got. Red stripes, a round window, a gull on the rail.", 'shock'],
    ['corry', 'The Gull Point Light! It has been dark all winter. Every storm, the cliff crumbles a little more.', 'sad'],
    ['pip', 'One more big storm and it goes into the sea.', 'sad'],
    ['jules', "Then we don't let there be one more big storm. Or. You know. We figure something out.", 'happy'],
    { journal: 'A postcard in Grandpa Ike\'s handwriting brought Jules and me to Gull Point. His lighthouse is real, and it is about to fall into the sea.' },
  ];
  S.gp_jules = [() => [!f('gp_gale')
    ? ['jules', "He used to say he'd been a lighthouse keeper \"a long way from here.\" I thought he meant Maine.", 'sad']
    : !f('gp_tin') ? ['jules', 'Keeper Ike. Everybody here knows his name. It is so weird and so nice.', 'happy']
      : ['jules', '"You can\'t stop the sea. You can only slow it down, and step back when you need to." That sounds like both of them.', 'happy']]];

  S.gp_gale = [
    ['gale', 'Visitors! In January! Mind the edge, dears. It moves.', 'happy'],
    ['gale', "I've kept this light forty winters. Before me there was a boy who came through a box in a cardboard sailor hat. Built the whole tower out of a refrigerator carton. Called himself Keeper Ike.", 'happy'],
    ['jules', 'Ike. Isaac. My grandpa was called Isaac.', 'shock'],
    ['gale', 'Ha! I thought you had his ears. He promised he would come back one day and light it himself.', 'happy'],
    ['jules', "He can't. He got sick. Last spring.", 'sad'],
    ['gale', 'Oh. Oh, I am sorry, dear.', 'sad'],
    ['gale', "Well. The lamp is dark anyway. The cliff is cracking, Harbormaster Brack wants to wall in the whole beach, and the Shellbacks have gone wild. Brack's office is up the road, if you want to hear it from him.", 'sad'],
    { flag: 'gp_gale' },
  ];
  S.gp_gale_again = [() => [f('gp_done')
    ? ['gale', 'Forty winters I kept that lamp. Feels right, someone with his ears keeping it now.', 'happy']
    : moved() ? ['gale', 'The lamp is at the top of the stairs. Go on. It has been waiting a long time.', 'happy']
      : ['gale', "If you're looking for Brack, he's in the Harbor Office. If you're looking for trouble, try the beach.", 'sad']]];

  S.gp_brack = [
    ['brack', "Harbormaster Brack. If you're here about the wall, it's happening. Concrete, nine feet high, the whole length of the beach.", 'angry'],
    ['sam', "Won't the waves just bounce off it?", 'sad'],
    ['brack', 'Let them bounce! When I was a pup, my family\'s cottage stood right where the dock is now. One storm, and it was in the sea. I am not losing another house to the water.', 'angry'],
    ['brack', 'And now the Shellbacks keep stealing bolts off my wall. Little thieves. Go and see for yourself.', 'angry'],
    { flag: 'gp_brack' },
    rebuild,
  ];
  S.gp_brack_again = [() => [f('gp_done')
    ? ['brack', "I went down to the tidepools this morning. First time in years. I'd forgotten crabs could wave.", 'happy']
    : shore() ? ['brack', "No wall. Fine. I can admit when something works. Now get that light off the edge before it's too late.", 'sad']
      : f('gp_brack') ? ['brack', 'The wall goes up the moment the thieves are dealt with.', 'angry']
        : ['brack', 'Office hours are whenever the tide is out. Talk to Keeper Gale first, she likes to know who is poking around.', 'sad']]];

  S.after_gp_crab1 = [
    { narrate: 'The Shellbacks scuttle into a clacking heap. One of them is wearing a soup can. One is wearing a teacup.' },
    ['crab', "We're not stealing! We need SHELLS. The wall rubble filled up our tidepools, and the waves that bounce off it scrubbed our beach away.", 'sad'],
    ['pip', 'Hermit crabs move into bigger shells as they grow. If the tidepools are buried, there is nowhere left to find one.', 'sad'],
    ['crab', 'Talk to Old Tin, down at the last tidepool. He remembers the Keeper.', 'sad'],
    { flag: 'gp_crabs' },
    rebuild,
    { journal: 'The Shellbacks were taking bolts and cans because the wall rubble buried their tidepools. They need shells, not walls.' },
    { save: true },
  ];
  S.gp_crab_talk = [() => [f('gp_done')
    ? ['crab', 'I found a NEW shell! It is a jam jar! I can see everything!', 'happy']
    : shore() ? ['crab', 'The water comes in so gently now. Like a bath.', 'happy'] : ['crab', 'Sorry about your bolts. They make terrible shells anyway. Very pointy.', 'sad']]];
  S.gp_tin_early = [['tin', 'Go away. I am napping in my bucket. I have been napping for eleven years.', 'sad']];

  S.gp_tin = [
    ['tin', 'MORE wall builders? Off my pool!', 'angry'],
    { battle: 'gp_tin' },
    { narrate: 'Old Tin sinks down into his paint bucket until only his eyes show.' },
    ['tin', "Sorry. I'm old, and my bucket's too small, and everyone keeps building walls.", 'sad'],
    ['tin', 'The Keeper never built walls. Keeper Ike and the girl in the hard hat. They piled oyster shells out in the shallows and planted grass on the dunes, and the waves came in soft.', 'sad'],
    ['sam', 'The girl in the hard hat. Grandma Rosie.', 'shock'],
    ['tin', 'He left this in my pool for safekeeping. Said a Keeper would come for it one day.', 'happy'],
    { narrate: 'It is a jam jar. Inside, wrapped in wax paper: a little notebook, dry as toast. KEEPER\'S LOG, GULL POINT LIGHT.' },
    { narrate: '"1972. Rosie says you can\'t stop the sea. You can only slow it down, and step back when you need to. Built a reef with the crabs today."' },
    { narrate: '"P.S. Rosie hung her lantern in the sky last year. Now we both keep a light. — Ike"' },
    ['jules', 'They were friends. Your grandma and my grandpa. That is why the box let me through.', 'shock'],
    ['sam', 'Fifty years later, and they are still leaving us notes.', 'happy'],
    ['pip', 'A reef and dune grass! That is a living shoreline. It soaks up the waves instead of bouncing them back.', 'happy'],
    { flag: 'gp_tin' },
    rebuild,
    { journal: "Old Tin kept Keeper Ike's log in a jam jar. Grandpa Ike and Grandma Rosie were friends! They built a reef here in 1972. Rosie said: you can't stop the sea, only slow it down and step back." },
    { save: true },
  ];
  S.gp_tin_again = [() => [f('gp_done')
    ? ['tin', 'Brack brought me a new bucket. A BIGGER one. With a handle. I might cry.', 'happy']
    : ['tin', 'Rocks far out, shells in the shallows, grass on the sand. That is how the Keeper did it.', 'happy']]];

  S.gp_site = [
    ['jules', 'Keep the waves off the cliff under the lighthouse. But the tidepools still need a little water, or the Shellbacks cannot live there.', 'happy'],
    { puzzle: 'living_shore' },
    { narrate: 'Rocks out in the deep. Oyster shells in the shallows. Dune grass on the sand. The next wave rolls in, breaks on the reef, and reaches the beach as a long, soft hiss.' },
    { flag: 'gp_shore' },
    rebuild,
    ['tin', 'The pools are filling. Gently. Oh, look at them all come out!', 'happy'],
    ['brack', "...It's quieter. The water is quieter.", 'sad'],
    ['brack', 'If someone had done this when I was a pup, my mum\'s cottage would still... well.', 'sad'],
    ['brack', 'Fine. No wall. But that lighthouse is still sitting on a cracked cliff. Nothing fixes ground that has already broken.', 'sad'],
    ['gale', 'Then we step back! Ike built her on rollers for exactly this. Grab a rope, everybody.', 'happy'],
    ['pip', 'Real engineers did this too. In 1999 they moved a whole brick lighthouse almost a kilometre inland, on rails and rollers, to save it from the sea.', 'happy'],
    { journal: 'We designed a living shoreline: rocks, an oyster reef, and dune grass. The tidepools fill up gently now. Next: move the lighthouse back from the edge.' },
    { save: true },
  ];

  S.gp_heave = [
    ['gale', 'Ropes on! I count, you pull. Pull on HEAVE!', 'happy'],
    { await: () => startHeave() },
    { narrate: 'Inch by inch, then foot by foot, the Gull Point Light rolls back across the snow, away from the edge.' },
    { flag: 'gp_moved' },
    { fn: () => { if (CK.OW) CK.OW.refresh(); } },
    { night: true, label: 'Night falls on Gull Point...' },
    ['brack', 'Not bad, Keeper.', 'happy'],
    ['jules', "I'm not the keeper.", 'shock'],
    ['gale', 'The lamp says otherwise. Up you go, dear.', 'happy'],
    { save: true },
  ];

  S.gp_light = [() => (f('gp_done')
    ? [{ narrate: 'The beam sweeps slowly over the sea. Somewhere out there, a little boat is heading home.' }]
    : moved() && f('gullpoint_night') ? S.gp_finale
      : moved() ? [{ narrate: 'The lighthouse sits safe on its new spot, waiting for dark.' }]
        : [{ narrate: 'The lighthouse leans out over the sea. A crack runs through the snow right under its door. Nobody should go up there now.' }])];
  S.gp_finale = [
    { fn: () => { CK.Scenes.push((CK.GP_BEAM = new KeeperBeam())); } },
    { wait: 1.2 },
    { narrate: "The stairs spiral up through Ike's carton. On the wall, in pencil: lines and dates, like a kitchen doorframe. One line, low down, says MY GRANDKID, SOMEDAY?" },
    ['jules', 'He measured a spot for me. Before I was even born.', 'sad'],
    { narrate: 'At the top: a big glass lens, and a switch with a strip of tape on it. In Ike\'s handwriting: KEEP IT ON FOR SOMEBODY.' },
    ['jules', 'Okay, Grandpa.', 'happy'],
    { fn: () => { CK.GP_BEAM.on = true; CK.Audio.sfx('magic'); } },
    { wait: 2.5 },
    { narrate: 'The beam swings out across the dark water. Far out to sea, a small boat turns toward it. Far off over the hills, a paper moon seems to glow a little brighter.' },
    { fn: () => { CK.GP_BEAM.boat = true; } },
    { wait: 1.5 },
    ['sam', "You're not scared of the dark anymore?", 'happy'],
    ['jules', 'Still am. That is why you keep a light on. Not to make the dark go away. So people can find each other in it.', 'happy'],
    ['jules', 'Can I write the rule this time? Rule Seven: work with the water, not against it.', 'happy'],
    ['sam', 'And step back when you need to.', 'happy'],
    ['jules', 'Grandpa would say that is two rules.', 'happy'],
    { wait: 1 },
    { fn: () => { CK.Scenes.remove(CK.GP_BEAM); CK.GP_BEAM = null; } },
    { scraps: 60 },
    { flag: 'gp_done' },
    rebuild,
    { card: { title: 'Chapter 9 complete', sub: 'Rule Seven: work with the water, not against it.', dur: 3.2 } },
    { journal: 'Jules lit the Gull Point Light. Grandpa Ike had measured a spot on the wall for them. Rule Seven: work with the water, not against it (and step back when you need to).' },
    { save: true },
  ];
  S.gp_knock_a = [['owl', "The Keeper's light used to come through my window every nine seconds. I miss counting it to sleep.", 'sad'], { scraps: 5 }];
  S.gp_knock_b = [['mouse', 'Chowder? No? Scraps, then. Take some for the road.', 'happy'], { scraps: 5 }];
  S.gp_knock_c = [['bear', "Brack's not mean, you know. He just still dreams about that storm.", 'sad'], { snacks: 1 }];

  // ================================================================ PROPS
  Object.assign(CK.DECO_FOOT, { seawall: [-1, -1, 3, 1], tidepool: [-1, -1, 2, 1] });
  Object.assign(CK.DecoDraw, {
    seawall(ctx, e, x, y) {
      // a stub of grey concrete wall, with cones and a sign: the start of Brack's plan
      D.shadow(ctx, x + 8, y + 2, 80, 10);
      D.box3(ctx, x - 70, y - 40, 140, 40, 18, { r: 2, lw: 3, fill: '#a9aeb6', flute: false });
      for (let i = 0; i < 6; i++) D.line(ctx, x - 60 + i * 24, y - 36, x - 60 + i * 24, y - 4, 'rgba(0,0,0,0.12)', 2);
      for (const cx of [x - 86, x + 84]) { D.poly(ctx, [cx - 8, y, cx, y - 22, cx + 8, y], '#f08a3a', C.ink, 2); D.line(ctx, cx - 5, y - 8, cx + 5, y - 8, '#fffaf0', 3); }
      D.cardboard(ctx, x - 40, y - 70, 80, 22, { r: 3, lw: 2.5, fill: '#fff4dc', flute: false });
      D.text(ctx, 'SEAWALL: PHASE 1', x, y - 54, { size: 11, weight: 700, align: 'center', color: '#3d2412' });
      // scoured sand and a dark wet line in front of it
      D.line(ctx, x - 70, y + 6, x + 70, y + 6, 'rgba(60,70,90,0.35)', 4);
    },
    tidepool(ctx, e, x, y) {
      const small = e.o && e.o.small, rx = small ? 34 : 48, ry = small ? 16 : 22;
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU;
        D.ball(ctx, x + Math.cos(a) * rx, y - 4 + Math.sin(a) * ry, 9 + U.hash(i, 4) * 4, '#8a8f98', { lw: 2 });
      }
      ctx.beginPath(); ctx.ellipse(x, y - 4, rx - 4, ry - 4, 0, 0, TAU);
      ctx.fillStyle = shore() ? '#3a8ab0' : '#5a6a78'; ctx.fill(); stroke(ctx, 2);
      if (shore()) {
        const t = this.t;
        for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.ellipse(x, y - 4, (rx - 10) * (0.4 + ((t * 0.4 + i * 0.5) % 1) * 0.6), (ry - 8) * (0.4 + ((t * 0.4 + i * 0.5) % 1) * 0.6), 0, 0, TAU); stroke(ctx, 1.5, 'rgba(255,255,255,0.35)'); }
        D.poly(ctx, [x - 12, y - 8, x - 9, y - 2, x - 15, y - 4, x - 9, y - 6, x - 15, y - 1], '#ff8a5a', C.ink, 1);
        D.circle(ctx, x + 10, y - 2, 4, '#8a5ab0', C.ink, 1);
      } else {
        // buried in rubble
        for (let i = 0; i < 5; i++) D.box3(ctx, x - 22 + i * 10, y - 12 + (i % 2) * 6, 10, 7, 4, { r: 1, lw: 1.5, fill: '#a9aeb6', flute: false });
      }
    },
    dunegrass(ctx, e, x, y) {
      for (let i = 0; i < 16; i++) {
        const gx = x - 60 + U.hash(i, 7) * 120, gy = y - 70 + U.hash(i, 8) * 130, sw = Math.sin(this.t * 1.4 + i) * 3;
        for (let k = -1; k <= 1; k++) D.line(ctx, gx + k * 3, gy, gx + k * 6 + sw, gy - 18 - (k ? 0 : 6), '#9aa85a', 2);
      }
    },
    reef(ctx, e, x, y) {
      for (let i = 0; i < 10; i++) {
        const rx = x - 40 + U.hash(i, 9) * 80, ry = y - 70 + U.hash(i, 10) * 140;
        D.egg(ctx, rx, ry, 9, 5, i % 3 ? '#c9c0b0' : '#e8dcc8', { lw: 1.5, rot: U.hash(i, 11) * 3 });
        if (i % 2) { ctx.beginPath(); ctx.ellipse(rx, ry, 16, 7, 0, 0, TAU); stroke(ctx, 1.4, `rgba(255,255,255,${0.25 + Math.sin(this.t * 2 + i) * 0.15})`); }
      }
    },
    buoy(ctx, e, x, y) {
      const bob = Math.sin(this.t * 2) * 3;
      D.box3(ctx, x - 9, y - 28 + bob, 18, 26, 6, { r: 3, lw: 2.5, fill: '#ef6b6b', flute: false });
      D.line(ctx, x - 9, y - 16 + bob, x + 9, y - 16 + bob, '#fffaf0', 4);
      D.ball(ctx, x, y - 34 + bob, 5, this.night ? '#fff3b0' : '#ffd25a', { lw: 1.5 });
      ctx.beginPath(); ctx.ellipse(x, y + bob, 18, 5, 0, 0, TAU); stroke(ctx, 1.5, 'rgba(255,255,255,0.5)');
    },
    rails(ctx, e, x, y) {
      // two cardboard rails and a row of paper-tube rollers, from the cliff edge back to safety
      const x0 = (22 - e.x) * TS - 20, x1 = (29 - e.x) * TS;
      for (const dy of [-10, 6]) { D.box3(ctx, x + x0, y + dy - 4, x1 - x0, 5, 3, { r: 1, lw: 1.5, fill: '#8a6a4a', flute: false }); }
      for (let i = 0; i < 8; i++) { const rx = x + x0 + 16 + i * ((x1 - x0 - 32) / 7); D.box3(ctx, rx - 4, y - 14, 8, 24, 3, { r: 3, lw: 1.5, fill: '#d6c09a', flute: false }); }
    },
    crack(ctx, e, x, y) {
      ctx.beginPath(); ctx.moveTo(x - 30, y - 40); ctx.lineTo(x - 18, y - 22); ctx.lineTo(x - 26, y - 6); ctx.lineTo(x - 10, y + 12); ctx.lineTo(x - 16, y + 30);
      stroke(ctx, 3, '#4a4a55');
      D.line(ctx, x - 18, y - 22, x - 4, y - 26, '#4a4a55', 2);
    },
  });
  Object.assign(CK.DECO_FOOT, { crack: [0, 0, 0, 0] });

  // the lighthouse: a refrigerator carton painted in red and white stripes
  CK.BuildingDraw.lighthouse = function (ctx, e, x, y) {
    const base = y + TS * 0.25, w = 70, h = 170, top = base - h;
    const lean = moved() ? 0 : 0.06;
    D.shadow(ctx, x + 18, base + 6, 54, 16, 0.32);
    ctx.save();
    ctx.translate(x, base); ctx.rotate(lean); ctx.translate(-x, -base);
    // tapered tower in stripes
    const band = 4;
    for (let i = 0; i < band; i++) {
      const y0 = base - (h / band) * (i + 1), y1 = base - (h / band) * i;
      const w0 = w - (i + 1) * 9, w1 = w - i * 9;
      ctx.beginPath(); ctx.moveTo(x - w1 / 2, y1); ctx.lineTo(x + w1 / 2, y1); ctx.lineTo(x + w0 / 2, y0); ctx.lineTo(x - w0 / 2, y0); ctx.closePath();
      ctx.fillStyle = D.lgx(ctx, x - w1 / 2, x + w1 / 2, i % 2 ? '#c25b4a' : '#f6f2ea'); ctx.fill(); stroke(ctx, 3);
    }
    // the cardboard seam and flaps at the bottom
    D.line(ctx, x + 6, base - 4, x + 4, top + 10, 'rgba(120,80,40,0.25)', 2);
    D.rr(ctx, x - 12, base - 38, 24, 34, 10); ctx.fillStyle = '#5a6a8a'; ctx.fill(); stroke(ctx, 2.5);
    D.circle(ctx, x, top + 76, 9, '#bfe0f0', C.ink, 2.5);
    D.line(ctx, x - 9, top + 76, x + 9, top + 76, C.ink, 1.5);
    // gallery, lantern room and cap
    const gw = w - band * 9 + 22;
    D.box3(ctx, x - gw / 2, top - 6, gw, 10, 8, { r: 2, lw: 2.5, fill: '#3a4a5a', flute: false });
    for (let i = 0; i <= 6; i++) D.line(ctx, x - gw / 2 + 4 + i * ((gw - 8) / 6), top - 6, x - gw / 2 + 4 + i * ((gw - 8) / 6), top - 18, C.ink, 2);
    D.line(ctx, x - gw / 2 + 2, top - 18, x + gw / 2 - 2, top - 18, C.ink, 2.5);
    const lit = f('gp_done') || (CK.GP_BEAM && CK.GP_BEAM.on);
    D.rr(ctx, x - 16, top - 40, 32, 34, 4); ctx.fillStyle = lit ? '#fff3b0' : '#9ab8c8'; ctx.fill(); stroke(ctx, 2.5);
    D.line(ctx, x, top - 40, x, top - 6, C.ink, 1.5);
    D.poly(ctx, [x - 22, top - 38, x, top - 60, x + 22, top - 38], e.roof, C.ink, 2.5);
    D.ball(ctx, x, top - 62, 4, '#e8c060', { lw: 1.5 });
    // a gull on the rail, like on every birthday card
    D.egg(ctx, x + gw / 2 - 8, top - 24, 7, 5, '#f6f2ea', { lw: 1.5 });
    D.ball(ctx, x + gw / 2 - 3, top - 30, 4, '#f6f2ea', { lw: 1.5 });
    D.poly(ctx, [x + gw / 2, top - 31, x + gw / 2 + 6, top - 30, x + gw / 2, top - 28], '#ffd25a', C.ink, 1);
    D.circle(ctx, x + gw / 2 - 2, top - 31, 0.9, C.ink);
    ctx.restore();
    if (lit && this.night) {
      // the sweeping beam
      const a = this.t * 0.9, bx = x, by = top - 24;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const k of [0, Math.PI]) {
        const ang = a + k, L = 520;
        const g = ctx.createRadialGradient(bx, by, 4, bx, by, L);
        g.addColorStop(0, 'rgba(255,240,170,0.45)'); g.addColorStop(1, 'rgba(255,240,170,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(ang - 0.12) * L, by + Math.sin(ang - 0.12) * L * 0.45); ctx.lineTo(bx + Math.cos(ang + 0.12) * L, by + Math.sin(ang + 0.12) * L * 0.45); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
  };

  // the Harbor Office: a blue clapboard shed with an anchor and a tide board
  CK.BuildingDraw.harbor = function (ctx, e, x, y) {
    const bw = e.bw * TS, x0 = x - bw / 2, base = y + TS * 0.25, top = base - 96;
    D.shadow(ctx, x + 14, base + 6, bw / 2 + 18, 16, 0.32);
    D.box3(ctx, x0, top, bw, 96, 28, { r: 2, lw: 4, fill: e.color, flute: false });
    for (let i = 1; i < 6; i++) D.line(ctx, x0 + 4, top + i * 16, x0 + bw - 4, top + i * 16, 'rgba(0,0,0,0.12)', 2);
    D.poly(ctx, [x0 - 10, top + 4, x, top - 40, x0 + bw + 10, top + 4], e.roof, C.ink, 3.5);
    // snow on the roof
    D.poly(ctx, [x0 - 4, top - 1, x, top - 36, x0 + bw + 4, top - 1, x0 + bw - 20, top + 3, x + 12, top - 22, x - 20, top - 16, x0 + 14, top + 3], '#fbfdff', C.ink, 2);
    D.rr(ctx, x + 22, base - 50, 30, 46, 5); ctx.fillStyle = '#2f3e5e'; ctx.fill(); stroke(ctx, 3);
    D.rr(ctx, x0 + 18, top + 30, 44, 30, 4); ctx.fillStyle = '#ffe9a8'; ctx.fill(); stroke(ctx, 2.5);
    // anchor sign
    const ax = x - 6, ay = top + 40;
    D.circle(ctx, ax, ay - 14, 4, null, C.ink, 2.5);
    D.line(ctx, ax, ay - 10, ax, ay + 12, C.ink, 3);
    D.line(ctx, ax - 8, ay - 4, ax + 8, ay - 4, C.ink, 3);
    ctx.beginPath(); ctx.arc(ax, ay + 2, 11, 0.3, Math.PI - 0.3); stroke(ctx, 3);
    D.cardboard(ctx, x - 56, top - 66, 112, 22, { r: 3, lw: 2.5, fill: '#fff4dc', flute: false });
    D.text(ctx, 'HARBOR OFFICE', x, top - 50, { size: 12, weight: 700, align: 'center', color: '#3d2412' });
  };

  // ground: a crumbling cliff edge where the headland meets the beach
  CK.Chapters.gullpoint.paintGround = function (g, m) {
    // the beach: snow-dusted tan sand, with a wet dark band at the waterline
    for (let ty = 0; ty < m.h; ty++) for (let tx = 0; tx < m.w; tx++) {
      if (m.get(tx, ty) !== 's' && !(m.get(tx, ty) === 'R' && (m.get(tx - 1, ty) === 's' || m.get(tx + 1, ty) === 's'))) continue;
      g.fillStyle = '#e2cfa6'; g.fillRect(tx * TS, ty * TS, TS, TS);
      for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,0.75)' : 'rgba(150,120,80,0.35)'; g.beginPath(); g.arc(tx * TS + U.hash(tx, ty, i) * TS, ty * TS + U.hash(ty, tx, i + 9) * TS, i % 2 ? 3 : 1.6, 0, TAU); g.fill(); }
      if (m.get(tx + 1, ty) === '~') { g.fillStyle = 'rgba(120,110,95,0.45)'; g.fillRect(tx * TS + TS - 10, ty * TS, 10, TS); }
      if (m.get(tx, ty + 1) === '~') { g.fillStyle = 'rgba(120,110,95,0.45)'; g.fillRect(tx * TS, ty * TS + TS - 10, TS, 10); }
    }
    const x = 29 * TS - 6;
    g.save();
    g.beginPath(); g.moveTo(x, 2 * TS);
    for (let yy = 2; yy <= 11; yy++) g.lineTo(x + Math.sin(yy * 2.3) * 8, yy * TS);
    g.strokeStyle = 'rgba(90,90,100,0.55)'; g.lineWidth = 5; g.stroke();
    g.restore();
  };

  // ================================================================ HEAVE! (moving the lighthouse)
  // A marker swings back and forth; pull when it is in the green. In co-op both players pull,
  // and a pull counts double when you both hit it together.
  class HeaveScene {
    constructor() {
      this.t = 0; this.prog = 0; this.done = false; this.finished = false;
      this.mark = 0; this.dir = 1; this.flash = 0; this.msg = ''; this.msgT = 0; this.cool = [0, 0];
      this.parts = new CK.Particles();
    }
    pull(who) {
      if (this.done || this.cool[who] > 0) return;
      this.cool[who] = 0.3;
      const good = Math.abs(this.mark) < 0.28;
      if (good) {
        const both = CK.coop && this.cool[1 - who] > 0.15;
        this.prog = Math.min(1, this.prog + (both ? 0.24 : 0.16));
        this.flash = 1; this.msg = both ? 'HEAVE! (together!)' : 'HEAVE!'; this.msgT = 0.8;
        CK.Audio.sfx('build');
        this.parts.burst(10, () => ({ x: 600 + U.rand(-40, 40), y: 410, vx: U.rand(-120, 120), vy: U.rand(-160, -40), g: 300, life: 0.8, size: U.rand(3, 6), shape: 'snow', color: '#fff' }));
      } else { this.msg = 'Too early! Wait for the green.'; this.msgT = 0.8; CK.Audio.sfx('error'); }
      if (this.prog >= 1) { this.done = true; this.doneT = this.t; CK.Audio.sfx('win'); }
    }
    update(dt) {
      this.t += dt; this.parts.update(dt);
      this.cool = this.cool.map((c) => Math.max(0, c - dt));
      this.flash = Math.max(0, this.flash - dt * 2); this.msgT -= dt;
      if (!this.done) {
        this.mark += this.dir * dt * 1.7;
        if (this.mark > 1) { this.mark = 1; this.dir = -1; }
        if (this.mark < -1) { this.mark = -1; this.dir = 1; }
        if (CK.coop) {
          if (Input.p(0).hit('ok')) this.pull(0);
          if (Input.p(1).hit('ok')) this.pull(1);
        } else if (Input.hit('ok')) this.pull(0);
        if (Input.mouse.pressed) this.pull(0);
        if (CK.autoSkip && Math.abs(this.mark) < 0.2) this.pull(0);
      } else if (!this.closing && this.t - this.doneT > 1.2) {
        this.closing = true;
        CK.flaps(() => { this.finished = true; CK.Scenes.remove(this); });
      }
    }
    draw(ctx) {
      // a winter seaside diorama
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#9ec4e0'); g.addColorStop(1, '#e8f2fa');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#3a6a90'; ctx.fillRect(760, 300, 200, 240);
      for (let i = 0; i < 6; i++) D.line(ctx, 780 + i * 30 + Math.sin(this.t * 2 + i) * 6, 330 + i * 30, 820 + i * 30 + Math.sin(this.t * 2 + i) * 6, 330 + i * 30, 'rgba(255,255,255,0.4)', 3);
      ctx.beginPath(); ctx.moveTo(0, 300); ctx.lineTo(780, 300); ctx.lineTo(760, 540); ctx.lineTo(0, 540); ctx.closePath();
      ctx.fillStyle = '#f4f6fa'; ctx.fill(); stroke(ctx, 3);
      // rails
      for (const yy of [430, 450]) D.box3(ctx, 80, yy, 680, 6, 4, { r: 1, lw: 1.5, fill: '#8a6a4a', flute: false });
      // the lighthouse slides from the edge (right) toward safety (left)
      const lx = 640 - this.prog * 420;
      const fake = { bw: 3, bh: 4, roof: '#c25b4a', color: '#f6f2ea' };
      ctx.save(); ctx.translate(lx, 440 - 300 * 0); ctx.scale(1.1, 1.1); ctx.translate(-lx, -440);
      CK.BuildingDraw.lighthouse.call({ t: this.t, night: false }, ctx, fake, lx, 420);
      ctx.restore();
      // rollers turning under it
      for (let i = 0; i < 6; i++) { const rx = lx - 50 + i * 20; D.circle(ctx, rx, 446, 7, '#d6c09a', C.ink, 1.5); D.line(ctx, rx, 446, rx + Math.cos(this.prog * 40 + i) * 6, 446 + Math.sin(this.prog * 40 + i) * 6, C.ink, 1.2); }
      // ropes to the team on the left
      const team = CK.coop ? [['sam', 60], ['jules', 110], ['corry', 160], ['puffin', 205], ['walrus', 255]] : [['sam', 70], ['jules', 120], ['corry', 170], ['puffin', 215], ['walrus', 265]];
      const lean = this.flash * 8;
      D.line(ctx, team[0][1] - 10, 470, lx - 30, 400, '#c9a77a', 3);
      for (const [k, px] of team) D.char(ctx, k, px - lean, 492, { s: k === 'walrus' ? 1.0 : 1.2, dir: 'right', mood: 'happy', walk: this.flash ? this.t * 10 : 0 });
      // the swing meter
      const mx = W / 2, my = 70, mw = 360;
      D.rr(ctx, mx - mw / 2, my - 16, mw, 32, 12); ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 3);
      D.rr(ctx, mx - mw * 0.14, my - 12, mw * 0.28, 24, 8); ctx.fillStyle = '#9ad07a'; ctx.fill();
      const px = mx + this.mark * (mw / 2 - 12);
      D.poly(ctx, [px - 9, my - 26, px + 9, my - 26, px, my - 8], '#ef6b6b', C.ink, 2);
      D.line(ctx, px, my - 12, px, my + 12, C.ink, 3);
      D.text(ctx, CK.coop ? 'Both players: press OK in the green! Together counts double.' : 'Press Z / Space / click when the marker is in the green', mx, my + 40, { size: 15, weight: 700, align: 'center' });
      // progress
      D.rr(ctx, mx - 200, 128, 400, 18, 8); ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 2);
      D.rr(ctx, mx - 198, 130, 396 * this.prog, 14, 6); ctx.fillStyle = '#5aa9e6'; ctx.fill();
      D.text(ctx, this.done ? 'Safe from the edge!' : 'Distance from the edge', mx, 168, { size: 14, weight: 700, align: 'center', color: '#3d2412' });
      if (this.msgT > 0) D.text(ctx, this.msg, mx, 214, { size: 30, weight: 700, align: 'center', color: '#fffaf0', outline: C.ink, ow: 5 });
      this.parts.draw(ctx);
    }
  }
  function startHeave() {
    const sc = new HeaveScene();
    CK.flaps(() => CK.Scenes.push(sc), { label: 'Heave!' });
    return sc;
  }
  CK.HeaveScene = HeaveScene;

  // ================================================================ FINALE: THE KEEPER'S LIGHT
  class KeeperBeam {
    constructor() {
      this.t = 0; this.alwaysUpdate = true; this.on = false; this.onT = 0; this.boat = false; this.boatT = 0;
      this.stars = [];
      for (let i = 0; i < 80; i++) this.stars.push({ x: U.hash(i, 21) * W, y: U.hash(i, 22) * 260, r: 0.8 + U.hash(i, 23) * 1.6, p: U.hash(i, 24) * 6 });
    }
    update(dt) { this.t += dt; if (this.on) this.onT += dt; if (this.boat) this.boatT += dt; }
    draw(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, 330);
      g.addColorStop(0, '#0b1230'); g.addColorStop(1, '#22305e');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (const s of this.stars) { const tw = 0.5 + Math.sin(this.t * 2 + s.p) * 0.5; D.circle(ctx, s.x, s.y, s.r * (0.7 + tw * 0.5), `rgba(255,248,220,${0.35 + tw * 0.6})`); }
      // the paper moon, far off over the hills
      const mg = ctx.createRadialGradient(150, 90, 8, 150, 90, 80);
      mg.addColorStop(0, `rgba(255,240,190,${0.25 + (this.on ? Math.min(0.25, this.onT * 0.05) : 0)})`); mg.addColorStop(1, 'rgba(255,240,190,0)');
      ctx.fillStyle = mg; ctx.fillRect(70, 10, 160, 160);
      D.ball(ctx, 150, 90, 26, '#fff4d0', { lw: 2.5 });
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.ellipse(150, 90, Math.abs(i) * 8 + 3, 26, 0, 0, TAU); ctx.strokeStyle = 'rgba(160,120,60,0.35)'; ctx.lineWidth = 1; ctx.stroke(); }
      // falling snow
      for (let i = 0; i < 50; i++) { const sx = (U.hash(i, 31) * W + this.t * 12 + Math.sin(this.t + i) * 10) % W, sy = (U.hash(i, 32) * H + this.t * 30) % H; D.circle(ctx, sx, sy, 1.6 + U.hash(i, 33) * 1.4, 'rgba(255,255,255,0.75)'); }
      // the sea
      ctx.fillStyle = '#132250'; ctx.fillRect(0, 330, W, H - 330);
      for (let i = 0; i < 10; i++) D.line(ctx, 400 + Math.sin(this.t + i) * 30 + i * 40, 350 + i * 18, 460 + Math.sin(this.t + i) * 30 + i * 40, 350 + i * 18, 'rgba(255,255,255,0.15)', 2);
      // the beam, sweeping out to sea
      const lx = 250, ly = 150;
      if (this.on) {
        const a = -0.15 + Math.sin(this.onT * 0.7) * 0.35, L = 900, k = Math.min(1, this.onT * 0.8);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const bg = ctx.createRadialGradient(lx, ly, 6, lx, ly, L);
        bg.addColorStop(0, `rgba(255,240,170,${0.55 * k})`); bg.addColorStop(1, 'rgba(255,240,170,0)');
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + Math.cos(a - 0.1) * L, ly + Math.sin(a - 0.1) * L); ctx.lineTo(lx + Math.cos(a + 0.1) * L, ly + Math.sin(a + 0.1) * L); ctx.closePath(); ctx.fill();
        const glow = ctx.createRadialGradient(lx, ly, 2, lx, ly, 60);
        glow.addColorStop(0, `rgba(255,245,200,${0.8 * k})`); glow.addColorStop(1, 'rgba(255,245,200,0)');
        ctx.fillStyle = glow; ctx.fillRect(lx - 60, ly - 60, 120, 120);
        ctx.restore();
      }
      // a little boat heading home toward the light
      if (this.boat) {
        const bx = 900 - Math.min(1, this.boatT / 6) * 260, by = 400 + Math.sin(this.t * 2) * 3;
        D.poly(ctx, [bx - 22, by, bx + 22, by, bx + 14, by + 12, bx - 14, by + 12], '#c9925a', C.ink, 2);
        D.line(ctx, bx, by, bx, by - 30, C.ink, 2);
        D.poly(ctx, [bx + 2, by - 28, bx + 20, by - 6, bx + 2, by - 6], '#fffaf0', C.ink, 1.5);
        D.circle(ctx, bx - 8, by - 4, 3, '#fff3b0');
      }
      // the headland, the lighthouse and everyone at its foot
      ctx.beginPath(); ctx.moveTo(0, 290); ctx.quadraticCurveTo(260, 250, 420, 300); ctx.lineTo(470, 540); ctx.lineTo(0, 540); ctx.closePath();
      ctx.fillStyle = '#d8e0ec'; ctx.fill(); stroke(ctx, 3);
      CK.BuildingDraw.lighthouse.call({ t: this.t, night: false }, ctx, { bw: 3, bh: 4, roof: '#c25b4a' }, lx, 318);
      const who = [['sam', 120], ['corry', 330], ['pip', 370], ['puffin', 60], ['walrus', 410]];
      for (const [k, px] of who) D.char(ctx, k, px, 330 + (px > 300 ? 8 : 0), { s: k === 'walrus' ? 0.85 : 1, dir: 'right', mood: 'happy' });
      CH.crab(ctx, 448, 352, { s: 1.3, big: true, mood: 'happy' });
      CH.crab(ctx, 24, 344, { s: 1.3, seed: 1, mood: 'happy' });
      // Jules up on the gallery
      if (this.on) D.char(ctx, 'jules', lx + 26, 160, { s: 0.55, dir: 'right', mood: 'happy', noShadow: true });
    }
  }
  CK.KeeperBeam = KeeperBeam;

  // ================================================================ PUZZLE: THE LIVING SHORELINE
  // Waves roll in from the top. Each row, every column loses whatever the thing in it soaks up,
  // and waves bend around the ends of anything in their way (a column can't be more than 3
  // weaker than its neighbour). Keep the cliff calm and the tidepools gently wet.
  const PIECES = {
    rock: { name: 'Rock breakwater', cost: 4, soak: 4, on: 'wv', color: '#8a8f98', key: 1, note: 'soaks up 4 · deep or shallow water' },
    reef: { name: 'Oyster reef', cost: 2, soak: 2, on: 'v', color: '#e8dcc8', key: 2, note: 'soaks up 2 · shallows only · alive!' },
    grass: { name: 'Dune grass', cost: 1, soak: 1, on: 's', color: '#9aa85a', key: 3, note: 'soaks up 1 · sand only' },
    wall: { name: 'Concrete seawall', cost: 1, soak: 99, on: 's', color: '#a9aeb6', key: 4, note: 'stops it dead · but waves bounce back' },
  };
  CK.PuzzleDefs.living_shore = {
    type: 'shore', title: 'The Living Shoreline', budget: 12, start: 6, spread: 3,
    grid: ['wwwwwwwww', 'whwwwwwww', 'vhvvvvvvv', 'shstsstss', 'shssscccs'],
    brief: 'Waves come in at strength 6. Get every cliff square (grey, under the lighthouse) down to 1 or less, and give each tidepool a gentle 1 to 3. Keep the boat channel open. Budget: 12 scraps.',
    hint: 'Sand and tidepools soak up 1 each row on their own. Waves bend around the end of a breakwater, so protect neighbours together. Each cliff column needs 3 soaked up before the beach: a reef plus dune grass works, and where a tidepool sits on the cliff column (no grass there), a rock does it. The left tidepool only needs one reef.',
    lesson: 'A seawall reflects waves and scours the beach in front of it. A living shoreline (reefs, dunes, marsh grass) soaks up wave energy instead, grows back after storms, and leaves room for the creatures that live there.',
    solution: [[3, 2, 'reef'], [5, 2, 'reef'], [6, 2, 'rock'], [7, 2, 'reef'], [5, 3, 'grass'], [7, 3, 'grass']],
  };
  class ShorePuzzle extends CK.Puzzle.PuzzleBase {
    constructor(def) {
      super(def);
      this.rows = def.grid.length; this.cols = def.grid[0].length;
      this.cs = 64; this.ox = 40; this.oy = 120;
      this.place = {};
      this.tool = 'reef';
      this.cursor = [4, 2];
      this.anim = 0;
    }
    T(c, r) { return this.def.grid[r][c]; }
    spent() { return Object.values(this.place).reduce((a, k) => a + PIECES[k].cost, 0); }
    energies() {
      const out = [];
      let e = new Array(this.cols).fill(this.def.start);
      for (let r = 0; r < this.rows; r++) {
        e = e.slice();
        for (let c = 0; c < this.cols; c++) {
          const k = this.place[c + ',' + r];
          if (k) e[c] = Math.max(0, e[c] - PIECES[k].soak);
          if ('sct'.includes(this.T(c, r))) e[c] = Math.max(0, e[c] - 1);
        }
        const sp = this.def.spread;
        e = e.map((v, c) => Math.max(v, c > 0 ? e[c - 1] - sp : 0, c < this.cols - 1 ? e[c + 1] - sp : 0));
        out.push(e);
      }
      return out;
    }
    evaluate() {
      const E = this.energies();
      const cliff = [], dry = [], rough = [];
      for (let r = 0; r < this.rows; r++) for (let c = 0; c < this.cols; c++) {
        const t = this.T(c, r), v = E[r][c];
        if (t === 'c' && v > 1) cliff.push([c, r]);
        if (t === 't' && v < 1) dry.push([c, r]);
        if (t === 't' && v > 3) rough.push([c, r]);
      }
      const walls = Object.entries(this.place).filter(([, k]) => k === 'wall').map(([key]) => key.split(',').map(Number));
      return { E, cliff, dry, rough, walls, ok: !cliff.length && !dry.length && !rough.length && !walls.length };
    }
    clear() { this.place = {}; }
    applySolution() { this.place = {}; for (const [c, r, k] of this.def.solution) this.place[c + ',' + r] = k; }
    validate() { return this.spent() > this.def.budget ? `Over budget! ${this.spent()} / ${this.def.budget} scraps.` : null; }
    startTest() { this.state = 'test'; this.anim = 0; this.res = this.evaluate(); CK.Audio.sfx('splash'); }
    resetTest() { this.res = null; }
    cellAt(mx, my) {
      const c = Math.floor((mx - this.ox) / this.cs), r = Math.floor((my - this.oy) / this.cs);
      return c >= 0 && r >= 0 && c < this.cols && r < this.rows ? [c, r] : null;
    }
    toggle(c, r) {
      const key = c + ',' + r, t = this.T(c, r), P = PIECES[this.tool];
      if (this.place[key]) { delete this.place[key]; CK.Audio.sfx('back'); return; }
      if (t === 'h') { CK.Audio.sfx('error'); this.flashMsg('That is the boat channel. The fishing boats need it open!'); return; }
      if (t === 't') { CK.Audio.sfx('error'); this.flashMsg('That is a tidepool. The Shellbacks live there!'); return; }
      if (t === 'c') { CK.Audio.sfx('error'); this.flashMsg('That is the cliff itself. Build out in front of it.'); return; }
      if (!P.on.includes(t)) { CK.Audio.sfx('error'); this.flashMsg(`${P.name}: ${P.note.split('·')[1].trim()}.`); return; }
      this.place[key] = this.tool;
      CK.Audio.sfx('build');
    }
    update(dt) {
      if (this.commonUpdate(dt)) {
        if (this.state === 'test') this.updateTest(dt);
        return;
      }
      for (const id of Object.keys(PIECES)) if (Input.key('Digit' + PIECES[id].key)) { this.tool = id; CK.Audio.sfx('blip'); }
      const [c, r] = this.cursor;
      if (Input.hit('left')) this.cursor = [Math.max(0, c - 1), r];
      if (Input.hit('right')) this.cursor = [Math.min(this.cols - 1, c + 1), r];
      if (Input.hit('up')) this.cursor = [c, Math.max(0, r - 1)];
      if (Input.hit('down')) this.cursor = [c, Math.min(this.rows - 1, r + 1)];
      if (Input.hit('ok')) this.toggle(...this.cursor);
      if (Input.mouse.moved) { const cell = this.cellAt(Input.mouse.x, Input.mouse.y); if (cell) this.cursor = cell; }
      if (Input.mouse.pressed) {
        const cell = this.cellAt(Input.mouse.x, Input.mouse.y);
        if (cell) this.toggle(...cell);
        Object.keys(PIECES).forEach((id, i) => { if (D.inRect(Input.mouse.x, Input.mouse.y, 690, 232 + i * 40, 246, 36)) { this.tool = id; CK.Audio.sfx('blip'); } });
      }
    }
    updateTest(dt) {
      this.anim += dt;
      if (this.anim > 3.2 || CK.autoSkip) {
        const r = this.res;
        if (r.ok) {
          CK.setFlag('gp_shore');
          this.finish(true, 'The waves come in soft!', `The cliff is calm and the tidepools are gently wet. ${this.def.lesson}`);
        } else if (r.walls.length) {
          this.finish(false, 'The wave bounced back!', 'The seawall stops the wave, but it reflects off the concrete and scours away the sand in front of it. Next storm, the wall gets undermined. Try something that soaks up the waves instead.');
        } else if (r.cliff.length) {
          this.finish(false, 'The cliff is still taking a beating!', `${r.cliff.length} cliff square${r.cliff.length > 1 ? 's are' : ' is'} hit by waves stronger than 1. Remember waves bend around the ends of a breakwater.`);
        } else if (r.dry.length) {
          this.finish(false, 'The tidepool dried up!', 'You blocked all the water. The Shellbacks need a little wave to refill their pools.');
        } else {
          this.finish(false, 'Too rough for the tidepool!', 'The waves are churning the tidepool up. Soften them a little more out in the shallows.');
        }
      }
    }
    draw(ctx) {
      this.drawFrame(ctx);
      const { ox, oy, cs } = this;
      const res = this.state !== 'build' ? this.res : null;
      const ev = this.evaluate();
      const E = ev.E;
      D.box3(ctx, ox - 8, oy - 8, this.cols * cs + 16, this.rows * cs + 16, 14, { fill: '#2a3a48', lw: 3, flute: false });
      // during a test, the wave front sweeps down row by row
      const front = res ? this.anim * 2 : 99;
      for (let r = 0; r < this.rows; r++) for (let c = 0; c < this.cols; c++) {
        const t = this.T(c, r), x = ox + c * cs, y = oy + r * cs;
        ctx.fillStyle = { w: '#2a5a8a', v: '#3e8ab0', h: '#2a4a7a', s: '#efe6d2', t: '#8a8f98', c: '#7a7a84' }[t];
        ctx.fillRect(x, y, cs, cs);
        if (t === 's' || t === 'c') for (let i = 0; i < 3; i++) D.circle(ctx, x + 10 + U.hash(c, r, i) * 44, y + 10 + U.hash(r, c, i) * 44, 2.4, '#ffffff');
        if (t === 't') { ctx.beginPath(); ctx.ellipse(x + cs / 2, y + cs / 2, 22, 16, 0, 0, TAU); ctx.fillStyle = '#3a8ab0'; ctx.fill(); stroke(ctx, 2); }
        if (t === 'h') { D.box3(ctx, x + 26, y + 18, 12, 22, 4, { r: 3, lw: 1.5, fill: '#ef6b6b', flute: false }); }
        if (t === 'c' && r === 4 && c === 6) D.text(ctx, 'CLIFF', x + cs / 2, y + cs - 6, { size: 11, weight: 700, align: 'center', color: '#fffaf0' });
        // wave strength: white crests, more of them for stronger waves
        const v = E[r][c];
        if (r <= front && t !== 'h') {
          const n = Math.min(6, v);
          for (let i = 0; i < n; i++) {
            const wy = y + 8 + i * 8 + Math.sin(this.t * 3 + c + i) * 2;
            ctx.beginPath(); ctx.moveTo(x + 8, wy); ctx.quadraticCurveTo(x + cs / 2, wy - 5, x + cs - 8, wy); stroke(ctx, 2, `rgba(255,255,255,${0.25 + n * 0.08})`);
          }
          D.text(ctx, String(v), x + cs - 9, y + 15, { size: 12, weight: 700, align: 'center', color: v >= 4 ? '#ffd6d6' : '#e8fff0', outline: C.ink, ow: 3 });
        }
        ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.strokeRect(x, y, cs, cs);
      }
      // the pieces, standing up off the grid
      for (const [key, k] of Object.entries(this.place)) {
        const [c, r] = key.split(',').map(Number), x = ox + c * cs + cs / 2, y = oy + r * cs + cs / 2 + 10;
        if (k === 'rock') for (let i = 0; i < 4; i++) D.ball(ctx, x - 14 + (i % 2) * 22 + (i > 1 ? 6 : 0), y - (i > 1 ? 14 : 0), 12, '#8a8f98', { lw: 2 });
        if (k === 'reef') for (let i = 0; i < 6; i++) D.egg(ctx, x - 16 + (i % 3) * 16, y - 6 - Math.floor(i / 3) * 10, 8, 5, i % 2 ? '#e8dcc8' : '#c9c0b0', { lw: 1.5, rot: i });
        if (k === 'grass') for (let i = 0; i < 5; i++) for (let j = -1; j <= 1; j++) D.line(ctx, x - 18 + i * 9 + j * 2, y, x - 18 + i * 9 + j * 4, y - 20 - (j ? 0 : 5), '#7a8a3a', 2);
        if (k === 'wall') D.box3(ctx, x - 28, y - 28, 56, 26, 10, { r: 2, lw: 2.5, fill: '#a9aeb6', flute: false });
      }
      if (res && this.anim > 2.4) {
        for (const [c, r] of res.cliff.concat(res.dry, res.rough, res.walls)) { ctx.strokeStyle = `rgba(255,90,90,${0.6 + Math.sin(this.t * 8) * 0.4})`; ctx.lineWidth = 4; ctx.strokeRect(ox + c * cs + 3, oy + r * cs + 3, cs - 6, cs - 6); }
        if (res.ok) for (let i = 0; i < 4; i++) CH.crab(ctx, ox + 3.5 * cs + i * 40 + Math.sin(this.t * 3 + i) * 6, oy + 4 * cs - 6, { s: 0.6, seed: i, mood: 'happy' });
      }
      if (this.state === 'build') {
        const [c, r] = this.cursor, pulse = 0.5 + Math.sin(this.t * 6) * 0.5;
        ctx.strokeStyle = `rgba(255,236,120,${0.6 + pulse * 0.4})`; ctx.lineWidth = 4;
        ctx.strokeRect(ox + c * cs + 2, oy + r * cs + 2, cs - 4, cs - 4);
      }
      D.text(ctx, 'THE SEA   (waves arrive at strength 6)', ox + 4, oy - 14, { size: 13, weight: 700, color: '#cfe6ff' });
      this.drawPanel(ctx, (ctx, px, y, pw) => {
        const sp = this.spent();
        D.text(ctx, `Budget: ${sp} / ${this.def.budget} scraps`, px + 16, y + 4, { size: 15, weight: 700, color: sp > this.def.budget ? '#c2410c' : '#3d2412' });
        D.text(ctx, `Cliff: ${ev.cliff.length ? ev.cliff.length + ' too rough' : 'calm'} · Pools: ${ev.dry.length ? 'dry!' : ev.rough.length ? 'too rough' : 'gentle'}`, px + 16, y + 24, { size: 12, color: '#5b3a1e' });
        Object.keys(PIECES).forEach((id, i) => {
          const P = PIECES[id], by = 232 + i * 40, sel = this.tool === id;
          D.rr(ctx, px + 14, by, pw - 28, 36, 8); ctx.fillStyle = sel ? '#fff0b8' : '#fffaf0'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = sel ? 2.5 : 1.5; ctx.stroke();
          D.ball(ctx, px + 32, by + 18, 9, P.color, { lw: 1.5 });
          D.text(ctx, `${P.key}. ${P.name} (${P.cost})`, px + 48, by + 15, { size: 13, weight: 700 });
          D.text(ctx, P.note, px + 48, by + 30, { size: 10.5, color: '#7a5434' });
        });
      });
      D.text(ctx, 'Click a square (or arrows + Z) to place. Click again to remove. Keys 1-4 switch.', 30, H - 14, { size: 13, color: '#cfe6ff' });
      this.drawOverlay(ctx);
    }
  }
  CK.PuzzleTypes.shore = ShorePuzzle;
})();
