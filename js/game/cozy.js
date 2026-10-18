// Cardboard Kingdom - cozy pass (v2.10): Costume Quest + Animal Crossing touches on the overworld.
//  * Water: foamy shorelines, slow ripples and little sparkles, so rivers and the sea feel alive.
//  * Trees: walk up to one and shake it. Leaves fall; fruit trees drop a juice box (once per tree).
//  * Name tags: the talk prompt says who you're about to talk to.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U;
  const TS = CK.TS || 48, W = CK.W, H = CK.H;
  const C = D.C;
  const OW = CK.Overworld.prototype;

  // ================================================================ WATER
  const baseWater = OW.drawWater;
  OW.drawWater = function (ctx, ox, oy) {
    const m = this.map;
    const x0 = Math.floor(ox / TS) - 1, y0 = Math.floor(oy / TS) - 1;
    const wet = (x, y) => m.get(x, y) === '~';
    const t = this.t;
    ctx.save();
    ctx.lineCap = 'round';
    // white foam where the water meets the bank, gently breathing in and out
    for (let y = y0; y <= y0 + 13; y++)
      for (let x = x0; x <= x0 + 22; x++) {
        if (!wet(x, y)) continue;
        const X = x * TS - ox, Y = y * TS - oy + 7;
        const k = 0.5 + Math.sin(t * 1.6 + U.hash(x, y, 3) * 6) * 0.5;
        ctx.strokeStyle = `rgba(255,255,255,${0.55 + k * 0.3})`;
        ctx.lineWidth = 3 + k * 1.5;
        const inset = 5 + k * 2;
        const edge = (x1, y1, x2, y2, nx, ny) => {
          ctx.beginPath();
          for (let i = 0; i <= 4; i++) {
            const a = i / 4, px = x1 + (x2 - x1) * a + nx * (inset + Math.sin(t * 2 + i + x) * 1.5), py = y1 + (y2 - y1) * a + ny * (inset + Math.sin(t * 2 + i + y) * 1.5);
            if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
          }
          ctx.stroke();
        };
        const land = (dx, dy) => { const tt = m.get(x + dx, y + dy); return tt && tt !== '~' && !'bBdh'.includes(tt); };
        if (land(0, -1)) edge(X + 4, Y, X + TS - 4, Y, 0, 1);
        if (land(0, 1)) edge(X + 4, Y + TS - 8, X + TS - 4, Y + TS - 8, 0, -1);
        if (land(-1, 0)) edge(X, Y + 4, X, Y + TS - 10, 1, 0);
        if (land(1, 0)) edge(X + TS, Y + 4, X + TS, Y + TS - 10, -1, 0);
      }
    ctx.restore();
    baseWater.call(this, ctx, ox, oy);
    // sparkles that blink on and off across open water
    for (let y = y0; y <= y0 + 13; y++)
      for (let x = x0; x <= x0 + 22; x++) {
        if (!wet(x, y)) continue;
        const h = U.hash(x, y, 8);
        if (h > 0.35) continue;
        const ph = (t * 0.7 + h * 13) % 3;
        if (ph > 0.6) continue;
        const a = Math.sin((ph / 0.6) * Math.PI);
        const X = x * TS - ox + 8 + U.hash(x, y, 9) * 32, Y = y * TS - oy + 14 + U.hash(x, y, 10) * 26;
        D.star(ctx, X, Y, 2 + a * 4, `rgba(255,255,255,${a})`, 4, 0);
      }
  };

  // ================================================================ TREES
  const FRUIT = { spring: '#ff7a9c', fall: '#e8403a', riverbend: '#ff9f6a', campusColor: '#ef5a5a', patchwork: '#ff8fb1', ferryyard: '#ffa53a' };
  const interior = (ow, tr) => tr.x > 1 && tr.y > 1 && tr.x < ow.map.w - 2 && tr.y < ow.map.h - 2;
  const fruity = (ow, tr) => FRUIT[ow.seasonId] && tr.seed < 0.34 && interior(ow, tr);
  const shookKey = (ow, tr) => `shook_${ow.ch.id}_${tr.x}_${tr.y}`;

  const baseTree = OW.drawTree;
  OW.drawTree = function (ctx, tr) {
    const x = tr.px - this.camX, y = tr.py - this.camY;
    if (x < -80 || x > W + 80 || y < -20 || y > H + 120) return;
    const sh = tr.shake || 0;
    ctx.save();
    if (sh > 0) { ctx.translate(x, y); ctx.rotate(Math.sin(this.t * 40) * 0.05 * sh); ctx.translate(-x, -y); }
    baseTree.call(this, ctx, tr);
    // fruit hangs in the canopy until you shake it down
    if (fruity(this, tr) && !CK.flag(shookKey(this, tr)) && this.season.tree !== 'pine' && this.season.tree !== 'palm') {
      const col = FRUIT[this.seasonId];
      for (let i = 0; i < 3; i++) {
        const fx = x - 18 + i * 17 + (i === 1 ? 2 : 0), fy = y - 52 - (i === 1 ? 14 : 0);
        D.ball(ctx, fx, fy, 5.5, col, { lw: 1.6 });
        D.line(ctx, fx, fy - 5, fx + 2, fy - 8, '#4a7a3a', 1.6);
      }
    }
    ctx.restore();
  };

  // face a tree that isn't part of the forest wall, and you can shake it
  const baseFocus = OW.findFocus;
  OW.findFocus = function (p, who) {
    const f = baseFocus.call(this, p, who);
    if (f) return f;
    p = p || this.player;
    const fx = p.x + (p.dir === 'left' ? -30 : p.dir === 'right' ? 30 : 0);
    const fy = p.y + (p.dir === 'up' ? -30 : p.dir === 'down' ? 26 : -4);
    const tx = Math.floor(fx / TS), ty = Math.floor(fy / TS);
    const tr = this.trees && this.trees.find((t) => t.x === tx && t.y === ty);
    if (!tr || !interior(this, tr)) return null;
    return { type: 'tree', tree: tr, ix: tr.px, iy: tr.py - 10, promptLabel: 'Shake' };
  };
  const baseInteract = OW.interact;
  OW.interact = function (e, who) {
    if (!e || e.type !== 'tree') return baseInteract.call(this, e, who);
    const tr = e.tree;
    tr.shake = 1;
    CK.tween(tr, { shake: 0 }, 0.6, 'outQuad');
    CK.Audio.sfx('whoosh');
    const leaf = { petal: '#ffc1dc', leaf: '#f2a93b', snow: '#ffffff', sparkle: '#7ad67a' }[this.season.particle] || '#7ad67a';
    this.fx.burst(14, () => ({ x: tr.px + U.rand(-26, 26), y: tr.py - U.rand(40, 80), vx: U.rand(-60, 60), vy: U.rand(-40, 20), g: 160, life: 1.4, size: 5, shape: this.season.particle === 'snow' ? 'snow' : 'leaf', color: leaf, spin: 4, sway: 20 }));
    const key = shookKey(this, tr);
    if (fruity(this, tr) && !CK.flag(key) && this.season.tree !== 'pine' && this.season.tree !== 'palm') {
      CK.setFlag(key);
      const col = FRUIT[this.seasonId];
      this.fx.burst(3, () => ({ x: tr.px + U.rand(-18, 18), y: tr.py - 50, vx: U.rand(-40, 40), vy: -60, g: 600, life: 0.9, size: 6, shape: 'circle', color: col }));
      CK.G.snacks++;
      CK.Audio.sfx('coin');
      CK.toast('Fruit! Squished into a juice box. (+1 juice box)', '#ffe3ef');
    } else if (U.hash(tr.x, tr.y, 77) < 0.12 && !CK.flag(key)) {
      CK.setFlag(key);
      CK.G.scraps += 3;
      CK.Audio.sfx('coin');
      CK.toast('A bundle of cardboard scraps was stuck in the branches! (+3)');
    } else if (!CK.flag(key + '_bug') && U.hash(tr.x, tr.y, 78) < 0.2) {
      CK.setFlag(key + '_bug');
      this.fx.burst(1, () => ({ x: tr.px, y: tr.py - 60, vx: U.rand(-40, 40), vy: -50, life: 2, size: 9, shape: 'star', color: '#ffd25a' }));
      CK.toast(U.pick(['A beetle in a tiny cardboard helmet scurries off.', 'A moth says "excuse me" and flies away.', 'A ladybug lands on Corry. He is honored.']));
    }
    if (CK.OW === this) CK.saveGame();
  };

  // ================================================================ NAME TAGS
  const NAMES = [
    ['pell_', 'Pell'], ['mayor', 'Mayor Mossworth'], ['clover', 'Clover'], ['robin', 'Robin'], ['bess', 'Captain Bess'], ['skipper', 'Skipper'],
    ['dabble', 'Dabble'], ['nib', 'Nib'], ['ember', 'Ember'], ['bristle', 'Bristle'], ['hoot', 'Professor Hoot'], ['queen', 'Queen Corrina'],
    ['mama', 'Mama Burrow'], ['grandma', 'Grandma Rosie'], ['lux', 'Mr. Lux'], ['gale', 'Keeper Gale'], ['brack', 'Harbormaster Brack'],
    ['oldtin', 'Old Tin'], ['tin_', 'Old Tin'], ['rook_lb', 'Inspector Rook'], ['rook_insp', 'Inspector Rook'], ['rook', 'Mortimer Rook'],
    ['jules', 'Jules'], ['tess', 'Tess'], ['penwright', 'Mr. Penwright'], ['okafor', 'Dr. Okafor'], ['corvin', 'Corvin'], ['tansy', 'Tansy'],
    ['brindle', 'Brindle'], ['dusk', 'Elder Dusk'], ['delgado', 'Mr. Delgado'], ['mallow', 'Mallow'], ['ibis', 'Ibis'], ['wick', 'Grandpa Wick'],
  ];
  CK.npcName = (e) => e.name || (NAMES.find(([k]) => e.id && e.id.startsWith(k)) || [])[1] || null;
  CK.promptLabel = (f) => {
    if (f.type !== 'npc') return null;
    const n = CK.npcName(f);
    return n ? 'Talk to ' + n : null;
  };
})();
