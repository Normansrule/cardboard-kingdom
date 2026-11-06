// Cardboard Kingdom - Chapter 12: Reedwhistle Marsh, and fishing (v2.12).
//  * Fishing, Animal Crossing style: face any open water and press Z to cast. Wait for the bobber
//    to really go under (nibbles don't count), then press. Jules names every fish and keeps the
//    Fish Count. Caught fish swim in a new aquarium in Patchwork Hall.
//  * Chapter 12: the Silver Quill straightened Reedwhistle Brook into a canal "to drain it faster".
//    Now floods race downstream into Lilypad Row and there are no slow pools left for fish. Fen,
//    a frog ranger who counts fish every morning, asks for help; a huge frightened catfish (The
//    Gulp) is stuck thrashing at a culvert grate. The fix: put the bends back. Rule Ten: give it
//    room to wander.
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
  const hasRod = () => f('rm_rod');

  // ================================================================ FISH
  // paper fish: body colour, fin colour, size range (cm), where they live, and how Jules feels
  const FISH = {
    minnow: { name: 'Paper Minnow', col: '#c9d3e0', fin: '#8a93a3', size: [3, 6], where: ['*'], line: 'A classic. Folded from a receipt, by the look of it.' },
    blossom: { name: 'Blossom Minnow', col: '#ffb7d5', fin: '#ff8fb1', size: [4, 8], where: ['spring'], line: 'It\'s pink because it eats petals. I don\'t make the rules. Spring does.' },
    tadpole: { name: 'Puddle Tadpole', col: '#6a6a72', fin: '#4a4a52', size: [1, 3], where: ['spring', 'marsh'], line: 'Technically a frog in progress. Like all of us.' },
    guppy: { name: 'Sunny Guppy', col: '#ffd25a', fin: '#f2a93b', size: [3, 5], where: ['summer', 'ferryyard'], line: 'Look at that tail. That tail has confidence.' },
    perch: { name: 'Leaf Perch', col: '#e8743b', fin: '#c94f2c', size: [10, 22], where: ['fall'], line: 'Camouflaged as a falling leaf. Very effective. Except in summer.' },
    smelt: { name: 'Snowflake Smelt', col: '#e8f4ff', fin: '#9fd6ee', size: [8, 14], where: ['winter', 'gullpoint'], line: 'Six fins. Every one different. Like snowflakes. I need to sit down.' },
    eel: { name: 'Lantern Eel', col: '#fff3a0', fin: '#ffd25a', size: [30, 60], where: ['lanternmere'], line: 'It glows! It only glows a little. It\'s pointing, not lighting the whole sky.' },
    cod: { name: 'Tin-Can Cod', col: '#c9ced6', fin: '#ef6b6b', size: [20, 45], where: ['gullpoint'], line: 'Grandpa\'s logbook says these hide in old cans. This one is wearing one.' },
    spoonbill: { name: 'Spoonbill Sucker', col: '#a8c8c0', fin: '#6fbfb3', size: [15, 30], where: ['ferryyard'], line: 'Its mouth is a spoon. Mallow is going to lose their mind.' },
    koi: { name: 'Reyes Pond Koi', col: '#fffaf0', fin: '#ef6b6b', size: [25, 50], where: ['campus', 'campusColor'], line: 'From the pond we saved! It remembers. It doesn\'t. But it might.' },
    trout: { name: 'Willow Trout', col: '#b9d98a', fin: '#ef8a6a', size: [18, 35], where: ['riverbend'], line: 'Grandma says she named one of these Pish in 1971. This might be Pish\'s great-great-grandkid.' },
    pike: { name: 'Reed Pike', col: '#7ab85a', fin: '#4a8a3a', size: [40, 80], where: ['marsh'], line: 'A pike! In the reeds where pikes are supposed to be! That means the reeds are working!' },
    mudminnow: { name: 'Marsh Mudminnow', col: '#a07a5a', fin: '#6a4a3a', size: [3, 7], where: ['marsh'], line: 'Mudminnows can breathe a bit of air when the water\'s low. Tough little things.' },
    gulplet: { name: 'Golden Gulp-let', col: '#ffd25a', fin: '#c2410c', size: [12, 20], where: ['marsh'], rare: true, line: 'A baby Gulp. Golden. I am going to cry on this fish. Gently.' },
  };
  CK.FishData = FISH;
  const NAMES = ['Gerald', 'Brenda', 'Admiral Squawk', 'Pickles', 'Sir Fins', 'Doug', 'Marjorie', 'Little Steve', 'Professor Bubbles', 'Noodle', 'Captain Wiggles', 'Penny', 'Gus', 'Tiny Tim', 'Ophelia'];
  const placeOf = () => {
    const ow = CK.OW;
    return ow ? (ow.ch.id === 'campus' ? 'campus' : ow.ch.id) : 'spring';
  };
  function rollFish(place) {
    const pool = Object.keys(FISH).filter((k) => FISH[k].where.includes(place));
    const rare = pool.filter((k) => FISH[k].rare), common = pool.filter((k) => !FISH[k].rare);
    if (rare.length && Math.random() < 0.15 && f('rm_done')) return U.pick(rare);
    if (common.length && Math.random() < 0.8) return U.pick(common);
    return 'minnow';
  }
  const book = () => (CK.G.fish = CK.G.fish || {});
  const kinds = () => Object.keys(book()).length;

  function drawFish(ctx, id, x, y, len, o = {}) {
    const F = FISH[id] || FISH.minnow;
    const wag = Math.sin((o.t || CK.time) * 8 + (o.seed || 0)) * 0.25;
    ctx.save(); ctx.translate(x, y); if (o.flip) ctx.scale(-1, 1);
    const l = len, h = l * (id === 'eel' ? 0.18 : id === 'pike' ? 0.25 : 0.42);
    ctx.save(); ctx.translate(-l * 0.45, 0); ctx.rotate(wag);
    D.poly(ctx, [0, 0, -l * 0.28, -h * 0.6, -l * 0.28, h * 0.6], F.fin, C.ink, 1.6);
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(0, 0, l * 0.48, h * 0.5, 0, 0, TAU);
    D.fillVol(ctx, -l * 0.1, -h * 0.15, l * 0.45, F.col, 1.8);
    // paper fold lines and a fin on top
    D.line(ctx, -l * 0.2, -h * 0.45, -l * 0.05, h * 0.45, 'rgba(60,40,20,0.2)', 1.2);
    D.poly(ctx, [-l * 0.05, -h * 0.45, l * 0.15, -h * 0.85, l * 0.2, -h * 0.4], F.fin, C.ink, 1.2);
    D.circle(ctx, l * 0.3, -h * 0.08, Math.max(1.6, l * 0.05), '#fffaf0', C.ink, 1);
    D.circle(ctx, l * 0.31, -h * 0.08, Math.max(0.8, l * 0.025), '#120e14');
    D.ellipse(ctx, l * 0.22, h * 0.12, l * 0.05, h * 0.07, 'rgba(255,120,140,0.5)');
    if (id === 'cod') { D.rr(ctx, -l * 0.2, -h * 0.5, l * 0.3, h, 2); ctx.fillStyle = 'rgba(200,206,214,0.8)'; ctx.fill(); stroke(ctx, 1.2); }
    if (id === 'eel' || id === 'gulplet') D.circle(ctx, 0, 0, l * 0.55, `rgba(255,240,150,${0.15 + Math.sin((o.t || CK.time) * 3) * 0.08})`);
    ctx.restore();
  }
  CK.drawFish = drawFish;

  // ================================================================ FISHING
  // face open water (not a bridge) and you can fish, once Fen has given you the rod
  const baseFocus = CK.Overworld.prototype.findFocus;
  CK.Overworld.prototype.findFocus = function (p, who) {
    const fo = baseFocus.call(this, p, who);
    if (fo || !hasRod()) return fo;
    p = p || this.player;
    const fx = p.x + (p.dir === 'left' ? -34 : p.dir === 'right' ? 34 : 0);
    const fy = p.y + (p.dir === 'up' ? -36 : p.dir === 'down' ? 34 : -4);
    const tx = Math.floor(fx / TS), ty = Math.floor(fy / TS);
    if (this.map.get(tx, ty) !== '~') return null;
    return { type: 'fishspot', ix: (tx + 0.5) * TS, iy: (ty + 0.6) * TS, promptLabel: 'Fish' };
  };
  const baseInteract = CK.Overworld.prototype.interact;
  CK.Overworld.prototype.interact = function (e, who) {
    if (e && e.type === 'fishspot') { CK.Audio.sfx('whoosh'); show(new FishingScene(this, e)); return; }
    return baseInteract.call(this, e, who);
  };

  class FishingScene {
    constructor(ow, spot) {
      this.ow = ow; this.spot = spot; this.t = 0; this.transparent = true; this.finished = false;
      this.state = 'cast'; this.fish = rollFish(placeOf()); this.parts = new CK.Particles();
      this.wait = U.rand(1.5, 4); this.nibbles = Math.floor(U.rand(0, 3)); this.next = U.rand(0.6, 1.2); this.bob = 0; this.msg = '';
      this.size = Math.round(U.rand(...FISH[this.fish].size));
    }
    enter() { if (CK.autoSkip) { this.land(); this.close(); } }
    close() { this.finished = true; CK.Scenes.remove(this); }
    window_() { return CK.settings && CK.settings.story ? 1.1 : 0.7; }
    land() {
      const B = book(), isNew = !B[this.fish];
      B[this.fish] = Math.max(B[this.fish] || 0, this.size);
      this.isNew = isNew; this.nick = U.pick(NAMES);
      if (isNew) { CK.G.scraps += 5; }
      if (CK.G.flags.rm_survey != null && placeOf() === 'marsh') CK.G.flags.rm_survey = (CK.G.flags.rm_survey || 0) + 1;
    }
    update(dt) {
      this.t += dt; this.parts.update(dt);
      const hit = Input.hit('ok') || Input.mouse.pressed;
      if (this.state === 'cast') { if (this.t > 0.7) { this.state = 'wait'; this.t = 0; } return; }
      if (this.state === 'wait') {
        this.next -= dt;
        if (this.next <= 0 && this.nibbles > 0) { this.nibbles--; this.bob = 0.35; this.next = U.rand(0.6, 1.4); CK.Audio.sfx('blip'); }
        else if (this.next <= 0 && this.t > this.wait) { this.state = 'bite'; this.t = 0; this.bob = 1; CK.Audio.sfx('splash'); this.splash(); }
        this.bob = Math.max(0, this.bob - dt * 2);
        if (hit) { this.state = 'miss'; this.t = 0; this.msg = 'Too soon! It was only nibbling. The fish swims off.'; CK.Audio.sfx('error'); }
        if (Input.hit('back')) this.close();
        return;
      }
      if (this.state === 'bite') {
        const auto = CK.settings && CK.settings.autoTime && this.t > 0.15;
        if (hit || auto) { this.state = 'caught'; this.t = 0; this.land(); CK.Audio.sfx(this.isNew ? 'levelup' : 'chest'); this.splash(); return; }
        if (this.t > this.window_()) { this.state = 'miss'; this.t = 0; this.msg = 'Too slow! It got away.'; CK.Audio.sfx('lose'); }
        return;
      }
      if ((this.state === 'caught' || this.state === 'miss') && this.t > 0.6 && hit) {
        this.close();
        if (this.state === 'caught') CK.toast(`${FISH[this.fish].name}! Fish Count: ${kinds()} kinds`, '#e6f7ef');
      }
    }
    splash() { for (let i = 0; i < 14; i++) this.parts.emit({ x: W / 2 + U.rand(-30, 30), y: 300, vx: U.rand(-120, 120), vy: U.rand(-260, -80), g: 600, life: 0.8, size: U.rand(3, 6), shape: 'drop', color: '#bfe6ff' }); }
    draw(ctx) {
      // a round close-up of the water, like looking down past the rod
      const cx = W / 2, cy = 300, r = 150;
      ctx.fillStyle = 'rgba(20,30,50,0.35)'; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
      const S2 = this.ow.season;
      const g = ctx.createRadialGradient(cx, cy - 40, 10, cx, cy, r); g.addColorStop(0, S2.water); g.addColorStop(1, S2.waterD);
      ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      for (let i = 0; i < 6; i++) { const yy = cy - r + ((this.t * 20 + i * 50) % (r * 2)); ctx.beginPath(); ctx.moveTo(cx - r, yy); ctx.quadraticCurveTo(cx, yy - 8, cx + r, yy); stroke(ctx, 2, 'rgba(255,255,255,0.25)'); }
      // the fish's shadow circling closer
      if (this.state === 'wait' || this.state === 'bite') {
        const k = this.state === 'bite' ? 0 : Math.max(0.2, 1 - this.t / (this.wait + 1));
        const a = this.t * 1.4;
        D.ellipse(ctx, cx + Math.cos(a) * 90 * k, cy + 20 + Math.sin(a) * 50 * k, 28, 12, 'rgba(10,20,40,0.35)', null, 0, a + Math.PI / 2);
      }
      ctx.restore();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); stroke(ctx, 6, '#fffaf0'); ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, TAU); stroke(ctx, 2);
      // line and bobber
      const dip = this.state === 'bite' ? 16 + Math.sin(this.t * 30) * 4 : this.bob * 10 + Math.sin(CK.time * 3) * 2;
      const by = this.state === 'cast' ? cy - 200 + Math.min(1, this.t / 0.7) * 200 : cy + dip;
      D.line(ctx, cx + 220, 40, cx, by - 12, 'rgba(255,255,255,0.8)', 1.5);
      if (this.state !== 'caught') {
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, cy + (this.state === 'bite' ? 6 : 12)); ctx.clip();
        D.ball(ctx, cx, by - 6, 10, '#ef6b6b', { lw: 2 }); D.ball(ctx, cx, by + 5, 9, '#fffaf0', { lw: 2 });
        ctx.restore();
        D.ellipse(ctx, cx, cy + 12, 22 + this.bob * 10, 6, null, 'rgba(255,255,255,0.7)', 2);
      }
      if (this.state === 'bite') D.text(ctx, '!', cx + 40, cy - 40, { size: 64, weight: 700, align: 'center', color: '#ef6b6b', outline: '#fff', ow: 6 });
      this.parts.draw(ctx);
      // prompts and results
      const panel = (title, sub, col) => { D.panel(ctx, cx - 260, 30, 520, 76, { fill: '#fffaf0', tape: false }); D.text(ctx, title, cx, 62, { size: 22, weight: 700, align: 'center', color: col || '#3d2412' }); D.text(ctx, sub, cx, 88, { size: 14, weight: 600, align: 'center', color: '#7a5434' }); };
      if (this.state === 'cast' || this.state === 'wait') panel('Wait for it...', 'Little nibbles don\'t count. Press Z when the bobber goes all the way under.');
      if (this.state === 'bite') panel('NOW!', 'Press Z!', '#ef6b6b');
      if (this.state === 'miss') panel('Oh no!', this.msg);
      if (this.state === 'caught') {
        const F = FISH[this.fish];
        D.panel(ctx, cx - 280, 80, 560, 330, { fill: '#fffaf0' });
        if (this.isNew) { D.tape(ctx, cx + 150, 74, 110, 30, 0.1, 0.95); D.text(ctx, 'NEW!', cx + 205, 96, { size: 18, weight: 700, align: 'center', color: '#c2410c' }); }
        drawFish(ctx, this.fish, cx, 200, Math.min(220, 70 + this.size * 2), { t: this.t });
        D.text(ctx, `You caught a ${F.name}!`, cx, 300, { size: 24, weight: 700, align: 'center' });
        D.text(ctx, `${this.size} cm${this.isNew ? ' · +5 scraps' : ''}`, cx, 324, { size: 14, weight: 600, align: 'center', color: '#7a5434' });
        D.portrait(ctx, 'jules', cx - 262, 336, 'happy');
        D.wrap(ctx, `"That one's ${this.nick}. ${F.line}"`, 380, 15, 600).forEach((l, i) => D.text(ctx, l, cx - 136, 362 + i * 20, { size: 15, weight: 600, color: '#2f6a3a' }));
      }
      if (this.state === 'caught' || this.state === 'miss') D.text(ctx, 'Z / click', cx, H - 14, { size: 12, align: 'center', color: '#fff' });
      else D.text(ctx, 'X: reel in and stop', cx, H - 14, { size: 12, align: 'center', color: '#fff' });
    }
  }
  CK.FishingScene = FishingScene;

  // ================================================================ CHARACTERS
  // Fen: a small green frog ranger in a bucket hat with a clipboard, a pencil and wellies.
  CH.frog = function (ctx, x, y, o) {
    const s = o.s || 1, mood = o.mood;
    const dir = o.dir || 'down';
    const side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const hop = Math.abs(Math.sin(CK.time * 3)) * 1.5 * s;
    for (const k of [-1, 1]) { D.rr(ctx, x + k * 7 * s - 4 * s, y - 9 * s, 8 * s, 9 * s, 2 * s); ctx.fillStyle = '#ffd25a'; ctx.fill(); stroke(ctx, 1.6); }
    y -= hop;
    D.egg(ctx, x, y - 18 * s, 13 * s, 12 * s, '#7ac96a', { lw: 2.2, k: 0.6 });
    D.egg(ctx, x, y - 15 * s, 8 * s, 7 * s, '#d9f2c4', { lw: 0 });
    D.rr(ctx, x - 9 * s, y - 26 * s, 18 * s, 12 * s, 3 * s); ctx.fillStyle = '#4a7a5a'; ctx.fill(); stroke(ctx, 1.6);
    D.line(ctx, x - 7 * s, y - 22 * s, x + 7 * s, y - 22 * s, '#fff4dc', 1.2);
    // clipboard
    const cbx = x + (side >= 0 ? 12 : -12) * s;
    D.rr(ctx, cbx - 6 * s, y - 26 * s, 12 * s, 16 * s, 2 * s); ctx.fillStyle = '#c99561'; ctx.fill(); stroke(ctx, 1.4);
    D.rr(ctx, cbx - 4.5 * s, y - 23 * s, 9 * s, 12 * s, 1); ctx.fillStyle = '#fffaf0'; ctx.fill();
    for (let i = 0; i < 3; i++) D.line(ctx, cbx - 3 * s, y - 20 * s + i * 3 * s, cbx + 3 * s, y - 20 * s + i * 3 * s, 'rgba(60,60,90,0.5)', 0.8);
    // wide frog head with eyes on top
    const hx = x + side * 2 * s, hy = y - 36 * s;
    D.egg(ctx, hx, hy, 15 * s, 10 * s, '#7ac96a', { lw: 2.2, k: 0.6 });
    for (const k of [-1, 1]) {
      if (side && k === -side) { D.ball(ctx, hx + k * 8 * s, hy - 8 * s, 5 * s, '#7ac96a', { lw: 1.8 }); continue; }
      D.ball(ctx, hx + k * 8 * s, hy - 8 * s, 5.5 * s, '#7ac96a', { lw: 1.8 });
      if (dir !== 'up') {
        if (mood === 'happy') { ctx.beginPath(); ctx.arc(hx + k * 8 * s, hy - 7 * s, 2.4 * s, Math.PI * 1.1, Math.PI * 1.9); stroke(ctx, 1.6); }
        else { D.circle(ctx, hx + k * 8 * s, hy - 8 * s, 2.4 * s, '#120e14'); D.circle(ctx, hx + k * 8 * s + 0.8 * s, hy - 9 * s, 0.8 * s, '#fff'); }
      }
    }
    if (dir !== 'up') {
      ctx.beginPath(); ctx.arc(hx + side * 3 * s, hy + 1 * s, 6 * s, 0.2, Math.PI - 0.2); stroke(ctx, 1.6);
      D.blush(ctx, hx + side * 2 * s, hy + 2 * s, 10 * s, 2 * s);
    }
    // bucket hat
    D.egg(ctx, hx, hy - 14 * s, 13 * s, 3.5 * s, '#e8c060', { lw: 1.6 });
    ctx.beginPath(); ctx.arc(hx, hy - 14 * s, 8 * s, Math.PI, 0); ctx.closePath(); D.fillVol(ctx, hx - 2 * s, hy - 17 * s, 8 * s, '#e8c060', 1.6);
  };
  // The Gulp: an enormous paper catfish with long whisker-feelers, very frightened.
  function drawGulp(ctx, x, y, s, calm, t) {
    D.shadow(ctx, x, y, 90 * s, 16 * s, 0.35);
    ctx.save(); ctx.translate(x, y - 70 * s); ctx.scale(s, s); ctx.rotate(Math.sin(t * (calm ? 1 : 4)) * (calm ? 0.03 : 0.08));
    D.poly(ctx, [-110, 0, -150, -40, -150, 40], '#8a6a4a', C.ink, 3);
    ctx.beginPath(); ctx.ellipse(0, 0, 110, 58, 0, 0, TAU); D.fillVol(ctx, -10, -14, 100, '#a8865a', 3);
    for (let i = 0; i < 4; i++) D.line(ctx, -70 + i * 30, -50, -60 + i * 30, 50, 'rgba(60,40,20,0.2)', 2);
    D.poly(ctx, [-20, -56, 20, -90, 40, -52], '#8a6a4a', C.ink, 3);
    D.ellipse(ctx, 60, 22, 40, 18, '#e8d4a8', C.ink, 2.5);
    for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(84, 6 + k * 6); ctx.quadraticCurveTo(130, 10 + k * 30 + Math.sin(t * 5 + k) * 10, 150, 40 + k * 40); stroke(ctx, 4); }
    D.circle(ctx, 70, -18, 13, '#fffaf0', C.ink, 2.5);
    if (calm) { ctx.beginPath(); ctx.arc(70, -16, 7, Math.PI * 1.1, Math.PI * 1.9); stroke(ctx, 3); }
    else { D.circle(ctx, 72, -18, 7, '#120e14'); D.circle(ctx, 70, -21, 2.5, '#fff'); D.line(ctx, 56, -36, 84, -30, C.ink, 3); }
    if (!calm) for (let i = 0; i < 3; i++) D.egg(ctx, 96 + i * 8, -40 - i * 10 + Math.sin(t * 6 + i) * 3, 3, 5, '#9fd6ff', { lw: 1.2 });
    D.ellipse(ctx, 40, 14, 10, 5, 'rgba(255,120,140,0.5)');
    ctx.restore();
  }
  Data.enemies.gulp = {
    name: 'The Gulp', hp: 420, atk: 14, def: 3, xp: 110, scraps: 60, draw: 'gulp', boss: true,
    moves: [{ name: 'Panic Thrash', power: 1.4, w: 2 }, { name: 'Tidal Flop', power: 0.85, all: true, w: 2, water: true, soak: true }, { name: 'Muddy Gulp', power: 0.7, all: true, w: 1, drain: true }],
  };
  Data.battles.rm_gulp = { enemies: ['gulp'], season: 'summer', boss: true, music: 'boss', rainy: true };
  const baseEnemy = D.enemy;
  D.enemy = function (ctx, type, x, y, o = {}) {
    if (type === 'gulp') return drawGulp(ctx, x, y, (o.s || 1) * 0.95, !!o.calm, CK.time);
    return baseEnemy.call(this, ctx, type, x, y, o);
  };
  CH.gulpnpc = function (ctx, x, y, o) { drawGulp(ctx, x, y, (o.s || 1) * 0.42, o.mood === 'happy', CK.time); };
  Object.assign(Data.speakers, {
    fen: { name: 'Fen', look: 'frog', ps: 2.4, py: 6, bg: '#e2f6dc' },
    gulp: { name: 'The Gulp', look: 'gulpnpc', ps: 1.6, py: -40, bg: '#dfeef6', o: { mood: 'happy' } },
  });

  // ================================================================ PLACE
  Data.seasons.marsh = {
    name: 'Early summer', ground: '#a3cf78', ground2: '#93bf6a', path: '#e9d4a0', sand: '#efe0b0', water: '#5ac8d8', waterD: '#2d9cb4',
    sky: ['#a8e4ff', '#e8ffd6'], night: ['#162a4a', '#3a2f62'], tree: 'oak', particle: 'sparkle',
  };
  // the brook: a straight Society canal, or (after the puzzle) the bends you designed
  const COLS = 9, ROWS = 7;
  const colX = (c) => 12 + c * 2;
  const rowY = (r) => Math.round((r / (ROWS - 1)) * 22) + 0.5;
  CK.Chapters.marsh = {
    id: 'marsh', name: 'Reedwhistle Marsh', w: 40, h: 24, season: 'marsh', music: 'summer',
    start: [2, 12], noFlood: true,
    build(m) {
      m.scatter(',', 0.14, 131);
      const path = CK.G && CK.G.flags.rm_path;
      if (path && f('rm_meander')) {
        const pts = [[colX(path[0]), -1]].concat(path.map((c, r) => [colX(c), rowY(r)]), [[colX(path[ROWS - 1]), 25]]);
        m.river(pts, 1, '~');
        // reed beds and pools along the bends
        for (let r = 1; r < ROWS - 1; r++) if (path[r] !== path[r - 1]) m.ellipse(colX(path[r]), rowY(r), 2.2, 1.4, '~');
      } else m.rect(19, 0, 2, 24, '~');
      m.ellipse(6, 4, 3, 2, '~');
      m.ellipse(33, 19, 4, 2.4, '~');
      m.path([[1, 12], [38, 12]], '=');
      m.path([[8, 12], [8, 18]], '=');
      m.scatter('T', 0.05, 132);
      m.border('T');
    },
    post(m) {
      for (const o of this.objects) if (o.type !== 'trigger' && 'T,'.includes(m.get(o.x, o.y))) m.set(o.x, o.y, '.');
      m.rect(1, 11, 3, 3, '.'); m.rect(1, 12, 3, 1, '=');
      for (const o of this.objects) if (o.type === 'house') m.rect(o.x, o.y - 1, 2, 3, '.');
    },
    paintGround(g, m) {
      // reed clumps on every bank, and (before the fix) floodwater pooling in Lilypad Row
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
        if (m.get(x, y) !== '~') continue;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const t = m.get(x + dx, y + dy);
          if (!t || t === '~' || U.hash(x, y, dx * 3 + dy) > 0.5) continue;
          const X = (x + dx) * TS + 24 - dx * 18, Y = (y + dy) * TS + 26 - dy * 14;
          for (let i = -2; i <= 2; i++) { g.strokeStyle = i % 2 ? '#4a8a3a' : '#6aa84a'; g.lineWidth = 3; g.beginPath(); g.moveTo(X + i * 4, Y + 8); g.lineTo(X + i * 5, Y - 14 - Math.abs(i) * -2); g.stroke(); }
          g.fillStyle = '#6a4426'; g.beginPath(); g.ellipse(X + 2, Y - 16, 2.5, 6, 0.2, 0, TAU); g.fill();
        }
      }
      if (!f('rm_meander')) for (const [fx, fy] of [[4, 16], [6, 18], [10, 17], [12, 19], [5, 20]]) { g.fillStyle = 'rgba(90,175,235,0.5)'; g.beginPath(); g.ellipse(fx * TS + 24, fy * TS + 28, 30, 13, 0, 0, TAU); g.fill(); }
      // muddy patches and lily pads make it a marsh, not a lawn
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
        const t = m.get(x, y), h = U.hash(x, y, 41);
        if (t === '~' && h < 0.28) {
          for (let i = 0; i < 2; i++) {
            const X = x * TS + 12 + U.hash(x, y, 42 + i) * 24, Y = y * TS + 18 + U.hash(x, y, 44 + i) * 20, r = 6 + U.hash(x, y, 46 + i) * 4;
            g.fillStyle = '#5aa84a'; g.beginPath(); g.moveTo(X, Y); g.arc(X, Y, r, 0.4, TAU - 0.2); g.closePath(); g.fill();
            g.strokeStyle = 'rgba(40,80,30,0.6)'; g.lineWidth = 1.2; g.stroke();
            if (U.hash(x, y, 48 + i) < 0.3) { g.fillStyle = '#ffd1e3'; g.beginPath(); g.arc(X - 2, Y - 2, 3, 0, TAU); g.fill(); }
          }
        } else if ((t === '.' || t === ',') && h < 0.08) {
          g.fillStyle = 'rgba(120,90,50,0.28)'; g.beginPath(); g.ellipse(x * TS + 24, y * TS + 28, 22, 10, 0, 0, TAU); g.fill();
        }
      }
      // the Society's canal has hard grey walls; the redesigned brook doesn't
      if (!f('rm_meander')) for (let y = 0; y < m.h; y++) for (const x of [18, 21]) {
        if (m.get(x, y) === 'b' || m.get(x, y) === '=') continue;
        const X = x * TS + (x === 18 ? TS - 12 : 0);
        g.fillStyle = '#b8c0cf'; g.fillRect(X, y * TS, 12, TS);
        g.strokeStyle = 'rgba(80,90,110,0.5)'; g.lineWidth = 1; g.strokeRect(X + 0.5, y * TS + 0.5, 11, TS - 1);
        for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(X, y * TS + i * 16); g.lineTo(X + 12, y * TS + i * 16); g.stroke(); }
      }
    },
    objects: [
      { type: 'npc', id: 'fen', x: 15, y: 11, look: 'frog', talk: () => fenTalk() },
      { type: 'npc', id: 'jules_rm', x: 5, y: 11, look: 'jules', talk: () => julesTalk(), cond: () => !CK.coop },
      { type: 'npc', id: 'pell_marsh', x: 4, y: 13, look: 'pelican', snap: true, talk: () => [['pell', f('rm_done') ? 'Lilypad Row\'s post goes out dry now. Do you know how rare dry post is in a marsh?' : 'I flew Fen\'s letter here myself. The handwriting was very small and very worried.', 'happy']] },
      { type: 'npc', id: 'gulp_npc', x: 21, y: 6, look: 'gulpnpc', o: { mood: 'sad' }, talk: 'rm_gulp_fight', cond: () => f('rm_survey_done') && !f('rm_gulp') },
      { type: 'npc', id: 'gulp_calm', x: 30, y: 19, look: 'gulpnpc', o: { mood: 'happy' }, talk: () => [['gulp', f('rm_done') ? '...blub. (It is resting in the deep pool. It looks extremely comfortable.)' : '...blub? (It is hiding in the pond, waiting for the brook to be gentle again.)', 'happy']], cond: () => f('rm_gulp') },
      { type: 'site', id: 'rm_site', x: 17, y: 13, script: () => meanderSite() },
      { type: 'house', id: 'rm_a', x: 4, y: 16, roof: '#6cc56c', style: 'stilt', knock: 'rm_knock_a' },
      { type: 'house', id: 'rm_b', x: 10, y: 16, roof: '#5aa9e6', style: 'stilt', knock: 'rm_knock_b' },
      { type: 'house', id: 'rm_c', x: 7, y: 20, roof: '#ffd25a', style: 'stilt', knock: 'rm_knock_c' },
      { type: 'sign', x: 3, y: 11, text: 'REEDWHISTLE MARSH. Lilypad Row, south. Please don\'t stamp on the frogs.' },
      { type: 'sign', x: 18, y: 4, text: 'REEDWHISTLE CANAL. Straightened by order of the Silver Quill, for "efficient drainage." DO NOT ADD BENDS.' },
      { type: 'bench', x: 12, y: 13 },
      { type: 'campfire', x: 27, y: 14 },
      { type: 'deco', kind: 'fy_flowers', x: 25, y: 9 },
      { type: 'deco', kind: 'lantern', x: 9, y: 13 },
      { type: 'deco', kind: 'lantern', x: 23, y: 13 },
      { type: 'trigger', id: 'rm_done_go', x: 13, y: 10, w: 4, h: 3, script: 'rm_finale', cond: () => f('rm_meander') && !f('rm_done') },
    ],
    objective() {
      if (!f('rm_fen')) return 'Find Fen, the frog ranger, by the canal';
      if (!f('rm_survey_done')) return `Fish Count: catch ${3 - Math.min(3, CK.G.flags.rm_survey || 0)} more fish in the marsh (face water, press Z)`;
      if (!f('rm_gulp')) return 'Something huge is thrashing at the culvert (north, in the canal)';
      if (!f('rm_meander')) return 'Redesign the brook with Fen (blueprint by the canal)';
      if (!f('rm_done')) return 'Tell Fen and Jules (by the canal)';
      return 'Free roam! Go fishing anywhere. Fish Count is in Patchwork Hall\'s aquarium.';
    },
  };

  // ================================================================ TRAVEL
  const baseTravel = CK.travelChoice;
  CK.travelChoice = function (text) {
    const c = baseTravel(text);
    if (f('fy_done') && CK.G.chapter !== 'marsh') c.choice.options.splice(c.choice.options.length - 1, 0, { label: f('marsh_arrived') ? 'Reedwhistle Marsh' : 'Reedwhistle Marsh (new!)', then: [{ chapter: 'marsh', label: 'Reedwhistle Marsh' }] });
    return c;
  };

  // ================================================================ SCRIPTS
  const rebuild = { fn: () => { if (CK.OW) CK.OW.refresh(); } };
  S.marsh_intro = [
    { card: { title: 'Chapter 12', sub: 'Reedwhistle Marsh' } },
    { narrate: 'Pell delivered a letter in very small, very worried handwriting: "THE FISH ARE GOING. PLEASE COME. BRING SOMEONE WHO LIKES FISH. - FEN (RANGER)."' },
    { coop: [['jules', 'Someone who likes fish. Sam. SAM. That\'s me. I\'m someone who likes fish.', 'happy']] },
    { solo: [{ narrate: 'Jules came through the box the moment you read it out loud.' }, ['jules', 'Someone who likes fish! That\'s me! I\'m the someone!', 'happy']] },
    ['pip', 'Fact: a straight river is not a natural river. And that is a very straight river.', 'shock'],
  ];
  S.rm_fen_meet = [
    ['fen', 'You came! Ranger Fen. I count the fish every morning. It\'s my job. Well. Nobody gave it to me. I just started.', 'happy'],
    ['fen', 'Eleven kinds used to live in Reedwhistle Brook. This morning I counted one. ONE.', 'sad'],
    ['sam', 'What happened?', 'sad'],
    ['fen', 'The Silver Quill straightened the brook into a canal, years ago. "Efficient drainage." Now the water goes whoosh. No bends, no slow pools, nowhere for a fish to rest.', 'sad'],
    ['fen', 'And all that whoosh lands on Lilypad Row at once. Every rain, our porches flood.', 'sad'],
    ['jules', 'So the fish and the houses have the same problem. The water\'s in too much of a hurry.', 'shock'],
    ['fen', 'Exactly. But I need proof before anyone listens. Help me count? Here: a rod. Cardboard, string, a bottle-cap bobber.', 'happy'],
    { flag: 'rm_rod' },
    { fn: () => { CK.G.flags.rm_survey = CK.G.flags.rm_survey || 0; } },
    { narrate: 'Got a fishing rod! Face any open water and press Z to cast. Wait for the bobber to really go under. Nibbles don\'t count.' },
    ['jules', 'I am going to name every single one. You can\'t stop me.', 'happy'],
    { flag: 'rm_fen' },
    { journal: 'Met Fen, a frog ranger who counts fish every morning. The Silver Quill straightened Reedwhistle Brook into a canal. Eleven kinds of fish have dropped to one, and Lilypad Row floods every rain. Got a fishing rod.' },
  ];
  function fenTalk() {
    if (!f('rm_fen')) return 'rm_fen_meet';
    if (!f('rm_survey_done')) {
      if ((CK.G.flags.rm_survey || 0) >= 3) return 'rm_survey_result';
      return [['fen', `${CK.G.flags.rm_survey || 0} counted so far. Face the canal or a pond and cast. Patience. Fish are mostly patience.`, 'happy']];
    }
    if (!f('rm_gulp')) return [['fen', 'The culvert, north end of the canal. Something huge is stuck there. Please be gentle. It\'s scared, not cross.', 'sad']];
    if (!f('rm_meander')) return [['fen', 'The blueprint\'s by the canal. Bends, pools, reeds. Give the water somewhere to wander.', 'happy']];
    return [U.pick([
      ['fen', 'Count this morning: eleven kinds. ELEVEN. I counted twice. Then Jules counted. Then I counted Jules counting.', 'happy'],
      ['fen', 'The Gulp lives in the big pool now. It rolls over when it sees me. I think we\'re friends.', 'happy'],
    ])];
  }
  function julesTalk() {
    if (!f('rm_done')) return [['jules', U.pick(['That gull is Brenda. Different Brenda. It\'s a common name for gulls.', 'If you catch one, I\'m naming it. That\'s the deal.', 'Mom texted. She asked if marshes count as medicine. I said everything counts.']), 'happy']];
    return [U.pick([
      ['jules', 'I put the Fish Count in a spreadsheet. Then I put the spreadsheet in a frame. Then I gave the frame to Fen.', 'happy'],
      ['jules', 'I think I know what I want to do with marine biology now. Rivers like this. Making sure they\'re okay.', 'happy'],
    ])];
  }
  S.rm_survey_result = [
    ['fen', 'Three fish, and only ' + 'one or two kinds. In a brook that used to have eleven.', 'sad'],
    ['jules', 'Every fish we caught was in the ponds, not the canal. The canal\'s too fast. Nothing can stay.', 'sad'],
    { narrate: 'Something enormous thrashes at the north end of the canal. The whole bank shakes.' },
    ['fen', 'That\'s coming from the culvert! Something\'s stuck!', 'shock'],
    { flag: 'rm_survey_done' },
    { fn: () => { if (CK.OW) CK.OW.buildEntities(); } },
  ];
  S.rm_gulp_fight = [
    { narrate: 'A paper catfish the size of a rowboat is jammed against the Society\'s culvert grate, thrashing in the fast water.' },
    ['jules', 'It\'s not attacking. It\'s panicking. It can\'t get out of the current.', 'shock'],
    ['sam', 'Then we keep it from hurting itself, and get that grate off. Guard, help, and don\'t let it get swept.', 'happy'],
    { battle: 'rm_gulp' },
    { narrate: 'The Gulp tires. Corry wedges his shield under the grate, Pip pulls the string, and the whole thing pops free with a CLANG.' },
    { narrate: 'The Gulp slides into the pond by Lilypad Row, gulps once, and goes very, very still. Then it blows one enormous, happy bubble.' },
    ['fen', 'It used to live in the deep pool at the big bend. Before there were no bends.', 'sad'],
    { flag: 'rm_gulp' },
    { fn: () => { if (CK.OW) CK.OW.buildEntities(); } },
    { journal: 'Freed The Gulp, a giant frightened catfish stuck at the Society\'s culvert grate. It used to live in the deep pool at the big bend, back when the brook had bends.' },
  ];
  function meanderSite() {
    if (!f('rm_gulp')) return [{ narrate: 'Fen\'s blueprint table. The canal on it is drawn with a ruler. Someone has scribbled "WHY" in the margin.' }];
    if (f('rm_meander')) return [{ narrate: 'The new brook, drawn with your bends, pinned to Fen\'s table. Someone has added little fish all along it.' }];
    return [
      ['fen', 'Here\'s the old map of the brook, before the canal. All wiggly. We can\'t put back every wiggle. But we can put back enough.', 'happy'],
      { await: () => show(new MeanderScene()) },
      { if: () => !f('rm_meander'), then: [['fen', 'Take your time. Rivers took thousands of years. You can have a minute.', 'happy']] },
      rebuild,
      { narrate: 'Mallow ferries over stones for the pools. Brindle builds the bank walls. The Gulp helps by lying in exactly the right place. By evening, the brook bends.' },
      { journal: 'Redesigned Reedwhistle Brook with Fen: bends to slow the water, deep pools for fish to rest, and reed beds to soak up floods. The overworld brook follows the design.' },
      { save: true },
    ];
  }
  S.rm_finale = [
    { night: false },
    { narrate: 'The next morning, the whole party sits on the bank with Fen\'s clipboard.' },
    ['fen', 'Reed Pike. Mudminnows. Tadpoles. A Golden Gulp-let, under the big bend! That\'s... that\'s ELEVEN kinds back, near enough.', 'happy'],
    ['jules', 'I count fish to make sure they\'re okay. They\'re okay.', 'happy'],
    ['jules', '...I think that\'s it. That\'s what I want to do. Rivers. Making sure the things that live in them are okay.', 'happy'],
    ['sam', 'The brook didn\'t need to go faster. It needed room to wander.', 'happy'],
    ['sam', '...Maybe mine doesn\'t have to be straight either.', 'happy'],
    ['pip', 'Rule Ten?', 'happy'],
    ['sam', 'Rule Ten: give it room to wander.', 'happy'],
    { narrate: 'Lilypad Row stays dry through the next rain. The water slows down, spreads into the reeds, and goes on its way.' },
    { flag: 'rm_done' },
    { journal: 'Rule Ten: give it room to wander. Reedwhistle Brook has bends again, the fish are back, and Lilypad Row stays dry. Jules knows what they want to do now: rivers.' },
    { save: true },
  ];
  S.rm_knock_a = [['duck', 'Every rain, our porch becomes a pond. The frogs love it. We are not frogs.', 'sad'], { scraps: 6 }];
  S.rm_knock_b = [['mouse', 'Fen counts the fish, I count the buckets. Twenty-two buckets of water out of my kitchen this spring.', 'sad'], { snacks: 1 }];
  S.rm_knock_c = [['bunny', 'My grandpa used to fish the big bend. He says the Gulp was the size of a bathtub then. A small bathtub.', 'happy'], { scraps: 6 }];

  // postcards: the marsh joins the wall
  if (CK.Postcards) CK.Postcards.push({ id: 'meander', ch: 'marsh', at: [19, 9], undo: ['rm_meander', 'rm_done'], need: 'rm_meander', title: 'Reedwhistle Marsh', caption: 'The Society\'s straight canal got its bends back: slower water, deep pools, and fish again.' });

  // ================================================================ THE PUZZLE: put the bends back
  // A top-down grid of the marsh, 9 columns by 7 rows. Pick where the brook runs in each row; each
  // row can move at most one column from the last. Rules: at least 4 bends (to slow the water),
  // pass through both deep pools (fish need somewhere to rest), stay clear of Lilypad Row's houses,
  // and meet the outlet at the bottom. Sinuosity, more or less, without the word.
  const POOLS = [[2, 2], [5, 5]]; // [row, col]
  const HOUSES = [[3, 6], [3, 7], [4, 0], [4, 1], [5, 0]];
  const OUT = 4;
  class MeanderScene {
    constructor() { this.t = 0; this.cols = new Array(ROWS).fill(4); this.sel = 1; this.state = 'build'; this.fails = 0; this.msg = ''; this.finished = false; this.solved = false; this.flow = 0; this.cols[0] = 4; }
    enter() { CK.Audio.sfx('whoosh'); if (CK.autoSkip) { this.applySolution(); this.win(); this.close(); } }
    close() { this.finished = true; CK.Scenes.remove(this); }
    applySolution() { this.cols = [4, 3, 2, 3, 4, 5, 4]; }
    bends() { let n = 0; for (let r = 1; r < ROWS; r++) if (this.cols[r] !== this.cols[r - 1]) n++; return n; }
    check() {
      for (let r = 1; r < ROWS; r++) if (Math.abs(this.cols[r] - this.cols[r - 1]) > 1) return { ok: false, at: r, msg: 'The brook jumps two squares sideways there. Water can\'t teleport. One square at a time.' };
      for (const [r, c] of HOUSES) if (this.cols[r] === c) return { ok: false, at: r, msg: 'The brook runs straight through someone\'s house. Lilypad Row would like to stay dry, thank you.' };
      if (this.cols[ROWS - 1] !== OUT) return { ok: false, at: ROWS - 1, msg: 'The brook has to meet the outlet at the bottom (the arrow).' };
      if (this.bends() < 4) return { ok: false, at: ROWS - 1, msg: `Only ${this.bends()} bends. The water still rushes straight through and floods Lilypad Row. It needs at least 4 bends to slow down.` };
      for (const [r, c] of POOLS) if (this.cols[r] !== c) return { ok: false, at: r, msg: 'The brook misses a deep pool. Fish need somewhere slow and deep to rest, and the Gulp needs a home.' };
      return { ok: true };
    }
    win() { this.solved = true; CK.setFlag('rm_meander'); CK.G.flags.rm_path = this.cols.slice(); }
    test() { this.result = this.check(); this.state = 'test'; this.flow = 0; CK.Audio.sfx('splash'); }
    cell(r, c) { return [250 + c * 50, 96 + r * 50, 48, 48]; }
    update(dt) {
      this.t += dt;
      if (this.state === 'test') {
        this.flow += dt * (this.result.ok ? 1.6 : 3.2);
        if (this.flow >= (this.result.ok ? ROWS : (this.result.at || 0) + 1)) {
          this.state = 'result';
          if (this.result.ok) { this.win(); CK.Audio.sfx('win'); this.msg = `${this.bends()} bends. The water slows down, fills the pools, spreads into the reeds, and Lilypad Row stays dry. A fish noses into the deep pool and stays.`; }
          else { this.fails++; CK.Audio.sfx('lose'); this.msg = this.result.msg; }
        }
        return;
      }
      if (this.state === 'result') { if (Input.hit('ok') || Input.mouse.pressed || Input.hit('back')) { if (this.solved) return this.close(); this.state = 'build'; } return; }
      if (Input.hit('up')) { this.sel = Math.max(1, this.sel - 1); CK.Audio.sfx('blip'); }
      if (Input.hit('down')) { this.sel = Math.min(ROWS - 1, this.sel + 1); CK.Audio.sfx('blip'); }
      if (Input.hit('left')) { this.cols[this.sel] = Math.max(0, this.cols[this.sel] - 1); CK.Audio.sfx('tape'); }
      if (Input.hit('right')) { this.cols[this.sel] = Math.min(COLS - 1, this.cols[this.sel] + 1); CK.Audio.sfx('tape'); }
      for (let r = 1; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...this.cell(r, c))) { this.sel = r; this.cols[r] = c; CK.Audio.sfx('tape'); }
      const btn = (r) => Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...r);
      if (Input.key('KeyT') || Input.hit('ok') || btn([760, 400, 130, 40])) this.test();
      if ((Input.key('KeyH') || btn([760, 350, 130, 40])) && this.fails >= 1) { this.applySolution(); CK.Audio.sfx('magic'); this.msg = 'Grandma\'s blueprint: wiggle left into the first pool, back across, then right into the second.'; }
      if (Input.hit('back') || btn([760, 450, 130, 40])) this.close();
    }
    draw(ctx) {
      ctx.fillStyle = '#9fd27a'; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 80; i++) D.circle(ctx, U.hash(i, 1) * W, U.hash(i, 2) * H, 2, 'rgba(60,120,40,0.25)');
      D.text(ctx, 'Blueprint: give Reedwhistle Brook its bends back', W / 2, 34, { size: 22, weight: 700, align: 'center' });
      D.text(ctx, 'At least 4 bends · through both deep pools · around the houses · out at the arrow · one square sideways per row', W / 2, 58, { size: 13, weight: 600, align: 'center', color: '#2f5a2a' });
      D.panel(ctx, 236, 82, COLS * 50 + 24, ROWS * 50 + 24, { fill: '#e8f4d8', tape: false });
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const [x, y, w, h] = this.cell(r, c);
        D.rr(ctx, x, y, w, h, 6); ctx.fillStyle = (r + c) % 2 ? '#b9e08a' : '#aed87e'; ctx.fill();
        if (POOLS.some(([pr, pc]) => pr === r && pc === c)) { D.ellipse(ctx, x + 24, y + 24, 20, 14, '#2d7ca4', C.ink, 2); D.text(ctx, 'POOL', x + 24, y + 28, { size: 9, weight: 700, align: 'center', color: '#fff' }); }
        if (HOUSES.some(([hr, hc]) => hr === r && hc === c)) { D.box3(ctx, x + 8, y + 14, 30, 24, 8, { r: 2, lw: 2, fill: '#e2b27a', flute: false }); D.poly(ctx, [x + 4, y + 16, x + 23, y + 2, x + 42, y + 16], '#6cc56c', C.ink, 2); }
      }
      // the brook as drawn
      const pts = this.cols.map((c, r) => { const [x, y] = this.cell(r, c); return [x + 24, y + 24]; });
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1] - 30); pts.forEach(([x, y], i) => { if (!i) ctx.lineTo(x, y); else { const [px, py] = pts[i - 1]; ctx.bezierCurveTo(px, py + 25, x, y - 25, x, y); } }); ctx.lineTo(pts[ROWS - 1][0], pts[ROWS - 1][1] + 30);
      ctx.lineCap = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 20; ctx.stroke(); ctx.strokeStyle = '#5ac8d8'; ctx.lineWidth = 15; ctx.stroke();
      // flow test: a bright pulse runs down the brook, fast or slow
      if (this.state === 'test' || this.state === 'result') {
        const k = Math.min(this.flow, ROWS - 1), i = Math.floor(k), fr = k - i;
        const a = pts[i], b = pts[Math.min(ROWS - 1, i + 1)];
        const fx = a[0] + (b[0] - a[0]) * fr, fy = a[1] + (b[1] - a[1]) * fr;
        D.circle(ctx, fx, fy, 10, '#fffaf0', C.ink, 2);
        drawFish(ctx, 'minnow', fx + 18, fy - 10, 26, { flip: false });
      }
      const [ax, ay] = this.cell(ROWS - 1, OUT);
      D.poly(ctx, [ax + 14, ay + 52, ax + 34, ay + 52, ax + 24, ay + 66], '#ef6b6b', C.ink, 2);
      // the row cursor
      if (this.state === 'build') { const [x, y] = this.cell(this.sel, 0); D.poly(ctx, [x - 22, y + 14, x - 6, y + 24, x - 22, y + 34], '#ffd25a', C.ink, 2); }
      D.button(ctx, 760, 350, 130, 40, 'Blueprint (H)', { size: 13, disabled: this.fails < 1 });
      D.button(ctx, 760, 400, 130, 40, 'Test it! (T)', { size: 14 });
      D.button(ctx, 760, 450, 130, 40, 'Leave', { size: 14 });
      D.text(ctx, `Bends: ${this.bends()}`, 825, 120, { size: 20, weight: 700, align: 'center', color: this.bends() >= 4 ? '#2f6a3a' : '#c2410c' });
      D.wrap(ctx, 'Straightened rivers push floods downstream faster. Bends, deep pools and reed beds slow the water down and give fish somewhere to rest.', 200, 13, 500).forEach((l, i) => D.text(ctx, l, 736, 160 + i * 18, { size: 13, weight: 500, color: '#2f5a2a' }));
      D.portrait(ctx, 'fen', 60, 120, this.solved ? 'happy' : 'sad');
      if (this.msg) { D.panel(ctx, 40, 450, 640, 74, { fill: this.solved ? '#e8f8e0' : '#fffaf0', tape: false }); D.wrap(ctx, this.msg, 600, 14, 600).forEach((l, i) => D.text(ctx, l, 360, 476 + i * 19, { size: 14, weight: 600, align: 'center', color: this.solved ? '#2f6a3a' : '#3d2412' })); }
      D.text(ctx, 'Up/Down: pick a row · Left/Right: move the brook · Z or T: test', 360, 440, { size: 12, weight: 600, align: 'center', color: '#2f5a2a' });
    }
  }
  CK.MeanderScene = MeanderScene;

  // ================================================================ AQUARIUM (Patchwork Hall)
  const baseHallDraw = CK.HallScene.prototype.draw;
  CK.HallScene.prototype.draw = function (ctx) {
    baseHallDraw.call(this, ctx);
    const kindsCaught = Object.keys(book());
    const x = 560, y = 432, w = 240, h = 92;
    D.box3(ctx, x - 6, y + h - 2, w + 12, 12, 8, { r: 2, lw: 2.5, fill: '#8a5a2e', flute: false });
    D.rr(ctx, x, y, w, h, 6);
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(140,220,240,0.85)'); g.addColorStop(1, 'rgba(40,140,180,0.9)');
    ctx.fillStyle = g; ctx.fill();
    ctx.save(); D.rr(ctx, x, y, w, h, 6); ctx.clip();
    for (let i = 0; i < 6; i++) { const p = (this.t * 0.4 + i / 6) % 1; D.circle(ctx, x + 20 + i * 38, y + h - p * h, 3, 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.8)', 1); }
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x + 14 + i * 50, y + h); ctx.quadraticCurveTo(x + 24 + i * 50 + Math.sin(this.t * 2 + i) * 6, y + h - 30, x + 18 + i * 50, y + h - 50); stroke(ctx, 3, '#4a8a3a'); }
    kindsCaught.forEach((id, i) => {
      const ph = this.t * (0.3 + U.hash(i, 3) * 0.3) + i * 1.7;
      const fx = x + w / 2 + Math.sin(ph) * (w / 2 - 30), fy = y + 18 + (i % 4) * 18 + Math.sin(ph * 2) * 4;
      drawFish(ctx, id, fx, fy, 30, { flip: Math.cos(ph) < 0, t: this.t, seed: i });
    });
    ctx.restore();
    D.rr(ctx, x, y, w, h, 6); stroke(ctx, 3);
    D.line(ctx, x + 8, y + 8, x + 30, y + 8, 'rgba(255,255,255,0.7)', 3);
    D.text(ctx, kindsCaught.length ? `FISH COUNT: ${kindsCaught.length} of ${Object.keys(FISH).length} kinds` : 'AQUARIUM (go fishing!)', x + w / 2, y - 8, { size: 12, weight: 700, align: 'center', color: '#fff4dc', outline: C.ink, ow: 3 });
  };

  CK.debugMarsh = { allFish() { for (const k of Object.keys(FISH)) book()[k] = FISH[k].size[1]; } };
})();
