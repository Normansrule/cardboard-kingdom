// Cardboard Kingdom - The Kingdom Post: Battle Stamps, Postmistress Pell and the Lost Letters.
//  * Battle Stamps (Costume Quest style): each friend wears one stamp that changes how they fight.
//    Change them in Pause -> Stamps & Letters.
//  * Postmistress Pell, the Kingdom's only post-bird since 1971, stands near the start of every
//    Kingdom map. This year's storms burst her dead-letter bag: fifty years of letters nobody could
//    deliver, now lying wherever the water went down.
//  * Lost Letters: one per place, turning up once that place is saved. Bring each to whoever it's
//    for. Every delivered letter earns a stamp, and when all eight are home, Pell has one more.
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
  const PARA = '|'; // paragraph break inside a letter's text

  // ================================================================ PELL
  // A big white pelican in a navy postal cap, with a red satchel and a beak pouch full of mail.
  CH.pelican = function (ctx, x, y, o) {
    const s = o.s || 1;
    const mood = o.mood;
    const dir = o.dir || 'down';
    const side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const bob = Math.sin(CK.time * 2 + (o.seed || 0)) * 0.8 * s;
    for (const k of [-1, 1]) D.egg(ctx, x + k * 6 * s, y - 1.5 * s, 6.5 * s, 2.6 * s, '#f2a03a', { lw: 1.5 });
    D.line(ctx, x - 4 * s, y - 10 * s, x - 5 * s, y - 2 * s, '#e08a2a', 2.4 * s);
    D.line(ctx, x + 4 * s, y - 10 * s, x + 5 * s, y - 2 * s, '#e08a2a', 2.4 * s);
    // round white body, grey-tipped wings
    D.egg(ctx, x, y - 20 * s, 14 * s, 15 * s, '#f7f4ee', { lw: 2.2, k: 0.6 });
    for (const k of [-1, 1]) {
      D.egg(ctx, x + k * 13 * s, y - 20 * s, 5 * s, 11 * s, '#e6e2da', { rot: k * -0.25, lw: 1.6 });
      D.egg(ctx, x + k * 14.5 * s, y - 13 * s, 3 * s, 4 * s, '#8a8f99', { rot: k * -0.25, lw: 1.2 });
    }
    // satchel strap and the red mailbag on her hip, with letters peeking out
    D.line(ctx, x - 11 * s, y - 31 * s, x + 9 * s, y - 13 * s, '#9a2f2f', 3.2 * s);
    const bx = x + (side >= 0 ? 6 : -19) * s;
    for (let i = 0; i < 2; i++) { D.rr(ctx, bx + 2 * s + i * 4 * s, y - 20 * s - i * 1.5 * s, 7 * s, 6 * s, 1); ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 1); }
    D.rr(ctx, bx, y - 16 * s, 14 * s, 12 * s, 3 * s); ctx.fillStyle = D.lgx(ctx, bx, bx + 14 * s, '#d24a4a'); ctx.fill(); stroke(ctx, 1.8);
    D.rr(ctx, bx, y - 16 * s, 14 * s, 5 * s, 2 * s); ctx.fillStyle = '#b53a3a'; ctx.fill(); stroke(ctx, 1.4);
    D.circle(ctx, bx + 7 * s, y - 11 * s, 1.4 * s, '#ffd25a', C.ink, 0.8);
    // neck and head
    const hx = x + side * 2 * s, hy = y - 41 * s + bob;
    D.egg(ctx, x + side * 1 * s, y - 33 * s + bob * 0.5, 6.5 * s, 8 * s, '#f7f4ee', { lw: 0 });
    D.ball(ctx, hx, hy, 10.5 * s, '#f7f4ee', { lw: 2.2, k: 0.6 });
    if (dir !== 'up') {
      for (const k of [-1, 1]) {
        if (side && k === -side) continue;
        const ex = hx + side * 2 * s + k * 4.6 * s, ey = hy - 2 * s;
        if (mood === 'happy') { ctx.beginPath(); ctx.arc(ex, ey + 1 * s, 2 * s, Math.PI * 1.1, Math.PI * 1.9); stroke(ctx, 1.8); }
        else {
          D.circle(ctx, ex, ey, 1.9 * s, '#2b1a10');
          D.circle(ctx, ex + 0.6 * s, ey - 0.7 * s, 0.6 * s, '#fff');
        }
        if (mood === 'sad') D.line(ctx, ex - k * 2.6 * s, ey - 2.4 * s, ex + k * 2 * s, ey - 3.6 * s, C.ink, 1.3);
        if (mood === 'shock') D.line(ctx, ex - 2.2 * s, ey - 4 * s, ex + 2.2 * s, ey - 4.4 * s, C.ink, 1.3);
      }
      D.blush(ctx, hx + side * 2 * s, hy + 2.5 * s, 6.5 * s, 1.8 * s);
      // the long beak and its pouch (a corner of an envelope sticks out)
      if (side) {
        const b0 = hx + side * 7 * s;
        ctx.beginPath(); ctx.moveTo(b0, hy + 1 * s); ctx.quadraticCurveTo(b0 + side * 14 * s, hy + 16 * s, b0 + side * 22 * s, hy + 4 * s); ctx.lineTo(b0, hy + 5 * s); ctx.closePath();
        ctx.fillStyle = '#ffd9a8'; ctx.fill(); stroke(ctx, 1.4);
        D.poly(ctx, [b0, hy - 1 * s, b0 + side * 24 * s, hy + 3 * s, b0, hy + 3.5 * s], '#f2b04a', C.ink, 1.5);
        D.poly(ctx, [b0 + side * 8 * s, hy + 6 * s, b0 + side * 14 * s, hy + 5 * s, b0 + side * 12 * s, hy + 10 * s], '#fffaf0', C.ink, 1);
      } else {
        D.egg(ctx, hx, hy + 15 * s, 6 * s, 7.5 * s, '#ffd9a8', { lw: 1.4 });
        D.poly(ctx, [hx - 3 * s, hy + 13 * s, hx + 3.5 * s, hy + 12 * s, hx + 2 * s, hy + 17 * s], '#fffaf0', C.ink, 1);
        D.poly(ctx, [hx - 3.4 * s, hy + 2 * s, hx + 3.4 * s, hy + 2 * s, hx + 1 * s, hy + 18 * s, hx - 1 * s, hy + 18 * s], '#f2b04a', C.ink, 1.5);
        D.line(ctx, hx, hy + 3 * s, hx, hy + 16 * s, 'rgba(120,60,10,0.35)', 1);
      }
    }
    // navy postal cap with a peak and a gold envelope badge
    const cy = hy - 9 * s;
    D.egg(ctx, hx + side * 5 * s, cy + 2.5 * s, 8 * s, 2.2 * s, '#1f2a44', { lw: 1.4 });
    D.rr(ctx, hx - 8.5 * s, cy - 7 * s, 17 * s, 9 * s, 3 * s); ctx.fillStyle = D.lgx(ctx, hx - 9 * s, hx + 9 * s, '#2f3e66'); ctx.fill(); stroke(ctx, 1.8);
    D.line(ctx, hx - 8 * s, cy - 1 * s, hx + 8 * s, cy - 1 * s, '#c9333a', 1.6 * s);
    if (dir !== 'up') { D.rr(ctx, hx - 3 * s, cy - 5.5 * s, 6 * s, 4 * s, 0.6 * s); ctx.fillStyle = '#ffd25a'; ctx.fill(); stroke(ctx, 0.8); D.line(ctx, hx - 3 * s, cy - 5.5 * s, hx, cy - 3.2 * s, C.ink, 0.6); D.line(ctx, hx + 3 * s, cy - 5.5 * s, hx, cy - 3.2 * s, C.ink, 0.6); }
  };

  Data.speakers.pell = { name: 'Postmistress Pell', look: 'pelican', ps: 2.2, py: 18, bg: '#e2eaf8' };

  // ================================================================ STAMPS
  const STAMPS = {
    star: { name: 'Gold Star', col: '#ffd25a', desc: 'Every hit lands 15% harder.' },
    tape: { name: 'Tape Patch', col: '#ecc38c', desc: 'Mends 8% of max HP at the start of each of this friend\'s turns.' },
    padded: { name: 'Padded Envelope', col: '#f2a93b', desc: '+20% max HP.' },
    wax: { name: 'Wax Seal', col: '#ef6b6b', desc: 'Gets half as soaked by water attacks and rain.' },
    first: { name: 'First Class', col: '#a68be6', desc: 'Starts every battle with 2 special stars already charged.' },
    counter: { name: 'Return to Sender', col: '#5aa9e6', desc: 'A PERFECT block bounces a hit straight back at the attacker.' },
    care: { name: 'Care Package', col: '#6cc56c', desc: 'Juice boxes this friend gives heal 50% more and dry off the whole party.' },
    express: { name: 'Express Post', col: '#ff8fb1', desc: '30% chance that an attack strikes twice.' },
    bubble: { name: 'Bubble Wrap', col: '#9fd6ff', desc: 'The first hit this friend takes in each battle does nothing.' },
    approved: { name: 'APPROVED', col: '#9ccf6a', desc: 'Battles give 50% more scraps and XP. (One is enough.)' },
    next: { name: 'The Next Builder', col: '#ffc93c', desc: 'Once per battle, get back up at half health. Hits land 10% harder.' },
    // Neighbor Round thank-yous (neighbors.js)
    handle: { name: 'Handle with Care', col: '#e9b0d8', desc: 'Guarding blocks 75% instead of half, and dries this friend off.' },
    measure: { name: 'Measure Twice', col: '#7fc9c0', desc: 'Inspect finds a bigger weak spot: the next 3 hits on that foe land 70% harder.' },
    allhands: { name: 'All Hands', col: '#f7a35c', desc: 'Helping a friend gives them 2 special stars instead of 1.' },
    noone: { name: 'No One Left Behind', col: '#b4a0f0', desc: 'Helping a friend who is down brings them back at 60% health instead of 25%.' },
  };
  CK.StampData = STAMPS;
  const ORDER = Object.keys(STAMPS);

  function book() {
    const G = CK.G;
    if (!G.stamps) G.stamps = { owned: [], equip: {} };
    if (!G.letters) G.letters = { found: {}, delivered: {} };
    return G.stamps;
  }
  const letters = () => (book(), CK.G.letters);
  const stampOf = (id) => (CK.G && CK.G.stamps && CK.G.stamps.equip[id]) || null;
  CK.stampOf = stampOf;

  // Hand over a stamp, press it onto a friend who isn't wearing one, and show it off.
  CK.giveStamp = function (id, prefer) {
    const B = book();
    if (!B.owned.includes(id)) B.owned.push(id);
    let who = null;
    const worn = Object.values(B.equip);
    if (!worn.includes(id)) {
      const free = CK.G.party.find((m) => m.id === prefer && !B.equip[m.id]) || CK.G.party.find((m) => !B.equip[m.id]);
      if (free) { B.equip[free.id] = id; who = free.id; }
    }
    CK.healParty();
    return show(new StampReward(id, who));
  };
  function show(scene) {
    CK.Scenes.push(scene);
    return scene;
  }

  // ------------------------------------------------ stamp art
  function perfPath(ctx, x0, y0, w, h, r, n) {
    const sx = w / n, sy = h / n;
    ctx.beginPath(); ctx.moveTo(x0, y0);
    for (let i = 0; i < n; i++) { const cx = x0 + sx * (i + 0.5); ctx.lineTo(cx - r, y0); ctx.arc(cx, y0, r, Math.PI, 0, true); }
    ctx.lineTo(x0 + w, y0);
    for (let i = 0; i < n; i++) { const cy = y0 + sy * (i + 0.5); ctx.lineTo(x0 + w, cy - r); ctx.arc(x0 + w, cy, r, -Math.PI / 2, Math.PI / 2, true); }
    ctx.lineTo(x0 + w, y0 + h);
    for (let i = 0; i < n; i++) { const cx = x0 + w - sx * (i + 0.5); ctx.lineTo(cx + r, y0 + h); ctx.arc(cx, y0 + h, r, 0, Math.PI, true); }
    ctx.lineTo(x0, y0 + h);
    for (let i = 0; i < n; i++) { const cy = y0 + h - sy * (i + 0.5); ctx.lineTo(x0, cy + r); ctx.arc(x0, cy, r, Math.PI / 2, -Math.PI / 2, true); }
    ctx.closePath();
  }
  function envelope(ctx, x, y, w, h, col) {
    D.rr(ctx, x - w / 2, y - h / 2, w, h, 2); ctx.fillStyle = col || '#fffaf0'; ctx.fill(); stroke(ctx, 1.6);
    ctx.beginPath(); ctx.moveTo(x - w / 2 + 1, y - h / 2 + 1); ctx.lineTo(x, y + h * 0.12); ctx.lineTo(x + w / 2 - 1, y - h / 2 + 1); stroke(ctx, 1.4);
  }
  CK.drawEnvelope = envelope;
  const GLYPH = {
    star: (ctx) => D.star(ctx, 0, 1, 15, '#ffd25a', 5, 0),
    tape: (ctx) => {
      for (const a of [-0.6, 0.6]) { ctx.save(); ctx.rotate(a); D.rr(ctx, -17, -5, 34, 10, 2); ctx.fillStyle = 'rgba(243,230,184,0.95)'; ctx.fill(); stroke(ctx, 1.4); ctx.restore(); }
    },
    padded: (ctx) => { envelope(ctx, 0, 2, 32, 22, '#ffe2a8'); for (let i = -1; i <= 1; i++) D.line(ctx, -12, 6 + i * 4, 12, 6 + i * 4, 'rgba(160,100,30,0.35)', 1); },
    wax: (ctx) => {
      // a blob of sealing wax with a raindrop pressed into it
      D.ball(ctx, 0, 1, 13, '#d23a3a', { lw: 1.8 });
      ctx.beginPath(); ctx.moveTo(0, -7); ctx.quadraticCurveTo(7, 3, 0, 8); ctx.quadraticCurveTo(-7, 3, 0, -7); ctx.fillStyle = '#ffd9d0'; ctx.fill(); stroke(ctx, 1.2, '#8a1f1f');
    },
    first: (ctx) => { envelope(ctx, 0, 2, 32, 22); D.ball(ctx, 9, -6, 7, '#a68be6', { lw: 1.4 }); D.text(ctx, '1', 9, -1.5, { size: 11, weight: 700, align: 'center', color: '#fff' }); },
    counter: (ctx) => {
      ctx.beginPath(); ctx.arc(0, 2, 11, Math.PI * 0.9, Math.PI * 2.2); stroke(ctx, 4, '#2f6aa8');
      const a = Math.PI * 2.2, ax = Math.cos(a) * 11, ay = 2 + Math.sin(a) * 11;
      D.poly(ctx, [ax - 6, ay - 3, ax + 5, ay - 4, ax + 1, ay + 7], '#2f6aa8', C.ink, 1.2);
    },
    care: (ctx) => {
      D.rr(ctx, -9, -10, 18, 22, 3); ctx.fillStyle = '#ffffff'; ctx.fill(); stroke(ctx, 1.6);
      D.line(ctx, 4, -10, 9, -18, C.ink, 2);
      ctx.save(); ctx.translate(0, 2); ctx.beginPath(); ctx.moveTo(0, 5); ctx.bezierCurveTo(-8, -1, -4, -7, 0, -3); ctx.bezierCurveTo(4, -7, 8, -1, 0, 5); ctx.fillStyle = '#ef6b6b'; ctx.fill(); ctx.restore();
    },
    express: (ctx) => { D.poly(ctx, [-15, 2, 15, -10, -2, 12], '#fffaf0', C.ink, 1.6); D.poly(ctx, [-2, 12, 0, 3, 15, -10], '#e6e0ea', C.ink, 1.2); for (let i = 0; i < 3; i++) D.line(ctx, -18 - i * 2, 6 + i * 4, -11 - i * 2, 6 + i * 4, '#ffffff', 1.6); },
    bubble: (ctx) => { for (const [bx, by, r] of [[-6, 3, 8], [6, -4, 7], [7, 8, 5], [-4, -9, 4]]) { D.circle(ctx, bx, by, r, 'rgba(255,255,255,0.75)', C.ink, 1.3); D.circle(ctx, bx - r * 0.35, by - r * 0.35, r * 0.25, '#fff'); } },
    approved: (ctx) => { ctx.save(); ctx.rotate(-0.25); D.rr(ctx, -18, -8, 36, 16, 3); stroke(ctx, 2.2, '#c2410c'); D.text(ctx, 'OK!', 0, 5, { size: 13, weight: 700, align: 'center', color: '#c2410c' }); ctx.restore(); },
    handle: (ctx) => {
      // a FRAGILE wine glass, like the label on a parcel
      ctx.beginPath(); ctx.moveTo(-8, -14); ctx.lineTo(8, -14); ctx.quadraticCurveTo(8, 0, 0, 2); ctx.quadraticCurveTo(-8, 0, -8, -14); ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 1.6);
      D.line(ctx, 0, 2, 0, 12, C.ink, 2); D.line(ctx, -6, 13, 6, 13, C.ink, 2.2);
    },
    measure: (ctx) => {
      ctx.save(); ctx.rotate(-0.5); D.rr(ctx, -20, -6, 40, 12, 2); ctx.fillStyle = '#ffe9a0'; ctx.fill(); stroke(ctx, 1.6);
      for (let i = -16; i <= 16; i += 4) D.line(ctx, i, -6, i, i % 8 === 0 ? 1 : -2, C.ink, 1);
      ctx.restore();
    },
    allhands: (ctx) => { for (const [hx, col] of [[-9, '#ffd2a8'], [9, '#c98e62'], [0, '#f2c9a0']]) D.ball(ctx, hx, hx ? 2 : -6, 8, col, { lw: 1.5 }); D.line(ctx, -16, 12, 16, 12, C.ink, 2); },
    noone: (ctx) => {
      ctx.beginPath(); ctx.moveTo(0, 12); ctx.bezierCurveTo(-18, 0, -9, -15, 0, -5); ctx.bezierCurveTo(9, -15, 18, 0, 0, 12); ctx.fillStyle = '#ff8fb1'; ctx.fill(); stroke(ctx, 1.6);
      D.line(ctx, -4, 0, 4, 0, '#fff', 2.4); D.line(ctx, 0, -4, 0, 4, '#fff', 2.4);
    },
    next: (ctx) => {
      ctx.beginPath(); ctx.arc(0, 5, 13, Math.PI, 0); ctx.closePath(); D.fillVol(ctx, -3, 0, 13, '#ffc93c', 1.8);
      D.rr(ctx, -17, 4, 34, 5, 2); ctx.fillStyle = '#f2b02a'; ctx.fill(); stroke(ctx, 1.4);
      D.line(ctx, 0, -8, 0, 4, 'rgba(120,70,0,0.45)', 2);
    },
  };
  CK.drawStamp = function (ctx, id, x, y, size, o = {}) {
    const st = STAMPS[id];
    if (!st) return;
    const k = size / 60;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(o.rot != null ? o.rot : -0.06);
    ctx.scale(k, k);
    if (o.used) ctx.globalAlpha = 0.45;
    ctx.save(); ctx.translate(2.5, 3); perfPath(ctx, -26, -30, 52, 60, 3.4, 6); ctx.fillStyle = 'rgba(40,20,10,0.22)'; ctx.fill(); ctx.restore();
    perfPath(ctx, -26, -30, 52, 60, 3.4, 6);
    ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 1.4);
    D.rr(ctx, -20, -24, 40, 48, 3);
    const g = ctx.createLinearGradient(0, -24, 0, 24);
    g.addColorStop(0, D.shade(st.col, 0.25)); g.addColorStop(1, D.shade(st.col, -0.12));
    ctx.fillStyle = g; ctx.fill(); stroke(ctx, 1.2);
    ctx.save(); ctx.translate(0, -3); (GLYPH[id] || GLYPH.star)(ctx); ctx.restore();
    D.text(ctx, '1¢', -17, 21, { size: 8, weight: 700, color: 'rgba(60,30,10,0.55)' });
    ctx.restore();
  };

  // ------------------------------------------------ battle effects (hooks in battle.js)
  CK.Stamps = {
    setup(b) {
      for (const m of b.party) {
        m.stamp = stampOf(m.id);
        m.stampUsed = false;
        if (m.stamp === 'first') m.charge = Math.max(m.charge, 2);
      }
    },
    *turnStart(b, m) {
      if (m.stamp === 'tape' && m.hp < m.maxHp) {
        const amt = Math.max(1, Math.round(m.maxHp * 0.08));
        m.hp = Math.min(m.maxHp, m.hp + amt);
        b.pop(m, '+' + amt, '#7be07b', 20, -30);
        CK.Audio.sfx('tape');
        yield 0.3;
      }
    },
    atkMul(m) {
      return m.stamp === 'star' ? 1.15 : m.stamp === 'next' ? 1.1 : 1;
    },
    *afterAttack(b, m, target, mult) {
      if (m.stamp !== 'express' || Math.random() >= 0.3) return;
      if (!target.alive) target = b.alive('enemy')[0];
      if (!target) return;
      b.pop(m, 'Express!', '#ff8fb1', 20, -40);
      m.swing = 0;
      CK.tween(m, { swing: 1.2 }, 0.12, 'outQuad');
      b.hit(target, m.atk * 0.6 * mult, { perfect: mult > 1, attacker: m });
      yield 0.35;
    },
    soakMul(t) {
      return t.stamp === 'wax' ? 0.5 : 1;
    },
    guard(b, t, dmg) {
      if (t.stamp === 'bubble' && !t.stampUsed) {
        t.stampUsed = true;
        b.pop(t, 'Bubble Wrap! POP', '#bfe6ff', 20, -80);
        CK.Audio.sfx('block');
        b.parts.burst(12, () => ({ x: t.pos.x + U.rand(-40, 40), y: t.pos.y - U.rand(40, 160), vx: U.rand(-60, 60), vy: U.rand(-80, -20), life: 0.8, size: U.rand(4, 8), shape: 'circle', color: 'rgba(220,240,255,0.9)' }));
        return 0;
      }
      return dmg;
    },
    rescue(b, t) {
      if (t.stamp !== 'next' || t.stampUsed) return false;
      t.stampUsed = true;
      t.hp = Math.ceil(t.maxHp * 0.5);
      t.soak = 0;
      t.floppy = false;
      b.pop(t, 'The Next Builder!', '#ffc93c', 22, -80);
      b.hearts(t);
      CK.Audio.sfx('heal');
      return true;
    },
    counter(b, t, e) {
      if (!t || t.stamp !== 'counter' || !t.alive || !e.alive) return;
      b.pop(t, 'Return to Sender!', '#5aa9e6', 18, -80);
      b.hit(e, t.atk * 0.8, { attacker: t });
    },
    snackMul(m) {
      return m.stamp === 'care' ? 1.5 : 1;
    },
    afterSnack(b, m) {
      if (m.stamp !== 'care') return;
      for (const p of b.alive('party')) { p.soak = 0; p.floppy = false; }
      b.pop(m, 'Care Package!', '#6cc56c', 18, -80);
    },
    onGuard(b, m) {
      if (m.stamp === 'handle') { m.soak = 0; m.floppy = false; b.pop(m, 'Handle with Care', '#e9b0d8', 18, -80); }
    },
    guardMul(t) {
      return t.stamp === 'handle' ? 0.25 : 0.5;
    },
    helpStars(m) {
      return m.stamp === 'allhands' ? 2 : 1;
    },
    reviveFrac(m) {
      return m.stamp === 'noone' ? 0.6 : 0.25;
    },
    inspectPower(m) {
      return m.stamp === 'measure' ? { hits: 3, mul: 1.7 } : { hits: 2, mul: 1.4 };
    },
    loot(b, xp, scraps) {
      if (b.party.some((m) => m.stamp === 'approved')) return [Math.round(xp * 1.5), Math.round(scraps * 1.5)];
      return [xp, scraps];
    },
  };

  // Padded Envelope: a sturdier friend everywhere (party screen too)
  const baseStats = CK.stats;
  CK.stats = function (m) {
    const s = baseStats(m);
    if (stampOf(m.id) === 'padded') s.maxHp = Math.round(s.maxHp * 1.2);
    return s;
  };

  // ================================================================ LETTERS
  // ch: where it washes up. after: the flag that means that place is saved. to: who it's for.
  const LETTERS = [
    {
      id: 'mossy', ch: 'spring', x: 34, y: 5, after: 'spring_boss', to: ['mayor', 'mayor_lm', 'mayor_lb'], toName: 'Mayor Mossworth', toSpeaker: 'mayor',
      place: 'Blossom Hollow', hint: 'Blossom Hollow, over the bridge and up the far bank of the brook, by the rocks.',
      address: 'To: Mayor Mossworth, Blossom Hollow', from: 'From: Mayor Mossworth (aged 20)', post: 'Postmarked 1925',
      text: 'Dear Me, a hundred years from now.|I am twenty. Everyone says the real world is past the hills and I ought to go and see it. Did I go? Was it wonderful? Write back.|Love, Mossy.|P.S. Look after the brook. It is only little.',
      found: ['pip', 'It says "To Mayor Mossworth". The handwriting is... also Mayor Mossworth? Very small. Very old.', 'shock'],
      reply: [
        ['mayor', 'Oh my shell. I wrote this. I never posted it, because at twenty I did not have an address yet. I lived under a hedge.', 'shock'],
        ['mayor', 'I never did go past the hills. I stayed. I looked after the brook. It was only little.', 'sad'],
        ['mayor', '...Do you know, I think it WAS wonderful.', 'happy'],
        ['sam', 'That counts? Just... staying, and making it nice?', 'sad'],
        ['mayor', 'Young Builder, that is the whole job.', 'happy'],
      ],
      stamp: 'padded', journal: 'Delivered a letter Mayor Mossworth wrote to himself in 1925. He never left Blossom Hollow. He says that was the whole job.',
    },
    {
      id: 'bessmum', ch: 'summer', x: 9, y: 8, after: 'summer_boss', to: ['bess_su', 'bess_sp', 'bess_wi', 'bess_lb'], toName: 'Captain Bess', toSpeaker: 'bess',
      place: 'Sunpatch Shores', hint: 'Sunpatch Shores, out on the sand at the west end of the beach.',
      address: 'To: Bess (the loud one), Sunpatch Shores', from: 'From: Mum, The Sunken Isles', post: 'Postmarked eleven summers ago',
      text: 'Bess, love.|The island\'s gone under again, but we\'re all fine. We\'re living on the boat and your brothers are insufferable. Don\'t you go doing anything daft to get us a new one. Come home when you\'re ready. The kettle\'s always on.|Mum.|P.S. Wear a hat.',
      found: ['corry', 'A letter for Captain Bess! It smells of seaweed and... biscuits?', 'happy'],
      reply: [
        ['bess', '...She wrote this before I turned pirate. Before the mops and the raids and everything.', 'sad'],
        ['bess', 'I did something daft anyway. Eleven summers of daft.', 'sad'],
        ['bess', 'Right. When this is all over, I am sailing home. With a dam design. Builder, you will draw me one.', 'happy'],
        ['sam', "I'll draw you three. You pick.", 'happy'],
        ['bess', 'And I am wearing a hat, Mum. Look. A HAT.', 'happy'],
      ],
      stamp: 'wax', journal: "Delivered Captain Bess a letter from her mum. Eleven summers late. I promised to draw her a dam for the Sunken Isles.",
    },
    {
      id: 'crayon', ch: 'fall', x: 12, y: 20, after: 'fall_boss', to: ['hoot'], toName: 'Professor Hoot', toSpeaker: 'owl',
      place: 'Amberleaf Woods', hint: 'Amberleaf Woods, in the leaves down the southwest path.',
      address: 'To: The Owl Who Reads, Amberleaf Woods', from: 'From: Sam, age 8 (in crayon)', post: 'Postmarked: a Tuesday',
      text: 'Dear Profesor Hoot.|Please teach the hedgehogs about rivers so they dont get wet. Rivers always go DOWN hill. That is the main thing. Also you are the smartest.|From Sam. Age 8.|P.S. I drew you glasses.',
      found: ['pip', 'Sam. Sam. SAM. This is in crayon. This is YOUR handwriting. From when you were eight!', 'shock'],
      reply: [
        ['owl', 'Hoo! So THAT is where my glasses came from.', 'shock'],
        ['owl', 'I have taught "rivers go downhill" for twenty years. Every hatchling, every autumn. I never knew who taught it to me.', 'happy'],
        ['sam', "It's... it is the main thing.", 'sad'],
        ['pip', 'Sam wrote fan mail. To their own owl. I am going to remember this forever. I am counting it.', 'happy'],
        ['owl', 'A teacher is just someone who was told something good and passed it on. Thank you, Professor Sam.', 'happy'],
      ],
      stamp: 'first', journal: 'Delivered a letter I wrote to Professor Hoot at age eight, in crayon. "Rivers always go DOWN hill." He has taught it every autumn since.',
    },
    {
      id: 'silver', ch: 'winter', x: 32, y: 13, after: 'winter_done', to: ['queen', 'queen_lm', 'queen_w', 'queen_fair'], toName: 'Queen Corrina', toSpeaker: 'queen',
      place: 'Frostfold Peak', hint: 'Frostfold Peak, east of the castle path, in the snow.',
      address: 'To: Her Majesty Queen Corrina, Frostfold Peak', from: 'From: C. (never sent, sealed in silver wax)', post: 'Not postmarked',
      text: 'Your Majesty.|Tonight I founded a society to keep the Kingdom\'s good ideas safe. I told the others it was to protect you. That is not true. It is because I am afraid of the rain, and I do not know what else to do with being afraid. If you are reading this, I hope I have stopped.|C.',
      found: ['corry', 'Sealed in silver wax. To the Queen. Sam... I know this seal.', 'sad'],
      reply: [
        ['queen', 'He wrote this on the very first night. Before any of it.', 'sad'],
        ['queen', '"I do not know what else to do with being afraid." Oh, Corvin.', 'sad'],
        { if: () => f('rb_done'), then: [['queen', 'He did stop, you know. He sends me a postcard from Riverbend every Sunday. Mostly about tomatoes.', 'happy']] },
        ['queen', 'I hope he has found somewhere warm to be afraid in. Everyone deserves that.', 'happy'],
      ],
      stamp: 'counter', journal: "Delivered Corvin's first, unsent letter to the Queen. He started the Silver Quill because he was afraid of the rain.",
    },
    {
      id: 'ike', ch: 'riverbend', x: 5, y: 4, after: 'gp_done', to: ['grandma_porch', 'grandma_creek', 'grandma_garden'], toName: 'Grandma Rosie', toSpeaker: 'grandma',
      place: 'Riverbend', hint: "Riverbend, up the meadow north of Grandma's cottage.",
      address: 'To: Rosie Reyes, Riverbend', from: 'From: Ike, Gull Point', post: 'Postmarked 1975 (51 years late)',
      text: 'Rosie.|Got your box. It is a good box. I built a lighthouse in it: red stripes, round window, the works. The gulls approve. Now we\'re even.|Ike.|P.S. You owe me a rematch at gin rummy. You cheat.',
      found: ['sam', "It's for Grandma. From... Ike. Jules's grandpa.", 'shock'],
      reply: [
        ['grandma', 'Pish. I do NOT cheat. I improvise.', 'happy'],
        ['grandma', '...He never wrote back about the box. I wondered for fifty years if it got there.', 'sad'],
        ['grandma', 'Well. It got there. He built the lighthouse in it.', 'happy'],
        ['sam', 'You sent him the box? The lighthouse came out of YOUR box?', 'shock'],
        ['grandma', 'He brought me a box when mine went soft. I sent him one back. Every builder needs one person who sends them a box, love.', 'happy'],
        { coop: [['jules', "So Grandpa's lighthouse and your Kingdom are... the same cardboard. Okay. I'm fine. I'm totally fine.", 'sad']] },
      ],
      stamp: 'care', journal: "Delivered a letter from Ike to Grandma, 51 years late. She sent him the box he built the Gull Point lighthouse in.",
    },
    {
      id: 'reeds', ch: 'lanternmere', x: 20, y: 4, after: 'lm_done', to: ['lux', 'lux_lb'], toName: 'Mr. Lux', toSpeaker: 'lux',
      place: 'Lanternmere', hint: 'Lanternmere, north of the square, under the dark sky.',
      address: 'To: My Luxley, Lanternmere', from: 'From: Mum (a grey heron), The Dark Marsh', post: 'Postmarked forty years ago',
      text: 'Luxley.|If you are ever lost in the dark again, stand still. Don\'t run. Listen for the reeds. They always lean toward the water, and the water always knows the way home. I\'ll be listening too.|Mum.',
      found: ['pip', 'For "My Luxley". Who is Luxley? Oh. OH. Mr. Lux has a first name!', 'shock'],
      reply: [
        ['lux', 'Luxley. Nobody has called me Luxley in forty years.', 'sad'],
        ['lux', 'I sold a lantern to everyone so nobody would ever have to stand still in the dark. And she was telling me to stand still.', 'sad'],
        ['lux', '...I think I would like to go and listen to some reeds.', 'happy'],
        ['sam', 'Want company?', 'happy'],
        ['lux', 'Yes. Quietly, though. Reeds are shy.', 'happy'],
      ],
      stamp: 'express', journal: 'Delivered Mr. Lux a letter from his mum: "If you are ever lost in the dark, stand still and listen for the reeds."',
    },
    {
      id: 'stairs', ch: 'gullpoint', x: 24, y: 3, after: 'gp_done', to: ['oldtin', 'tin_lb'], toName: 'Old Tin', toSpeaker: 'tin',
      place: 'Gull Point', hint: 'Gull Point, along the clifftop north of the lighthouse.',
      address: 'To: Tin, Gull Point Tidepools', from: 'From: Ike', post: 'Postmarked 1972, the day he left',
      text: 'Tin.|I\'m off to the city. Look after the logbook and the tidepools. If a kid with my nose turns up someday asking about the light, show them the stairs.|Your friend, Ike.',
      found: ['corry', 'For Old Tin. From... Ike. It is very short. The best letters usually are.', 'sad'],
      reply: [
        ['tin', 'Fifty-four years. And I did exactly that.', 'sad'],
        ['tin', 'Logbook: kept. Tidepools: full. Kid with his nose: showed them the stairs.', 'happy'],
        { coop: [['jules', "I DO have his nose. Mom always says so. I'm not crying. The wind is crying.", 'sad']] },
        { solo: [['sam', "I'll tell Jules. They'll cry. In a good way.", 'happy']] },
        ['tin', 'Tell the kid the light is theirs now. And to visit. Old crabs get bored.', 'happy'],
      ],
      stamp: 'bubble', journal: 'Delivered Ike\'s goodbye letter to Old Tin: "If a kid with my nose turns up someday, show them the stairs." He did.',
    },
    {
      id: 'goodeye', ch: 'longbridge', x: 3, y: 20, after: 'lb_built', to: ['rook_lb'], toName: 'Inspector Rook', toSpeaker: 'rook',
      place: 'the Great Gorge', hint: 'the Great Gorge, in the long grass southwest of the bridge.',
      address: 'To: Mortimer Rook (Deputy), Frostfold Peak', from: 'From: Magister C.', post: 'Postmarked 1990. Returned: moved, no forwarding address',
      text: 'Mortimer.|You have a good eye. Better than mine. I am sorry I only ever gave you a stamp to hold. One day, build something with it.|C.',
      found: ['pip', 'Inspector Rook! A letter for Inspector Rook! He is going to stamp it. He is going to stamp it SO hard.', 'happy'],
      reply: [
        ['rook', 'He... he said I have a good eye.', 'shock'],
        ['rook', '"Build something with it." I did. Forty-one stamps on the Long Bridge, and every single one of them was...', 'sad'],
        ['rook', '(sniff) I am going to need a forty-second.', 'happy'],
        { narrate: 'THUNK.' },
        ['rook', 'APPROVED. And this one is for you, Builder. Do not argue. It is official.', 'happy'],
      ],
      stamp: 'approved', journal: 'Delivered Corvin\'s old letter to Inspector Rook: "You have a good eye. One day, build something with it." He stamped it.',
    },
  ];
  CK.Letters = LETTERS;
  const byId = (id) => LETTERS.find((L) => L.id === id);
  const reached = (L) => f(L.ch + '_arrived') || f(L.after) || CK.G.chapter === L.ch;
  const available = (L) => f(L.after);
  const isFound = (L) => !!letters().found[L.id];
  const isDone = (L) => !!letters().delivered[L.id];
  const doneCount = () => LETTERS.filter(isDone).length;
  const pendingFor = (npcId) => LETTERS.find((L) => isFound(L) && !isDone(L) && L.to.includes(npcId));
  const pellMet = () => f('pell_met');

  // ------------------------------------------------ the letter, read aloud
  class LetterScene {
    constructor(L, sealed) { this.L = L; this.sealed = sealed; this.t = 0; this.finished = false; this.transparent = true; }
    enter() { CK.Audio.sfx('whoosh'); if (CK.autoSkip) this.close(); }
    close() { this.finished = true; CK.Scenes.remove(this); }
    update(dt) {
      this.t += dt;
      if (this.t > 0.5 && (Input.hit('ok') || Input.hit('back') || Input.mouse.pressed)) { CK.Audio.sfx('blip'); this.close(); }
    }
    draw(ctx) {
      ctx.fillStyle = `rgba(30,15,5,${Math.min(0.55, this.t * 2)})`;
      ctx.fillRect(0, 0, W, H);
      const s = CK.Ease.outBack(Math.min(1, this.t * 2.5));
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.scale(s, s);
      ctx.rotate(-0.015);
      drawLetterPaper(ctx, this.L, -300, -220, 600, 430, this.sealed);
      ctx.restore();
      if (this.t > 0.6) D.text(ctx, 'Z / click to continue', W / 2, H - 14, { size: 13, align: 'center', color: '#ffe9c8' });
    }
  }
  function drawLetterPaper(ctx, L, x, y, w, h, sealed) {
    ctx.save();
    D.rr(ctx, x + 6, y + 8, w, h, 6); ctx.fillStyle = 'rgba(40,20,10,0.3)'; ctx.fill();
    D.rr(ctx, x, y, w, h, 6);
    const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#f3e6c8');
    ctx.fillStyle = g; ctx.fill(); stroke(ctx, 2.5);
    ctx.save(); D.rr(ctx, x, y, w, h, 6); ctx.clip();
    for (let ly = y + 110; ly < y + h - 20; ly += 28) D.line(ctx, x + 30, ly + 6, x + w - 30, ly + 6, 'rgba(90,140,200,0.18)', 1);
    D.line(ctx, x + 60, y, x + 60, y + h, 'rgba(230,100,100,0.18)', 1.5);
    ctx.restore();
    if (L) {
      CK.drawStamp(ctx, L.stamp, x + w - 54, y + 52, 52, { rot: 0.1 });
      ctx.beginPath(); ctx.arc(x + w - 92, y + 50, 26, 0, TAU); stroke(ctx, 1.6, 'rgba(60,60,90,0.45)');
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x + w - 150, y + 40 + i * 10); ctx.quadraticCurveTo(x + w - 130, y + 34 + i * 10, x + w - 110, y + 40 + i * 10); stroke(ctx, 1.4, 'rgba(60,60,90,0.4)'); }
      const addr = D.wrap(ctx, L.address, w - 210, 17, 700);
      addr.forEach((l, i) => D.text(ctx, l, x + 30, y + 40 + i * 21, { size: 17, weight: 700, color: '#3d2412' }));
      const dy = (addr.length - 1) * 21;
      D.text(ctx, L.from, x + 30, y + 64 + dy, { size: 14, weight: 600, color: '#7a5434' });
      D.text(ctx, L.post, x + 30, y + 86 + dy, { size: 12, weight: 600, color: '#9a7a5a' });
      if (sealed) {
        D.ball(ctx, x + w / 2, y + h / 2 + 30, 34, '#d23a3a', { lw: 2.5 });
        D.text(ctx, 'Sealed', x + w / 2, y + h / 2 + 37, { size: 18, weight: 700, align: 'center', color: '#ffe0d8' });
        D.text(ctx, 'Not yours to open. Bring it to ' + L.toName + '.', x + w / 2, y + h - 30, { size: 15, weight: 600, align: 'center', color: '#7a5434' });
      } else {
        // paragraphs on their own lines; long letters get a slightly smaller hand
        let size = 19, lh = 28, lines = [];
        for (let k = 0; k < 2; k++) {
          lines = [];
          for (const para of L.text.split(PARA)) lines.push(...D.wrap(ctx, para, w - 110, size, 500));
          if ((lines.length + 1) * lh < h - 130 - dy) break;
          size = 17; lh = 24;
        }
        let ly = y + 122 + dy;
        for (const line of lines) { D.text(ctx, line, x + 72, ly, { size, weight: 500, color: '#2f3a6a' }); ly += lh; }
      }
    }
    ctx.restore();
  }
  CK.drawLetterPaper = drawLetterPaper;

  // ------------------------------------------------ stamp reward popup
  class StampReward {
    constructor(id, who) { this.id = id; this.who = who; this.t = 0; this.finished = false; this.transparent = true; }
    enter() { CK.Audio.sfx('chest'); if (CK.autoSkip) this.close(); }
    close() { this.finished = true; CK.Scenes.remove(this); }
    update(dt) { this.t += dt; if (this.t > 0.6 && (Input.hit('ok') || Input.mouse.pressed)) this.close(); }
    draw(ctx) {
      const st = STAMPS[this.id];
      ctx.fillStyle = `rgba(30,15,5,${Math.min(0.45, this.t)})`;
      ctx.fillRect(0, 0, W, H);
      const s = CK.Ease.outBack(Math.min(1, this.t * 2.5));
      ctx.save();
      ctx.translate(W / 2, H / 2 - 20);
      ctx.scale(s, s);
      for (let i = 0; i < 12; i++) { ctx.save(); ctx.rotate(this.t * 0.5 + (i * Math.PI) / 6); ctx.globalAlpha = 0.25; D.poly(ctx, [0, 0, -20, -260, 20, -260], '#fff3a0'); ctx.restore(); }
      D.panel(ctx, -250, -130, 500, 262, { fill: '#fff4dc' });
      // the stamp comes down like a rubber stamp: THUNK
      const drop = Math.max(0, 1 - this.t * 3);
      CK.drawStamp(ctx, this.id, 0, -40 - drop * 60, 96, { rot: -0.08 + drop * 0.3 });
      D.text(ctx, 'Battle Stamp: ' + st.name, 0, 46, { size: 26, weight: 700, align: 'center', color: '#3d2412' });
      for (const [i, l] of D.wrap(ctx, st.desc, 440, 16, 500).entries()) D.text(ctx, l, 0, 74 + i * 20, { size: 16, weight: 500, align: 'center', color: '#6b4a2a' });
      const who = this.who && CK.Data.party[this.who];
      D.text(ctx, who ? `Pressed onto ${who.name}'s cardboard. Change it in Pause → Stamps & Letters.` : 'Put it on someone in Pause → Stamps & Letters.', 0, 118, { size: 13, weight: 600, align: 'center', color: '#3e7a5a' });
      ctx.restore();
    }
  }

  // ------------------------------------------------ scripts
  const rebuild = { fn: () => { if (CK.OW) CK.OW.buildEntities(); } };
  function pickupScript(L) {
    return [
      { fn: () => { letters().found[L.id] = true; } },
      rebuild,
      { sfx: 'chest' },
      { await: () => show(new LetterScene(L, true)) },
      L.found,
      { narrate: `Lost letter found! It's for ${L.toName}. (Talk to them to deliver it. Letters: Pause → Stamps & Letters.)` },
    ];
  }
  function deliverScript(L) {
    return [
      { narrate: `You hand ${L.toName} the letter. ${L.post}.` },
      { fn: () => { letters().delivered[L.id] = true; } },
      rebuild,
      { await: () => show(new LetterScene(L, false)) },
    ].concat(L.reply, [
      { narrate: 'A stamp flutters down out of a clear sky. Somewhere, a pelican nods.' },
      { await: () => CK.giveStamp(L.stamp) },
      { journal: L.journal },
      { fn: () => (doneCount() === LETTERS.length ? [['pip', 'That is EIGHT. All eight! Pell said to come and find her when they were all home.', 'happy']] : [{ narrate: `Letters delivered: ${doneCount()} of ${LETTERS.length}.` }]) },
      { save: true },
    ]);
  }

  // Pell: the first meeting, hints, a twist, and (once every letter is home) one more
  S.pell_meet = [
    { narrate: 'A large pelican in a navy postal cap is turning in slow circles, squinting at an envelope.' },
    ['pell', 'Mmf. MMF.', 'shock'],
    { narrate: 'She tips her head back and a small avalanche of envelopes slides from her beak into her satchel.' },
    ['pell', 'Sorry! Mouth full of mail. Postmistress Pell, Royal Kingdom Post. The ONLY Kingdom Post, since 1971.', 'happy'],
    ['pip', 'You deliver to the whole Kingdom? Alone? How many letters is that?', 'shock'],
    ['pell', 'Four hundred and twelve thousand and six. Seven, if you count the one I sat on.', 'happy'],
    ['pip', 'I am counting it.', 'happy'],
    ['corry', 'A fellow servant of the realm! Madam, Sir Corrugate, Knight of the Fridge Box, at your service.', 'happy'],
    ['pell', 'Here is my trouble. This year\'s storms burst my dead-letter bag. Fifty years of letters, blown all over the Kingdom.', 'sad'],
    ['sam', 'Dead letters?', 'sad'],
    ['pell', 'Wrong address. No address. Addressed to somebody who hadn\'t turned up yet. I keep them all. Somebody has to.', 'sad'],
    ['pell', 'They\'ll wash up wherever the water goes down. Find one, bring it to whoever it\'s for. Every delivered letter earns a stamp. Post Office rules. I made them up.', 'happy'],
    ['pell', 'And to start you off... Battle Stamps! Press one on your cardboard and it does something.', 'happy'],
    { await: () => CK.giveStamp('star', 'corry') },
    { await: () => CK.giveStamp('tape', 'sam') },
    ['corry', 'A GOLD STAR. On my ARMOR. Madam, I may weep.', 'shock'],
    ['sam', 'He has nine sticker stars left and he is crying over a stamp.', 'happy'],
    ['pell', 'Change them any time: Pause, then Stamps & Letters. One stamp per friend. I\'m always on my route if you need me.', 'happy'],
    { flag: 'pell_met' },
    { journal: 'Met Postmistress Pell, the Kingdom\'s only post-bird. The storms scattered fifty years of undelivered letters. One turns up in each place once it\'s safe again.' },
    rebuild,
    { save: true },
  ];
  S.pell_postcard = [
    ['pell', 'Did the postcard get through? The frosty one, to the box. I wondered.', 'shock'],
    ['sam', "Jules's grandpa's postcard? That was YOU?", 'shock'],
    ['pell', 'It was addressed "To my grandkid, someday." Ike posted it in 1972. I couldn\'t deliver it, because someday hadn\'t happened yet.', 'sad'],
    ['pell', 'Then a kid with Ike\'s nose came through the box to Lanternmere. So I flew straight to the box and posted it in. Fifty-four years. My longest delivery.', 'happy'],
    ['pell', 'Who do you think puts things in that box, Builder? It isn\'t magic. Well. It\'s a LITTLE magic. Mostly it\'s the post.', 'happy'],
    { flag: 'pell_postcard' },
    { journal: 'Pell delivered Ike\'s postcard into the box. It was addressed "To my grandkid, someday," and she waited 54 years for someday.' },
  ];
  S.pell_last = [
    ['pell', 'All eight. ALL EIGHT. Do you know how long it has been since my bag was empty?', 'happy'],
    ['pell', '...It isn\'t, quite. There\'s one more. It has been in my pouch since 1974.', 'sad'],
    { narrate: 'Pell opens her beak very carefully and takes out one soft, folded envelope. She holds it a moment before handing it over.' },
    ['pell', 'It is addressed "To whoever builds next." I never knew who that was. I flew it everywhere. Nobody ever built next.', 'sad'],
    ['pell', 'I think it\'s you.', 'happy'],
    { await: () => show(new LetterScene(LAST, false)) },
    ['sam', '...She was fourteen.', 'shock'],
    ['sam', "She was fourteen and she didn't know what she was going to be either. She just liked it when things stood up.", 'sad'],
    ['corry', 'Builder. By the authority of the Ledger, I proclaim that Rosie Reyes, age fourteen, was RIGHT about everything. Especially the snacks.', 'happy'],
    ['pip', 'She said bring snacks. I have ALWAYS said bring snacks. Nobody listens to the kite.', 'happy'],
    { coop: [['jules', '"Build it with somebody. It stands up better." Okay, Sam, that one is about us. Do not argue.', 'happy']] },
    ['pell', 'Would you like to write back? Not to her. To whoever builds after YOU.', 'happy'],
    { choice: { who: 'sam', text: 'What will you write?', options: [
      { label: '"It\'s okay not to know yet."', then: [{ fn: () => CK.setFlag('pell_reply', 'know') }, ['sam', "Dear whoever builds next. It's okay not to know yet. I didn't. Start with something small that stands up.", 'happy']] },
      { label: '"Bring snacks. (Rosie was right.)"', then: [{ fn: () => CK.setFlag('pell_reply', 'snacks') }, ['sam', 'Dear whoever builds next. Bring snacks. Rosie was right about that, and about most things.', 'happy']] },
      { label: '"Build it with your friends."', then: [{ fn: () => CK.setFlag('pell_reply', 'friends') }, ['sam', "Dear whoever builds next. Build it with your friends. And when it goes soft, build it again. That's allowed.", 'happy']] },
    ] } },
    { narrate: 'Pell takes the letter, presses a stamp on it with a satisfying THUNK, and tucks it into the very bottom of her pouch.' },
    ['pell', 'Addressed to: whoever builds next. I\'ll keep it safe. Some letters just take the long way.', 'happy'],
    { flag: 'pell_done' },
    { await: () => CK.giveStamp('next', 'sam') },
    { journal: 'Pell gave me a letter Grandma wrote at fourteen, "To whoever builds next." It was me. I wrote one back, for whoever builds after me.' },
    { save: true },
  ];
  const LAST = {
    id: 'next', stamp: 'next', toName: 'Sam',
    address: 'To: Whoever builds next', from: 'From: Rosie (R.R.), age 14', post: 'Postmarked 1974. Addressee unknown, until now',
    text: "My box went soft today. I left the lid open in the rain.|Everyone keeps asking what I am going to BE, and I don't know. I only know I like it when things stand up.|If you found the door, here is everything I know so far:|•  You don't have to be finished to be good.|•  Bring snacks.|•  Look after Corvin. He worries.|•  Build it with somebody. It stands up better.|Love, Rosie",
  };
  CK.Letters.last = LAST;

  function pellTalk() {
    if (!pellMet()) return 'pell_meet';
    if (doneCount() === LETTERS.length && !f('pell_done')) return 'pell_last';
    if (f('gp_done') && !f('pell_postcard')) return 'pell_postcard';
    if (f('pell_done')) {
      return [U.pick([
        ['pell', 'Route\'s quiet today. I like quiet routes. Means everything got where it was going.', 'happy'],
        ['pell', 'Inspector Rook keeps asking to borrow my stamp. I keep saying no. It is a very good stamp.', 'happy'],
        ['pell', 'Your letter is safe. Bottom of the pouch. I check on it every morning.', 'happy'],
        ['pell', 'Four hundred and twelve thousand and fifteen. Your Pip asked me to keep count.', 'happy'],
      ])];
    }
    const held = LETTERS.find((L) => isFound(L) && !isDone(L));
    if (held) return [['pell', `You've got a letter for ${held.toName}! Go on, go on. They're in ${held.place}.`, 'happy']];
    const next = LETTERS.find((L) => !isFound(L) && available(L));
    const n = doneCount();
    if (next) return [['pell', `${n} of ${LETTERS.length} delivered. I can smell damp paper in ${next.hint}`, 'happy']];
    const later = LETTERS.filter((L) => !isFound(L)).length;
    return [['pell', `${n} of ${LETTERS.length} delivered. The other ${later} are still under water somewhere. They'll wash up once each place is safe and dry. They always do.`, 'sad']];
  }

  // ------------------------------------------------ putting Pell and the letters on the maps
  const PELL_AT = { spring: [19, 9], summer: [4, 17], fall: [4, 13], winter: [5, 17], riverbend: [11, 13], lanternmere: [4, 11], gullpoint: [6, 13], longbridge: [6, 14] };
  for (const [chId, [x, y]] of Object.entries(PELL_AT)) {
    const ch = CK.Chapters[chId];
    if (!ch) continue;
    ch.objects.push({ type: 'npc', id: 'pell_' + chId, x, y, look: 'pelican', snap: true, talk: () => pellTalk() });
  }
  for (const L of LETTERS) {
    const ch = CK.Chapters[L.ch];
    if (!ch) continue;
    ch.objects.push({ type: 'deco', kind: 'letter', id: 'letter_' + L.id, letter: L.id, x: L.x, y: L.y, snap: true, label: 'Pick up', cond: () => pellMet() && available(L) && !isFound(L), script: () => pickupScript(L) });
  }

  // A lost letter: an envelope lying in the grass, flapping a little in the wind, with a sparkle.
  CK.DecoDraw.letter = function (ctx, e, x, y) {
    const t = this.t;
    const flap = Math.sin(t * 3 + e.x) * 0.12;
    D.shadow(ctx, x + 2, y + 1, 16, 4, 0.25);
    ctx.save();
    ctx.translate(x, y - 8 - Math.abs(Math.sin(t * 2)) * 3);
    ctx.rotate(-0.15 + flap);
    envelope(ctx, 0, 0, 30, 20);
    ctx.save(); ctx.translate(8, -3); ctx.scale(0.22, 0.22); CK.drawStamp(ctx, (byId(e.letter) || {}).stamp || 'star', 0, 0, 60, { rot: 0 }); ctx.restore();
    ctx.restore();
    const k = (t * 1.3 + e.x * 0.3) % 1;
    D.star(ctx, x - 12 + k * 6, y - 26 - k * 10, 5 * (1 - k), `rgba(255,236,150,${1 - k})`, 4, t * 2);
  };

  // nudge Pell and the letters onto the nearest free spot, so they never end up inside a tree
  const baseBuild = CK.Overworld.prototype.buildEntities;
  CK.Overworld.prototype.buildEntities = function () {
    baseBuild.call(this);
    for (const e of this.ents) {
      if (!e.snap) continue;
      let best = null;
      for (let r = 0; r <= 5 && !best; r++) {
        for (let dy = -r; dy <= r && !best; dy++) {
          for (let dx = -r; dx <= r && !best; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
            const tx = e.x + dx, ty = e.y + dy;
            const t = this.map.get(tx, ty);
            if (!t || CK.SOLID.has(t) || t === 'h' || t === 'Q' || t === 'S') continue;
            const px = (tx + 0.5) * TS, py = (ty + 0.75) * TS;
            if (this.blocked(px, py, e, 0) || this.blocked(px, py - 20, e, 0)) continue;
            if (this.ents.some((o) => o !== e && (o.type === 'npc' || o.type === 'chest' || o.type === 'enemy' || o.type === 'deco') && Math.hypot(o.px - px, o.py - py) < 40)) continue;
            best = [px, py];
          }
        }
      }
      if (best) { e.px = best[0]; e.py = best[1]; }
    }
  };

  // talking to someone while you carry their letter delivers it
  const baseInteract = CK.Overworld.prototype.interact;
  CK.Overworld.prototype.interact = function (e, who) {
    if (e && e.type === 'npc') {
      const L = pendingFor(e.id);
      if (L) {
        CK.Audio.sfx('blip');
        e.dir = 'down';
        CK.runScript(deliverScript(L));
        return;
      }
    }
    return baseInteract.call(this, e, who);
  };

  const HEAD = { crab: 60, critter: 74, bess: 108, queen: 106, rook: 104, walrus: 100, heron: 112, mayor: 80, grandma: 92, owl: 80 };
  // little envelope bubbles over whoever has mail coming, and a "!" over Pell until you meet her
  const baseDrawEnt = CK.Overworld.prototype.drawEnt;
  CK.Overworld.prototype.drawEnt = function (ctx, e) {
    baseDrawEnt.call(this, ctx, e);
    if (e.type !== 'npc') return;
    const isPell = e.look === 'pelican';
    const mail = !isPell && pendingFor(e.id);
    const pellNews = isPell && (!pellMet() || (doneCount() === LETTERS.length && !f('pell_done')) || (f('gp_done') && !f('pell_postcard')));
    if (!mail && !pellNews) return;
    const s = (e.o && e.o.s) || 1;
    const x = e.px - this.camX, y = e.py - this.camY - (isPell ? 92 : HEAD[e.look] || 88) * Math.max(0.75, s) + Math.sin(this.t * 4) * 4;
    if (pellNews && !pellMet()) { CK.drawEmote(ctx, '!', x, y, this.t); return; }
    ctx.save();
    ctx.beginPath(); ctx.ellipse(x, y, 19, 16, 0, 0, TAU); ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 2);
    D.poly(ctx, [x - 4, y + 14, x + 4, y + 14, x - 2, y + 22], '#fffaf0');
    ctx.beginPath(); ctx.moveTo(x - 4, y + 15); ctx.lineTo(x - 2, y + 22); ctx.lineTo(x + 4, y + 15); stroke(ctx, 2);
    envelope(ctx, x, y, 20, 14, '#fff3c4');
    ctx.restore();
  };

  // ================================================================ STAMP BOOK (pause menu)
  const LETTER_ROW = 'letters';
  class StampScreen {
    constructor() { this.transparent = true; this.mode = 'friend'; this.sel = 0; this.ssel = 0; this.t = 0; }
    cards() { return CK.G.party.map((m) => m.id).concat([LETTER_ROW]); }
    grid() { return [null].concat(book().owned.slice().sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))); }
    crect(i) { const n = this.cards().length, w = Math.min(170, (W - 140 - (n - 1) * 14) / n); const x0 = W / 2 - (n * w + (n - 1) * 14) / 2; return [x0 + i * (w + 14), 96, w, 168]; }
    srect(i) { const cols = 8, w = 94, x0 = W / 2 - (cols * w + (cols - 1) * 8) / 2; return [x0 + (i % cols) * (w + 8), 284 + Math.floor(i / cols) * 94, w, 88]; }
    update(dt) {
      this.t += dt;
      const cards = this.cards(), grid = this.grid();
      if (this.mode === 'friend') {
        const n = cards.length;
        if (Input.hit('left') || Input.hit('up')) { this.sel = (this.sel + n - 1) % n; CK.Audio.sfx('blip'); }
        if (Input.hit('right') || Input.hit('down')) { this.sel = (this.sel + 1) % n; CK.Audio.sfx('blip'); }
        let pick = Input.hit('ok') ? this.sel : -1;
        cards.forEach((c, i) => {
          const r = this.crect(i);
          if (Input.mouse.moved && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) this.sel = i;
          if (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) pick = i;
        });
        if (pick >= 0) {
          this.sel = pick;
          CK.Audio.sfx('select');
          if (cards[pick] === LETTER_ROW) { CK.Scenes.push(new LettersScreen()); return; }
          if (!book().owned.length) { CK.toast('No stamps yet. Find Postmistress Pell!'); return; }
          this.mode = 'stamp';
          this.ssel = Math.max(0, grid.indexOf(stampOf(cards[pick])));
          return;
        }
        if (Input.hit('back') || (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, W - 170, H - 62, 120, 40))) { CK.Audio.sfx('back'); CK.Scenes.remove(this); }
      } else {
        const n = grid.length, cols = 8;
        if (Input.hit('left')) { this.ssel = (this.ssel + n - 1) % n; CK.Audio.sfx('blip'); }
        if (Input.hit('right')) { this.ssel = (this.ssel + 1) % n; CK.Audio.sfx('blip'); }
        if (Input.hit('up') && this.ssel - cols >= 0) { this.ssel -= cols; CK.Audio.sfx('blip'); }
        if (Input.hit('down') && this.ssel + cols < n) { this.ssel += cols; CK.Audio.sfx('blip'); }
        let pick = Input.hit('ok') ? this.ssel : -1;
        grid.forEach((g, i) => {
          const r = this.srect(i);
          if (Input.mouse.moved && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) this.ssel = i;
          if (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) pick = i;
        });
        if (pick >= 0) {
          const B = book(), me = cards[this.sel], id = grid[pick];
          if (id) {
            const other = Object.keys(B.equip).find((k) => B.equip[k] === id && k !== me);
            if (other) { if (B.equip[me]) B.equip[other] = B.equip[me]; else delete B.equip[other]; }
            B.equip[me] = id;
            CK.Audio.sfx('tape');
          } else { delete B.equip[me]; CK.Audio.sfx('back'); }
          CK.healParty();
          this.mode = 'friend';
          this.stampT = this.t;
          return;
        }
        if (Input.hit('back')) { this.mode = 'friend'; CK.Audio.sfx('back'); }
      }
    }
    draw(ctx) {
      const G = CK.G, B = book();
      ctx.fillStyle = 'rgba(30,15,5,0.6)'; ctx.fillRect(0, 0, W, H);
      D.panel(ctx, 40, 20, W - 80, H - 40, { fill: '#fffaf0' });
      D.text(ctx, 'Stamp Book', W / 2, 60, { size: 28, weight: 700, align: 'center' });
      D.text(ctx, 'Each friend wears one Battle Stamp. Press it on, and their cardboard fights a little differently.', W / 2, 84, { size: 13, weight: 600, align: 'center', color: '#7a5434' });
      const cards = this.cards();
      cards.forEach((id, i) => {
        const [x, y, w, h] = this.crect(i), on = i === this.sel;
        D.rr(ctx, x, y, w, h, 12); ctx.fillStyle = on ? (this.mode === 'stamp' ? '#ffe9a0' : '#fff0b8') : '#fff4dc'; ctx.fill(); stroke(ctx, on ? 3 : 1.6);
        if (id === LETTER_ROW) {
          const n = doneCount();
          ctx.save(); ctx.translate(x + w / 2, y + 64); ctx.rotate(-0.08); envelope(ctx, 0, 0, 74, 50, '#fff3c4'); ctx.restore();
          ctx.save(); ctx.translate(x + w / 2 + 22, y + 52); ctx.scale(0.4, 0.4); CK.drawStamp(ctx, 'first', 0, 0, 60, { rot: 0.1 }); ctx.restore();
          D.text(ctx, 'Letter Bag', x + w / 2, y + 122, { size: 16, weight: 700, align: 'center' });
          D.text(ctx, `${n} of ${LETTERS.length} delivered`, x + w / 2, y + 142, { size: 12, weight: 600, align: 'center', color: '#7a5434' });
          if (CK.roundCount) { const [v, all] = CK.roundCount(); D.text(ctx, `Neighbor Round: ${v}/${all}`, x + w / 2, y + 159, { size: 11, weight: 600, align: 'center', color: '#c2410c' }); }
          return;
        }
        const m = G.party.find((q) => q.id === id), st = CK.stats(m);
        ctx.save(); D.rr(ctx, x + 6, y + 6, w - 12, 100, 8); ctx.clip();
        ctx.fillStyle = '#efe2c8'; ctx.fillRect(x + 6, y + 6, w - 12, 100);
        D.char(ctx, id, x + w / 2 - 20, y + (id === 'pip' ? 90 : 104), { s: id === 'pip' ? 1.4 : 1.15, noShadow: true, mood: 'happy' });
        ctx.restore();
        const sid = B.equip[id];
        const pop = this.stampT != null && on ? Math.max(0, 1 - (this.t - this.stampT) * 4) : 0;
        if (sid) CK.drawStamp(ctx, sid, x + w - 34, y + 62 - pop * 20, 44 + pop * 12, { rot: 0.12 });
        else { D.rr(ctx, x + w - 54, y + 38, 40, 48, 4); ctx.setLineDash([4, 4]); stroke(ctx, 1.5, 'rgba(74,44,23,0.4)'); ctx.setLineDash([]); }
        D.text(ctx, st.name, x + 10, y + 128, { size: 15, weight: 700 });
        D.text(ctx, sid ? STAMPS[sid].name : 'No stamp', x + 10, y + 148, { size: 12, weight: 600, color: sid ? '#3e7a5a' : '#9a7a5a' });
      });
      const grid = this.grid();
      if (!B.owned.length) {
        D.text(ctx, 'No stamps yet.', W / 2, 330, { size: 20, weight: 700, align: 'center', color: '#7a5434' });
        D.text(ctx, 'Postmistress Pell (a pelican in a postal cap) waits near the start of every place in the Kingdom.', W / 2, 360, { size: 15, weight: 500, align: 'center', color: '#7a5434' });
      } else {
        D.text(ctx, this.mode === 'stamp' ? `Pick a stamp for ${CK.Data.party[cards[this.sel]].name}:` : 'Your stamps (pick a friend first):', 70, 276, { size: 15, weight: 700, color: '#5b3a1e' });
        grid.forEach((id, i) => {
          const [x, y, w, h] = this.srect(i), on = this.mode === 'stamp' && i === this.ssel;
          D.rr(ctx, x, y, w, h, 10); ctx.fillStyle = on ? '#fff0b8' : 'rgba(255,244,220,0.7)'; ctx.fill(); stroke(ctx, on ? 2.5 : 1);
          if (!id) { D.text(ctx, 'None', x + w / 2, y + 48, { size: 15, weight: 700, align: 'center', color: '#9a7a5a' }); return; }
          CK.drawStamp(ctx, id, x + w / 2, y + 32, 42);
          const wearer = Object.keys(B.equip).find((k) => B.equip[k] === id);
          D.wrap(ctx, STAMPS[id].name, w - 8, 10, 700).slice(0, 2).forEach((l, k) => D.text(ctx, l, x + w / 2, y + 68 + k * 11, { size: 10, weight: 700, align: 'center' }));
          if (wearer) D.text(ctx, wearer === 'corry' ? 'Corry' : CK.Data.party[wearer].name, x + w - 5, y + 15, { size: 10, weight: 700, align: 'right', color: '#3e7a5a' });
        });
      }
      // what the highlighted stamp does
      const showId = this.mode === 'stamp' ? grid[this.ssel] : cards[this.sel] !== LETTER_ROW ? B.equip[cards[this.sel]] : null;
      const tip = showId ? `${STAMPS[showId].name}: ${STAMPS[showId].desc}` : cards[this.sel] === LETTER_ROW && this.mode === 'friend' ? 'Read the letters you have found and delivered.' : this.mode === 'stamp' ? 'Take the stamp off.' : '';
      D.text(ctx, tip, 70, H - 40, { size: 14, weight: 600, color: '#3d2412' });
      if (this.mode === 'friend') D.button(ctx, W - 170, H - 62, 120, 40, 'Done', { size: 16 });
    }
  }
  CK.StampScreen = StampScreen;

  class LettersScreen {
    constructor() { this.transparent = true; this.sel = 0; this.t = 0; }
    list() { return LETTERS.concat(f('pell_done') ? [LAST] : []); }
    update(dt) {
      this.t += dt;
      const L = this.list();
      if (Input.hit('up')) { this.sel = (this.sel + L.length - 1) % L.length; CK.Audio.sfx('blip'); }
      if (Input.hit('down')) { this.sel = (this.sel + 1) % L.length; CK.Audio.sfx('blip'); }
      L.forEach((l, i) => { if (Input.mouse.moved && D.inRect(Input.mouse.x, Input.mouse.y, 60, 92 + i * 44, 270, 40)) this.sel = i; });
      if (Input.hit('back') || Input.hit('ok') || (Input.mouse.pressed && !D.inRect(Input.mouse.x, Input.mouse.y, 60, 92, 270, 44 * L.length))) { CK.Audio.sfx('back'); CK.Scenes.remove(this); }
    }
    draw(ctx) {
      ctx.fillStyle = 'rgba(30,15,5,0.65)'; ctx.fillRect(0, 0, W, H);
      D.panel(ctx, 40, 20, W - 80, H - 40, { fill: '#fff4dc' });
      D.text(ctx, 'Letter Bag', 195, 66, { size: 26, weight: 700, align: 'center' });
      const L = this.list();
      L.forEach((l, i) => {
        const y = 92 + i * 44, on = i === this.sel, done = l === LAST || isDone(l), got = l === LAST || isFound(l);
        D.rr(ctx, 60, y, 270, 40, 8); ctx.fillStyle = on ? '#fff0b8' : '#fffaf0'; ctx.fill(); stroke(ctx, on ? 2.5 : 1.2);
        envelope(ctx, 84, y + 20, 26, 18, done ? '#fffaf0' : got ? '#fff3c4' : '#e8dcc8');
        D.text(ctx, got ? 'To ' + l.toName : '???', 106, y + 18, { size: 14, weight: 700, color: got ? '#3d2412' : '#9a7a5a' });
        D.text(ctx, done ? 'Delivered' : got ? 'Carrying it' : l.place && reached(l) ? 'Somewhere in ' + l.place : 'Somewhere out there', 106, y + 34, { size: 11, weight: 600, color: done ? '#3e7a5a' : got ? '#c2410c' : '#9a7a5a' });
      });
      const l = L[this.sel];
      if (!l) return;
      const done = l === LAST || isDone(l), got = l === LAST || isFound(l);
      if (got) drawLetterPaper(ctx, l, 350, 52, 550, 436, !done);
      else {
        D.rr(ctx, 350, 52, 550, 436, 8); ctx.fillStyle = 'rgba(255,250,240,0.6)'; ctx.fill(); stroke(ctx, 1.5, 'rgba(74,44,23,0.4)');
        D.text(ctx, 'Not found yet.', 625, 230, { size: 22, weight: 700, align: 'center', color: '#7a5434' });
        const hint = !pellMet() ? 'Find Postmistress Pell first. She is near the start of every place in the Kingdom.' : available(l) ? 'Pell can smell it in ' + l.hint : reached(l) ? 'It will wash up once ' + l.place + ' is safe and dry.' : 'Somewhere you haven\'t been yet.';
        D.wrap(ctx, hint, 440, 16, 500).forEach((s, i) => D.text(ctx, s, 625, 268 + i * 22, { size: 16, weight: 500, align: 'center', color: '#7a5434' }));
      }
      D.text(ctx, 'Up/Down to browse · Z or Esc to close', 195, H - 36, { size: 12, align: 'center', color: '#7a5434' });
    }
  }
  CK.LettersScreen = LettersScreen;

  // ================================================================ BANTER
  const carrying = () => LETTERS.some((L) => isFound(L) && !isDone(L));
  if (CK.Banter) CK.Banter.push(
    { id: 'pt_stamp', who: ['corry', 'pip'], when: () => stampOf('corry') === 'star', lines: [['corry', 'I have pressed my Gold Star on my helmet, my shield, and my heart.', 'spark'], ['pip', 'Your heart is made of felt.'], ['corry', 'It is pressed in spirit.', 'heart']] },
    { id: 'pt_count', who: ['pip', 'sam'], when: () => doneCount() >= 1 && doneCount() < LETTERS.length, lines: [['pip', 'Pell has delivered four hundred and twelve thousand letters. I have delivered a few. I am catching up.', 'idea'], ['sam', "You're a few hundred thousand behind."], ['pip', 'Catching. Up.', 'star']] },
    { id: 'pt_peek', who: ['corry', 'sam'], when: carrying, lines: [['corry', 'We must NOT read it.', '!'], ['sam', "We're not going to read it."], ['corry', 'I am holding it up to the light. For safety reasons.', 'sweat']] },
    { id: 'pt_prof', who: ['pip', 'sam'], when: () => isDone(byId('crayon')), lines: [['pip', 'Professor Sam.', 'star'], ['sam', 'Pip.'], ['pip', 'PROFESSOR Sam.', 'heart']] },
    { id: 'pt_next', who: ['sam'], when: () => f('pell_done'), lines: [['sam', 'Note to self: keep a good box in the closet. For whoever builds next.', 'idea']] },
  );

  // debug helpers: CK.debug.stamps() gives every stamp, CK.debug.letters() finds every letter
  CK.debugPost = {
    stamps() { for (const id of ORDER) if (!book().owned.includes(id)) book().owned.push(id); },
    letters() { for (const L of LETTERS) letters().found[L.id] = true; CK.setFlag('pell_met'); },
    deliverAll() { for (const L of LETTERS) { letters().found[L.id] = true; letters().delivered[L.id] = true; } CK.setFlag('pell_met'); },
  };
})();
