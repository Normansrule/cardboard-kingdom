// Cardboard Kingdom - Chapter 10: The Long Bridge (the finale).
// The old fridge box is soaking through in the spring rain. One last trip takes Sam and Jules to
// the Great Gorge, where the first Kingdom Fair in a hundred years waits on the far side of a
// bridge that washed away in Sam's own storm. The last scrap of that storm is a small grey cloud
// that says you'll never finish anything. Pip flies the first line across, like the kite at
// Niagara in 1848, and the whole Kingdom builds a suspension bridge together. Then the box goes
// soft, and Sam learns what Grandma learned in 1974: a door isn't the box.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input, Data = CK.Data;
  const W = CK.W, H = CK.H, TS = 48;
  const C = D.C, TAU = Math.PI * 2;
  const CH = D.chars;
  const f = (k) => CK.flag(k);
  const S = CK.Story.scripts;
  const built = () => f('lb_built');
  const stroke = (ctx, lw, col) => { ctx.strokeStyle = col || C.ink; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };

  // ================================================================ CHARACTERS
  // Whirligigs: paper pinwheels on pencils with button faces. Bits of wind left over from the
  // Endless Storm. Angry, they spin like mad and their eyes glow; calm, they turn lazily.
  const BLADES = [['#ef6b6b', '#ffd25a', '#5aa9e6', '#6cc56c'], ['#ff9ec7', '#a68be6', '#ffd25a', '#5ac8c8'], ['#ffb347', '#5aa9e6', '#ff7aa0', '#9ad07a']];
  CH.whirl = function (ctx, x, y, o) {
    const s = o.s || 1, mood = o.mood || 'happy', seed = o.seed || 0;
    const angry = mood === 'angry';
    const cols = BLADES[seed % 3];
    const hov = Math.sin(CK.time * 3 + seed) * 3 * s;
    const cx = x, cy = y - 36 * s + hov;
    // the pencil it stands on
    D.rr(ctx, x - 2.6 * s, cy, 5.2 * s, 28 * s - hov, 1.5 * s); ctx.fillStyle = '#ffd25a'; ctx.fill(); stroke(ctx, 1.6);
    D.poly(ctx, [x - 2.6 * s, y - 8 * s, x + 2.6 * s, y - 8 * s, x, y - 1 * s], '#f2d2a6', C.ink, 1.4);
    D.circle(ctx, x, y - 2 * s, 1 * s, C.ink);
    // spinning paper blades
    const rot = CK.time * (angry ? 9 : 2.2) + seed;
    const R = 19 * s;
    for (let i = 0; i < 4; i++) {
      const a = rot + (i * Math.PI) / 2;
      D.poly(ctx, [cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R, cx + Math.cos(a + 0.8) * R * 0.66, cy + Math.sin(a + 0.8) * R * 0.66], cols[i], C.ink, 1.8);
      D.line(ctx, cx, cy, cx + Math.cos(a + 0.35) * R * 0.7, cy + Math.sin(a + 0.35) * R * 0.7, 'rgba(255,255,255,0.45)', 1.2);
    }
    // the button face
    D.ball(ctx, cx, cy, 8.5 * s, '#fffaf0', { lw: 2 });
    for (const k of [-1, 1]) D.circle(ctx, cx + k * 2.4 * s, cy + 3.6 * s, 0.9 * s, 'rgba(120,90,60,0.5)');
    if (angry) {
      for (const k of [-1, 1]) {
        const ex = cx + k * 3.4 * s, ey = cy - 1.5 * s;
        const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, 5 * s);
        g.addColorStop(0, 'rgba(160,220,255,0.8)'); g.addColorStop(1, 'rgba(160,220,255,0)');
        ctx.fillStyle = g; ctx.fillRect(ex - 5 * s, ey - 5 * s, 10 * s, 10 * s);
        D.circle(ctx, ex, ey, 2.1 * s, '#dff6ff', C.ink, 1.2);
        D.line(ctx, ex - k * 2.6 * s, ey - 3.4 * s, ex + k * 2 * s, ey - 2.2 * s, C.ink, 1.4);
      }
      // little gust lines
      for (let i = 0; i < 3; i++) {
        const gy = cy - 10 * s + i * 10 * s, ph = (CK.time * 2 + i * 0.3) % 1;
        ctx.beginPath(); ctx.moveTo(cx + 22 * s + ph * 10 * s, gy); ctx.quadraticCurveTo(cx + 30 * s + ph * 10 * s, gy - 4 * s, cx + 36 * s + ph * 10 * s, gy); stroke(ctx, 1.6, `rgba(255,255,255,${0.8 - ph * 0.7})`);
      }
    } else {
      D.eyes(ctx, cx, cy - 1 * s, 3.4 * s, 1.5 * s, { happy: mood === 'happy', sad: mood === 'sad' });
      D.blush(ctx, cx, cy + 2.4 * s, 6 * s, 1.4 * s);
    }
    D.mouth(ctx, cx, cy + 3 * s, 2 * s, angry || mood === 'sad' ? 'sad' : 'smile');
  };

  // The Little Drizzle: the last scrap of the Endless Storm. A small grey thundercloud that says
  // you'll never finish anything. Angry: dark, with lightning and glowing eyes. Calm: pale and damp.
  CH.grumble = function (ctx, x, y, o) {
    const s = o.s || 1, mood = o.mood || 'sad';
    const angry = mood === 'angry';
    const col = angry ? '#6a7290' : mood === 'happy' ? '#d2dcec' : '#a9b3c8';
    const by = y - 30 * s + Math.sin(CK.time * 2) * 2 * s;
    // rain underneath (always, a little)
    for (let i = 0; i < 4; i++) {
      const p = (CK.time * (angry ? 2.2 : 1.2) + i / 4) % 1;
      D.line(ctx, x - 12 * s + i * 8 * s, by + 10 * s + p * 20 * s, x - 13 * s + i * 8 * s, by + 15 * s + p * 20 * s, '#6fb5e8', 2);
    }
    if (angry && Math.sin(CK.time * 7) > 0.6) D.poly(ctx, [x + 3 * s, by + 8 * s, x - 3 * s, by + 18 * s, x + 2 * s, by + 18 * s, x - 4 * s, by + 30 * s, x + 7 * s, by + 15 * s, x + 2 * s, by + 15 * s, x + 7 * s, by + 8 * s], '#ffe96a', C.ink, 1.4);
    const puffs = [[-14, 3, 10], [-6, -1, 12], [5, -4, 13], [15, 2, 10], [-2, -12, 10], [9, -12, 9]];
    for (const [dx, dy, r] of puffs) D.ball(ctx, x + dx * s, by + dy * s, r * s, col, { lw: 2, k: 0.7 });
    for (const [dx, dy, r] of puffs) D.circle(ctx, x + dx * s, by + dy * s, (r - 2) * s, col);
    // the face
    const fy = by - 2 * s;
    if (angry) {
      for (const k of [-1, 1]) {
        const ex = x + k * 5 * s;
        const g = ctx.createRadialGradient(ex, fy, 0, ex, fy, 6 * s);
        g.addColorStop(0, 'rgba(255,233,106,0.85)'); g.addColorStop(1, 'rgba(255,233,106,0)');
        ctx.fillStyle = g; ctx.fillRect(ex - 6 * s, fy - 6 * s, 12 * s, 12 * s);
        D.circle(ctx, ex, fy, 2.6 * s, '#fff6b0', C.ink, 1.3);
        D.circle(ctx, ex, fy, 1 * s, C.ink);
        D.line(ctx, ex - k * 4 * s, fy - 4.5 * s, ex + k * 2.6 * s, fy - 2.8 * s, C.ink, 1.8);
      }
      D.mouth(ctx, x, fy + 6 * s, 3.4 * s, 'sad');
    } else {
      D.eyes(ctx, x, fy, 5 * s, 2 * s, { happy: mood === 'happy', sad: mood !== 'happy' });
      D.blush(ctx, x, fy + 3.5 * s, 9 * s, 1.6 * s);
      D.mouth(ctx, x, fy + 5 * s, 2.4 * s, mood === 'happy' ? 'smile' : 'sad');
      if (mood !== 'happy') D.egg(ctx, x + 8 * s, fy + 5 * s, 1.6 * s, 2.4 * s, '#9fd6ff', { lw: 1 });
    }
  };

  // ================================================================ DATA
  Object.assign(Data.speakers, {
    whirl: { name: 'Whirligig', look: 'whirl', ps: 2.6, py: 14, bg: '#e6f4ff', o: { seed: 1 } },
    littled: { name: 'Little Drizzle', look: 'grumble', ps: 2.6, py: 2, bg: '#e2e6f0' },
  });
  Data.enemies.whirl = {
    name: 'Whirligig', hp: 58, atk: 12, def: 2, xp: 12, scraps: 7, draw: 'whirl',
    moves: [{ name: 'Pinwheel Spin', power: 1, w: 3 }, { name: 'Gorge Gust', power: 0.75, all: true, w: 2 }],
  };
  Data.enemies.grumble = {
    name: 'Little Drizzle', hp: 470, atk: 14, def: 3, xp: 120, scraps: 70, draw: 'grumble', boss: true,
    moves: [{ name: 'Gloomy Downpour', power: 0.85, all: true, w: 2, water: true, soak: true }, { name: "You'll Never Finish", power: 1.4, w: 2 }, { name: 'Whirligigs, Blow!', summon: 'whirl', w: 1 }],
  };
  Data.battles.lb_whirls = { enemies: ['whirl', 'whirl', 'whirl'], season: 'spring' };
  Data.battles.lb_drizzle = { enemies: ['whirl', 'grumble', 'whirl'], season: 'spring', boss: true, music: 'boss' };

  const baseEnemy = D.enemy;
  D.enemy = function (ctx, type, x, y, o = {}) {
    if (type !== 'whirl' && type !== 'grumble') return baseEnemy.call(this, ctx, type, x, y, o);
    const s = o.s || 1;
    ctx.save();
    if (type === 'whirl') { D.shadow(ctx, x, y, 30 * s, 7 * s); CH.whirl(ctx, x, y, { s: 2.5 * s, seed: o.seed || 0, mood: o.calm ? 'happy' : 'angry' }); }
    else { D.shadow(ctx, x, y, 60 * s, 12 * s); CH.grumble(ctx, x, y - 30 * s, { s: 3.6 * s, mood: o.calm ? 'sad' : 'angry' }); }
    ctx.restore();
  };

  // ================================================================ MAP
  CK.SOLID.add('g'); // the gorge
  const GL = (y) => (y >= 9 && y <= 15 ? 16 : 16 + Math.round(Math.sin(y * 1.3) * 1.2));
  const GR = (y) => (y >= 9 && y <= 15 ? 23 : 23 + Math.round(Math.sin(y * 0.9 + 1) * 1.2));
  CK.Chapters.longbridge = {
    id: 'longbridge', name: 'The Great Gorge', w: 40, h: 24, season: 'spring', music: 'spring',
    start: [2, 12], noFlood: true,
    weather: () => null,
    nightTint: () => 'rgba(30,24,70,0.5)',
    build(m) {
      m.scatter(',', 0.12, 101);
      m.path([[1, 12], [38, 12]], '=');
      m.path([[8, 12], [8, 7]], '=');
      m.path([[12, 12], [12, 5]], '=');
      m.path([[30, 12], [30, 18]], '=');
      m.scatter('T', 0.05, 102);
      m.border('T');
      m.rect(1, 11, 1, 3, '=');
      for (let y = 0; y < m.h; y++) for (let x = GL(y); x <= GR(y); x++) m.set(x, y, 'g');
      // once the Long Bridge is built, you can walk across
      if (built()) for (let x = GL(12); x <= GR(12); x++) m.set(x, 12, 'b');
    },
    post(m) {
      for (const o of this.objects) if (o.type === 'building') m.rect(o.x - Math.floor(o.bw / 2), o.y - o.bh + 1, o.bw, o.bh + 1, '.');
      for (const o of this.objects) if (o.type !== 'building' && o.type !== 'trigger' && o.type !== 'deco' && !'=bdg'.includes(m.get(o.x, o.y))) m.set(o.x, o.y, '.');
      // keep the rims and the fair clear
      m.rect(9, 9, 6, 7, '.'); m.rect(25, 6, 13, 13, '.');
      m.rect(1, 12, 15, 1, '='); m.rect(24, 12, 15, 1, '=');
      m.rect(30, 13, 1, 5, '=');
      m.rect(12, 6, 1, 6, '=');
      for (let y = 0; y < m.h; y++) for (let x = GL(y); x <= GR(y); x++) if (m.get(x, y) !== 'b') m.set(x, y, 'g');
    },
    objects: [
      { type: 'bench', x: 3, y: 14 },
      { type: 'sign', x: 3, y: 10, text: 'THE GREAT GORGE. The Long Bridge: washed away (Endless Storm, last winter). The Kingdom Fair: THAT way. Sorry.' },
      { type: 'campfire', x: 5, y: 18 },
      { type: 'stand', x: 9, y: 16, color: '#e07a9a', drink: 'pink lemonade', who: 'duck', line: 'Pink lemonade! For the Fair! Which is over there. So technically this is pre-Fair lemonade.', vendor: { species: 'duck', color: '#ffe67a', hat: 'sunhat' } },
      { type: 'chest', id: 'lb_chest', x: 2, y: 21, script: [{ scraps: 25 }, { snacks: 2 }, { narrate: 'A picnic basket somebody left behind when the old bridge went. Inside: scraps, juice boxes, and a note. "Back soon! - the Rope Bridge Repair Club, est. last Tuesday."' }] },
      { type: 'deco', kind: 'tent', id: 'pavilion', x: 10, y: 9, o: { col: '#a68be6' } },
      { type: 'building', id: 'rookhut', x: 6, y: 6, bw: 3, bh: 2, label: "Inspector's Hut", color: '#b8a888', roof: '#5a5f6e', door: 'Knock', script: [{ narrate: 'A sign on the door: OUT INSPECTING. Inspector Rook is standing right next to it.' }] },
      { type: 'npc', id: 'rook_lb', x: 8, y: 8, look: 'rook', talk: () => (!f('lb_queen') ? 'lb_rook_early' : !f('lb_rook') ? 'lb_rook' : 'lb_rook_again') },
      { type: 'npc', id: 'queen_w', x: 10, y: 11, look: 'queen', o: { s: 0.9 }, talk: () => (f('lb_queen') ? 'lb_queen_again' : 'lb_queen'), cond: () => !built() },
      { type: 'npc', id: 'jules_lb', x: 5, y: 11, look: 'jules', talk: 'lb_jules', cond: () => !CK.coop },
      // the north rim: wind, and a small grey cloud
      { type: 'enemy', id: 'lb_whirl1', x: 11, y: 5, look: 'whirl', battle: 'lb_whirls', patrol: [[11, 5], [13, 4], [13, 7], [11, 7]], cond: () => f('lb_rook') && !f('lb_whirls') },
      { type: 'npc', id: 'whirls', x: 13, y: 7, look: 'whirl', o: { s: 0.8, seed: 1, mood: 'happy' }, talk: 'lb_whirl_talk', cond: () => f('lb_whirls') },
      { type: 'npc', id: 'littled', x: 13, y: 3, look: 'grumble', o: { s: 0.9, mood: 'sad' }, talk: 'lb_drizzle', cond: () => f('lb_whirls') && !f('lb_drizzle') },
      { type: 'npc', id: 'littled_calm', x: 6, y: 15, look: 'grumble', o: { s: 0.7, mood: 'happy' }, talk: 'lb_littled_talk', cond: () => f('lb_drizzle') },
      { type: 'deco', kind: 'kitepost', id: 'lb_kitepost', x: 14, y: 14, label: 'Fly!', script: 'lb_kite', cond: () => f('lb_drizzle') && !f('lb_line') },
      { type: 'site', id: 'lb_site', x: 14, y: 10, script: 'lb_site', cond: () => f('lb_line') && !built() },
      // the gorge: broken ropes, then a single line, then the Long Bridge
      { type: 'deco', kind: 'lbropes', x: 19, y: 11, cond: () => !f('lb_line') },
      { type: 'deco', kind: 'lbline', x: 19, y: 11, cond: () => f('lb_line') && !built() },
      { type: 'deco', kind: 'lbspan', x: 19, y: 11, o: { side: 'back' }, cond: built },
      { type: 'deco', kind: 'lbspan', x: 19, y: 13, o: { side: 'front' }, cond: built },
      { type: 'deco', kind: 'lantern', x: 14, y: 11 },
      { type: 'deco', kind: 'lantern', x: 25, y: 11 },
      // the Kingdom Fair, on the far side
      { type: 'deco', kind: 'ferris', x: 35, y: 6 },
      { type: 'deco', kind: 'tent', x: 27, y: 8, o: { col: '#ef6b6b' } },
      { type: 'deco', kind: 'tent', x: 31, y: 8, o: { col: '#5aa9e6' } },
      { type: 'deco', kind: 'tent', x: 36, y: 16, o: { col: '#6cc56c' } },
      { type: 'deco', kind: 'stage', x: 31, y: 20 },
      { type: 'deco', kind: 'bunting', x: 30, y: 10 },
      { type: 'deco', kind: 'lantern', x: 28, y: 17, light: [90, 40] },
      { type: 'deco', kind: 'lantern', x: 33, y: 17, light: [90, 40] },
      { type: 'npc', id: 'queen_fair', x: 31, y: 18, look: 'queen', o: { s: 0.9 }, talk: () => (f('lb_fair') ? 'lb_queen_after' : 'lb_fair'), cond: built },
      { type: 'npc', id: 'mayor_lb', x: 26, y: 10, look: 'mayor', talk: 'lb_mayor' },
      { type: 'npc', id: 'bess_lb', x: 28, y: 14, look: 'bess', o: { s: 0.85 }, talk: 'lb_bess' },
      { type: 'npc', id: 'skipper_lb', x: 33, y: 14, look: 'skipper', talk: 'lb_skipper' },
      { type: 'npc', id: 'gale_lb', x: 34, y: 10, look: 'puffin', talk: 'lb_gale' },
      { type: 'npc', id: 'brack_lb', x: 37, y: 11, look: 'walrus', o: { s: 0.9 }, talk: 'lb_brack' },
      { type: 'npc', id: 'tin_lb', x: 26, y: 15, look: 'crab', o: { s: 0.85, big: true, mood: 'happy' }, talk: 'lb_tin' },
      { type: 'npc', id: 'lux_lb', x: 35, y: 14, look: 'heron', o: { s: 0.8 }, talk: 'lb_lux' },
      { type: 'npc', id: 'moth_lb', x: 29, y: 7, look: 'moth', o: { s: 0.55, mood: 'happy', seed: 3 }, talk: 'lb_moth' },
    ],
    objective(G) {
      if (!f('lb_queen')) return 'Find Queen Corrina on the west rim';
      if (!f('lb_rook')) return 'Ask Inspector Rook how to cross the gorge (north path)';
      if (!f('lb_whirls')) return 'Something keeps blowing things into the gorge. Find out what (north rim)';
      if (!f('lb_drizzle')) return 'Talk to the little grey cloud on the north rim';
      if (!f('lb_line')) return 'Help Pip fly the first line across (kite post at the cliff edge)';
      if (!built()) return 'Design the Long Bridge (blueprint at the cliff edge)';
      if (!f('lb_fair')) return 'Cross the Long Bridge and find the Queen at the Fair stage';
      return 'Free roam! Use the workbench by the road to travel anywhere.';
    },
    // the goal marker knows exactly where each step is
    goal() {
      if (!f('lb_queen')) return 'queen_w';
      if (!f('lb_rook')) return 'rook_lb';
      if (!f('lb_whirls')) return 'lb_whirl1';
      if (!f('lb_drizzle')) return 'littled';
      if (!f('lb_line')) return 'lb_kitepost';
      if (!built()) return 'lb_site';
      if (!f('lb_fair')) return 'queen_fair';
      return null;
    },
  };

  // the box gets soggy, and the Fair is calling
  const portalScript = S.ep_portal;
  S.ep_portal = [
    { if: () => f('gp_done') && !f('longbridge_arrived'), then: [
      { narrate: 'The box is damp all the way through. A week of spring rain has soaked into the corners, and the flaps sag like tired ears.' },
      { narrate: 'From somewhere inside, faint and far away: fairground music.' },
      ['jules', 'Is that... a carnival? Inside the box?', 'shock'],
      ['sam', "It's getting soggy. One more trip, while it still works.", 'sad'],
      { chapter: 'longbridge', label: 'The Great Gorge, in spring...' },
    ] },
  ].concat(portalScript);
  const campus = CK.Chapters.campus;
  const campusObjective = campus.objective;
  campus.objective = function (G) {
    if (f('gp_done') && !f('longbridge_arrived')) return 'The box is soaking up the spring rain. Go through while you still can (recycling center)';
    const o = campusObjective.call(this, G);
    return f('lb_done') ? o.replace('The glowing box goes back to the Kingdom.', 'The new box goes anywhere in the Kingdom, Fair included.') : o;
  };
  const baseTravel = CK.travelChoice;
  CK.travelChoice = function (text) {
    const c = baseTravel(text);
    if (f('longbridge_arrived') && CK.G.chapter !== 'longbridge') c.choice.options.splice(c.choice.options.length - 1, 0, { label: 'The Great Gorge (the Fair)', then: [{ chapter: 'longbridge', label: 'The Great Gorge' }] });
    return c;
  };

  // ================================================================ SCRIPTS
  const rebuild = { fn: () => { if (CK.OW) CK.OW.buildEntities(); } };
  S.longbridge_intro = [
    { card: { title: 'Chapter 10', sub: 'The Long Bridge' } },
    { narrate: 'The Great Gorge, in spring. A canyon so deep you hear the river before you see it. On the far side: striped tents, bunting, and a cardboard Ferris wheel turning slowly in the sun.' },
    ['corry', 'The Kingdom Fair! The first one in a hundred years! I can see Mayor Mossworth! And Captain Bess! And Old Tin\'s bucket!', 'happy'],
    ['pip', 'There used to be a rope bridge. It washed away last winter, in the Endless Storm.', 'sad'],
    ['pip', 'Fact: that was your storm, Sam.', 'sad'],
    ['sam', 'Right. Yeah. Okay okay okay.', 'sad'],
    ['jules', "So everyone's over there, and we're over here. Classic.", 'happy'],
    ['pip', 'Also, Sam? Your sleeve is a bit... soggy.', 'shock'],
    ['sam', "It's been raining on campus for a week. The box is soaking it all up.", 'sad'],
    { journal: 'The Great Gorge. The first Kingdom Fair is on the far side, and the old bridge washed away in my storm. The box is getting soggy. My sleeve is damp.' },
  ];
  S.lb_jules = [() => [!f('lb_rook')
    ? ['jules', "I've already named the river. It's called Gerald. Don't tell the moth.", 'happy']
    : !f('lb_drizzle') ? ['jules', 'If something is blowing hats into the gorge, I would like to keep my hat. Just saying.', 'sad']
      : !built() ? ['jules', 'Pip is going to fly across THAT. I need to sit down. I am sitting down.', 'shock']
        : ['jules', 'You built a bridge across a canyon, Sam. A whole canyon.', 'happy']]];

  S.lb_queen = [
    ['queen', 'Builder! And Jules! You came!', 'happy'],
    ['queen', 'A hundred years ago the Kingdom was all one place. Then the gorge got deeper, the old bridge got older, and last winter the Endless Storm took it.', 'sad'],
    ['queen', 'Now half my Kingdom is on that side, waiting for a Fair that cannot start. And half is on this side, waving.', 'sad'],
    ['sam', "The Endless Storm. I'm sorry. That was... kind of me.", 'sad'],
    ['queen', 'Pish. Storms are nobody\'s fault. Your grandmother taught me that word. Pish.', 'happy'],
    ['queen', 'Inspector Rook is up the north path. Nothing gets built in this Kingdom now without his stamp. He is VERY proud of the stamp.', 'happy'],
    { flag: 'lb_queen' },
    { journal: 'Queen Corrina needs a bridge to the Fair. Inspector Rook (from Riverbend!) has to approve it.' },
  ];
  S.lb_queen_again = [['queen', 'Inspector Rook is up the north path, with his stamp. Do let him use it. It makes his whole day.', 'happy']];
  S.lb_rook_early = [['rook', 'Inspector Rook, Royal Bridges. Do speak to the Queen first. Protocol.', 'happy']];
  S.lb_rook = [
    ['rook', 'Ah. The Builder. I have been expecting you. I have prepared a clipboard.', 'happy'],
    ['rook', 'The gorge is two hundred and forty cardboard feet across. Too long for a beam. Too deep to build an arch from below.', 'sad'],
    ['pip', 'A suspension bridge! Two towers, two big cables hanging between them, and the deck hangs from the cables.', 'happy'],
    ['rook', 'Correct. But first you need one line across. Just one. With the line you pull a rope across, and with the rope, a cable.', 'happy'],
    ['rook', 'Unfortunately, nothing has made it across in weeks. Something keeps blowing it all into the gorge. Hats. Letters. A small goat.', 'sad'],
    ['corry', 'The GOAT?!', 'shock'],
    ['rook', 'The goat is fine. He lives down there now. He seems happy.', 'happy'],
    { flag: 'lb_rook' },
    rebuild,
    { journal: 'Inspector Rook says the gorge needs a suspension bridge. But first we need one line across, and something keeps blowing everything into the gorge.' },
  ];
  S.lb_rook_again = [() => [built()
    ? ['rook', 'I have stamped the Long Bridge forty-one times. It is the best-stamped bridge in the Kingdom.', 'happy']
    : f('lb_line') ? ['rook', 'The line is across! Now the design. Two towers, two cables, a deck. My stamp is ready.', 'happy']
      : ['rook', 'One line across. That is all we need to start. One.', 'sad']]];

  S.after_lb_whirl1 = [
    { narrate: 'The Whirligigs wobble to a stop, blades drooping. Up close, they are paper pinwheels on pencils, with button faces.' },
    ['whirl', "Sorry! Sorry. We can't stop spinning. We came out of the big storm last winter, and nobody told us where to go after.", 'sad'],
    ['sam', 'You came out of the storm?', 'shock'],
    ['whirl', 'The big grey one. The Endless one. When it rained itself out, there were bits left over. Us. And him.', 'sad'],
    { narrate: 'The Whirligig points one blade north. On the rim of the gorge sits a small grey cloud, all on its own, quietly raining on itself.' },
    { flag: 'lb_whirls' },
    rebuild,
    { journal: 'The Whirligigs are bits of wind left over from my storm. There is something else on the north rim: a little grey cloud.' },
    { save: true },
  ];
  S.lb_whirl_talk = [() => [f('lb_drizzle')
    ? ['whirl', 'We are blowing very gently now. On purpose! It turns out wind is just air that wants to go somewhere.', 'happy']
    : ['whirl', 'He is up on the rim. He says scary things, but he is mostly sad.', 'sad']]];

  S.lb_drizzle = [
    ['littled', 'Go away. I am a storm.', 'sad'],
    ['sam', "You're... kind of a small storm.", 'sad'],
    ['littled', 'I am the LAST of the Endless Storm. I am the bit that says you will never finish anything. I am VERY scary.', 'angry'],
    { battle: 'lb_drizzle' },
    { narrate: 'The little cloud sinks onto the grass, out of thunder. A raindrop runs down where its nose would be.' },
    ['littled', 'You were supposed to give up. That was the whole storm. You were supposed to stay in your room and not try.', 'sad'],
    ['sam', "I know you. You're the voice at two in the morning, when the problem set isn't working.", 'sad'],
    ['sam', "I used to think I had to beat you. I can't, can I? You're part of the weather.", 'sad'],
    ['littled', 'I am part of the weather.', 'sad'],
    ['sam', 'Then come with us. You can rain on the gardens. They need it.', 'happy'],
    ['littled', '...Gardens?', 'shock'],
    ['pip', 'Rain gardens! Rule Four! Leave room for the rain!', 'happy'],
    ['littled', 'I have never been invited anywhere.', 'happy'],
    { narrate: 'The Little Drizzle drifts after Sam, raining softly. The Whirligigs fall in behind it, spinning gently for the first time.' },
    ['whirl', 'If you need wind, Builder, we are VERY good at wind.', 'happy'],
    ['pip', 'Wind! Sam! I know how to get the first line across!', 'happy'],
    ['pip', 'Fact: in 1848 they built a bridge over the Niagara gorge. To get the first line across, they held a kite-flying contest. A boy called Homan Walsh won it. With a KITE.', 'happy'],
    ['corry', 'Pip. No. The gorge. The wind. You are PAPER.', 'shock'],
    ['pip', "I'm a kite, Corry. A kite isn't a thing that flies. It's a thing that flies with someone.", 'happy'],
    { flag: 'lb_drizzle' },
    rebuild,
    { journal: "The Little Drizzle is the last of my storm: the voice that says I'll never finish. I didn't beat it. I invited it along. Pip wants to fly the first line across, like the kite at Niagara in 1848." },
    { save: true },
  ];
  S.lb_littled_talk = [() => [f('lb_fair')
    ? ['littled', 'I rained on the Fair garden. Only a little. Everybody said thank you. Nobody has ever said thank you to weather.', 'happy']
    : ['littled', 'I am still a bit gloomy. But it is a cozier sort of gloomy. Like a rainy Sunday.', 'happy']]];

  S.lb_kite = [
    ['pip', 'Tie the line to my tail. Hold on tight. Whirligigs, a nice steady breeze, please!', 'happy'],
    ['corry', 'Pip. If you fall in, I am jumping in after you.', 'sad'],
    ['pip', 'You would go soggy!', 'shock'],
    ['corry', 'Then I would go soggy.', 'happy'],
    { await: () => startKite() },
    { narrate: 'The line pulls tight across the gorge. On the far side, Captain Bess catches Pip in one big flipper and ties the line around a post. The whole Fair cheers.' },
    ['corry', 'PIP! You are ALIVE! That was a GREAT Deed! I am giving you a STAR!', 'happy'],
    ['pip', "Tell him it was Medium! I don't want him to use up his stickers!", 'happy'],
    ['rook', 'One line across. Now: the design. My stamp is ready.', 'happy'],
    { flag: 'lb_line' },
    rebuild,
    { journal: 'Pip flew the first line across the gorge, riding the Whirligigs\' wind. Next: design the Long Bridge.' },
    { save: true },
  ];

  S.lb_site = [
    ['rook', 'Two towers, two main cables, a deck, and anchors to hold the cables down. The whole Kingdom will cross it tonight, so it must be strong.', 'happy'],
    ['rook', 'And it must not wobble in the wind. I have read about a bridge that wobbled. I do not wish to discuss it.', 'sad'],
    { puzzle: 'long_bridge' },
    { narrate: 'Inspector Rook reads the blueprint twice, upside down once, and brings his stamp down with a tremendous THUNK. APPROVED.' },
    ['queen', 'Then let the whole Kingdom build it!', 'happy'],
    { await: () => startRaise() },
    { flag: 'lb_built' },
    { fn: () => { if (CK.OW) CK.OW.refresh(); } },
    { night: true, label: 'That evening, the Kingdom Fair begins...' },
    ['jules', "Sam. You did it. Everybody's crossing.", 'happy'],
    ['corry', 'To the Fair! The Queen is waiting by the stage!', 'happy'],
    { journal: 'The whole Kingdom built the Long Bridge together. Tonight, the Fair!' },
    { save: true },
  ];

  // the Fair (and the goodbye)
  S.lb_fair = [
    { fn: () => { CK.Scenes.push((CK.LB_FAIR = new FairScene())); } },
    { wait: 1.2 },
    { narrate: 'The Long Bridge glows with hooded lanterns, every one pointing down at the path. Above it hangs the paper moon. Far off to the west, every nine seconds, the Gull Point Light sweeps the sky.' },
    ['queen', 'Builder. Look at them all.', 'happy'],
    { narrate: 'Mayor Mossworth is dancing with Captain Bess. Brack is carrying Old Tin in a brand new bucket. Mr. Lux is handing out lanterns that only light up your feet. Inspector Rook is stamping things that do not need stamping.' },
    ['rook', 'Forty-one stamps. A personal best.', 'happy'],
    ['littled', 'I rained on the Fair garden. Only a little. Everybody said thank you.', 'happy'],
    ['jules', 'Sam. This is the best night of my life, and I have seen an octopus open a jar.', 'happy'],
    ['pip', 'Sam... your hand.', 'shock'],
    { fn: () => { CK.LB_FAIR.soft = true; CK.Audio.sfx('magic'); } },
    { narrate: "Sam looks down. Their fingers are going soft at the edges, like cardboard left out in the rain. Through them, faintly, you can see the lanterns." },
    ['corry', 'The box. It is soaking through. When it goes soft, the door closes.', 'sad'],
    ['jules', 'Then we go back. Right now. Sam, come on.', 'shock'],
    ['sam', 'If the door closes... Corry. Pip. I might not...', 'sad'],
    ['corry', 'Builder. Listen. I sat in a box for twelve years. I know about waiting.', 'sad'],
    ['corry', 'You are not putting us back in a box. We are not going anywhere. We are right HERE, on the bridge you built. We will keep.', 'happy'],
    { narrate: "Sir Corrugate peels the very last gold star off the back of his Ledger and presses it onto Sam's soggy sleeve." },
    ['corry', 'Great Deed Number Two. Front row. You promised.', 'happy'],
    ['pip', 'Go, Sam! I am counting! One! Two!', 'happy'],
    { flag: 'lb_fair' },
    { fn: () => { CK.Scenes.remove(CK.LB_FAIR); CK.LB_FAIR = null; } },
    { goto: 'campus', label: 'Back through the box...' },
    { fn: () => { CK.Scenes.push((CK.LB_RAIN = new RainBox())); } },
    { wait: 1.4 },
    { narrate: 'Sam tumbles out onto the wet pavement by the recycling center. Behind them, with a long, tired sigh, the old fridge box folds in on itself and goes flat in the rain.' },
    { fn: () => { CK.LB_RAIN.flat = true; CK.Audio.sfx('splash'); } },
    { wait: 1 },
    ['sam', 'No. No no no. Okay okay okay.', 'sad'],
    { narrate: 'Sam lifts the soggy flaps back up. They just flop down again. It is only cardboard now.' },
    { fn: () => { if (!CK.coop) CK.LB_RAIN.jules = true; return [CK.coop ? ['jules', "I'm here. I came through right behind you. Sam, I'm right here.", 'sad'] : ['jules', 'Sam? I saw you run out in the... oh. Oh, no.', 'sad']]; } },
    { narrate: "Sam's phone buzzes. GRANDMA ROSIE." },
    ['grandma', 'Sam? I had a feeling. Is it the box?', 'sad'],
    ['sam', "It went soft, Grandma. It's gone. They're all on the other side and the door's just... gone.", 'sad'],
    ['grandma', 'Mine went soft too, you know. Spring of 1974. I sat on the porch and howled.', 'sad'],
    ['grandma', 'Then Ike came round with the box his new refrigerator came in, and we built another one.', 'happy'],
    ['grandma', "A door isn't the box, love. It's what you build in it. And who you build it with.", 'happy'],
    ['grandma', 'Go and find a box.', 'happy'],
    ['jules', '...My mini-fridge came in a box. It\'s under my bed. I keep everything.', 'happy'],
    ['sam', 'Of course you do.', 'happy'],
    { fn: () => { CK.Scenes.remove(CK.LB_RAIN); CK.LB_RAIN = null; } },
    { await: () => startFold() },
    { narrate: "The new box sits in the middle of the dorm room. Smaller than Grandma's. Covered in Jules's doodles of fish and Sam's doodles of bridges." },
    { narrate: 'For a long moment, nothing happens.' },
    { fn: () => { CK.LB_FOLD.glow = true; CK.Audio.sfx('magic'); } },
    { wait: 1.6 },
    { fn: () => { CK.LB_FOLD.pop = true; CK.Audio.sfx('levelup'); } },
    { wait: 1 },
    { narrate: 'Warm light leaks out of the seams. Then a pot helmet with a red plume pokes up through the flaps.' },
    ['corry', 'FRONT ROW!', 'happy'],
    ['pip', 'Fact: that took you four minutes and twelve seconds. A new record for doors.', 'happy'],
    ['littled', '(It is raining a tiny bit indoors. Sorry.)', 'happy'],
    ['sam', 'Rule Eight.', 'happy'],
    ['jules', 'Go on.', 'happy'],
    ['sam', 'Build it together. And when it falls down, build it again.', 'happy'],
    { fn: () => { CK.Scenes.remove(CK.LB_FOLD); CK.LB_FOLD = null; } },
    { flag: 'lb_done' },
    { card: { title: 'Chapter 10 complete', sub: 'Rule Eight: build it together, and build it again.', dur: 3.4 } },
    { journal: "The old box went soft. Grandma's went soft in 1974, and she and Ike built another. Jules and I built a new one from a mini-fridge box, and Corry came straight through. Rule Eight: build it together, and build it again." },
    { narrate: 'The next morning, they carry the new box down to the recycling center, where the old one used to be. Nobody recycles it. Nobody ever will.' },
    { narrate: "A week later. Dr. Okafor's office." },
    ['okafor', 'So, Sam. Senior year next year. Do you know what you want yet?', 'happy'],
    ['sam', 'I want to build things that let people stay. In their homes. By their ponds. Near their crabs.', 'happy'],
    ['okafor', '...Near their crabs?', 'shock'],
    ['sam', "It's a long story. I'll draw you a picture.", 'happy'],
    { scraps: 100 },
    { save: true },
    { fn: () => { CK.flaps(() => CK.Scenes.replace(new FinaleCredits()), { label: 'Rule Eight: build it together, and build it again.' }); } },
    { wait: 2 },
  ];
  S.lb_queen_after = [['queen', 'The Fair will go on all spring. Come back whenever you like. You know the way now. You built it.', 'happy']];
  S.lb_mayor = [() => [f('lb_fair') ? ['mayor', 'I have danced with a pirate. My knees will never recover. Worth it.', 'happy'] : ['mayor', 'Builder! I have not seen Blossom Hollow and Brinemarsh at one party since... ever. Look at us!', 'happy']]];
  S.lb_bess = [['bess', 'Yarr! Caught the kite myself, I did. Smallest, bravest sailor I ever met.', 'happy']];
  S.lb_skipper = [['skipper', 'Floodgates in summer, a bridge in spring. You keep this up, Builder, and nobody in this Kingdom will ever get wet feet again. Except on purpose.', 'happy']];
  S.lb_gale = [['gale', "I brought the lamp's spare bulb, in case the Fair runs late. Jules says you keep a light on for somebody. Ike would've liked that.", 'happy']];
  S.lb_brack = [['brack', "Old Tin's new bucket has a HANDLE. I carried him across the bridge myself. Don't tell anyone I enjoyed it.", 'happy']];
  S.lb_tin = [['tin', 'First time I have crossed anything bigger than a puddle in eleven years. The Shellbacks are on the Ferris wheel. All of them. In one seat.', 'happy']];
  S.lb_lux = [['lux', 'Hooded lanterns, every one of them! Pointing at your feet! The Moth-kin have not bumped into a single thing all night.', 'happy']];
  S.lb_moth = [['moth', 'I can see the moon AND the bridge lanterns. Nobody is lost tonight.', 'happy']];

  // ================================================================ PROPS
  Object.assign(CK.DECO_FOOT, { tent: [-1, -0.7, 2, 0.9], ferris: [-1.6, -0.6, 3.2, 0.8], stage: [-2, -1, 4, 1.2], kitepost: [0.2, 0.3, 0.6, 0.4] });
  const deckY = () => 12 * TS + 6;
  const deckY2 = () => 12 * TS + 42;
  const towerW = () => GL(12) * TS - 18, towerE = () => (GR(12) + 1) * TS + 18;
  // a parabola between two tower tops, sagging down toward the middle of the deck
  function cable(ctx, x1, x2, top, low, col, lw) {
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const k = i / 24, X = x1 + (x2 - x1) * k, Y = top + (low - top) * (1 - (2 * k - 1) ** 2);
      if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
    }
    stroke(ctx, lw || 3, col || '#5a3a22');
  }
  const cableY = (x1, x2, top, low, X) => { const k = (X - x1) / (x2 - x1); return top + (low - top) * (1 - (2 * k - 1) ** 2); };
  Object.assign(CK.DecoDraw, {
    tent(ctx, e, x, y) {
      const col = (e.o && e.o.col) || '#ef6b6b';
      D.shadow(ctx, x + 6, y + 2, 52, 10);
      ctx.beginPath(); ctx.moveTo(x - 46, y); ctx.lineTo(x - 40, y - 46); ctx.lineTo(x + 40, y - 46); ctx.lineTo(x + 46, y); ctx.closePath();
      D.fillVol(ctx, x - 10, y - 30, 50, '#fff4e4', 2.5);
      for (let i = -3; i <= 3; i += 2) { ctx.beginPath(); ctx.moveTo(x + i * 12 - 6, y); ctx.lineTo(x + i * 10.4 - 5, y - 46); ctx.lineTo(x + i * 10.4 + 5, y - 46); ctx.lineTo(x + i * 12 + 6, y); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }
      ctx.beginPath(); ctx.moveTo(x - 46, y); ctx.lineTo(x - 40, y - 46); ctx.lineTo(x + 40, y - 46); ctx.lineTo(x + 46, y); stroke(ctx, 2.5);
      D.poly(ctx, [x - 48, y - 44, x, y - 84, x + 48, y - 44], col, C.ink, 2.5);
      D.poly(ctx, [x - 48, y - 44, x - 30, y - 56, x - 12, y - 44, x + 6, y - 56, x + 24, y - 44, x + 48, y - 44], '#fff4e4', C.ink, 1.5);
      D.line(ctx, x, y - 84, x, y - 104, C.ink, 2);
      D.poly(ctx, [x, y - 104, x + 18, y - 98 + Math.sin(this.t * 4) * 2, x, y - 92], '#ffd25a', C.ink, 1.5);
      D.rr(ctx, x - 12, y - 30, 24, 30, 10); ctx.fillStyle = 'rgba(60,30,20,0.55)'; ctx.fill(); stroke(ctx, 2);
    },
    ferris(ctx, e, x, y) {
      // a cardboard Ferris wheel, slowly turning, with lit gondolas at night
      const cx = x, cy = y - 120, R = 92, a0 = this.t * 0.25;
      D.shadow(ctx, x + 10, y + 2, 80, 12);
      for (const k of [-1, 1]) { D.line(ctx, cx, cy, cx + k * 60, y, '#8a6a4a', 7); D.line(ctx, cx, cy, cx + k * 60, y, C.ink, 1); }
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); stroke(ctx, 6, '#d9a66b'); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); stroke(ctx, 1.5);
      ctx.beginPath(); ctx.arc(cx, cy, R - 10, 0, TAU); stroke(ctx, 2, '#c99561');
      const cols = ['#ef6b6b', '#ffd25a', '#5aa9e6', '#6cc56c', '#ff9ec7', '#a68be6', '#ffb347', '#5ac8c8'];
      for (let i = 0; i < 8; i++) {
        const a = a0 + (i * TAU) / 8, px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R;
        D.line(ctx, cx, cy, px, py, '#b8875a', 2.5);
        D.line(ctx, px, py, px, py + 10, C.ink, 1.5);
        D.box3(ctx, px - 11, py + 8, 22, 15, 6, { r: 4, lw: 1.8, fill: cols[i], flute: false });
        if (this.night) D.circle(ctx, px, py + 15, 3, '#fff3b0');
      }
      D.ball(ctx, cx, cy, 11, '#ffd25a', { lw: 2 });
    },
    stage(ctx, e, x, y) {
      D.shadow(ctx, x + 8, y + 4, 100, 14);
      D.box3(ctx, x - 92, y - 26, 184, 26, 16, { r: 2, lw: 3, fill: '#c99561', flute: false });
      ctx.beginPath(); ctx.moveTo(x - 92, y - 42); ctx.lineTo(x - 92, y - 120); ctx.lineTo(x + 92, y - 120); ctx.lineTo(x + 92, y - 42); stroke(ctx, 5, '#8a6a4a');
      for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + k * 90, y - 118); ctx.quadraticCurveTo(x + k * 60, y - 80, x + k * 70, y - 40); ctx.lineTo(x + k * 90, y - 40); ctx.closePath(); D.fillVol(ctx, x + k * 80, y - 90, 30, '#c2410c', 2); }
      D.cardboard(ctx, x - 70, y - 140, 140, 26, { r: 4, lw: 2.5, fill: '#fff4dc', flute: false });
      D.text(ctx, 'THE KINGDOM FAIR', x, y - 122, { size: 14, weight: 700, align: 'center', color: '#c2410c' });
    },
    bunting(ctx, e, x, y) {
      const cols = ['#ef6b6b', '#ffd25a', '#5aa9e6', '#6cc56c', '#ff9ec7'];
      for (const [x1, x2] of [[x - 140, x], [x, x + 150]]) {
        ctx.beginPath(); ctx.moveTo(x1, y - 90); ctx.quadraticCurveTo((x1 + x2) / 2, y - 66, x2, y - 90); stroke(ctx, 1.5);
        for (let i = 1; i < 9; i++) {
          const k = i / 9, px = x1 + (x2 - x1) * k, py = y - 90 + 24 * (1 - (2 * k - 1) ** 2) * 1;
          D.poly(ctx, [px - 6, py, px + 6, py, px, py + 13 + Math.sin(this.t * 3 + i) * 1.5], cols[i % 5], C.ink, 1.2);
        }
      }
      for (const px of [x - 140, x, x + 150]) { D.line(ctx, px, y, px, y - 94, '#8a6a4a', 4); D.line(ctx, px, y, px, y - 94, C.ink, 1); }
    },
    kitepost(ctx, e, x, y) {
      // a stake with a spool of line, and Pip's launch spot
      D.shadow(ctx, x, y, 14, 4);
      D.line(ctx, x, y, x, y - 34, '#8a6a4a', 5); D.line(ctx, x, y, x, y - 34, C.ink, 1);
      D.ball(ctx, x, y - 26, 8, '#fffaf0', { lw: 2 });
      for (let i = 0; i < 3; i++) D.line(ctx, x - 7, y - 30 + i * 4, x + 7, y - 30 + i * 4, '#c2410c', 1.2);
      D.text(ctx, 'LAUNCH', x, y - 44, { size: 10, weight: 700, align: 'center', color: '#fffaf0', outline: C.ink, ow: 3 });
    },
    lbropes(ctx) {
      // the old rope bridge: frayed ends dangling into the gorge
      for (const [wx, k] of [[towerW() + 6, 1], [towerE() - 6, -1]]) {
        const X = wx - this.camX, Y = deckY() - this.camY;
        for (const dy of [0, 36]) {
          D.line(ctx, X, Y + dy - 10, X, Y + dy - 40, '#8a6a4a', 6); D.line(ctx, X, Y + dy - 10, X, Y + dy - 40, C.ink, 1);
          ctx.beginPath(); ctx.moveTo(X, Y + dy - 36); ctx.quadraticCurveTo(X + k * 22, Y + dy - 10 + Math.sin(this.t * 1.5) * 3, X + k * 18, Y + dy + 34); stroke(ctx, 2.5, '#b8875a');
          for (let i = 0; i < 3; i++) D.line(ctx, X + k * 18, Y + dy + 34, X + k * (16 + i * 3), Y + dy + 42, '#b8875a', 1.2);
        }
        D.cardboard(ctx, X + k * 6 - 6, Y + 50, 14, 10, { r: 1, lw: 1.5, fill: '#a47a4c', flute: false });
      }
    },
    lbline(ctx) {
      // one thin line across the gorge, sagging a little in the breeze
      const x1 = towerW() + 6 - this.camX, x2 = towerE() - 6 - this.camX, Y = deckY() + 8 - this.camY;
      ctx.beginPath(); ctx.moveTo(x1, Y - 30); ctx.quadraticCurveTo((x1 + x2) / 2, Y + 30 + Math.sin(this.t * 1.6) * 6, x2, Y - 30); stroke(ctx, 2, '#fffaf0');
      for (const X of [x1, x2]) { D.line(ctx, X, Y, X, Y - 36, '#8a6a4a', 6); D.line(ctx, X, Y, X, Y - 36, C.ink, 1); }
    },
    lbspan(ctx, e) {
      // the Long Bridge: two towers with a crossbar, two big cables, hangers to the deck edge.
      // Drawn in two layers (the back cable before people walk on the deck, the front cable after).
      const front = e.o && e.o.side === 'front';
      const ox = this.camX, oy = this.camY;
      const X1 = towerW() - ox, X2 = towerE() - ox;
      const base = (front ? deckY2() : deckY()) - oy;
      const top = base - 168, low = base - 20;
      const col = front ? '#a0461e' : '#7a3418';
      // hangers
      for (let i = 1; i < 16; i++) {
        const X = X1 + ((X2 - X1) * i) / 16;
        D.line(ctx, X, cableY(X1, X2, top + 8, low, X), X, base, front ? 'rgba(90,58,34,0.9)' : 'rgba(90,58,34,0.6)', 1.6);
      }
      cable(ctx, X1, X2, top + 8, low, col, 5);
      cable(ctx, X1, X2, top + 8, low, 'rgba(255,255,255,0.25)', 1.2);
      // backstays down to the anchors on each rim
      for (const [X, k] of [[X1, -1], [X2, 1]]) { ctx.beginPath(); ctx.moveTo(X, top + 8); ctx.quadraticCurveTo(X + k * 50, base - 50, X + k * 90, base + 4); stroke(ctx, 4, col); D.box3(ctx, X + k * 90 - 12, base - 8, 24, 14, 8, { r: 2, lw: 2, fill: '#a9aeb6', flute: false }); }
      // the towers (each leg is a stack of cardboard boxes)
      for (const X of [X1, X2]) {
        D.shadow(ctx, X + 6, base + 2, 16, 4);
        D.box3(ctx, X - 10, top, 20, base - top, 8, { r: 2, lw: 2.5, fill: front ? '#d9a66b' : '#c99561', flute: false });
        for (let yy = top + 30; yy < base - 10; yy += 34) D.line(ctx, X - 9, yy, X + 9, yy, 'rgba(0,0,0,0.15)', 2);
        D.box3(ctx, X - 13, top - 10, 26, 14, 8, { r: 3, lw: 2.5, fill: '#ef6b6b', flute: false });
        if (!front) D.box3(ctx, X - 10, top + 24, 20, deckY2() - deckY(), 6, { r: 2, lw: 2, fill: '#b8875a', flute: false });
        if (front && this.night) { D.circle(ctx, X, top - 16, 5, '#fff3b0', C.ink, 1.5); }
      }
      // hooded lanterns along the front railing at night: light the path, not the sky
      if (front) for (let i = 1; i < 8; i++) {
        const X = X1 + ((X2 - X1) * i) / 8;
        D.line(ctx, X, base, X, base - 20, C.ink, 1.5);
        D.poly(ctx, [X - 6, base - 22, X + 6, base - 22, X + 4, base - 28, X - 4, base - 28], '#5a3a22', C.ink, 1.2);
        if (this.night) { const g = ctx.createRadialGradient(X, base - 12, 1, X, base, 26); g.addColorStop(0, 'rgba(255,230,140,0.6)'); g.addColorStop(1, 'rgba(255,230,140,0)'); ctx.fillStyle = g; ctx.fillRect(X - 26, base - 26, 52, 40); }
      }
    },
  });
  // the gorge itself, painted into the ground
  CK.Chapters.longbridge.paintGround = function (g, m) {
    const isG = (x, y) => m.get(x, y) === 'g' || m.get(x, y) === 'b';
    for (let y = 0; y < m.h; y++) {
      let x0 = -1, x1 = -1;
      for (let x = 0; x < m.w; x++) if (isG(x, y)) { if (x0 < 0) x0 = x; x1 = x; }
      if (x0 < 0) continue;
      const Y = y * TS, L = x0 * TS, R = (x1 + 1) * TS;
      // depth: dark in the middle, rock walls catching the light on either side
      const grd = g.createLinearGradient(L, 0, R, 0);
      grd.addColorStop(0, '#9a7a5a'); grd.addColorStop(0.12, '#6a4e3e'); grd.addColorStop(0.3, '#33283c'); grd.addColorStop(0.7, '#2a2236'); grd.addColorStop(0.88, '#4a3a34'); grd.addColorStop(1, '#6a5244');
      g.fillStyle = grd; g.fillRect(L, Y, R - L, TS);
      // cardboard strata on the walls
      for (let i = 0; i < 3; i++) {
        g.fillStyle = `rgba(255,230,190,${0.12 - i * 0.03})`;
        g.fillRect(L + 4 + i * 10, Y + U.hash(y, i, 3) * 20, 6, 22);
        g.fillStyle = `rgba(0,0,0,${0.12 + i * 0.04})`;
        g.fillRect(R - 10 - i * 10, Y + U.hash(y, i, 4) * 20, 6, 22);
      }
      // grassy lips along both rims
      g.fillStyle = '#6aa04a'; g.fillRect(L - 4, Y, 6, TS); g.fillRect(R - 2, Y, 6, TS);
      g.fillStyle = 'rgba(40,30,20,0.6)'; g.fillRect(L + 2, Y, 3, TS); g.fillRect(R - 5, Y, 3, TS);
    }
    // the river, far below, winding down the middle
    g.save(); g.beginPath();
    for (let y = 0; y <= m.h; y++) {
      let x0 = 0, x1 = 0;
      for (let x = 0; x < m.w; x++) if (isG(x, Math.min(m.h - 1, y))) { if (!x0) x0 = x; x1 = x; }
      const cx = ((x0 + x1 + 1) / 2) * TS + Math.sin(y * 0.8) * 16;
      if (y) g.lineTo(cx, y * TS); else g.moveTo(cx, 0);
    }
    g.strokeStyle = '#2f5f8a'; g.lineWidth = 22; g.lineCap = 'round'; g.stroke();
    g.strokeStyle = '#4a8ac0'; g.lineWidth = 12; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; g.setLineDash([6, 18]); g.stroke();
    g.restore();
    // mist
    for (let i = 0; i < 18; i++) { g.fillStyle = 'rgba(255,255,255,0.07)'; g.beginPath(); g.ellipse((GL(i) + 3.5) * TS + U.hash(i, 7) * 80 - 40, i * TS * 1.3, 90, 22, 0, 0, TAU); g.fill(); }
    // the deck, once it's built
    if (m.get(GL(12), 12) === 'b') {
      const L = GL(12) * TS - 8, R = (GR(12) + 1) * TS + 8, Y = 12 * TS + 6;
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(L, Y + 40, R - L, 16);
      D.box3(g, L, Y, R - L, 36, 8, { r: 2, lw: 2.5, fill: '#d9a66b', flute: false });
      for (let X = L + 12; X < R; X += 14) D.line(g, X, Y + 2, X, Y + 34, 'rgba(90,58,34,0.35)', 2);
    }
  };

  // ================================================================ KITE FLIGHT
  // Pip carries the first line across the gorge. Hold to climb, let go to glide down. Ride the
  // Whirligigs' updrafts, dodge the geese, and don't dip into the river. You can't lose; a
  // tumble just blows you back a little.
  class KiteScene {
    constructor() {
      this.t = 0; this.p = 0; this.y = 260; this.vy = 0; this.done = false; this.finished = false;
      this.stun = 0; this.spin = 0; this.msg = ''; this.msgT = 0;
      this.parts = new CK.Particles();
      this.drafts = [0.24, 0.52, 0.78];
      this.geese = [];
      this.nextGoose = 1.5;
    }
    sx() { return 130 + this.p * 700; }
    say(m) { this.msg = m; this.msgT = 1.3; }
    bump(m, back) {
      if (this.stun > 0) return;
      this.stun = 0.9; this.spin = 1; this.p = Math.max(0, this.p - back); this.say(m); CK.Audio.sfx('error');
    }
    update(dt) {
      this.t += dt; this.parts.update(dt); this.msgT -= dt;
      if (this.done) {
        if (!this.closing && this.t - this.doneT > 1.4) { this.closing = true; CK.flaps(() => { this.finished = true; CK.Scenes.remove(this); }); }
        return;
      }
      if (CK.autoSkip) { this.p = 1; this.finish(); return; }
      const hold = Input.held('ok') || Input.held('up') || Input.mouse.down || (CK.coop && (Input.p(0).held('ok') || Input.p(1).held('ok')));
      if (this.stun > 0) { this.stun -= dt; this.spin = Math.max(0, this.spin - dt * 1.1); }
      else {
        this.vy += (hold ? -330 : 190) * dt;
        this.p += dt * 0.055;
      }
      this.vy = U.clamp(this.vy, -170, 170) * (1 - dt * 0.8);
      this.y += this.vy * dt;
      const x = this.sx();
      // updrafts: a big lift and a push forward
      for (const d of this.drafts) {
        const dx = 130 + d * 700;
        if (Math.abs(x - dx) < 34 && this.y > 120) {
          this.vy -= 520 * dt; this.p += dt * 0.05;
          if (Math.random() < dt * 20) this.parts.emit({ x: x + U.rand(-10, 10), y: this.y + 20, vx: U.rand(-20, 20), vy: -120, life: 0.6, size: 3, shape: 'spark', color: '#bfe6ff' });
          if (!this['d' + d]) { this['d' + d] = true; this.say('Whoosh! Thanks, Whirligigs!'); CK.Audio.sfx('whoosh'); }
        }
      }
      // geese fly left across the gorge
      this.nextGoose -= dt;
      if (this.nextGoose <= 0) { this.nextGoose = 1.8 + Math.random() * 1.4; this.geese.push({ x: W + 30, y: 110 + Math.random() * 280, v: 150 + Math.random() * 60 }); }
      for (const gs of this.geese) {
        gs.x -= gs.v * dt;
        if (Math.abs(gs.x - x) < 26 && Math.abs(gs.y - this.y) < 22) { gs.hit = true; this.bump('Honk! Sorry, goose!', 0.04); }
      }
      this.geese = this.geese.filter((gs) => gs.x > -40);
      if (this.y < 70) { this.y = 70; this.vy = Math.max(0, this.vy); }
      if (this.y > 455) { this.y = 440; this.vy = -160; this.bump('Splash! Too low, Pip!', 0.03); this.parts.burst(12, () => ({ x, y: 470, vx: U.rand(-80, 80), vy: U.rand(-160, -60), g: 400, life: 0.7, size: 3, shape: 'drop', color: '#9fd6ff' })); }
      // the far cliff: you have to come in high enough to land on top of it
      if (this.p >= 1) {
        if (this.y > 300) { this.p = 0.95; this.vy = -100; this.bump('Too low for the cliff! Climb!', 0.0); }
        else this.finish();
      }
    }
    finish() {
      this.done = true; this.doneT = this.t; this.p = 1; CK.Audio.sfx('win');
      this.parts.burst(40, () => ({ x: this.sx(), y: this.y, vx: U.rand(-160, 160), vy: U.rand(-200, -40), g: 220, life: 1.6, size: U.rand(4, 7), shape: 'square', color: U.pick(['#ef6b6b', '#ffd25a', '#6cc56c', '#5aa9e6', '#ff9ec7']), spin: 5 }));
    }
    draw(ctx) {
      // spring sky over the gorge, side on
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#8fd0f6'); g.addColorStop(1, '#e8f6ff');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 5; i++) { const cx = ((i * 230 + this.t * 12) % (W + 200)) - 100; D.ellipse(ctx, cx, 70 + (i % 3) * 30, 60, 18, 'rgba(255,255,255,0.8)'); }
      // the far fair, peeking over the right cliff
      for (let i = 0; i < 3; i++) D.poly(ctx, [850 + i * 36, 300, 868 + i * 36, 262, 886 + i * 36, 300], ['#ef6b6b', '#5aa9e6', '#6cc56c'][i], C.ink, 2);
      ctx.beginPath(); ctx.arc(920, 230, 50, 0, TAU); stroke(ctx, 4, '#d9a66b');
      // the gorge walls and the river far below
      ctx.fillStyle = '#5a4436'; ctx.fillRect(0, 300, W, H - 300);
      ctx.fillStyle = '#2a2236'; ctx.fillRect(120, 300, 720, H - 300);
      const wall = (x1, x2, lit) => { ctx.beginPath(); ctx.moveTo(x1, 300); ctx.lineTo(x2, 300); ctx.lineTo(x2 + (lit ? 0 : 0), H); ctx.lineTo(x1, H); ctx.closePath(); ctx.fillStyle = lit ? '#8a6a4a' : '#6a5244'; ctx.fill(); stroke(ctx, 3); };
      wall(0, 130, true); wall(830, W, false);
      for (let i = 0; i < 6; i++) { D.line(ctx, 0, 330 + i * 34, 130, 330 + i * 34, 'rgba(0,0,0,0.12)', 3); D.line(ctx, 830, 330 + i * 34, W, 330 + i * 34, 'rgba(0,0,0,0.15)', 3); }
      D.rr(ctx, 130, 470, 700, 70, 0); ctx.fillStyle = '#2f5f8a'; ctx.fill();
      for (let i = 0; i < 10; i++) D.line(ctx, 150 + ((i * 80 + this.t * 60) % 680), 490 + (i % 3) * 14, 170 + ((i * 80 + this.t * 60) % 680), 490 + (i % 3) * 14, 'rgba(255,255,255,0.4)', 2);
      // grass on top of both rims
      D.rr(ctx, -10, 292, 142, 14, 6); ctx.fillStyle = '#7cc46a'; ctx.fill(); stroke(ctx, 2.5);
      D.rr(ctx, 828, 292, 142, 14, 6); ctx.fillStyle = '#7cc46a'; ctx.fill(); stroke(ctx, 2.5);
      // updrafts from the Whirligigs below
      for (const d of this.drafts) {
        const dx = 130 + d * 700;
        ctx.save(); ctx.globalAlpha = 0.35;
        for (let i = 0; i < 6; i++) { const yy = 460 - ((this.t * 160 + i * 60) % 360); ctx.beginPath(); ctx.ellipse(dx + Math.sin(yy * 0.04) * 8, yy, 22, 6, 0, 0, TAU); stroke(ctx, 2, '#ffffff'); }
        ctx.restore();
        CH.whirl(ctx, dx, 470, { s: 1.1, seed: Math.round(d * 10), mood: 'happy' });
      }
      // geese
      for (const gs of this.geese) {
        const fl = Math.sin(this.t * 12 + gs.y) * 6;
        D.egg(ctx, gs.x, gs.y, 14, 7, '#f6f2ea', { lw: 1.6 });
        D.poly(ctx, [gs.x - 2, gs.y - 2, gs.x + 10, gs.y - 12 - fl, gs.x + 8, gs.y], '#e2dcd2', C.ink, 1.4);
        D.circle(ctx, gs.x - 14, gs.y - 4, 5, '#f6f2ea', C.ink, 1.4);
        D.poly(ctx, [gs.x - 19, gs.y - 4, gs.x - 25, gs.y - 2, gs.x - 19, gs.y - 1], '#f0a03a', C.ink, 1);
        D.circle(ctx, gs.x - 15, gs.y - 5, 1, C.ink);
      }
      // Sam and Corry on the near rim, holding the line
      D.char(ctx, 'sam', 70, 296, { s: 1.1, dir: 'right', mood: 'happy' });
      D.char(ctx, 'corry', 30, 296, { s: 1.0, dir: 'right', mood: this.stun > 0 ? 'shock' : 'happy' });
      const x = this.sx();
      ctx.beginPath(); ctx.moveTo(84, 262); ctx.quadraticCurveTo((84 + x) / 2, Math.max(262, this.y) + 50, x - 8, this.y + 6); stroke(ctx, 1.5, '#fffaf0');
      // Pip
      ctx.save(); ctx.translate(x, this.y); ctx.rotate(this.spin * TAU * 1.5 + U.clamp(this.vy / 400, -0.4, 0.4));
      D.char(ctx, 'pip', 0, 24, { s: 1.6, dir: 'right', noShadow: true, still: true });
      ctx.restore();
      this.parts.draw(ctx);
      // progress and how to play
      const mx = W / 2;
      D.rr(ctx, mx - 220, 18, 440, 18, 8); ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 2);
      D.rr(ctx, mx - 218, 20, 436 * this.p, 14, 6); ctx.fillStyle = '#ff9ec7'; ctx.fill();
      D.text(ctx, this.done ? 'Across!' : 'Across the gorge', mx, 54, { size: 14, weight: 700, align: 'center', color: '#3d2412' });
      if (!this.done) D.text(ctx, 'Hold Z / Space / click to climb, let go to glide. Ride the updrafts, dodge the geese!', mx, H - 16, { size: 15, weight: 700, align: 'center', color: '#fffaf0', outline: C.ink, ow: 4 });
      if (this.msgT > 0) D.text(ctx, this.msg, mx, 110, { size: 28, weight: 700, align: 'center', color: '#fffaf0', outline: C.ink, ow: 5 });
    }
  }
  function startKite() {
    const sc = new KiteScene();
    CK.flaps(() => CK.Scenes.push(sc), { label: 'Fly, Pip!' });
    return sc;
  }
  CK.KiteScene = KiteScene;

  // ================================================================ PUZZLE: THE LONG BRIDGE
  // A suspension bridge in four choices. Taller towers let the cables sag more, and more sag
  // means less pull in the cables and on the anchors (cable pull ~ load x span / (8 x sag)).
  // A floppy deck twists in the wind, like the Tacoma Narrows Bridge in 1940.
  const CHOICES = [
    { id: 'tower', label: 'Towers', opts: [{ name: 'Short', cost: 1, sag: 1 / 16 }, { name: 'Medium', cost: 3, sag: 1 / 10 }, { name: 'Tall', cost: 6, sag: 1 / 6 }] },
    { id: 'cable', label: 'Main cables', opts: [{ name: 'Kite string', cost: 1, cap: 30 }, { name: 'Yarn', cost: 2, cap: 60 }, { name: 'Rope', cost: 3, cap: 90 }, { name: 'Braided shoelaces', cost: 5, cap: 140 }] },
    { id: 'anchor', label: 'Anchors', opts: [{ name: 'Tie to trees', cost: 1, cap: 60 }, { name: 'Concrete blocks', cost: 2, cap: 100 }, { name: 'Rock anchors', cost: 3, cap: 160 }] },
    { id: 'deck', label: 'Deck', opts: [{ name: 'Flat card', cost: 1, stiff: 1 }, { name: 'Corrugated', cost: 2, stiff: 2 }, { name: 'Truss-stiffened', cost: 4, stiff: 4 }] },
  ];
  const LOAD = 60;
  CK.PuzzleDefs.long_bridge = {
    type: 'span', title: 'The Long Bridge', budget: 11,
    brief: 'The whole Kingdom will cross tonight. Pick towers, cables, anchors and a deck. The cables must hold the pull, the anchors must hold the cables, and the deck must not twist in the wind. Budget: 11 scraps.',
    hint: 'Taller towers let the cables sag more, and more sag means much less pull (pull = load x span / 8 x sag). So tall towers can use thin cables, and short towers need very strong ones. Whatever you choose, a flat card deck will twist in the wind. There is more than one right answer!',
    lesson: 'Suspension bridges trade tower height against cable strength: more sag, less pull. And since 1940, when the Tacoma Narrows Bridge twisted itself apart in a steady wind, every long bridge gets a stiff deck.',
    solution: [1, 2, 1, 1],
  };
  class SpanPuzzle extends CK.Puzzle.PuzzleBase {
    constructor(def) {
      super(def);
      this.pick = [0, 0, 0, 0];
      this.row = 0;
      this.anim = 0;
    }
    opt(i) { return CHOICES[i].opts[this.pick[i]]; }
    spent() { return this.pick.reduce((a, k, i) => a + CHOICES[i].opts[k].cost, 0); }
    evaluate() {
      const r = this.opt(0).sag;
      const anchorPull = Math.round(LOAD / (8 * r));
      const cablePull = Math.round((LOAD / (8 * r)) * Math.sqrt(1 + 16 * r * r));
      const cableOk = cablePull <= this.opt(1).cap;
      const anchorOk = anchorPull <= this.opt(2).cap;
      const deckOk = this.opt(3).stiff >= 2;
      return { cablePull, anchorPull, cableOk, anchorOk, deckOk, ok: cableOk && anchorOk && deckOk };
    }
    clear() { this.pick = [0, 0, 0, 0]; }
    applySolution() { this.pick = this.def.solution.slice(); }
    validate() { return this.spent() > this.def.budget ? `Over budget! ${this.spent()} / ${this.def.budget} scraps.` : null; }
    startTest() { this.state = 'test'; this.anim = 0; this.res = this.evaluate(); CK.Audio.sfx('build'); }
    resetTest() { this.res = null; }
    chipRect(i, j) { return [700 + j * 0, 0, 0, 0]; }
    update(dt) {
      if (this.commonUpdate(dt)) { if (this.state === 'test') this.updateTest(dt); return; }
      if (Input.hit('up')) { this.row = (this.row + 3) % 4; CK.Audio.sfx('blip'); }
      if (Input.hit('down')) { this.row = (this.row + 1) % 4; CK.Audio.sfx('blip'); }
      const n = CHOICES[this.row].opts.length;
      if (Input.hit('left')) { this.pick[this.row] = (this.pick[this.row] + n - 1) % n; CK.Audio.sfx('build'); }
      if (Input.hit('right') || Input.hit('ok')) { this.pick[this.row] = (this.pick[this.row] + 1) % n; CK.Audio.sfx('build'); }
      if (Input.mouse.pressed || Input.mouse.moved) {
        CHOICES.forEach((c, i) => c.opts.forEach((o, j) => {
          const [x, y, w, h] = this.optRect(i, j);
          if (D.inRect(Input.mouse.x, Input.mouse.y, x, y, w, h)) { this.row = i; if (Input.mouse.pressed) { this.pick[i] = j; CK.Audio.sfx('build'); } }
        }));
      }
    }
    optRect(i, j) { const n = CHOICES[i].opts.length, w = (620 - (n - 1) * 8) / n; return [30 + j * (w + 8), 346 + i * 42, w, 34]; }
    updateTest(dt) {
      this.anim += dt;
      if (this.anim > 3.4 || CK.autoSkip) {
        const r = this.res;
        if (r.ok) {
          this.finish(true, 'The Long Bridge holds!', `Cable pull ${r.cablePull} (cable holds ${this.opt(1).cap}), anchor pull ${r.anchorPull} (anchors hold ${this.opt(2).cap}), and the deck stays steady in the wind. ${this.def.lesson}`);
        } else if (!r.cableOk) {
          this.finish(false, 'The cable snapped!', `The cables have to pull with ${r.cablePull}, but ${this.opt(1).name.toLowerCase()} only holds ${this.opt(1).cap}. Use stronger cables, or taller towers so the cables can sag more and pull less.`);
        } else if (!r.anchorOk) {
          this.finish(false, 'The anchors pulled loose!', `The cables pull the anchors toward the gorge with ${r.anchorPull}, but ${this.opt(2).name.toLowerCase()} only hold ${this.opt(2).cap}. Stronger anchors, or more sag.`);
        } else {
          this.finish(false, 'The deck is twisting in the wind!', 'A flat card deck is too floppy. In a steady breeze it starts to twist, more and more, just like the Tacoma Narrows Bridge did in 1940. Try a stiffer deck.');
        }
      }
    }
    draw(ctx) {
      this.drawFrame(ctx);
      const ev = this.evaluate();
      const res = this.state !== 'build' ? this.res : null;
      const k = res ? Math.min(1, this.anim / 3) : 0;
      // the gorge, side on
      const L = 120, R = 560, deck = 250;
      ctx.fillStyle = '#24486a'; ctx.fillRect(30, 90, 620, 250);
      ctx.fillStyle = '#3a5f84'; ctx.fillRect(30, 90, L - 30, 250); ctx.fillRect(R, 90, 650 - R, 250);
      ctx.beginPath(); ctx.moveTo(L, deck + 6); ctx.lineTo(L + 40, 340); ctx.lineTo(R - 40, 340); ctx.lineTo(R, deck + 6); ctx.closePath(); ctx.fillStyle = '#1a3450'; ctx.fill(); stroke(ctx, 2, '#9fd3ff');
      D.line(ctx, L + 50, 330, R - 50, 330, '#5aa9e6', 6);
      D.line(ctx, 30, deck + 6, L, deck + 6, '#9fd3ff', 2); D.line(ctx, R, deck + 6, 650, deck + 6, '#9fd3ff', 2);
      const sag = this.opt(0).sag, th = 50 + sag * 600;
      const top = deck - th;
      const snapped = res && !res.cableOk && k > 0.45;
      const pulled = res && !res.anchorOk && k > 0.45;
      const twist = res && !res.deckOk ? Math.sin(this.anim * 7) * Math.min(1, k * 1.6) * 22 : 0;
      const sagPx = sag * (R - L) * 1.0 + 12;
      const low = Math.min(deck - 6, top + sagPx + 40);
      // anchors
      for (const [ax, kk] of [[60, -1], [620, 1]]) {
        const slide = pulled ? kk * -Math.min(30, (k - 0.45) * 80) : 0;
        D.rr(ctx, ax - 16 + slide, deck - 14, 32, 20, 3); ctx.fillStyle = 'rgba(159,211,255,0.25)'; ctx.fill(); stroke(ctx, 2, '#cfe6ff');
        ctx.beginPath(); ctx.moveTo(ax + slide, deck - 6); ctx.lineTo(kk < 0 ? L : R, top); stroke(ctx, 2.5, snapped ? 'rgba(255,255,255,0.3)' : '#ffffff');
      }
      // towers
      for (const X of [L, R]) { D.rr(ctx, X - 7, top, 14, deck + 70 - top, 2); ctx.fillStyle = 'rgba(159,211,255,0.2)'; ctx.fill(); stroke(ctx, 2.5, '#ffffff'); }
      // main cable and hangers
      if (!snapped) {
        ctx.beginPath();
        for (let i = 0; i <= 30; i++) { const t = i / 30, X = L + (R - L) * t, Y = top + (low - top) * (1 - (2 * t - 1) ** 2); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
        stroke(ctx, 3, res && res.ok ? '#bff5d6' : '#ffffff');
        for (let i = 1; i < 14; i++) { const t = i / 14, X = L + (R - L) * t, Y = top + (low - top) * (1 - (2 * t - 1) ** 2); D.line(ctx, X, Y, X, deck + Math.sin(t * Math.PI) * twist * (i % 2 ? 1 : -1) * 0.5, 'rgba(255,255,255,0.6)', 1.2); }
      } else {
        for (const [X, kk] of [[L, 1], [R, -1]]) { ctx.beginPath(); ctx.moveTo(X, top); ctx.quadraticCurveTo(X + kk * 40, top + 120, X + kk * 20, top + 180); stroke(ctx, 3, '#ff9a9a'); }
      }
      // the deck
      ctx.beginPath();
      for (let i = 0; i <= 30; i++) {
        const t = i / 30, X = L + (R - L) * t;
        const droop = snapped ? Math.sin(t * Math.PI) * Math.min(80, (k - 0.45) * 200) : 0;
        const Y = deck + droop + Math.sin(t * Math.PI * 2) * twist;
        if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
      }
      stroke(ctx, 7, this.opt(3).stiff >= 4 ? '#ffd25a' : this.opt(3).stiff >= 2 ? '#e8c89a' : '#cfc0a8');
      if (this.opt(3).stiff >= 4) for (let i = 0; i < 18; i++) { const X = L + 10 + i * 24; D.line(ctx, X, deck + 4, X + 12, deck + 16, '#ffd25a', 1.5); D.line(ctx, X + 12, deck + 16, X + 24, deck + 4, '#ffd25a', 1.5); }
      // the test load: the whole Kingdom, walking across
      if (res) {
        const n = 6;
        for (let i = 0; i < n; i++) {
          const t = U.clamp(k * 1.4 - i * 0.07, 0, 1), X = L - 30 + (R - L + 60) * t;
          if (t <= 0 || t >= 1) continue;
          const tt = (X - L) / (R - L);
          const Y = deck - 4 + (tt > 0 && tt < 1 ? Math.sin(tt * Math.PI * 2) * twist + (snapped ? Math.sin(tt * Math.PI) * Math.min(80, (k - 0.45) * 200) : 0) : 0);
          D.char(ctx, ['mayor', 'bess', 'puffin', 'walrus', 'queen', 'heron'][i], X, Y, { s: 0.45, dir: 'right', mood: res.ok ? 'happy' : 'shock', walk: this.t * 10, noShadow: true });
        }
      }
      D.text(ctx, `Cable pull ${ev.cablePull}`, (L + R) / 2, top - 12, { size: 13, weight: 700, align: 'center', color: ev.cableOk ? '#bff5d6' : '#ffb3b3' });
      D.text(ctx, `tower height: ${this.opt(0).name.toLowerCase()} (sag ${['1/16', '1/10', '1/6'][this.pick[0]]} of the span)`, (L + R) / 2, 326, { size: 12, align: 'center', color: '#9fd3ff' });
      // the choices
      CHOICES.forEach((c, i) => {
        c.opts.forEach((o, j) => {
          const [x, y, w, h] = this.optRect(i, j), sel = this.pick[i] === j, cur = this.row === i && this.state === 'build';
          D.rr(ctx, x, y, w, h, 8); ctx.fillStyle = sel ? '#fff0b8' : 'rgba(255,250,240,0.85)'; ctx.fill(); stroke(ctx, sel ? 3 : 1.5, cur && sel ? '#ef6b6b' : C.ink);
          D.text(ctx, (j === 0 ? c.label + ': ' : '') + o.name, x + w / 2, y + 16, { size: j === 0 ? 12 : 13, weight: 700, align: 'center', color: '#3d2412' });
          const stat = o.sag ? `cost ${o.cost}` : o.cap ? `holds ${o.cap} · cost ${o.cost}` : `stiffness ${o.stiff} · cost ${o.cost}`;
          D.text(ctx, stat, x + w / 2, y + 30, { size: 10.5, align: 'center', color: '#7a5434' });
        });
      });
      this.drawPanel(ctx, (ctx, px, y, pw) => {
        const sp = this.spent();
        D.text(ctx, `Budget: ${sp} / ${this.def.budget} scraps`, px + 16, y + 4, { size: 15, weight: 700, color: sp > this.def.budget ? '#c2410c' : '#3d2412' });
        const bar = (label, v, cap, yy, ok) => {
          D.text(ctx, `${label}: ${v} / ${cap}`, px + 16, yy, { size: 12.5, weight: 700, color: ok ? '#2f6a2f' : '#c2410c' });
          D.rr(ctx, px + 16, yy + 6, pw - 32, 9, 4); ctx.fillStyle = '#eadcc4'; ctx.fill();
          D.rr(ctx, px + 16, yy + 6, (pw - 32) * Math.min(1, v / cap), 9, 4); ctx.fillStyle = ok ? '#9ad07a' : '#ef6b6b'; ctx.fill();
        };
        bar('Cable pull vs strength', ev.cablePull, this.opt(1).cap, y + 30, ev.cableOk);
        bar('Anchor pull vs hold', ev.anchorPull, this.opt(2).cap, y + 62, ev.anchorOk);
        D.text(ctx, `Deck in the wind: ${ev.deckOk ? 'steady' : 'will twist!'}`, px + 16, y + 96, { size: 12.5, weight: 700, color: ev.deckOk ? '#2f6a2f' : '#c2410c' });
      });
      D.text(ctx, 'Click a choice (or Up/Down + Left/Right). Then Test it!', 30, H - 14, { size: 13, color: '#cfe6ff' });
      this.drawOverlay(ctx);
    }
  }
  CK.PuzzleTypes.span = SpanPuzzle;

  // ================================================================ THE WHOLE KINGDOM BUILDS IT
  const RAISE = [
    [0, "Captain Bess's crew hauls the towers upright. HEAVE!"],
    [2.6, 'The Whirligigs blow the cable across, strand by strand.'],
    [5.2, 'The Moth-kin carry the deck panels out, one by one.'],
    [8.2, "Old Tin's Shellbacks bolt down the anchors. Inspector Rook stamps everything. Twice."],
    [10.6, 'The Long Bridge is open!'],
  ];
  class RaiseScene {
    constructor() { this.t = 0; this.finished = false; this.parts = new CK.Particles(); }
    update(dt) {
      this.t += dt; this.parts.update(dt);
      if (CK.autoSkip) this.t = 14;
      if ((Input.hit('ok') || Input.mouse.pressed) && this.t > 1 && this.t < 10.6) this.t = 10.6;
      if (this.t > 10.6 && !this.cheer) { this.cheer = true; CK.Audio.sfx('win'); this.parts.burst(70, () => ({ x: U.rand(150, 810), y: -10, vx: U.rand(-60, 60), vy: U.rand(80, 220), sway: 30, life: 3, size: U.rand(4, 7), shape: 'square', color: U.pick(['#ef6b6b', '#ffd25a', '#6cc56c', '#5aa9e6', '#ff9ec7']), spin: 5 })); }
      if (this.t > 13.5 && !this.closing) { this.closing = true; CK.flaps(() => { this.finished = true; CK.Scenes.remove(this); }); }
    }
    draw(ctx) {
      const t = this.t;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#ffcf9a'); g.addColorStop(0.6, '#ffe8c8'); g.addColorStop(1, '#f6e0c0');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const L = 170, R = 790, deck = 330, top = 130;
      // gorge
      ctx.fillStyle = '#7a5a46'; ctx.fillRect(0, deck + 10, W, H);
      ctx.beginPath(); ctx.moveTo(L - 20, deck + 10); ctx.lineTo(L + 40, H); ctx.lineTo(R - 40, H); ctx.lineTo(R + 20, deck + 10); ctx.closePath(); ctx.fillStyle = '#2e2438'; ctx.fill(); stroke(ctx, 3);
      D.rr(ctx, -10, deck, L + 10, 16, 6); ctx.fillStyle = '#7cc46a'; ctx.fill(); stroke(ctx, 2.5);
      D.rr(ctx, R, deck, W - R + 10, 16, 6); ctx.fillStyle = '#7cc46a'; ctx.fill(); stroke(ctx, 2.5);
      // towers rise
      const tk = U.clamp(t / 2.4, 0, 1), tt = deck - (deck - top) * tk;
      for (const X of [L, R]) { D.box3(ctx, X - 12, tt, 24, deck - tt + 10, 8, { r: 2, lw: 2.5, fill: '#d9a66b', flute: false }); D.box3(ctx, X - 15, tt - 12, 30, 14, 8, { r: 3, lw: 2.5, fill: '#ef6b6b', flute: false }); }
      // cable spun across
      const ck = U.clamp((t - 2.6) / 2.4, 0, 1);
      if (ck > 0) {
        ctx.beginPath();
        for (let i = 0; i <= 40 * ck; i++) { const k = i / 40, X = L + (R - L) * k, Y = top + (deck - 40 - top) * (1 - (2 * k - 1) ** 2); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
        stroke(ctx, 5, '#a0461e');
        const hx = L + (R - L) * ck, hy = top + (deck - 40 - top) * (1 - (2 * ck - 1) ** 2);
        if (ck < 1) for (let i = 0; i < 3; i++) CH.whirl(ctx, hx - 20 + i * 22, hy + 40 + Math.sin(t * 4 + i) * 6, { s: 0.8, seed: i, mood: 'happy' });
      }
      // deck panels carried out by Moth-kin
      const dk = U.clamp((t - 5.2) / 2.8, 0, 1);
      const nP = Math.floor(dk * 16);
      for (let i = 0; i < nP; i++) {
        const fromL = i % 2 === 0, idx = Math.floor(i / 2), X = fromL ? L + idx * 39 : R - 39 - idx * 39;
        D.box3(ctx, X, deck - 10, 39, 12, 6, { r: 1, lw: 2, fill: '#d9a66b', flute: false });
        const k = (X + 19 - L) / (R - L), cy = top + (deck - 40 - top) * (1 - (2 * k - 1) ** 2);
        if (ck >= 1) D.line(ctx, X + 19, cy, X + 19, deck - 10, 'rgba(90,58,34,0.8)', 1.5);
      }
      if (dk > 0 && dk < 1) for (let i = 0; i < 2; i++) { const X = L + (R - L) * ((dk + i * 0.5) % 1); CH.moth(ctx, X, 230 + Math.sin(t * 5 + i) * 10, { s: 0.7, mood: 'happy', seed: i }); D.box3(ctx, X - 16, 246 + Math.sin(t * 5 + i) * 10, 32, 8, 4, { r: 1, lw: 1.5, fill: '#d9a66b', flute: false }); }
      // anchors and the inspector
      if (t > 8.2) {
        for (const [X, k] of [[L - 90, -1], [R + 90, 1]]) { D.box3(ctx, X - 18, deck - 18, 36, 20, 8, { r: 2, lw: 2, fill: '#a9aeb6', flute: false }); ctx.beginPath(); ctx.moveTo(X, deck - 18); ctx.lineTo(k < 0 ? L : R, top); stroke(ctx, 4, '#a0461e'); }
        CH.crab(ctx, L - 60, deck + 2, { s: 0.9, seed: 1, mood: 'happy' }); CH.crab(ctx, R + 60, deck + 2, { s: 0.9, seed: 2, mood: 'happy' });
        D.char(ctx, 'rook', L - 130, deck + 4, { s: 0.8, dir: 'right', mood: 'happy' });
        if (Math.floor(t * 2) % 2) D.text(ctx, 'APPROVED', L - 130, deck - 70, { size: 16, weight: 700, align: 'center', color: '#c2410c', outline: '#fff', ow: 3 });
      }
      // everyone crosses
      if (t > 10.6) {
        const crowd = ['mayor', 'bess', 'puffin', 'walrus', 'queen', 'heron', 'skipper', 'jules', 'sam', 'corry'];
        crowd.forEach((c, i) => { const X = L - 60 + (((t - 10.6) * 90 + i * 70) % (R - L + 120)); D.char(ctx, c, X, deck - 8, { s: 0.6, dir: 'right', mood: 'happy', walk: t * 10 }); });
      } else {
        D.char(ctx, 'bess', R + 120, deck + 4, { s: 0.8, dir: 'left', mood: 'happy', walk: t < 2.6 ? t * 8 : 0 });
        D.char(ctx, 'sam', L - 60, deck + 4, { s: 0.9, dir: 'right', mood: 'happy' });
        D.char(ctx, 'jules', L - 100, deck + 4, { s: 0.9, dir: 'right', mood: 'happy' });
      }
      this.parts.draw(ctx);
      let cap = RAISE[0][1];
      for (const [at, s] of RAISE) if (t >= at) cap = s;
      D.panel(ctx, 120, 30, W - 240, 60, { fill: '#fff4dc', tape: false });
      D.text(ctx, cap, W / 2, 68, { size: 20, weight: 700, align: 'center', color: '#3d2412' });
      if (t < 10.6) D.text(ctx, 'Z / click to skip', W - 20, H - 14, { size: 12, align: 'right', color: '#fffaf0', outline: C.ink, ow: 3 });
    }
  }
  function startRaise() {
    const sc = new RaiseScene();
    CK.flaps(() => CK.Scenes.push(sc), { label: 'Everybody, build!' });
    return sc;
  }
  CK.RaiseScene = RaiseScene;

  // ================================================================ THE FAIR, AT NIGHT
  class FairScene {
    constructor() {
      this.t = 0; this.alwaysUpdate = true; this.soft = false; this.softT = 0;
      this.stars = [];
      for (let i = 0; i < 90; i++) this.stars.push({ x: U.hash(i, 51) * W, y: U.hash(i, 52) * 230, r: 0.8 + U.hash(i, 53) * 1.6, p: U.hash(i, 54) * 6 });
    }
    update(dt) { this.t += dt; if (this.soft) this.softT += dt; }
    draw(ctx) {
      const t = this.t;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#141a44'); g.addColorStop(0.6, '#3a3066'); g.addColorStop(1, '#4a3050');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (const s of this.stars) { const tw = 0.5 + Math.sin(t * 2 + s.p) * 0.5; D.circle(ctx, s.x, s.y, s.r * (0.7 + tw * 0.5), `rgba(255,248,220,${0.35 + tw * 0.6})`); }
      // the paper moon, and the Keeper's light far off
      const mg = ctx.createRadialGradient(780, 80, 8, 780, 80, 90); mg.addColorStop(0, 'rgba(255,240,190,0.35)'); mg.addColorStop(1, 'rgba(255,240,190,0)');
      ctx.fillStyle = mg; ctx.fillRect(690, -10, 180, 180);
      D.ball(ctx, 780, 80, 28, '#fff4d0', { lw: 2.5 });
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.ellipse(780, 80, Math.abs(i) * 9 + 3, 28, 0, 0, TAU); ctx.strokeStyle = 'rgba(160,120,60,0.35)'; ctx.lineWidth = 1; ctx.stroke(); }
      const beam = (t % 9) < 1.2;
      D.line(ctx, 30, 250, 30, 228, '#f6f2ea', 4); D.circle(ctx, 30, 226, 3, beam ? '#fff3b0' : '#c9b98a');
      if (beam) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const bg = ctx.createRadialGradient(30, 226, 2, 30, 226, 260); bg.addColorStop(0, 'rgba(255,240,170,0.45)'); bg.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(30, 226); ctx.lineTo(300, 160); ctx.lineTo(300, 200); ctx.closePath(); ctx.fill(); ctx.restore(); }
      // hills and the gorge
      ctx.beginPath(); ctx.moveTo(0, 260); ctx.quadraticCurveTo(240, 220, 480, 255); ctx.quadraticCurveTo(720, 230, W, 250); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fillStyle = '#2a3a3a'; ctx.fill();
      ctx.fillStyle = '#3a4a3a'; ctx.fillRect(0, 330, W, H - 330);
      ctx.beginPath(); ctx.moveTo(250, 330); ctx.lineTo(320, H); ctx.lineTo(640, H); ctx.lineTo(710, 330); ctx.closePath(); ctx.fillStyle = '#181428'; ctx.fill(); stroke(ctx, 3);
      // the Long Bridge, glowing
      const L = 230, R = 730, deck = 322, top = 180;
      for (const X of [L, R]) { D.box3(ctx, X - 10, top, 20, deck - top + 10, 6, { r: 2, lw: 2.5, fill: '#b8875a', flute: false }); D.circle(ctx, X, top - 8, 5, '#fff3b0', C.ink, 1.5); }
      ctx.beginPath(); for (let i = 0; i <= 30; i++) { const k = i / 30, X = L + (R - L) * k, Y = top + (deck - 30 - top) * (1 - (2 * k - 1) ** 2); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); } stroke(ctx, 4, '#a0461e');
      for (let i = 1; i < 12; i++) { const k = i / 12, X = L + (R - L) * k, Y = top + (deck - 30 - top) * (1 - (2 * k - 1) ** 2); D.line(ctx, X, Y, X, deck, 'rgba(160,100,60,0.8)', 1.3); }
      D.box3(ctx, L - 20, deck, R - L + 40, 10, 6, { r: 2, lw: 2, fill: '#d9a66b', flute: false });
      for (let i = 0; i < 10; i++) { const X = L + 25 + i * 50; const lg = ctx.createRadialGradient(X, deck, 1, X, deck + 4, 30); lg.addColorStop(0, 'rgba(255,225,140,0.7)'); lg.addColorStop(1, 'rgba(255,225,140,0)'); ctx.fillStyle = lg; ctx.fillRect(X - 30, deck - 20, 60, 50); D.poly(ctx, [X - 5, deck - 14, X + 5, deck - 14, X + 3, deck - 20, X - 3, deck - 20], '#5a3a22'); }
      // people crossing
      const crowd = ['mayor', 'bess', 'puffin', 'walrus', 'heron', 'skipper', 'moth', 'rook'];
      crowd.forEach((c, i) => { const X = L + ((t * 26 + i * 64) % (R - L)); D.char(ctx, c, X, deck - 2, { s: 0.42, dir: i % 2 ? 'left' : 'right', mood: 'happy', walk: t * 8, noShadow: true }); });
      // the Ferris wheel and tents on the far side
      const cx = 860, cy = 200;
      ctx.beginPath(); ctx.arc(cx, cy, 80, 0, TAU); stroke(ctx, 5, '#d9a66b');
      for (let i = 0; i < 8; i++) { const a = t * 0.3 + (i * TAU) / 8, px = cx + Math.cos(a) * 80, py = cy + Math.sin(a) * 80; D.line(ctx, cx, cy, px, py, '#b8875a', 2); D.circle(ctx, px, py + 6, 6, ['#ef6b6b', '#ffd25a', '#5aa9e6', '#6cc56c'][i % 4], C.ink, 1.5); D.circle(ctx, px, py + 6, 2, '#fff3b0'); }
      for (const [x, col] of [[770, '#ef6b6b'], [930, '#5aa9e6']]) D.poly(ctx, [x - 36, 330, x, 280, x + 36, 330], col, C.ink, 2.5);
      // fireflies
      for (let i = 0; i < 24; i++) { const fx = (U.hash(i, 61) * W + Math.sin(t + i) * 20) % W, fy = 260 + U.hash(i, 62) * 120 + Math.sin(t * 1.3 + i) * 10; D.circle(ctx, fx, fy, 2, `rgba(255,240,150,${0.4 + Math.sin(t * 3 + i) * 0.4})`); }
      // the near rim, where everyone stands to watch
      ctx.beginPath(); ctx.moveTo(0, 384); ctx.quadraticCurveTo(480, 366, W, 384); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fillStyle = '#34503a'; ctx.fill(); stroke(ctx, 3);
      ctx.fillStyle = '#2a4230'; ctx.fillRect(0, 430, W, H - 430);
      for (let i = 0; i < 40; i++) { const gx = U.hash(i, 71) * W, gy = 392 + U.hash(i, 72) * 130; D.line(ctx, gx, gy, gx - 3, gy - 7, '#4f7a52', 2); D.line(ctx, gx, gy, gx + 3, gy - 6, '#4f7a52', 2); }
      for (const lx of [60, 640, 900]) { const lg = ctx.createRadialGradient(lx, 420, 2, lx, 420, 70); lg.addColorStop(0, 'rgba(255,225,140,0.5)'); lg.addColorStop(1, 'rgba(255,225,140,0)'); ctx.fillStyle = lg; ctx.fillRect(lx - 70, 350, 140, 140); D.line(ctx, lx, 420, lx, 380, '#5a3a22', 3); D.poly(ctx, [lx - 7, 380, lx + 7, 380, lx + 4, 370, lx - 4, 370], '#ffd25a', C.ink, 1.5); }
      // the friends in front
      const front = [['jules', 120, 1], ['corry', 330, 1], ['pip', 380, 1.1], ['queen', 470, 0.9]];
      for (const [k, x, s] of front) D.char(ctx, k, x, 400, { s, dir: 'right', mood: 'happy' });
      CH.grumble(ctx, 560, 396, { s: 0.9, mood: 'happy' });
      // Sam, going soft at the edges
      ctx.save();
      if (this.soft) ctx.globalAlpha = 0.55 + Math.sin(this.softT * 5) * 0.25;
      D.char(ctx, 'sam', 200, 400, { s: 1.1, dir: 'right', mood: this.soft ? 'sad' : 'happy' });
      ctx.restore();
      if (this.soft) for (let i = 0; i < 6; i++) { const p = (this.softT * 0.6 + i / 6) % 1; D.circle(ctx, 200 + Math.sin(i * 3) * 14, 380 - p * 80, 2.4 * (1 - p), `rgba(159,214,255,${1 - p})`); }
    }
  }
  CK.FairScene = FairScene;

  // ================================================================ HOME: THE OLD BOX GOES SOFT
  class RainBox {
    constructor() { this.t = 0; this.alwaysUpdate = true; this.flat = false; this.flatT = 0; this.jules = false; }
    update(dt) { this.t += dt; if (this.flat) this.flatT += dt; }
    draw(ctx) {
      const t = this.t;
      ctx.fillStyle = '#2a3040'; ctx.fillRect(0, 0, W, H);
      // the recycling center wall, a streetlight, wet pavement
      D.box3(ctx, 80, 90, 520, 260, 30, { r: 2, lw: 3, fill: '#5a6070', flute: false });
      D.cardboard(ctx, 200, 120, 280, 40, { r: 4, lw: 2.5, fill: '#3e6a5a', flute: false });
      D.text(ctx, 'RECYCLING CENTER', 340, 148, { size: 20, weight: 700, align: 'center', color: '#e8f2ea' });
      ctx.fillStyle = '#3a4252'; ctx.fillRect(0, 350, W, H - 350);
      D.line(ctx, 760, 350, 760, 110, '#2a2a33', 8);
      const lg = ctx.createRadialGradient(760, 120, 4, 760, 300, 260); lg.addColorStop(0, 'rgba(255,220,150,0.5)'); lg.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = lg; ctx.fillRect(500, 100, 460, 440);
      D.ball(ctx, 760, 112, 12, '#fff3b0', { lw: 2 });
      for (let i = 0; i < 6; i++) D.ellipse(ctx, 120 + i * 150, 440 + (i % 2) * 40, 60, 10, 'rgba(160,190,230,0.18)');
      // the old box: standing, then slumping flat into the wet
      const k = this.flat ? Math.min(1, this.flatT * 1.2) : 0;
      const bh = 150 * (1 - k * 0.85), bx = 560, by = 400;
      D.box3(ctx, bx - 80 - k * 30, by - bh, 160 + k * 60, bh, 26 * (1 - k * 0.6), { r: 3, lw: 3, fill: k > 0.5 ? '#8a6a4a' : '#a07850', flute: false });
      if (k < 0.5) D.text(ctx, "SAM'S", bx, by - bh / 2, { size: 22, weight: 700, align: 'center', color: '#5a3a22' });
      for (let i = 0; i < 4; i++) D.egg(ctx, bx - 60 + i * 40, by - bh + 10 + (i % 2) * 20, 10, 16, 'rgba(60,40,30,0.35)', { lw: 0 });
      // Sam, sitting in the rain; Jules with the Parasol
      D.char(ctx, 'sam', 420, 410, { s: 1.4, dir: 'right', mood: 'sad' });
      if (this.jules) D.char(ctx, 'jules', 300, 410, { s: 1.4, dir: 'right', mood: 'sad', costume: 'umbrella' });
      // rain
      ctx.strokeStyle = 'rgba(190,210,240,0.45)'; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let i = 0; i < 120; i++) { const x = (U.hash(i, 71) * W + t * 60) % W, y = (U.hash(i, 72) * H + t * 520) % H; ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 16); }
      ctx.stroke();
    }
  }
  CK.RainBox = RainBox;

  // ================================================================ BUILD A NEW BOX
  // Five steps, one press each. In co-op, the two of you take turns.
  const FOLD = ['Fold the bottom flaps', 'Tape the bottom (lots of tape)', 'Stand it up', 'Draw on it: fish and bridges', 'Open the top flaps'];
  class FoldScene {
    constructor() { this.t = 0; this.step = 0; this.anim = 0; this.finished = false; this.alwaysUpdate = true; this.glow = false; this.pop = false; this.popT = 0; this.parts = new CK.Particles(); }
    turn() { return CK.coop ? this.step % 2 : 0; }
    update(dt) {
      this.t += dt; this.parts.update(dt); this.anim = Math.max(0, this.anim - dt * 2.5);
      if (this.pop) this.popT += dt;
      if (this.step >= FOLD.length) { if (!this.finished && this.anim <= 0) this.finished = true; return; }
      if (CK.Scenes.top() !== this) return;
      const who = this.turn();
      const pressed = CK.autoSkip || Input.p(who).hit('ok') || (who === 0 && Input.mouse.pressed);
      if (pressed && this.anim <= 0 && this.t > 0.5) {
        this.step++; this.anim = 1; CK.Audio.sfx(this.step === 2 ? 'build' : 'select');
        this.parts.burst(10, () => ({ x: W / 2 + U.rand(-60, 60), y: 330, vx: U.rand(-90, 90), vy: U.rand(-140, -40), g: 300, life: 0.8, size: U.rand(3, 6), shape: 'star', color: U.pick(['#ffd25a', '#ff9ec7', '#9fd3ff']) }));
      }
    }
    draw(ctx) {
      // the dorm room: two beds, a desk with the lamp left on
      ctx.fillStyle = '#e8d6b8'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#c9a77a'; ctx.fillRect(0, 380, W, H - 380);
      D.rr(ctx, 380, 60, 200, 130, 6); ctx.fillStyle = '#2a3a5a'; ctx.fill(); stroke(ctx, 4, '#8a6a4a');
      for (let i = 0; i < 30; i++) D.line(ctx, 390 + U.hash(i, 81) * 180, 70 + ((U.hash(i, 82) * 110 + this.t * 160) % 110), 388 + U.hash(i, 81) * 180, 78 + ((U.hash(i, 82) * 110 + this.t * 160) % 110), 'rgba(200,220,255,0.5)', 1.2);
      D.box3(ctx, 40, 280, 240, 70, 30, { r: 4, lw: 3, fill: '#5aa9e6', flute: false });
      D.box3(ctx, 680, 280, 240, 70, 30, { r: 4, lw: 3, fill: '#6cc56c', flute: false });
      D.box3(ctx, 690, 200, 120, 14, 20, { r: 2, lw: 2.5, fill: '#b8875a', flute: false });
      D.line(ctx, 780, 200, 790, 150, C.ink, 3); D.poly(ctx, [774, 150, 806, 150, 798, 132, 782, 132], '#ffd25a', C.ink, 2);
      const lg = ctx.createRadialGradient(790, 160, 4, 790, 200, 140); lg.addColorStop(0, 'rgba(255,230,150,0.55)'); lg.addColorStop(1, 'rgba(255,230,150,0)'); ctx.fillStyle = lg; ctx.fillRect(650, 60, 280, 280);
      // the new box, step by step
      const s = this.step, x = W / 2, y = 400;
      const pop = 1 + this.anim * 0.08;
      ctx.save(); ctx.translate(x, y); ctx.scale(pop, 1 / pop); ctx.translate(-x, -y);
      if (s < 3) {
        D.box3(ctx, x - 110, y - 30, 220, 30, 60, { r: 2, lw: 3, fill: '#c99561', flute: false });
        if (s >= 1) { D.poly(ctx, [x - 110, y - 30, x - 60, y - 70, x + 60, y - 70, x + 110, y - 30], '#d9a66b', C.ink, 2.5); }
        if (s >= 2) for (let i = 0; i < 3; i++) D.rr(ctx, x - 90 + i * 60, y - 52, 40, 10, 2), ctx.fillStyle = 'rgba(220,230,240,0.85)', ctx.fill(), stroke(ctx, 1.2);
      } else {
        const glow = this.glow ? 0.5 + Math.sin(this.t * 4) * 0.3 : 0;
        if (glow) { const gg = ctx.createRadialGradient(x, y - 90, 10, x, y - 90, 200); gg.addColorStop(0, `rgba(255,236,150,${glow})`); gg.addColorStop(1, 'rgba(255,236,150,0)'); ctx.fillStyle = gg; ctx.fillRect(x - 200, y - 290, 400, 360); }
        D.box3(ctx, x - 90, y - 150, 180, 150, 40, { r: 3, lw: 3, fill: '#c99561', flute: false });
        if (s >= 4) {
          // fish (Jules) and bridges (Sam)
          for (let i = 0; i < 3; i++) { const fx = x - 60 + i * 30, fy = y - 110 + (i % 2) * 18; D.egg(ctx, fx, fy, 9, 5, '#5aa9e6', { lw: 1.4 }); D.poly(ctx, [fx + 8, fy, fx + 14, fy - 5, fx + 14, fy + 5], '#5aa9e6', C.ink, 1.2); }
          for (let i = 0; i < 2; i++) { const bx = x + 20 + i * 36, byy = y - 60; ctx.beginPath(); ctx.arc(bx, byy, 13, Math.PI, 0); stroke(ctx, 2, '#c2410c'); D.line(ctx, bx - 16, byy - 8, bx + 16, byy - 8, '#c2410c', 2); }
        }
        if (s >= 5) for (const k of [-1, 1]) D.poly(ctx, [x + k * 90, y - 150, x + k * 120, y - 196, x + k * 20, y - 196, x, y - 150], '#d9a66b', C.ink, 2.5);
        if (this.pop) {
          const k = Math.min(1, this.popT * 2.5);
          D.char(ctx, 'corry', x - 26, y - 150 + 60 * (1 - k) + 10, { s: 1.1, mood: 'happy', noShadow: true });
          if (this.popT > 0.5) D.char(ctx, 'pip', x + 36, y - 196 - Math.min(1, (this.popT - 0.5) * 2) * 30, { s: 1.2, mood: 'happy', noShadow: true });
          if (this.popT > 1) CH.grumble(ctx, x + 120, y - 230, { s: 0.7, mood: 'happy' });
        }
      }
      ctx.restore();
      D.char(ctx, 'sam', 250, 470, { s: 1.4, dir: 'right', mood: 'happy' });
      D.char(ctx, 'jules', 710, 470, { s: 1.4, dir: 'left', mood: 'happy' });
      this.parts.draw(ctx);
      if (this.step < FOLD.length) {
        D.panel(ctx, W / 2 - 250, 20, 500, 70, { fill: '#fff4dc', tape: false });
        D.text(ctx, `Step ${this.step + 1} of ${FOLD.length}: ${FOLD[this.step]}`, W / 2, 50, { size: 20, weight: 700, align: 'center' });
        D.text(ctx, CK.coop ? `${this.turn() ? 'Player 2 (Jules)' : 'Player 1 (Sam)'}: press your action key` : 'Press Z / Space / click', W / 2, 76, { size: 14, align: 'center', color: '#7a5434' });
      }
    }
  }
  function startFold() {
    const sc = new FoldScene();
    CK.flaps(() => CK.Scenes.push((CK.LB_FOLD = sc)), { label: 'Build a new box' });
    return sc;
  }
  CK.FoldScene = FoldScene;

  // ================================================================ THE CREDITS (for real this time)
  const RULES = ['Everybody gets a home.', 'Nobody gets left out in the rain.', "Don't stop playing.", 'Leave room for the rain.', 'An arch stands because every stone leans on the next one.', 'Light the path, not the sky.', 'Work with the water, not against it.', 'Build it together, and build it again.'];
  const CAST = [
    ['sam', 'Sam', 'Concentration: water resources. Still doodles bridges on everything.'],
    ['jules', 'Jules Marsh', 'Marine biology. Has named every fish in Reyes Pond.'],
    ['corry', 'Sir Corrugate', 'Front row, as promised. Eleven stickers left (Pip gave him two).'],
    ['pip', 'Pip', 'Has now flown above the clouds. With someone holding on.'],
    ['grandma', 'Grandma Rosie', 'Still cheating at gin rummy. Still the first Builder.'],
    ['grumble', 'The Little Drizzle', 'Waters the rain gardens. Gloomy, but in a cozy way.'],
    ['queen', 'Queen Corrina', 'The Fair is every spring now.'],
    ['rook', 'Inspector Rook', 'Forty-one stamps on one bridge. A record.'],
    ['puffin', 'Keeper Gale', 'Keeps the Gull Point Light with Jules, every summer.'],
    ['walrus', 'Harbormaster Brack', 'Visits the tidepools every morning.'],
    ['heron', 'Mr. Lux', 'Sells hooded lanterns. Business is booming.'],
    ['whirl', 'The Whirligigs', 'Professional breeze. Available for kite festivals.'],
  ];
  class FinaleCredits {
    constructor() { this.t = 0; this.y = 0; }
    update(dt) {
      this.t += dt;
      const fast = Input.held('ok') || Input.mouse.down;
      this.y += dt * (fast ? 220 : 46);
      if (CK.autoSkip) this.y = 99999;
      if (this.y > this.endY() + 40 && !this.closing && (this.t > 3 || CK.autoSkip)) {
        if (!CK.autoSkip && !(Input.hit('ok') || Input.mouse.pressed) && this.y < this.endY() + 400) return;
        this.closing = true;
        CK.setFlag('finale_seen');
        CK.flaps(() => {
          CK.gotoChapter('campus', { x: 35.5 * 48, y: 20.7 * 48 });
          CK.toast('Free roam! The new box goes anywhere in the Kingdom.');
        });
      }
    }
    endY() { return 300 + RULES.length * 34 + CAST.length * 70 + 260; }
    draw(ctx) {
      ctx.fillStyle = '#1e140c'; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 60; i++) D.circle(ctx, U.hash(i, 91) * W, U.hash(i, 92) * H, 1 + U.hash(i, 93) * 1.4, `rgba(255,240,200,${0.2 + 0.3 * Math.sin(this.t + i)})`);
      let y = H - this.y + 60;
      D.text(ctx, 'CARDBOARD KINGDOM', W / 2, y, { size: 50, weight: 700, align: 'center', color: '#fffaf0', outline: C.ink, ow: 7 }); y += 50;
      D.text(ctx, 'a story about not knowing what you want yet', W / 2, y, { size: 20, align: 'center', color: '#ffe3f1' }); y += 90;
      D.text(ctx, 'THE RULES', W / 2, y, { size: 22, weight: 700, align: 'center', color: '#ffd25a' }); y += 40;
      RULES.forEach((r, i) => { D.text(ctx, `${i + 1}. ${r}`, W / 2, y, { size: 19, weight: 600, align: 'center', color: '#fffaf0' }); y += 34; });
      y += 60;
      D.text(ctx, 'WHERE ARE THEY NOW', W / 2, y, { size: 22, weight: 700, align: 'center', color: '#ffd25a' }); y += 50;
      for (const [look, name, line] of CAST) {
        if (y > -80 && y < H + 80) {
          ctx.save(); D.rr(ctx, W / 2 - 300, y - 46, 64, 64, 12); ctx.fillStyle = '#3a2a1c'; ctx.fill(); ctx.clip();
          const s = look === 'pip' ? 1.3 : look === 'grumble' ? 0.9 : look === 'whirl' ? 0.9 : look === 'walrus' || look === 'heron' ? 0.55 : 0.85;
          D.char(ctx, look, W / 2 - 268, y + (look === 'pip' ? -6 : look === 'grumble' ? -2 : 26), { s, mood: 'happy', noShadow: true, big: look === 'crab' });
          ctx.restore();
          D.text(ctx, name, W / 2 - 220, y - 16, { size: 20, weight: 700, color: '#fffaf0' });
          D.text(ctx, line, W / 2 - 220, y + 8, { size: 15, color: '#d9c3a3' });
        }
        y += 70;
      }
      y += 100;
      D.text(ctx, 'THE END', W / 2, Math.max(H / 2 - 20, y), { size: 64, weight: 700, align: 'center', color: '#fffaf0', outline: C.ink, ow: 8 });
      D.text(ctx, 'Rule 8: Build it together, and build it again.', W / 2, Math.max(H / 2 + 40, y + 60), { size: 20, weight: 700, align: 'center', color: '#ffd25a' });
      { const fg = ctx.createLinearGradient(0, H - 70, 0, H); fg.addColorStop(0, 'rgba(30,20,12,0)'); fg.addColorStop(0.55, 'rgba(30,20,12,1)'); ctx.fillStyle = fg; ctx.fillRect(0, H - 70, W, 70); }
      D.text(ctx, this.y > this.endY() ? 'Click / Z to keep exploring' : 'Hold Z / click to scroll faster', W / 2, H - 18, { size: 14, align: 'center', color: '#d9c3a3' });
    }
  }
  CK.FinaleCredits = FinaleCredits;
  CK.LB = { KiteScene, RaiseScene, FairScene, RainBox, FoldScene, FinaleCredits, SpanPuzzle };
})();
