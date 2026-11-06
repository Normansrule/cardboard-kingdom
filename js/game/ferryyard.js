// Cardboard Kingdom - Chapter 11: The Ferryyard (v2.10).
// From the design direction: Mallow the horned ferryperson, Ibis the nervous archivist, and
// Tin-Lid Ferryyard, a riverside town of stilt houses that was never put on the Kingdom's map.
// A forgotten Silver Quill machine is stamping DENIED on every door. Ibis drew the old
// "Approved Neighborhoods" map that left the Ferryyard off it, and wants to put it right.
// The rebuild: a ramp from the ferry dock up to the high road that Grandpa Wick (in a cardboard
// wheelchair) and Mallow's ferry cart can actually use. Rule Nine: ask who needs to use it.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input, Data = CK.Data;
  const W = CK.W, H = CK.H, TS = 48;
  const C = D.C, TAU = Math.PI * 2;
  const CH = D.chars;
  const f = (k) => CK.flag(k);
  const S = CK.Story.scripts;
  const stroke = (ctx, lw, col) => { ctx.strokeStyle = col || C.ink; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };
  const show = (scene) => { CK.Scenes.push(scene); return scene; };
  const open = () => f('lb_fair');

  // ================================================================ CHARACTERS
  // Mallow: a big, gentle horned creature (one of the "monsters"), shaggy and teal, in a life vest
  // with a necklace of terrible souvenir spoons. Carries a paddle. Speaks quietly.
  CH.mallow = function (ctx, x, y, o) {
    const s = o.s || 1, mood = o.mood;
    const dir = o.dir || 'down';
    const side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const fur = '#6fbfb3', furD = '#4f9c92';
    for (const k of [-1, 1]) D.egg(ctx, x + k * 9 * s, y - 2 * s, 7 * s, 3.5 * s, '#5b4a3e', { lw: 1.6 });
    // the paddle, held upright
    const px = x + (side >= 0 ? 22 : -22) * s;
    D.line(ctx, px, y - 4 * s, px, y - 62 * s, '#a0703f', 3 * s);
    D.egg(ctx, px, y - 66 * s, 5 * s, 10 * s, '#c99561', { lw: 1.6 });
    // shaggy body
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const a = Math.PI + (i / 16) * Math.PI, r = (i % 2 ? 19 : 21) * s;
      const px2 = x + Math.cos(a) * r, py2 = y - 20 * s + Math.sin(a) * r * 0.95;
      if (i) ctx.lineTo(px2, py2); else ctx.moveTo(px2, py2);
    }
    ctx.lineTo(x + 18 * s, y - 4 * s); ctx.lineTo(x - 18 * s, y - 4 * s); ctx.closePath();
    D.fillVol(ctx, x - 4 * s, y - 22 * s, 20 * s, fur, 2.2);
    // orange life vest with a whistle, and the spoon necklace
    D.rr(ctx, x - 13 * s, y - 30 * s, 26 * s, 20 * s, 5 * s); ctx.fillStyle = D.lgx(ctx, x - 13 * s, x + 13 * s, '#f2843a'); ctx.fill(); stroke(ctx, 1.8);
    D.line(ctx, x - 13 * s, y - 20 * s, x + 13 * s, y - 20 * s, '#fff4dc', 2.4 * s);
    ctx.beginPath(); ctx.arc(x, y - 34 * s, 10 * s, 0.2, Math.PI - 0.2); stroke(ctx, 1.2, '#8a8a90');
    for (let i = 0; i < 4; i++) {
      const a = 0.45 + i * 0.75, sx = x + Math.cos(a) * 10 * s, sy = y - 34 * s + Math.sin(a) * 10 * s;
      D.line(ctx, sx, sy, sx + (i - 1.5) * 1.5 * s, sy + 6 * s, '#c9d3e0', 1.6 * s);
      D.egg(ctx, sx + (i - 1.5) * 1.5 * s, sy + 7.5 * s, 1.8 * s, 2.4 * s, ['#c9d3e0', '#ffd25a', '#ff9ec7', '#c9d3e0'][i], { lw: 1 });
    }
    // head: big shaggy face, a soft snout, two curling horns and a little sailor cap
    const hx = x + side * 3 * s, hy = y - 46 * s;
    for (const k of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(hx + k * 9 * s, hy - 8 * s);
      ctx.quadraticCurveTo(hx + k * 24 * s, hy - 14 * s, hx + k * 20 * s, hy - 2 * s);
      ctx.lineCap = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 7 * s; ctx.stroke(); ctx.strokeStyle = '#f3e3c3'; ctx.lineWidth = 4.5 * s; ctx.stroke();
    }
    D.ball(ctx, hx, hy, 14 * s, fur, { lw: 2.2, k: 0.6 });
    for (let i = -2; i <= 2; i++) D.egg(ctx, hx + i * 5 * s, hy - 11 * s, 3.5 * s, 4.5 * s, furD, { lw: 0 });
    if (dir !== 'up') {
      D.egg(ctx, hx + side * 4 * s, hy + 5 * s, 8 * s, 5.5 * s, '#d9f2ec', { lw: 1.4 });
      D.egg(ctx, hx + side * 5 * s, hy + 3 * s, 2.4 * s, 1.6 * s, '#3a2a2a', { lw: 0 });
      for (const k of [-1, 1]) {
        if (side && k === -side) continue;
        const ex = hx + side * 3 * s + k * 6 * s, ey = hy - 3 * s;
        if (mood === 'happy') { ctx.beginPath(); ctx.arc(ex, ey + 1 * s, 2.2 * s, Math.PI * 1.1, Math.PI * 1.9); stroke(ctx, 1.8); }
        else D.ellipse(ctx, ex, ey, 1.8 * s, 2.4 * s, '#1e1612');
        if (mood === 'sad') D.line(ctx, ex - k * 3 * s, ey - 3.5 * s, ex + k * 2 * s, ey - 4.5 * s, C.ink, 1.3);
      }
      D.blush(ctx, hx + side * 3 * s, hy + 3 * s, 9 * s, 2 * s);
    }
    D.egg(ctx, hx, hy - 15 * s, 9 * s, 3 * s, '#fffaf0', { lw: 1.4 });
    ctx.beginPath(); ctx.arc(hx, hy - 15 * s, 6.5 * s, Math.PI, 0); ctx.closePath(); D.fillVol(ctx, hx - 2 * s, hy - 18 * s, 6 * s, '#fffaf0', 1.4);
    D.line(ctx, hx - 6 * s, hy - 16 * s, hx + 6 * s, hy - 16 * s, '#3a6ea8', 1.6 * s);
  };

  // Ibis: a magpie archivist in a moss-green cardigan, round glasses, ink on her wingtips,
  // and an armful of rolled-up maps she keeps almost dropping.
  CH.ibis = function (ctx, x, y, o) {
    const s = o.s || 1, mood = o.mood;
    const dir = o.dir || 'down';
    const side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    D.poly(ctx, [x - 5 * s, y - 12 * s, x - 15 * s, y - 1 * s, x - 9 * s, y + 1 * s, x - 1 * s, y - 8 * s], '#23314f', C.ink, 1.4);
    for (const k of [-1, 1]) D.line(ctx, x + k * 4 * s, y - 8 * s, x + k * 4 * s, y - 1 * s, '#3a3a44', 2 * s);
    ctx.beginPath(); ctx.ellipse(x, y - 19 * s, 12 * s, 13 * s, 0, 0, TAU);
    D.fillVol(ctx, x - 3 * s, y - 21 * s, 13 * s, '#7a9a5a', 2);
    for (let i = 0; i < 3; i++) D.circle(ctx, x + 1 * s, y - 25 * s + i * 5 * s, 1.1 * s, '#e8dcc8', C.ink, 0.6);
    D.poly(ctx, [x - 4 * s, y - 31 * s, x + 4 * s, y - 31 * s, x, y - 24 * s], '#f6f2ea', C.ink, 1);
    // the armful of maps
    for (let i = 0; i < 3; i++) {
      ctx.save(); ctx.translate(x + (side >= 0 ? 9 : -9) * s, y - 20 * s + i * 3 * s); ctx.rotate(-0.5 + i * 0.25);
      D.rr(ctx, -10 * s, -2.5 * s, 20 * s, 5 * s, 2.5 * s); ctx.fillStyle = ['#fffaf0', '#f3e6c8', '#e8f0ff'][i]; ctx.fill(); stroke(ctx, 1.2);
      D.line(ctx, -2 * s, -2.5 * s, -2 * s, 2.5 * s, '#ef6b6b', 1.2);
      ctx.restore();
    }
    D.egg(ctx, x - (side >= 0 ? 11 : -11) * s, y - 19 * s, 4 * s, 8 * s, '#1f2433', { lw: 1.6, rot: 0.2 });
    D.circle(ctx, x - (side >= 0 ? 12 : -12) * s, y - 12 * s, 2 * s, '#3a4a7a');
    // head: glossy black with a white cheek, round glasses
    const hx = x + side * 2 * s, hy = y - 40 * s;
    D.ball(ctx, hx, hy, 10.5 * s, '#1f2433', { lw: 2.2, k: 0.5 });
    D.egg(ctx, hx - side * 3 * s, hy + 4 * s, 6 * s, 4.5 * s, '#f6f2ea', { lw: 0 });
    if (dir !== 'up') {
      for (const k of [-1, 1]) {
        if (side && k === -side) continue;
        const ex = hx + side * 3 * s + k * 4.5 * s, ey = hy - 1 * s;
        D.circle(ctx, ex, ey, 3.8 * s, 'rgba(220,240,255,0.55)', '#c9a24a', 1.4);
        D.circle(ctx, ex, ey + 0.4 * s, 1.5 * s, '#f6f2ea');
        D.circle(ctx, ex + side * 0.4 * s, ey + 0.4 * s, 0.9 * s, '#120e14');
        if (mood === 'sad' || mood === 'shock') D.line(ctx, ex - k * 3 * s, ey - 5.5 * s, ex + k * 2 * s, ey - 6.5 * s, '#f6f2ea', 1.2);
      }
      if (!side) D.line(ctx, hx - 1 * s, hy - 1 * s, hx + 1 * s, hy - 1 * s, '#c9a24a', 1.2);
      const bx = hx + side * 8 * s;
      D.poly(ctx, side ? [bx, hy + 1 * s, bx + side * 9 * s, hy + 3 * s, bx, hy + 5 * s] : [hx - 2.6 * s, hy + 3 * s, hx + 2.6 * s, hy + 3 * s, hx, hy + 9 * s], '#2a2a33', C.ink, 1.2);
      D.blush(ctx, hx + side * 2 * s, hy + 4 * s, 7 * s, 1.6 * s);
    }
  };

  // Grandpa Wick: an old otter-ish duck in a cardboard wheelchair, with a fishing hat full of lures.
  CH.wick = function (ctx, x, y, o) {
    const s = o.s || 1;
    for (const k of [-1, 1]) {
      D.circle(ctx, x + k * 13 * s, y - 10 * s, 10 * s, '#d9a66b', C.ink, 2);
      D.circle(ctx, x + k * 13 * s, y - 10 * s, 3 * s, '#8a5a2e', C.ink, 1);
      for (let i = 0; i < 4; i++) D.line(ctx, x + k * 13 * s, y - 10 * s, x + k * 13 * s + Math.cos(i * 1.57 + CK.time) * 8 * s, y - 10 * s + Math.sin(i * 1.57 + CK.time) * 8 * s, 'rgba(90,50,20,0.5)', 1);
    }
    D.box3(ctx, x - 14 * s, y - 30 * s, 28 * s, 16 * s, 6 * s, { r: 3, lw: 2, fill: '#c99561', flute: false });
    CH.critter(ctx, x, y - 12 * s, Object.assign({}, o, { s: s * 0.95, species: 'duck', color: '#d9cfb8', hat: 'sunhat', mood: o.mood || 'happy' }));
  };

  Object.assign(Data.speakers, {
    mallow: { name: 'Mallow', look: 'mallow', ps: 1.9, py: 30, bg: '#dff3ef' },
    ibis: { name: 'Ibis', look: 'ibis', ps: 2.2, py: 16, bg: '#e9efe0' },
    wick: { name: 'Grandpa Wick', look: 'wick', ps: 2.1, py: 14, bg: '#fff3dc' },
    engine: { name: 'The Approval Engine', look: 'engineface', ps: 1, py: 0, bg: '#e8eaf0' },
  });

  // ================================================================ THE APPROVAL ENGINE
  // A Silver Quill machine left running for twenty years: white card, identical folds, an
  // enormous rubber stamp on an arm, and a ticker tape of forms. Angry, its slot glows red.
  function drawEngine(ctx, x, y, s, angry, t) {
    D.shadow(ctx, x, y, 70 * s, 14 * s, 0.35);
    D.box3(ctx, x - 50 * s, y - 110 * s, 100 * s, 104 * s, 26 * s, { r: 4, lw: 3, fill: '#f4f6fa', flute: false });
    for (let i = 1; i < 6; i++) D.line(ctx, x - 48 * s, y - 110 * s + i * 17 * s, x + 48 * s, y - 110 * s + i * 17 * s, 'rgba(120,130,150,0.25)', 2);
    // the slot "face"
    D.rr(ctx, x - 30 * s, y - 92 * s, 60 * s, 16 * s, 6 * s); ctx.fillStyle = angry ? '#3a0f14' : '#2a3040'; ctx.fill(); stroke(ctx, 2);
    for (const k of [-1, 1]) D.ellipse(ctx, x + k * 14 * s, y - 84 * s, 6 * s, 3 * s, angry ? '#ff5a5a' : '#bfe6ff');
    D.text(ctx, 'APPROVAL', x, y - 54 * s, { size: Math.max(9, 13 * s), weight: 700, align: 'center', color: '#8a93a3' });
    D.icon(ctx, 'feather', x, y - 36 * s, 1.4 * s);
    // stamp arm
    const ang = -0.6 + Math.abs(Math.sin(t * 2.4)) * 0.9;
    ctx.save(); ctx.translate(x + 46 * s, y - 100 * s); ctx.rotate(ang);
    D.rr(ctx, 0, -5 * s, 60 * s, 10 * s, 4 * s); ctx.fillStyle = '#c9d3e0'; ctx.fill(); stroke(ctx, 2);
    D.rr(ctx, 48 * s, -12 * s, 26 * s, 34 * s, 4 * s); ctx.fillStyle = '#8a5a2e'; ctx.fill(); stroke(ctx, 2);
    D.rr(ctx, 44 * s, 20 * s, 34 * s, 10 * s, 2 * s); ctx.fillStyle = angry ? '#d23a3a' : '#6cc56c'; ctx.fill(); stroke(ctx, 2);
    ctx.restore();
    // ticker tape of forms
    for (let i = 0; i < 4; i++) {
      const fy = y - 20 * s - ((t * 40 + i * 18) % 70) * s;
      D.rr(ctx, x - 70 * s, fy, 18 * s, 12 * s, 1); ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 1);
      D.text(ctx, angry ? 'NO' : 'OK', x - 61 * s, fy + 9 * s, { size: Math.max(6, 7 * s), weight: 700, align: 'center', color: angry ? '#d23a3a' : '#3e7a5a' });
    }
  }
  CH.engineface = function (ctx, x, y, o) { drawEngine(ctx, x, y - 10, (o.s || 1) * 0.9, o.mood !== 'happy', CK.time); };
  Data.enemies.formbot = {
    name: 'Form Fold', hp: 40, atk: 11, def: 1, xp: 10, scraps: 5, draw: 'formbot',
    moves: [{ name: 'Paper Cut', power: 1, w: 3 }, { name: 'Please Fill In Triplicate', power: 0.6, all: true, w: 1, drain: true }],
  };
  Data.enemies.engine = {
    name: 'The Approval Engine', hp: 380, atk: 13, def: 3, xp: 100, scraps: 60, draw: 'engine', boss: true,
    moves: [{ name: 'DENIED!', power: 1.45, w: 2 }, { name: 'Paperwork Avalanche', power: 0.8, all: true, w: 2 }, { name: 'Red Tape', power: 0.6, all: true, w: 1, drain: true }, { name: 'Print Forms', summon: 'formbot', w: 1 }],
  };
  Data.battles.fy_engine = { enemies: ['formbot', 'engine', 'formbot'], season: 'summer', boss: true, music: 'boss' };
  const baseEnemy = D.enemy;
  D.enemy = function (ctx, type, x, y, o = {}) {
    if (type === 'engine') return drawEngine(ctx, x, y, (o.s || 1) * 1.05, !o.calm, CK.time);
    if (type === 'formbot') {
      // a folded form that walks: identical creases, a little stamp for a hat
      const s = (o.s || 1) * 2.2, t = CK.time + (o.seed || 0);
      D.shadow(ctx, x, y, 22 * s, 6 * s);
      ctx.save(); ctx.translate(x, y - 22 * s + Math.sin(t * 5) * 2); ctx.rotate(Math.sin(t * 3) * 0.06);
      D.poly(ctx, [-14 * s, 18 * s, -10 * s, -16 * s, 12 * s, -18 * s, 14 * s, 16 * s], '#fbfcff', C.ink, 2);
      D.line(ctx, -12 * s, 0, 13 * s, -1 * s, 'rgba(120,130,150,0.5)', 1.5);
      for (const k of [-1, 1]) D.ellipse(ctx, k * 5 * s, -7 * s, 2 * s, 2.6 * s, o.calm ? '#2a2a33' : '#e23a3a');
      D.rr(ctx, -6 * s, -26 * s, 12 * s, 8 * s, 2); ctx.fillStyle = '#8a5a2e'; ctx.fill(); stroke(ctx, 1.4);
      ctx.restore();
      return;
    }
    return baseEnemy.call(this, ctx, type, x, y, o);
  };

  // ================================================================ PLACE
  Data.seasons.ferryyard = {
    name: 'Late summer', ground: '#a8dc7c', ground2: '#98d06c', path: '#f0d7a0', sand: '#f6e3a8', water: '#47cde6', waterD: '#1f9cc6',
    sky: ['#8fdcff', '#ffe6c8'], night: ['#1a2050', '#4a2f62'], tree: 'oak', particle: 'sparkle',
  };
  CK.Chapters.ferryyard = {
    id: 'ferryyard', name: 'Tin-Lid Ferryyard', w: 40, h: 24, season: 'ferryyard', music: 'summer',
    start: [3, 6], noFlood: true,
    build(m) {
      m.scatter(',', 0.12, 111);
      m.rect(0, 16, 40, 8, '~');
      m.rect(1, 13, 38, 3, 's');
      m.scatter('z', 0.08, 112, 's');
      m.path([[1, 6], [38, 6]], '=');
      m.rect(1, 9, 38, 1, 'R');
      m.path([[8, 6], [8, 3]], '=');
      m.rect(19, 16, 3, 4, 'd');
      m.scatter('T', 0.05, 113);
      m.border('T');
    },
    post(m) {
      // clear trees off anything that stands somewhere, but keep sand as sand
      for (const o of this.objects) if (o.type !== 'trigger' && 'T,'.includes(m.get(o.x, o.y))) m.set(o.x, o.y, '.');
      // the cliff band: one gap where the old stairs (later the ramp) climb from the beach to the road
      for (let x = 18; x <= 22; x++) { m.set(x, 9, '.'); m.set(x, 8, '.'); m.set(x, 10, '.'); m.set(x, 11, '.'); m.set(x, 12, '.'); }
      for (let x = 1; x < 39; x++) for (const y of [7, 8]) if (m.get(x, y) === 'T') m.set(x, y, '.');
      m.rect(1, 5, 3, 3, '.'); m.rect(1, 6, 3, 1, '=');
      for (let x = 2; x < 38; x++) for (const y of [10, 11, 12]) if (m.get(x, y) === 'T') m.set(x, y, ',');
    },
    objects: [
      // the high road
      { type: 'npc', id: 'pell_ferryyard', x: 5, y: 7, look: 'pelican', talk: () => [['pell', f('fy_done') ? 'The Ferryyard has an address now. Do you know how long I have waited to deliver here?' : 'I have never once had post for the Ferryyard. Not because nobody writes. Because it is not on the map.', f('fy_done') ? 'happy' : 'sad']] },
      { type: 'bench', x: 12, y: 7 },
      { type: 'sign', x: 3, y: 5, text: 'TIN-LID FERRYYARD. Not on the Royal Map. Here anyway.' },
      { type: 'deco', kind: 'fy_stairs', x: 20, y: 9, cond: () => !f('fy_ramp') },
      { type: 'deco', kind: 'fy_ramp', x: 20, y: 9, cond: () => f('fy_ramp') },
      { type: 'site', id: 'fy_site', x: 23, y: 8, script: () => rampSite() },
      { type: 'npc', id: 'ibis', x: 15, y: 7, look: 'ibis', talk: () => ibisTalk(), cond: () => f('fy_engine') },
      // the beach and the stilt houses
      { type: 'house', id: 'fy_a', x: 4, y: 12, roof: '#5aa9e6', style: 'stilt', knock: 'fy_knock_a' },
      { type: 'house', id: 'fy_b', x: 9, y: 12, roof: '#ff8fb1', style: 'stilt', knock: 'fy_knock_b' },
      { type: 'house', id: 'fy_c', x: 27, y: 12, roof: '#ffd25a', style: 'stilt', knock: 'fy_knock_c' },
      { type: 'house', id: 'fy_d', x: 33, y: 12, roof: '#6cc56c', style: 'stilt', knock: 'fy_knock_d' },
      { type: 'npc', id: 'mallow', x: 17, y: 14, look: 'mallow', talk: () => mallowTalk() },
      { type: 'npc', id: 'wick', x: 14, y: 13, look: 'wick', talk: () => wickTalk() },
      { type: 'npc', id: 'engine_npc', x: 30, y: 14, look: 'engineface', o: { s: 0.5 }, talk: 'fy_engine_meet', cond: () => !f('fy_engine') },
      { type: 'deco', kind: 'fy_pot', x: 12, y: 14 },
      { type: 'deco', kind: 'fy_laundry', x: 7, y: 15 },
      { type: 'deco', kind: 'fy_laundry', x: 30, y: 15 },
      { type: 'deco', kind: 'fy_boat', x: 25, y: 15, color: '#ef6b6b' },
      { type: 'deco', kind: 'fy_boat', x: 37, y: 15, color: '#ffd25a' },
      { type: 'deco', kind: 'fy_flowers', x: 10, y: 8 },
      { type: 'deco', kind: 'fy_flowers', x: 27, y: 8 },
      { type: 'deco', kind: 'fy_flowers', x: 33, y: 5 },
      { type: 'deco', kind: 'fy_ferry', x: 20, y: 19 },
      { type: 'deco', kind: 'lantern', x: 7, y: 14 },
      { type: 'deco', kind: 'lantern', x: 24, y: 14 },
      { type: 'deco', kind: 'lantern', x: 36, y: 14 },
      { type: 'campfire', x: 35, y: 7 },
      { type: 'cat', x: 37, y: 13 },
      { type: 'trigger', id: 'fy_done_go', x: 10, y: 12, w: 6, h: 3, script: 'fy_finale', cond: () => f('fy_ramp') && !f('fy_done') },
    ],
    objective() {
      if (!f('fy_mallow')) return 'Talk to Mallow by the ferry';
      if (!f('fy_engine')) return 'Something keeps stamping DENIED on doors (east, by the houses)';
      if (!f('fy_records')) return 'Ibis has something to show you (up on the road)';
      if (!f('fy_ramp')) return 'Design a way up from the dock that Grandpa Wick can use (blueprint by the stairs)';
      if (!f('fy_done')) return 'Supper by the cooking pot!';
      return 'Free roam! The Ferryyard is on the map now. Workbench to travel.';
    },
  };
  // the ledge between the road and the beach: an Animal Crossing-style cliff, grass on top and a
  // corrugated cardboard face, instead of a row of boulders
  CK.Chapters.ferryyard.paintGround = function (g, m) {
    for (let x = 0; x < m.w; x++) {
      if (m.get(x, 9) !== 'R') continue;
      const X = x * TS, Y = 9 * TS;
      g.fillStyle = Data.seasons.ferryyard.ground; g.fillRect(X, Y - 4, TS, 22);
      const face = g.createLinearGradient(0, Y + 16, 0, Y + TS + 6);
      face.addColorStop(0, '#d9a66b'); face.addColorStop(1, '#b07c45');
      g.fillStyle = face; g.fillRect(X, Y + 16, TS, TS - 10);
      for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(120,70,20,0.18)'; g.fillRect(X + 4 + i * 12, Y + 18, 5, TS - 14); }
      g.fillStyle = 'rgba(40,20,10,0.18)'; g.fillRect(X, Y + TS + 6, TS, 8);
      g.strokeStyle = C.ink; g.lineWidth = 3;
      g.beginPath(); g.moveTo(X, Y + 16); g.lineTo(X + TS, Y + 16); g.stroke();
      g.beginPath(); g.moveTo(X, Y + TS + 6); g.lineTo(X + TS, Y + TS + 6); g.stroke();
      if (m.get(x - 1, 9) !== 'R') { g.beginPath(); g.moveTo(X + 1, Y + 16); g.lineTo(X + 1, Y + TS + 6); g.stroke(); }
      if (m.get(x + 1, 9) !== 'R') { g.beginPath(); g.moveTo(X + TS - 1, Y + 16); g.lineTo(X + TS - 1, Y + TS + 6); g.stroke(); }
      // grass lip with little tufts hanging over the edge
      g.fillStyle = '#8fcf6a';
      for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(X + 6 + i * 12, Y + 16, 7, 4, 0, 0, TAU); g.fill(); }
      if (U.hash(x, 9, 4) < 0.4) { g.fillStyle = ['#ff9ec7', '#fff', '#ffd25a'][x % 3]; g.beginPath(); g.arc(X + 24, Y + 8, 3, 0, TAU); g.fill(); }
    }
  };
  // cozy clutter: a washing line between the stilt houses, flower beds, upturned boats
  CK.DecoDraw.fy_laundry = function (ctx, e, x, y) {
    for (const k of [-1, 1]) D.line(ctx, x + k * 60, y, x + k * 60, y - 56, '#8a5a2e', 3);
    ctx.beginPath(); ctx.moveTo(x - 60, y - 52); ctx.quadraticCurveTo(x, y - 40, x + 60, y - 52); stroke(ctx, 1.5);
    const cl = ['#ff8fb1', '#5aa9e6', '#ffd25a', '#6cc56c', '#fffaf0'];
    for (let i = 0; i < 5; i++) {
      const px = x - 44 + i * 22, py = y - 48 + Math.sin((i / 4) * Math.PI) * 6, sw = Math.sin(this.t * 2 + i) * 0.08;
      ctx.save(); ctx.translate(px, py); ctx.rotate(sw);
      if (i % 2) { D.rr(ctx, -7, 0, 14, 16, 2); ctx.fillStyle = cl[i]; ctx.fill(); stroke(ctx, 1.4); }
      else { D.poly(ctx, [-8, 0, 8, 0, 6, 14, -6, 14], cl[i], C.ink, 1.4); D.line(ctx, -8, 0, -12, 6, C.ink, 1.4); D.line(ctx, 8, 0, 12, 6, C.ink, 1.4); }
      ctx.restore();
    }
  };
  CK.DecoDraw.fy_flowers = function (ctx, e, x, y) {
    D.ellipse(ctx, x, y - 4, 30, 10, '#7a5a3a', C.ink, 2);
    const cols = ['#ff9ec7', '#ffd25a', '#ffffff', '#a68be6', '#ef6b6b'];
    for (let i = 0; i < 9; i++) {
      const fx = x - 22 + (i % 5) * 11 + (i > 4 ? 5 : 0), fy = y - 8 - (i > 4 ? 8 : 0) + Math.sin(this.t * 2 + i) * 0.6;
      D.line(ctx, fx, fy + 6, fx, fy, '#4a8a3a', 2);
      for (let p = 0; p < 5; p++) D.circle(ctx, fx + Math.cos(p * 1.26) * 3, fy - 2 + Math.sin(p * 1.26) * 3, 2.4, cols[(i + e.x) % 5]);
      D.circle(ctx, fx, fy - 2, 1.6, '#ffcf3a');
    }
  };
  CK.DecoDraw.fy_boat = function (ctx, e, x, y) {
    D.shadow(ctx, x, y, 34, 7);
    ctx.beginPath(); ctx.moveTo(x - 32, y - 18); ctx.quadraticCurveTo(x, y + 4, x + 32, y - 18); ctx.closePath();
    D.fillVol(ctx, x - 6, y - 12, 30, e.color || '#5aa9e6', 2.2);
    D.line(ctx, x - 28, y - 16, x + 28, y - 16, '#fffaf0', 3);
  };
  CK.DECO_FOOT.fy_boat = [-0.6, -0.3, 1.2, 0.4];
  CK.DECO_FOOT.fy_pot = [-0.4, -0.2, 0.8, 0.5];
  CK.DECO_FOOT.fy_stairs = [-1.5, -0.6, 0.2, 1.6];
  CK.DECO_FOOT.fy_ferry = [-1.5, -0.6, 3, 1.2];

  // stilt houses: the ordinary hut, lifted on posts and braced
  const baseHouse = CK.Overworld.prototype.drawHouse;
  CK.Overworld.prototype.drawHouse = function (ctx, e) {
    if (e.style !== 'stilt') return baseHouse.call(this, ctx, e);
    const x = e.x * TS - this.camX, y = e.y * TS - this.camY;
    for (const px of [16, 48, 80]) { D.rr(ctx, x + px - 4, y + 30, 8, 30, 2); ctx.fillStyle = '#8a5a2e'; ctx.fill(); stroke(ctx, 2); }
    D.line(ctx, x + 16, y + 56, x + 48, y + 34, '#6a4426', 3); D.line(ctx, x + 80, y + 56, x + 48, y + 34, '#6a4426', 3);
    ctx.save(); ctx.translate(0, -16);
    baseHouse.call(this, ctx, Object.assign({}, e, { style: 'hut', y: e.y }));
    ctx.restore();
    // a little ladder down to the sand, and a nameplate like a proper address
    for (let i = 0; i < 4; i++) D.line(ctx, x + 40, y + 36 + i * 6, x + 56, y + 36 + i * 6, '#a0703f', 2);
    if (f('fy_done') && e.id.startsWith('fy_')) { D.rr(ctx, x + 62, y + 2, 26, 12, 3); ctx.fillStyle = '#fff4dc'; ctx.fill(); stroke(ctx, 1.4); D.text(ctx, 'No.' + (e.id.charCodeAt(3) - 96), x + 75, y + 11, { size: 8, weight: 700, align: 'center', color: '#3e7a5a' }); }
    if (!f('fy_engine') && e.id.startsWith('fy_')) { ctx.save(); ctx.translate(x + 48, y - 2); ctx.rotate(-0.2); D.rr(ctx, -24, -8, 48, 16, 3); stroke(ctx, 2.4, '#d23a3a'); D.text(ctx, 'DENIED', 0, 5, { size: 11, weight: 700, align: 'center', color: '#d23a3a' }); ctx.restore(); }
  };

  CK.DecoDraw.fy_pot = function (ctx, e, x, y) {
    D.shadow(ctx, x, y, 22, 6);
    for (const k of [-1, 1]) D.line(ctx, x + k * 18, y, x + k * 6, y - 40, '#6a4426', 3);
    D.ball(ctx, x, y - 16, 16, '#4a4f5a', { lw: 2.4 });
    D.ellipse(ctx, x, y - 26, 14, 4, '#f2a93b', C.ink, 1.6);
    for (let i = 0; i < 3; i++) { const p = (this.t * 0.6 + i / 3) % 1; D.circle(ctx, x - 6 + i * 6 + Math.sin(p * 6) * 3, y - 34 - p * 30, 4 + p * 4, `rgba(255,255,255,${0.6 - p * 0.6})`); }
    D.ellipse(ctx, x, y - 2, 10, 3, '#ff8a3a');
  };
  CK.DecoDraw.fy_ferry = function (ctx, e, x, y) {
    const bob = Math.sin(this.t * 1.5) * 2;
    D.ellipse(ctx, x, y + 6, 70, 10, 'rgba(20,60,90,0.25)');
    ctx.save(); ctx.translate(0, bob);
    D.box3(ctx, x - 60, y - 22, 120, 22, 14, { r: 6, lw: 3, fill: '#d9a66b', flute: false });
    D.rr(ctx, x - 30, y - 52, 60, 30, 4); ctx.fillStyle = '#fff4dc'; ctx.fill(); stroke(ctx, 2.5);
    D.poly(ctx, [x - 36, y - 52, x, y - 68, x + 36, y - 52], '#ef6b6b', C.ink, 2.5);
    D.circle(ctx, x - 14, y - 38, 6, '#bfe6ff', C.ink, 1.6); D.circle(ctx, x + 14, y - 38, 6, '#bfe6ff', C.ink, 1.6);
    D.text(ctx, 'MALLOW', x, y - 6, { size: 10, weight: 700, align: 'center', color: '#5b3a1e' });
    ctx.restore();
  };
  // the old steep stairs, then the switchback ramp with landings and a handrail
  CK.DecoDraw.fy_stairs = function (ctx, e, x, y) {
    for (let i = 0; i < 7; i++) D.box3(ctx, x - 40, y + 96 - i * 20, 80, 12, 8, { r: 1, lw: 2, fill: i % 2 ? '#c99561' : '#d9a66b', flute: false });
    D.cardboard(ctx, x - 52, y - 40, 104, 22, { r: 3, lw: 2.5, fill: '#fff4dc', flute: false });
    D.text(ctx, 'STEEP STAIRS', x, y - 25, { size: 11, weight: 700, align: 'center', color: '#c2410c' });
  };
  CK.DecoDraw.fy_ramp = function (ctx, e, x, y) {
    const segs = [[-60, 110, 50, 80], [50, 80, -60, 50], [-60, 50, 50, 20], [50, 20, -10, -4]];
    for (const [x1, y1, x2, y2] of segs) {
      ctx.beginPath(); ctx.moveTo(x + x1, y + y1); ctx.lineTo(x + x2, y + y2); ctx.lineCap = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 22; ctx.stroke(); ctx.strokeStyle = '#e8c48c'; ctx.lineWidth = 17; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + x1, y + y1 - 12); ctx.lineTo(x + x2, y + y2 - 12); ctx.strokeStyle = '#6cc56c'; ctx.lineWidth = 3; ctx.stroke();
    }
    for (const [lx, ly] of [[50, 80], [-60, 50], [50, 20]]) D.ellipse(ctx, x + lx, y + ly, 16, 9, '#f6e2b0', C.ink, 2);
    for (let i = 0; i < 5; i++) D.circle(ctx, x - 70 + i * 32, y + 120, 3, ['#ff9ec7', '#ffd25a', '#fff', '#a68be6', '#ff9ec7'][i]);
  };

  // ================================================================ TRAVEL
  const baseTravel = CK.travelChoice;
  CK.travelChoice = function (text) {
    const c = baseTravel(text);
    if (open() && CK.G.chapter !== 'ferryyard') c.choice.options.splice(c.choice.options.length - 1, 0, { label: f('ferryyard_arrived') ? 'Tin-Lid Ferryyard' : 'Tin-Lid Ferryyard (new!)', then: [{ chapter: 'ferryyard', label: 'Tin-Lid Ferryyard' }] });
    return c;
  };

  // ================================================================ SCRIPTS
  const rebuild = { fn: () => { if (CK.OW) CK.OW.buildEntities(); } };
  S.ferryyard_intro = [
    { card: { title: 'Chapter 11', sub: 'The Ferryyard' } },
    { narrate: 'Downriver from the Fair, past the last signpost, a ferry with a red roof is waiting at a dock that isn\'t on any map.' },
    ['pip', 'I have checked the Royal Map four times. There is nothing here. And yet: here.', 'shock'],
    ['corry', 'A town on stilts! Over the water! Like herons, but houses.', 'happy'],
    { narrate: 'Every front door has the same red stamp on it. DENIED.' },
  ];
  S.fy_mallow_meet = [
    ['mallow', '...Hello. Ferry\'s free. Spoons are extra.', 'happy'],
    ['sam', 'Spoons?', 'shock'],
    ['mallow', 'I collect souvenir spoons. From everywhere. They are all terrible. This one is from the Fair. It says "I SURVIVED THE GORGE" and the bowl is on backwards.', 'happy'],
    ['corry', 'Madam... sir... ferry-person. You are one of the monster folk. From the spring raids.', 'shock'],
    ['mallow', 'Mm. The Brinemarsh flooded, years ago. Some of us went to Captain Bess. Some of us came here, where the river is kind. We built on stilts. We\'re good at water.', 'happy'],
    ['mallow', 'But a machine came down the river last week. A Society thing. It stamps every door, and then the Kingdom says our houses don\'t count.', 'sad'],
    ['mallow', 'Grandpa Wick can\'t get up to the road anymore, either. The old ramp washed out. There\'s only the stairs.', 'sad'],
    { flag: 'fy_mallow' },
    { journal: 'Met Mallow, a horned ferryperson from the Brinemarsh who collects terrible souvenir spoons. The Ferryyard isn\'t on any map, and a Society machine is stamping DENIED on every door.' },
  ];
  function mallowTalk() {
    if (!f('fy_mallow')) return 'fy_mallow_meet';
    if (!f('fy_engine')) return [['mallow', 'The machine is by the yellow and green houses. Mind its arm. It stamps hard.', 'sad']];
    if (!f('fy_ramp')) return [['mallow', 'My cart has wheels this big, and Wick\'s chair has wheels about that big. Neither of them likes stairs. Stairs are for legs.', 'happy']];
    return [U.pick([
      ['mallow', 'New spoon. It says "THE FERRYYARD (IT\'S ON THE MAP NOW)". I had it made. It is the worst one yet. I love it.', 'happy'],
      ['mallow', 'I take the ferry up to the Fair on Sundays now. Up the ramp. Wick comes too. He heckles the band.', 'happy'],
    ])];
  }
  function wickTalk() {
    if (!f('fy_ramp')) return [['wick', 'Seventy years I\'ve lived on this beach. Thirty I\'ve been rolling. Haven\'t seen the high road since the ramp went. Folks keep building me stairs. Kind of them. Useless, but kind.', 'sad']];
    return [U.pick([
      ['wick', 'Went up to the road this morning! Saw a hedgehog. Told him his hat was crooked. Best day in years.', 'happy'],
      ['wick', 'You asked me where I needed to go before you drew a single line. That\'s rarer than you\'d think, young engineer.', 'happy'],
    ])];
  }
  S.fy_engine_meet = [
    { narrate: 'A tall white machine is rolling from door to door. THUNK. "DENIED." THUNK. "DENIED."' },
    ['engine', 'PROPERTY NOT ON APPROVED MAP. HOUSING DOES NOT MEET STANDARD SEVENTEEN-B. DENIED.', 'angry'],
    ['sam', 'Standard seventeen-B?', 'shock'],
    ['engine', 'HOUSES MUST BE BUILT ON THE GROUND. THESE ARE ON STICKS. DENIED. DENIED. DENIED.', 'angry'],
    ['pip', 'They\'re on stilts because it FLOODS! That\'s the whole point!', 'angry'],
    ['corry', 'Builder, it is about to stamp the cat.', 'shock'],
    { battle: 'fy_engine' },
    { narrate: 'The Approval Engine shudders, coughs out a last DENIED, and sits down in the sand with a clunk.' },
    { flag: 'fy_engine' },
    rebuild,
    { narrate: 'Somebody up on the road drops an armful of rolled-up maps and says a very quiet "oh no."' },
    { journal: 'Stopped the Approval Engine, a Society machine stamping DENIED on the Ferryyard\'s stilt houses because they weren\'t "built on the ground."' },
  ];

  function ibisTalk() {
    if (!f('fy_records')) return 'fy_ibis';
    if (!f('fy_ramp')) return [['ibis', 'The ramp. Please. I can\'t un-draw the line I drew. But I can watch you draw a better one.', 'sad']];
    return [U.pick([
      ['ibis', 'The new map has the Ferryyard on it. In ink. I pressed so hard I went through the paper. Then I did it again on a new sheet.', 'happy'],
      ['ibis', 'I\'ve started an archive of things the Society got wrong. It\'s a big archive. It\'s mostly me.', 'happy'],
    ])];
  }
  S.fy_ibis = [
    ['ibis', 'I\'m sorry. I\'m so sorry. I should have come sooner. My name is Ibis. I was the Silver Quill\'s archivist.', 'sad'],
    ['corry', 'A Quill agent! Stand back, Builder!', 'angry'],
    ['ibis', 'Archivist! I don\'t peck. I file. ...I filed the wrong things.', 'sad'],
    ['ibis', 'Twenty years ago Magister Corvin asked me to draw the "Approved Neighborhoods" map. Places worth protecting. I left the Ferryyard off it, because the houses were on stilts and the rules said houses go on the ground.', 'sad'],
    ['ibis', 'And then, when the floods came, the Society sent the extra water wherever the map was blank.', 'sad'],
    ['sam', '...Here.', 'shock'],
    ['ibis', 'I kept both maps. Theirs, and the real one I made at night. Will you look? I need someone else to see it.', 'sad'],
    { await: () => show(new RecordsScene()) },
    { if: () => !f('fy_records'), then: [['ibis', 'Take your time. I\'ve had twenty years. You can have a minute.', 'sad']] },
    ['ibis', 'Three channels, all pointed at the one place with no name on the map.', 'sad'],
    ['mallow', '...We always wondered why the river was kind upstream and cruel here.', 'sad'],
    ['ibis', 'I can\'t make it not have happened. But I can draw the Ferryyard on the map tonight. And the first thing on it should be a way up that everyone can use.', 'happy'],
    ['sam', 'Then let\'s ask the people who\'ll use it.', 'happy'],
    { journal: 'Ibis, the Silver Quill\'s old archivist, drew the "Approved" map that left the Ferryyard off. The Society sent floodwater wherever the map was blank. She kept the real map. We compared them.' },
    { save: true },
  ];

  function rampSite() {
    if (!f('fy_records')) return [{ narrate: 'Seven steep cardboard steps from the beach to the road. Fine for legs. Hopeless for wheels.' }];
    if (f('fy_ramp')) return [{ narrate: 'The switchback ramp: gentle slopes, a landing after every two, a handrail, and flowers Brindle insisted on.' }];
    return [
      ['wick', 'Before you draw anything: my chair\'s wheels are this big, I need a rest every little while, and I don\'t do steep. Mallow\'s cart is the same, but heavier.', 'happy'],
      ['sam', 'Gentle slopes. Rest landings. No stairs. Got it.', 'happy'],
      { await: () => show(new RampScene()) },
      { if: () => !f('fy_ramp'), then: [['pip', 'We can try again any time. The blueprint is right here.', 'happy']] },
      rebuild,
      { narrate: 'Mallow ferries cardboard across all afternoon. Brindle turns up with a toolbox and very strong opinions about handrails. By evening there is a ramp.' },
      ['wick', 'Well. Would you look at that. A way up that goes where I\'m going.', 'happy'],
      { journal: 'Built the Ferryyard a switchback ramp from the dock to the high road: gentle slopes, a landing after every two, no stairs. Asked Grandpa Wick first.' },
      { save: true },
    ];
  }

  S.fy_finale = [
    { night: true, label: 'Evening at the Ferryyard...' },
    { narrate: 'The whole Ferryyard gathers around the cooking pot. Somebody has made soup out of whatever was in everybody\'s cupboards. It is, against all odds, delicious.' },
    ['ibis', 'I brought the new map. Would someone... would you all like to see it?', 'sad'],
    { narrate: 'There it is, in fresh ink, between the Gorge and the sea: TIN-LID FERRYYARD. Every house has a number. Every house is on stilts.' },
    ['mallow', '...We\'re on the map.', 'happy'],
    ['wick', 'About time. Pass the soup.', 'happy'],
    ['ibis', 'And I fixed the Approval Engine. It still stamps. It just stamps something different now.', 'happy'],
    { narrate: 'THUNK. Every door in the Ferryyard gets a fresh green stamp: WELCOME.' },
    ['mallow', 'Builder. For you. My best terrible spoon.', 'happy'],
    { narrate: 'It is shaped like a tiny ramp. The bowl is on backwards. It is perfect.' },
    ['sam', 'I didn\'t do it on my own. Wick told us what he needed. Ibis had the real map. You had the cardboard.', 'happy'],
    ['corry', 'Then I proclaim it in the Ledger: a Great Deed, done by everyone, starting with listening.', 'happy'],
    ['pip', 'Rule Nine!', 'happy'],
    ['sam', 'Rule Nine: ask who needs to use it.', 'happy'],
    { flag: 'fy_done' },
    { journal: 'Rule Nine: ask who needs to use it. The Ferryyard is on the map now. Mallow gave me a terrible spoon shaped like a ramp. The bowl is on backwards.' },
    rebuild,
    { save: true },
  ];
  S.fy_knock_a = [['duck', 'The stamp said DENIED. My grandmother said "denied by who?" and made tea. We\'re a tea family.', 'happy'], { scraps: 6 }];
  S.fy_knock_b = [['mouse', 'Mallow ferried my whole piano across. On a ferry. In a storm. Mallow is the strongest person I know, and also the gentlest.', 'happy'], { snacks: 1 }];
  S.fy_knock_c = [['bear', 'The stilts? My father built them, after the Brinemarsh. Higher every year. Water comes, water goes, we stay dry.', 'happy'], { scraps: 6 }];
  S.fy_knock_d = [['hedgehog', 'Shh. I\'m teaching the cat to swim. It is not going well. Here, take these scraps, I need both hands for the cat.', 'happy'], { scraps: 8 }];

  // postcards: the Ferryyard joins the wall in Patchwork Hall
  if (CK.Postcards) CK.Postcards.push({ id: 'ramp', ch: 'ferryyard', at: [20, 11], undo: ['fy_ramp', 'fy_done'], need: 'fy_ramp', title: 'Tin-Lid Ferryyard', caption: 'Steep stairs became a switchback ramp with landings. Grandpa Wick can reach the road again.' });

  // ================================================================ THE ARCHIVE: compare two maps
  // Ibis's two maps of the river, side by side. Find the three places the real one differs.
  const SPOTS = [
    { x: 0.32, y: 0.3, real: true, label: 'A culvert that the official map shows open is blocked with silver-sealed boards.' },
    { x: 0.62, y: 0.52, real: true, label: 'A sluice gate marked "closed" is wedged open, toward the Ferryyard.' },
    { x: 0.5, y: 0.8, real: true, label: 'The official map is blank here. The real one: a whole town on stilts.' },
    { x: 0.2, y: 0.72, real: false, label: 'Same on both: the Fair grounds.' },
    { x: 0.8, y: 0.2, real: false, label: 'Same on both: the Great Gorge and the Long Bridge.' },
    { x: 0.82, y: 0.78, real: false, label: 'Same on both: the sea.' },
  ];
  class RecordsScene {
    constructor() { this.t = 0; this.sel = 0; this.found = {}; this.msg = 'Look closely. Where is the real map different?'; this.finished = false; this.done = 0; }
    enter() { CK.Audio.sfx('whoosh'); if (CK.autoSkip) { CK.setFlag('fy_records'); this.close(); } }
    close() { this.finished = true; CK.Scenes.remove(this); }
    rect(i, side) { const [x0, y0] = side ? [500, 90] : [40, 90]; return [x0 + SPOTS[i].x * 420 - 26, y0 + SPOTS[i].y * 300 - 26, 52, 52]; }
    update(dt) {
      this.t += dt;
      if (this.done) { this.done += dt; if (this.done > 1.6 && (Input.hit('ok') || Input.mouse.pressed)) this.close(); return; }
      const n = SPOTS.length;
      if (Input.hit('left') || Input.hit('up')) { this.sel = (this.sel + n - 1) % n; CK.Audio.sfx('blip'); }
      if (Input.hit('right') || Input.hit('down')) { this.sel = (this.sel + 1) % n; CK.Audio.sfx('blip'); }
      let pick = Input.hit('ok') ? this.sel : -1;
      for (let i = 0; i < n; i++) for (const side of [0, 1]) {
        const r = this.rect(i, side);
        if (Input.mouse.moved && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) this.sel = i;
        if (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) pick = i;
      }
      if (Input.hit('back')) { this.close(); return; }
      if (pick < 0) return;
      const sp = SPOTS[pick];
      this.msg = sp.label;
      if (sp.real && !this.found[pick]) { this.found[pick] = true; CK.Audio.sfx('perfect'); }
      else if (!sp.real) CK.Audio.sfx('error');
      if (SPOTS.filter((s, i) => s.real && this.found[i]).length === 3) { this.done = 0.01; CK.setFlag('fy_records'); CK.Audio.sfx('win'); this.msg = 'All three. Every diverted channel pointed at the one place with no name.'; }
    }
    drawMap(ctx, x0, y0, real) {
      D.rr(ctx, x0 - 8, y0 - 8, 436, 316, 6); ctx.fillStyle = real ? '#f3e6c8' : '#fbfcff'; ctx.fill(); stroke(ctx, 2.5);
      const X = (u) => x0 + u * 420, Y = (v) => y0 + v * 300;
      // the river, from the top right down to the sea
      ctx.beginPath(); ctx.moveTo(X(0.95), Y(0)); ctx.bezierCurveTo(X(0.7), Y(0.3), X(0.3), Y(0.4), X(0.45), Y(0.65)); ctx.bezierCurveTo(X(0.55), Y(0.85), X(0.75), Y(0.85), X(1), Y(0.9));
      ctx.strokeStyle = '#7fc8e8'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.stroke();
      // the gorge + bridge, the fair, the sea
      D.rr(ctx, X(0.72), Y(0.12), 60, 22, 4); ctx.fillStyle = '#c9a77a'; ctx.fill(); stroke(ctx, 1.5); D.line(ctx, X(0.72), Y(0.17), X(0.86), Y(0.17), C.ink, 2);
      for (let i = 0; i < 3; i++) D.poly(ctx, [X(0.15) + i * 14, Y(0.72), X(0.15) + i * 14 + 7, Y(0.64), X(0.15) + i * 14 + 14, Y(0.72)], ['#ef6b6b', '#5aa9e6', '#ffd25a'][i], C.ink, 1.2);
      ctx.fillStyle = 'rgba(90,170,230,0.35)'; ctx.fillRect(X(0.7), Y(0.86), 126, 42);
      // culvert: open (official) vs boarded (real)
      D.circle(ctx, X(0.32), Y(0.3), 9, '#fff', C.ink, 2);
      if (real) { D.line(ctx, X(0.32) - 9, Y(0.3) - 6, X(0.32) + 9, Y(0.3) + 6, '#8a93a3', 4); D.line(ctx, X(0.32) - 9, Y(0.3) + 6, X(0.32) + 9, Y(0.3) - 6, '#8a93a3', 4); }
      // sluice gate: closed (official) vs open toward the Ferryyard (real)
      D.rr(ctx, X(0.62) - 12, Y(0.52) - 5, 24, 10, 2); ctx.fillStyle = '#c9d3e0'; ctx.fill(); stroke(ctx, 1.5);
      if (real) { ctx.beginPath(); ctx.moveTo(X(0.62), Y(0.56)); ctx.quadraticCurveTo(X(0.58), Y(0.7), X(0.5), Y(0.76)); ctx.strokeStyle = '#3a8fd6'; ctx.lineWidth = 4; ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]); }
      // the Ferryyard: blank (official) vs stilt houses (real)
      if (real) for (let i = 0; i < 4; i++) { const hx = X(0.42) + i * 18, hy = Y(0.8); D.line(ctx, hx, hy, hx, hy + 10, '#8a5a2e', 2); D.rr(ctx, hx - 6, hy - 10, 12, 10, 2); ctx.fillStyle = ['#5aa9e6', '#ff8fb1', '#ffd25a', '#6cc56c'][i]; ctx.fill(); stroke(ctx, 1.2); }
      else { ctx.setLineDash([3, 4]); D.rr(ctx, X(0.4), Y(0.74), 80, 30, 4); stroke(ctx, 1.2, 'rgba(60,60,80,0.4)'); ctx.setLineDash([]); }
      D.text(ctx, real ? 'IBIS\'S REAL SURVEY (by lamplight)' : 'OFFICIAL: APPROVED NEIGHBORHOODS', x0 + 210, y0 - 16, { size: 13, weight: 700, align: 'center', color: real ? '#3e7a5a' : '#8a93a3' });
      if (!real) { ctx.save(); ctx.translate(X(0.8), Y(0.42)); ctx.rotate(-0.2); D.rr(ctx, -44, -14, 88, 28, 4); stroke(ctx, 2.5, 'rgba(210,58,58,0.6)'); D.text(ctx, 'APPROVED', 0, 6, { size: 14, weight: 700, align: 'center', color: 'rgba(210,58,58,0.6)' }); ctx.restore(); }
    }
    draw(ctx) {
      ctx.fillStyle = '#3a2a1c'; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < W; i += 40) D.line(ctx, i, 0, i, H, 'rgba(255,255,255,0.03)', 20);
      D.text(ctx, 'The Archive: find where the real map is different (3)', W / 2, 40, { size: 20, weight: 700, align: 'center', color: '#fff4dc' });
      this.drawMap(ctx, 40, 90, false);
      this.drawMap(ctx, 500, 90, true);
      SPOTS.forEach((s, i) => {
        for (const side of [0, 1]) {
          const [x, y, w] = this.rect(i, side);
          if (this.found[i]) { D.circle(ctx, x + w / 2, y + w / 2, 24, null, '#6cc56c', 4); }
          else if (i === this.sel) { D.circle(ctx, x + w / 2, y + w / 2, 24 + Math.sin(this.t * 6) * 2, null, '#ffd25a', 3); }
        }
      });
      D.panel(ctx, 120, 418, 720, 92, { fill: '#fffaf0', tape: false });
      D.portrait(ctx, 'ibis', 136, 400, this.done ? 'happy' : 'sad');
      D.wrap(ctx, this.msg, 560, 16, 600).forEach((l, i) => D.text(ctx, l, 262, 452 + i * 22, { size: 16, weight: 600, color: '#3d2412' }));
      D.text(ctx, this.done ? 'Z / click to continue' : 'Arrows: move · Z / click: "that\'s different!"', W / 2, H - 8, { size: 12, weight: 600, align: 'center', color: '#e8d4b8' });
    }
  }
  CK.RecordsScene = RecordsScene;

  // ================================================================ THE RAMP: an accessible route
  // A side view from the dock (left, height 0) up to the road (right, height 4). Fill eight slots.
  // Gentle ramps climb 1, steep ramps and stairs climb 2, landings are flat. Wheels can't do stairs
  // or steep ramps, and nobody should do more than two ramps in a row without a landing to rest.
  const PIECES = {
    gentle: { name: 'Gentle ramp', rise: 1, cost: 3, col: '#e8c48c', fact: 'Real ramps for wheelchairs are very gentle: about 1 step up for every 12 along.' },
    landing: { name: 'Landing', rise: 0, cost: 2, col: '#f6e2b0', fact: 'Landings are flat resting spots, at the top, the bottom, and every so often on the way.' },
    steep: { name: 'Steep ramp', rise: 2, cost: 2, col: '#d9a66b', fact: 'Cheaper and shorter, but a heavy cart rolls back down it.' },
    stairs: { name: 'Stairs', rise: 2, cost: 1, col: '#c99561', fact: 'Fine for legs. Useless for wheels.' },
  };
  const KINDS = Object.keys(PIECES);
  const SLOTS = 8, GOAL = 4, BUDGET = 22;
  class RampScene {
    constructor() { this.t = 0; this.slots = new Array(SLOTS).fill(null); this.sel = 0; this.pick = 0; this.state = 'build'; this.fails = 0; this.msg = ''; this.finished = false; this.solved = false; this.cart = 0; }
    enter() { CK.Audio.sfx('whoosh'); if (CK.autoSkip) { this.applySolution(); this.win(); this.close(); } }
    close() { this.finished = true; CK.Scenes.remove(this); }
    applySolution() { this.slots = ['gentle', 'gentle', 'landing', 'gentle', 'gentle', 'landing', 'landing', 'landing']; }
    cost() { return this.slots.reduce((a, k) => a + (k ? PIECES[k].cost : 0), 0); }
    heights() { const h = [0]; for (const k of this.slots) h.push(h[h.length - 1] + (k ? PIECES[k].rise : 0)); return h; }
    check() {
      if (this.slots.some((k) => !k)) return { ok: false, at: this.slots.indexOf(null), msg: 'There\'s a gap in the route. Fill every slot (a landing is fine).' };
      const bad = this.slots.findIndex((k) => k === 'stairs' || k === 'steep');
      if (bad >= 0) return { ok: false, at: bad, msg: this.slots[bad] === 'stairs' ? 'Wick\'s wheels hit the stairs. Thunk. Stairs are for legs.' : 'Mallow\'s cart rolls straight back down the steep bit. Too steep for wheels.' };
      let run = 0;
      for (let i = 0; i < SLOTS; i++) { run = this.slots[i] === 'gentle' ? run + 1 : 0; if (run > 2) return { ok: false, at: i, msg: 'Three ramps in a row with nowhere to rest. Wick needs a landing every two ramps.' }; }
      const top = this.heights()[SLOTS];
      if (top !== GOAL) return { ok: false, at: SLOTS - 1, msg: top < GOAL ? 'The route stops short of the road.' : 'The route sails past the road. Too high!' };
      if (this.cost() > BUDGET) return { ok: false, at: SLOTS - 1, msg: `Over budget: ${this.cost()} of ${BUDGET} scraps.` };
      return { ok: true };
    }
    win() { this.solved = true; CK.setFlag('fy_ramp'); }
    update(dt) {
      this.t += dt;
      if (this.state === 'test') {
        this.cart = Math.min(this.target, this.cart + dt * 1.6);
        if (this.cart >= this.target) {
          this.state = 'result';
          if (this.result.ok) { this.win(); CK.Audio.sfx('win'); this.msg = 'Wick rolls all the way up, stopping at each landing to wave. Nobody had to carry anybody.'; }
          else { this.fails++; CK.Audio.sfx('lose'); this.msg = this.result.msg; }
        }
        return;
      }
      if (this.state === 'result') {
        if (Input.hit('ok') || Input.mouse.pressed || Input.hit('back')) {
          if (this.solved) { this.close(); return; }
          this.state = 'build'; this.cart = 0;
        }
        return;
      }
      if (Input.hit('left')) { this.sel = (this.sel + SLOTS - 1) % SLOTS; CK.Audio.sfx('blip'); }
      if (Input.hit('right')) { this.sel = (this.sel + 1) % SLOTS; CK.Audio.sfx('blip'); }
      if (Input.hit('up')) { this.pick = (this.pick + KINDS.length - 1) % KINDS.length; CK.Audio.sfx('blip'); }
      if (Input.hit('down')) { this.pick = (this.pick + 1) % KINDS.length; CK.Audio.sfx('blip'); }
      let place = Input.hit('ok');
      for (let i = 0; i < SLOTS; i++) if (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...this.slotRect(i))) { this.sel = i; place = true; }
      KINDS.forEach((k, i) => { if (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...this.pieceRect(i))) { this.pick = i; CK.Audio.sfx('select'); } });
      if (place) { this.slots[this.sel] = KINDS[this.pick]; this.sel = Math.min(SLOTS - 1, this.sel + 1); CK.Audio.sfx('tape'); }
      if (Input.key('KeyC') || Input.key('Delete')) this.slots[this.sel] = null;
      const btn = (r) => Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...r);
      if (Input.key('KeyT') || btn([680, 470, 120, 40])) this.test();
      if ((Input.key('KeyH') || btn([540, 470, 130, 40])) && this.fails >= 1) { this.applySolution(); CK.Audio.sfx('magic'); this.msg = 'Grandma\'s blueprint: ramp, ramp, rest. Ramp, ramp, rest. Then flat to the road.'; }
      if (Input.hit('back') || btn([820, 470, 110, 40])) this.close();
    }
    test() {
      this.result = this.check();
      this.state = 'test'; this.cart = 0;
      this.target = this.result.ok ? SLOTS : Math.max(0.5, (this.result.at || 0) + 0.6);
      CK.Audio.sfx('select');
    }
    slotRect(i) { return [120 + i * 90, 390, 84, 30]; }
    pieceRect(i) { return [20 + i * 128, 470, 122, 40]; }
    draw(ctx) {
      // sky and river, the dock on the left, the road on the right
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8fdcff'); g.addColorStop(1, '#ffe6c8');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      D.text(ctx, 'Blueprint: a way up from the dock', W / 2, 34, { size: 22, weight: 700, align: 'center' });
      D.text(ctx, `Reach the road (${GOAL} up) in ${SLOTS} pieces. No stairs or steep bits. A landing after every 2 ramps. Budget ${BUDGET}.`, W / 2, 58, { size: 13, weight: 600, align: 'center', color: '#5b3a1e' });
      const base = 340, step = 48, x0 = 120, sw = 90;
      ctx.fillStyle = '#47cde6'; ctx.fillRect(0, base + 8, W, 40);
      D.box3(ctx, 20, base - 6, 100, 14, 10, { r: 2, lw: 2.5, fill: '#a97c4c', flute: false });
      D.text(ctx, 'DOCK', 70, base + 30, { size: 12, weight: 700, align: 'center', color: '#fff' });
      D.box3(ctx, x0 + SLOTS * sw, base - GOAL * step - 6, 120, GOAL * step + 6, 12, { r: 2, lw: 2.5, fill: '#a8dc7c', flute: false });
      D.text(ctx, 'THE ROAD', x0 + SLOTS * sw + 58, base - GOAL * step - 16, { size: 12, weight: 700, align: 'center', color: '#3e7a5a' });
      for (let k = 1; k <= GOAL; k++) D.line(ctx, x0, base - k * step, x0 + SLOTS * sw, base - k * step, 'rgba(255,255,255,0.45)', 1);
      const hs = this.heights();
      for (let i = 0; i < SLOTS; i++) {
        const k = this.slots[i], xa = x0 + i * sw, ya = base - hs[i] * step, yb = base - hs[i + 1] * step;
        if (k) {
          ctx.beginPath(); ctx.moveTo(xa, ya);
          if (k === 'stairs') { const n = 4; for (let j = 0; j < n; j++) { ctx.lineTo(xa + (j + 0.5) * sw / n, ya - (j) * (ya - yb) / n); ctx.lineTo(xa + (j + 0.5) * sw / n, ya - (j + 1) * (ya - yb) / n); } ctx.lineTo(xa + sw, yb); }
          else ctx.lineTo(xa + sw, yb);
          ctx.lineTo(xa + sw, base); ctx.lineTo(xa, base); ctx.closePath();
          ctx.fillStyle = PIECES[k].col; ctx.fill(); stroke(ctx, 2.5);
          if (k === 'gentle' || k === 'landing') D.line(ctx, xa, ya - 16, xa + sw, yb - 16, '#6cc56c', 3);
        } else { ctx.setLineDash([5, 5]); D.rr(ctx, xa + 4, base - 20, sw - 8, 20, 3); stroke(ctx, 1.5, 'rgba(60,40,20,0.4)'); ctx.setLineDash([]); }
        const [rx, ry, rw, rh] = this.slotRect(i);
        D.rr(ctx, rx, ry, rw, rh, 6); ctx.fillStyle = i === this.sel && this.state === 'build' ? '#fff0b8' : '#fffaf0'; ctx.fill(); stroke(ctx, i === this.sel ? 2.5 : 1.2);
        D.text(ctx, k ? PIECES[k].name : '(empty)', rx + rw / 2, ry + 20, { size: 11, weight: 700, align: 'center', color: k ? '#3d2412' : '#9a7a5a' });
      }
      // Wick and Mallow, rolling up the route during a test
      const c = this.cart, ci = Math.min(SLOTS - 1, Math.floor(c)), fr = c - ci;
      const cx = x0 + c * sw, cy = base - (hs[ci] + (hs[ci + 1] - hs[ci]) * Math.min(1, fr)) * step;
      D.char(ctx, 'wick', cx + 14, cy, { s: 1.0, mood: this.state === 'result' && !this.solved ? 'sad' : 'happy', dir: 'right' });
      D.char(ctx, 'mallow', cx - 18, cy, { s: 0.75, dir: 'right', mood: 'happy' });
      // pieces palette and buttons
      KINDS.forEach((k, i) => {
        const [x, y, w, h] = this.pieceRect(i);
        D.button(ctx, x, y, w, h, `${PIECES[k].name} (${PIECES[k].cost})`, { hover: i === this.pick, size: 12 });
      });
      D.button(ctx, 540, 470, 130, 40, 'Blueprint (H)', { size: 13, disabled: this.fails < 1 });
      D.button(ctx, 680, 470, 120, 40, 'Test it! (T)', { size: 14 });
      D.button(ctx, 820, 470, 110, 40, 'Leave', { size: 14 });
      const cost = this.cost();
      D.text(ctx, `Scraps: ${cost} / ${BUDGET}`, 20, 455, { size: 13, weight: 700, color: cost > BUDGET ? '#d23a3a' : '#3d2412' });
      D.text(ctx, PIECES[KINDS[this.pick]].fact, 160, 455, { size: 12, weight: 600, color: '#5b3a1e' });
      if (this.state === 'result' || this.msg) {
        D.panel(ctx, 220, 82, 520, 70, { fill: this.solved ? '#e8f8e0' : '#fffaf0', tape: false });
        D.wrap(ctx, this.msg || '', 480, 15, 600).forEach((l, i) => D.text(ctx, l, 480, 110 + i * 20, { size: 15, weight: 600, align: 'center', color: this.solved ? '#2f6a3a' : '#3d2412' }));
      }
      D.text(ctx, 'Left/Right: slot · Up/Down: piece · Z: place · C: clear · T: test', W / 2, H - 6, { size: 11, weight: 600, align: 'center', color: '#5b3a1e' });
    }
  }
  CK.RampScene = RampScene;
})();
