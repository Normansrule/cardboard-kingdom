// Cardboard Kingdom - The Costume Parade (v2.11).
// From the design direction: costumes are the main progression, each made of authored pieces you
// find by meeting people (no random drops), with a homemade walking outfit, a magnificent battle
// form, and an exploration use. Two new ones, sewn by Tansy at Patchwork Hall:
//  * Lantern Moth: paper wings (Elder Dusk), a lampshade hat (Ibis), felt antennae (Tansy).
//    Battle: Moonbeam. Field: glows like the Lighthouse (brighter nights, finds hidden boxes).
//  * Reed Warden: a reed skirt (Mallow), a heron-feather cap (Mr. Lux), a cattail staff (Old Tin).
//    Battle: Reed Wall. Field: wade through shallows.
// Once one is sewn, Tansy throws a Costume Parade at the Hall, and the whole Kingdom comes.
// Also: a brighter "Cardboard up!" transformation in every battle.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input, Data = CK.Data;
  const W = CK.W, H = CK.H, TS = 48;
  const C = D.C, TAU = Math.PI * 2;
  const f = (k) => CK.flag(k);
  const S = CK.Story.scripts;
  const stroke = (ctx, lw, col) => { ctx.strokeStyle = col || C.ink; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };
  const show = (scene) => { CK.Scenes.push(scene); return scene; };

  // ================================================================ DATA
  Object.assign(Data.costumes, {
    moth: { name: 'Lantern Moth', hp: 4, atk: 1, special: 'Moonbeam', desc: 'Soft moonlight on every foe: shows exactly what each will do, marks a weak spot on all of them (next 2 hits +40%), and mends the party a little.', color: '#c9b8ff' },
    reed: { name: 'Reed Warden', hp: 8, atk: 1, special: 'Reed Wall', desc: 'A wall of reeds springs up: it soaks up the next 3 water attacks, dries everyone off, and mends the party a little.', color: '#7ab85a' },
  });
  Object.assign(Data.fieldPowers, {
    moth: 'Moth glow: brighter nights, and hidden boxes show up',
    reed: 'Wade through shallow water',
  });

  // the six pieces, each from someone you've met
  const PIECES = {
    moth_wings: { costume: 'moth', name: 'paper moth wings', giver: ['dusk'], need: 'lm_done', where: 'Elder Dusk, in Moonmeadow at Lanternmere',
      give: [['dusk', 'You brought the moon back. We folded you wings from the old lantern paper. They are a little crumpled. So were we, before.', 'happy']] },
    moth_shade: { costume: 'moth', name: 'a lampshade hat', giver: ['ibis'], need: 'fy_done', where: 'Ibis, on the road at the Ferryyard',
      give: [['ibis', 'My old desk lamp\'s shade. I worked by it for twenty years. I\'d like it to light something better now. It fits a head. I checked. On my head.', 'happy']] },
    moth_antennae: { costume: 'moth', name: 'felt antennae', giver: ['tansy'], need: 'ph_made', where: 'Tansy, at Patchwork Hall',
      give: [['tansy', 'Antennae! Pipe cleaners and felt. Two of them, slightly different lengths. On purpose. (Not on purpose.)', 'happy']] },
    reed_skirt: { costume: 'reed', name: 'a reed skirt', giver: ['mallow'], need: 'fy_done', where: 'Mallow, by the Ferryyard ferry',
      give: [['mallow', 'Reeds from the river. Woven on the ferry between trips. It took eleven trips. It\'s waterproof. Mostly.', 'happy']] },
    reed_cap: { costume: 'reed', name: 'a heron-feather cap', giver: ['lux', 'lux_lb'], need: 'lm_done', where: 'Mr. Lux, by his shop in Lanternmere',
      give: [['lux', 'A feather of mine, on a cap. Mum would say a heron should stand still in the reeds. This is for standing still in the reeds. Bravely.', 'happy']] },
    reed_staff: { costume: 'reed', name: 'a cattail staff', giver: ['oldtin', 'tin_lb'], need: 'gp_done', where: 'Old Tin, at the Gull Point tidepools',
      give: [['tin', 'Cattail from the dunes where your living shoreline grew. Ike would have liked it. Wave it at the sea. It knows.', 'happy']] },
  };
  CK.CostumePieces = PIECES;
  const got = (id) => !!(CK.G.pieces && CK.G.pieces[id]);
  const piecesFor = (c) => Object.keys(PIECES).filter((k) => PIECES[k].costume === c);
  const complete = (c) => piecesFor(c).every(got);
  const sewn = (c) => CK.G.owned.includes(c);

  // talking to a giver after their place is saved hands over the piece (once)
  const baseInteract = CK.Overworld.prototype.interact;
  CK.Overworld.prototype.interact = function (e, who) {
    if (e && e.type === 'npc') {
      const id = Object.keys(PIECES).find((k) => PIECES[k].giver.includes(e.id) && f(PIECES[k].need) && !got(k) && f('ph_tansy'));
      if (id) {
        CK.Audio.sfx('blip');
        CK.runScript(PIECES[id].give.concat([
          { fn: () => { CK.G.pieces = CK.G.pieces || {}; CK.G.pieces[id] = true; } },
          { await: () => show(new PieceReward(id)) },
          { fn: () => {
            const c = PIECES[id].costume, have = piecesFor(c).filter(got).length;
            return [{ narrate: have === 3 ? `That's all three pieces of the ${Data.costumes[c].name}! Take them to Tansy at Patchwork Hall.` : `Costume pieces for the ${Data.costumes[c].name}: ${have} of 3.` }];
          } },
          { journal: `Got ${PIECES[id].name} for the ${Data.costumes[PIECES[id].costume].name} costume.` },
          { save: true },
        ]));
        return;
      }
    }
    return baseInteract.call(this, e, who);
  };
  // a sparkle over anyone holding a piece for you
  const baseDrawEnt = CK.Overworld.prototype.drawEnt;
  CK.Overworld.prototype.drawEnt = function (ctx, e) {
    baseDrawEnt.call(this, ctx, e);
    if (e.type !== 'npc' || !f('ph_tansy')) return;
    const id = Object.keys(PIECES).find((k) => PIECES[k].giver.includes(e.id) && f(PIECES[k].need) && !got(k));
    if (!id) return;
    const x = e.px - this.camX + 22, y = e.py - this.camY - 70 + Math.sin(this.t * 3) * 3;
    ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, 15, 13, 0, 0, TAU); ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 2);
    D.poly(ctx, [x - 3, y + 11, x + 3, y + 11, x - 6, y + 18], '#fffaf0');
    drawPieceIcon(ctx, id, x, y, 0.55);
    ctx.restore();
  };

  // ================================================================ ART: pieces
  function drawPieceIcon(ctx, id, x, y, k) {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    switch (id) {
      case 'moth_wings': for (const s of [-1, 1]) { D.egg(ctx, s * 12, -4, 12, 16, '#e6dcff', { lw: 2, rot: s * 0.4 }); D.circle(ctx, s * 13, -6, 4, '#a68be6', C.ink, 1.2); } break;
      case 'moth_shade': D.poly(ctx, [-12, 8, 12, 8, 7, -12, -7, -12], '#fff3b0', C.ink, 2); D.ellipse(ctx, 0, 10, 13, 3, 'rgba(255,230,120,0.6)'); break;
      case 'moth_antennae': for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 3, 12); ctx.quadraticCurveTo(s * 4, -6, s * 12, -12); stroke(ctx, 2.4); D.ball(ctx, s * 12, -13, 4, '#ff9ec7', { lw: 1.4 }); } break;
      case 'reed_skirt': ctx.beginPath(); ctx.moveTo(-14, -8); ctx.lineTo(14, -8); ctx.lineTo(18, 14); ctx.lineTo(-18, 14); ctx.closePath(); ctx.fillStyle = '#7ab85a'; ctx.fill(); stroke(ctx, 2); for (let i = -3; i <= 3; i++) D.line(ctx, i * 5, -6, i * 6, 12, '#4a8a3a', 1.5); break;
      case 'reed_cap': ctx.beginPath(); ctx.arc(0, 6, 13, Math.PI, 0); ctx.closePath(); D.fillVol(ctx, -3, 0, 13, '#c9a26a', 2); ctx.beginPath(); ctx.moveTo(4, -4); ctx.quadraticCurveTo(16, -24, 20, -22); ctx.quadraticCurveTo(12, -10, 8, -4); D.fillVol(ctx, 12, -14, 8, '#d6dde6', 1.5); break;
      case 'reed_staff': D.line(ctx, -8, 16, 8, -14, '#7a5a3a', 3); D.egg(ctx, 9, -16, 4, 8, '#6a4426', { lw: 1.5, rot: 0.5 }); break;
    }
    ctx.restore();
  }
  class PieceReward {
    constructor(id) { this.id = id; this.t = 0; this.finished = false; this.transparent = true; }
    enter() { CK.Audio.sfx('chest'); if (CK.autoSkip) this.close(); }
    close() { this.finished = true; CK.Scenes.remove(this); }
    update(dt) { this.t += dt; if (this.t > 0.5 && (Input.hit('ok') || Input.mouse.pressed)) this.close(); }
    draw(ctx) {
      const P = PIECES[this.id], c = P.costume;
      ctx.fillStyle = `rgba(30,15,5,${Math.min(0.45, this.t)})`; ctx.fillRect(0, 0, W, H);
      const s = CK.Ease.outBack(Math.min(1, this.t * 2.5));
      ctx.save(); ctx.translate(W / 2, H / 2 - 20); ctx.scale(s, s);
      for (let i = 0; i < 12; i++) { ctx.save(); ctx.rotate(this.t * 0.5 + (i * Math.PI) / 6); ctx.globalAlpha = 0.25; D.poly(ctx, [0, 0, -20, -260, 20, -260], '#fff3a0'); ctx.restore(); }
      D.panel(ctx, -250, -130, 500, 262, { fill: '#fff4dc' });
      drawPieceIcon(ctx, this.id, 0, -48, 2.8);
      D.text(ctx, 'Costume piece: ' + P.name, 0, 40, { size: 24, weight: 700, align: 'center', color: '#3d2412' });
      // three slots for this costume's pieces
      piecesFor(c).forEach((k, i) => {
        const x = -60 + i * 60, y = 82;
        D.rr(ctx, x - 22, y - 20, 44, 40, 8); ctx.fillStyle = got(k) ? '#fff0b8' : '#efe4d0'; ctx.fill(); stroke(ctx, 1.6);
        if (got(k)) drawPieceIcon(ctx, k, x, y, 0.8); else D.text(ctx, '?', x, y + 7, { size: 18, weight: 700, align: 'center', color: '#c9b79a' });
      });
      D.text(ctx, Data.costumes[c].name, 0, 122, { size: 13, weight: 700, align: 'center', color: '#3e7a5a' });
      ctx.restore();
    }
  }

  // ================================================================ ART: walking outfits
  const baseBody = D.costumeBody;
  D.costumeBody = function (ctx, c, x, top, bot, s, dir) {
    const h = bot - top, back = dir === 'up';
    if (c === 'moth') {
      // paper wings behind, fuzzy cream tunic, a lace ruff
      const flap = Math.sin(CK.time * 6) * 0.12;
      for (const k of [-1, 1]) {
        ctx.save(); ctx.translate(x + k * 6 * s, top + 4 * s); ctx.rotate(k * (0.5 + flap));
        D.egg(ctx, k * 8 * s, -2 * s, 9 * s, 13 * s, 'rgba(230,220,255,0.92)', { lw: 1.6 });
        D.circle(ctx, k * 9 * s, -3 * s, 3 * s, '#a68be6', C.ink, 1);
        ctx.restore();
      }
      D.rr(ctx, x - 12 * s, top, 24 * s, h, 7 * s); D.fillVol(ctx, x, (top + bot) / 2, 14 * s, '#f6ecd6', 1.8);
      for (let i = 0; i < 3; i++) D.line(ctx, x - 9 * s, top + 5 * s + i * 5 * s, x + 9 * s, top + 5 * s + i * 5 * s, 'rgba(160,130,90,0.35)', 1.4);
      if (!back) for (let i = -2; i <= 2; i++) D.circle(ctx, x + i * 5 * s, top + 1 * s, 3 * s, '#fffaf0', C.ink, 1);
      return;
    }
    if (c === 'reed') {
      // a sash and a skirt of woven reeds, with the cattail staff at the side
      D.rr(ctx, x - 11 * s, top, 22 * s, h * 0.5, 5 * s); D.fillVol(ctx, x, top + h * 0.25, 12 * s, '#c9a26a', 1.6);
      ctx.beginPath(); ctx.moveTo(x - 12 * s, top + h * 0.45); ctx.lineTo(x + 12 * s, top + h * 0.45); ctx.lineTo(x + 15 * s, bot + 2 * s); ctx.lineTo(x - 15 * s, bot + 2 * s); ctx.closePath();
      D.fillVol(ctx, x, top + h * 0.7, 14 * s, '#7ab85a', 1.8);
      for (let i = -3; i <= 3; i++) D.line(ctx, x + i * 3.6 * s, top + h * 0.48, x + i * 4.3 * s, bot, '#4a8a3a', 1.2);
      if (!back) D.line(ctx, x - 11 * s, top + 2 * s, x + 9 * s, top + h * 0.45, '#ef6b6b', 2.2 * s);
      D.line(ctx, x + 16 * s, bot + 2 * s, x + 20 * s, top - 18 * s, '#7a5a3a', 2.2 * s);
      D.egg(ctx, x + 20.5 * s, top - 21 * s, 2.8 * s, 6 * s, '#6a4426', { lw: 1.2 });
      return;
    }
    return baseBody.call(this, ctx, c, x, top, bot, s, dir);
  };
  const baseHat = D.costumeHat;
  D.costumeHat = function (ctx, c, x, hy, s, dir) {
    if (c === 'moth') {
      // a glowing lampshade hat with two felt antennae poking out of the top
      for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + k * 3 * s, hy - 26 * s); ctx.quadraticCurveTo(x + k * 5 * s, hy - 38 * s, x + k * 12 * s, hy - 42 * s); stroke(ctx, 1.8); D.ball(ctx, x + k * 12 * s, hy - 42 * s, 2.6 * s, k > 0 ? '#ff9ec7' : '#a68be6', { lw: 1 }); }
      const g = ctx.createRadialGradient(x, hy - 14 * s, 2, x, hy - 14 * s, 30 * s);
      g.addColorStop(0, 'rgba(255,236,150,0.45)'); g.addColorStop(1, 'rgba(255,236,150,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 30 * s, hy - 44 * s, 60 * s, 60 * s);
      D.poly(ctx, [x - 18 * s, hy - 8 * s, x + 18 * s, hy - 8 * s, x + 10 * s, hy - 28 * s, x - 10 * s, hy - 28 * s], '#fff3b0', C.ink, 1.8);
      D.line(ctx, x - 16 * s, hy - 12 * s, x + 16 * s, hy - 12 * s, '#e8c060', 1.4);
      return;
    }
    if (c === 'reed') {
      // a woven cap with a long grey heron feather
      ctx.beginPath(); ctx.arc(x, hy - 6 * s, 15 * s, Math.PI, 0); ctx.closePath();
      D.fillVol(ctx, x - 3 * s, hy - 12 * s, 15 * s, '#c9a26a', 2);
      for (let i = -2; i <= 2; i++) D.line(ctx, x + i * 5 * s, hy - 7 * s, x + i * 4 * s, hy - 19 * s, 'rgba(110,80,40,0.4)', 1.2);
      ctx.beginPath(); ctx.moveTo(x + 6 * s, hy - 16 * s); ctx.quadraticCurveTo(x + 20 * s, hy - 40 * s, x + 26 * s, hy - 38 * s); ctx.quadraticCurveTo(x + 16 * s, hy - 26 * s, x + 10 * s, hy - 15 * s);
      D.fillVol(ctx, x + 16 * s, hy - 28 * s, 10 * s, '#d6dde6', 1.5);
      return;
    }
    return baseHat.call(this, ctx, c, x, hy, s, dir);
  };

  // ================================================================ ART: battle forms
  const baseGiant = D.giant;
  D.giant = function (ctx, type, x, y, o = {}) {
    if (type !== 'moth' && type !== 'reed') return baseGiant.call(this, ctx, type, x, y, o);
    const t = CK.time, s = o.s || 1, who = o.who || 'sam';
    const b = Math.sin(t * 2.2 + (o.seed || 0)) * 2;
    D.shadow(ctx, x, y, 62 * s, 14 * s, 0.3);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (o.flash) ctx.filter = 'brightness(1.8)';
    if (type === 'moth') {
      // a great soft moth: lantern-paper wings with eye spots, a fuzzy body, and a glowing
      // lampshade head with the wearer's face in the window
      const flap = Math.sin(t * 3) * 0.08;
      for (const k of [-1, 1]) {
        ctx.save(); ctx.translate(k * 24, -120 + b); ctx.rotate(k * (0.25 + flap));
        ctx.beginPath(); ctx.ellipse(k * 52, -18, 60, 46, k * -0.3, 0, TAU);
        ctx.fillStyle = 'rgba(232,222,255,0.95)'; ctx.fill(); stroke(ctx, 3);
        ctx.beginPath(); ctx.ellipse(k * 44, 34, 38, 28, k * 0.4, 0, TAU); ctx.fillStyle = 'rgba(214,200,255,0.95)'; ctx.fill(); stroke(ctx, 3);
        D.circle(ctx, k * 58, -20, 16, '#fff3b0', C.ink, 2.5); D.circle(ctx, k * 58, -20, 8, '#a68be6', C.ink, 2);
        for (let i = 0; i < 4; i++) D.line(ctx, k * 10, -6 + i * 8, k * (70 - i * 6), -40 + i * 18, 'rgba(120,90,180,0.25)', 2);
        ctx.restore();
      }
      // cardboard legs, a fuzzy striped body box and a big lace ruff
      for (const k of [-1, 1]) D.box3(ctx, k * 16 - 9, -40, 18, 40, 8, { fill: '#c9b48e', lw: 3, flute: false });
      D.box3(ctx, -40, -132 + b, 80, 94, 16, { r: 14, fill: '#f6ecd6', lw: 3, flute: false });
      ctx.save(); D.rr(ctx, -40, -132 + b, 80, 94, 14); ctx.clip();
      for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? 'rgba(166,139,230,0.35)' : 'rgba(255,255,255,0)'; ctx.fillRect(-40, -116 + b + i * 20, 80, 14); }
      for (let i = 0; i < 40; i++) D.circle(ctx, -36 + U.hash(i, 21) * 72, -128 + b + U.hash(i, 22) * 88, 1.5, 'rgba(150,120,80,0.25)');
      ctx.restore();
      for (let i = -3; i <= 3; i++) D.ball(ctx, i * 12, -134 + b + Math.abs(i) * 2, 9, '#fffaf0', { lw: 2 });
      const glow = ctx.createRadialGradient(0, -168 + b, 6, 0, -168 + b, 70);
      glow.addColorStop(0, 'rgba(255,240,160,0.6)'); glow.addColorStop(1, 'rgba(255,240,160,0)');
      ctx.fillStyle = glow; ctx.fillRect(-80, -240 + b, 160, 150);
      ctx.beginPath(); ctx.moveTo(-46, -134 + b); ctx.lineTo(46, -134 + b); ctx.lineTo(28, -200 + b); ctx.lineTo(-28, -200 + b); ctx.closePath();
      ctx.fillStyle = D.lgx(ctx, -46, 46, '#fff3b0'); ctx.fill(); stroke(ctx, 3);
      D.rr(ctx, -22, -186 + b, 44, 38, 12); ctx.fillStyle = '#fff8dc'; ctx.fill();
      ctx.save(); D.rr(ctx, -22, -186 + b, 44, 38, 12); ctx.clip(); D.peekFace(ctx, who, 0, -165 + b, 18, o.mood); ctx.restore();
      D.rr(ctx, -22, -186 + b, 44, 38, 12); stroke(ctx, 3);
      for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 10, -200 + b); ctx.quadraticCurveTo(k * 16, -238 + b, k * 40, -246 + b); stroke(ctx, 4); D.ball(ctx, k * 40, -246 + b, 8, k > 0 ? '#ff9ec7' : '#a68be6', { lw: 2 }); }
    } else {
      // a tall warden woven from river reeds, a basket helmet with a feather, the cattail staff
      for (const k of [-1, 1]) D.box3(ctx, k * 18 - 10, -40, 20, 40, 8, { fill: '#6a9a4a', lw: 3, flute: false });
      ctx.beginPath(); ctx.moveTo(-50, -40); ctx.lineTo(-40, -150 + b); ctx.lineTo(40, -150 + b); ctx.lineTo(50, -40); ctx.closePath();
      D.fillVol(ctx, -6, -100 + b, 50, '#7ab85a', 3);
      ctx.save(); ctx.clip();
      for (let i = -9; i <= 9; i++) D.line(ctx, i * 6, -40, i * 5, -150 + b, i % 2 ? 'rgba(60,110,40,0.5)' : 'rgba(170,220,130,0.5)', 3);
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(-50, -40); ctx.lineTo(-40, -150 + b); ctx.lineTo(40, -150 + b); ctx.lineTo(50, -40); ctx.closePath(); stroke(ctx, 3);
      D.rr(ctx, -46, -108 + b, 92, 14, 4); ctx.fillStyle = '#c9a26a'; ctx.fill(); stroke(ctx, 2.5);
      D.line(ctx, -40, -146 + b, 30, -58 + b, '#ef6b6b', 6);
      // basket helmet with a face window and a heron feather
      ctx.beginPath(); ctx.ellipse(0, -176 + b, 40, 34, 0, 0, TAU); D.fillVol(ctx, -8, -184 + b, 40, '#c9a26a', 3);
      ctx.save(); ctx.beginPath(); ctx.ellipse(0, -176 + b, 40, 34, 0, 0, TAU); ctx.clip();
      for (let i = -6; i <= 6; i++) D.line(ctx, i * 7, -212 + b, i * 7 + 4, -140 + b, 'rgba(110,80,40,0.3)', 2);
      for (let j = 0; j < 5; j++) D.line(ctx, -42, -200 + b + j * 12, 42, -196 + b + j * 12, 'rgba(110,80,40,0.25)', 2);
      ctx.restore();
      D.rr(ctx, -22, -192 + b, 44, 34, 12); ctx.fillStyle = '#fff8dc'; ctx.fill();
      ctx.save(); D.rr(ctx, -22, -192 + b, 44, 34, 12); ctx.clip(); D.peekFace(ctx, who, 0, -173 + b, 17, o.mood); ctx.restore();
      D.rr(ctx, -22, -192 + b, 44, 34, 12); stroke(ctx, 3);
      ctx.beginPath(); ctx.moveTo(18, -204 + b); ctx.quadraticCurveTo(50, -262 + b, 66, -256 + b); ctx.quadraticCurveTo(44, -230 + b, 28, -200 + b); D.fillVol(ctx, 40, -230 + b, 18, '#d6dde6', 3);
      // the cattail staff
      ctx.save(); ctx.translate(-62, -60 + b); ctx.rotate(-0.15 + (o.swing || 0) * 0.6);
      D.rr(ctx, -4, -150, 8, 160, 4); ctx.fillStyle = '#8a6a3a'; ctx.fill(); stroke(ctx, 2.5);
      D.egg(ctx, 0, -164, 11, 22, '#6a4426', { lw: 2.5 });
      ctx.restore();
    }
    ctx.restore();
  };

  // ================================================================ BATTLE
  const baseSpecial = CK.Battle.prototype.special;
  CK.Battle.prototype.special = function* (m, target) {
    const s = m.costume;
    if (s !== 'moth' && s !== 'reed') return yield* baseSpecial.call(this, m, target);
    this.banner = { text: Data.costumes[s].special + '!', t: 0, small: true };
    CK.Audio.sfx('magic');
    yield 0.6;
    this.banner = null;
    if (s === 'moth') {
      this.beam = 0.8; CK.tween(this, { beam: 0 }, 1.2, 'inQuad');
      for (const e of this.alive('enemy')) {
        e.inspected = true; e.marked = 2; e.markMul = 1.4;
        this.pop(e, 'Weak spot!', '#ffd25a', 20, -40);
        this.parts.burst(8, () => ({ x: e.pos.x + U.rand(-40, 40), y: e.pos.y - U.rand(40, 160), vx: U.rand(-30, 30), vy: -40, life: 1, size: 5, shape: 'star', color: '#e6dcff' }));
      }
      for (const p of this.alive('party')) { const amt = Math.round(p.maxHp * 0.12); p.hp = Math.min(p.maxHp, p.hp + amt); this.pop(p, '+' + amt, '#7be07b'); }
      CK.Audio.sfx('heal');
      yield 1;
    } else {
      this.barricade = 3; this.barT = 0; CK.tween(this, { barT: 1 }, 0.4, 'outBack');
      for (const p of this.alive('party')) { const amt = Math.round(p.maxHp * 0.1); p.hp = Math.min(p.maxHp, p.hp + amt); p.soak = 0; p.floppy = false; this.pop(p, 'Reed Wall!', '#9fe07a', 20); }
      for (let i = 0; i < 3; i++) this.parts.burst(8, () => ({ x: 545 + U.rand(-30, 30), y: 470, vx: U.rand(-60, 60), vy: U.rand(-260, -120), g: 400, life: 0.9, size: 6, shape: 'leaf', color: '#7ab85a', spin: 4 }));
      CK.Audio.sfx('block');
      yield 0.9;
    }
  };

  // a brighter Costume Quest transformation: a ring of stars and a pop of light as each costume unfolds
  const baseIntro = CK.Battle.prototype.intro;
  CK.Battle.prototype.intro = function* () {
    for (const m of this.party) {
      const p = m.pos, col = (Data.costumes[m.costume] || {}).color || '#ffd25a';
      CK.co(function* () {
        yield 0.4;
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * TAU;
          this.parts.emit({ x: p.x, y: p.y - 90, vx: Math.cos(a) * 260, vy: Math.sin(a) * 200, life: 0.7, size: 7, shape: 'star', color: i % 2 ? '#fff3b0' : col, spin: 6 });
        }
        this.parts.emit({ x: p.x, y: p.y - 230, vy: -30, life: 1.2, size: 18, shape: 'text', text: Data.costumes[m.costume].name + '!', color: '#fffaf0', pop: true, fade: true });
        this.flashT = 1;
      }.bind(this));
    }
    yield* baseIntro.call(this);
  };
  const baseDrawBg = CK.Battle.prototype.drawBg;
  CK.Battle.prototype.drawBg = function (ctx) {
    baseDrawBg.call(this, ctx);
    if (this.flashT > 0) {
      for (const m of this.party) {
        const g = ctx.createRadialGradient(m.pos.x, m.pos.y - 100, 10, m.pos.x, m.pos.y - 100, 170);
        g.addColorStop(0, `rgba(255,248,200,${0.75 * this.flashT})`); g.addColorStop(1, 'rgba(255,248,200,0)');
        ctx.fillStyle = g; ctx.fillRect(m.pos.x - 170, m.pos.y - 270, 340, 340);
      }
      this.flashT = Math.max(0, this.flashT - 1 / 60 * 1.4);
    }
  };

  // ================================================================ FIELD POWERS
  const baseAny = CK.Overworld.prototype.anyWearing;
  CK.Overworld.prototype.anyWearing = function (c) {
    return baseAny.call(this, c) || (c === 'lighthouse' && baseAny.call(this, 'moth'));
  };
  const baseSolid = CK.Overworld.prototype.solidAt;
  CK.Overworld.prototype.solidAt = function (px, py, ignore, who) {
    if (who != null && this.costumeOf(who) === 'reed' && this.map.get(Math.floor(px / TS), Math.floor(py / TS)) === 'h') {
      const own = this.costumeOf;
      this.costumeOf = (w) => (own.call(this, w) === 'reed' ? 'bridge' : own.call(this, w));
      try { return baseSolid.call(this, px, py, ignore, who); } finally { this.costumeOf = own; }
    }
    return baseSolid.call(this, px, py, ignore, who);
  };

  // ================================================================ TANSY SEWS THEM
  function sewScript(c) {
    const cd = Data.costumes[c];
    return [
      ['tansy', `All three pieces of the ${cd.name}! Give them here. Don't watch. Okay, watch. But don't watch my face, I make a face.`, 'happy'],
      { narrate: 'Tansy sews, glues, tapes, re-sews, says a word you didn\'t know dormice knew, and holds it up.' },
      { give: c },
      ['tansy', c === 'moth' ? 'One wing\'s bigger than the other. Real moths do that too. I looked it up. I didn\'t look it up.' : 'The skirt rustles when you walk. It sounds like a river being polite.', 'happy'],
      { journal: `Tansy sewed the ${cd.name} costume from the pieces our friends gave us.` },
      { save: true },
    ];
  }
  S.ph_parade = [
    ['tansy', 'You know what a new costume needs? A PARADE. Tonight. Everyone. I\'ve already told Pell. Pell has already told everyone.', 'happy'],
    { night: true, label: 'That night, at Patchwork Hall...' },
    { await: () => show(new ParadeScene()) },
    ['brindle', 'Best float: mine. Flowers. Obviously.', 'happy'],
    ['tansy', 'Best costume: everyone. That\'s the rule. I made it up.', 'happy'],
    ['corry', 'I have never been in a parade. I have been in a box. This is better.', 'happy'],
    ['sam', 'Every single one of those costumes was homemade. Wonky. Taped. And look at everybody.', 'happy'],
    { flag: 'ph_parade_done' },
    { journal: 'Tansy threw a Costume Parade at Patchwork Hall. The whole Kingdom came. Every costume was homemade. Best costume: everyone.' },
    { save: true },
  ];
  // Tansy's talk now covers pieces, sewing and the parade (wraps the Patchwork Hall version)
  CK.Story.costumeTalk = function () {
    for (const c of ['moth', 'reed']) if (complete(c) && !sewn(c)) return sewScript(c);
    if ((sewn('moth') || sewn('reed')) && !f('ph_parade_done')) return 'ph_parade';
    const missing = Object.keys(PIECES).filter((k) => !got(k) && f(PIECES[k].need) && !PIECES[k].giver.includes('tansy'));
    if (missing.length) return [['tansy', `I'm designing two new costumes, the Lantern Moth and the Reed Warden. I need pieces from friends. Try ${PIECES[missing[0]].where}.`, 'happy']];
    if (Object.keys(PIECES).some((k) => !got(k))) return [['tansy', 'Two new costumes on my sketch pad: a Lantern Moth and a Reed Warden. The pieces will come from friends you haven\'t finished helping yet. That\'s how the good pieces always come.', 'happy']];
    return null;
  };
  const tansy = CK.Chapters.patchwork.objects.find((o) => o.id === 'tansy');
  if (tansy) {
    const baseTalk = tansy.talk;
    tansy.talk = () => {
      if (!f('ph_tansy') || !f('ph_made')) return baseTalk();
      return CK.Story.costumeTalk() || baseTalk();
    };
  }
  const baseObjective = CK.Chapters.patchwork.objective;
  CK.Chapters.patchwork.objective = function (G) {
    for (const c of ['moth', 'reed']) if (complete(c) && !sewn(c)) return `Bring the ${Data.costumes[c].name} pieces to Tansy`;
    if ((sewn('moth') || sewn('reed')) && !f('ph_parade_done')) return 'Tansy is planning something. Talk to her!';
    return baseObjective.call(this, G);
  };

  // ================================================================ THE PARADE
  // Night street in front of Patchwork Hall: lanterns, bunting, a crowd, and everyone you've met
  // marching past in homemade costumes, with Brindle's flower float at the end.
  const MARCH = [
    { look: 'sam', o: { costume: 'moth' } }, { look: 'jules', o: { costume: 'reed' } }, { look: 'corry', o: { costume: 'knight' } }, { look: 'pip', o: { costume: 'kite' } },
    { look: 'mayor', o: {} }, { look: 'bess', o: { s: 0.8 } }, { look: 'mallow', o: { s: 0.9 } }, { look: 'pelican', o: {} },
    { look: 'puffin', o: {} }, { look: 'walrus', o: { s: 0.85 } }, { look: 'heron', o: { s: 0.85 } }, { look: 'rook', o: {} },
    { look: 'ibis', o: {} }, { look: 'wick', o: {} }, { look: 'grandma', o: {} }, { look: 'dormouse', o: {} }, { float: true },
  ];
  class ParadeScene {
    constructor() { this.t = 0; this.finished = false; this.parts = new CK.Particles(); this.dur = 16; }
    enter() { CK.Audio.sfx('win'); if (CK.autoSkip) this.close(); }
    close() { this.finished = true; CK.Scenes.remove(this); }
    update(dt) {
      this.t += dt; this.parts.update(dt);
      if (Math.random() < dt * 30) this.parts.emit({ x: U.rand(0, W), y: -10, vx: U.rand(-30, 30), vy: U.rand(60, 120), sway: 30, life: 6, size: U.rand(4, 7), shape: 'square', spin: 6, color: U.pick(['#ef6b6b', '#ffd25a', '#6cc56c', '#5aa9e6', '#ff9ec7', '#a68be6']), fade: false });
      if (this.t > 1 && (Input.hit('ok') || Input.mouse.pressed)) this.skip = true;
      if (this.t > this.dur || (this.skip && this.t > 2)) this.close();
    }
    draw(ctx) {
      const t = this.t;
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1d1a4a'); g.addColorStop(0.6, '#4b2f62'); g.addColorStop(1, '#2a1d14');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 50; i++) { const tw = 0.5 + Math.sin(t * 2 + i) * 0.5; D.star(ctx, U.hash(i, 1) * W, U.hash(i, 2) * 160, 1.5 + tw * 1.5, `rgba(255,248,200,${0.3 + tw * 0.6})`, 4); }
      // the hall behind, windows glowing
      D.box3(ctx, 230, 120, 500, 200, 30, { r: 2, lw: 4, fill: '#a9805a', flute: false });
      for (let i = 0; i < 5; i++) { D.rr(ctx, 262 + i * 92, 170, 60, 50, 6); ctx.fillStyle = '#ffd76a'; ctx.fill(); stroke(ctx, 3); }
      const cols = ['#ef6b6b', '#ffd25a', '#6cc56c', '#5aa9e6', '#ff9ec7', '#a68be6'];
      for (const yy of [110, 240]) { ctx.beginPath(); ctx.moveTo(0, yy); ctx.quadraticCurveTo(W / 2, yy + 40, W, yy); stroke(ctx, 2, '#fff4dc'); for (let i = 0; i < 24; i++) { const u = i / 23, px = u * W, py = yy + Math.sin(u * Math.PI) * 30; D.poly(ctx, [px - 9, py, px + 9, py, px, py + 16 + Math.sin(t * 3 + i) * 2], cols[i % 6], C.ink, 1.5); } }
      // the street
      ctx.fillStyle = '#6a4a3a'; ctx.fillRect(0, 330, W, 130);
      for (let i = 0; i < 20; i++) D.rr(ctx, ((i * 70 - t * 10) % (W + 70)) - 35, 392, 40, 6, 3), (ctx.fillStyle = 'rgba(255,255,255,0.15)'), ctx.fill();
      // lanterns along the street
      for (let i = 0; i < 7; i++) {
        const lx = 60 + i * 140;
        const lg = ctx.createRadialGradient(lx, 300, 4, lx, 300, 90); lg.addColorStop(0, 'rgba(255,220,140,0.45)'); lg.addColorStop(1, 'rgba(255,220,140,0)');
        ctx.fillStyle = lg; ctx.fillRect(lx - 90, 210, 180, 180);
        D.line(ctx, lx, 330, lx, 292, C.ink, 3); D.rr(ctx, lx - 8, 276, 16, 18, 5); ctx.fillStyle = '#ffd76a'; ctx.fill(); stroke(ctx, 2);
      }
      // the marchers, left to right
      MARCH.forEach((mk, i) => {
        const x = -80 + (t * 95) - i * 78, y = 420;
        if (x < -120 || x > W + 140) return;
        if (mk.float) return this.drawFloat(ctx, x, y);
        D.char(ctx, mk.look, x, y + Math.abs(Math.sin(t * 6 + i)) * -4, Object.assign({ s: 1.35, dir: 'right', mood: 'happy', walk: t * 8 + i }, mk.o));
      });
      // the crowd in front, cheering silhouettes
      for (let i = 0; i < 16; i++) {
        const cx = i * 64 + 20, cy = 540 - Math.abs(Math.sin(t * 5 + i * 1.3)) * 8;
        ctx.fillStyle = 'rgba(25,15,30,0.92)'; ctx.beginPath(); ctx.arc(cx, cy - 34, 18, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx, cy, 26, 22, 0, Math.PI, 0); ctx.fill();
        if (i % 3 === 0) { ctx.beginPath(); ctx.arc(cx - 12, cy - 54, 6, 0, TAU); ctx.arc(cx + 12, cy - 54, 6, 0, TAU); ctx.fill(); }
        if (i % 4 === 1) { D.line(ctx, cx + 14, cy - 30, cx + 22, cy - 66 - Math.sin(t * 8 + i) * 4, 'rgba(25,15,30,0.92)', 6); }
      }
      this.parts.draw(ctx);
      D.text(ctx, 'THE PATCHWORK HALL COSTUME PARADE', W / 2, 46, { size: 26, weight: 700, align: 'center', color: '#fff4dc', outline: C.ink, ow: 5 });
      if (t > 2) D.text(ctx, 'Z / click to skip', W - 16, H - 10, { size: 12, align: 'right', color: '#e8d4b8' });
    }
    drawFloat(ctx, x, y) {
      D.shadow(ctx, x, y + 6, 90, 12, 0.4);
      D.box3(ctx, x - 90, y - 40, 180, 40, 16, { r: 6, lw: 3, fill: '#6cc56c', flute: false });
      for (let i = 0; i < 11; i++) { const fx = x - 80 + i * 16, fy = y - 48 - (i % 2) * 10; for (let p = 0; p < 5; p++) D.circle(ctx, fx + Math.cos(p * 1.26) * 6, fy + Math.sin(p * 1.26) * 6, 5, ['#ff9ec7', '#ffd25a', '#fffaf0', '#ef6b6b'][i % 4]); D.circle(ctx, fx, fy, 3, '#ffcf3a'); }
      for (const k of [-1, 1]) D.circle(ctx, x + k * 60, y + 2, 14, '#d9a66b', C.ink, 3);
      D.char(ctx, 'badger', x + 10, y - 58, { s: 1.3, dir: 'right', mood: 'happy' });
      D.text(ctx, 'BEST FLOAT (self-awarded)', x, y - 12, { size: 11, weight: 700, align: 'center', color: '#fffaf0', outline: C.ink, ow: 3 });
    }
  }
  CK.ParadeScene = ParadeScene;
  CK.debugCostume = {
    allPieces() { CK.G.pieces = {}; for (const k of Object.keys(PIECES)) CK.G.pieces[k] = true; },
  };
})();
