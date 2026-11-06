// Cardboard Kingdom - Chapter 14: Thimble Row (v2.14). A "festival neighborhood" vertical slice.
// Reference stack (from Alek's inspiration atlas, original work only):
//  * Gameplay: Costume Quest's loop. Meet the residents, assemble a costume from pieces they give
//    you, and the costume matters twice: in the field (turn rusted valves) and in battle (Tighten Up).
//  * Visual: Tinykin's scale and warm interiors. Tiny residents live in giant everyday objects (a
//    teacup, a thread spool, a sardine tin, a boot) on an island ringed by water; the water tower is
//    a giant teapot, and its inside is warm lamplight and copper pipes.
//  * Supporting: Okami-style restoration. Before the repair the whole street is drained of colour;
//    after it, the colour blooms outward from the fountain, and the street stays changed.
// The repair: the Teapot overfills because every valve rusted shut when the old Waterkeeper retired
// ("everybody thought somebody else knew how"), so the overflow pours down the street. Three rooms of
// live valves teach one rule each: open water goes where pipes lead, outlets have a capacity, and
// one wrong valve sprays the neighbors. Rule Twelve: start with your own street.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input, Data = CK.Data, CH = D.chars;
  const W = CK.W, H = CK.H, TS = 48;
  const C = D.C, TAU = Math.PI * 2;
  const f = (k) => CK.flag(k);
  const S = CK.Story.scripts;
  const stroke = (ctx, lw, col) => { ctx.strokeStyle = col || C.ink; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };
  const show = (scene) => { CK.Scenes.push(scene); return scene; };
  const rebuild = { fn: () => { if (CK.OW) CK.OW.refresh(); } };
  const wearing = () => CK.OW && CK.OW.anyWearing('beetle');

  // ================================================================ PEOPLE
  const RES = {
    thimbleton: { species: 'mouse', color: '#e8dcd2', hat: 'beanie', hatColor: '#ef8fb0', scarf: '#fff3b0' },
    bodkin: { species: 'hedgehog', color: '#c9a77a', scarf: '#6fa8dc' },
    pim: { species: 'robin', color: '#b07a5a', scarf: '#ffd25a' },
    sorrel: { species: 'bunny', color: '#f6efe6', hat: 'flowers' },
    dabney: { species: 'duck', color: '#ffe67a', hat: 'sunhat' },
  };
  Object.assign(Data.speakers, {
    thimbleton: { name: 'Mrs. Thimbleton', look: 'critter', ps: 2.2, py: 0, bg: '#ffeef3', o: RES.thimbleton },
    bodkin: { name: 'Bodkin', look: 'critter', ps: 2.2, py: 0, bg: '#e8f0fa', o: RES.bodkin },
    pim: { name: 'Pim', look: 'critter', ps: 2.2, py: 0, bg: '#fff3d6', o: RES.pim },
    sorrel: { name: 'Sorrel', look: 'critter', ps: 2.2, py: 0, bg: '#f2fbe8', o: RES.sorrel },
    dabney: { name: 'Dabney', look: 'critter', ps: 2.2, py: 0, bg: '#fff8d6', o: RES.dabney },
    whistle: { name: 'Old Whistle', look: 'kettlenpc', ps: 1.5, py: -6, bg: '#e6eef6' },
  });

  // ================================================================ THE COSTUME: Spanner Beetle
  Object.assign(Data.costumes, {
    beetle: { name: 'Spanner Beetle', hp: 6, atk: 2, special: 'Tighten Up', desc: 'A big twist of the wrench on one foe (2x), and every leak gets sealed: dries the party and blocks the next 2 water attacks.', color: '#4a8a8a' },
  });
  Object.assign(Data.fieldPowers, { beetle: 'Turn rusted valves and wheels (lots of leverage)' });
  const PIECES = {
    shell: { name: 'a sardine-tin shell', who: 'thimbleton' },
    horn: { name: 'a paperclip wrench horn', who: 'bodkin' },
    feelers: { name: 'pipe-cleaner feelers', who: 'pim' },
  };
  const got = (k) => f('th_piece_' + k);
  const allPieces = () => Object.keys(PIECES).every(got);

  // walking outfit: a glossy teal shell with button spots, and a cap with a wrench for a horn
  const baseBody = D.costumeBody;
  D.costumeBody = function (ctx, c, x, top, bot, s, dir) {
    if (c !== 'beetle') return baseBody.call(this, ctx, c, x, top, bot, s, dir);
    const h = bot - top, back = dir === 'up';
    D.rr(ctx, x - 12 * s, top, 24 * s, h, 6 * s); D.fillVol(ctx, x, (top + bot) / 2, 14 * s, '#3f7a7a', 1.8);
    if (back || dir === 'left' || dir === 'right') {
      // the shell, split down the middle
      ctx.beginPath(); ctx.ellipse(x + (dir === 'left' ? 4 : dir === 'right' ? -4 : 0) * s, top + h * 0.45, 14 * s, h * 0.62, 0, 0, TAU);
      D.fillVol(ctx, x - 3 * s, top + h * 0.3, 14 * s, '#4aa0a0', 1.8);
      if (back) D.line(ctx, x, top - 2 * s, x, bot, C.ink, 1.6);
    }
    for (const [dx, dy] of [[-6, 0.3], [6, 0.35], [-4, 0.7], [5, 0.75]]) D.circle(ctx, x + dx * s, top + h * dy, 2.4 * s, '#ffd25a', C.ink, 1);
  };
  const baseHat = D.costumeHat;
  D.costumeHat = function (ctx, c, x, hy, s, dir) {
    if (c !== 'beetle') return baseHat.call(this, ctx, c, x, hy, s, dir);
    // pipe-cleaner feelers
    for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + k * 6 * s, hy - 18 * s); ctx.quadraticCurveTo(x + k * 14 * s, hy - 30 * s, x + k * 9 * s, hy - 38 * s); stroke(ctx, 2.2, '#ef8fb0'); D.ball(ctx, x + k * 9 * s, hy - 38 * s, 2.4 * s, '#ef8fb0', { lw: 1 }); }
    // a domed teal cap
    ctx.beginPath(); ctx.arc(x, hy - 6 * s, 15 * s, Math.PI, 0); ctx.closePath();
    D.fillVol(ctx, x - 3 * s, hy - 12 * s, 15 * s, '#4aa0a0', 2);
    // the wrench horn (an open-ended spanner, bent paperclip silver)
    const hx = x + 2 * s, hy2 = hy - 22 * s;
    D.line(ctx, x, hy - 16 * s, hx, hy2, C.ink, 5 * s); D.line(ctx, x, hy - 16 * s, hx, hy2, '#d6dde6', 3 * s);
    ctx.beginPath(); ctx.arc(hx, hy2 - 3 * s, 5 * s, Math.PI * 0.35, Math.PI * 2.65); stroke(ctx, 4 * s, C.ink); ctx.beginPath(); ctx.arc(hx, hy2 - 3 * s, 5 * s, Math.PI * 0.35, Math.PI * 2.65); stroke(ctx, 2.4 * s, '#d6dde6');
  };
  // battle form: a great teal beetle, its shell open like wings, a huge wrench for a horn
  const baseGiant = D.giant;
  D.giant = function (ctx, type, x, y, o = {}) {
    if (type !== 'beetle') return baseGiant.call(this, ctx, type, x, y, o);
    const t = CK.time, s = o.s || 1, who = o.who || 'sam';
    const b = Math.sin(t * 2.2 + (o.seed || 0)) * 2;
    D.shadow(ctx, x, y, 66 * s, 14 * s, 0.3);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (o.flash) ctx.filter = 'brightness(1.8)';
    for (const k of [-1, 1]) for (let i = 0; i < 3; i++) D.line(ctx, k * 30, -50 - i * 22 + b, k * (60 + i * 6), -20 - i * 26 + b, C.ink, 5);
    for (const k of [-1, 1]) D.box3(ctx, k * 18 - 10, -40, 20, 40, 8, { fill: '#2f5f5f', lw: 3, flute: false });
    // shell halves, lifted
    for (const k of [-1, 1]) {
      ctx.save(); ctx.translate(k * 8, -130 + b); ctx.rotate(k * 0.35);
      ctx.beginPath(); ctx.ellipse(k * 30, 30, 40, 70, 0, 0, TAU); D.fillVol(ctx, k * 20, 10, 50, '#4aa0a0', 3);
      for (const [dx, dy] of [[14, 0], [30, 40], [20, 70]]) D.circle(ctx, k * dx + k * 6, dy, 8, '#ffd25a', C.ink, 2);
      ctx.restore();
    }
    D.box3(ctx, -36, -130 + b, 72, 92, 14, { r: 16, fill: '#3f7a7a', lw: 3, flute: false });
    // head with face window
    ctx.beginPath(); ctx.ellipse(0, -160 + b, 38, 30, 0, 0, TAU); D.fillVol(ctx, -6, -168 + b, 38, '#2f6f6f', 3);
    D.rr(ctx, -22, -176 + b, 44, 32, 12); ctx.fillStyle = '#fff8dc'; ctx.fill();
    ctx.save(); D.rr(ctx, -22, -176 + b, 44, 32, 12); ctx.clip(); D.peekFace(ctx, who, 0, -158 + b, 17, o.mood); ctx.restore();
    D.rr(ctx, -22, -176 + b, 44, 32, 12); stroke(ctx, 3);
    // the spanner horn
    ctx.save(); ctx.translate(0, -186 + b); ctx.rotate(-0.2 + (o.swing || 0) * 0.8);
    D.rr(ctx, -7, -70, 14, 72, 6); ctx.fillStyle = D.lgx(ctx, -7, 7, '#d6dde6'); ctx.fill(); stroke(ctx, 3);
    ctx.beginPath(); ctx.arc(0, -82, 20, Math.PI * 0.32, Math.PI * 2.68); stroke(ctx, 14, C.ink); ctx.beginPath(); ctx.arc(0, -82, 20, Math.PI * 0.32, Math.PI * 2.68); stroke(ctx, 9, '#d6dde6');
    ctx.restore();
    for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 18, -186 + b); ctx.quadraticCurveTo(k * 50, -230 + b, k * 40, -258 + b); stroke(ctx, 5, '#ef8fb0'); D.ball(ctx, k * 40, -258 + b, 8, '#ef8fb0', { lw: 2 }); }
    ctx.restore();
  };
  const baseSpecial = CK.Battle.prototype.special;
  CK.Battle.prototype.special = function* (m, target) {
    if (m.costume !== 'beetle') return yield* baseSpecial.call(this, m, target);
    this.banner = { text: 'Tighten Up!', t: 0, small: true };
    CK.Audio.sfx('magic');
    yield 0.6;
    this.banner = null;
    const foe = target && target.hp > 0 ? target : this.alive('enemy')[0];
    if (foe) {
      const dmg = Math.round(m.atk * 2 * (0.9 + Math.random() * 0.2));
      foe.hp = Math.max(0, foe.hp - dmg); this.pop(foe, '-' + dmg, '#fff', 30); CK.Audio.sfx('crit');
      if (this.parts) this.parts.burst(12, () => ({ x: foe.pos.x + U.rand(-30, 30), y: foe.pos.y - U.rand(40, 140), vx: U.rand(-160, 160), vy: U.rand(-200, -40), g: 400, life: 0.8, size: 6, shape: 'star', color: '#d6dde6' }));
    }
    yield 0.5;
    this.barricade = Math.max(this.barricade || 0, 2); this.barT = 0; CK.tween(this, { barT: 1 }, 0.4, 'outBack');
    for (const p of this.alive('party')) { p.soak = 0; p.floppy = false; this.pop(p, 'Sealed!', '#9fe0e0', 20); }
    CK.Audio.sfx('block');
    yield 0.8;
  };

  // ================================================================ OLD WHISTLE (the tower's kettle)
  function drawKettle(ctx, x, y, s, calm, t) {
    D.shadow(ctx, x, y, 60 * s, 12 * s, 0.32);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const shake = calm ? 0 : Math.sin(t * 30) * 2;
    ctx.translate(shake, 0);
    // spout, handle, body, lid
    ctx.beginPath(); ctx.moveTo(50, -60); ctx.quadraticCurveTo(90, -70, 100, -110); ctx.lineTo(86, -114); ctx.quadraticCurveTo(80, -84, 46, -80); ctx.closePath(); D.fillVol(ctx, 70, -90, 30, '#c8ced8', 3);
    ctx.beginPath(); ctx.arc(-50, -90, 30, Math.PI * 0.6, Math.PI * 1.5); stroke(ctx, 12, C.ink); ctx.beginPath(); ctx.arc(-50, -90, 30, Math.PI * 0.6, Math.PI * 1.5); stroke(ctx, 7, '#2f2f3a');
    ctx.beginPath(); ctx.ellipse(0, -70, 62, 62, 0, 0, TAU); D.fillVol(ctx, -16, -90, 70, calm ? '#d6dde6' : '#e8b0a0', 3);
    D.ellipse(ctx, 0, -132, 34, 10, '#c8ced8', C.ink, 3);
    D.ball(ctx, 0, -146, 9, '#2f2f3a', { lw: 2.5 });
    D.line(ctx, -40, -40, 40, -40, 'rgba(0,0,0,0.12)', 3);
    // face
    if (calm) { for (const k of [-1, 1]) { ctx.beginPath(); ctx.arc(k * 20, -78, 7, Math.PI * 1.1, Math.PI * 1.9); stroke(ctx, 3); } ctx.beginPath(); ctx.arc(0, -64, 10, 0.2, Math.PI - 0.2); stroke(ctx, 3); }
    else { for (const k of [-1, 1]) { D.circle(ctx, k * 20, -78, 9, '#fffaf0', C.ink, 2.5); D.circle(ctx, k * 20, -78, 4, '#120e14'); D.line(ctx, k * 30, -96, k * 10, -90, C.ink, 3); } D.ellipse(ctx, 0, -56, 10, 7, '#5a2a2a', C.ink, 2.5); }
    D.blush(ctx, 0, -66, 30, 6);
    ctx.restore();
    // steam
    const n = calm ? 2 : 5;
    for (let i = 0; i < n; i++) {
      const p = (t * (calm ? 0.4 : 1.3) + i / n) % 1;
      D.circle(ctx, x + (100 + p * 40 * (calm ? 0.5 : 1)) * s, y - (116 + p * 70) * s, (8 + p * 14) * s, `rgba(255,255,255,${0.8 - p * 0.7})`);
    }
  }
  Data.enemies.kettle = {
    name: 'Old Whistle', hp: 260, atk: 10, def: 2, xp: 60, scraps: 30, draw: 'kettle', boss: true,
    moves: [{ name: 'Steam Burst', power: 1.2, w: 2, water: true }, { name: 'Boil Over', power: 0.8, all: true, w: 2, water: true, soak: true }, { name: 'WHEEEEE', power: 0.5, all: true, w: 1, drain: true }],
  };
  Data.battles.th_kettle = { enemies: ['splashling', 'kettle', 'splashling'], season: 'spring', boss: true, music: 'boss' };
  const baseEnemy = D.enemy;
  D.enemy = function (ctx, type, x, y, o = {}) {
    if (type === 'kettle') return drawKettle(ctx, x, y, (o.s || 1) * 0.95, !!o.calm, CK.time);
    return baseEnemy.call(this, ctx, type, x, y, o);
  };
  CH.kettlenpc = function (ctx, x, y, o) { drawKettle(ctx, x, y, (o.s || 1) * 0.36, o.mood !== 'sad', CK.time); };

  // ================================================================ THE PLACE
  Data.seasons.thimble = {
    name: 'Festival week', ground: '#b9e08a', ground2: '#a9d47a', path: '#f0d6a0', sand: '#f6e2a8', water: '#5cc8e6', waterD: '#2f9cc8',
    sky: ['#bfe8ff', '#ffe8cc'], night: ['#1d1a4a', '#4a2f6e'], tree: 'blossom', particle: 'petal',
  };
  const fixed = () => f('th_fixed');
  // the fountain at the heart of the street: where the colour comes back from
  const FOUNT = [17, 13];
  Object.assign(CK.DECO_FOOT, {
    th_fountain: [-0.3, -0.3, 1.6, 0.8],
    th_pencil: [-1.4, -0.2, 3.8, 0.6],
    th_stall: [-0.4, -0.2, 1.8, 0.6],
  });

  // giant-object houses, all drawn on the building footprint (x = centre, y = bottom row)
  const sign = (ctx, x, y, label) => {
    ctx.font = `700 12px ${CK.FONT}`;
    const w = D.measure(ctx, label, 12, 700) + 16;
    D.rr(ctx, x - w / 2, y - 10, w, 18, 4); ctx.fillStyle = '#fff4dc'; ctx.fill(); stroke(ctx, 1.5);
    D.text(ctx, label, x, y + 4, { size: 12, weight: 700, align: 'center' });
  };
  const door = (ctx, x, base, col, night) => {
    D.rr(ctx, x - 11, base - 34, 22, 32, 10); ctx.fillStyle = col || '#8a5a3a'; ctx.fill(); stroke(ctx, 2.2);
    D.circle(ctx, x + 6, base - 18, 2, '#ffd25a');
    if (night) { const g = ctx.createRadialGradient(x, base - 10, 2, x, base - 10, 40); g.addColorStop(0, 'rgba(255,210,120,0.35)'); g.addColorStop(1, 'rgba(255,210,120,0)'); ctx.fillStyle = g; ctx.fillRect(x - 40, base - 50, 80, 60); }
  };
  const win = (ctx, x, y, r, night) => { D.circle(ctx, x, y, r, night || fixed() ? '#ffe9a8' : '#c9dbe6', C.ink, 2); D.line(ctx, x - r, y, x + r, y, C.ink, 1.5); D.line(ctx, x, y - r, x, y + r, C.ink, 1.5); };
  CK.BuildingDraw.th_teacup = function (ctx, e, x, y) {
    const base = y + TS * 0.25, w = e.bw * TS;
    D.shadow(ctx, x + 10, base + 4, w / 2 + 12, 14, 0.3);
    // saucer, cup body, handle, and a tea-stain rooftop garden
    D.ellipse(ctx, x, base - 4, w / 2 + 14, 14, '#f6efe6', C.ink, 3);
    ctx.beginPath(); ctx.moveTo(x - w / 2 + 4, base - 120); ctx.quadraticCurveTo(x - w / 2 + 6, base - 8, x, base - 8); ctx.quadraticCurveTo(x + w / 2 - 6, base - 8, x + w / 2 - 4, base - 120); ctx.closePath();
    ctx.fillStyle = D.lgx(ctx, x - w / 2, x + w / 2, '#fdf6ee'); ctx.fill(); stroke(ctx, 3);
    for (let i = 0; i < 6; i++) { const a = i / 6; D.ball(ctx, x - w / 2 + 18 + a * (w - 36), base - 70 + Math.sin(i * 1.3) * 12, 6, ['#6f9fd8', '#ef8fb0'][i % 2], { lw: 1.5 }); }
    D.line(ctx, x - w / 2 + 10, base - 92, x + w / 2 - 10, base - 92, '#6f9fd8', 3);
    ctx.beginPath(); ctx.ellipse(x + w / 2 + 4, base - 72, 18, 26, 0, -Math.PI / 2, Math.PI / 2); stroke(ctx, 12, C.ink); ctx.beginPath(); ctx.ellipse(x + w / 2 + 4, base - 72, 18, 26, 0, -Math.PI / 2, Math.PI / 2); stroke(ctx, 7, '#fdf6ee');
    D.ellipse(ctx, x, base - 120, w / 2 - 4, 12, '#a8744a', C.ink, 3);
    for (let i = 0; i < 4; i++) D.ball(ctx, x - 30 + i * 20, base - 128 - (i % 2) * 6, 9, ['#7cc46a', '#5aa84a'][i % 2], { lw: 1.5 });
    D.ball(ctx, x - 10, base - 140, 4, '#ff9ec7', { lw: 1 });
    win(ctx, x - 30, base - 48, 10, this.night); door(ctx, x + 6, base - 8, '#ef8fb0', this.night);
    sign(ctx, x, base + 14, e.label);
  };
  CK.BuildingDraw.th_spool = function (ctx, e, x, y) {
    const base = y + TS * 0.25, w = e.bw * TS - 10;
    D.shadow(ctx, x + 10, base + 4, w / 2 + 10, 14, 0.3);
    D.ellipse(ctx, x, base - 8, w / 2 + 8, 12, '#c9935a', C.ink, 3);
    D.rr(ctx, x - w / 2 + 12, base - 130, w - 24, 122, 4); ctx.fillStyle = D.lgx(ctx, x - w / 2, x + w / 2, '#6fa8dc'); ctx.fill(); stroke(ctx, 3);
    ctx.save(); D.rr(ctx, x - w / 2 + 12, base - 130, w - 24, 122, 4); ctx.clip();
    for (let i = 0; i < 26; i++) D.line(ctx, x - w / 2, base - 126 + i * 5, x + w / 2, base - 124 + i * 5, 'rgba(255,255,255,0.22)', 1.5);
    ctx.restore();
    D.ellipse(ctx, x, base - 132, w / 2 + 8, 12, '#c9935a', C.ink, 3); D.ellipse(ctx, x, base - 134, 10, 4, '#7a5434');
    // a loose thread drifting off the top like a flag
    ctx.beginPath(); ctx.moveTo(x + w / 2 - 14, base - 110); ctx.quadraticCurveTo(x + w / 2 + 20, base - 150 + Math.sin(this.t * 2) * 6, x + w / 2 + 40, base - 160); stroke(ctx, 2, '#6fa8dc');
    win(ctx, x - 22, base - 80, 9, this.night); win(ctx, x + 22, base - 80, 9, this.night); door(ctx, x, base - 10, '#7a5434', this.night);
    sign(ctx, x, base + 12, e.label);
  };
  CK.BuildingDraw.th_tin = function (ctx, e, x, y) {
    const base = y + TS * 0.25, w = e.bw * TS - 8, h = e.bh * TS + 20;
    D.shadow(ctx, x + 10, base + 4, w / 2 + 8, 12, 0.3);
    D.rr(ctx, x - w / 2, base - h, w, h - 4, 18); ctx.fillStyle = D.lgx(ctx, x - w / 2, x + w / 2, '#d6dde6'); ctx.fill(); stroke(ctx, 3);
    D.rr(ctx, x - w / 2 + 10, base - h + 10, w - 20, h - 24, 12); ctx.fillStyle = '#ef6b6b'; ctx.fill(); stroke(ctx, 2);
    D.text(ctx, 'SARDINES', x, base - h + 34, { size: 14, weight: 700, align: 'center', color: '#fff4dc' });
    // the peeled-back lid is the roof, with its key still rolled up in it
    ctx.beginPath(); ctx.moveTo(x - w / 2 + 6, base - h + 2); ctx.quadraticCurveTo(x - w / 2 - 10, base - h - 40, x + 10, base - h - 46); ctx.lineTo(x + w / 2 - 6, base - h + 2); ctx.closePath(); ctx.fillStyle = D.lgx(ctx, x - w / 2, x + w / 2, '#c8ced8'); ctx.fill(); stroke(ctx, 3);
    D.ellipse(ctx, x - w / 2 + 2, base - h - 20, 10, 14, '#c8ced8', C.ink, 2.5);
    win(ctx, x - 40, base - 40, 9, this.night); win(ctx, x + 40, base - 40, 9, this.night); door(ctx, x, base - 6, '#5a6a8a', this.night);
    sign(ctx, x, base + 12, e.label);
  };
  CK.BuildingDraw.th_boot = function (ctx, e, x, y) {
    const base = y + TS * 0.25, w = e.bw * TS;
    D.shadow(ctx, x + 10, base + 4, w / 2 + 16, 14, 0.3);
    // an old rain boot, toe to the right, with a chimney poking out of the top
    ctx.beginPath(); ctx.moveTo(x - w / 2 + 4, base - 6); ctx.lineTo(x - w / 2 + 4, base - 170); ctx.lineTo(x + 10, base - 170); ctx.lineTo(x + 14, base - 70);
    ctx.quadraticCurveTo(x + w / 2 + 20, base - 70, x + w / 2 + 14, base - 6); ctx.closePath();
    ctx.fillStyle = D.lgx(ctx, x - w / 2, x + w / 2, '#ffd25a'); ctx.fill(); stroke(ctx, 3);
    D.rr(ctx, x - w / 2, base - 12, w + 18, 12, 4); ctx.fillStyle = '#5a4a3a'; ctx.fill(); stroke(ctx, 2.5);
    D.rr(ctx, x - w / 2 + 2, base - 176, w / 2 + 12, 12, 4); ctx.fillStyle = '#e8b53a'; ctx.fill(); stroke(ctx, 2.5);
    D.rr(ctx, x - 26, base - 200, 14, 26, 2); ctx.fillStyle = '#8a8f9e'; ctx.fill(); stroke(ctx, 2);
    for (let i = 0; i < 3; i++) { const p = (this.t * 0.4 + i / 3) % 1; D.circle(ctx, x - 19 + p * 10, base - 206 - p * 40, 5 + p * 7, `rgba(255,255,255,${0.7 - p * 0.6})`); }
    win(ctx, x - 20, base - 130, 10, this.night); win(ctx, x - 20, base - 90, 10, this.night); door(ctx, x + 30, base - 12, '#8a5a3a', this.night);
    sign(ctx, x, base + 12, e.label);
  };
  CK.BuildingDraw.th_matchbox = function (ctx, e, x, y) {
    const base = y + TS * 0.25, w = e.bw * TS - 8, h = 74;
    D.shadow(ctx, x + 10, base + 4, w / 2 + 10, 12, 0.3);
    D.box3(ctx, x - w / 2, base - h, w, h - 4, 18, { r: 2, lw: 3, fill: '#ef6b6b', flute: false });
    D.rr(ctx, x - w / 2 + 14, base - h + 12, w - 28, 26, 3); ctx.fillStyle = '#fff4dc'; ctx.fill(); stroke(ctx, 2);
    D.text(ctx, 'SWAP SHOP', x, base - h + 31, { size: 13, weight: 700, align: 'center', color: '#c2410c' });
    // the drawer, pulled out as a porch, with three matchsticks for a fence
    D.box3(ctx, x - w / 2 - 6, base - 24, w + 12, 20, 10, { r: 2, lw: 2.5, fill: '#e2b27a', flute: false });
    for (let i = 0; i < 2; i++) { D.line(ctx, x - w / 2 + 6 + i * 12, base - 26, x - w / 2 + 6 + i * 12, base - 48, '#e2c08a', 4); D.ball(ctx, x - w / 2 + 6 + i * 12, base - 50, 4, '#c2410c', { lw: 1 }); }
    door(ctx, x + w / 2 - 18, base - 22, '#8a5a3a', this.night);
    sign(ctx, x, base + 12, e.label);
  };
  CK.BuildingDraw.th_thimble = function (ctx, e, x, y) {
    const base = y + TS * 0.25, w = e.bw * TS - 30;
    D.shadow(ctx, x + 8, base + 4, w / 2 + 10, 12, 0.3);
    ctx.beginPath(); ctx.moveTo(x - w / 2, base - 6); ctx.lineTo(x - w / 2 + 10, base - 110); ctx.quadraticCurveTo(x, base - 132, x + w / 2 - 10, base - 110); ctx.lineTo(x + w / 2, base - 6); ctx.closePath();
    ctx.fillStyle = D.lgx(ctx, x - w / 2, x + w / 2, '#e8c060'); ctx.fill(); stroke(ctx, 3);
    ctx.save(); ctx.clip(); for (let r = 0; r < 10; r++) for (let c = 0; c < 8; c++) D.circle(ctx, x - w / 2 + 8 + c * 11 + (r % 2) * 5, base - 116 + r * 11, 2.2, 'rgba(120,80,20,0.35)'); ctx.restore();
    D.rr(ctx, x - w / 2 - 4, base - 14, w + 8, 10, 4); ctx.fillStyle = '#d6a840'; ctx.fill(); stroke(ctx, 2);
    win(ctx, x, base - 76, 10, this.night); door(ctx, x, base - 10, '#7a5434', this.night);
    sign(ctx, x, base + 12, e.label);
  };
  // the Teapot water tower: a giant teapot on stilts, overflowing from the lid until it's fixed
  CK.BuildingDraw.th_teapot = function (ctx, e, x, y) {
    const base = y + TS * 0.25, t = this.t;
    D.shadow(ctx, x + 14, base + 6, 110, 18, 0.32);
    for (const k of [-1, 1]) { D.line(ctx, x + k * 70, base - 4, x + k * 50, base - 70, C.ink, 9); D.line(ctx, x + k * 70, base - 4, x + k * 50, base - 70, '#a8744a', 6); }
    D.line(ctx, x - 60, base - 36, x + 60, base - 36, '#a8744a', 5);
    const cy = base - 140;
    // handle and spout
    ctx.beginPath(); ctx.ellipse(x - 96, cy, 30, 40, 0, Math.PI * 0.5, Math.PI * 1.5); stroke(ctx, 16, C.ink); ctx.beginPath(); ctx.ellipse(x - 96, cy, 30, 40, 0, Math.PI * 0.5, Math.PI * 1.5); stroke(ctx, 10, '#fdf6ee');
    ctx.beginPath(); ctx.moveTo(x + 80, cy + 10); ctx.quadraticCurveTo(x + 130, cy, x + 140, cy - 54); ctx.lineTo(x + 124, cy - 58); ctx.quadraticCurveTo(x + 116, cy - 18, x + 76, cy - 14); ctx.closePath(); D.fillVol(ctx, x + 110, cy - 20, 30, '#fdf6ee', 3);
    ctx.beginPath(); ctx.ellipse(x, cy, 100, 80, 0, 0, TAU); ctx.fillStyle = D.lgx(ctx, x - 100, x + 100, '#fdf6ee'); ctx.fill(); stroke(ctx, 3.5);
    // blue flower pattern band
    for (let i = 0; i < 7; i++) { const a = -0.9 + i * 0.3; D.ball(ctx, x + Math.sin(a) * 86, cy + 6 + Math.cos(a * 2) * 4, 7, '#6f9fd8', { lw: 1.5 }); D.circle(ctx, x + Math.sin(a) * 86, cy + 6 + Math.cos(a * 2) * 4, 2.5, '#fffaf0'); }
    D.line(ctx, x - 92, cy + 26, x + 92, cy + 26, '#6f9fd8', 3); D.line(ctx, x - 92, cy - 16, x + 92, cy - 16, '#6f9fd8', 3);
    D.ellipse(ctx, x, cy - 78, 44, 12, '#fdf6ee', C.ink, 3); D.ball(ctx, x, cy - 94, 10, '#6f9fd8', { lw: 2.5 });
    // a round porthole door at the bottom with the rusted wheel on it
    D.circle(ctx, x, base - 92, 26, '#c9935a', C.ink, 3);
    const spin = f('th_open') ? 0.6 : 0;
    ctx.save(); ctx.translate(x, base - 92); ctx.rotate(spin);
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU); stroke(ctx, 6, C.ink); ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU); stroke(ctx, 3.5, f('th_open') ? '#ef6b6b' : '#a8744a');
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; D.line(ctx, 0, 0, Math.cos(a) * 16, Math.sin(a) * 16, f('th_open') ? '#ef6b6b' : '#a8744a', 3); }
    ctx.restore();
    if (!f('th_open')) for (let i = 0; i < 5; i++) D.circle(ctx, x - 14 + U.hash(i, 3) * 28, base - 92 - 14 + U.hash(i, 4) * 28, 2.5, '#b8652e');
    D.rr(ctx, x - 18, base - 64, 36, 10, 3); ctx.fillStyle = '#8a8f9e'; ctx.fill(); stroke(ctx, 2);
    // overflowing water pours from the lid and the spout until it's fixed; a gentle trickle after
    if (!fixed()) {
      for (let i = 0; i < 6; i++) { const p = (t * 1.2 + i / 6) % 1; D.circle(ctx, x + 130 + p * 10, cy - 50 + p * 140, 5 - p * 2, 'rgba(120,200,240,0.85)'); }
      for (const k of [-1, 1]) for (let i = 0; i < 4; i++) { const p = (t + i / 4 + (k > 0 ? 0.5 : 0)) % 1; D.circle(ctx, x + k * (40 + p * 50), cy - 78 + p * 30 + p * p * 80, 4, 'rgba(120,200,240,0.8)'); }
      for (let i = 0; i < 3; i++) { const p = (t * 0.5 + i / 3) % 1; D.circle(ctx, x - 20 + i * 20, cy - 108 - p * 30, 6 + p * 6, `rgba(255,255,255,${0.7 - p * 0.6})`); }
    }
    sign(ctx, x, base + 14, e.label);
  };

  // Tinykin scale: the houses are drawn bigger than their footprints, so the residents look tiny
  for (const k of ['th_teacup', 'th_spool', 'th_boot', 'th_thimble', 'th_matchbox', 'th_tin']) {
    const draw = CK.BuildingDraw[k], sc = k === 'th_tin' || k === 'th_matchbox' ? 1.18 : 1.32;
    CK.BuildingDraw[k] = function (ctx, e, x, y) {
      const base = y + TS * 0.25;
      ctx.save(); ctx.translate(x, base); ctx.scale(sc, sc); ctx.translate(-x, -base);
      draw.call(this, ctx, e, x, y);
      ctx.restore();
    };
  }

  // street furniture
  CK.DecoDraw.th_fountain = function (ctx, e, x, y) {
    const t = this.t, on = fixed();
    D.shadow(ctx, x + 24, y + 4, 44, 10, 0.3);
    // a big upturned bottle cap with a thimble on top
    D.ellipse(ctx, x + 24, y - 6, 44, 16, '#ef6b6b', C.ink, 3);
    for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU; D.line(ctx, x + 24 + Math.cos(a) * 44, y - 6 + Math.sin(a) * 16, x + 24 + Math.cos(a) * 44, y + 4 + Math.sin(a) * 16, C.ink, 1.5); }
    D.ellipse(ctx, x + 24, y - 8, 36, 11, on ? '#7fd6f0' : '#9aa0a6', C.ink, 2);
    D.rr(ctx, x + 14, y - 46, 20, 38, 6); ctx.fillStyle = '#e8c060'; ctx.fill(); stroke(ctx, 2.5);
    if (on) for (let i = 0; i < 8; i++) {
      const p = (t * 0.9 + i / 8) % 1, a = (i / 8) * TAU;
      D.circle(ctx, x + 24 + Math.cos(a) * p * 30, y - 48 - Math.sin(p * Math.PI) * 30 + p * 36, 3.5, 'rgba(160,225,250,0.9)');
    }
    else D.text(ctx, '(dry)', x + 24, y - 54, { size: 11, weight: 700, align: 'center', color: '#6a6a6a' });
  };
  CK.DecoDraw.th_pencil = function (ctx, e, x, y) {
    D.shadow(ctx, x + 40, y + 6, 100, 8, 0.25);
    ctx.save(); ctx.translate(x - 60, y - 10); ctx.rotate(-0.04);
    D.rr(ctx, 0, -12, 160, 24, 3); ctx.fillStyle = D.lgx(ctx, 0, 160, '#ffd25a'); ctx.fill(); stroke(ctx, 2.5);
    D.poly(ctx, [160, -12, 196, 0, 160, 12], '#f0d6a0', C.ink, 2.5); D.poly(ctx, [186, -4, 196, 0, 186, 4], '#3a3a3a');
    D.rr(ctx, -26, -12, 26, 24, 4); ctx.fillStyle = '#ef8fb0'; ctx.fill(); stroke(ctx, 2.5);
    D.rr(ctx, -4, -13, 10, 26, 1); ctx.fillStyle = '#c8ced8'; ctx.fill(); stroke(ctx, 2);
    ctx.restore();
  };
  CK.DecoDraw.th_buttons = function (ctx, e, x, y) {
    for (let i = 0; i < 3; i++) {
      const bx = x + i * 36, by = y - 4 + Math.sin(this.t * 1.6 + i) * 2;
      D.ellipse(ctx, bx, by, 16, 7, ['#ef6b6b', '#6fa8dc', '#ffd25a'][i], C.ink, 2);
      for (const k of [-1, 1]) D.circle(ctx, bx + k * 4, by, 1.8, C.ink);
    }
  };
  CK.DecoDraw.th_stall = function (ctx, e, x, y) {
    const col = e.col || '#ef8fb0';
    D.shadow(ctx, x + 24, y + 4, 40, 8, 0.28);
    D.box3(ctx, x - 8, y - 30, 64, 30, 12, { r: 2, lw: 2.5, fill: '#e2b27a', flute: false });
    for (const k of [-6, 50]) D.line(ctx, x + k, y - 30, x + k, y - 70, C.ink, 3);
    ctx.save(); ctx.beginPath(); ctx.rect(x - 14, y - 84, 76, 18); ctx.clip();
    for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#fffaf0' : col; ctx.fillRect(x - 14 + i * 13, y - 84, 13, 18); }
    ctx.restore(); D.rr(ctx, x - 14, y - 84, 76, 18, 3); stroke(ctx, 2.5);
    for (let i = 0; i < 4; i++) D.ball(ctx, x + 2 + i * 14, y - 36, 5, e.goods ? e.goods[i % e.goods.length] : '#ffd25a', { lw: 1.4 });
    D.text(ctx, e.label || '', x + 24, y - 90, { size: 11, weight: 700, align: 'center', color: '#3d2412' });
  };
  CK.DecoDraw.th_glow = function () {};
  // strings of paper lanterns across the street (they light up for the festival)
  CK.DecoDraw.th_lights = function (ctx, e, x, y) {
    const span = (e.span || 4) * TS, top = y - 110, on = fixed();
    D.line(ctx, x, y, x, top, '#7a5434', 4); D.line(ctx, x + span, y, x + span, top, '#7a5434', 4);
    ctx.beginPath(); ctx.moveTo(x, top); ctx.quadraticCurveTo(x + span / 2, top + 40, x + span, top); stroke(ctx, 2);
    const n = Math.round(span / 30);
    for (let i = 1; i < n; i++) {
      const a = i / n, lx = x + span * a, ly = top + 40 * 2 * a * (1 - a) + 6;
      const col = ['#ef8fb0', '#ffd25a', '#7fd6f0', '#9fe07a'][i % 4];
      if (on && this.night) { const g = ctx.createRadialGradient(lx, ly, 2, lx, ly, 26); g.addColorStop(0, 'rgba(255,220,140,0.6)'); g.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = g; ctx.fillRect(lx - 26, ly - 26, 52, 52); }
      D.egg(ctx, lx, ly, 7, 9, on ? col : '#b8b8b8', { lw: 1.6 });
    }
  };

  // ================================================================ THE CHAPTER
  CK.Chapters.thimble = {
    id: 'thimble', name: 'Thimble Row', w: 34, h: 22, season: 'thimble', music: 'spring',
    start: [2, 11], noFlood: true,
    build(m) {
      m.rect(0, 0, 34, 22, '~');
      m.ellipse(17, 11, 15.5, 9.4, '.');
      m.rect(4, 4, 26, 14, '.');
      m.scatter(',', 0.12, 141);
      m.path([[0, 11], [33, 11]], '=');
      m.path([[17, 7], [17, 16]], '=');
      m.ellipse(17, 12, 3.6, 2.3, '=');
      m.path([[7, 9], [7, 11]], '='); m.path([[12, 9], [12, 11]], '=');
      m.path([[8, 11], [8, 15]], '='); m.path([[13, 11], [13, 15]], '='); m.path([[25, 9], [25, 11]], '='); m.path([[27, 11], [27, 15]], '=');
      m.rect(0, 10, 3, 3, 'd'); m.rect(0, 11, 3, 1, '=');
      m.scatter('T', 0.05, 142);
    },
    post(m) {
      for (const o of this.objects) if (o.type !== 'trigger') { const t = m.get(o.x, o.y); if (t === 'T' || t === ',') m.set(o.x, o.y, '.'); }
      for (const o of this.objects) if (o.type === 'building') { const x0 = o.x - Math.floor(o.bw / 2); for (let yy = o.y - o.bh - 1; yy <= o.y + 2; yy++) for (let xx = x0 - 1; xx <= x0 + o.bw; xx++) if (m.get(xx, yy) === 'T') m.set(xx, yy, '.'); }
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.get(x, y) === 'T' && (Math.abs(y - 11) < 2 || Math.abs(x - 17) < 2)) m.set(x, y, '.');
    },
    paintGround(g, m) {
      // before the fix, the Teapot's overflow runs down the street in long puddles
      if (!fixed()) for (const [fx, fy, rx] of [[17, 8, 40], [15, 10, 60], [20, 11, 70], [11, 11, 60], [24, 11, 50], [6, 11, 40], [17, 14, 60], [27, 12, 40], [9, 13, 36]]) {
        g.fillStyle = 'rgba(90,170,220,0.55)'; g.beginPath(); g.ellipse(fx * TS + 24, fy * TS + 30, rx, 13, 0, 0, TAU); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(fx * TS + 14, fy * TS + 26, rx * 0.3, 3, 0, 0, TAU); g.fill();
      }
      // a scattering of giant crumbs, pins and sequins: you are very small here
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
        const t = m.get(x, y), h = U.hash(x, y, 77);
        if ((t === '.' || t === ',') && h < 0.05) { g.fillStyle = ['#ff9ec7', '#ffd25a', '#7fd6f0'][Math.floor(h * 60) % 3]; g.beginPath(); g.arc(x * TS + 10 + h * 400 % 28, y * TS + 30, 5, 0, TAU); g.fill(); g.strokeStyle = 'rgba(60,40,20,0.5)'; g.lineWidth = 1.2; g.stroke(); }
        if ((t === '.' || t === ',') && h > 0.97) { g.strokeStyle = '#c8ced8'; g.lineWidth = 3; g.beginPath(); g.moveTo(x * TS + 6, y * TS + 30); g.lineTo(x * TS + 40, y * TS + 20); g.stroke(); g.fillStyle = '#ef6b6b'; g.beginPath(); g.arc(x * TS + 6, y * TS + 30, 4, 0, TAU); g.fill(); }
      }
    },
    // Okami-style: the street is drained of colour until the repair, then the colour blooms back
    // out of the fountain in a widening ring, with petals at the edge
    worldFx(ctx, ox, oy) {
      const cx = FOUNT[0] * TS + 24 - ox, cy = FOUNT[1] * TS + 10 - oy;
      let r = 0;
      if (fixed()) {
        if (f('th_bloomed')) return;
        // the bloom waits for its moment in the script (or starts by itself if it was missed)
        if (this.bloomT == null) { if (CK.scriptRunning) r = 0; else this.bloomT = this.t; }
        if (this.bloomT != null) r = Math.max(1, Math.pow(Math.min(1, (this.t - this.bloomT) / 4.5), 1.6) * 1500);
        if (r >= 1500) { this.bloomT = null; CK.setFlag('th_bloomed'); return; }
      }
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, H);
      if (r > 0) ctx.arc(cx, cy, r, 0, TAU, true);
      ctx.clip('evenodd');
      ctx.globalCompositeOperation = 'saturation';
      ctx.fillStyle = 'rgba(128,128,128,0.85)'; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(70,80,100,0.12)'; ctx.fillRect(0, 0, W, H);
      ctx.restore();
      // the party keeps its colour (they're the ones who bring it back), so they read clearly
      if (!r) {
        const G = CK.G, cos = (id) => (G.party.find((m) => m.id === id) || {}).costume, p = this.player;
        const f1 = this.trail[16], f2 = this.trail[32], list = [];
        if (!this.ch.noFollowers) {
          list.push([f2.y, () => D.char(ctx, 'pip', f2.x - ox, f2.y - oy, { dir: f2.dir, costume: cos('pip') })]);
          list.push([f1.y, () => D.char(ctx, 'corry', f1.x - ox, f1.y - oy, { dir: f1.dir, walk: p.moving ? p.walk : 0, costume: cos('corry') })]);
        }
        if (this.p2) { const q = this.p2; list.push([q.y, () => D.char(ctx, 'jules', q.x - ox, q.y - oy, { dir: q.dir, walk: q.moving ? q.walk : 0, costume: cos('jules') })]); }
        list.push([p.y, () => D.char(ctx, 'sam', p.x - ox, p.y - oy, { dir: p.dir, walk: p.moving ? p.walk : 0, costume: cos('sam') })]);
        list.sort((a, b) => a[0] - b[0]).forEach(([, fn]) => fn());
      }
      if (r > 0) {
        for (let i = 0; i < 36; i++) {
          const a = (i / 36) * TAU + this.t * 0.3, rr = r + Math.sin(i * 7 + this.t * 4) * 10;
          D.star(ctx, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 6 + (i % 3) * 2, ['#ff9ec7', '#ffd25a', '#9fe07a', '#7fd6f0'][i % 4], 5, this.t + i);
        }
      }
    },
    objects: [
      { type: 'building', id: 'th_tower', x: 17, y: 6, bw: 5, bh: 4, style: 'th_teapot', label: 'The Teapot (water tower)', door: 'Wheel', script: () => towerScript() },
      { type: 'building', id: 'th_cup', x: 7, y: 8, bw: 3, bh: 3, style: 'th_teacup', label: 'Teacup House', door: 'Knock', script: () => doorScript('cup') },
      { type: 'building', id: 'th_spool', x: 12, y: 8, bw: 3, bh: 3, style: 'th_spool', label: 'Bodkin\'s Spool Shop', door: 'Knock', script: () => doorScript('spool') },
      { type: 'building', id: 'th_tin', x: 25, y: 8, bw: 5, bh: 2, style: 'th_tin', label: 'The Sardine Tin', door: 'Knock', script: () => doorScript('tin') },
      { type: 'building', id: 'th_boot', x: 27, y: 15, bw: 3, bh: 3, style: 'th_boot', label: 'The Boot', door: 'Knock', script: () => doorScript('boot') },
      { type: 'building', id: 'th_match', x: 8, y: 15, bw: 3, bh: 2, style: 'th_matchbox', label: 'Matchbox Swap Shop', door: 'Knock', script: () => doorScript('match') },
      { type: 'building', id: 'th_thim', x: 13, y: 15, bw: 3, bh: 2, style: 'th_thimble', label: 'Thimble Cottage', door: 'Knock', script: () => doorScript('thim') },
      { type: 'deco', kind: 'th_fountain', x: FOUNT[0], y: FOUNT[1], label: 'Look', script: () => fixed() ? [{ narrate: 'The bottle-cap fountain, sparkling. Someone has floated a paper boat in it.' }] : [{ narrate: 'The bottle-cap fountain is bone dry. All the Teapot\'s water is going down the street instead.' }] },
      { type: 'deco', kind: 'th_pencil', x: 22, y: 17 },
      { type: 'deco', kind: 'th_buttons', x: 1, y: 15 },
      { type: 'deco', kind: 'th_lights', x: 9, y: 10, span: 3, light: [130, 90] },
      { type: 'deco', kind: 'th_lights', x: 20, y: 10, span: 3, light: [130, 90] },
      { type: 'deco', kind: 'th_stall', x: 15, y: 13, label: 'Sorrel\'s Seeds', goods: ['#ff9ec7', '#9fe07a', '#ffd25a'], cond: fixed },
      { type: 'deco', kind: 'th_stall', x: 20, y: 13, col: '#7fd6f0', label: 'Dabney\'s Crumbs', goods: ['#e2b27a', '#ffd25a'], cond: fixed },
      { type: 'deco', kind: 'lantern', x: 4, y: 12 },
      ...[[10, 9], [11, 9], [21, 9], [22, 9], [15, 12], [19, 12], [17, 15]].map(([x, y]) => ({ type: 'deco', kind: 'th_glow', x, y, light: [110, 20], cond: fixed })),
      { type: 'deco', kind: 'th_lights', x: 14, y: 16, span: 6, light: [130, 90], cond: fixed },
      { type: 'npc', id: 'th_thimbleton', name: 'Mrs. Thimbleton', x: 5, y: 10, look: 'critter', o: RES.thimbleton, talk: () => thimbletonTalk() },
      { type: 'npc', id: 'th_bodkin', name: 'Bodkin', x: 14, y: 10, look: 'critter', o: RES.bodkin, talk: () => bodkinTalk() },
      { type: 'npc', id: 'th_pim', name: 'Pim', x: 25, y: 13, look: 'critter', o: RES.pim, talk: () => pimTalk() },
      { type: 'npc', id: 'th_sorrel', name: 'Sorrel', x: 16, y: 15, look: 'critter', o: RES.sorrel, talk: () => [['sorrel', fixed() ? 'Seed packets! Plant them anywhere it floods. Roots drink. It\'s their whole job.' : 'My seed stall\'s packed away. Everything I own is damp. Even my opinions.', fixed() ? 'happy' : 'sad']] },
      { type: 'npc', id: 'th_dabney', name: 'Dabney', x: 21, y: 14, look: 'critter', o: RES.dabney, talk: () => [['dabney', fixed() ? 'Crumb cake! Each crumb is the size of your head. Take three.' : 'I bake crumb cake for the festival every year. This year the crumbs are soup.', fixed() ? 'happy' : 'sad']] },
      { type: 'npc', id: 'th_whistle', name: 'Old Whistle', x: 19, y: 14, look: 'kettlenpc', talk: () => [['whistle', U.pick(['I\'m the pressure whistle. When I sing, check the valves. That\'s all anyone ever needed to know.', 'Wheeeee. (A small, happy whistle. Everything is at a sensible pressure.)'])]], cond: () => f('th_kettle') },
      { type: 'npc', id: 'pell_th', x: 3, y: 12, look: 'pelican', snap: true, talk: () => [['pell', fixed() ? 'Festival post! Everyone\'s writing to their cousins. My pouch is full of glitter.' : 'Mrs. Thimbleton\'s letter was very polite and very damp.', 'happy']] },
      { type: 'sign', x: 3, y: 10, text: 'THIMBLE ROW. Mind the puddles. (The puddles are the size of ponds. You are the size of a crumb.)' },
      { type: 'bench', x: 5, y: 13 },
      { type: 'trigger', id: 'th_fest_go', x: 15, y: 10, w: 5, h: 5, script: 'th_festival', cond: () => fixed() && !f('th_done') },
    ],
    nightTint() { return 'rgba(24,16,60,0.62)'; },
    objective() {
      if (!f('th_meet')) return 'Find Mrs. Thimbleton (by the Teacup House)';
      if (!f('th_beetle')) {
        const need = ['horn', 'feelers'].filter((k) => !got(k));
        if (!need.length) return 'Bring the horn and feelers to Mrs. Thimbleton';
        return 'Spanner Beetle pieces: ' + need.map((k) => ({ horn: 'a horn from Bodkin (spool shop)', feelers: 'feelers from Pim (the Boot)' }[k])).join(', ');
      }
      if (!f('th_fixed') && f('th_kettle')) return `Fix the valves inside the Teapot (room ${Math.min(3, (CK.G.flags.th_room || 0) + 1)} of 3)`;
      if (!f('th_fixed')) return wearing() ? 'Turn the Teapot\'s rusted wheel (north)' : 'Wear the Spanner Beetle (Esc > Party & Costumes), then turn the Teapot\'s wheel';
      if (!f('th_done')) return 'The festival is starting at the fountain!';
      return 'Festival night: knock on doors for treats, or rest by the fountain';
    },
  };

  // ================================================================ RESIDENTS AND PIECES
  const piece = (k, lines) => [
    ...lines,
    { fn: () => { CK.setFlag('th_piece_' + k); CK.Audio.sfx('chest'); } },
    { narrate: `Got ${PIECES[k].name}! (${Object.keys(PIECES).filter(got).length} of 3 Spanner Beetle pieces)` },
  ];
  S.thimble_intro = [
    { card: { title: 'Chapter 14', sub: 'Thimble Row' } },
    { narrate: 'Pell brought a letter on paper the size of a stamp: "THIMBLE ROW FESTIVAL, SATURDAY. (Probably cancelled. The street is a puddle and the Teapot is making a noise.) Kind regards, Mrs. Thimbleton."' },
    ['pip', 'Fact: everything here is enormous. Or we are tiny.', 'shock'],
    ['corry', 'Both, Pip. Both is allowed.', 'happy'],
    ['sam', 'One street. I can do one street.', 'happy'],
    { journal: 'Thimble Row: a tiny neighborhood living in giant things (a teacup, a spool, a boot) on an island. The festival is Saturday, the street is a puddle, and the Teapot water tower is making a noise.' },
  ];
  S.th_meet = [
    ['thimbleton', 'Oh! Visitors! Mind your feet, that puddle has fish in it now.', 'happy'],
    ['thimbleton', 'The Teapot up there is our water tower. It fills every house on the Row. Mr. Tuppence used to look after it. He retired to the seaside last spring.', 'sad'],
    ['sam', 'And since then?', 'sad'],
    ['thimbleton', 'Since then it overfills, and the extra comes down the street. Everything\'s gone grey and soggy. The festival lanterns won\'t even take paint.', 'sad'],
    ['sam', 'Who looks after it now?', 'sad'],
    ['thimbleton', '...Everybody thought somebody else knew how.', 'sad'],
    ['sam', 'It\'s overfilling because nothing\'s open, so the water finds its own way out. Down your street. We need to get inside and work the valves.', 'happy'],
    ['thimbleton', 'Bodkin says the wheel\'s rusted solid. You\'d need terrible leverage. A beetle with a wrench for a horn, he said. He was joking. I wasn\'t listening to the joke part.', 'happy'],
    ['thimbleton', 'I sew. Bring me a horn and some feelers, and I\'ll make you a Spanner Beetle. I have the shell already: the lid off a sardine tin, polished.', 'happy'],
    { flag: 'th_meet' },
    { journal: 'Met Mrs. Thimbleton. The Teapot water tower overfills because its valves rusted shut after the old Waterkeeper retired, and nobody else knew how they worked. She will sew a Spanner Beetle costume if I bring a horn (Bodkin) and feelers (Pim).' },
  ];
  function thimbletonTalk() {
    if (!f('th_meet')) return 'th_meet';
    if (!f('th_beetle')) {
      if (got('horn') && got('feelers')) return 'th_sew';
      return [['thimbleton', `Still need ${[!got('horn') && 'a horn (Bodkin, the spool shop)', !got('feelers') && 'some feelers (Pim, in the Boot)'].filter(Boolean).join(' and ')}. I have the shell ready. It\'s very shiny. I keep looking at it.`, 'happy']];
    }
    if (!fixed()) return [['thimbleton', 'Go on, little beetle. Turn that wheel.', 'happy']];
    return [U.pick([['thimbleton', 'Look at the lanterns! They took the paint! Everything took the paint!', 'happy'], ['thimbleton', 'I\'m writing to Mr. Tuppence. "Dear Mr. Tuppence, we learned the valves. All of us. You may stay at the seaside."', 'happy']])];
  }
  S.th_sew = [
    ['thimbleton', 'A horn and feelers! And my shell. Right. Stand still. Arms out. No, the other out.', 'happy'],
    { fn: () => CK.setFlag('th_piece_shell') },
    { narrate: 'Mrs. Thimbleton sews with a needle as long as your arm. Snip, stitch, a dab of glue, a button for each spot.' },
    { give: 'beetle' },
    { fn: () => { const lead = CK.G.party[0]; if (lead) lead.costume = 'beetle'; if (CK.OW) CK.OW.refresh(); } },
    { narrate: 'Sam is wearing the Spanner Beetle! In the field: turn rusted valves and wheels. In battle: Tighten Up, a big wrench twist that also seals every leak.' },
    ['pip', 'You have a wrench for a nose.', 'happy'],
    ['sam', 'It\'s a horn. A spanner horn. It\'s very dignified.', 'happy'],
    { flag: 'th_beetle' },
    { journal: 'Mrs. Thimbleton sewed me a Spanner Beetle: a sardine-tin shell, Bodkin\'s paperclip wrench horn and Pim\'s pipe-cleaner feelers. It can turn rusted valves, and in battle it seals leaks.' },
    { save: true },
  ];
  function bodkinTalk() {
    if (!f('th_meet')) return [['bodkin', 'If you\'re here about the Teapot, talk to Mrs. Thimbleton first. She has a list. She always has a list.', 'happy']];
    if (!got('horn')) return piece('horn', [
      ['bodkin', 'A horn for a Spanner Beetle? Ha! I said that as a joke. ...She\'s really doing it?', 'shock'],
      ['bodkin', 'Here. A paperclip, bent into a proper open-ended spanner. Fits every rusted nut on the Row. I used to help Tuppence oil those valves. Then I stopped. Then I forgot.', 'sad'],
      ['bodkin', 'If you get in there: the pipes are labelled. Badly. In Tuppence\'s handwriting.', 'happy'],
    ]);
    if (!fixed()) return [['bodkin', 'Leverage, that\'s the secret. A long arm and a stubborn heart.', 'happy']];
    return [['bodkin', 'I\'m oiling the valves every Sunday now. I wrote it on the wall. In big letters. So the next person knows.', 'happy']];
  }
  function pimTalk() {
    if (!f('th_meet')) return [['pim', 'My house is a boot. It\'s a good boot. It\'s full of water. That\'s not what boots are for.', 'sad']];
    if (!got('feelers')) return piece('feelers', [
      ['pim', 'Feelers? For a beetle? I have pipe cleaners! I have ALL the pipe cleaners! I was saving them for the festival hats.', 'happy'],
      ['pim', 'Pink ones. Pink is the bravest colour. Take two.', 'happy'],
    ]);
    if (!fixed()) return [['pim', 'Are you a beetle now? Can I be a beetle next year?', 'happy']];
    return [['pim', 'Our boot\'s dry! Mum says I can keep my bed in the toe again!', 'happy']];
  }

  // knocking on the giant houses; on festival night, every door gives a treat (Costume Quest style)
  const KNOCK = {
    cup: [['thimbleton', 'Come in, come in! Mind the tea stain, it\'s a rug now.', 'happy']],
    spool: [['bodkin', 'The shop\'s shut. Everything I sell is thread and everything\'s damp. Damp thread is just string with feelings.', 'sad']],
    tin: [['dabney', 'This is my bakery. It smells of sardines a tiny bit. Customers say it adds depth.', 'happy']],
    boot: [['pim', 'Hello! This is the Boot! The toe is my room! Currently a paddling pool!', 'happy']],
    match: [{ narrate: 'Nib\'s cousin runs the swap shop. A sign on the door: "BACK WHEN DRY."' }],
    thim: [['sorrel', 'My cottage is a thimble. It\'s very cosy and very hard to put furniture in.', 'happy']],
  };
  const TREATS = {
    cup: ['thimbleton', 'Treat or treat! Here, a thimbleful of jam tarts.'], spool: ['bodkin', 'A spool of the good thread. And a juice box. Mostly the juice box.'],
    tin: ['dabney', 'Crumb cake! Careful, each crumb is a meal.'], boot: ['pim', 'I made you a pipe-cleaner crown! It\'s pink! You\'re welcome!'],
    match: ['dabney', 'The swap shop says: one free swap, festival night only. You get scraps. I get a hug. Deal.'], thim: ['sorrel', 'Seed packets! Plant them where it floods. And a juice box.'],
  };
  function doorScript(id) {
    if (fixed() && CK.OW && CK.OW.night && !f('th_treat_' + id)) {
      const [who, line] = TREATS[id];
      return [{ narrate: 'Knock knock! Festival night: treat or treat!' }, [who, line, 'happy'], { flag: 'th_treat_' + id }, { scraps: 6 }, { snacks: 1 }];
    }
    if (f('th_treat_' + id)) return [{ narrate: 'Someone inside waves at you through a round window. There\'s music.' }];
    return KNOCK[id];
  }

  // ================================================================ THE TEAPOT
  function towerScript() {
    if (f('th_fixed')) return [{ narrate: 'The Teapot hums quietly. Somebody has chalked "OIL ME ON SUNDAYS" on the wheel.' }];
    if (!f('th_meet')) return [{ narrate: 'A giant teapot on stilts, overflowing from the lid. There\'s a round door with a big rusted wheel. It won\'t budge.' }];
    if (!wearing()) return [{ narrate: 'The wheel is rusted solid. You hang off it with your whole weight. Nothing.' }, ['corry', 'We need more leverage. A great deal more leverage.', 'sad'], ...(f('th_beetle') ? [{ narrate: 'Put on the Spanner Beetle (Esc > Party & Costumes).' }] : [])];
    if (!f('th_open')) return 'th_open';
    if (!f('th_kettle')) return 'th_kettle_fight';
    return 'th_valves';
  }
  S.th_open = [
    { narrate: 'Sam fits the spanner horn over the wheel\'s rusted nut, braces against the door, and leans. And leans. CRRREAK.' },
    { fn: () => { CK.setFlag('th_open'); CK.Audio.sfx('break'); if (CK.OW) CK.OW.shake = 6; } },
    { narrate: 'The wheel turns. The round door swings open. From inside comes a long, furious WHEEEEEEEEEEEE.' },
    ['pip', 'Something in there is boiling over.', 'shock'],
    { fn: () => S.th_kettle_fight },
  ];
  S.th_kettle_fight = [
    { narrate: 'Inside, a dented copper kettle is wedged on top of the overflow pipe, rattling, steaming, whistling so hard its lid bounces.' },
    ['sam', 'It\'s not angry. It\'s the pressure whistle. It\'s been screaming for help all year and nobody came.', 'sad'],
    ['sam', 'Calm it down, keep the leaks off everyone. Then the valves.', 'happy'],
    { battle: 'th_kettle' },
    { narrate: 'The kettle hisses, sputters, and settles. Its lid stops bouncing. Very quietly, it says: "...thank you. It\'s been a long year."' },
    ['whistle', 'I\'m Old Whistle. I sing when the pressure\'s too high. Tuppence always came running. Then nobody did.', 'sad'],
    ['sam', 'We\'re here now. Show us the valves?', 'happy'],
    { flag: 'th_kettle' },
    rebuild,
    { fn: () => S.th_valves },
  ];
  S.th_valves = [
    { await: () => show(new ValveScene()) },
    { if: () => !f('th_fixed'), then: [['whistle', 'No rush. I\'ll hum to keep the pressure honest.', 'happy']] },
    { fn: () => S.th_bloom },
  ];
  S.th_bloom = [
    { narrate: 'Sam climbs back out of the Teapot. The overflow stops. The puddles drain. And at the fountain, the water comes up.' },
    { fn: () => { if (CK.OW) { CK.OW.refresh(); CK.OW.bloomT = CK.OW.t; } CK.Audio.sfx('magic'); } },
    { wait: 4.6 },
    { narrate: 'The colour comes back out of the fountain like a spill of paint: pink, gold, sky blue. The lanterns take their colour. The teacup is white again. The boot is yellow.' },
    ['thimbleton', 'Oh. Oh, look at it. I forgot it was this colour.', 'happy'],
    ['pim', 'THE BOOT IS YELLOW AGAIN!', 'happy'],
    { journal: 'Fixed the Teapot water tower. The overflow stopped, the fountain came back on, and the colour came back into Thimble Row, starting at the fountain.' },
    { save: true },
  ];
  S.th_festival = [
    { night: true },
    { narrate: 'Saturday night. The Thimble Row Festival happens after all. Paper lanterns down the whole street. Crumb cake. Somebody has a fiddle the size of a matchstick.' },
    ['thimbleton', 'Spanner Beetle! Front of the parade! Everybody, the beetle that fixed our Teapot!', 'happy'],
    { narrate: 'Sam leads the costume parade around the fountain. Pim follows in a pipe-cleaner crown. Old Whistle whistles in tune, for once.' },
    ['bodkin', 'I\'ve chalked every valve with what it does. Big letters. Next time it won\'t take a beetle from another world.', 'happy'],
    ['sam', 'Nobody fixed it because everybody thought somebody else knew how. That\'s most broken things, I think.', 'happy'],
    ['sam', 'You don\'t have to fix the whole Kingdom. You start with your own street.', 'happy'],
    ['pip', 'Rule Twelve?', 'happy'],
    ['sam', 'Rule Twelve: start with your own street.', 'happy'],
    { flag: 'th_done' },
    { narrate: 'Festival night: knock on the doors of Thimble Row for treats!' },
    { journal: 'Rule Twelve: start with your own street. The Thimble Row Festival happened after all. Bodkin chalked every valve so the next person knows how. Knock on the doors on festival night for treats.' },
    { save: true },
  ];

  // ================================================================ THE VALVE ROOMS
  // Live water: every valve change re-runs the flow at once, so the rule is visible, not explained.
  // Rule 1: open water goes wherever the pipes lead, and an open end sprays.
  // Rule 2: every outlet only takes so much; too little room and the fountain overflows onto the street.
  // Rule 3: put the two together (one tempting pipe runs past a crack).
  const ROOMS = [
    { name: 'Room 1: The Spout', flow: 1,
      teach: 'Turn a valve (click it, or pick with Left/Right and press Z). Water goes wherever the open pipes lead.',
      nodes: { S: [150, 250], A: [330, 250], F: [560, 340], X: [560, 160] },
      pipes: [['S', 'A', null], ['A', 'F', 'V1', [[330, 250], [400, 250], [400, 340], [560, 340]], [400, 295]], ['A', 'X', 'V2', [[330, 250], [400, 250], [400, 160], [560, 160]], [400, 205]]],
      outlets: { F: { kind: 'fountain', cap: 1, label: 'Fountain' }, X: { kind: 'crack', label: 'Cracked pipe over the Teacup House' } },
      valves: ['V1', 'V2'], hint: 'Open only the valve on the pipe down to the fountain.' },
    { name: 'Room 2: The Kettle Room', flow: 3,
      teach: 'The Teapot pushes 3 cups of water a second. The fountain only takes 1. Where does the rest go?',
      nodes: { S: [130, 260], A: [260, 260], B: [400, 260], F: [560, 350], D: [600, 260], X: [560, 160] },
      pipes: [['S', 'A', 'V1', null, [200, 260]], ['A', 'B', null], ['B', 'F', 'V2', [[400, 260], [450, 260], [450, 350], [560, 350]], [450, 305]], ['B', 'D', 'V3', [[400, 260], [600, 260]], [530, 260]], ['B', 'X', 'V4', [[400, 260], [450, 260], [450, 160], [560, 160]], [450, 210]]],
      outlets: { F: { kind: 'fountain', cap: 1, label: 'Fountain' }, D: { kind: 'drain', cap: 2, label: 'Drain to the harbor' }, X: { kind: 'crack', label: 'Leaky pipe over the street' } },
      valves: ['V1', 'V2', 'V3', 'V4'], hint: 'Main valve on, fountain on, and send the extra 2 down the harbor drain. Keep the leaky pipe shut.' },
    { name: 'Room 3: The Big Valve', flow: 4,
      teach: '4 cups a second and three good places for it. And watch out: water doesn\'t care which way a pipe points. Anything connected gets wet.',
      nodes: { S: [100, 290], A: [200, 290], F: [480, 290], B: [300, 210], M: [430, 210], X: [470, 130], D: [645, 210], E: [300, 370], G: [480, 370] },
      pipes: [['S', 'A', 'V1', null, [150, 290]], ['A', 'F', 'V2', null, [380, 290]], ['A', 'B', 'V3', [[200, 290], [250, 290], [250, 210], [300, 210]], [250, 250]],
        ['B', 'M', null], ['M', 'X', 'V6', [[430, 210], [430, 130], [470, 130]], [430, 170]], ['M', 'D', null],
        ['A', 'E', 'V4', [[200, 290], [250, 290], [250, 370], [300, 370]], [250, 330]], ['E', 'G', 'V5', null, [390, 370]], ['G', 'D', null, [[480, 370], [600, 370], [600, 210]]]],
      outlets: { F: { kind: 'fountain', cap: 1, label: 'Fountain' }, D: { kind: 'drain', cap: 2, label: 'Harbor drain' }, G: { kind: 'garden', cap: 1, label: 'Rain garden' }, X: { kind: 'crack', label: 'Crack over the Boot' } },
      valves: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6'], hint: 'Keep V6 (the crack) shut no matter what: the drain connects both routes, so water can sneak back up to it. Then fountain, drain and rain garden: 1 + 2 + 1 = 4.' },
  ];
  CK.ThimbleRooms = ROOMS;
  class ValveScene {
    constructor() {
      this.t = 0; this.finished = false; this.room = Math.min(2, CK.G.flags.th_room || 0);
      this.load(); this.parts = new CK.Particles();
    }
    load() { this.R = ROOMS[this.room]; this.open = {}; this.sel = 0; this.goodT = 0; this.done = false; this.showHint = false; this.sim(); }
    enter() { CK.Audio.sfx('whoosh'); if (CK.autoSkip) { this.solveAll(); this.close(); } }
    solveAll() { CK.G.flags.th_room = 3; CK.setFlag('th_fixed'); }
    close() { this.finished = true; CK.Scenes.remove(this); }
    applySolution() { const sol = [['V1'], ['V1', 'V2', 'V3'], ['V1', 'V2', 'V4', 'V5']][this.room]; this.open = {}; for (const v of sol) this.open[v] = true; this.sim(); }
    // flood fill from the source through pipes whose valve (if any) is open
    sim() {
      const R = this.R, wet = new Set(['S']), wetPipes = new Set();
      let grew = true;
      while (grew) {
        grew = false;
        R.pipes.forEach(([a, b, v], i) => {
          if (v && !this.open[v]) return;
          if (wet.has(a) && !wet.has(b)) { wet.add(b); grew = true; }
          if (wet.has(b) && !wet.has(a)) { wet.add(a); grew = true; }
          if (wet.has(a) || wet.has(b)) wetPipes.add(i);
        });
      }
      this.wet = wet; this.wetPipes = wetPipes;
      const reached = Object.keys(R.outlets).filter((k) => wet.has(k));
      const cap = reached.reduce((s, k) => s + (R.outlets[k].cap || 0), 0);
      const crack = reached.find((k) => R.outlets[k].kind === 'crack');
      let state, msg;
      if (!Object.values(this.open).some(Boolean)) { state = 'shut'; msg = 'Everything\'s shut. The Teapot fills and fills, and the overflow goes down the street. (Hear Old Whistle?)'; }
      else if (crack) { state = 'crack'; msg = `Water\'s spraying out of the ${R.outlets[crack].label.toLowerCase()}! Shut whatever feeds it.${this.room === 2 ? ' (Remember: water can flow back up a pipe from the other side.)' : ''}`; }
      else if (!wet.has('F')) { state = 'dry'; msg = 'No water reaches the fountain. The festival needs its fountain.'; }
      else if (cap < R.flow) { state = 'over'; msg = `${R.flow} cups a second, but there\'s only room for ${cap}. The fountain overflows and the street floods anyway. Give the extra somewhere to go.`; }
      else { state = 'good'; msg = `${R.flow} in, ${cap} out. Nothing sprays, nothing overflows.`; }
      this.state = state; this.msg = msg; this.cap = cap;
    }
    toggle(v) { this.open[v] = !this.open[v]; CK.Audio.sfx(this.open[v] ? 'tape' : 'back'); this.sim(); if (this.state === 'crack') CK.Audio.sfx('splash'); }
    vpos(v) {
      const p = this.R.pipes.find((q) => q[2] === v);
      if (p[4]) return p[4];
      const [ax, ay] = this.R.nodes[p[0]], [bx, by] = this.R.nodes[p[1]];
      // pipes run horizontal then vertical; the valve sits on the first leg
      return Math.abs(by - ay) < 2 ? [(ax + bx) / 2, ay] : ax === bx ? [ax, (ay + by) / 2] : [(ax + bx) / 2 + (bx - ax) * 0.1, ay];
    }
    path(a, b, pts) { if (pts) return pts; const [ax, ay] = this.R.nodes[a], [bx, by] = this.R.nodes[b]; return ay === by || ax === bx ? [[ax, ay], [bx, by]] : [[ax, ay], [ax + (bx - ax) * 0.6, ay], [ax + (bx - ax) * 0.6, by], [bx, by]]; }
    update(dt) {
      this.t += dt; this.parts.update(dt);
      const R = this.R;
      if (this.done) {
        if (Input.hit('ok') || Input.mouse.pressed) {
          if (this.room < 2) { this.room++; CK.G.flags.th_room = this.room; this.load(); CK.Audio.sfx('select'); }
          else { CK.setFlag('th_fixed'); CK.G.flags.th_room = 3; this.close(); }
        }
        return;
      }
      // keep the vpos of each valve fresh for clicks
      if (Input.hit('left')) { this.sel = (this.sel + R.valves.length - 1) % R.valves.length; CK.Audio.sfx('blip'); }
      if (Input.hit('right')) { this.sel = (this.sel + 1) % R.valves.length; CK.Audio.sfx('blip'); }
      if (Input.hit('ok')) this.toggle(R.valves[this.sel]);
      if (Input.mouse.pressed) {
        R.valves.forEach((v, i) => { const [x, y] = this.vpos(v); if (Math.hypot(Input.mouse.x - x, Input.mouse.y - y) < 26) { this.sel = i; this.toggle(v); } });
        if (D.inRect(Input.mouse.x, Input.mouse.y, 760, 400, 160, 40)) { this.open = {}; this.sim(); CK.Audio.sfx('back'); }
        if (D.inRect(Input.mouse.x, Input.mouse.y, 760, 350, 160, 40)) this.showHint = true;
        if (D.inRect(Input.mouse.x, Input.mouse.y, 760, 450, 160, 40)) return this.close();
      }
      if (Input.key('KeyR')) { this.open = {}; this.sim(); }
      if (Input.key('KeyH')) this.showHint = true;
      if (Input.hit('back')) return this.close();
      // spray and overflow particles show the failure right where it happens
      if (this.state === 'crack') for (const k of Object.keys(R.outlets)) if (R.outlets[k].kind === 'crack' && this.wet.has(k)) { const [x, y] = R.nodes[k]; this.parts.emit({ x, y, vx: U.rand(-140, 140), vy: U.rand(-220, -60), g: 500, life: 0.8, size: 4, color: '#7fd6f0' }); }
      if (this.state === 'over') { const [x, y] = R.nodes.F; this.parts.emit({ x: x + U.rand(-30, 30), y: y - 10, vx: U.rand(-90, 90), vy: U.rand(-80, -20), g: 300, life: 0.9, size: 4, color: '#7fd6f0' }); }
      // hold a good state for a moment, then the room is done
      if (this.state === 'good') { this.goodT += dt; if (this.goodT > 1.2) { this.done = true; CK.Audio.sfx('win'); } } else this.goodT = 0;
    }
    draw(ctx) {
      const R = this.R, t = this.t;
      // inside the Teapot: curved cream walls with a blue flower band, warm lamplight, a plank floor
      ctx.fillStyle = '#f3e6cf'; ctx.fillRect(0, 0, W, H);
      const wg = ctx.createRadialGradient(W * 0.4, 60, 30, W * 0.4, 200, 620); wg.addColorStop(0, 'rgba(255,214,140,0.5)'); wg.addColorStop(1, 'rgba(120,70,40,0.35)');
      ctx.fillStyle = wg; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(i * 90 - 40, 0); ctx.quadraticCurveTo(i * 90 + 10, H / 2, i * 90 - 40, H); stroke(ctx, 2, 'rgba(160,120,80,0.12)'); }
      for (let i = 0; i < 14; i++) { D.ball(ctx, 30 + i * 70, 78, 9, 'rgba(111,159,216,0.55)', { lw: 1 }); }
      D.line(ctx, 0, 92, W, 92, 'rgba(111,159,216,0.5)', 3);
      ctx.fillStyle = '#b07c45'; ctx.fillRect(0, 486, W, 54);
      for (let i = 0; i < 12; i++) D.line(ctx, i * 84, 486, i * 84 + 10, 540, 'rgba(60,30,10,0.25)', 2);
      // a hanging lamp
      D.line(ctx, 690, 0, 690, 40, C.ink, 2); D.poly(ctx, [670, 40, 710, 40, 720, 62, 660, 62], '#e8c060', C.ink, 2);
      const lg = ctx.createRadialGradient(690, 64, 4, 690, 120, 260); lg.addColorStop(0, 'rgba(255,230,150,0.45)'); lg.addColorStop(1, 'rgba(255,230,150,0)'); ctx.fillStyle = lg; ctx.fillRect(430, 40, 520, 400);
      D.text(ctx, R.name, 40, 44, { size: 24, weight: 700, color: '#3d2412' });
      D.text(ctx, `Room ${this.room + 1} of 3 · inside the Teapot`, 40, 66, { size: 13, weight: 600, color: '#7a5434' });
      // the tank (source) with its water level and pressure dial
      const [sx, sy] = R.nodes.S;
      D.rr(ctx, sx - 50, sy - 70, 70, 120, 14); ctx.fillStyle = '#c9935a'; ctx.fill(); stroke(ctx, 3);
      const lvl = this.state === 'good' ? 0.55 : 0.92;
      D.rr(ctx, sx - 42, sy - 62 + (1 - lvl) * 104, 54, lvl * 104, 8); ctx.fillStyle = '#5cc8e6'; ctx.fill();
      D.text(ctx, `${R.flow} cups/s`, sx - 15, sy + 70, { size: 13, weight: 700, align: 'center', color: '#3d2412' });
      const dial = this.state === 'good' ? -0.6 : this.state === 'shut' ? 0.9 : 0.4;
      D.circle(ctx, sx - 15, sy - 92, 18, '#fffaf0', C.ink, 2.5); D.line(ctx, sx - 15, sy - 92, sx - 15 + Math.sin(dial + Math.sin(t * 20) * (this.state === 'shut' ? 0.08 : 0)) * 14, sy - 92 - Math.cos(dial) * 14, '#ef6b6b', 2.5);
      // pipes: copper, with moving water in the wet ones
      R.pipes.forEach(([a, b, v, route], i) => {
        const pts = this.path(a, b, route);
        ctx.beginPath(); pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        stroke(ctx, 18, C.ink); ctx.beginPath(); pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); stroke(ctx, 13, '#d08a4a');
        if (this.wetPipes.has(i)) {
          ctx.save(); ctx.setLineDash([10, 12]); ctx.lineDashOffset = -t * 60;
          ctx.beginPath(); pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); stroke(ctx, 6, '#9fe8ff');
          ctx.restore();
        }
      });
      for (const k of Object.keys(R.nodes)) if (!R.outlets[k] && k !== 'S') D.circle(ctx, ...R.nodes[k], 11, '#b07040', C.ink, 2.5);
      // outlets
      for (const k of Object.keys(R.outlets)) {
        const o = R.outlets[k], [x, y] = R.nodes[k], wet = this.wet.has(k);
        if (o.kind === 'fountain') { D.ellipse(ctx, x + 30, y + 6, 34, 12, '#ef6b6b', C.ink, 2.5); D.ellipse(ctx, x + 30, y + 4, 26, 8, wet ? '#7fd6f0' : '#c9c9c9', C.ink, 1.5); if (wet) for (let i = 0; i < 5; i++) { const p = (t + i / 5) % 1; D.circle(ctx, x + 30 + (i - 2) * 6 * p, y - 6 - Math.sin(p * Math.PI) * 24, 3, '#9fe8ff'); } }
        if (o.kind === 'drain') { D.rr(ctx, x + 6, y - 16, 44, 32, 4); ctx.fillStyle = '#5a6a8a'; ctx.fill(); stroke(ctx, 2.5); for (let i = 0; i < 4; i++) D.line(ctx, x + 12 + i * 10, y - 12, x + 12 + i * 10, y + 12, C.ink, 2); if (wet) D.circle(ctx, x + 28, y, 6 + Math.sin(t * 6) * 2, 'rgba(159,232,255,0.8)'); }
        if (o.kind === 'garden') { D.ellipse(ctx, x + 30, y + 4, 34, 14, '#7a5434', C.ink, 2.5); for (let i = 0; i < 5; i++) D.ball(ctx, x + 10 + i * 10, y - 4 - (i % 2) * 6, 6, wet ? ['#9fe07a', '#ff9ec7'][i % 2] : '#a89a7a', { lw: 1.2 }); }
        if (o.kind === 'crack') { D.line(ctx, x + 2, y - 10, x + 14, y + 12, C.ink, 3); D.box3(ctx, x + 22, y - 14, 30, 22, 8, { r: 2, lw: 2, fill: '#e2b27a', flute: false }); D.poly(ctx, [x + 18, y - 12, x + 37, y - 28, x + 56, y - 12], '#ef8fb0', C.ink, 2); }
        D.wrap(ctx, o.label + (o.cap ? ` (takes ${o.cap})` : ''), 120, 12, 700).forEach((l, i) => D.text(ctx, l, x + 30, (o.kind === 'crack' ? y - 30 : y + 30) + i * 14, { size: 12, weight: 700, align: 'center', color: o.kind === 'crack' ? '#c2410c' : '#3d2412' }));
      }
      // valves: red wheels; open ones turned and ringed in green
      R.valves.forEach((v, i) => {
        const [x, y] = this.vpos(v), on = !!this.open[v];
        if (i === this.sel && !this.done) D.circle(ctx, x, y, 26, 'rgba(255,210,90,0.45)');
        ctx.save(); ctx.translate(x, y); ctx.rotate(on ? Math.PI / 4 : 0);
        ctx.beginPath(); ctx.arc(0, 0, 15, 0, TAU); stroke(ctx, 7, C.ink); ctx.beginPath(); ctx.arc(0, 0, 15, 0, TAU); stroke(ctx, 4, on ? '#7cc46a' : '#ef6b6b');
        for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; D.line(ctx, 0, 0, Math.cos(a) * 15, Math.sin(a) * 15, on ? '#7cc46a' : '#ef6b6b', 3); }
        D.circle(ctx, 0, 0, 4, '#fffaf0', C.ink, 1.5);
        ctx.restore();
        D.text(ctx, `${v} ${on ? 'OPEN' : 'shut'}`, x, y - 24, { size: 11, weight: 700, align: 'center', color: on ? '#2f6a3a' : '#7a5434', outline: '#fff4dc', ow: 3 });
      });
      this.parts.draw(ctx);
      // side panel
      D.panel(ctx, 740, 110, 200, 226, { fill: '#fff4dc', tape: false });
      D.wrap(ctx, R.teach, 176, 13, 600).forEach((l, i) => D.text(ctx, l, 752, 136 + i * 17, { size: 13, weight: 600, color: '#3d2412' }));
      const good = this.state === 'good';
      D.text(ctx, `In: ${R.flow}  ·  Room for: ${this.cap}`, 840, 300, { size: 14, weight: 700, align: 'center', color: good ? '#2f6a3a' : '#c2410c' });
      D.button(ctx, 760, 350, 160, 40, 'Tuppence\'s notes (H)', { size: 13 });
      D.button(ctx, 760, 400, 160, 40, 'Shut all (R)', { size: 14 });
      D.button(ctx, 760, 450, 160, 40, 'Leave', { size: 14 });
      D.portrait(ctx, 'whistle', 20, 410, good || this.done ? 'happy' : 'sad');
      const msg = this.done ? (this.room < 2 ? 'Room fixed! Old Whistle hums a happy note. (Z / click: next room)' : 'All three rooms fixed! The Teapot settles. (Z / click: go outside)') : this.showHint ? 'Tuppence\'s notes: ' + R.hint : this.msg;
      D.panel(ctx, 140, 420, 580, 100, { fill: this.done || good ? '#e8f8e0' : this.state === 'crack' || this.state === 'over' ? '#ffe9e0' : '#fffaf0', tape: false });
      D.wrap(ctx, msg, 540, 15, 600).forEach((l, i) => D.text(ctx, l, 430, 452 + i * 20, { size: 15, weight: 600, align: 'center', color: '#3d2412' }));
      D.text(ctx, 'Click a valve, or Left/Right + Z · R: shut all · H: notes', 430, 532, { size: 11, weight: 600, align: 'center', color: '#7a5434' });
    }
  }
  CK.ValveScene = ValveScene;

  // ================================================================ PROMPTS, TRAVEL
  const baseLabel = CK.promptLabel;
  CK.promptLabel = (fo) => {
    if (fo.type === 'building' && fo.id === 'th_tower' && !f('th_fixed')) return wearing() ? 'Turn the wheel!' : 'Wheel (rusted)';
    return baseLabel ? baseLabel(fo) : null;
  };
  const baseTravel = CK.travelChoice;
  CK.travelChoice = function (text) {
    const c = baseTravel(text);
    if (f('hm_done') && CK.G.chapter !== 'thimble') c.choice.options.splice(c.choice.options.length - 1, 0, { label: f('thimble_arrived') ? 'Thimble Row' : 'Thimble Row (new chapter!)', then: [{ chapter: 'thimble', label: 'Thimble Row' }] });
    return c;
  };
  if (CK.Postcards) CK.Postcards.push({ id: 'thimble', ch: 'thimble', at: [17, 10], undo: ['th_fixed', 'th_done', 'th_bloomed'], need: 'th_fixed', title: 'Thimble Row', caption: 'The Teapot water tower overflowed down the street until we learned its valves. Now the fountain runs and the colour came back.' });
  CK.debugThimble = { pieces() { for (const k of Object.keys(PIECES)) CK.setFlag('th_piece_' + k); } };
})();
