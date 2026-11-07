// Cardboard Kingdom - Pastimes (v2.22): things to do between story beats, Animal Crossing style.
//  * Critter spotting: little critters live in the meadows, groves, sand and shallows the world
//    generator made. Walk up gently (running spooks them) and press Z to sketch one into the Field
//    Guide. Some only come out at night. 20 to find, each with a true nature fact.
//  * Paper cranes: Grandma Rosie folded one for every wish she made as a girl, and the storms
//    scattered them. Three are tucked into the quiet corners of every Kingdom place.
//  * Landmarks and signposts: picnic spots, wells, lookouts and cairns, with stepping-stone trails.
//    A lookout shows you the whole place from above, with any cranes you haven't found yet.
//  * Odd Jobs: three small jobs at a time. New ones get pinned up when you rest at a campfire.
//  * The Builder's Board: challenges with bronze, silver and gold, paid in bottle caps. Gold on some
//    of them earns a skin you can't buy.
//  * Bottle caps: the Kingdom's pocket money, earned only by playing. Spend them in Tansy's Catalogue
//    (closet.js). No real money, no timers, no streaks, nothing that goes away if you take a break.
//  * A gentle break reminder (Settings), shown only at a natural stopping point.
// All of it lives in the Kingdom Book (Pause -> Kingdom Book).
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input;
  const W = CK.W, H = CK.H, TS = 48;
  const C = D.C, TAU = Math.PI * 2;
  const OW = CK.Overworld.prototype;
  const stroke = (ctx, lw, col) => { ctx.strokeStyle = col || C.ink; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };
  const MAP_S = 1.18;

  // ================================================================ STATE
  const pt = () => {
    const G = CK.G;
    if (!G.pt) G.pt = {};
    const p = G.pt;
    p.tally = p.tally || {}; p.seen = p.seen || {}; p.cranes = p.cranes || {}; p.marks = p.marks || {};
    p.signs = p.signs || {}; p.trees = p.trees || {}; p.visited = p.visited || {}; p.claimed = p.claimed || {};
    p.jobs = p.jobs || []; p.jobN = p.jobN || 0;
    if (G.caps == null) G.caps = 0;
    return p;
  };
  const tally = (k, n) => { const p = pt(); p.tally[k] = (p.tally[k] || 0) + (n == null ? 1 : n); };
  const caps = (n, why) => {
    if (!n) return;
    pt(); CK.G.caps += n;
    CK.Audio.sfx('coin');
    if (why !== false) CK.toast(`+${n} bottle cap${n === 1 ? '' : 's'}${why ? ' · ' + why : ''}`, '#ffe9e0');
  };
  CK.Pastimes = { pt, tally, caps };
  const flagCount = (prefix) => Object.keys(CK.G.flags).filter((k) => k.startsWith(prefix) && CK.G.flags[k]).length;

  // ================================================================ CRITTERS
  // places: which Kingdom places they live in. home: biome from worldgen. time: day, night or any.
  const CRITTERS = {
    ladybug: { name: 'Ladybug', home: 'meadow', time: 'day', places: ['spring', 'longbridge', 'thimble'], fact: 'A ladybug can eat 50 aphids a day. Gardeners love them.' },
    snail: { name: 'Garden Snail', home: 'grove', time: 'any', places: ['spring', 'fall', 'marsh', 'lanternmere'], fact: 'Snails glide on a ribbon of slime, which works like a tiny moving road.' },
    frog: { name: 'Pond Frog', home: 'wet', time: 'any', places: ['spring', 'marsh', 'ferryyard'], fact: 'Frogs drink through their skin, so they need clean water to live in.' },
    bee: { name: 'Bumblebee', home: 'meadow', time: 'day', places: ['spring', 'summer', 'longbridge'], fact: 'Bumblebees buzz to shake pollen loose. It\'s called buzz pollination.' },
    firefly: { name: 'Firefly', home: 'meadow', time: 'night', places: ['spring', 'summer', 'lanternmere', 'marsh'], fact: 'Fireflies make cold light: almost none of their energy turns into heat.' },
    crab: { name: 'Sand Crab', home: 'sand', time: 'any', places: ['summer', 'gullpoint', 'ferryyard', 'thimble'], fact: 'Crabs walk sideways because their knees bend that way.' },
    starfish: { name: 'Starfish', home: 'sand', time: 'day', places: ['summer'], fact: 'A starfish has no brain and no blood, but it can regrow an arm.' },
    butterfly: { name: 'Blue Butterfly', home: 'meadow', time: 'day', places: ['spring', 'summer', 'longbridge', 'thimble'], fact: 'Butterflies taste with their feet.' },
    squirrel: { name: 'Red Squirrel', home: 'grove', time: 'day', places: ['fall', 'lanternmere', 'longbridge'], fact: 'Squirrels forget some of the nuts they bury, and those grow into trees.' },
    hoglet: { name: 'Hedgehoglet', home: 'grove', time: 'night', places: ['fall', 'spring', 'lanternmere'], fact: 'A baby hedgehog is called a hoglet. Its spines are soft for the first few hours.' },
    owlet: { name: 'Owlet', home: 'grove', time: 'night', places: ['fall', 'lanternmere', 'winter'], fact: 'Owls can\'t move their eyes, so they turn their whole head instead.' },
    hare: { name: 'Snow Hare', home: 'plain', time: 'any', places: ['winter', 'gullpoint'], fact: 'Snow hares turn white in winter and brown again in spring.' },
    penguin: { name: 'Penguin Chick', home: 'plain', time: 'day', places: ['gullpoint', 'winter'], fact: 'Penguin chicks huddle together in a crowd called a creche to stay warm.' },
    seal: { name: 'Seal Pup', home: 'wet', time: 'any', places: ['gullpoint'], fact: 'Seal pups can swim almost as soon as they are born.' },
    dragonfly: { name: 'Dragonfly', home: 'wet', time: 'day', places: ['marsh', 'ferryyard', 'summer'], fact: 'Dragonflies can fly backwards, and they catch almost every bug they chase.' },
    newt: { name: 'Spotted Newt', home: 'wet', time: 'night', places: ['marsh', 'lanternmere'], fact: 'Newts can regrow lost legs, tails, and even parts of their eyes.' },
    moth: { name: 'Lantern Moth', home: 'plain', time: 'night', places: ['lanternmere', 'longbridge', 'fall'], fact: 'Moths steer by the moon. Bright lamps confuse them, so light the path, not the sky.' },
    beetle: { name: 'Bottle-cap Beetle', home: 'plain', time: 'any', places: ['thimble', 'ferryyard'], fact: 'Rivet\'s cousins. Real beetles make up about one in four of all animal species.' },
    duckling: { name: 'Duckling', home: 'wet', time: 'day', places: ['spring', 'ferryyard', 'marsh'], fact: 'Ducklings follow the first thing they see after hatching. It\'s called imprinting.' },
    mouse: { name: 'Field Mouse', home: 'plain', time: 'any', places: ['thimble', 'winter', 'fall', 'ferryyard'], fact: 'A field mouse can squeeze through a gap the size of a pencil.' },
  };
  const CRITTER_IDS = Object.keys(CRITTERS);
  CK.Pastimes.CRITTERS = CRITTERS;

  // little drawings, about 12 to 20 pixels tall. (x, y) is where they stand.
  const CD = {};
  const eyes = (ctx, x, y, gap, r, happy) => D.eyes(ctx, x, y, gap, r, { happy });
  CD.ladybug = (ctx, x, y) => { D.ellipse(ctx, x, y - 5, 8, 6.5, '#e8403a', C.ink, 1.6); D.line(ctx, x, y - 11, x, y + 1, C.ink, 1.2); for (const [a, b] of [[-4, -7], [4, -6], [-3, -2], [4, -2]]) D.circle(ctx, x + a, y + b, 1.5, C.ink); D.ball(ctx, x + 8, y - 6, 4, '#2a2a3a', { lw: 1.2 }); D.circle(ctx, x + 9, y - 7, 1, '#fff'); };
  CD.snail = (ctx, x, y, t) => { const s = Math.sin(t * 2) * 0.6; D.egg(ctx, x + 1, y - 2, 11, 3.2, '#d8c79a', { lw: 1.4 }); D.ball(ctx, x - 2, y - 9, 7.5, '#d9894a', { lw: 1.6 }); ctx.beginPath(); ctx.arc(x - 2, y - 9, 4, 0, 5); stroke(ctx, 1.2, 'rgba(90,40,20,.6)'); D.line(ctx, x + 8, y - 4, x + 10 + s, y - 12, C.ink, 1.2); D.line(ctx, x + 9, y - 4, x + 13 + s, y - 11, C.ink, 1.2); D.circle(ctx, x + 10 + s, y - 12, 1.4, C.ink); D.circle(ctx, x + 13 + s, y - 11, 1.4, C.ink); };
  CD.frog = (ctx, x, y) => { D.egg(ctx, x, y - 6, 10, 7, '#6cc56c', { lw: 1.6 }); for (const k of [-1, 1]) { D.ball(ctx, x + k * 5, y - 13, 3.6, '#6cc56c', { lw: 1.4 }); D.circle(ctx, x + k * 5, y - 13, 1.6, C.ink); } ctx.beginPath(); ctx.arc(x, y - 6, 4, 0.2, Math.PI - 0.2); stroke(ctx, 1.2); D.ellipse(ctx, x - 7, y - 4, 2, 1.2, 'rgba(255,140,160,.6)'); D.ellipse(ctx, x + 7, y - 4, 2, 1.2, 'rgba(255,140,160,.6)'); };
  CD.bee = (ctx, x, y, t) => { const b = Math.sin(t * 8) * 2; y -= 14 + b; D.egg(ctx, x, y, 8, 6, '#ffd25a', { lw: 1.6 }); ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, 8, 6, 0, 0, TAU); ctx.clip(); ctx.fillStyle = C.ink; ctx.fillRect(x - 2, y - 6, 3, 12); ctx.fillRect(x + 4, y - 6, 2, 12); ctx.restore(); for (const k of [-1, 1]) D.ellipse(ctx, x - 1 + k * 3, y - 7, 4, 2.6, 'rgba(255,255,255,.8)', C.ink, 1, k * 0.5); D.circle(ctx, x - 5, y - 1, 1.2, C.ink); };
  CD.firefly = (ctx, x, y, t) => { const b = Math.sin(t * 3) * 3; y -= 16 + b; const glow = 0.5 + Math.sin(t * 4) * 0.5; D.circle(ctx, x, y + 3, 7 + glow * 4, `rgba(255,240,120,${0.25 + glow * 0.3})`); D.egg(ctx, x, y, 4, 3, '#5a4a3a', { lw: 1 }); D.circle(ctx, x, y + 3, 2.6, '#fff36a'); };
  CD.crab = (ctx, x, y, t) => { const w = Math.sin(t * 5) * 1.5; D.egg(ctx, x, y - 6, 10, 6, '#ef6b4b', { lw: 1.6 }); for (const k of [-1, 1]) { D.ball(ctx, x + k * 12, y - 10 + w * k, 3.6, '#ef6b4b', { lw: 1.3 }); D.line(ctx, x + k * 4, y - 11, x + k * 4, y - 15, C.ink, 1.2); D.circle(ctx, x + k * 4, y - 16, 1.8, '#fff', C.ink, 1); } for (let k = -2; k <= 2; k++) if (k) D.line(ctx, x + k * 3, y - 2, x + k * 5, y + 1, C.ink, 1.2); };
  CD.starfish = (ctx, x, y) => { D.star(ctx, x, y - 6, 9, '#ff9a6a', 5, 0.2); D.star(ctx, x, y - 6, 9, null, 5, 0.2); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.stroke(); eyes(ctx, x, y - 6, 3, 1, true); };
  CD.butterfly = (ctx, x, y, t) => { const f = Math.abs(Math.sin(t * 9)); y -= 18 + Math.sin(t * 2) * 3; for (const k of [-1, 1]) { D.ellipse(ctx, x + k * (5 * f + 1), y - 2, 5 * f + 1, 6, '#6fb8ff', C.ink, 1.2); D.ellipse(ctx, x + k * (4 * f + 1), y + 4, 3.5 * f + 1, 3.5, '#a9d8ff', C.ink, 1); } D.line(ctx, x, y - 5, x, y + 6, C.ink, 2); };
  CD.squirrel = (ctx, x, y) => { ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.quadraticCurveTo(x - 20, y - 8, x - 12, y - 24); ctx.quadraticCurveTo(x - 6, y - 14, x - 4, y - 4); D.fillVol(ctx, x - 12, y - 14, 10, '#d9743a', 1.5); D.egg(ctx, x + 2, y - 7, 6.5, 7, '#e08a4a', { lw: 1.5 }); D.ball(ctx, x + 5, y - 16, 5.5, '#e08a4a', { lw: 1.5 }); D.poly(ctx, [x + 2, y - 20, x + 3, y - 25, x + 6, y - 21], '#e08a4a', C.ink, 1.2); D.circle(ctx, x + 7, y - 17, 1.3, C.ink); D.ellipse(ctx, x + 3, y - 4, 3, 3.5, '#f6d2a8'); };
  CD.hoglet = (ctx, x, y) => { ctx.beginPath(); for (let i = 0; i <= 10; i++) { const a = Math.PI + (i / 10) * Math.PI, r = i % 2 ? 9 : 12; ctx.lineTo(x - 2 + Math.cos(a) * r, y - 4 + Math.sin(a) * r * 0.85); } ctx.closePath(); D.fillVol(ctx, x - 2, y - 8, 10, '#8a6a4a', 1.5); D.egg(ctx, x + 7, y - 5, 5, 4, '#f0d0a8', { lw: 1.3 }); D.circle(ctx, x + 11, y - 5, 1.4, C.ink); D.circle(ctx, x + 7, y - 7, 1.1, C.ink); };
  CD.owlet = (ctx, x, y) => { D.egg(ctx, x, y - 9, 8, 10, '#b98d62', { lw: 1.6 }); D.egg(ctx, x, y - 6, 5, 6, '#f0dcc0', { lw: 0 }); for (const k of [-1, 1]) { D.circle(ctx, x + k * 3.5, y - 12, 3.4, '#fff', C.ink, 1.1); D.circle(ctx, x + k * 3.5, y - 12, 1.6, C.ink); D.poly(ctx, [x + k * 4, y - 18, x + k * 8, y - 21, x + k * 7, y - 16], '#b98d62', C.ink, 1); } D.poly(ctx, [x - 1.5, y - 9, x + 1.5, y - 9, x, y - 6.5], '#ffad3b'); };
  CD.hare = (ctx, x, y, t, night) => { const col = '#f4f8ff'; D.egg(ctx, x - 2, y - 7, 9, 7, col, { lw: 1.5 }); D.ball(ctx, x + 6, y - 13, 5.5, col, { lw: 1.4 }); for (const k of [0, 1]) D.egg(ctx, x + 4 + k * 4, y - 23, 2, 6, col, { lw: 1.2, rot: k * 0.3 }); D.circle(ctx, x + 8, y - 14, 1.3, C.ink); D.circle(ctx, x - 10, y - 8, 3, col, C.ink, 1.2); };
  CD.penguin = (ctx, x, y, t) => { const w = Math.sin(t * 6) * 0.1; ctx.save(); ctx.translate(x, y); ctx.rotate(w); D.egg(ctx, 0, -9, 7.5, 9.5, '#8a96a8', { lw: 1.6 }); D.egg(ctx, 0, -7, 4.5, 6.5, '#f4f8ff', { lw: 0 }); D.ball(ctx, 0, -18, 5.5, '#2a2a3a', { lw: 1.4 }); D.egg(ctx, 0, -17, 3.6, 3, '#f4f8ff', { lw: 0 }); eyes(ctx, 0, -18, 3.4, 1, false); D.poly(ctx, [-1.5, -16, 1.5, -16, 0, -14], '#ffad3b'); ctx.restore(); };
  CD.seal = (ctx, x, y) => { D.egg(ctx, x, y - 6, 12, 7, '#c9d3df', { lw: 1.6 }); D.ball(ctx, x + 8, y - 11, 6, '#c9d3df', { lw: 1.5 }); eyes(ctx, x + 9, y - 12, 4, 1.4, false); D.circle(ctx, x + 12, y - 9, 1.2, C.ink); D.poly(ctx, [x - 12, y - 6, x - 18, y - 10, x - 17, y - 2], '#b9c2cf', C.ink, 1.2); };
  CD.dragonfly = (ctx, x, y, t) => { y -= 18 + Math.sin(t * 3) * 2; const f = Math.sin(t * 30) * 0.3; D.line(ctx, x - 10, y, x + 6, y, '#3aa9d6', 3); D.ball(ctx, x + 7, y, 2.6, '#3aa9d6', { lw: 1 }); for (const k of [-1, 1]) { D.ellipse(ctx, x, y + k * 4, 6, 2, 'rgba(220,245,255,.8)', C.ink, 0.8, -k * (0.3 + f)); D.ellipse(ctx, x - 3, y + k * 4, 5, 1.8, 'rgba(220,245,255,.8)', C.ink, 0.8, k * (0.3 + f)); } };
  CD.newt = (ctx, x, y) => { ctx.beginPath(); ctx.moveTo(x - 14, y - 2); ctx.quadraticCurveTo(x - 6, y - 8, x + 4, y - 5); stroke(ctx, 6, C.ink); stroke(ctx, 4, '#ff8a3a'); D.egg(ctx, x + 6, y - 5, 5, 3.6, '#ff8a3a', { lw: 1.3 }); D.circle(ctx, x + 8, y - 6, 1.2, C.ink); for (const k of [-6, -1]) D.circle(ctx, x + k, y - 5, 1.2, '#7a2a1a'); };
  CD.moth = (ctx, x, y, t) => { y -= 16 + Math.sin(t * 2.4) * 3; const f = Math.abs(Math.sin(t * 7)); for (const k of [-1, 1]) D.ellipse(ctx, x + k * (4 + 3 * f), y, 5 + 2 * f, 6, '#e8dcff', C.ink, 1.2); D.egg(ctx, x, y, 2.4, 5, '#b9a7ff', { lw: 1 }); D.circle(ctx, x, y - 1, 9, 'rgba(255,240,180,.15)'); };
  CD.beetle = (ctx, x, y) => { D.ellipse(ctx, x, y - 2, 9, 3, '#d9d9e0', C.ink, 1.2); D.egg(ctx, x, y - 7, 8.5, 6, '#ef6b6b', { lw: 1.5 }); for (let i = 0; i < 12; i++) { const a = Math.PI + (i / 11) * Math.PI; D.circle(ctx, x + Math.cos(a) * 8.5, y - 7 + Math.sin(a) * 6, 0.9, '#fff'); } D.ball(ctx, x + 9, y - 6, 3, '#2a2a3a', { lw: 1 }); };
  CD.duckling = (ctx, x, y, t) => { D.egg(ctx, x - 1, y - 6, 7.5, 6, '#ffe066', { lw: 1.5 }); D.ball(ctx, x + 5, y - 12, 4.8, '#ffe066', { lw: 1.4 }); D.poly(ctx, [x + 9, y - 12, x + 13, y - 11, x + 9, y - 9.5], '#ff9c3a', C.ink, 1); D.circle(ctx, x + 6, y - 13, 1.2, C.ink); };
  CD.mouse = (ctx, x, y) => { ctx.beginPath(); ctx.moveTo(x - 7, y - 3); ctx.quadraticCurveTo(x - 16, y - 1, x - 14, y - 8); stroke(ctx, 1.4, '#c98a8a'); D.egg(ctx, x - 1, y - 5, 7.5, 5.5, '#c9bfb8', { lw: 1.5 }); D.ball(ctx, x + 6, y - 7, 4, '#c9bfb8', { lw: 1.3 }); D.ball(ctx, x + 4, y - 12, 3, '#ffd1dc', { lw: 1.1 }); D.circle(ctx, x + 7.5, y - 8, 1.1, C.ink); D.circle(ctx, x + 10, y - 6.5, 1, '#ef6b6b'); };
  CK.Pastimes.drawCritter = (ctx, id, x, y, t, s) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s || 1, s || 1);
    (CD[id] || CD.mouse)(ctx, 0, 0, t || 0);
    ctx.restore();
  };

  const placeOk = (ow) => !!(ow.world && CK.World.dressed(ow.ch));
  function spawnCritters(ow) {
    ow.critters = [];
    if (!placeOk(ow)) return;
    const night = ow.night, P = pt();
    const kinds = CRITTER_IDS.filter((id) => { const c = CRITTERS[id]; return c.places.includes(ow.ch.id) && (c.time === 'any' || (c.time === 'night') === !!night); });
    if (!kinds.length) return;
    const hab = ow.world.habitat;
    const n = 4 + Math.floor(Math.random() * 3);
    const sx = ow.player.x / TS, sy = ow.player.y / TS;
    const used = [];
    for (let k = 0; k < n * 4 && ow.critters.length < n; k++) {
      // critters you haven't met yet turn up a little more often, so the Field Guide keeps moving
      const pool = kinds.flatMap((id) => (P.seen[id] ? [id] : [id, id]));
      const id = U.pick(pool), cells = hab[CRITTERS[id].home].length ? hab[CRITTERS[id].home] : hab.plain;
      if (!cells.length) continue;
      const [x, y] = U.pick(cells);
      if (Math.hypot(x - sx, y - sy) < 5 || used.some(([a, b]) => Math.abs(a - x) + Math.abs(b - y) < 4)) continue;
      used.push([x, y]);
      ow.critters.push({ type: 'critter', id, px: (x + 0.5) * TS, py: (y + 0.75) * TS, hx: x, hy: y, alert: 0, flees: 0, dir: Math.random() < 0.5 ? -1 : 1, t: Math.random() * 9, hop: null, gone: 0 });
    }
  }
  function updateCritters(ow, dt, busy) {
    const p = ow.player, story = CK.settings && CK.settings.story;
    const running = CK.settings && CK.settings.run || Input.down.ShiftLeft || Input.down.ShiftRight;
    for (const c of ow.critters || []) {
      c.t += dt;
      if (c.gone) { c.gone += dt; continue; }
      if (c.hop) {
        c.hop.k = Math.min(1, c.hop.k + dt / c.hop.d);
        const e = c.hop.k;
        c.px = U.lerp(c.hop.x0, c.hop.x1, e); c.py = U.lerp(c.hop.y0, c.hop.y1, e);
        c.lift = Math.sin(e * Math.PI * c.hop.n) * (c.hop.big ? 10 : 4);
        if (e >= 1) { c.hop = null; c.lift = 0; }
        continue;
      }
      // pottering: a little hop now and then
      if (U.hash(Math.floor(c.t / 2.5), c.hx, c.hy) < dt * 0.6 && !D.calm()) {
        const nx = c.hx + 0.5 + U.rand(-0.8, 0.8), ny = c.hy + 0.75 + U.rand(-0.4, 0.4);
        c.dir = nx * TS > c.px ? 1 : -1;
        c.hop = { k: 0, d: 0.5, n: 2, x0: c.px, y0: c.py, x1: nx * TS, y1: ny * TS };
        continue;
      }
      if (busy || story) { c.alert = Math.max(0, c.alert - dt); continue; }
      const d = Math.hypot(p.x - c.px, p.y - c.py);
      if (p.moving && d < 120) c.alert += dt * (running ? 2.6 : 0.7) * (1.25 - d / 120);
      else c.alert = Math.max(0, c.alert - dt * 0.7);
      if (c.alert >= 1) {
        // spooked! hop away from Sam, to somewhere it could live
        c.alert = 0; c.flees++;
        CK.Audio.sfx('whoosh');
        if (c.flees >= 3) { c.gone = 0.01; continue; }
        const cells = ow.world.habitat[CRITTERS[c.id].home].concat(ow.world.habitat.plain);
        const away = cells.filter(([x, y]) => { const dx = x - c.hx, dy = y - c.hy, dd = Math.hypot(dx, dy); return dd > 2 && dd < 6 && Math.hypot((x + 0.5) * TS - p.x, (y + 0.75) * TS - p.y) > d + 40; });
        if (!away.length) { c.gone = 0.01; continue; }
        const [x, y] = U.pick(away);
        c.hx = x; c.hy = y; c.dir = (x + 0.5) * TS > c.px ? 1 : -1;
        c.hop = { k: 0, d: 0.7, n: 3, big: true, x0: c.px, y0: c.py, x1: (x + 0.5) * TS, y1: (y + 0.75) * TS };
      }
    }
    if (ow.critters) ow.critters = ow.critters.filter((c) => !(c.gone > 0.8));
  }
  function drawCritter(ow, ctx, c) {
    const x = c.px - ow.camX, y = c.py - ow.camY - (c.lift || 0);
    if (x < -40 || x > W + 40 || y < -40 || y > H + 60) return;
    const a = c.gone ? Math.max(0, 1 - c.gone / 0.8) : 1;
    ctx.save(); ctx.globalAlpha *= a;
    D.shadow(ctx, x, c.py - ow.camY, 9, 3, 0.25);
    ctx.translate(x, y); ctx.scale(c.dir * MAP_S, MAP_S);
    (CD[c.id] || CD.mouse)(ctx, 0, 0, c.t, ow.night);
    ctx.restore();
    // a worried "!" once it starts to notice you
    if (c.alert > 0.45 && !c.hop && !c.gone) {
      const k = Math.min(1, (c.alert - 0.45) * 3);
      ctx.save(); ctx.globalAlpha *= k;
      D.text(ctx, '!', x, y - 34, { size: 20, weight: 900, align: 'center', color: '#ef6b3a', outline: C.ink, ow: 3 });
      ctx.restore();
    }
  }

  // ================================================================ CRANES
  function drawCrane(ow, ctx, cr) {
    const x = cr.px - ow.camX, y = cr.py - ow.camY;
    if (x < -40 || x > W + 40 || y < -40 || y > H + 60) return;
    const b = D.calm() ? 0 : Math.sin(ow.t * 2 + cr.x) * 2;
    D.shadow(ctx, x, y, 11, 3, 0.25);
    ctx.save(); ctx.translate(x, y - 10 + b);
    // a folded crane: two wings, a long neck, a pointed tail
    D.poly(ctx, [-13, 0, 0, -3, 13, 0, 0, 5], '#fffaf0', C.ink, 1.6);
    D.poly(ctx, [0, -3, -9, -13, -2, 0], '#ffd1e8', C.ink, 1.4);
    D.poly(ctx, [0, -3, 9, -12, 2, 0], '#ffe6f2', C.ink, 1.4);
    D.line(ctx, 11, 0, 15, -9, C.ink, 3.2); D.line(ctx, 11, 0, 15, -9, '#fffaf0', 1.6);
    D.poly(ctx, [15, -9, 19, -8, 15, -7], '#ffd1e8', C.ink, 1);
    ctx.restore();
    const ph = (ow.t * 0.8 + cr.x * 0.37) % 2.4;
    if (ph < 0.5) { const k = Math.sin((ph / 0.5) * Math.PI); D.star(ctx, x + 12, y - 26, 2 + k * 4, `rgba(255,250,220,${k})`, 4, 0); }
  }
  const craneFound = (id) => !!pt().cranes[id];
  function cranesIn(chId) {
    const ch = CK.Chapters[chId];
    const wd = ch && CK.World.get(ch);
    return wd ? wd.cranes : [];
  }
  CK.Pastimes.cranesIn = cranesIn;

  // ================================================================ OVERWORLD HOOKS
  const baseRefresh = OW.refresh;
  OW.refresh = function () {
    baseRefresh.call(this);
    spawnCritters(this);
    this.cranes = this.world ? this.world.cranes.filter((c) => !craneFound(c.id)).map((c) => Object.assign({ type: 'crane', px: (c.x + 0.5) * TS, py: (c.y + 0.75) * TS }, c)) : [];
  };
  const baseEnter = OW.enter;
  OW.enter = function () {
    baseEnter.call(this);
    if (CK.G && this.ch) {
      const P = pt();
      if (!P.visited[this.ch.id]) { P.visited[this.ch.id] = 1; }
      P.lastPlace = this.ch.id;
    }
  };
  OW.extraDraw = function (list, ctx) {
    for (const c of this.critters || []) list.push({ y: c.py, f: () => drawCritter(this, ctx, c) });
    for (const cr of this.cranes || []) list.push({ y: cr.py, f: () => drawCrane(this, ctx, cr) });
  };
  let tick = 0;
  const baseUpdate = OW.update;
  OW.update = function (dt, active) {
    baseUpdate.call(this, dt, active);
    const busy = !active || CK.scriptRunning > 0 || (CK.Trans && CK.Trans.busy);
    updateCritters(this, dt, busy);
    if (CK.G && active) {
      CK.G.playT = (CK.G.playT || 0) + dt;
      breakClock(dt);
    }
    tick += dt;
    if (tick > 0.7 && !busy) { tick = 0; checkChallenges(); checkJobs(); }
    flushNotes(dt, busy);
  };

  const baseFocus = OW.findFocus;
  OW.findFocus = function (p, who) {
    const f = baseFocus.call(this, p, who);
    if (f && f.type !== 'tree') return f;
    p = p || this.player;
    const fx = p.x + (p.dir === 'left' ? -26 : p.dir === 'right' ? 26 : 0);
    const fy = p.y + (p.dir === 'up' ? -26 : p.dir === 'down' ? 22 : -4);
    let best = null, bd = 50;
    const consider = (o, ix, iy, label, extra) => {
      const d = Math.min(Math.hypot(fx - ix, fy - iy), Math.hypot(p.x - ix, p.y - iy) + 8);
      if (d < bd) { bd = d; best = Object.assign({ ix, iy, promptLabel: label }, extra, { ref: o }); }
    };
    for (const c of this.critters || []) if (!c.gone && !c.hop) consider(c, c.px, c.py, 'Sketch ' + (pt().seen[c.id] ? CRITTERS[c.id].name : 'critter'), { type: 'critter' });
    for (const cr of this.cranes || []) consider(cr, cr.px, cr.py, 'Pick up', { type: 'crane' });
    if (this.world) for (const pr of this.world.props) {
      if (pr.mark) consider(pr, pr.px, pr.py, LM[pr.kind] ? LM[pr.kind].verb : 'Look', { type: 'landmark' });
      else if (pr.kind === 'signpost') consider(pr, pr.px, pr.py, 'Read', { type: 'signpost' });
    }
    return best || f;
  };

  const baseInteract = OW.interact;
  OW.interact = function (e, who) {
    if (e && e.type === 'critter') return sketch(this, e.ref);
    if (e && e.type === 'crane') return pickCrane(this, e.ref);
    if (e && e.type === 'landmark') return visitLandmark(this, e.ref);
    if (e && e.type === 'signpost') {
      const P = pt(), k = this.ch.id + '_' + e.ref.x + '_' + e.ref.y;
      tally('signsRead');
      if (!P.signs[k]) P.signs[k] = 1;
      CK.Audio.sfx('blip');
      CK.runScript([{ narrate: 'The signpost says: ' + e.ref.text }]);
      return;
    }
    if (e) {
      if (e.type === 'npc') tally('chats');
      else if (e.type === 'stand') tally('drinks');
      else if (e.type === 'cat') tally('petsJob');
      else if (e.type === 'tree') {
        const k = this.ch.id + '_' + e.tree.x + '_' + e.tree.y, P = pt();
        if (P.lastTree !== k) tally('shakes');
        P.lastTree = k; P.trees[k] = 1;
      } else if (e.type === 'campfire') {
        tally('rests');
        setTimeout(() => newDay(), 0);
      }
    }
    return baseInteract.call(this, e, who);
  };

  // ------------------------------------------------- sketching a critter
  function sketch(ow, c) {
    const P = pt(), first = !P.seen[c.id];
    P.seen[c.id] = (P.seen[c.id] || 0) + 1;
    tally('spots');
    if (first) tally('newSpots');
    c.gone = 0.01;
    CK.Audio.sfx(first ? 'chest' : 'blip');
    ow.fx.burst(8, () => ({ x: c.px + U.rand(-12, 12), y: c.py - 20, vx: U.rand(-60, 60), vy: U.rand(-90, -40), life: 0.9, size: 6, shape: 'star', color: '#ffd25a' }));
    if (first) {
      CK.G.caps += 8;
      CK.Scenes.push(new SketchCard(c.id));
    } else {
      caps(1, CRITTERS[c.id].name + ' again (seen ' + P.seen[c.id] + ')');
    }
    CK.saveGame();
  }
  class SketchCard {
    constructor(id) { this.id = id; this.t = 0; this.transparent = true; this.finished = false; }
    update(dt) {
      this.t += dt;
      if (CK.autoSkip || (this.t > 0.6 && (Input.hit('ok') || Input.hit('back') || Input.mouse.pressed))) { this.finished = true; CK.Scenes.remove(this); }
    }
    draw(ctx) {
      const P = D.pal(), cr = CRITTERS[this.id];
      const k = D.calm() ? 1 : CK.Ease.ui(Math.min(1, this.t * 3));
      ctx.fillStyle = P.scrim; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(W / 2, H / 2 + (1 - k) * 30); ctx.rotate(-0.012);
      ctx.globalAlpha = Math.min(1, this.t * 4);
      D.panel(ctx, -280, -150, 560, 300, { theme: true, lines: 10, lineTop: 70 });
      D.text(ctx, 'New in the Field Guide', -250, -112, { size: D.T.small, weight: 800, color: P.label });
      D.text(ctx, cr.name, -250, -76, { size: D.T.title, weight: 700, color: P.text });
      // the sketch itself, on a stamp
      D.stamp(ctx, 120, -126, 130, 130, { holes: P.sheet, margin: 7, hole: 3, pitch: 10, fill: '#f6efe0', art: (c, ix, iy, iw, ih) => CK.Pastimes.drawCritter(c, this.id, ix + iw / 2, iy + ih * 0.78, this.t, 3.2) });
      const lines = D.wrap(ctx, cr.fact, 340, D.T.ui, 600);
      lines.forEach((l, i) => D.text(ctx, l, -250, -26 + i * 24, { size: D.T.ui, weight: 600, color: P.text }));
      const when = cr.time === 'night' ? 'Comes out at night' : cr.time === 'day' ? 'Out in the daytime' : 'Out day and night';
      D.text(ctx, when + ' · ' + HOME_WORDS[cr.home], -250, 74, { size: D.T.small, weight: 700, color: P.soft });
      D.cap(ctx, -238, 108, 1.1);
      D.text(ctx, '+8 bottle caps', -222, 114, { size: D.T.ui, weight: 800, color: P.accent });
      D.text(ctx, 'Seen: ' + Object.keys(pt().seen).length + ' of ' + CRITTER_IDS.length, 250, 114, { size: D.T.small, weight: 700, color: P.soft, align: 'right' });
      ctx.restore();
    }
  }
  const HOME_WORDS = { meadow: 'in flowery meadows', grove: 'under trees and bushes', wet: 'by the water', sand: 'on the sand', plain: 'on open grass' };

  // ------------------------------------------------- cranes
  function pickCrane(ow, cr) {
    const P = pt();
    P.cranes[cr.id] = 1;
    tally('cranesJob');
    ow.cranes = ow.cranes.filter((c) => c !== cr);
    CK.Audio.sfx('chest');
    ow.fx.burst(14, () => ({ x: cr.px + U.rand(-10, 10), y: cr.py - 16, vx: U.rand(-90, 90), vy: U.rand(-140, -50), g: 120, life: 1.1, size: 6, shape: 'petal', color: U.pick(['#ffd1e8', '#fffaf0', '#ffe38a']) }));
    const here = ow.world.cranes, n = here.filter((c) => P.cranes[c.id]).length;
    const total = Object.keys(P.cranes).length;
    const lines = [{ narrate: `A paper crane, folded from an old grocery list. On one wing, in Grandma Rosie's handwriting: "${U.pick(WISHES)}"` }];
    CK.G.caps += 10;
    lines.push({ fn: () => { CK.toast(`+10 bottle caps · Paper cranes here: ${n} of ${here.length}`, '#ffe9e0'); return []; } });
    if (n === here.length) {
      CK.G.caps += 25;
      lines.push(['pip', `That's all ${here.length} cranes in ${ow.ch.name}! I counted. Twice.`, 'happy'], { fn: () => { CK.toast('+25 bottle caps · every crane in ' + ow.ch.name, '#ffe9e0'); return []; } });
    }
    if (total === 1) lines.push(['corry', 'Your grandmother folded one of these for every wish she ever made. The storms blew them all over the Kingdom. Shall we find them?', 'happy'], { journal: 'Found one of Grandma Rosie\'s paper cranes. She folded one for every wish. Three hide in the quiet corners of every Kingdom place (a lookout shows where).' });
    CK.runScript(lines);
  }
  const WISHES = ['I wish the brook would stay in its bed.', 'I wish for a dog. A small one. Fine, any size.', 'I wish Isaac would stop winning at marbles.', 'I wish I could build a bridge that never falls down.', 'I wish for one more summer at the lake.', 'I wish Mum would like my drawings.', 'I wish I knew what I want to be.', 'I wish everyone had a dry roof tonight.', 'I wish to be brave about the dark.', 'I wish my paper birds could really fly.', 'I wish for snow on my birthday.', 'I wish to make something that lasts.'];

  // ------------------------------------------------- landmarks
  const LM = {
    picnic: { verb: 'Sit down', lines: (pl) => [{ narrate: 'Everyone sits on the blanket for a minute. Nobody says anything. It\'s nice.' }, ['pip', 'Corry is eating a pretend sandwich. He says it\'s the best pretend sandwich in ' + pl + '.', 'happy']] },
    well: { verb: 'Look in', lines: () => [{ narrate: 'You drop in a pebble. Plink. Far below, something (a frog?) says "thank you".' }, ['corry', 'A well is just a hole that found a purpose. I find that very encouraging.', 'happy']] },
    lookout: { verb: 'Look out', lines: () => [], view: true },
    cairn: { verb: 'Add a stone', lines: () => [{ narrate: 'Builders stack stones to say "I was here". Sam adds one to the top. It wobbles, then holds.' }] },
    snowfort: { verb: 'Peek in', lines: () => [{ narrate: 'Corry declares the snow fort a castle. Pip declares war. Snowball fight! Nobody wins. Everybody laughs.' }] },
  };
  function visitLandmark(ow, pr) {
    const P = pt(), first = !P.marks[pr.mark];
    P.marks[pr.mark] = 1;
    tally('visits');
    CK.Audio.sfx('blip');
    const L = LM[pr.kind] || LM.cairn;
    const lines = L.lines(ow.ch.name).slice();
    if (first) { CK.G.caps += 5; lines.push({ fn: () => { CK.toast('+5 bottle caps · New landmark', '#ffe9e0'); return []; } }); }
    if (L.view) { CK.Scenes.push(new LookoutScene(ow)); if (first) CK.toast('+5 bottle caps · New landmark', '#ffe9e0'); return; }
    CK.runScript(lines);
  }

  // A lookout shows the whole place from above, with cranes you haven't found yet as sparkles.
  class LookoutScene {
    constructor(ow) {
      this.ow = ow; this.t = 0; this.transparent = true; this.finished = false;
      const m = ow.map, sc = Math.min((W - 120) / (m.w * TS), (H - 150) / (m.h * TS));
      this.sc = sc;
      const big = document.createElement('canvas'); big.width = Math.ceil(m.w * TS * sc); big.height = Math.ceil(m.h * TS * sc);
      const bg = big.getContext('2d');
      const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
      const save = { camX: ow.camX, camY: ow.camY, hud: ow.drawHud, shake: ow.shake, px: ow.player.x, py: ow.player.y, night: Object.getOwnPropertyDescriptor(ow, 'night') };
      ow.drawHud = () => {}; ow.shake = 0;
      for (let y = 0; y < m.h * TS; y += H) for (let x = 0; x < m.w * TS; x += W) {
        ow.camX = Math.min(x, m.w * TS - W); ow.camY = Math.min(y, m.h * TS - H);
        g.clearRect(0, 0, W, H); ow.draw(g); bg.drawImage(c, ow.camX * sc, ow.camY * sc, W * sc, H * sc);
      }
      ow.camX = save.camX; ow.camY = save.camY; ow.drawHud = save.hud; ow.shake = save.shake;
      this.img = big;
    }
    update(dt) {
      this.t += dt;
      if (CK.autoSkip || (this.t > 0.5 && (Input.hit('ok') || Input.hit('back') || Input.mouse.pressed))) { this.finished = true; CK.Scenes.remove(this); }
    }
    draw(ctx) {
      const P = D.pal(), ow = this.ow, sc = this.sc, iw = this.img.width, ih = this.img.height;
      ctx.fillStyle = P.scrim; ctx.fillRect(0, 0, W, H);
      const x0 = W / 2 - iw / 2, y0 = 74;
      D.panel(ctx, x0 - 18, 14, iw + 36, ih + 104, { theme: true });
      D.text(ctx, 'From the lookout: ' + ow.ch.name, x0, 50, { size: D.T.heading, weight: 700, color: P.text });
      ctx.save(); D.rr(ctx, x0, y0, iw, ih, 8); ctx.clip(); ctx.drawImage(this.img, x0, y0); ctx.restore();
      D.rr(ctx, x0, y0, iw, ih, 8); stroke(ctx, 2.5, P.text);
      // you are here, and sparkles where cranes are still waiting
      const bob = D.calm() ? 0 : Math.sin(this.t * 4) * 3;
      for (const cr of ow.cranes || []) {
        const cx = x0 + cr.px * sc, cy = y0 + (cr.py - 10) * sc;
        D.circle(ctx, cx, cy, 11, 'rgba(255,255,255,.85)', P.accent, 2.5);
        D.star(ctx, cx, cy, 7 + bob * 0.3, '#ff8fb1', 4, 0);
      }
      const px = x0 + ow.player.x * sc, py = y0 + (ow.player.y - 20) * sc;
      D.circle(ctx, px, py + bob, 9, '#ffd25a', C.ink, 2.5);
      D.text(ctx, 'You', px, py - 14 + bob, { size: D.T.small, weight: 800, align: 'center', color: C.ink, outline: '#fff', ow: 3 });
      const left = (ow.cranes || []).length;
      D.text(ctx, left ? `Pink stars: ${left} paper crane${left === 1 ? '' : 's'} still hiding here.` : 'Every paper crane here has been found.', x0, y0 + ih + 30, { size: D.T.ui, weight: 700, color: P.soft });
      D.text(ctx, 'Z to close', x0 + iw, y0 + ih + 30, { size: D.T.small, weight: 700, color: P.soft, align: 'right' });
    }
  }
  CK.LookoutScene = LookoutScene;

  // ================================================================ BATTLES & FISH
  // called from battle.js victory(): a couple of caps per foe
  CK.Pastimes.battleWon = function (battle) {
    const n = 2 * battle.enemies.length + (battle.def && battle.def.boss ? 10 : 0);
    pt(); CK.G.caps += n; tally('wins');
    return n ? ['+' + n + ' bottle caps'] : [];
  };
  const basePush = CK.Scenes.push;
  CK.Scenes.push = function (s) {
    if (s && s.constructor && s.constructor.name === 'FishingScene' && !s._pt) {
      s._pt = true;
      const land = s.land;
      s.land = function () { land.apply(this, arguments); tally('fish'); };
    }
    return basePush.call(this, s);
  };

  // ================================================================ ODD JOBS
  const JOBS = [
    { id: 'spot', key: 'spots', n: [2, 3], pay: 14, text: (n) => `Sketch ${n} critters (any kind)` },
    { id: 'newspot', key: 'newSpots', n: [1, 1], pay: 20, text: () => 'Sketch a critter you\'ve never met', ok: () => Object.keys(pt().seen).length < CRITTER_IDS.length },
    { id: 'shake', key: 'shakes', n: [3, 5], pay: 10, text: (n) => `Shake ${n} different trees` },
    { id: 'chat', key: 'chats', n: [3, 4], pay: 10, text: (n) => `Say hello to ${n} neighbours` },
    { id: 'crane', key: 'cranesJob', n: [1, 1], pay: 15, text: () => 'Find a paper crane', ok: () => Object.keys(pt().cranes).length < allCranes().length },
    { id: 'visit', key: 'visits', n: [1, 2], pay: 12, text: (n) => n > 1 ? `Visit ${n} landmarks (old ones count)` : 'Visit a landmark (old ones count)' },
    { id: 'signs', key: 'signsRead', n: [2, 2], pay: 8, text: (n) => `Read ${n} signposts` },
    { id: 'pet', key: 'petsJob', n: [1, 1], pay: 10, text: () => 'Pet Biscuit the cat' },
    { id: 'drink', key: 'drinks', n: [1, 1], pay: 8, text: () => 'Have a warm drink at a stand' },
    { id: 'fish', key: 'fish', n: [1, 2], pay: 15, text: (n) => `Catch ${n} fish`, ok: () => CK.flag('rm_rod') },
  ];
  CK.Pastimes.JOBS = JOBS;
  const allCranes = () => Object.values(CK.Chapters).filter((c) => CK.World.dressed(c)).flatMap((c) => CK.World.get(c).cranes);
  function makeJob(exclude) {
    const P = pt();
    const pool = JOBS.filter((j) => (!j.ok || j.ok()) && !exclude.includes(j.id));
    const j = pool[Math.floor(U.hash(P.jobN, 3, 77) * pool.length)] || JOBS[0];
    const n = j.n[0] + Math.floor(U.hash(P.jobN, 4, 77) * (j.n[1] - j.n[0] + 1));
    P.jobN++;
    return { id: j.id, n, base: P.tally[j.key] || 0, pay: j.pay + (n - j.n[0]) * 4, done: false };
  }
  const jobDef = (job) => JOBS.find((j) => j.id === job.id);
  const jobProgress = (job) => Math.min(job.n, (pt().tally[jobDef(job).key] || 0) - job.base);
  function ensureJobs() {
    const P = pt();
    while (P.jobs.length < 3) P.jobs.push(makeJob(P.jobs.map((j) => j.id)));
  }
  function checkJobs() {
    if (!CK.G || !CK.OW || !placeOk(CK.OW)) return;
    ensureJobs();
    for (const job of pt().jobs) {
      if (job.done || jobProgress(job) < job.n) continue;
      job.done = true;
      tally('jobsDone');
      CK.G.caps += job.pay;
      note('Odd job done: ' + jobDef(job).text(job.n), '+' + job.pay + ' bottle caps');
    }
  }
  // a new day (rest at a campfire): finished jobs are swapped for fresh ones. Unfinished ones stay put.
  function newDay() {
    const P = pt();
    ensureJobs();
    const done = P.jobs.filter((j) => j.done).length;
    if (!done) return;
    P.jobs = P.jobs.filter((j) => !j.done);
    ensureJobs();
    CK.toast(`New odd jobs pinned up (${done}). See the Kingdom Book.`, '#fff6d8');
  }
  CK.Pastimes.jobs = () => { ensureJobs(); return pt().jobs.map((j) => ({ text: jobDef(j).text(j.n), n: j.n, have: jobProgress(j), pay: j.pay, done: j.done })); };

  // ================================================================ CHALLENGES
  const CHALLENGES = [
    { id: 'critters', name: 'Field Sketcher', what: 'critters sketched (kinds)', tiers: [4, 10, 20], val: () => Object.keys(pt().seen).length, gold: 'field' },
    { id: 'cranes', name: 'Crane Keeper', what: 'paper cranes found', tiers: [5, 15, 30], val: () => Object.keys(pt().cranes).length, gold: 'cranes' },
    { id: 'landmarks', name: 'Trailblazer', what: 'landmarks visited', tiers: [4, 12, 24], val: () => Object.keys(pt().marks).length, gold: 'explorer' },
    { id: 'jobs', name: 'Odd-Jobber', what: 'odd jobs done', tiers: [5, 20, 50], val: () => pt().tally.jobsDone || 0, gold: 'gold' },
    { id: 'neighbors', name: 'Good Neighbour', what: 'doors knocked on', tiers: [8, 18, 28], val: () => flagCount('knock_'), gold: 'gradcap' },
    { id: 'trees', name: 'Tree Shaker', what: 'different trees shaken', tiers: [10, 30, 60], val: () => Object.keys(pt().trees).length, gold: 'leafcrown' },
    { id: 'fish', name: 'Angler', what: 'kinds of fish caught', tiers: [3, 7, 11], val: () => Object.keys(CK.G.fish || {}).length, gold: 'buckethat' },
    { id: 'foes', name: 'Soggy No More', what: 'troublemakers calmed on the map', tiers: [4, 10, 18], val: () => flagCount('foe_') },
    { id: 'pets', name: 'Biscuit\'s Friend', what: 'pets for Biscuit', tiers: [3, 10, 25], val: () => CK.G.pets || 0 },
    { id: 'signs', name: 'Map Reader', what: 'signposts read', tiers: [3, 8, 14], val: () => Object.keys(pt().signs).length },
    { id: 'drinks', name: 'Warm Hands', what: 'stands visited (day and night)', tiers: [2, 6, 12], val: () => flagCount('stand_') },
    { id: 'letters', name: 'Postie', what: 'lost letters delivered', tiers: [2, 5, 8], val: () => Object.keys((CK.G.letters && CK.G.letters.delivered) || {}).length },
    { id: 'closet', name: 'Dress-Up', what: 'skins collected', tiers: [1, 5, 12], val: () => CK.Closet.count() },
    { id: 'places', name: 'Wanderer', what: 'Kingdom places visited', tiers: [3, 6, 10], val: () => Object.keys(pt().visited).filter((id) => CK.World.KITS[id]).length },
  ];
  const TIER = ['Bronze', 'Silver', 'Gold'], TIER_PAY = [15, 35, 70], TIER_COL = ['#d98a4a', '#9fb0c4', '#f2c230'];
  CK.Pastimes.CHALLENGES = CHALLENGES;
  CK.Pastimes.TIER = TIER; CK.Pastimes.TIER_COL = TIER_COL; CK.Pastimes.TIER_PAY = TIER_PAY;
  function checkChallenges() {
    if (!CK.G || !CK.G.pt && !CK.OW) return;
    const P = pt();
    for (const ch of CHALLENGES) {
      const v = ch.val();
      ch.tiers.forEach((need, ti) => {
        const k = ch.id + '_' + ti;
        if (v < need || P.claimed[k]) return;
        P.claimed[k] = 1;
        CK.G.caps += TIER_PAY[ti];
        let extra = '+' + TIER_PAY[ti] + ' bottle caps';
        if (ti === 2 && ch.gold) { CK.Closet.give(ch.gold); extra += ' · New skin: ' + CK.Closet.item(ch.gold).name; }
        note(`${TIER[ti]}: ${ch.name}`, extra);
      });
    }
  }
  CK.Pastimes.checkChallenges = checkChallenges;

  // achievements arrive as one gentle note at a time, not a pile of pop-ups
  const notes = [];
  let noteT = 0;
  function note(title, sub) { notes.push({ title, sub }); }
  CK.Pastimes.note = note;
  function flushNotes(dt, busy) {
    noteT -= dt;
    if (busy || noteT > 0 || !notes.length) return;
    const n = notes.shift();
    noteT = 2.4;
    CK.Audio.sfx('levelup');
    CK.toast(n.title + '!  ' + n.sub, '#fff1c8');
  }

  // ================================================================ BREAK REMINDER
  // Healthy play: after a long stretch, at the next calm moment (not mid-battle or mid-dialogue), a
  // postcard suggests a break. It never blocks you, never costs anything, and Settings can turn it off.
  const BREAK = [0, 30, 45, 60, 90];
  if (CK.settings.breakMin == null) CK.settings.breakMin = 60;
  let sinceBreak = 0;
  function breakClock(dt) {
    sinceBreak += dt;
    const lim = CK.settings.breakMin;
    if (!lim || sinceBreak < lim * 60 || CK.autoSkip || CK.scriptRunning || CK.Scenes.top() !== CK.OW) return;
    sinceBreak = 0;
    CK.Scenes.push(new BreakCard(lim));
  }
  class BreakCard {
    constructor(min) { this.min = min; this.t = 0; this.sel = 0; this.transparent = true; this.finished = false; }
    rects() { return [[W / 2 - 230, 372, 220, 46], [W / 2 + 10, 372, 220, 46]]; }
    update(dt) {
      this.t += dt;
      if (this.t < 0.6) return;
      if (Input.hit('left') || Input.hit('right')) { this.sel = 1 - this.sel; CK.Audio.sfx('blip'); }
      let pick = Input.hit('ok') ? this.sel : Input.hit('back') ? 0 : -1;
      this.rects().forEach((r, i) => { if (Input.mouse.moved && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) this.sel = i; if (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) pick = i; });
      if (pick < 0) return;
      CK.Audio.sfx('select');
      this.finished = true; CK.Scenes.remove(this);
      CK.saveGame();
      if (pick === 1) CK.flaps(() => CK.Scenes.replace(new CK.TitleScene()), { label: 'See you soon!' });
    }
    draw(ctx) {
      const P = D.pal();
      ctx.fillStyle = P.scrim; ctx.fillRect(0, 0, W, H);
      D.panel(ctx, W / 2 - 300, 70, 600, 380, { theme: true, airmail: true });
      D.text(ctx, 'A good place to stop', W / 2 - 260, 128, { size: D.T.title, weight: 700, color: P.text });
      const lines = D.wrap(ctx, `You've been building for about ${this.min >= 60 ? (this.min / 60 === 1 ? 'an hour' : this.min / 60 + ' hours') : this.min + ' minutes'}. Maybe stretch, drink some water, and look at something far away for a bit. Your game is saved, and nothing in the Kingdom goes anywhere while you're gone.`, 520, D.T.ui, 600);
      lines.forEach((l, i) => D.text(ctx, l, W / 2 - 260, 170 + i * 25, { size: D.T.ui, weight: 600, color: P.text }));
      const up = upNext();
      if (up) D.wrap(ctx, 'Next time: ' + up, 520, D.T.small, 700).slice(0, 2).forEach((l, i) => D.text(ctx, l, W / 2 - 260, 300 + i * 20, { size: D.T.small, weight: 700, color: P.soft }));
      D.text(ctx, 'Change or turn off in Settings', W / 2 - 260, 346, { size: D.T.small, weight: 700, color: P.soft });
      this.rects().forEach((r, i) => D.button(ctx, ...r, i ? 'Save and take a break' : 'Keep playing', { hover: i === this.sel, size: 17 }));
    }
  }
  CK.BreakCard = BreakCard;
  function upNext() {
    const bits = [];
    const ow = CK.OW;
    if (ow && ow.ch.objective) { const o = ow.ch.objective(CK.G); if (o) bits.push(o.replace(/\.$/, '')); }
    const open = CK.Pastimes.jobs().filter((j) => !j.done).length;
    if (open) bits.push(open + ' odd job' + (open > 1 ? 's' : '') + ' waiting');
    return bits.join(' · ');
  }
  CK.SettingsOptions.push({ id: 'breakMin', label: 'Break reminder', desc: 'After this long, at a calm moment, a postcard suggests a short break. It never interrupts a battle or a conversation.', val: () => (CK.settings.breakMin ? CK.settings.breakMin + ' min' : 'Off'), next: (d) => { const i = BREAK.indexOf(CK.settings.breakMin); CK.settings.breakMin = BREAK[(Math.max(0, i) + (d || 1) + BREAK.length) % BREAK.length]; } });

  // ================================================================ DEBUG
  CK.debugPastimes = {
    spawn() { if (CK.OW) spawnCritters(CK.OW); return CK.OW && CK.OW.critters.map((c) => c.id); },
    seeAll() { for (const id of CRITTER_IDS) pt().seen[id] = 1; },
    caps(n) { pt(); CK.G.caps += n || 500; },
    breakNow() { CK.Scenes.push(new BreakCard(60)); },
    cranesHere() { return CK.OW && CK.OW.cranes; },
  };
})();
