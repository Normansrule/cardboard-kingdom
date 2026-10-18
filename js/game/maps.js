// Cardboard Kingdom - tile map builder and the four season chapters.
(function () {
  'use strict';
  const CK = window.CK;
  const U = CK.U;

  // Tile legend
  // . ground   , ground decor   = path   s sand   ~ water   T tree   R rock
  // f fence    d dock           b bridge B broken bridge   w cardboard wall   S snowdrift   i ice
  // Q Silver Quill barricade (Bulldozer shoves it)   h shallows (Suspension Bridge spans it)
  const SOLID = new Set(['~', 'T', 'R', 'f', 'B', 'w', 'S', 'Q']);
  CK.SOLID = SOLID;

  class TMap {
    constructor(w, h, fill) {
      this.w = w;
      this.h = h;
      this.t = [];
      for (let y = 0; y < h; y++) this.t.push(new Array(w).fill(fill || '.'));
    }
    in(x, y) {
      return x >= 0 && y >= 0 && x < this.w && y < this.h;
    }
    get(x, y) {
      return this.in(x, y) ? this.t[y][x] : 'T';
    }
    set(x, y, c) {
      if (this.in(x, y)) this.t[y][x] = c;
    }
    rect(x, y, w, h, c) {
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c);
    }
    ellipse(cx, cy, rx, ry, c) {
      for (let j = Math.floor(cy - ry); j <= Math.ceil(cy + ry); j++)
        for (let i = Math.floor(cx - rx); i <= Math.ceil(cx + rx); i++)
          if (((i - cx) / rx) ** 2 + ((j - cy) / ry) ** 2 <= 1) this.set(i, j, c);
    }
    border(c) {
      for (let x = 0; x < this.w; x++) {
        if (this.get(x, 0) !== '~') this.set(x, 0, c);
        if (this.get(x, this.h - 1) !== '~') this.set(x, this.h - 1, c);
      }
      for (let y = 0; y < this.h; y++) {
        if (this.get(0, y) !== '~') this.set(0, y, c);
        if (this.get(this.w - 1, y) !== '~') this.set(this.w - 1, y, c);
      }
    }
    // thick polyline; r = radius in tiles
    river(pts, r, c) {
      for (let k = 0; k < pts.length - 1; k++) {
        const [x1, y1] = pts[k], [x2, y2] = pts[k + 1];
        const n = Math.ceil(Math.hypot(x2 - x1, y2 - y1) * 3);
        for (let s = 0; s <= n; s++) {
          const x = x1 + ((x2 - x1) * s) / n, y = y1 + ((y2 - y1) * s) / n;
          for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + 0.5) this.set(Math.round(x + i), Math.round(y + j), c);
        }
      }
    }
    // axis-aligned path segments; water crossed becomes bridge
    path(pts, c, bridge) {
      for (let k = 0; k < pts.length - 1; k++) {
        let [x, y] = pts[k];
        const [x2, y2] = pts[k + 1];
        while (true) {
          const cur = this.get(x, y);
          if (cur === '~' || cur === 'b' || cur === 'B') this.set(x, y, bridge || 'b');
          else if (cur !== 'd') this.set(x, y, c);
          if (x === x2 && y === y2) break;
          x += Math.sign(x2 - x);
          if (x === x2) y += Math.sign(y2 - y);
        }
      }
    }
    scatter(c, dens, seed, on) {
      on = on || '.,';
      for (let y = 1; y < this.h - 1; y++)
        for (let x = 1; x < this.w - 1; x++) if (on.includes(this.get(x, y)) && U.hash(x, y, seed) < dens) this.set(x, y, c);
    }
    clear(x, y, w, h, c) {
      for (let j = y; j < y + h; j++)
        for (let i = x; i < x + w; i++) if (SOLID.has(this.get(i, j)) && !'~wQS'.includes(this.get(i, j))) this.set(i, j, c || '.');
    }
  }
  CK.TMap = TMap;

  // ------------------------------------------------------------- chapters
  const CH = (CK.Chapters = {});

  // A little walled nook: trees all round, one way in (a barricade, drift or shallows)
  function nook(m, cells, gate, wallTile) {
    const inside = new Set(cells.map(([x, y]) => x + ',' + y));
    for (const [x, y] of cells) {
      m.set(x, y, '.');
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
        const k = x + dx + ',' + (y + dy);
        if (!inside.has(k) && m.get(x + dx, y + dy) !== '~') m.set(x + dx, y + dy, wallTile || 'T');
      }
    }
    m.set(gate[0], gate[1], gate[2]);
  }
  CK.nook = nook;

  // ======================= SPRING: Blossom Hollow ========================
  CH.spring = {
    id: 'spring', name: 'Blossom Hollow', season: 'spring', music: 'spring', w: 40, h: 24,
    start: [2, 11], next: 'summer',
    build(m) {
      m.scatter(',', 0.12, 1);
      m.river([[31, -1], [31, 5], [28, 9], [28, 15], [29, 18]], 1, '~');
      m.ellipse(29, 21.5, 11, 3.6, '~');
      m.path([[1, 11], [38, 11]], '=');
      m.path([[20, 11], [20, 4], [28, 4]], '=');
      m.path([[14, 11], [14, 17], [22, 17]], '=');
      m.rect(23, 17, 3, 4, 'd');
      m.scatter('T', 0.06, 2);
      m.scatter('R', 0.01, 3);
      m.border('T');
      m.rect(1, 10, 1, 3, '=');
    },
    post(m) {
      nook(m, [[2, 2], [3, 2]], [4, 2, 'Q']);
      m.set(4, 1, 'T'); m.set(4, 3, 'T');
      m.rect(37, 19, 1, 2, 'h');
      m.set(37, 21, '.'); m.set(38, 21, '.');
    },
    flood: [[6, 11], [7, 11], [10, 12], [11, 10], [5, 12], [13, 12], [9, 10], [3, 12], [16, 12], [17, 11], [8, 12]],
    objects: [
      { type: 'house', id: 'sp_a', x: 4, y: 9, roof: '#ff8fb1', knock: 'sp_knock_a' },
      { type: 'house', id: 'sp_b', x: 8, y: 9, roof: '#ffd25a', knock: 'sp_knock_b', broken: 'spring_dam' },
      { type: 'house', id: 'sp_c', x: 12, y: 9, roof: '#a68be6', knock: 'sp_knock_c' },
      { type: 'house', id: 'sp_d', x: 4, y: 14, roof: '#6cc56c', knock: 'sp_knock_d', broken: 'spring_dam' },
      { type: 'house', id: 'sp_e', x: 8, y: 14, roof: '#5aa9e6', knock: 'sp_knock_e' },
      { type: 'npc', id: 'mayor', x: 16, y: 9, look: 'mayor', talk: 'sp_mayor' },
      { type: 'npc', id: 'clover', x: 6, y: 17, look: 'critter', o: { species: 'bunny', color: '#fff', hat: 'flowers' }, talk: 'sp_clover' },
      { type: 'npc', id: 'robin', x: 25, y: 12, look: 'critter', o: { species: 'robin', color: '#9a6a4a' }, talk: 'sp_robin' },
      { type: 'npc', id: 'skipper_sp', x: 26, y: 16, look: 'skipper', talk: 'sp_skipper', cond: (G) => CK.flag('spring_boss') },
      { type: 'npc', id: 'bess_sp', x: 24, y: 16, look: 'bess', talk: 'sp_bess_after', cond: (G) => CK.flag('spring_boss') },
      { type: 'bench', x: 12, y: 13 },
      { type: 'site', id: 'spring_dam', x: 29, y: 4, script: 'sp_site' },
      { type: 'sign', x: 3, y: 9, text: 'Blossom Hollow. Pop. 41 bunnies, 9 hedgehogs, 1 tortoise (mayor).' },
      { type: 'sign', x: 27, y: 4, text: 'Blossom Brook. It floods every spring now. It never used to.' },
      { type: 'chest', id: 'sp_light', x: 36, y: 6, script: [{ give: 'lighthouse' }, ['pip', 'A Lighthouse costume! It shines so bright, monsters forget what they were doing.', 'happy']] },
      { type: 'chest', id: 'sp_snack', x: 2, y: 20, script: [{ snacks: 2 }] },
      { type: 'chest', id: 'sp_scrap', x: 36, y: 15, script: [{ scraps: 8 }] },
      { type: 'enemy', id: 'sp_e1', x: 22, y: 7, look: 'swabby', battle: 'sp_swab2', patrol: [[22, 7], [25, 7]] },
      { type: 'enemy', id: 'sp_e2', x: 34, y: 13, look: 'splashling', battle: 'sp_swab3', patrol: [[34, 13], [36, 16]] },
      { type: 'enemy', id: 'sp_e3', x: 35, y: 8, look: 'barnacle', battle: 'sp_barn', patrol: [[33, 8], [36, 8]] },
      { type: 'deco', kind: 'lantern', x: 11, y: 12 },
      { type: 'deco', kind: 'lantern', x: 17, y: 12 },
      { type: 'deco', kind: 'lantern', x: 22, y: 16 },
      { type: 'deco', kind: 'lantern', x: 26, y: 10 },
      { type: 'deco', kind: 'bigtree', x: 17, y: 6 },
      { type: 'deco', kind: 'boat', x: 28, y: 20, cond: () => CK.flag('spring_night') },
      { type: 'stand', x: 18, y: 13, drink: 'blossom tea', color: '#ff9ec7', who: 'bunny', line: "Blossom tea! It's mostly hot water and good intentions.", vendor: { species: 'bunny', color: '#fff', hat: 'flowers' } },
      { type: 'campfire', x: 33, y: 18 },
      { type: 'cat', x: 3, y: 17 },
      { type: 'chest', id: 'sp_parasol', x: 10, y: 21, script: () => (CK.coop ? [{ scraps: 10 }, ['jules', "Scraps! I already have my Parasol. Pip, do you want a hat? I can fold you a hat.", 'happy']] : [{ give: 'umbrella' }, ['pip', 'A Paper Parasol! Water slides right off. Wear it in the rain and you stay dry!', 'happy']]) },
      { type: 'chest', id: 'sp_nook', x: 2, y: 2, script: [{ scraps: 14 }, { narrate: 'Tucked behind the Quill barricade: scraps, and a silver-sealed note. "Hoard the good cardboard. Leave the village the mush. - C."' }] },
      { type: 'chest', id: 'sp_isle', x: 38, y: 21, script: [{ snacks: 2 }, { scraps: 10 }, ['pip', 'You walked on WATER. Well, on a bridge. Over water. Still counts!', 'happy']] },
      { type: 'chest', id: 'sp_hidden', x: 2, y: 21, hidden: true, script: [{ scraps: 12 }, ['corry', 'The Lighthouse found a box nobody could see in the dark. Clever.', 'happy']] },
      { type: 'sign', x: 6, y: 3, text: 'SILVER QUILL PROPERTY. Barricaded. (It looks like a good shove would do it.)' },
      { type: 'trigger', id: 'sp_docks', x: 21, y: 15, w: 6, h: 3, script: 'sp_boss', cond: (G) => CK.flag('spring_night') && !CK.flag('spring_boss') },
    ],
    objective(G) {
      if (!CK.flag('sp_met_mayor')) return 'Find Mayor Mossworth in the village';
      if (!CK.flag('spring_dam')) return 'Build a check dam on Blossom Brook (north path)';
      if (!CK.flag('spring_boss')) return 'Defend the docks from the monster raid!';
      return 'Talk to Captain Bess at the docks';
    },
  };

  // ======================= SUMMER: Sunpatch Shores =======================
  CH.summer = {
    id: 'summer', name: 'Sunpatch Shores', season: 'summer', music: 'summer', w: 40, h: 24,
    start: [2, 15], next: 'fall',
    build(m) {
      m.scatter(',', 0.08, 11);
      m.rect(0, 0, 40, 6, '~');
      m.rect(1, 6, 38, 4, 's');
      m.scatter('z', 0.1, 12, 's');
      m.rect(19, 5, 2, 8, '~');
      m.ellipse(20, 13.5, 2.6, 1.6, '~');
      m.path([[1, 16], [30, 16]], '=');
      m.path([[12, 16], [12, 11]], '=');
      m.path([[24, 16], [24, 11]], '=');
      m.rect(31, 6, 1, 15, 'w');
      m.path([[29, 16], [38, 16]], '=');
      m.rect(21, 11, 2, 1, 'd');
      m.scatter('T', 0.05, 13);
      m.scatter('R', 0.012, 14);
      m.border('T');
      m.rect(1, 15, 1, 3, '=');
      m.set(31, 16, '=');
    },
    post(m) {
      nook(m, [[37, 22], [38, 22]], [37, 21, 'Q']);
      m.set(38, 21, 'T');
      m.rect(26, 3, 1, 3, 'h');
      m.rect(25, 1, 3, 2, 's');
    },
    flood: [[6, 12], [7, 12], [9, 13], [14, 12], [15, 13], [25, 13], [26, 12], [10, 14], [4, 13]],
    objects: [
      { type: 'house', id: 'su_a', x: 5, y: 11, roof: '#5aa9e6', style: 'hut', knock: 'su_knock_a' },
      { type: 'house', id: 'su_b', x: 9, y: 11, roof: '#ef6b6b', style: 'hut', knock: 'su_knock_b', broken: 'summer_gates' },
      { type: 'house', id: 'su_c', x: 14, y: 11, roof: '#6cc56c', style: 'hut', knock: 'su_knock_c' },
      { type: 'house', id: 'su_d', x: 25, y: 11, roof: '#ffd25a', style: 'hut', knock: 'su_knock_d', broken: 'summer_gates' },
      { type: 'house', id: 'su_e', x: 26, y: 18, roof: '#ff8fb1', style: 'hut', knock: 'su_knock_e' },
      { type: 'npc', id: 'dabble', x: 8, y: 17, look: 'critter', o: { species: 'duck', color: '#ffe67a', hat: 'sunhat' }, talk: 'su_dabble' },
      { type: 'npc', id: 'skipper_su', x: 22, y: 12, look: 'skipper', talk: 'su_skipper' },
      { type: 'npc', id: 'nib', x: 16, y: 18, look: 'critter', o: { species: 'mouse', color: '#d6d0cc', hat: 'sunhat' }, talk: 'su_nib' },
      { type: 'npc', id: 'agent_wall', x: 30, y: 15, look: 'magpie', talk: 'su_wallagent', cond: () => !CK.flag('su_wall_beaten') },
      { type: 'npc', id: 'bess_su', x: 4, y: 7, look: 'bess', talk: 'su_bess' },
      { type: 'bench', x: 11, y: 18 },
      { type: 'site', id: 'summer_gates', x: 22, y: 9, script: 'su_site' },
      { type: 'sign', x: 3, y: 14, text: 'Sunpatch Shores. Please do not feed the seagulls. They are in a union.' },
      { type: 'sign', x: 29, y: 18, text: 'ROYAL SEA WALL. By order of the Silver Quill Society. Keep out.' },
      { type: 'chest', id: 'su_dozer', x: 3, y: 20, script: [{ give: 'bulldozer' }, ['corry', 'A Bulldozer! Engineers move whole hills with these. Gently, of course.', 'happy']] },
      { type: 'chest', id: 'su_snack', x: 36, y: 8, script: [{ snacks: 2 }, { scraps: 6 }] },
      { type: 'chest', id: 'su_scrap', x: 17, y: 21, script: [{ scraps: 12 }] },
      { type: 'enemy', id: 'su_e1', x: 16, y: 13, look: 'magpie', battle: 'su_agents', patrol: [[16, 13], [17, 9]] },
      { type: 'enemy', id: 'su_e2', x: 27, y: 8, look: 'pumpbot', battle: 'su_pumps', patrol: [[26, 8], [29, 8]] },
      { type: 'enemy', id: 'su_e3', x: 6, y: 20, look: 'pumpbot', battle: 'su_mix', patrol: [[5, 20], [9, 21]] },
      { type: 'enemy', id: 'su_e4', x: 35, y: 19, look: 'magpie', battle: 'su_agents', patrol: [[34, 19], [36, 13]] },
      { type: 'deco', kind: 'engine', x: 34, y: 10 },
      { type: 'deco', kind: 'boat', x: 5, y: 3 },
      { type: 'deco', kind: 'boat', x: 10, y: 2 },
      { type: 'deco', kind: 'boat', x: 15, y: 4 },
      { type: 'deco', kind: 'lantern', x: 18, y: 15 },
      { type: 'deco', kind: 'lantern', x: 23, y: 17 },
      { type: 'deco', kind: 'lantern', x: 4, y: 15 },
      { type: 'deco', kind: 'umbrella', x: 7, y: 8 },
      { type: 'deco', kind: 'umbrella', x: 28, y: 7 },
      { type: 'stand', x: 6, y: 18, drink: 'lemonade', color: '#ffd25a', who: 'duck', line: "Fresh-squeezed! Well. Fresh-squoze. Ducks don't have hands.", vendor: { species: 'duck', color: '#ffe67a', hat: 'sunhat' } },
      { type: 'shop', x: 19, y: 18 },
      { type: 'campfire', x: 36, y: 7 },
      { type: 'cat', x: 27, y: 21 },
      { type: 'chest', id: 'su_nook', x: 38, y: 22, script: [{ scraps: 18 }, { narrate: 'Behind the barricade, a stash of bottle caps and a map. Every flooded hut on the shore is circled in silver ink.' }] },
      { type: 'chest', id: 'su_isle', x: 26, y: 2, script: [{ snacks: 3 }, ['skipper', "You found my secret sandbar! Mom says only the Brinemarsh crew can walk out here. You're basically crew now.", 'happy']] },
      { type: 'chest', id: 'su_hidden', x: 2, y: 22, hidden: true, script: [{ scraps: 14 }] },
      { type: 'trigger', id: 'su_engine', x: 32, y: 12, w: 5, h: 6, script: 'su_boss', cond: () => CK.flag('summer_night') && !CK.flag('summer_boss') },
    ],
    objective(G) {
      if (!CK.flag('su_met_skipper')) return 'Find Skipper by the harbor canal';
      if (!CK.flag('summer_gates')) return 'Design the harbor floodgates (harbor blueprint)';
      if (!CK.flag('su_wall_beaten')) return 'Get past the Quill Agent at the Royal Sea Wall';
      if (!CK.flag('summer_boss')) return 'Stop the Royal Moat Engine (east of the wall)';
      return 'Talk to Captain Bess on the beach';
    },
  };

  // ======================= FALL: Amberleaf Woods =========================
  CH.fall = {
    id: 'fall', name: 'Amberleaf Woods', season: 'fall', music: 'fall', w: 40, h: 24,
    start: [2, 12], next: 'winter',
    build(m) {
      m.scatter(',', 0.25, 21);
      m.river([[20, -1], [19, 6], [21, 12], [19, 18], [20, 24]], 1, '~');
      m.path([[1, 12], [38, 12]], '=', 'B');
      m.path([[8, 12], [8, 5]], '=');
      m.path([[30, 12], [30, 8], [33, 8]], '=');
      m.scatter('T', 0.11, 22);
      m.scatter('R', 0.015, 23);
      m.border('T');
      m.rect(1, 11, 1, 3, '=');
    },
    post(m) {
      nook(m, [[1, 21], [2, 21], [1, 22], [2, 22]], [3, 22, 'Q']);
    },
    swaps: [{ flag: 'fall_bridge', from: 'B', to: 'b' }],
    flood: [[4, 13], [5, 13], [11, 11], [12, 13], [13, 11], [9, 14], [15, 13]],
    objects: [
      { type: 'house', id: 'fa_a', x: 4, y: 9, roof: '#c94f2c', style: 'burrow', knock: 'fa_knock_a' },
      { type: 'house', id: 'fa_b', x: 11, y: 9, roof: '#e8a33b', style: 'burrow', knock: 'fa_knock_b', broken: 'fall_bridge' },
      { type: 'house', id: 'fa_c', x: 4, y: 15, roof: '#8a5a2e', style: 'burrow', knock: 'fa_knock_c' },
      { type: 'house', id: 'fa_d', x: 12, y: 15, roof: '#b5562e', style: 'burrow', knock: 'fa_knock_d' },
      { type: 'npc', id: 'ember', x: 15, y: 11, look: 'critter', o: { species: 'fox', color: '#f29a52', scarf: '#5aa9e6' }, talk: 'fa_ember' },
      { type: 'npc', id: 'bristle', x: 9, y: 17, look: 'critter', o: { species: 'hedgehog', color: '#e6c9a3', scarf: '#6cc56c' }, talk: 'fa_bristle' },
      { type: 'npc', id: 'hoot', x: 33, y: 13, look: 'critter', o: { species: 'owl', color: '#b98d62' }, talk: 'fa_hoot' },
      { type: 'npc', id: 'leafy', x: 25, y: 16, look: 'leafpile', talk: 'fa_leafy', cond: () => CK.flag('foe_fa_e2') },
      { type: 'bench', x: 14, y: 14 },
      { type: 'site', id: 'fall_bridge', x: 17, y: 13, script: 'fa_site' },
      { type: 'sign', x: 3, y: 11, text: 'Amberleaf Woods. Leaf piles are for jumping in. Not for clogging drains!' },
      { type: 'sign', x: 17, y: 11, text: 'The Old Bridge. Washed away last week. (Sign also slightly soggy.)' },
      { type: 'chest', id: 'fa_bridgec', x: 8, y: 4, script: [{ give: 'bridge' }, ['pip', 'A Suspension Bridge! Cables pull, towers push, and everybody gets across.', 'happy']] },
      { type: 'chest', id: 'fa_snack', x: 36, y: 20, script: [{ snacks: 3 }] },
      { type: 'chest', id: 'fa_scrap', x: 27, y: 4, script: [{ scraps: 15 }] },
      { type: 'enemy', id: 'fa_e1', x: 6, y: 6, look: 'leafling', battle: 'fa_leaf1', patrol: [[5, 6], [11, 6]] },
      { type: 'enemy', id: 'fa_e2', x: 25, y: 15, look: 'leafling', battle: 'fa_leaf2', patrol: [[24, 15], [27, 18]] },
      { type: 'enemy', id: 'fa_e3', x: 34, y: 17, look: 'magpie', battle: 'fa_agents', patrol: [[32, 17], [36, 17]] },
      { type: 'deco', kind: 'archive', x: 33, y: 7 },
      { type: 'deco', kind: 'leafpile', x: 14, y: 7 },
      { type: 'deco', kind: 'leafpile', x: 2, y: 17 },
      { type: 'deco', kind: 'lantern', x: 7, y: 13 },
      { type: 'deco', kind: 'lantern', x: 16, y: 11 },
      { type: 'deco', kind: 'lantern', x: 29, y: 11 },
      { type: 'deco', kind: 'lantern', x: 32, y: 9 },
      { type: 'stand', x: 10, y: 13, drink: 'apple cider', color: '#e8743b', who: 'fox', line: "Hot cider, extra cinnamon! It's the cinnamon that does the drying. Probably.", vendor: { species: 'fox', color: '#f29a52', scarf: '#5aa9e6' } },
      { type: 'campfire', x: 25, y: 19 },
      { type: 'cat', x: 36, y: 9 },
      { type: 'deco', kind: 'pumpkin', x: 13, y: 13 },
      { type: 'deco', kind: 'pumpkin', x: 16, y: 16 },
      { type: 'deco', kind: 'pumpkin', x: 29, y: 9 },
      { type: 'deco', kind: 'pumpkin', x: 31, y: 13 },
      { type: 'deco', kind: 'pumpkin', x: 6, y: 11 },
      { type: 'chest', id: 'fa_nook', x: 1, y: 22, script: [{ scraps: 20 }, { snacks: 1 }, { narrate: 'Stuffed behind the barricade: a whole sack of leaves meant for the drains. You give them back to the Leaflings.' }] },
      { type: 'chest', id: 'fa_hidden', x: 24, y: 22, hidden: true, script: [{ scraps: 16 }] },
      { type: 'trigger', id: 'fa_archive', x: 32, y: 8, w: 3, h: 2, script: 'fa_boss', cond: () => CK.flag('fall_night') && !CK.flag('fall_boss') },
      { type: 'trigger', id: 'fa_archive_day', x: 32, y: 8, w: 3, h: 2, script: 'fa_archive_day', cond: () => !CK.flag('fall_night') && CK.flag('fall_bridge') },
    ],
    objective(G) {
      if (!CK.flag('fa_met_ember')) return 'Ask the forest folk what happened';
      if (!CK.flag('fall_bridge')) return 'Engineer a truss bridge over the river';
      if (!CK.flag('fall_boss')) return 'Reach the Royal Archive (east)';
      return 'Talk to Professor Hoot to travel to Frostfold Peak';
    },
  };

  // ======================= WINTER: Frostfold Peak =======================
  CH.winter = {
    id: 'winter', name: 'Frostfold Peak', season: 'winter', music: 'winter', w: 40, h: 24,
    start: [2, 16],
    build(m) {
      m.scatter(',', 0.15, 31);
      m.ellipse(7, 6, 5, 3.5, 'i');
      m.path([[1, 16], [38, 16]], '=');
      m.path([[20, 16], [20, 8]], '=');
      m.path([[28, 16], [28, 7], [33, 7]], '=');
      m.rect(30, 1, 9, 4, '~');
      m.scatter('T', 0.07, 32);
      m.scatter('S', 0.02, 33);
      m.border('T');
      m.rect(1, 15, 1, 3, '=');
    },
    post(m) {
      nook(m, [[38, 11]], [37, 11, 'S']);
      nook(m, [[1, 1], [2, 1], [1, 2], [2, 2]], [3, 2, 'Q']);
    },
    flood: [[6, 17], [9, 18], [12, 15], [15, 17], [24, 15]],
    objects: [
      { type: 'deco', kind: 'castle', x: 17, y: 5 },
      { type: 'house', id: 'wi_a', x: 6, y: 13, roof: '#6fa8dc', style: 'snow', knock: 'wi_knock_a' },
      { type: 'house', id: 'wi_b', x: 10, y: 13, roof: '#ef6b6b', style: 'snow', knock: 'wi_knock_b' },
      { type: 'house', id: 'wi_c', x: 6, y: 19, roof: '#a68be6', style: 'snow', knock: 'wi_knock_c' },
      { type: 'house', id: 'wi_d', x: 12, y: 19, roof: '#6cc56c', style: 'snow', knock: 'wi_knock_d', broken: 'winter_done' },
      { type: 'npc', id: 'queen', x: 20, y: 9, look: 'queen', talk: 'wi_queen' },
      { type: 'npc', id: 'gateagent', x: 21, y: 11, look: 'magpie', talk: 'wi_gate', cond: () => !CK.flag('wi_gate_beaten') },
      { type: 'npc', id: 'mama', x: 15, y: 17, look: 'critter', o: { species: 'bear', color: '#a8774c', scarf: '#ef6b6b' }, talk: 'wi_mama' },
      { type: 'npc', id: 'bess_wi', x: 25, y: 18, look: 'bess', talk: 'wi_bess' },
      { type: 'npc', id: 'mouse_wi', x: 4, y: 10, look: 'critter', o: { species: 'mouse', color: '#d6d0cc', hat: 'beanie', hatColor: '#ef6b6b' }, talk: 'wi_mouse' },
      { type: 'bench', x: 14, y: 14 },
      { type: 'sign', x: 3, y: 15, text: 'Frostfold Peak. Capital of the Cardboard Kingdom. Mind the icicles.' },
      { type: 'sign', x: 30, y: 8, text: 'Summit Reservoir. Silver Quill Society only. (This means you.)' },
      { type: 'chest', id: 'wi_plow', x: 3, y: 21, script: [{ give: 'snowplow' }, ['corry', 'A Snowplow! It clears the path so everyone else can follow.', 'happy']] },
      { type: 'chest', id: 'wi_snack', x: 36, y: 20, script: [{ snacks: 3 }, { scraps: 10 }] },
      { type: 'enemy', id: 'wi_e1', x: 10, y: 9, look: 'slush', battle: 'wi_slush', patrol: [[9, 9], [13, 9]] },
      { type: 'enemy', id: 'wi_e2', x: 33, y: 19, look: 'magpie', battle: 'wi_agents', patrol: [[31, 19], [36, 19]] },
      { type: 'enemy', id: 'wi_e3', x: 24, y: 12, look: 'slush', battle: 'wi_slush', patrol: [[23, 12], [25, 9]] },
      { type: 'deco', kind: 'cage', x: 34, y: 4 },
      { type: 'deco', kind: 'lantern', x: 19, y: 13 },
      { type: 'deco', kind: 'lantern', x: 22, y: 13 },
      { type: 'deco', kind: 'lantern', x: 9, y: 16 },
      { type: 'deco', kind: 'lantern', x: 27, y: 9 },
      { type: 'deco', kind: 'snowman', x: 16, y: 21 },
      { type: 'stand', x: 17, y: 18, drink: 'hot cocoa', color: '#8a5a2e', who: 'bear', line: "Cocoa, with a marshmallow the size of your head. Warms the cardboard right through.", vendor: { species: 'bear', color: '#a8774c', scarf: '#ef6b6b' } },
      { type: 'shop', x: 8, y: 11 },
      { type: 'campfire', x: 23, y: 20 },
      { type: 'cat', x: 2, y: 13 },
      { type: 'chest', id: 'wi_drift', x: 38, y: 11, script: [{ scraps: 20 }, ['corry', 'Snowplows: making paths so everyone else can follow. A very knightly machine.', 'happy']] },
      { type: 'chest', id: 'wi_nook', x: 1, y: 1, script: [{ snacks: 3 }, { narrate: "Behind the Society barricade: Corvin's old desk. In the drawer, a gum wrapper folded into a tiny, careful bird." }] },
      { type: 'chest', id: 'wi_hidden', x: 26, y: 22, hidden: true, script: [{ scraps: 18 }] },
      { type: 'trigger', id: 'wi_summit', x: 31, y: 6, w: 4, h: 3, script: 'wi_boss', cond: () => CK.flag('winter_night') && !CK.flag('winter_done') },
      { type: 'trigger', id: 'wi_summit_day', x: 31, y: 6, w: 4, h: 3, script: 'wi_summit_day', cond: () => !CK.flag('winter_night') },
    ],
    objective(G) {
      if (!CK.flag('wi_gate_beaten')) return 'Reach Queen Corrina at the castle gate';
      if (!CK.flag('wi_queen_told')) return 'Show the Queen the ledger and the charter';
      if (!CK.flag('winter_done')) return 'Climb to the Summit Reservoir (northeast)';
      return '';
    },
  };

  CK.buildChapterMap = function (ch) {
    const m = new TMap(ch.w, ch.h, '.');
    ch.build(m);
    // clear space around objects so nothing spawns in a tree
    for (const o of ch.objects) {
      if (o.type === 'trigger') continue;
      const w = o.type === 'house' ? 2 : 1;
      m.clear(o.x - 1, o.y - 1, w + 2, 3);
    }
    m.clear(ch.start[0] - 1, ch.start[1] - 1, 3, 3);
    // secret nooks behind barricades, drifts and shallows go in last
    if (ch.post) ch.post(m);
    return m;
  };
})();
