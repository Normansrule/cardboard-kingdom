// Cardboard Kingdom - Your Patch and buried treasure (v2.23).
//  * Your Patch: a little fenced plot in Blossom Hollow that was Grandma Rosie's when she was a girl.
//    Decorate it with garden pieces from Tansy's Garden page (bottle caps) or from buried treasure.
//    Critters you've sketched come to visit when there's something they like (bees like a beehive,
//    owlets like a birdhouse). Night critters visit at night. Say hi for a few caps.
//  * Buried treasure: two in every Kingdom place. A scrap of map is tucked behind a signpost or left
//    at a landmark; it shows the spot as a hand-drawn sketch with an X and a hint. Find the X and dig.
//    Treasure holds bottle caps and a garden piece, and a few hold things you can't get anywhere else.
// Nothing here expires or needs a daily visit. Visitors just change each time you come back.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input;
  const W = CK.W, H = CK.H, TS = 48;
  const C = D.C, TAU = Math.PI * 2;
  const OW = CK.Overworld.prototype;
  const PT = CK.Pastimes, tally = PT.tally;
  const stroke = (ctx, lw, col) => { ctx.strokeStyle = col || C.ink; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };
  const MAP_S = 1.18;

  // ================================================================ STATE
  const st = () => {
    const P = PT.pt();
    P.decor = P.decor || {}; P.patch = P.patch || []; P.guests = P.guests || {};
    P.maps = P.maps || {}; P.dug = P.dug || {};
    return P;
  };

  // ================================================================ GARDEN PIECES
  // loot: only found in buried treasure. Drawings live in worldgen.js (CK.World.DRAW).
  const DECOR = [
    { id: 'flowerpot', name: 'Flower Pot', cost: 10, blurb: 'Three blooms in a terracotta pot.' },
    { id: 'wateringcan', name: 'Watering Can', cost: 12, blurb: 'Blue tin, a little dented, still pours straight.' },
    { id: 'beachball', name: 'Beach Ball', cost: 12, blurb: 'Red, white and blue, and a bit sandy.' },
    { id: 'crates', name: 'Crates', cost: 12, blurb: 'Stacked fruit crates. Good for sitting on.' },
    { id: 'barrel', name: 'Rain Barrel', cost: 12, blurb: 'Catches the rain from the gutter. Engineers love a rain barrel.' },
    { id: 'spool', name: 'Giant Spool', cost: 12, blurb: 'A cotton reel from Thimble Row, as big as a stool.' },
    { id: 'pinwheel', name: 'Pinwheel', cost: 15, blurb: 'Four paper sails that spin in the smallest breeze.' },
    { id: 'bunting', name: 'Bunting', cost: 15, blurb: 'Little flags on a string. Every day is a festival.' },
    { id: 'pumpkins', name: 'Pumpkins', cost: 15, blurb: 'Three pumpkins. At night one of them grins.' },
    { id: 'haybale', name: 'Hay Bale', cost: 15, blurb: 'Smells like the end of summer.' },
    { id: 'applecrate', name: 'Apple Crate', cost: 15, blurb: 'Red apples from Amberleaf Woods.' },
    { id: 'paperlantern', name: 'Paper Lantern', cost: 18, blurb: 'Glows softly after dark.' },
    { id: 'icelantern', name: 'Ice Lantern', cost: 18, blurb: 'A candle inside a block of ice. It never melts here, somehow.' },
    { id: 'balloons', name: 'Balloons', cost: 18, blurb: 'Tied to a brick so they don\'t wander off.' },
    { id: 'birdhouse', name: 'Birdhouse', cost: 20, blurb: 'A yellow house on a pole, with a round front door.' },
    { id: 'sled', name: 'Sled', cost: 20, blurb: 'Red runners, waiting for snow.' },
    { id: 'sandcastle', name: 'Sandcastle', cost: 20, blurb: 'Three towers and a flag. Built to last (it won\'t).' },
    { id: 'wheelbarrow', name: 'Wheelbarrow', cost: 25, blurb: 'Full of cabbages. Nobody remembers why.' },
    { id: 'surfboard', name: 'Surfboard', cost: 25, blurb: 'Pink, with a stripe. Stuck upright in the ground like a sign.' },
    { id: 'beehive', name: 'Beehive', cost: 30, blurb: 'A straw skep on a post, buzzing politely.' },
    { id: 'birdbath', name: 'Birdbath', cost: 30, blurb: 'A stone bowl of clear water. Very popular.' },
    { id: 'snowman', name: 'Snowman', cost: 30, blurb: 'A carrot nose and a scarf. Stays frosty all year.' },
    { id: 'bench', name: 'Garden Bench', cost: 35, blurb: 'For sitting and watching the patch do its thing.' },
    { id: 'scarecrow', name: 'Scarecrow', cost: 35, blurb: 'Scares nobody. Owlets find him reassuring.' },
    { id: 'picnic', name: 'Picnic Blanket', cost: 40, blurb: 'Red gingham and a basket of sandwiches.' },
    { id: 'well', name: 'Wishing Well', cost: 60, blurb: 'Drop a pebble, make a wish, hear a frog say thank you.' },
    { id: 'gnome', name: 'Garden Gnome', loot: true, blurb: 'Red hat, white beard, quietly in charge.' },
    { id: 'sundial', name: 'Sundial', loot: true, blurb: 'Tells the time when the sun is out. Otherwise, it guesses.' },
    { id: 'toadhouse', name: 'Toadstool House', loot: true, blurb: 'A red-capped cottage. At night its window lights up.' },
    { id: 'windchime', name: 'Wind Chime', loot: true, blurb: 'Four little tubes that ring when the wind passes.' },
    { id: 'telescope', name: 'Star Telescope', loot: true, blurb: 'Points at the sky. Owlets and moths like to look.' },
  ];
  const decorById = (id) => DECOR.find((d) => d.id === id);
  // what each critter likes to find in a garden
  const LIKES = {
    ladybug: ['flowerpot', 'birdbath', 'picnic'], snail: ['wateringcan', 'toadhouse', 'barrel', 'sundial'], frog: ['birdbath', 'wateringcan', 'well'],
    bee: ['beehive', 'flowerpot', 'pinwheel'], firefly: ['paperlantern', 'icelantern', 'bench'], crab: ['sandcastle', 'beachball', 'surfboard'],
    starfish: ['sandcastle', 'surfboard'], butterfly: ['flowerpot', 'bunting', 'pinwheel'], squirrel: ['applecrate', 'birdhouse', 'pumpkins'],
    hoglet: ['haybale', 'toadhouse', 'pumpkins', 'gnome'], owlet: ['birdhouse', 'telescope', 'scarecrow'], hare: ['sled', 'snowman', 'haybale'],
    penguin: ['snowman', 'sled', 'icelantern'], seal: ['beachball', 'surfboard', 'barrel'], dragonfly: ['birdbath', 'windchime', 'pinwheel'],
    newt: ['well', 'toadhouse', 'birdbath'], moth: ['paperlantern', 'icelantern', 'windchime', 'telescope'], beetle: ['spool', 'crates', 'gnome'],
    duckling: ['birdbath', 'wheelbarrow', 'balloons'], mouse: ['applecrate', 'spool', 'crates', 'picnic'],
  };
  const likedBy = (id) => Object.keys(LIKES).filter((c) => LIKES[c].includes(id));
  const owned = (id) => st().decor[id] || 0;
  const placed = (id) => st().patch.filter((p) => p.id === id).length;
  const spare = (id) => owned(id) - placed(id);

  // draw a garden piece at (x, y) (its feet), using the place you're in for colours
  const fakeOw = () => {
    const ow = CK.OW;
    return { t: CK.time || 0, night: ow ? ow.night : false, world: { kit: (ow && ow.world && ow.world.kit) || CK.World.KITS.spring }, season: ow ? ow.season : null, player: { x: -9999, y: -9999 } };
  };
  function drawDecor(ctx, id, x, y, s, seed) {
    const f = CK.World.DRAW[id];
    if (!f) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s || 1, s || 1);
    f(ctx, 0, 0, { kind: id, x: 0, y: 0, px: 0, py: 0, seed: seed == null ? 0.3 : seed }, fakeOw());
    ctx.restore();
  }

  // ================================================================ YOUR PATCH ON THE MAP
  const patchOf = (ow) => (ow && ow.world && ow.world.patch) || null;
  const cellPx = (p, i, j) => [(p.x + i + 0.5) * TS, (p.y + j + 0.8) * TS];

  // visitors: sketched critters who like something in the patch, and are awake right now
  function pickGuests(ow) {
    ow.guests = [];
    const p = patchOf(ow), P = st();
    if (!p || !P.patch.length) return;
    const here = new Set(P.patch.map((q) => q.id));
    const cands = Object.keys(P.seen).filter((id) => {
      const cr = PT.CRITTERS[id];
      if (!cr || (cr.time !== 'any' && (cr.time === 'night') !== !!ow.night)) return false;
      return (LIKES[id] || []).some((d) => here.has(d));
    });
    const n = Math.min(3, 1 + Math.floor(P.patch.length / 4), cands.length);
    const taken = new Set(P.patch.map((q) => q.i + ',' + q.j));
    for (let k = 0; k < n; k++) {
      // the more things it likes, the likelier it comes
      const pool = cands.filter((id) => !ow.guests.some((g) => g.id === id)).flatMap((id) => Array((LIKES[id] || []).filter((d) => here.has(d)).length).fill(id));
      if (!pool.length) break;
      const id = U.pick(pool);
      // stand next to something it likes, on an empty square
      const fav = P.patch.filter((q) => LIKES[id].includes(q.id));
      const spots = [];
      for (const q of fav) for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const i = q.i + di, j = q.j + dj; if (i >= 0 && j >= 0 && i < p.w && j < p.h && !taken.has(i + ',' + j)) spots.push([i, j, q.id]); }
      if (!spots.length) for (let j = 0; j < p.h; j++) for (let i = 0; i < p.w; i++) if (!taken.has(i + ',' + j)) spots.push([i, j, fav[0] && fav[0].id]);
      if (!spots.length) break;
      const [i, j, near] = U.pick(spots);
      taken.add(i + ',' + j);
      const [px, py] = cellPx(p, i, j);
      ow.guests.push({ id, i, j, px, py: py - 4, near, t: Math.random() * 9, dir: Math.random() < 0.5 ? -1 : 1, greeted: false, heart: 0 });
    }
  }

  function drawFence(ow, ctx, list, p) {
    // a low picket fence round the patch, open at the gate
    const x0 = p.x * TS + 4, y0 = p.y * TS + 6, x1 = (p.x + p.w) * TS - 4, y1 = (p.y + p.h) * TS + 4;
    const gate = { up: [(p.gx) * TS, y0], down: [(p.gx) * TS, y1], left: [x0, (p.gy) * TS], right: [x1, (p.gy) * TS] }[p.side];
    const rail = (ax, ay, bx, by) => {
      const ox = ow.camX, oy = ow.camY;
      const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / 12));
      for (let k = 0; k <= n; k++) {
        const x = ax + ((bx - ax) * k) / n, y = ay + ((by - ay) * k) / n;
        if (gate && Math.abs(x - gate[0] - (p.side === 'up' || p.side === 'down' ? TS / 2 : 0)) < 26 && Math.abs(y - gate[1] - (p.side === 'left' || p.side === 'right' ? TS / 2 : 0)) < 26) continue;
        list.push({ y, f: () => { const X = x - ox, Y = y - oy; if (X < -20 || X > W + 20 || Y < -40 || Y > H + 20) return; D.rr(ctx, X - 3, Y - 18, 6, 18, 2); ctx.fillStyle = '#fff4e0'; ctx.fill(); stroke(ctx, 1.4); D.poly(ctx, [X - 3, Y - 18, X, Y - 22, X + 3, Y - 18], '#fff4e0', C.ink, 1.2); } });
      }
    };
    rail(x0, y0, x1, y0); rail(x0, y1, x1, y1); rail(x0, y0, x0, y1); rail(x1, y0, x1, y1);
    // the sign by the gate
    const sx = gate ? gate[0] + (p.side === 'up' || p.side === 'down' ? TS + 10 : 0) : x0, sy = gate ? gate[1] + (p.side === 'up' ? 4 : p.side === 'left' || p.side === 'right' ? TS + 12 : 0) : y1;
    list.push({ y: sy, f: () => CK.World.DRAW.patchsign(ctx, sx - ow.camX, sy - ow.camY) });
  }

  function drawPatch(ow, list, ctx) {
    const p = patchOf(ow);
    if (!p) return;
    const X = p.x * TS - ow.camX, Y = p.y * TS - ow.camY;
    if (X > W + 60 || Y > H + 60 || X + p.w * TS < -60 || Y + p.h * TS < -60) return;
    // soft dug earth under the patch, drawn before everything that stands
    list.push({ y: -1e9, f: () => {
      const X = p.x * TS - ow.camX, Y = p.y * TS - ow.camY;
      D.rr(ctx, X + 6, Y + 10, p.w * TS - 12, p.h * TS - 8, 14);
      ctx.fillStyle = ow.world.kit.snow ? 'rgba(255,255,255,.35)' : 'rgba(150,105,60,.18)'; ctx.fill();
      for (let k = 0; k < 14; k++) D.ellipse(ctx, X + 20 + U.hash(k, 1, 5) * (p.w * TS - 40), Y + 22 + U.hash(k, 2, 5) * (p.h * TS - 34), 3, 1.6, 'rgba(110,80,50,.25)');
    } });
    drawFence(ow, ctx, list, p);
    const P = st();
    for (const q of P.patch) {
      const [px, py] = cellPx(p, q.i, q.j);
      list.push({ y: py, f: () => drawDecor(ctx, q.id, px - ow.camX, py - ow.camY, 1, U.hash(q.i, q.j, 3)) });
    }
    for (const g of ow.guests || []) list.push({ y: g.py, f: () => drawGuest(ow, ctx, g) });
  }
  function drawGuest(ow, ctx, g) {
    const x = g.px - ow.camX, y = g.py - ow.camY, hop = D.calm() ? 0 : Math.max(0, Math.sin(g.t * 2.2)) * (Math.sin(g.t * 0.7) > 0.6 ? 3 : 0);
    D.shadow(ctx, x, y, 9, 3, 0.25);
    ctx.save(); ctx.translate(x, y - hop); ctx.scale(g.dir * MAP_S, MAP_S);
    PT.drawCritter(ctx, g.id, 0, 0, g.t, 1);
    ctx.restore();
    if (g.heart > 0) {
      const k = 1 - g.heart / 1.4;
      ctx.save(); ctx.globalAlpha *= Math.min(1, g.heart * 2);
      D.heart ? D.heart(ctx, x, y - 34 - k * 16, 7, '#ff6f8f') : D.text(ctx, '♥', x, y - 30 - k * 16, { size: 18, weight: 900, align: 'center', color: '#ff6f8f', outline: C.ink, ow: 2 });
      ctx.restore();
    }
  }

  // ================================================================ TREASURE
  const KIT_ORDER = () => Object.keys(CK.World.KITS);
  // what's in each tin: index by place (in kit order) and spot
  const LOOT = ['gnome', 'pinwheel', 'sundial', 'beachball', 'toadhouse', 'pumpkins', 'bandana', 'snowman', 'windchime', 'paperlantern',
    'telescope', 'sled', 'bench', 'balloons', 'crates', 'barrel', 'birdbath', 'well', 'spool', 'picnic'];
  const lootOf = (tid) => { const [, place, k] = tid.match(/^treasure_(.+)_(\d+)$/) || []; const n = KIT_ORDER().indexOf(place) * 2 + Number(k); return LOOT[n] || 'flowerpot'; };
  // where each map scrap is: behind the place's signposts first, then at its landmarks
  const sourcesOf = (wd) => wd.signposts.concat(wd.landmarks.filter((l) => l.kind !== 'lookout'), wd.landmarks.filter((l) => l.kind === 'lookout'));
  function mapAt(ow, pr) {
    const wd = ow.world;
    if (!wd || !wd.treasures) return null;
    const src = sourcesOf(wd);
    return wd.treasures.find((t, k) => src[k] === pr && !st().maps[t.id]) || null;
  }
  const treasureById = (tid) => {
    for (const id of KIT_ORDER()) { const ch = CK.Chapters[id]; if (!ch) continue; const wd = CK.World.get(ch); const t = wd && wd.treasures.find((q) => q.id === tid); if (t) return { t, wd, ch }; }
    return null;
  };
  // a hint in words: how many steps from something you can find
  function hintFor(wd, ch, t) {
    const things = wd.landmarks.map((l) => ({ x: l.x, y: l.y, name: { picnic: 'the picnic blanket', well: 'the well', lookout: 'the lookout', cairn: 'the stone cairn', snowfort: 'the snow fort' }[l.kind] || 'the landmark' }))
      .concat(wd.signposts.map((s) => ({ x: s.x, y: s.y, name: 'the signpost' })))
      .concat(ch.objects.filter((o) => o.type === 'house').map((o) => ({ x: o.x, y: o.y + 1, name: 'a house' })))
      .concat(ch.objects.filter((o) => o.type === 'campfire').map((o) => ({ x: o.x, y: o.y, name: 'the campfire' })));
    things.sort((a, b) => Math.abs(a.x - t.x) + Math.abs(a.y - t.y) - (Math.abs(b.x - t.x) + Math.abs(b.y - t.y)));
    const o = things[0];
    if (!o) return 'Somewhere quiet in ' + ch.name + '.';
    const dx = t.x - o.x, dy = t.y - o.y, bits = [];
    if (dx) bits.push(Math.abs(dx) + (Math.abs(dx) === 1 ? ' step ' : ' steps ') + (dx > 0 ? 'east' : 'west'));
    if (dy) bits.push(Math.abs(dy) + (Math.abs(dy) === 1 ? ' step ' : ' steps ') + (dy > 0 ? 'south' : 'north'));
    return bits.length ? 'From ' + o.name + ': ' + bits.join(', then ') + '.' : 'Right by ' + o.name + '.';
  }

  // the sketch on the map scrap: the real place, drawn from above, faded to old paper
  const mapCache = {};
  function sketchMap(ow, t) {
    if (mapCache[t.id]) return mapCache[t.id];
    const cw = 11, chh = 7, sc = 0.7;
    const m = ow.map;
    const x0 = U.clamp(t.x - 5, 0, Math.max(0, m.w - cw)), y0 = U.clamp(t.y - 3, 0, Math.max(0, m.h - chh));
    const full = document.createElement('canvas'); full.width = W; full.height = H;
    const g = full.getContext('2d');
    const save = { camX: ow.camX, camY: ow.camY, hud: ow.drawHud, shake: ow.shake, px: ow.player.x, py: ow.player.y, guests: ow.guests, critters: ow.critters };
    ow.drawHud = () => {}; ow.shake = 0; ow.guests = []; ow.critters = [];
    ow.camX = U.clamp(x0 * TS, 0, m.w * TS - W); ow.camY = U.clamp(y0 * TS, 0, m.h * TS - H);
    try { ow.draw(g); } finally { Object.assign(ow, { camX: save.camX, camY: save.camY, drawHud: save.hud, shake: save.shake, guests: save.guests, critters: save.critters }); }
    const out = document.createElement('canvas'); out.width = Math.round(cw * TS * sc); out.height = Math.round(chh * TS * sc);
    const o = out.getContext('2d');
    const sx = x0 * TS - U.clamp(x0 * TS, 0, m.w * TS - W), sy = y0 * TS - U.clamp(y0 * TS, 0, m.h * TS - H);
    o.drawImage(full, sx, sy, cw * TS, chh * TS, 0, 0, out.width, out.height);
    // old paper: drain the colour, then tint it like tea-stained parchment
    o.globalCompositeOperation = 'saturation'; o.fillStyle = '#808080'; o.fillRect(0, 0, out.width, out.height);
    o.globalCompositeOperation = 'multiply'; o.fillStyle = '#f0d7a2'; o.fillRect(0, 0, out.width, out.height);
    o.globalCompositeOperation = 'screen'; o.fillStyle = 'rgba(120,90,60,.35)'; o.fillRect(0, 0, out.width, out.height);
    o.globalCompositeOperation = 'source-over';
    for (let k = 0; k < 7; k++) D.ellipse(o, U.hash(k, 1, 77) * out.width, U.hash(k, 2, 77) * out.height, 18 + U.hash(k, 3, 77) * 30, 10 + U.hash(k, 4, 77) * 20, 'rgba(140,90,40,.08)');
    // the X
    const X = (t.x - x0 + 0.5) * TS * sc, Y = (t.y - y0 + 0.6) * TS * sc;
    o.lineCap = 'round';
    for (const [a, b, c, d] of [[-9, -9, 9, 9], [9, -9, -9, 9]]) { o.beginPath(); o.moveTo(X + a, Y + b); o.lineTo(X + c, Y + d); o.strokeStyle = '#3a1a10'; o.lineWidth = 7; o.stroke(); o.strokeStyle = '#d83a2a'; o.lineWidth = 4; o.stroke(); }
    // a compass rose in the corner
    const rx = out.width - 30, ry = 30;
    D.circle(o, rx, ry, 16, 'rgba(255,248,230,.7)', 'rgba(80,50,30,.8)', 1.4);
    D.poly(o, [rx, ry - 14, rx + 4, ry, rx, ry + 14, rx - 4, ry], 'rgba(120,60,30,.85)');
    D.text(o, 'N', rx, ry - 18, { size: 11, weight: 900, align: 'center', color: '#5a3a24' });
    // torn edges
    o.globalCompositeOperation = 'destination-in';
    o.beginPath();
    const jag = (n, f) => { for (let k = 0; k <= n; k++) f(k / n, (U.hash(k, n, 31) - 0.5) * 7); };
    jag(14, (u, j) => o.lineTo(u * out.width, 4 + j));
    jag(9, (u, j) => o.lineTo(out.width - 4 + j, u * out.height));
    jag(14, (u, j) => o.lineTo((1 - u) * out.width, out.height - 4 + j));
    jag(9, (u, j) => o.lineTo(4 + j, (1 - u) * out.height));
    o.closePath(); o.fillStyle = '#000'; o.fill();
    o.globalCompositeOperation = 'source-over';
    return (mapCache[t.id] = out);
  }

  class TreasureMapScene {
    constructor(tid, ow) {
      this.tid = tid; this.t = 0; this.transparent = true; this.finished = false;
      const f = treasureById(tid);
      this.place = f ? f.ch.name : '';
      this.hint = f ? hintFor(f.wd, f.ch, f.t) : '';
      this.img = f && ow && ow.ch.id === f.ch.id ? sketchMap(ow, f.t) : mapCache[tid] || null;
      this.dug = !!st().dug[tid];
    }
    update(dt) {
      this.t += dt;
      if (CK.autoSkip || (this.t > 0.5 && (Input.hit('ok') || Input.hit('back') || Input.mouse.pressed))) { this.finished = true; CK.Scenes.remove(this); }
    }
    draw(ctx) {
      const P = D.pal(), k = D.calm() ? 1 : CK.Ease.ui(Math.min(1, this.t * 3));
      ctx.fillStyle = P.scrim; ctx.fillRect(0, 0, W, H);
      D.panel(ctx, W / 2 - 300, 26, 600, 488, { theme: true });
      D.text(ctx, 'Treasure map', W / 2 - 270, 72, { size: D.T.small, weight: 800, color: P.label });
      D.text(ctx, this.place, W / 2 - 270, 106, { size: D.T.title, weight: 700, color: P.text });
      ctx.save(); ctx.translate(W / 2, 270 + (1 - k) * 20); ctx.rotate(-0.025);
      if (this.img) {
        const iw = this.img.width, ih = this.img.height;
        ctx.fillStyle = 'rgba(60,40,20,.25)'; ctx.fillRect(-iw / 2 + 6, -ih / 2 + 8, iw, ih);
        ctx.drawImage(this.img, -iw / 2, -ih / 2);
        if (this.dug) D.postmark(ctx, iw / 2 - 60, -ih / 2 + 50, 34, ['DUG UP'], { color: '#3f8a3a', waves: false, rot: -0.2, alpha: 0.9 });
      } else {
        D.rr(ctx, -180, -110, 360, 220, 10); ctx.fillStyle = '#f0d7a2'; ctx.fill(); stroke(ctx, 2, 'rgba(90,60,30,.6)');
        D.text(ctx, 'The sketch is too faded to read from here.', 0, -6, { size: D.T.ui, weight: 700, align: 'center', color: '#5a3a24' });
        D.text(ctx, 'Go to ' + this.place + ' and look at it there.', 0, 20, { size: D.T.small, weight: 700, align: 'center', color: '#5a3a24' });
      }
      ctx.restore();
      D.wrap(ctx, this.hint, 520, D.T.ui, 700).slice(0, 2).forEach((l, i) => D.text(ctx, l, W / 2 - 270, 450 + i * 24, { size: D.T.ui, weight: 700, color: P.text }));
      D.text(ctx, 'Z to close', W / 2 + 270, 498, { size: D.T.small, weight: 700, align: 'right', color: P.soft });
    }
  }
  CK.TreasureMapScene = TreasureMapScene;

  function findMap(ow, t) {
    const P = st(), first = !Object.keys(P.maps).length;
    P.maps[t.id] = 1;
    tally('mapsFound');
    CK.Audio.sfx('chest');
    const lines = [{ narrate: 'Something is tucked in here: a torn scrap of paper with a sketch on it, and a red X.' }];
    if (first) lines.push(['pip', 'A TREASURE MAP! It\'s drawn from right here. Look, that\'s this place!', 'happy'], ['corry', 'Find where the sketch matches, then look for the X. And bring a spoon. Or a shovel.', 'happy'], { journal: 'Found a treasure map scrap. Two treasures are buried in every Kingdom place; their maps hide behind signposts and at landmarks. Match the sketch, find the X, dig.' });
    lines.push({ fn: () => { const s = CK.Scenes.push(new TreasureMapScene(t.id, ow)); return [{ await: () => s }]; } });
    CK.runScript(lines);
    CK.saveGame();
  }

  function dig(ow, t) {
    const P = st();
    P.dug[t.id] = 1;
    tally('digs');
    CK.Audio.sfx('break');
    ow.fx.burst(16, () => ({ x: (t.x + 0.5) * TS + U.rand(-10, 10), y: (t.y + 0.7) * TS, vx: U.rand(-110, 110), vy: U.rand(-170, -60), g: 260, life: 0.9, size: 5, color: U.pick(['#8a5a3a', '#a8774c', '#6a4a2e']) }));
    const loot = lootOf(t.id), dec = decorById(loot), skin = !dec && CK.Closet.item(loot);
    CK.G.caps += 25;
    if (dec) P.decor[loot] = (P.decor[loot] || 0) + 1;
    else if (skin) CK.Closet.give(loot);
    const lines = [
      { narrate: 'You dig at the X. Clunk! A biscuit tin, sealed with tape. Inside, wrapped in an old sock...' },
      { fn: () => { CK.Audio.sfx('coin'); const s = CK.Scenes.push(new LootCard(loot, ow.ch.name)); return [{ await: () => s }]; } },
    ];
    if (Object.keys(P.dug).length === 1) lines.push(['pip', 'Who buries presents in a biscuit tin?', 'idea'], ['sam', 'Grandma. Definitely Grandma.', 'happy']);
    CK.runScript(lines);
    CK.saveGame();
  }

  function drawTreasureMark(ow, ctx, t) {
    const x = (t.x + 0.5) * TS - ow.camX, y = (t.y + 0.75) * TS - ow.camY;
    if (x < -30 || x > W + 30 || y < -30 || y > H + 30) return;
    D.ellipse(ctx, x, y - 2, 20, 8, 'rgba(110,75,45,.4)');
    for (const a of [-1, 1]) { D.line(ctx, x - 11 * a, y - 9, x + 11 * a, y + 4, C.ink, 6); D.line(ctx, x - 11 * a, y - 9, x + 11 * a, y + 4, '#d83a2a', 3.4); }
    const ph = (ow.t * 0.7 + t.x) % 2.2;
    if (ph < 0.5 && !D.calm()) { const k = Math.sin((ph / 0.5) * Math.PI); D.star(ctx, x + 10, y - 16, 2 + k * 4, `rgba(255,240,200,${k})`, 4, 0); }
  }

  // what came out of the tin, on a card like a Field Guide page
  class LootCard {
    constructor(id, place) { this.id = id; this.place = place; this.t = 0; this.transparent = true; this.finished = false; }
    update(dt) {
      this.t += dt;
      if (CK.autoSkip || (this.t > 0.6 && (Input.hit('ok') || Input.hit('back') || Input.mouse.pressed))) { this.finished = true; CK.Scenes.remove(this); }
    }
    draw(ctx) {
      const P = D.pal(), dec = decorById(this.id), skin = !dec && CK.Closet.item(this.id);
      const k = D.calm() ? 1 : CK.Ease.ui(Math.min(1, this.t * 3));
      ctx.fillStyle = P.scrim; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(W / 2, H / 2 + (1 - k) * 30); ctx.rotate(0.01);
      ctx.globalAlpha = Math.min(1, this.t * 4);
      D.panel(ctx, -280, -150, 560, 300, { theme: true, lines: 10, lineTop: 70 });
      D.text(ctx, 'Buried treasure · ' + this.place, -250, -112, { size: D.T.small, weight: 800, color: P.label });
      D.text(ctx, dec ? dec.name : skin ? skin.name : this.id, -250, -76, { size: D.T.title, weight: 700, color: P.text });
      D.stamp(ctx, 120, -126, 130, 130, { holes: P.sheet, margin: 7, hole: 3, pitch: 10, fill: '#f6efe0', art: (c, ix, iy, iw, ih) => {
        if (dec) drawDecor(c, this.id, ix + iw / 2, iy + ih * 0.86, 1.7, 0.3);
        else if (skin && CK.Closet.isPaint(this.id)) { c.save(); D.rr(c, ix + 14, iy + 20, iw - 28, ih - 40, 10); c.clip(); c.fillStyle = '#d9a66b'; c.fillRect(ix, iy, iw, ih); const m = c.getTransform(), kk = Math.hypot(m.a, m.b); c.setTransform(1, 0, 0, 1, 0, 0); CK.Closet.paintPattern(c, this.id, (ix + 14) * kk + m.e, (iy + 20) * kk + m.f, (iw - 28) * kk, (ih - 40) * kk, kk); c.restore(); }
        else CK.Closet.drawTopper(c, this.id, ix + iw / 2, iy + ih * 0.7, 2.4, 'down');
      } });
      const text = dec ? dec.blurb + (dec.loot ? ' There isn\'t another one anywhere.' : '') : skin ? skin.blurb : '';
      D.wrap(ctx, text, 340, D.T.ui, 600).slice(0, 3).forEach((l, i) => D.text(ctx, l, -250, -26 + i * 24, { size: D.T.ui, weight: 600, color: P.text }));
      D.text(ctx, dec ? 'It\'s waiting at your patch in Blossom Hollow.' : 'It\'s in the Catalogue now. Try it on!', -250, 74, { size: D.T.small, weight: 700, color: P.soft });
      D.cap(ctx, -238, 108, 1.1);
      D.text(ctx, '+25 bottle caps', -222, 114, { size: D.T.ui, weight: 800, color: P.accent });
      D.text(ctx, 'Treasure found: ' + Object.keys(st().dug).length + ' of 20', 250, 114, { size: D.T.small, weight: 700, color: P.soft, align: 'right' });
      ctx.restore();
    }
  }

  // ================================================================ OVERWORLD HOOKS
  const baseRefresh = OW.refresh;
  OW.refresh = function () {
    baseRefresh.call(this);
    pickGuests(this);
  };
  const baseExtra = OW.extraDraw;
  OW.extraDraw = function (list, ctx, ox, oy) {
    if (baseExtra) baseExtra.call(this, list, ctx, ox, oy);
    drawPatch(this, list, ctx);
    if (this.world && this.world.treasures) for (const t of this.world.treasures) if (st().maps[t.id] && !st().dug[t.id]) list.push({ y: (t.y + 0.5) * TS, f: () => drawTreasureMark(this, ctx, t) });
  };
  // lanterns in the patch glow at night like the ones out in the world
  const GLOW = { paperlantern: 70, icelantern: 70, toadhouse: 40 };
  OW.extraLights = function (lights, ox, oy) {
    const p = patchOf(this);
    if (!p) return;
    for (const q of st().patch) if (GLOW[q.id]) { const [px, py] = cellPx(p, q.i, q.j); lights.push([px - ox, py - oy - 22, GLOW[q.id], 0.9]); }
  };
  let pending = null;
  const baseUpdate = OW.update;
  OW.update = function (dt, active) {
    baseUpdate.call(this, dt, active);
    for (const g of this.guests || []) { g.t += dt; if (g.heart > 0) g.heart = Math.max(0, g.heart - dt); }
    const busy = !active || CK.scriptRunning > 0 || (CK.Trans && CK.Trans.busy);
    if (pending && !busy && CK.Scenes.top() === this) { const t = pending; pending = null; findMap(this, t); }
  };
  const baseFocus = OW.findFocus;
  OW.findFocus = function (p, who) {
    const f = baseFocus.call(this, p, who);
    if (f && f.type !== 'tree' && f.type !== 'landmark' && f.type !== 'signpost') return f;
    p = p || this.player;
    const fx = p.x + (p.dir === 'left' ? -26 : p.dir === 'right' ? 26 : 0);
    const fy = p.y + (p.dir === 'up' ? -26 : p.dir === 'down' ? 22 : -4);
    let best = null, bd = f && f.type !== 'tree' ? Math.hypot(fx - f.ix, fy - f.iy) : 50;
    const consider = (ix, iy, label, extra) => {
      const d = Math.min(Math.hypot(fx - ix, fy - iy), Math.hypot(p.x - ix, p.y - iy) + 8);
      if (d < bd) { bd = d; best = Object.assign({ ix, iy, promptLabel: label }, extra); }
    };
    const pa = patchOf(this);
    if (pa) {
      consider((pa.gx + 0.5) * TS, (pa.gy + 0.6) * TS, 'Tend your patch', { type: 'patch' });
      for (const g of this.guests || []) if (!g.greeted) consider(g.px, g.py, 'Say hi', { type: 'guest', ref: g });
    }
    if (this.world && this.world.treasures) for (const t of this.world.treasures) if (st().maps[t.id] && !st().dug[t.id]) consider((t.x + 0.5) * TS, (t.y + 0.75) * TS, 'Dig', { type: 'treasure', ref: t });
    return best || f;
  };
  const baseInteract = OW.interact;
  OW.interact = function (e, who) {
    if (e && e.type === 'patch') return openPatch(this);
    if (e && e.type === 'guest') return greet(this, e.ref);
    if (e && e.type === 'treasure') return dig(this, e.ref);
    if (e && (e.type === 'signpost' || e.type === 'landmark')) { const t = mapAt(this, e.ref); if (t) pending = t; }
    return baseInteract.call(this, e, who);
  };

  function greet(ow, g) {
    const P = st(), cr = PT.CRITTERS[g.id], first = !P.guests[g.id];
    g.greeted = true; g.heart = 1.4;
    P.guests[g.id] = (P.guests[g.id] || 0) + 1;
    tally('greets');
    CK.Audio.sfx('heal');
    const dec = decorById(g.near);
    const line = dec ? `The ${cr.name.toLowerCase()} is admiring your ${dec.name.toLowerCase()}.` : `The ${cr.name.toLowerCase()} is having a lovely time.`;
    if (first) { CK.G.caps += 6; CK.toast(`+6 bottle caps · First visit from a ${cr.name}`, '#ffe9e0'); }
    else CK.toast(line, '#fff6d8');
    if (first) CK.runScript([{ narrate: line + ' It looks very at home.' }]);
    CK.saveGame();
  }

  function openPatch(ow) {
    const P = st();
    if (!P.patchIntro) {
      P.patchIntro = 1;
      const starter = !P.decor.flowerpot;
      if (starter) P.decor.flowerpot = (P.decor.flowerpot || 0) + 1;
      CK.runScript([
        { narrate: 'A little fenced plot, gone wild. The sign says PATCH, in very old crayon.' },
        ['corry', 'This was your grandmother\'s garden, Builder. She planted the first flower in the whole Kingdom right here.', 'happy'],
        ['pip', 'Critters visit gardens that have things they like! Bees like beehives. Owlets like birdhouses. I like everything.', 'happy'],
        ...(starter ? [{ narrate: 'Tucked by the gate is a flower pot with your name on it. It\'s a start.' }] : []),
        { journal: 'Grandma Rosie\'s old garden in Blossom Hollow is mine now. Decorate it (Tansy\'s Garden page in the Kingdom Book, or buried treasure) and critters I\'ve sketched come to visit if there\'s something they like.' },
        { fn: () => { const s = CK.Scenes.push(new PatchScene(ow)); return [{ await: () => s }]; } },
      ]);
      CK.saveGame();
      return;
    }
    CK.Scenes.push(new PatchScene(ow));
  }

  // ================================================================ DECORATING
  // The camera glides over the patch; arrows move a cursor, Q/E pick a piece, Z puts it down or picks it up.
  class PatchScene {
    constructor(ow) {
      this.ow = ow; this.p = patchOf(ow); this.t = 0; this.transparent = true; this.finished = false;
      this.ci = 2; this.cj = 1; this.sel = 0;
      const m = ow.map;
      this.from = [ow.camX, ow.camY];
      this.to = [U.clamp((this.p.x + this.p.w / 2) * TS - W / 2, 0, m.w * TS - W), U.clamp((this.p.y + this.p.h / 2) * TS - H / 2 + 100, 0, m.h * TS - H)];
    }
    tray() { const P = st(); return DECOR.filter((d) => P.decor[d.id]); }
    at(i, j) { return st().patch.find((q) => q.i === i && q.j === j); }
    trayRect(k) { const n = this.tray().length, cw = 62, x0 = W / 2 - Math.min(n, 12) * (cw + 4) / 2; return [x0 + (k % 12) * (cw + 4), 422, cw, 52]; }
    cellRect(i, j) { const ow = this.ow; return [(this.p.x + i) * TS - ow.camX + 2, (this.p.y + j) * TS - ow.camY + 2, TS - 4, TS - 4]; }
    update(dt) {
      this.t += dt;
      const ow = this.ow, k = D.calm() ? 1 : CK.Ease.ui(Math.min(1, this.t * 2.5));
      ow.camX = U.lerp(this.from[0], this.to[0], k); ow.camY = U.lerp(this.from[1], this.to[1], k);
      if (CK.autoSkip && this.t > 0.2) return this.close();
      if (this.t < 0.25) return;
      const tray = this.tray();
      if (this.sel >= tray.length) this.sel = Math.max(0, tray.length - 1);
      // a long tray scrolls in pages of twelve
      if (Input.hit('back')) return this.close();
      if (Input.hit('left')) { this.ci = (this.ci + this.p.w - 1) % this.p.w; CK.Audio.sfx('blip'); }
      if (Input.hit('right')) { this.ci = (this.ci + 1) % this.p.w; CK.Audio.sfx('blip'); }
      if (Input.hit('up')) { this.cj = (this.cj + this.p.h - 1) % this.p.h; CK.Audio.sfx('blip'); }
      if (Input.hit('down')) { this.cj = (this.cj + 1) % this.p.h; CK.Audio.sfx('blip'); }
      if (tray.length && (Input.key('KeyE') || Input.key('Tab'))) { this.sel = (this.sel + 1) % tray.length; CK.Audio.sfx('blip'); }
      if (tray.length && Input.key('KeyQ')) { this.sel = (this.sel + tray.length - 1) % tray.length; CK.Audio.sfx('blip'); }
      const page = Math.floor(this.sel / 12);
      for (let i = 0; i < this.p.w; i++) for (let j = 0; j < this.p.h; j++) {
        const r = this.cellRect(i, j);
        if (Input.mouse.moved && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) { this.ci = i; this.cj = j; }
        if (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) { this.ci = i; this.cj = j; return this.act(); }
      }
      tray.forEach((d, n) => { if (Math.floor(n / 12) !== page) return; const r = this.trayRect(n); if (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) { this.sel = n; CK.Audio.sfx('select'); } });
      if (Input.hit('ok')) this.act();
    }
    act() {
      const P = st(), here = this.at(this.ci, this.cj), tray = this.tray();
      if (here) {
        P.patch = P.patch.filter((q) => q !== here);
        this.sel = Math.max(0, tray.findIndex((d) => d.id === here.id));
        CK.Audio.sfx('back');
        return;
      }
      const d = tray[this.sel];
      if (!d) { CK.Audio.sfx('error'); CK.toast('Nothing to put down yet. Order garden pieces from the Kingdom Book (Garden page).'); return; }
      if (spare(d.id) <= 0) { CK.Audio.sfx('error'); CK.toast(`Every ${d.name.toLowerCase()} you have is already out. Pick one up, or order another.`); return; }
      P.patch.push({ i: this.ci, j: this.cj, id: d.id });
      tally('placed');
      CK.Audio.sfx('tape');
      this.ow.fx.burst(8, () => ({ x: (this.p.x + this.ci + 0.5) * TS + U.rand(-12, 12), y: (this.p.y + this.cj + 0.7) * TS, vx: U.rand(-60, 60), vy: U.rand(-90, -30), life: 0.7, size: 5, shape: 'star', color: '#ffe38a' }));
    }
    close() {
      this.finished = true; CK.Scenes.remove(this);
      CK.Audio.sfx('back');
      pickGuests(this.ow);
      if ((this.ow.guests || []).length) CK.toast(`Someone's come to see your patch: ${this.ow.guests.map((g) => PT.CRITTERS[g.id].name).join(', ')}`, '#fff6d8');
      CK.saveGame();
    }
    draw(ctx) {
      const P = D.pal(), ow = this.ow, tray = this.tray();
      // cells: a soft grid, the cursor, and a ghost of what would go there
      for (let i = 0; i < this.p.w; i++) for (let j = 0; j < this.p.h; j++) { const [x, y, w, h] = this.cellRect(i, j); D.rr(ctx, x, y, w, h, 8); stroke(ctx, 1.2, 'rgba(255,255,255,.55)'); }
      const [x, y, w, h] = this.cellRect(this.ci, this.cj), here = this.at(this.ci, this.cj), d = tray[this.sel];
      const pulse = D.calm() ? 0 : Math.sin(this.t * 5) * 1.5;
      D.rr(ctx, x - pulse, y - pulse, w + pulse * 2, h + pulse * 2, 9); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fill(); stroke(ctx, 3, P.accent);
      if (!here && d && spare(d.id) > 0) { ctx.save(); ctx.globalAlpha = 0.55; drawDecor(ctx, d.id, x + w / 2, y + h - 4, 1, 0.3); ctx.restore(); }
      // the instructions card
      D.panel(ctx, 16, 14, 330, 112, { theme: true });
      D.text(ctx, 'Your Patch', 34, 50, { size: D.T.heading, weight: 700, color: P.text });
      D.text(ctx, 'Arrows: move   ·   Q / E: choose', 34, 78, { size: D.T.small, weight: 700, color: P.soft });
      D.text(ctx, 'Z: put down or pick up   ·   X: done', 34, 100, { size: D.T.small, weight: 700, color: P.soft });
      // the tray of garden pieces you own
      D.panel(ctx, 40, 412, W - 80, 120, { theme: true });
      if (!tray.length) D.text(ctx, 'No garden pieces yet. Order some on the Garden page of the Kingdom Book.', W / 2, 470, { size: D.T.ui, weight: 700, align: 'center', color: P.text });
      const page = Math.floor(this.sel / 12);
      tray.forEach((dd, n) => {
        if (Math.floor(n / 12) !== page) return;
        const [tx, ty, tw, th] = this.trayRect(n), on = n === this.sel, left = spare(dd.id);
        D.rr(ctx, tx, ty, tw, th, 8); ctx.fillStyle = on ? P.sheetHi : P.sheet; ctx.fill(); stroke(ctx, on ? 3 : 1.5, on ? P.accent : P.line);
        ctx.save(); if (!left) ctx.globalAlpha = 0.4; drawDecor(ctx, dd.id, tx + tw / 2, ty + th - 8, 0.66, 0.3); ctx.restore();
        D.text(ctx, '×' + left, tx + tw - 6, ty + 16, { size: 13, weight: 800, align: 'right', color: left ? P.text : P.soft });
      });
      if (tray.length > 12) D.text(ctx, 'Page ' + (page + 1) + ' of ' + Math.ceil(tray.length / 12), W - 60, 500, { size: 12, weight: 700, align: 'right', color: P.soft });
      const info = here ? decorById(here.id) : d;
      if (info) {
        const fans = likedBy(info.id), seen = st().seen;
        const who = fans.map((c) => (seen[c] ? PT.CRITTERS[c].name : '???')).join(', ');
        D.text(ctx, (here ? 'Z picks up: ' : '') + info.name, 60, 498, { size: D.T.ui, weight: 800, color: P.text });
        D.text(ctx, 'Liked by: ' + who, 60, 518, { size: D.T.small, weight: 700, color: P.soft });
      }
    }
  }
  CK.PatchScene = PatchScene;

  // ================================================================ JOBS & CHALLENGES
  const anyMapToDig = () => Object.keys(st().maps).some((id) => !st().dug[id]);
  PT.JOBS.push(
    { id: 'map', key: 'mapsFound', n: [1, 1], pay: 15, text: () => 'Find a treasure map (behind a signpost or at a landmark)', ok: () => Object.keys(st().maps).length < 20 },
    { id: 'dig', key: 'digs', n: [1, 1], pay: 20, text: () => 'Dig up a buried treasure', ok: anyMapToDig },
    { id: 'decor', key: 'placed', n: [1, 2], pay: 12, text: (n) => (n > 1 ? `Put ${n} things in your patch` : 'Put something in your patch'), ok: () => !!st().patchIntro },
    { id: 'greet', key: 'greets', n: [1, 2], pay: 12, text: (n) => (n > 1 ? `Say hi to ${n} critters visiting your patch` : 'Say hi to a critter visiting your patch'), ok: () => st().patch.length > 0 && Object.keys(st().seen).length > 0 },
  );
  PT.CHALLENGES.push(
    { id: 'treasure', name: 'Treasure Hunter', what: 'treasures dug up', tiers: [2, 8, 20], val: () => Object.keys(st().dug).length, gold: 'mapcloth' },
    { id: 'garden', name: 'Green Thumb', what: 'things in your patch', tiers: [3, 8, 15], val: () => st().patch.length, gold: 'strawhat' },
    { id: 'guests', name: 'Good Host', what: 'critter kinds who visited your patch', tiers: [2, 6, 12], val: () => Object.keys(st().guests).length, gold: 'bloom' },
  );

  // ================================================================ FOR THE BOOK
  CK.Garden = {
    DECOR, LIKES, likedBy, owned, placed, spare, drawDecor, st, sourcesOf,
    buy(id) {
      const d = decorById(id), P = st();
      if (!d || d.loot) return false;
      if (CK.G.caps < d.cost) return false;
      CK.G.caps -= d.cost; P.decor[id] = (P.decor[id] || 0) + 1;
      PT.tally('bought');
      CK.saveGame();
      return true;
    },
    treasuresIn(id) { const ch = CK.Chapters[id], wd = ch && CK.World.get(ch); return wd ? wd.treasures : []; },
    openMap(tid) { CK.Scenes.push(new TreasureMapScene(tid, CK.OW)); },
  };
  CK.debugGarden = {
    give(id, n) { const P = st(); for (const d of id ? [decorById(id)] : DECOR) P.decor[d.id] = (P.decor[d.id] || 0) + (n || 1); },
    guests() { if (CK.OW) pickGuests(CK.OW); return CK.OW && CK.OW.guests.map((g) => g.id); },
    patch() { return CK.OW && patchOf(CK.OW); },
    mapAll() { const P = st(); for (const id of KIT_ORDER()) for (const t of CK.Garden.treasuresIn(id)) P.maps[t.id] = 1; },
    loot: lootOf,
  };
})();
