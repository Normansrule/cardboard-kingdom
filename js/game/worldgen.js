// Cardboard Kingdom - World Dressing (v2.22). A small world generator that gives every Kingdom place
// structure and detail, so the maps stop being open lawns with trees sprinkled on them.
//
// The shape of it is borrowed from three open-source map makers (ideas only, the code is our own):
//  * Azgaar's Fantasy Map Generator: a pipeline of settings -> generators -> world data -> renderer.
//    Here: KITS (per-place settings) -> fields, biomes, WFC, placement -> CK.World.data[id] -> draw.
//  * Red Blob Games' mapgen4: biomes come from two fields crossed in a lookup, "how wet" (distance to
//    water, plus noise) and "how lush" (fractal noise), the same idea as its elevation x moisture.
//  * mxgmn's WaveFunctionCollapse, simple tiled model: each free cell holds every detail tile it could
//    be (grass, flowers, tall grass, bush, stones, garden plot). The lowest-entropy cell collapses to
//    one, and neighbour rules propagate (bushes never touch flower beds, plots only sit in yards...).
//    Weights come from the biome, so the result forms coherent patches instead of salt and pepper.
// Then rule-based "markers" (Azgaar calls them that too): yard props by each house, signposts at path
// junctions that name what lies down each road, landmarks at the far quiet corners, and hiding spots
// for paper cranes and critters (used by pastimes.js).
//
// Safety: nothing goes on paths, water, objects, flood puddles or patrol routes, and every solid prop
// is checked with a flood fill from the start tile. If it would cut off a single reachable tile, it
// becomes tall grass instead. The world is deterministic (seeded by the place), so it is the same on
// every visit and on every computer.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U;
  const TS = 48, W = CK.W, H = CK.H;
  const C = D.C, TAU = Math.PI * 2;
  const stroke = (ctx, lw, col) => { ctx.strokeStyle = col || C.ink; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };

  // ================================================================ NOISE
  // value noise and fBm, seeded through U.hash so it never changes between machines
  const smooth = (t) => t * t * (3 - 2 * t);
  function vnoise(x, y, seed) {
    const xi = Math.floor(x), yi = Math.floor(y), u = smooth(x - xi), v = smooth(y - yi);
    const a = U.hash(xi, yi, seed), b = U.hash(xi + 1, yi, seed), c = U.hash(xi, yi + 1, seed), d = U.hash(xi + 1, yi + 1, seed);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, seed, oct) {
    let f = 0, amp = 0.5, fr = 1, n = 0;
    for (let i = 0; i < (oct || 3); i++) { f += amp * vnoise(x * fr, y * fr, seed + i * 31); n += amp; amp *= 0.5; fr *= 2; }
    return f / n;
  }
  // a small seeded RNG for the WFC choices (mulberry32)
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const strSeed = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };

  // ================================================================ SETTINGS
  // Each Kingdom place gets a kit: what grows there, what people leave in their yards, which landmarks
  // sit in its quiet corners. Places not listed here (the real world, interiors) are left alone.
  const KITS = {
    spring: { bush: '#7cc76a', bloom: '#ffb7d5', flowers: ['#ffffff', '#ffb7d5', '#ffe38a', '#c9a7ff'], yard: ['mailbox', 'birdhouse', 'wateringcan', 'flowerpot'], scatter: [['wheelbarrow', 'plain', 0.006], ['stump', 'grove', 0.02], ['beehive', 'meadow', 0.008]], marks: ['picnic', 'well', 'cairn'], plot: 'sprouts', patch: true },
    summer: { bush: '#6cbf5a', bloom: '#ff6f8f', flowers: ['#ff6f8f', '#ffd25a', '#ffffff'], yard: ['mailbox', 'surfboard', 'beachball', 'flowerpot'], scatter: [['sandcastle', 'sand', 0.02], ['shell', 'sand', 0.05], ['buoy', 'sand', 0.006], ['driftwood', 'sand', 0.01]], marks: ['picnic', 'lookout', 'cairn'], plot: 'melons' },
    fall: { bush: '#c98a3a', bloom: '#e8403a', flowers: ['#e8743b', '#f2a93b', '#c94f2c'], yard: ['mailbox', 'pumpkins', 'haybale', 'applecrate'], scatter: [['haybale', 'dry', 0.015], ['stump', 'grove', 0.025], ['mushrooms', 'grove', 0.03], ['scarecrow', 'meadow', 0.004]], marks: ['picnic', 'well', 'cairn'], plot: 'pumpkins' },
    winter: { bush: '#4f9a78', bloom: '#ef6b6b', flowers: ['#ffffff', '#cfe8ff'], snow: true, yard: ['mailbox', 'sled', 'woodpile', 'icelantern'], scatter: [['snowman', 'plain', 0.006], ['woodpile', 'grove', 0.01], ['icelantern', 'plain', 0.006], ['footprints', 'plain', 0.02]], marks: ['lookout', 'cairn', 'snowfort'], plot: 'cabbages' },
    lanternmere: { bush: '#b07a3a', bloom: '#ffd25a', flowers: ['#ffd25a', '#ff9f6a', '#ffffff'], yard: ['mailbox', 'paperlantern', 'pumpkins', 'flowerpot'], scatter: [['paperlantern', 'plain', 0.012], ['mushrooms', 'grove', 0.04], ['stump', 'grove', 0.02]], marks: ['well', 'lookout', 'cairn'], plot: 'pumpkins' },
    gullpoint: { bush: '#4f9a78', bloom: '#ffffff', flowers: ['#ffffff', '#cfe8ff'], snow: true, yard: ['mailbox', 'lobstertrap', 'ropecoil', 'woodpile'], scatter: [['driftwood', 'plain', 0.01], ['lobstertrap', 'wet', 0.02], ['buoy', 'wet', 0.012], ['footprints', 'plain', 0.02]], marks: ['lookout', 'cairn', 'snowfort'], plot: 'cabbages' },
    longbridge: { bush: '#7cc76a', bloom: '#ffd25a', flowers: ['#ffffff', '#ffb7d5', '#ffe38a', '#8fd0ff'], yard: ['mailbox', 'bunting', 'balloons', 'flowerpot'], scatter: [['bunting', 'plain', 0.008], ['haybale', 'dry', 0.01], ['stump', 'grove', 0.02]], marks: ['picnic', 'lookout', 'cairn'], plot: 'sprouts' },
    ferryyard: { bush: '#78b85a', bloom: '#ffa53a', flowers: ['#ffa53a', '#ffffff', '#ffd25a'], yard: ['mailbox', 'crates', 'barrel', 'ropecoil'], scatter: [['crates', 'plain', 0.01], ['barrel', 'wet', 0.012], ['ropecoil', 'wet', 0.012], ['stump', 'grove', 0.02]], marks: ['well', 'lookout', 'cairn'], plot: 'melons' },
    marsh: { bush: '#6aa85a', bloom: '#c9a7ff', flowers: ['#c9a7ff', '#ffffff', '#ffe38a'], yard: ['mailbox', 'flowerpot', 'barrel', 'birdhouse'], scatter: [['cattails', 'wet', 0.08], ['log', 'grove', 0.015], ['mushrooms', 'grove', 0.03], ['stump', 'plain', 0.01]], marks: ['lookout', 'cairn', 'well'], plot: 'sprouts' },
    thimble: { bush: '#7cc76a', bloom: '#ff8fb1', flowers: ['#ff8fb1', '#ffffff', '#8fd0ff', '#ffd25a'], yard: ['mailbox', 'spool', 'button', 'flowerpot'], scatter: [['spool', 'plain', 0.01], ['button', 'meadow', 0.02], ['pins', 'dry', 0.01]], marks: ['picnic', 'well', 'cairn'], plot: 'sprouts' },
  };
  CK.World = { KITS, data: {}, vnoise, fbm };
  const dressed = (ch) => !!KITS[ch.id];
  CK.World.dressed = dressed;

  // ================================================================ GENERATORS
  const FREE = '.,sz';              // ground the dressing may use
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const passable = (t) => t != null && !'~TRfw'.includes(t); // barricades, drifts, shallows, broken bridges count as open (they open up later)

  // tiles of the WFC detail layer
  const E = 0, F = 1, G = 2, B = 3, S = 4, P = 5, NT = 6;
  const COMPAT = [
    [E, F, G, B, S, P], // E: anything
    [E, F, G],          // F flowers: never right against a bush, stones or a plot
    [E, F, G, B, S],    // G tall grass
    [E, G, B],          // B bush: hedges grow from bushes, grass at their feet
    [E, G, S],          // S stones
    [E, P],             // P garden plot: tidy, only next to lawn or more plot
  ].map((l) => l.reduce((m, t) => m | (1 << t), 0));
  // weights per biome, in tile order E F G B S P
  const BIOME_W = {
    meadow: [3, 5, 1.6, 0.45, 0.15, 0],
    grove: [2.2, 0.4, 2.4, 3.2, 0.3, 0],
    wet: [3, 0.6, 4, 0.2, 0.2, 0],
    dry: [6, 0.3, 0.6, 0.15, 1.1, 0],
    plain: [8, 1, 1, 0.7, 0.25, 0],
    yard: [4, 2.2, 0.3, 0.6, 0, 3],
    verge: [8, 1.1, 0.5, 0, 0.5, 0],
    sand: [9, 0, 0.3, 0, 0.6, 0],
  };

  // Generate the world data for a chapter. Cached by place and by the exact tile layout, so a map that
  // changes with the story (the marsh gets its bends back) gets a fresh, matching dressing.
  CK.World.get = function (ch) {
    if (!dressed(ch)) return null;
    const base = CK.buildChapterMap(ch);
    const sig = base.t.map((r) => r.join('')).join('|');
    const key = ch.id + ':' + strSeed(sig);
    if (CK.World.data[key]) return CK.World.data[key];
    const wd = generate(ch, base);
    CK.World.data[key] = wd;
    return wd;
  };

  function generate(ch, m) {
    const kit = KITS[ch.id], seed = strSeed(ch.id) % 100000;
    const w = m.w, h = m.h, idx = (x, y) => y * w + x, inb = (x, y) => x > 0 && y > 0 && x < w - 1 && y < h - 1;
    const tile = (x, y) => m.get(x, y);

    // ---------------------------------------------------- reserved cells
    // reserve[i]: 2 = nothing at all may go here, 1 = only flat, walk-over details
    const reserve = new Uint8Array(w * h);
    const mark = (x0, y0, x1, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (x >= 0 && y >= 0 && x < w && y < h) reserve[idx(x, y)] = Math.max(reserve[idx(x, y)], v); };
    const blockers = new Set(); // cells objects physically occupy (for the reachability check)
    for (const o of ch.objects) {
      const x = o.x, y = o.y;
      if (o.type === 'trigger') { mark(x, y, x + (o.w || 1) - 1, y + (o.h || 1) - 1, 1); continue; }
      if (o.type === 'enemy') {
        const pts = o.patrol || [[x, y]];
        for (let k = 0; k < pts.length; k++) {
          const [ax, ay] = pts[k], [bx, by] = pts[(k + 1) % pts.length];
          const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
          for (let s = 0; s <= n; s++) { const px = Math.round(ax + ((bx - ax) * s) / n), py = Math.round(ay + ((by - ay) * s) / n); mark(px - 1, py - 1, px + 1, py + 1, 1); mark(px, py, px, py, 2); }
        }
        continue;
      }
      if (o.type === 'house') { mark(x - 1, y - 2, x + 2, y + 2, 2); blockers.add(idx(x, y)); blockers.add(idx(x + 1, y)); continue; }
      if (o.type === 'building') {
        const bw = o.bw || 3, bh = o.bh || 2, x0 = x - Math.floor(bw / 2), y0 = y - bh + 1;
        mark(x0 - 1, y0 - 1, x0 + bw, y + 2, 2);
        for (let yy = y0; yy <= y; yy++) for (let xx = x0; xx < x0 + bw; xx++) blockers.add(idx(xx, yy));
        continue;
      }
      if (o.type === 'deco') {
        const fp = CK.DECO_FOOT && CK.DECO_FOOT[o.kind];
        if (fp) {
          mark(Math.floor(x + fp[0]) - 1, Math.floor(y + fp[1]) - 2, Math.ceil(x + fp[0] + fp[2]), Math.ceil(y + fp[1] + fp[3]) + 1, 2);
          for (let yy = Math.floor(y + fp[1]); yy < Math.ceil(y + fp[1] + fp[3]); yy++) for (let xx = Math.floor(x + fp[0]); xx < Math.ceil(x + fp[0] + fp[2]); xx++) blockers.add(idx(xx, yy));
        } else mark(x - 1, y - 1, x + 1, y + 1, 2);
        continue;
      }
      if (o.type === 'site' || o.type === 'dam' || o.type === 'gates' || o.type === 'span' || o.type === 'truss' || o.type === 'arch' || o.type === 'shore') { mark(x - 3, y - 3, x + 3, y + 3, 2); continue; }
      if (o.type === 'npc') { mark(x - 2, y - 1, x + 2, y + 1, 2); blockers.add(idx(x, y)); continue; }
      mark(x - 1, y - 1, x + 1, y + 1, 2);
      if (o.type !== 'cat' && o.type !== 'knightfig') blockers.add(idx(x, y));
    }
    for (const [fx, fy] of ch.flood || []) mark(fx, fy, fx, fy, 2);
    mark(ch.start[0] - 2, ch.start[1] - 2, ch.start[0] + 2, ch.start[1] + 2, 2);
    const dig = CK.G && CK.G.flags && CK.G.flags['rivet_spots_' + ch.id];
    if (dig) for (const [x, y] of dig) mark(x - 1, y - 1, x + 1, y + 1, 2);
    for (const r of (ch.world && ch.world.keepClear) || []) mark(r[0], r[1], r[0] + r[2] - 1, r[1] + r[3] - 1, 2);

    // ---------------------------------------------------- fields
    // wetness: breadth-first distance to open water or shallows, softened with noise (mapgen4's moisture)
    const dist = new Int16Array(w * h).fill(99);
    const q = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if ('~h'.includes(tile(x, y))) { dist[idx(x, y)] = 0; q.push([x, y]); }
    for (let qi = 0; qi < q.length; qi++) {
      const [x, y] = q[qi];
      for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const i = idx(nx, ny); if (dist[i] > dist[idx(x, y)] + 1) { dist[i] = dist[idx(x, y)] + 1; q.push([nx, ny]); } }
    }
    // distance from paths, for verges and for "far away" landmarks
    const pdist = new Int16Array(w * h).fill(99);
    const pq = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if ('=bd'.includes(tile(x, y))) { pdist[idx(x, y)] = 0; pq.push([x, y]); }
    for (let qi = 0; qi < pq.length; qi++) {
      const [x, y] = pq[qi];
      for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy; if (!inb(nx, ny) || !passable(tile(nx, ny))) continue; const i = idx(nx, ny); if (pdist[i] > pdist[idx(x, y)] + 1) { pdist[i] = pdist[idx(x, y)] + 1; pq.push([nx, ny]); } }
    }
    const treesNear = (x, y) => { let n = 0; for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) if (tile(x + i, y + j) === 'T') n++; return n; };
    const houses = ch.objects.filter((o) => o.type === 'house' || o.type === 'building');
    const nearHouse = (x, y) => houses.some((o) => Math.abs(o.x + (o.type === 'house' ? 0.5 : 0) - x) <= 3.5 && Math.abs(o.y - y) <= 3);

    // ---------------------------------------------------- biomes
    const biome = new Array(w * h).fill(null);
    for (let y = 1; y < h - 1; y++)
      for (let x = 1; x < w - 1; x++) {
        const i = idx(x, y), t = tile(x, y);
        if (!FREE.includes(t) || reserve[i] >= 2) continue;
        const lush = fbm(x / 7, y / 7, seed);
        const wet = Math.exp(-dist[i] / 2.6) * 0.75 + vnoise(x / 3, y / 3, seed + 5) * 0.25;
        let b;
        if ('sz'.includes(t)) b = 'sand';
        else if (pdist[i] === 1) b = 'verge';
        else if (nearHouse(x, y)) b = 'yard';
        else if (treesNear(x, y) >= 4 || (lush > 0.58 && treesNear(x, y) >= 2)) b = 'grove';
        else if (wet > 0.52) b = 'wet';
        else if (lush > 0.6) b = 'meadow';
        else if (lush < 0.36) b = 'dry';
        else b = 'plain';
        biome[i] = b;
      }

    // ---------------------------------------------------- WFC (simple tiled model)
    const R = rng(seed * 7 + 1);
    const cells = [];
    const wave = new Uint8Array(w * h); // bitmask of tiles still possible; 0 = not part of the layer
    const weights = new Array(w * h);
    for (let y = 1; y < h - 1; y++)
      for (let x = 1; x < w - 1; x++) {
        const i = idx(x, y), b = biome[i];
        if (!b) continue;
        // noise makes clumps: a low-frequency "patch" field nudges flowers and bushes up or down
        const patch = vnoise(x / 3.2, y / 3.2, seed + 9);
        const wt = BIOME_W[b].slice();
        wt[F] *= 0.4 + patch * 1.4; wt[B] *= 0.3 + (1 - patch) * 1.5; wt[G] *= 0.6 + vnoise(x / 2.5, y / 2.5, seed + 13);
        if (reserve[i] === 1) { wt[B] = 0; wt[P] = 0; } // walk-over details only
        let mask = 0;
        wt.forEach((v, t) => { if (v > 0) mask |= 1 << t; });
        wave[i] = mask | 1; // empty lawn is always possible, so the solve can't dead-end
        weights[i] = wt;
        cells.push(i);
      }
    const ent = (i) => { let s = 0, sl = 0; for (let t = 0; t < NT; t++) if (wave[i] & (1 << t)) { const v = weights[i][t] || 0.01; s += v; sl += v * Math.log(v); } return Math.log(s) - sl / s; };
    const popc = (v) => { let n = 0; while (v) { n += v & 1; v >>= 1; } return n; };
    const out = new Int8Array(w * h).fill(-1);
    let left = cells.length;
    const propagate = (start) => {
      const st = [start];
      while (st.length) {
        const i = st.pop(), x = i % w, y = (i / w) | 0;
        let allow = 0;
        for (let t = 0; t < NT; t++) if (wave[i] & (1 << t)) allow |= COMPAT[t];
        for (const [dx, dy] of N4) {
          const j = idx(x + dx, y + dy);
          if (!wave[j] || out[j] >= 0) continue;
          const nv = wave[j] & allow;
          if (nv !== wave[j]) { wave[j] = nv || 1; if (popc(wave[j]) === 1) { out[j] = Math.log2(wave[j]); left--; } st.push(j); }
        }
      }
    };
    while (left > 0) {
      let best = -1, be = Infinity;
      for (const i of cells) { if (out[i] >= 0) continue; const e = ent(i) + R() * 1e-3; if (e < be) { be = e; best = i; } }
      if (best < 0) break;
      let sum = 0;
      for (let t = 0; t < NT; t++) if (wave[best] & (1 << t)) sum += weights[best][t];
      let r = R() * sum, pick = E;
      for (let t = 0; t < NT; t++) if (wave[best] & (1 << t)) { r -= weights[best][t]; if (r <= 0) { pick = t; break; } }
      wave[best] = 1 << pick; out[best] = pick; left--;
      propagate(best);
    }

    // ---------------------------------------------------- reachability guard
    const solid = new Uint8Array(w * h);
    const open = (i) => !solid[i] && !blockers.has(i) && passable(tile(i % w, (i / w) | 0));
    const sIdx = idx(ch.start[0], ch.start[1]);
    const reach = () => {
      const seen = new Uint8Array(w * h); const st = [sIdx]; seen[sIdx] = 1; let n = 1;
      while (st.length) { const i = st.pop(), x = i % w, y = (i / w) | 0; for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = idx(nx, ny); if (!seen[j] && open(j)) { seen[j] = 1; n++; st.push(j); } } }
      return { n, seen };
    };
    let base = reach();
    const reachable0 = base.seen;

    // ---------------------------------------------------- your patch (Blossom Hollow only)
    // A 5 by 3 plot of open lawn near where you arrive, with a gate a few steps from a road. It's kept
    // bare so you can decorate it (garden.js). Found by scanning every spot and keeping the closest.
    let patch = null;
    const patchCells = [];
    if (kit.patch) {
      const PW = 5, PH = 3;
      let best = null;
      for (let y = 2; y < h - PH - 2; y++)
        for (let x = 2; x < w - PW - 2; x++) {
          let ok = true;
          for (let j = 0; j < PH && ok; j++) for (let i = 0; i < PW && ok; i++) { const k = idx(x + i, y + j); ok = FREE.includes(tile(x + i, y + j)) && !reserve[k] && reachable0[k] && pdist[k] >= 1; }
          // the gate is the middle of whichever side is nearest a road
          const gates = [[x + 2, y - 1, 'up'], [x + 2, y + PH, 'down'], [x - 1, y + 1, 'left'], [x + PW, y + 1, 'right']].filter(([gx, gy]) => reachable0[idx(gx, gy)] && pdist[idx(gx, gy)] <= 2).sort((a, b) => pdist[idx(a[0], a[1])] - pdist[idx(b[0], b[1])]);
          if (!ok || !gates.length) continue;
          const [gx, gy, side] = gates[0];
          const score = Math.hypot(x + 2 - ch.start[0], y + 1 - ch.start[1]) + U.hash(x, y, seed + 61) * 3;
          if (!best || score < best.score) best = { x, y, gx, gy, side, score };
        }
      if (best) {
        patch = { x: best.x, y: best.y, w: PW, h: PH, gx: best.gx, gy: best.gy, side: best.side };
        mark(best.x, best.y, best.x + PW - 1, best.y + PH - 1, 2);
        for (const [cx, cy] of [[best.gx, best.gy]].concat(Array.from({ length: PW * PH }, (_, n) => [best.x + (n % PW), best.y + Math.floor(n / PW)]))) { const k = idx(cx, cy); out[k] = -1; patchCells.push(k); }
      }
    }
    const trySolid = (i) => {
      solid[i] = 1;
      if (!base.seen[i]) return true; // a pocket nobody can reach anyway
      const r = reach();
      if (r.n === base.n - (base.seen[i] ? 1 : 0)) { base = r; return true; }
      solid[i] = 0;
      return false;
    };

    // ---------------------------------------------------- props
    const props = [], flat = [];
    const occupied = new Uint8Array(w * h);
    for (const k of patchCells) occupied[k] = 1;
    const put = (kind, x, y, o = {}) => {
      const i = idx(x, y);
      if (o.solid && !trySolid(i)) return null;
      occupied[i] = 1;
      const pr = Object.assign({ kind, x, y, px: (x + 0.5) * TS, py: (y + 0.8) * TS, seed: U.hash(x, y, seed) }, o);
      props.push(pr);
      return pr;
    };
    const canPut = (x, y, solidToo) => { if (!inb(x, y)) return false; const i = idx(x, y); return !occupied[i] && FREE.includes(tile(x, y)) && reserve[i] < (solidToo ? 1 : 2); };

    for (const i of cells) {
      const x = i % w, y = (i / w) | 0, t = out[i];
      if (t < 0) continue;
      if (t === F) flat.push({ kind: 'flowers', x, y, seed: U.hash(x, y, seed + 2) });
      else if (t === S) flat.push({ kind: 'pebbles', x, y, seed: U.hash(x, y, seed + 3) });
      else if (t === P) flat.push({ kind: 'plot', x, y, seed: U.hash(x, y, seed + 4) });
      else if (t === G) put('tallgrass', x, y);
      else if (t === B) {
        // connected bushes read as a hedge, a lone one as a round shrub (berries now and then)
        if (!put(biome[i] === 'yard' ? 'hedge' : 'bush', x, y, { solid: true })) put('tallgrass', x, y);
      }
    }
    // hedges and bushes know their neighbours so they can join up
    const solidKind = new Map(props.filter((p) => p.kind === 'bush' || p.kind === 'hedge').map((p) => [idx(p.x, p.y), p]));
    for (const p of solidKind.values()) {
      p.l = solidKind.has(idx(p.x - 1, p.y)); p.r = solidKind.has(idx(p.x + 1, p.y));
      if (p.l || p.r) p.kind = 'hedge';
    }

    // yards: something personal by every house (a mailbox, a birdhouse, a pumpkin pile...)
    let yi = 0;
    for (const o of ch.objects) {
      if (o.type !== 'house') continue;
      // one mailbox by the door, and maybe one thing that says who lives here
      const spots = [[o.x + 2, o.y + 1], [o.x - 1, o.y + 1], [o.x - 1, o.y]];
      for (const [k, [x, y]] of spots.entries()) {
        if (k > 0 && U.hash(o.x, o.y, seed + 40 + k) < 0.55) continue;
        if (k === 2 && props.some((p) => p.x === o.x - 1 && p.y === o.y + 1)) continue;
        if (!inb(x, y) || occupied[idx(x, y)] || !FREE.includes(tile(x, y))) continue;
        if (pdist[idx(x, y)] === 0) continue;
        const kind = k === 0 ? 'mailbox' : kit.yard.filter((y) => y !== 'mailbox')[(yi++ + Math.floor(U.hash(o.x, o.y, seed + 42) * 9)) % (kit.yard.length - 1)];
        put(kind, x, y, { solid: true, roof: o.roof, small: true });
      }
    }

    // scatter: a few props per biome, by kit
    for (const [kind, where, dens] of kit.scatter) {
      for (const i of cells) {
        const x = i % w, y = (i / w) | 0;
        const b = biome[i];
        const ok = where === 'sand' ? b === 'sand' : where === 'wet' ? b === 'wet' || dist[i] <= 1 : b === where;
        if (!ok || occupied[i] || out[i] === P) continue;
        if (U.hash(x, y, strSeed(kind) % 997) > dens) continue;
        const flatKind = ['shell', 'footprints'].includes(kind);
        if (flatKind) { flat.push({ kind, x, y, seed: U.hash(x, y, seed + 7) }); continue; }
        const soft = ['cattails', 'mushrooms', 'bunting', 'paperlantern', 'icelantern', 'button', 'pins'].includes(kind);
        if (!soft && reserve[i] >= 1) continue;
        put(kind, x, y, { solid: !soft, light: kind === 'paperlantern' || kind === 'icelantern' ? 70 : 0 });
      }
    }
    // reeds and lily pads along the water's edge (lily pads are drawn on the water itself)
    const lily = [];
    for (let y = 1; y < h - 1; y++)
      for (let x = 1; x < w - 1; x++) {
        const i = idx(x, y);
        if (tile(x, y) === '~' && N4.some(([dx, dy]) => FREE.includes(tile(x + dx, y + dy))) && U.hash(x, y, seed + 21) < 0.16 && !kit.snow) lily.push({ x, y, seed: U.hash(x, y, seed + 22) });
        if (biome[i] && dist[i] === 1 && !occupied[i] && out[i] !== P && U.hash(x, y, seed + 23) < 0.28 && !kit.snow) put('reeds', x, y);
      }

    // ---------------------------------------------------- markers
    // quiet corners: reachable cells far from any path, spread apart (Azgaar's markers, sort of)
    const far = [];
    for (let y = 2; y < h - 2; y++)
      for (let x = 2; x < w - 2; x++) {
        const i = idx(x, y);
        if (!reachable0[i] || !base.seen[i] || occupied[i] || reserve[i] >= 1 || !FREE.includes(tile(x, y))) continue;
        let openN = 0; for (const [dx, dy] of N4) if (base.seen[idx(x + dx, y + dy)]) openN++;
        // dead ends and nooks score extra: that's where you'd hide something
        far.push({ x, y, score: Math.min(pdist[i], 12) + (openN <= 2 ? 3 : 0) + treesNear(x, y) * 0.3 + U.hash(x, y, seed + 31) });
      }
    far.sort((a, b) => b.score - a.score);
    const pickSpread = (n, gap, used) => {
      const res = [];
      for (const c of far) {
        if (res.length >= n) break;
        if (occupied[idx(c.x, c.y)]) continue;
        if (res.concat(used).some((d) => Math.abs(d.x - c.x) + Math.abs(d.y - c.y) < gap)) continue;
        res.push(c);
      }
      return res;
    };
    const landmarks = [];
    for (const [k, c] of pickSpread(3, 9, []).entries()) {
      const kind = kit.marks[k % kit.marks.length];
      const pr = put(kind, c.x, c.y, { solid: kind === 'well' || kind === 'cairn' || kind === 'snowfort', mark: ch.id + '_' + kind });
      if (pr) landmarks.push(pr);
    }
    // a little stepping-stone trail from the nearest road to each landmark (Azgaar's routes, in miniature)
    const trails = [];
    for (const lm of landmarks) {
      let x = lm.x, y = lm.y, guard = 0;
      while (pdist[idx(x, y)] > 1 && guard++ < 40) {
        const nb = N4.map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => inb(a, b) && pdist[idx(a, b)] < pdist[idx(x, y)]);
        if (!nb.length) break;
        [x, y] = nb[0];
        const i = idx(x, y);
        if (!FREE.includes(tile(x, y))) break;
        trails.push({ x, y, seed: U.hash(x, y, seed + 51) });
        solid[i] = 0; occupied[i] = 1;
      }
    }
    const onTrail = new Set(trails.map((t) => idx(t.x, t.y)));
    for (let k = props.length - 1; k >= 0; k--) if (onTrail.has(idx(props[k].x, props[k].y))) props.splice(k, 1);
    for (let k = flat.length - 1; k >= 0; k--) if (onTrail.has(idx(flat[k].x, flat[k].y))) flat.splice(k, 1);
    for (const t of trails) flat.push({ kind: 'stones', x: t.x, y: t.y, seed: t.seed });
    base = reach();

    const cranes = pickSpread(3, 7, landmarks).map((c, k) => ({ id: 'crane_' + ch.id + '_' + k, x: c.x, y: c.y }));
    for (const c of cranes) occupied[idx(c.x, c.y)] = 1;
    // buried treasure: two more quiet spots, only shown once you have the map (garden.js)
    const treasures = pickSpread(2, 8, landmarks.concat(cranes)).map((c, k) => ({ id: 'treasure_' + ch.id + '_' + k, x: c.x, y: c.y }));
    for (const t of treasures) occupied[idx(t.x, t.y)] = 1;

    // critter homes: open lawn by biome, for pastimes.js to spawn critters into
    const habitat = { meadow: [], grove: [], wet: [], sand: [], plain: [] };
    for (const i of cells) {
      const x = i % w, y = (i / w) | 0;
      if (occupied[i] && !props.some((p) => p.x === x && p.y === y && p.kind === 'tallgrass')) continue;
      if (!base.seen[i]) continue;
      const b = biome[i] === 'yard' || biome[i] === 'verge' || biome[i] === 'dry' ? 'plain' : biome[i];
      (habitat[b] || habitat.plain).push([x, y]);
    }

    // signposts: at every path junction, name what lies down each road
    const signposts = makeSignposts(ch, m, put, canPut, idx, pdist);

    const tint = [];
    for (let i = 0; i < w * h; i++) if (biome[i] && biome[i] !== 'plain' && biome[i] !== 'verge') tint.push({ x: i % w, y: (i / w) | 0, b: biome[i], seed: U.hash(i, 3, seed) });
    return { id: ch.id, kit, props, tint, flat, lily, landmarks, cranes, treasures, patch, habitat, signposts, solid, w, h, stats: { cells: cells.length, props: props.length, flat: flat.length } };
  }

  // ---------------------------------------------------- signposts
  const DIRS = { right: [1, 0, 'East'], left: [-1, 0, 'West'], down: [0, 1, 'South'], up: [0, -1, 'North'] };
  function labelFor(o) {
    if (o.type === 'npc') return CK.npcName && CK.npcName(o);
    if (o.type === 'house') return 'the houses';
    if (o.type === 'site') return 'the building site';
    if (o.type === 'shop') return "Nib's Swap Shop";
    if (o.type === 'campfire') return 'a campfire';
    if (o.type === 'stand') return 'a ' + (o.drink || 'drink') + ' stand';
    if (o.type === 'bench') return 'a workbench';
    if (o.type === 'portal') return 'the way home';
    return null;
  }
  function makeSignposts(ch, m, put, canPut, idx) {
    const isP = (x, y) => '=b'.includes(m.get(x, y));
    const out = [];
    for (let y = 1; y < m.h - 1; y++)
      for (let x = 1; x < m.w - 1; x++) {
        if (!isP(x, y)) continue;
        const arms = Object.entries(DIRS).filter(([, [dx, dy]]) => isP(x + dx, y + dy));
        if (arms.length < 3) continue;
        if (out.some((s) => Math.abs(s.jx - x) + Math.abs(s.jy - y) < 6)) continue;
        // walk each arm along the path and note the first thing worth naming
        const lines = [];
        for (const [, [dx, dy, word]] of arms) {
          const seen = new Set([x + ',' + y]);
          let frontier = [[x + dx, y + dy]], found = null, steps = 0;
          while (frontier.length && !found && steps < 60) {
            const nf = [];
            for (const [cx, cy] of frontier) {
              seen.add(cx + ',' + cy);
              const o = ch.objects.find((o) => !o.cond && Math.abs(o.x - cx) <= 2 && Math.abs(o.y - cy) <= 2 && labelFor(o));
              if (o) { found = labelFor(o); break; }
              if (cx <= 1 || cy <= 1 || cx >= m.w - 2 || cy >= m.h - 2) { found = 'the edge of ' + ch.name; break; }
              for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = cx + ax + ',' + (cy + ay); if (!seen.has(k) && isP(cx + ax, cy + ay)) nf.push([cx + ax, cy + ay]); }
            }
            frontier = nf; steps++;
          }
          if (found) lines.push(word + ': ' + found);
        }
        if (lines.length < 2) continue;
        // stand the post just off the junction, on a corner
        const spot = [[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([a, b]) => [x + a, y + b]).find(([a, b]) => canPut(a, b, false));
        if (!spot) continue;
        const pr = put('signpost', spot[0], spot[1], { solid: true, text: lines.join('  ·  '), arms: arms.map(([d]) => d) });
        if (pr) { pr.jx = x; pr.jy = y; out.push(pr); }
      }
    return out;
  }

  // ================================================================ RENDERER
  // Flat details are painted once into the ground canvas; standing props are y-sorted with everyone.
  CK.World.paintFlat = function (ow, g) {
    const wd = ow.world; if (!wd) return;
    const kit = wd.kit, S = ow.season;
    // biome tint first: soft darker grass under groves, lighter in meadows, cooler by the water
    const TINT = { grove: D.shade(S.ground, -0.1), meadow: D.shade(S.ground, 0.1), wet: kit.snow ? D.shade('#dbe9f2', 0) : D.shade(S.ground2, -0.06), yard: D.shade(S.ground, 0.05), sand: null, dry: D.shade(S.path, 0.25) };
    // each biome is painted at full strength on its own layer, then laid down at half, so overlapping
    // blobs merge into one soft patch instead of stacking into rings
    const lay = document.createElement('canvas'); lay.width = g.canvas.width; lay.height = g.canvas.height;
    const lg = lay.getContext('2d');
    for (const b of Object.keys(TINT)) {
      if (!TINT[b]) continue;
      lg.clearRect(0, 0, lay.width, lay.height);
      const solidCol = TINT[b], soft = solidCol.replace('rgb(', 'rgba(').replace(')', ',0)');
      for (const t of wd.tint) if (t.b === b) {
        const cx = t.x * TS + 24 + (t.seed - 0.5) * 10, cy = t.y * TS + 26;
        const gr = lg.createRadialGradient(cx, cy, 8, cx, cy, 44);
        gr.addColorStop(0, solidCol); gr.addColorStop(0.55, solidCol); gr.addColorStop(1, soft);
        lg.fillStyle = gr; lg.fillRect(cx - 44, cy - 44, 88, 88);
      }
      g.globalAlpha = b === 'dry' ? 0.22 : 0.5;
      g.drawImage(lay, 0, 0);
    }
    g.globalAlpha = 1;
    for (const f of wd.flat) {
      const X = f.x * TS, Y = f.y * TS, h = f.seed;
      if (f.kind === 'flowers') {
        // a little bed: five or six blooms of one colour, with leaves
        const col = kit.flowers[Math.floor(h * kit.flowers.length)];
        for (let k = 0; k < 6; k++) {
          const fx = X + 8 + U.hash(f.x, k, 3) * 32, fy = Y + 10 + U.hash(f.y, k, 4) * 30;
          if (kit.snow) { D.ellipse(g, fx, fy + 2, 4, 2, '#d8e6f3'); D.circle(g, fx, fy, 2.4, col); continue; }
          D.line(g, fx, fy + 6, fx - 2, fy + 1, D.shade(S.ground, -0.3), 1.6);
          for (let p = 0; p < 5; p++) D.circle(g, fx + Math.cos(p * 1.26 + h) * 3, fy + Math.sin(p * 1.26 + h) * 3, 2.5, col);
          D.circle(g, fx, fy, 1.8, '#ffcf3a');
        }
      } else if (f.kind === 'pebbles') {
        for (let k = 0; k < 4; k++) D.egg(g, X + 8 + U.hash(f.x, k, 5) * 32, Y + 14 + U.hash(f.y, k, 6) * 26, 4 + h * 3, 3 + h * 2, kit.snow ? '#c9d3df' : '#b9b2a6', { lw: 1.2 });
      } else if (f.kind === 'plot') {
        // tilled rows with whatever this place grows
        D.rr(g, X + 3, Y + 6, TS - 6, TS - 10, 6); g.fillStyle = kit.snow ? '#d9cbbb' : '#8a5a3a'; g.fill(); stroke(g, 2, 'rgba(60,30,20,.5)');
        for (let r = 0; r < 3; r++) {
          const ry = Y + 14 + r * 11;
          D.line(g, X + 8, ry + 3, X + TS - 8, ry + 3, 'rgba(50,25,15,.35)', 2);
          for (let c = 0; c < 3; c++) {
            const cx = X + 12 + c * 12;
            if (kit.plot === 'pumpkins') D.ball(g, cx, ry, 4, '#f2a93b', { lw: 1.2 });
            else if (kit.plot === 'melons') D.egg(g, cx, ry, 5, 4, '#5aa04a', { lw: 1.2 });
            else if (kit.plot === 'cabbages') D.ball(g, cx, ry, 4, '#9fd18a', { lw: 1.2 });
            else { D.line(g, cx, ry + 2, cx, ry - 3, '#4f9a3a', 2); D.ellipse(g, cx - 2.5, ry - 3, 2.6, 1.4, '#7cc76a', null, 0, -0.5); D.ellipse(g, cx + 2.5, ry - 3, 2.6, 1.4, '#7cc76a', null, 0, 0.5); }
          }
        }
      } else if (f.kind === 'shell') {
        g.save(); g.translate(X + 14 + h * 20, Y + 22 + U.hash(f.x, f.y, 9) * 16); g.rotate(h * 6);
        D.poly(g, [0, -5, 5, 3, -5, 3], h < 0.5 ? '#ffd1dc' : '#fff4e0', C.ink, 1.2);
        for (let k = -1; k <= 1; k++) D.line(g, 0, -4, k * 3.5, 2.5, 'rgba(120,80,80,.5)', 0.8);
        g.restore();
      } else if (f.kind === 'stones') {
        // flat stepping stones
        for (let k = 0; k < 2; k++) D.egg(g, X + 14 + k * 20 + (f.seed - 0.5) * 6, Y + 18 + k * 12, 9, 6, kit.snow ? '#d7e2ee' : D.shade(S.path, -0.08), { lw: 1.6, stroke: 'rgba(60,40,40,.45)' });
      } else if (f.kind === 'footprints') {
        for (let k = 0; k < 4; k++) D.ellipse(g, X + 6 + k * 11, Y + 20 + (k % 2) * 9, 3, 4.5, 'rgba(150,175,205,.55)');
      }
    }
  };

  // lily pads float on the water, so they're drawn after it
  CK.World.drawLily = function (ow, ctx, ox, oy) {
    const wd = ow.world; if (!wd) return;
    for (const l of wd.lily) {
      const X = l.x * TS - ox + 10 + l.seed * 26, Y = l.y * TS - oy + 22 + Math.sin(ow.t * 0.8 + l.seed * 9) * 1.5 + 7;
      if (X < -30 || X > W + 30 || Y < -30 || Y > H + 30) continue;
      ctx.save(); ctx.translate(X, Y); ctx.rotate(l.seed * 6);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 10, 0.35, TAU - 0.05); ctx.closePath();
      ctx.fillStyle = '#5fb35a'; ctx.fill(); stroke(ctx, 1.6, 'rgba(30,60,40,.7)');
      if (l.seed < 0.35) { for (let p = 0; p < 6; p++) D.ellipse(ctx, Math.cos(p) * 3, Math.sin(p) * 3 - 2, 3, 1.6, '#ffd1e8', null, 0, p); D.circle(ctx, 0, -2, 1.6, '#ffd25a'); }
      ctx.restore();
    }
  };

  const sway = (ow, pr, k) => (D.calm() ? 0 : Math.sin(ow.t * 1.6 + pr.seed * 9) * (k || 1));
  const DRAW = {};
  CK.World.drawProp = function (ow, ctx, pr) {
    const x = pr.px - ow.camX, y = pr.py - ow.camY;
    if (x < -70 || x > W + 70 || y < -20 || y > H + 110) return;
    const f = DRAW[pr.kind];
    if (f) f(ctx, x, y, pr, ow);
  };

  DRAW.tallgrass = (ctx, x, y, pr, ow) => {
    const S = ow.season, kit = ow.world.kit;
    // grass leans away when someone walks through it
    const p = ow.player, d = Math.hypot(p.x - pr.px, p.y - pr.py), push = d < 30 && !D.calm() ? (p.x < pr.px ? 1 : -1) * (30 - d) * 0.25 : 0;
    const base = kit.snow ? '#a9c9b8' : D.shade(S.ground, -0.18), lite = kit.snow ? '#e8f2ee' : D.shade(S.ground, 0.15);
    for (let k = 0; k < 7; k++) {
      const bx = x - 15 + k * 5, lean = sway(ow, pr, 2.5) + push + (k - 3) * 1.6, hh = 14 + U.hash(k, 3, pr.x + pr.y) * 9;
      D.line(ctx, bx, y - 4, bx + lean, y - 4 - hh, base, 3);
      D.line(ctx, bx, y - 6, bx + lean * 0.9, y - 3 - hh, lite, 1);
    }
  };
  DRAW.reeds = (ctx, x, y, pr, ow) => {
    for (let k = 0; k < 4; k++) {
      const bx = x - 10 + k * 7, lean = sway(ow, pr, 3) + (k - 1.5) * 2, hh = 24 + k % 2 * 8;
      D.line(ctx, bx, y - 2, bx + lean, y - hh, '#5b8a3a', 2.4);
    }
    D.ellipse(ctx, x - 3 + sway(ow, pr, 3), y - 28, 2.6, 6, '#8a5a3a', C.ink, 1.2);
  };
  DRAW.cattails = (ctx, x, y, pr, ow) => {
    for (let k = 0; k < 3; k++) {
      const bx = x - 9 + k * 9, lean = sway(ow, pr, 2.5) + (k - 1) * 3, hh = 30 + (k % 2) * 8;
      D.line(ctx, bx, y - 2, bx + lean, y - hh, '#4f7a3a', 2.4);
      D.egg(ctx, bx + lean * 0.95, y - hh + 8, 3.2, 7, '#7a4a2a', { lw: 1.4 });
    }
  };
  DRAW.bush = (ctx, x, y, pr, ow) => {
    const kit = ow.world.kit;
    D.shadow(ctx, x, y, 22, 6, 0.28);
    const col = kit.bush;
    for (const [ox, oy, r] of [[-11, -14, 13], [11, -14, 13], [0, -23, 15]]) D.ball(ctx, x + ox, y + oy, r, col, { lw: 2.2 });
    if (kit.snow) { D.ellipse(ctx, x - 2, y - 33, 12, 5, '#ffffff'); D.ellipse(ctx, x + 10, y - 25, 7, 3, '#ffffff'); }
    else if (pr.seed < 0.45) for (let k = 0; k < 4; k++) D.ball(ctx, x - 12 + U.hash(k, 1, pr.x) * 24, y - 30 + U.hash(k, 2, pr.y) * 18, 3, kit.bloom, { lw: 1 });
  };
  DRAW.hedge = (ctx, x, y, pr, ow) => {
    const kit = ow.world.kit, col = D.shade(kit.bush, -0.05);
    const x0 = x - (pr.l ? 25 : 20), x1 = x + (pr.r ? 25 : 20);
    D.shadow(ctx, x, y, 24, 6, 0.26);
    D.rr(ctx, x0, y - 34, x1 - x0, 34, pr.l && pr.r ? 2 : 10);
    ctx.fillStyle = D.vg(ctx, x, y - 22, 26, col, 0.6); ctx.fill();
    // ink only on the outside edges, so neighbours read as one long hedge
    ctx.beginPath(); ctx.moveTo(x0, y - 34); ctx.lineTo(x1, y - 34); ctx.moveTo(x0, y); ctx.lineTo(x1, y);
    if (!pr.l) { ctx.moveTo(x0, y - 34); ctx.lineTo(x0, y); }
    if (!pr.r) { ctx.moveTo(x1, y - 34); ctx.lineTo(x1, y); }
    stroke(ctx, 2.2);
    for (let k = 0; k < 5; k++) D.circle(ctx, x0 + 5 + k * ((x1 - x0 - 10) / 4), y - 33, 4, D.shade(kit.bush, 0.2));
    if (kit.snow) D.rr(ctx, x0 + 1, y - 38, x1 - x0 - 2, 7, 3), (ctx.fillStyle = '#fff'), ctx.fill();
    else if (pr.seed < 0.4) for (let k = 0; k < 3; k++) D.circle(ctx, x0 + 8 + k * 13, y - 20 + (k % 2) * 8, 2.6, kit.bloom);
  };
  DRAW.stump = (ctx, x, y) => {
    D.shadow(ctx, x, y, 16, 5, 0.3);
    D.rr(ctx, x - 13, y - 18, 26, 18, 5); ctx.fillStyle = D.lgx(ctx, x - 13, x + 13, '#a8774c'); ctx.fill(); stroke(ctx, 2);
    D.ellipse(ctx, x, y - 18, 13, 5, '#e6c38f', C.ink, 2);
    D.ellipse(ctx, x, y - 18, 6, 2.4, null, 'rgba(120,80,40,.6)', 1.2);
  };
  DRAW.log = (ctx, x, y) => {
    D.shadow(ctx, x, y, 22, 5, 0.3);
    D.rr(ctx, x - 22, y - 16, 40, 14, 7); ctx.fillStyle = '#9a6a42'; ctx.fill(); stroke(ctx, 2);
    D.ellipse(ctx, x + 18, y - 9, 5, 7, '#e6c38f', C.ink, 2);
    D.circle(ctx, x - 8, y - 17, 3, '#7cc76a');
  };
  DRAW.mushrooms = (ctx, x, y, pr, ow) => {
    const glow = ow.night;
    for (let k = 0; k < 3; k++) {
      const mx = x - 10 + k * 10, my = y - 2 - (k % 2) * 4, r = 5 + (k === 1 ? 2 : 0);
      D.rr(ctx, mx - 2, my - 7, 4, 7, 2); ctx.fillStyle = '#fff4e0'; ctx.fill(); stroke(ctx, 1.2);
      ctx.beginPath(); ctx.arc(mx, my - 7, r, Math.PI, 0); ctx.closePath(); D.fillVol(ctx, mx, my - 9, r, glow ? '#b9a7ff' : '#ef6b6b', 1.4);
      D.circle(ctx, mx - 2, my - 10, 1.2, '#fff');
    }
  };
  DRAW.mailbox = (ctx, x, y, pr) => {
    D.shadow(ctx, x, y, 10, 4, 0.3);
    D.line(ctx, x, y, x, y - 22, '#8a5a3a', 4);
    D.rr(ctx, x - 9, y - 34, 18, 13, 6); ctx.fillStyle = D.lgx(ctx, x - 9, x + 9, pr.roof || '#5aa9e6'); ctx.fill(); stroke(ctx, 1.8);
    D.line(ctx, x + 9, y - 32, x + 9, y - 42, C.ink, 1.6);
    D.poly(ctx, [x + 9, y - 42, x + 16, y - 39, x + 9, y - 36], '#ef6b6b', C.ink, 1.2);
  };
  DRAW.birdhouse = (ctx, x, y) => {
    D.line(ctx, x, y, x, y - 30, '#8a5a3a', 4);
    D.box3(ctx, x - 9, y - 46, 18, 16, 4, { fill: '#ffd25a', lw: 1.6, flute: false });
    D.poly(ctx, [x - 12, y - 45, x, y - 56, x + 12, y - 45], '#ef6b6b', C.ink, 1.6);
    D.circle(ctx, x, y - 39, 3, '#3a2418');
  };
  DRAW.wateringcan = (ctx, x, y) => {
    D.shadow(ctx, x, y, 12, 4, 0.3);
    D.rr(ctx, x - 9, y - 16, 18, 15, 4); ctx.fillStyle = D.lgx(ctx, x - 9, x + 9, '#6fc3ff'); ctx.fill(); stroke(ctx, 1.6);
    D.line(ctx, x + 8, y - 10, x + 17, y - 18, C.ink, 3); D.line(ctx, x + 8, y - 10, x + 17, y - 18, '#6fc3ff', 1.6);
    ctx.beginPath(); ctx.arc(x - 1, y - 18, 6, Math.PI, 0); stroke(ctx, 1.6);
  };
  DRAW.flowerpot = (ctx, x, y, pr, ow) => {
    D.shadow(ctx, x, y, 11, 4, 0.3);
    D.poly(ctx, [x - 9, y - 14, x + 9, y - 14, x + 6, y, x - 6, y], '#d9744a', C.ink, 1.6);
    const col = ow.world.kit.flowers[Math.floor(pr.seed * ow.world.kit.flowers.length)];
    for (let k = 0; k < 3; k++) { const fx = x - 6 + k * 6, fy = y - 22 - (k % 2) * 4; D.line(ctx, fx, y - 14, fx, fy, '#4f9a3a', 1.6); D.circle(ctx, fx, fy, 3.4, col, C.ink, 1); }
  };
  DRAW.wheelbarrow = (ctx, x, y) => {
    D.shadow(ctx, x, y, 18, 4, 0.3);
    D.poly(ctx, [x - 16, y - 18, x + 12, y - 18, x + 8, y - 6, x - 12, y - 6], '#ef6b6b', C.ink, 1.8);
    D.ball(ctx, x + 10, y - 4, 4.5, '#4a4a5a', { lw: 1.4 });
    D.line(ctx, x - 14, y - 12, x - 22, y - 4, '#8a5a3a', 2.4);
    for (let k = 0; k < 3; k++) D.ball(ctx, x - 8 + k * 7, y - 19, 3.6, '#9fd18a', { lw: 1 });
  };
  DRAW.beehive = (ctx, x, y, pr, ow) => {
    D.line(ctx, x, y, x, y - 14, '#8a5a3a', 4);
    for (let k = 0; k < 3; k++) D.egg(ctx, x, y - 20 - k * 8, 12 - k * 2.5, 5, '#ffcf5a', { lw: 1.6 });
    D.circle(ctx, x, y - 20, 2.5, '#3a2418');
    if (!D.calm()) for (let k = 0; k < 2; k++) { const a = ow.t * 2 + k * 3; D.circle(ctx, x + Math.cos(a) * 16, y - 34 + Math.sin(a * 1.7) * 6, 2, '#ffd25a', C.ink, 1); }
  };
  DRAW.surfboard = (ctx, x, y) => {
    D.shadow(ctx, x, y, 8, 3, 0.3);
    D.egg(ctx, x, y - 22, 7, 22, '#ff8fb1', { lw: 1.8 });
    D.line(ctx, x, y - 42, x, y - 2, '#ffffff', 2);
  };
  DRAW.beachball = (ctx, x, y) => {
    D.shadow(ctx, x, y, 10, 3, 0.3);
    D.ball(ctx, x, y - 9, 9, '#ffffff', { lw: 1.6 });
    ctx.save(); ctx.beginPath(); ctx.arc(x, y - 9, 9, 0, TAU); ctx.clip();
    D.poly(ctx, [x, y - 18, x - 10, y - 4, x - 4, y - 2], '#ef6b6b'); D.poly(ctx, [x, y - 18, x + 10, y - 4, x + 4, y - 2], '#5aa9e6');
    ctx.restore(); D.circle(ctx, x, y - 9, 9, null, C.ink, 1.6);
  };
  DRAW.sandcastle = (ctx, x, y) => {
    D.shadow(ctx, x, y, 18, 4, 0.25);
    D.box3(ctx, x - 14, y - 16, 28, 16, 4, { fill: '#f0d48f', lw: 1.6, flute: false });
    for (let k = 0; k < 3; k++) D.box3(ctx, x - 14 + k * 10, y - 24, 7, 8, 2, { fill: '#f0d48f', lw: 1.4, flute: false });
    D.line(ctx, x, y - 24, x, y - 34, C.ink, 1.2); D.poly(ctx, [x, y - 34, x + 7, y - 31, x, y - 28], '#ef6b6b', C.ink, 1);
  };
  DRAW.buoy = (ctx, x, y, pr, ow) => {
    const b = sway(ow, pr, 2);
    D.shadow(ctx, x, y, 10, 3, 0.3);
    D.egg(ctx, x, y - 10 + b, 9, 10, '#ef6b6b', { lw: 1.6 });
    D.rr(ctx, x - 9, y - 12 + b, 18, 4, 2); ctx.fillStyle = '#fff'; ctx.fill();
  };
  DRAW.driftwood = (ctx, x, y) => {
    D.shadow(ctx, x, y, 18, 3, 0.25);
    ctx.beginPath(); ctx.moveTo(x - 18, y - 4); ctx.quadraticCurveTo(x, y - 12, x + 18, y - 6); stroke(ctx, 7, C.ink); stroke(ctx, 4.5, '#cdb79a');
  };
  DRAW.haybale = (ctx, x, y) => {
    D.shadow(ctx, x, y, 20, 5, 0.3);
    D.box3(ctx, x - 18, y - 22, 32, 22, 6, { fill: '#f0cf6a', lw: 1.8, flute: false });
    for (let k = 0; k < 4; k++) D.line(ctx, x - 14 + k * 8, y - 18, x - 13 + k * 8, y - 4, 'rgba(160,110,30,.5)', 1.2);
    D.line(ctx, x - 18, y - 11, x + 14, y - 11, '#8a5a3a', 2);
  };
  DRAW.pumpkins = (ctx, x, y, pr, ow) => {
    D.shadow(ctx, x, y, 16, 4, 0.3);
    for (const [ox, oy, r] of [[-8, -8, 8], [8, -7, 7], [0, -16, 6]]) { D.egg(ctx, x + ox, y + oy, r * 1.15, r, '#f2a93b', { lw: 1.6 }); D.line(ctx, x + ox, y + oy - r, x + ox + 1, y + oy - r - 4, '#4f7a3a', 2); }
    if (ow.night) { D.poly(ctx, [x - 11, y - 9, x - 8, y - 12, x - 5, y - 9], '#ffe38a'); D.poly(ctx, [x - 11, y - 5, x - 5, y - 5, x - 8, y - 3], '#ffe38a'); }
  };
  DRAW.applecrate = (ctx, x, y) => {
    D.shadow(ctx, x, y, 14, 4, 0.3);
    for (let k = 0; k < 4; k++) D.ball(ctx, x - 9 + k * 6, y - 17 - (k % 2) * 2, 4, '#e8403a', { lw: 1.1 });
    D.box3(ctx, x - 13, y - 15, 24, 15, 4, { fill: '#c99561', lw: 1.6, flute: false });
  };
  DRAW.scarecrow = (ctx, x, y, pr, ow) => {
    const b = sway(ow, pr, 0.04);
    ctx.save(); ctx.translate(x, y); ctx.rotate(b);
    D.line(ctx, 0, 0, 0, -50, '#8a5a3a', 4); D.line(ctx, -18, -34, 18, -34, '#8a5a3a', 4);
    D.rr(ctx, -10, -40, 20, 22, 4); ctx.fillStyle = '#6c8ed8'; ctx.fill(); stroke(ctx, 1.6);
    D.ball(ctx, 0, -50, 9, '#f0cf6a', { lw: 1.6 });
    D.eyes(ctx, 0, -51, 6, 1.6, { happy: true });
    D.poly(ctx, [-13, -55, 13, -55, 6, -64, -6, -64], '#a8774c', C.ink, 1.6);
    ctx.restore();
  };
  DRAW.sled = (ctx, x, y) => {
    D.shadow(ctx, x, y, 18, 4, 0.25);
    D.rr(ctx, x - 16, y - 12, 30, 7, 3); ctx.fillStyle = '#ef6b6b'; ctx.fill(); stroke(ctx, 1.6);
    ctx.beginPath(); ctx.moveTo(x - 18, y - 2); ctx.lineTo(x + 14, y - 2); ctx.quadraticCurveTo(x + 20, y - 2, x + 18, y - 10); stroke(ctx, 2.2, '#8a5a3a');
  };
  DRAW.woodpile = (ctx, x, y) => {
    D.shadow(ctx, x, y, 18, 4, 0.3);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 3 - r; k++) { const lx = x - 12 + k * 12 + r * 6, ly = y - 6 - r * 9; D.ellipse(ctx, lx, ly, 6, 5, '#e6c38f', C.ink, 1.5); D.circle(ctx, lx, ly, 2, null, 'rgba(120,80,40,.6)', 1); }
  };
  DRAW.icelantern = (ctx, x, y) => {
    D.shadow(ctx, x, y, 9, 3, 0.25);
    D.rr(ctx, x - 7, y - 18, 14, 18, 3); ctx.fillStyle = 'rgba(210,235,255,.85)'; ctx.fill(); stroke(ctx, 1.6, '#7aa6c8');
    D.circle(ctx, x, y - 9, 3.5, '#ffd25a');
  };
  DRAW.snowman = (ctx, x, y) => {
    D.shadow(ctx, x, y, 14, 4, 0.25);
    D.ball(ctx, x, y - 10, 11, '#ffffff', { lw: 1.8 }); D.ball(ctx, x, y - 27, 8, '#ffffff', { lw: 1.8 });
    D.eyes(ctx, x, y - 28, 5, 1.6, { happy: true });
    D.poly(ctx, [x, y - 26, x + 8, y - 25, x, y - 24], '#ff9c3a');
    D.rr(ctx, x - 7, y - 21, 14, 3, 1.5); ctx.fillStyle = '#ef6b6b'; ctx.fill();
  };
  DRAW.lobstertrap = (ctx, x, y) => {
    D.shadow(ctx, x, y, 14, 4, 0.3);
    D.box3(ctx, x - 13, y - 16, 22, 16, 5, { fill: '#c9a46a', lw: 1.6, flute: false });
    for (let k = 1; k < 4; k++) D.line(ctx, x - 13 + k * 5.5, y - 15, x - 13 + k * 5.5, y - 1, 'rgba(60,40,20,.6)', 1);
    D.ball(ctx, x + 12, y - 20, 4, '#ef6b6b', { lw: 1.2 });
  };
  DRAW.ropecoil = (ctx, x, y) => {
    for (let k = 0; k < 3; k++) D.ellipse(ctx, x, y - 4 - k * 3, 11 - k * 2, 4.5 - k, '#e6c38f', C.ink, 1.4);
  };
  DRAW.crates = (ctx, x, y) => {
    D.shadow(ctx, x, y, 18, 4, 0.3);
    D.box3(ctx, x - 18, y - 16, 18, 16, 5, { fill: '#c99561', lw: 1.6, flute: false });
    D.box3(ctx, x + 1, y - 14, 15, 14, 4, { fill: '#d9a66b', lw: 1.6, flute: false });
    D.box3(ctx, x - 12, y - 30, 15, 13, 4, { fill: '#d9a66b', lw: 1.6, flute: false });
  };
  DRAW.barrel = (ctx, x, y) => {
    D.shadow(ctx, x, y, 12, 4, 0.3);
    D.rr(ctx, x - 10, y - 24, 20, 24, 7); ctx.fillStyle = D.lgx(ctx, x - 10, x + 10, '#a8774c'); ctx.fill(); stroke(ctx, 1.6);
    D.line(ctx, x - 10, y - 17, x + 10, y - 17, '#5a5a6a', 2); D.line(ctx, x - 10, y - 7, x + 10, y - 7, '#5a5a6a', 2);
  };
  DRAW.bunting = (ctx, x, y, pr) => {
    D.line(ctx, x - 18, y, x - 18, y - 46, '#8a5a3a', 3); D.line(ctx, x + 18, y, x + 18, y - 46, '#8a5a3a', 3);
    ctx.beginPath(); ctx.moveTo(x - 18, y - 44); ctx.quadraticCurveTo(x, y - 34, x + 18, y - 44); stroke(ctx, 1.2);
    const cols = ['#ef6b6b', '#ffd25a', '#5aa9e6', '#7cc76a'];
    for (let k = 0; k < 4; k++) { const fx = x - 13 + k * 9, fy = y - 41 + (k === 1 || k === 2 ? 3 : 1); D.poly(ctx, [fx - 4, fy, fx + 4, fy, fx, fy + 8], cols[(k + Math.floor(pr.seed * 4)) % 4], C.ink, 1); }
  };
  DRAW.balloons = (ctx, x, y, pr, ow) => {
    const b = sway(ow, pr, 2);
    D.line(ctx, x, y, x, y - 12, '#8a5a3a', 3);
    for (const [ox, oy, col] of [[-7, -40, '#ef6b6b'], [6, -44, '#5aa9e6'], [0, -52, '#ffd25a']]) { D.line(ctx, x, y - 12, x + ox + b, y + oy + 9, C.ink, 1); D.egg(ctx, x + ox + b, y + oy, 6.5, 8, col, { lw: 1.4 }); }
  };
  DRAW.paperlantern = (ctx, x, y, pr, ow) => {
    D.line(ctx, x, y, x, y - 40, '#8a5a3a', 3);
    D.line(ctx, x, y - 40, x + 10, y - 40, '#8a5a3a', 2.4);
    const b = sway(ow, pr, 1.5);
    D.egg(ctx, x + 10 + b, y - 28, 7, 9, ow.night ? '#ffe38a' : '#ff9f6a', { lw: 1.4 });
    D.line(ctx, x + 4 + b, y - 28, x + 16 + b, y - 28, 'rgba(120,60,20,.5)', 1);
  };
  DRAW.spool = (ctx, x, y, pr) => {
    D.shadow(ctx, x, y, 12, 4, 0.3);
    D.ellipse(ctx, x, y - 3, 12, 4, '#c99561', C.ink, 1.6);
    D.rr(ctx, x - 9, y - 22, 18, 19, 3); ctx.fillStyle = D.lgx(ctx, x - 9, x + 9, ['#ef6b6b', '#5aa9e6', '#7cc76a'][Math.floor(pr.seed * 3)]); ctx.fill(); stroke(ctx, 1.6);
    D.ellipse(ctx, x, y - 22, 12, 4, '#d9a66b', C.ink, 1.6);
  };
  DRAW.button = (ctx, x, y, pr) => {
    const col = ['#ff8fb1', '#5aa9e6', '#ffd25a'][Math.floor(pr.seed * 3)];
    D.egg(ctx, x, y - 4, 11, 5, col, { lw: 1.6 });
    for (const [ox, oy] of [[-3, -1], [3, -1], [-3, 1.5], [3, 1.5]]) D.circle(ctx, x + ox, y - 4 + oy, 1.2, C.ink);
  };
  DRAW.pins = (ctx, x, y) => {
    for (let k = 0; k < 3; k++) { const px = x - 8 + k * 8; D.line(ctx, px, y, px + 2, y - 16, '#b9c2cf', 1.6); D.ball(ctx, px + 2, y - 17, 3, ['#ef6b6b', '#ffd25a', '#5aa9e6'][k], { lw: 1 }); }
  };
  // landmarks
  DRAW.picnic = (ctx, x, y, pr) => {
    ctx.save(); ctx.translate(x, y - 10); ctx.rotate(-0.08);
    D.rr(ctx, -24, -14, 48, 28, 4); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.save(); D.rr(ctx, -24, -14, 48, 28, 4); ctx.clip();
    ctx.fillStyle = 'rgba(239,107,107,.75)';
    for (let k = -24; k < 24; k += 8) ctx.fillRect(k, -14, 4, 28);
    for (let k = -14; k < 14; k += 8) ctx.fillRect(-24, k, 48, 4);
    ctx.restore(); D.rr(ctx, -24, -14, 48, 28, 4); stroke(ctx, 1.6);
    ctx.restore();
    D.box3(ctx, x - 6, y - 26, 14, 10, 4, { fill: '#c99561', lw: 1.4, flute: false });
    ctx.beginPath(); ctx.arc(x + 1, y - 26, 6, Math.PI, 0); stroke(ctx, 1.4);
  };
  DRAW.well = (ctx, x, y) => {
    D.shadow(ctx, x, y, 22, 6, 0.3);
    D.rr(ctx, x - 18, y - 22, 36, 22, 8); ctx.fillStyle = D.lgx(ctx, x - 18, x + 18, '#b9b2a6'); ctx.fill(); stroke(ctx, 2);
    for (let k = 0; k < 3; k++) D.line(ctx, x - 16, y - 16 + k * 6, x + 16, y - 16 + k * 6, 'rgba(80,70,60,.35)', 1.2);
    D.ellipse(ctx, x, y - 22, 18, 5, '#3a6a8a', C.ink, 2);
    D.line(ctx, x - 16, y - 22, x - 16, y - 50, '#8a5a3a', 3); D.line(ctx, x + 16, y - 22, x + 16, y - 50, '#8a5a3a', 3);
    D.poly(ctx, [x - 22, y - 48, x, y - 62, x + 22, y - 48], '#ef6b6b', C.ink, 2);
    D.line(ctx, x, y - 50, x, y - 34, C.ink, 1.2); D.rr(ctx, x - 4, y - 36, 8, 7, 2); ctx.fillStyle = '#a8774c'; ctx.fill(); stroke(ctx, 1.2);
  };
  DRAW.cairn = (ctx, x, y, pr, ow) => {
    D.shadow(ctx, x, y, 16, 4, 0.3);
    const snow = ow.world.kit.snow;
    [[0, -6, 14, 7], [1, -17, 11, 6], [-1, -27, 8, 5], [0, -35, 5, 4]].forEach(([ox, oy, rx, ry]) => { D.egg(ctx, x + ox, y + oy, rx, ry, '#a9a3b8', { lw: 1.6 }); if (snow) D.ellipse(ctx, x + ox, y + oy - ry * 0.6, rx * 0.7, ry * 0.35, '#fff'); });
    // a tiny cardboard flag: a Builder was here
    D.line(ctx, x + 2, y - 39, x + 2, y - 54, C.ink, 1.4); D.poly(ctx, [x + 2, y - 54, x + 13, y - 50, x + 2, y - 46], '#d9a66b', C.ink, 1.2);
  };
  DRAW.lookout = (ctx, x, y) => {
    // a bench with a coin-op telescope made from a paper towel tube
    D.shadow(ctx, x, y, 24, 5, 0.3);
    D.rr(ctx, x - 22, y - 16, 30, 6, 2); ctx.fillStyle = '#c99561'; ctx.fill(); stroke(ctx, 1.6);
    D.rr(ctx, x - 22, y - 26, 30, 6, 2); ctx.fillStyle = '#d9a66b'; ctx.fill(); stroke(ctx, 1.6);
    D.line(ctx, x - 19, y - 10, x - 19, y, C.ink, 2.2); D.line(ctx, x + 5, y - 10, x + 5, y, C.ink, 2.2);
    D.line(ctx, x + 18, y, x + 18, y - 20, '#5a6a7a', 3);
    ctx.save(); ctx.translate(x + 18, y - 24); ctx.rotate(-0.4); D.rr(ctx, -4, -6, 18, 10, 4); ctx.fillStyle = D.lgx(ctx, -4, 14, '#c9d3e0'); ctx.fill(); stroke(ctx, 1.6); ctx.restore();
  };
  DRAW.snowfort = (ctx, x, y) => {
    D.shadow(ctx, x, y, 24, 5, 0.25);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 4 - r; k++) D.rr(ctx, x - 22 + k * 11 + r * 5, y - 10 - r * 10, 11, 10, 3), (ctx.fillStyle = '#f4f9ff'), ctx.fill(), stroke(ctx, 1.4, '#9fbbd6');
    D.line(ctx, x + 2, y - 20, x + 2, y - 38, C.ink, 1.4); D.poly(ctx, [x + 2, y - 38, x + 13, y - 34, x + 2, y - 30], '#5aa9e6', C.ink, 1.2);
  };
  DRAW.signpost = (ctx, x, y, pr) => {
    D.shadow(ctx, x, y, 8, 3, 0.3);
    D.line(ctx, x, y, x, y - 46, C.ink, 6); D.line(ctx, x, y, x, y - 46, '#a8774c', 3.6);
    const boards = pr.arms.slice(0, 3);
    boards.forEach((d, k) => {
      const yy = y - 42 + k * 10, right = d === 'right' || (d === 'down' && k % 2 === 0), tip = right ? 1 : -1;
      const x0 = right ? x - 4 : x - 24, x1 = right ? x + 24 : x + 4;
      D.poly(ctx, [x0, yy - 4, x1, yy - 4, x1 + 5 * tip * (right ? 1 : 0), yy, x1, yy + 4, x0, yy + 4, x0 - 5 * (right ? 0 : 1), yy], k % 2 ? '#e6c38f' : '#d9a66b', C.ink, 1.4);
    });
  };
  // garden pieces for your patch (garden.js); a few of these only turn up in buried treasure
  DRAW.birdbath = (ctx, x, y, pr, ow) => {
    D.shadow(ctx, x, y, 14, 4, 0.3);
    D.poly(ctx, [x - 5, y, x + 5, y, x + 3, y - 18, x - 3, y - 18], '#c9c3b8', C.ink, 1.6);
    D.ellipse(ctx, x, y - 20, 16, 5, '#d9d3c8', C.ink, 1.8);
    D.ellipse(ctx, x, y - 21, 12, 3, '#8fd0ff');
    if (!D.calm()) D.circle(ctx, x + Math.sin(ow.t * 1.3) * 6, y - 21, 1.4, 'rgba(255,255,255,.9)');
  };
  DRAW.pinwheel = (ctx, x, y, pr, ow) => {
    D.line(ctx, x, y, x, y - 28, '#8a5a3a', 2.6);
    const a = D.calm() ? 0.4 : ow.t * 3 + pr.seed * 6;
    ctx.save(); ctx.translate(x, y - 30); ctx.rotate(a);
    ['#ef6b6b', '#ffd25a', '#5aa9e6', '#7cc76a'].forEach((c, k) => { ctx.save(); ctx.rotate(k * Math.PI / 2); D.poly(ctx, [0, 0, 10, -2, 3, -9], c, C.ink, 1.2); ctx.restore(); });
    ctx.restore(); D.circle(ctx, x, y - 30, 2, '#fff', C.ink, 1);
  };
  DRAW.bench = (ctx, x, y) => {
    D.shadow(ctx, x, y, 22, 5, 0.3);
    D.rr(ctx, x - 20, y - 26, 40, 7, 2); ctx.fillStyle = '#d9a66b'; ctx.fill(); stroke(ctx, 1.6);
    D.rr(ctx, x - 20, y - 15, 40, 6, 2); ctx.fillStyle = '#c99561'; ctx.fill(); stroke(ctx, 1.6);
    for (const k of [-16, 16]) D.line(ctx, x + k, y - 9, x + k, y, C.ink, 2.4);
  };
  DRAW.gnome = (ctx, x, y) => {
    D.shadow(ctx, x, y, 10, 3, 0.3);
    D.egg(ctx, x, y - 8, 8, 9, '#5aa9e6', { lw: 1.6 });
    D.poly(ctx, [x - 6, y - 12, x + 6, y - 12, x + 4, y - 4, x, y - 1, x - 4, y - 4], '#fffaf0', C.ink, 1.2);
    D.ball(ctx, x, y - 17, 5, '#ffd8b8', { lw: 1.4 });
    D.poly(ctx, [x - 7, y - 19, x + 7, y - 19, x + 1, y - 36], '#ef6b6b', C.ink, 1.6);
    D.circle(ctx, x - 2, y - 17, 1, C.ink); D.circle(ctx, x + 2, y - 17, 1, C.ink);
  };
  DRAW.sundial = (ctx, x, y) => {
    D.shadow(ctx, x, y, 14, 4, 0.3);
    D.rr(ctx, x - 6, y - 16, 12, 16, 3); ctx.fillStyle = '#c9c3b8'; ctx.fill(); stroke(ctx, 1.6);
    D.ellipse(ctx, x, y - 17, 15, 5, '#e6c38f', C.ink, 1.6);
    D.poly(ctx, [x - 1, y - 17, x + 8, y - 17, x - 1, y - 27], '#b98d62', C.ink, 1.2);
    for (let k = 0; k < 6; k++) { const a = Math.PI + k * 0.6; D.circle(ctx, x + Math.cos(a) * 11, y - 17 + Math.sin(a) * 3.5, 0.9, C.ink); }
  };
  DRAW.toadhouse = (ctx, x, y, pr, ow) => {
    D.shadow(ctx, x, y, 14, 4, 0.3);
    D.rr(ctx, x - 8, y - 18, 16, 18, 4); ctx.fillStyle = '#fff4e0'; ctx.fill(); stroke(ctx, 1.6);
    D.rr(ctx, x - 3, y - 9, 6, 9, 3); ctx.fillStyle = '#8a5a3a'; ctx.fill(); stroke(ctx, 1.2);
    D.circle(ctx, x + 4, y - 14, 2, ow.night ? '#ffe38a' : '#8fd0ff', C.ink, 1);
    ctx.beginPath(); ctx.arc(x, y - 18, 15, Math.PI, 0); ctx.closePath(); D.fillVol(ctx, x - 3, y - 24, 15, '#ef6b6b', 1.8);
    for (const [ox, oy] of [[-8, -23], [2, -29], [8, -22]]) D.circle(ctx, x + ox, y + oy, 2.2, '#fff');
  };
  DRAW.windchime = (ctx, x, y, pr, ow) => {
    D.line(ctx, x - 10, y, x - 10, y - 44, '#8a5a3a', 3); D.line(ctx, x - 10, y - 44, x + 8, y - 44, '#8a5a3a', 2.4);
    for (let k = 0; k < 4; k++) {
      const sw = D.calm() ? 0 : Math.sin(ow.t * 2 + k) * 1.5, cx = x - 4 + k * 4 + sw;
      D.line(ctx, x - 4 + k * 4, y - 44, cx, y - 34 + (k % 2) * 4, C.ink, 0.8);
      D.rr(ctx, cx - 1.4, y - 34 + (k % 2) * 4, 2.8, 10, 1.2); ctx.fillStyle = ['#ffd25a', '#c9d3e0', '#8fd0ff', '#ffb7d5'][k]; ctx.fill(); stroke(ctx, 1);
    }
  };
  DRAW.telescope = (ctx, x, y) => {
    D.shadow(ctx, x, y, 14, 4, 0.3);
    for (const k of [-8, 0, 8]) D.line(ctx, x, y - 18, x + k, y, '#8a5a3a', 2.2);
    ctx.save(); ctx.translate(x, y - 20); ctx.rotate(-0.5);
    D.rr(ctx, -12, -4, 26, 8, 3); ctx.fillStyle = D.lgx(ctx, -12, 14, '#5a6a9a'); ctx.fill(); stroke(ctx, 1.6);
    D.rr(ctx, 12, -5, 5, 10, 2); ctx.fillStyle = '#ffd25a'; ctx.fill(); stroke(ctx, 1.2);
    ctx.restore();
  };
  DRAW.patchsign = (ctx, x, y) => {
    D.shadow(ctx, x, y, 8, 3, 0.3);
    D.line(ctx, x, y, x, y - 26, '#8a5a3a', 3.4);
    D.rr(ctx, x - 17, y - 38, 34, 15, 3); ctx.fillStyle = '#e6c38f'; ctx.fill(); stroke(ctx, 1.6);
    D.text(ctx, 'PATCH', x, y - 27, { size: 9, weight: 900, align: 'center', color: '#5a3a24' });
  };
  CK.World.DRAW = DRAW;
})();
