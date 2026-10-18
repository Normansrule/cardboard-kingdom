// Cardboard Kingdom - Rivet, a companion who follows you (v2.15).
// From the inspiration atlas's companion card (attachment, following, a useful ability), as an
// original creature: Rivet is a bottle-cap beetle from Thimble Row who picks Sam after the festival.
//  * Following: Rivet trots behind the party in every Kingdom place (not the real world).
//  * Ability: Rivet can smell buried buttons. Each place hides two; Rivet runs to the nearest one and
//    wiggles, a sparkle shows where to dig, and digging pays out scraps. Only visible with Rivet.
//  * Attachment: Rivet's heart grows with every button, and Rivet has something to say about it.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Data = CK.Data, CH = D.chars;
  const TS = 48, C = D.C, TAU = Math.PI * 2;
  const f = (k) => CK.flag(k);
  const S = CK.Story.scripts;
  const stroke = (ctx, lw, col) => { ctx.strokeStyle = col || C.ink; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };
  const has = () => f('rivet');
  const buttons = () => CK.G.flags.rivet_buttons || 0;

  // ================================================================ ART
  // a red bottle-cap shell with a crimped rim, a little dark head, feelers and six busy legs
  CH.rivet = function (ctx, x, y, o) {
    const s = o.s || 1, t = CK.time + (o.seed || 0);
    const walk = o.walk ? Math.sin(o.walk * 2) : Math.sin(t * 3) * 0.3;
    const dir = o.dir || 'down', side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const hop = o.excited ? Math.abs(Math.sin(t * 10)) * 5 * s : 0;
    D.shadow(ctx, x, y, 13 * s, 4 * s);
    y -= hop;
    for (const k of [-1, 1]) for (let i = 0; i < 3; i++) D.line(ctx, x + k * 6 * s, y - 6 * s + i * 2 * s, x + k * (12 + (i === 1 ? walk * 2 : 0)) * s, y - 1 * s + i * 1.5 * s, C.ink, 1.6 * s);
    // the cap: crimped rim then the dome
    ctx.beginPath();
    for (let i = 0; i <= 21; i++) { const a = Math.PI + (i / 21) * Math.PI, r = (i % 2 ? 12 : 13.5) * s; ctx.lineTo(x + Math.cos(a) * r, y - 7 * s + Math.sin(a) * r * 0.9); }
    ctx.closePath(); ctx.fillStyle = '#d84a4a'; ctx.fill(); stroke(ctx, 1.8);
    ctx.beginPath(); ctx.ellipse(x, y - 9 * s, 9 * s, 7 * s, 0, Math.PI, 0); ctx.closePath(); D.fillVol(ctx, x - 2 * s, y - 13 * s, 9 * s, '#ef6b6b', 1.4);
    D.circle(ctx, x - 3 * s, y - 13 * s, 1.8 * s, 'rgba(255,255,255,0.7)');
    // head poking out the front (or the back, walking away)
    if (dir !== 'up') {
      const hx = x + side * 9 * s, hy = y - 4 * s;
      D.ball(ctx, hx, hy, 5.5 * s, '#3a3040', { lw: 1.5 });
      for (const k of [-1, 1]) { D.circle(ctx, hx + k * 2.2 * s, hy - 0.5 * s, 1.5 * s, '#fffaf0'); D.circle(ctx, hx + k * 2.2 * s + side * 0.4 * s, hy - 0.3 * s, 0.8 * s, '#120e14'); }
      for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(hx + k * 2 * s, hy - 4 * s); ctx.quadraticCurveTo(hx + k * 6 * s, hy - 12 * s + Math.sin(t * 6 + k) * 1.5 * s, hx + k * 8 * s, hy - 13 * s); stroke(ctx, 1.4); D.circle(ctx, hx + k * 8 * s, hy - 13 * s, 1.6 * s, '#ffd25a'); }
    }
    if (o.mood === 'heart' || o.heart) { const b = Math.sin(t * 5) * 2; D.text(ctx, '♥', x + 10 * s, y - 26 * s + b, { size: 14 * s, weight: 700, align: 'center', color: '#ef6b6b', outline: C.ink, ow: 3 }); }
  };
  Object.assign(Data.speakers, { rivet: { name: 'Rivet', look: 'rivet', ps: 3.2, py: -24, bg: '#ffe6e0' } });

  // ================================================================ FOLLOWING
  const baseBuild = CK.Overworld.prototype.buildEntities;
  CK.Overworld.prototype.buildEntities = function () {
    baseBuild.call(this);
    if (!has() || this.ch.id === 'campus' || !CK.G.party.length) return;
    const tr = this.trail[48] || this.trail[this.trail.length - 1];
    this.ents.push({ type: 'deco', kind: 'rivet_follow', id: 'rivet_follow', x: 0, y: 0, px: tr.x, py: tr.y, dir: tr.dir });
    // two buried buttons per place, chosen once and kept (only Rivet can smell them)
    for (const [i, [x, y]] of digSpots(this).entries()) {
      const id = `rivet_${this.ch.id}_${i}`;
      if (f(id)) continue;
      this.ents.push({ type: 'deco', kind: 'rivet_dig', id, x, y, px: (x + 0.5) * TS, py: (y + 0.75) * TS, label: 'Dig!', script: () => digScript(id) });
    }
  };
  // pick two open ground tiles away from everything, deterministic per place
  function digSpots(ow) {
    const G = CK.G, key = 'rivet_spots_' + ow.ch.id;
    if (G.flags[key]) return G.flags[key];
    const m = ow.map, out = [], occupied = (x, y) => ow.ch.objects.some((o) => Math.abs(o.x - x) < 3 && Math.abs(o.y - y) < 3);
    for (let n = 0; n < 4000 && out.length < 2; n++) {
      const x = 2 + Math.floor(U.hash(n, 7, ow.ch.id.length) * (m.w - 4)), y = 2 + Math.floor(U.hash(n, 11, ow.ch.id.length * 3) * (m.h - 4));
      if (!'.,'.includes(m.get(x, y)) || occupied(x, y)) continue;
      if (![[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => '.,='.includes(m.get(x + dx, y + dy)))) continue;
      if (out.some(([a, b]) => Math.abs(a - x) + Math.abs(b - y) < 8)) continue;
      if (ow.solidAt((x + 0.5) * TS, (y + 0.75) * TS)) continue;
      out.push([x, y]);
    }
    G.flags[key] = out;
    return out;
  }
  const baseUpdate = CK.Overworld.prototype.update;
  CK.Overworld.prototype.update = function (dt, active) {
    baseUpdate.call(this, dt, active);
    const r = this.ents && this.ents.find((e) => e.id === 'rivet_follow');
    if (!r) return;
    // follow the trail, but run ahead to a buried button when one is close
    const near = this.ents.filter((e) => e.kind === 'rivet_dig').map((e) => [e, Math.hypot(e.px - this.player.x, e.py - this.player.y)]).sort((a, b) => a[1] - b[1])[0];
    const tr = this.trail[48] || this.trail[this.trail.length - 1];
    let tx = tr.x, ty = tr.y;
    r.excited = !!(near && near[1] < TS * 4);
    if (r.excited) { tx = near[0].px + 26; ty = near[0].py; }
    const dx = tx - r.px, dy = ty - r.py, d = Math.hypot(dx, dy);
    const sp = Math.min(d, (r.excited ? 260 : 220) * dt + d * 0.05);
    if (d > 1) { r.px += (dx / d) * sp; r.py += (dy / d) * sp; r.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down'; r.walk = (r.walk || 0) + sp * 0.08; }
    else r.walk = 0;
    if (r.excited && !this._rivetSniff) { this._rivetSniff = true; CK.Audio.sfx('blip'); }
    if (!r.excited) this._rivetSniff = false;
  };
  CK.DecoDraw.rivet_follow = function (ctx, e, x, y) {
    D.char(ctx, 'rivet', x, y, { s: 1.5, dir: e.dir, walk: e.walk, excited: e.excited, heart: this.t - (this._rivetHeart || -9) < 2, noShadow: true });
    if (e.excited) D.text(ctx, '!', x, y - 46 + Math.sin(this.t * 10) * 2, { size: 18, weight: 700, align: 'center', color: '#ffd25a', outline: C.ink, ow: 3 });
  };
  CK.DecoDraw.rivet_dig = function (ctx, e, x, y) {
    // a little mound with a sparkle, only showing once Rivet has sniffed it out
    const r = this.ents.find((q) => q.id === 'rivet_follow');
    const sniffed = r && Math.hypot(r.px - e.px, r.py - e.py) < TS * 2.5;
    D.ellipse(ctx, x + 24, y + 4, 16, 6, 'rgba(110,80,40,0.35)');
    if (!sniffed) return;
    D.ellipse(ctx, x + 24, y + 2, 13, 5, '#a8865a', C.ink, 1.5);
    D.star(ctx, x + 24, y - 10 + Math.sin(this.t * 5) * 3, 7, '#ffd25a', 5, this.t * 2);
  };

  // ================================================================ DIGGING
  const LINES = [
    'Rivet clicks proudly. (Rivet is VERY proud.)',
    'Rivet does a little lap of honour around the hole.',
    'Rivet sneezes dirt on your shoe. Then looks pleased about it.',
    'Rivet carries the button around for a while before letting you have it.',
    'Rivet\'s shell goes slightly redder. You think that means happy.',
  ];
  function digScript(id) {
    return [
      { fn: () => { CK.Audio.sfx('build'); if (CK.OW) { CK.OW.shake = 2; CK.OW._rivetHeart = CK.OW.t; } } },
      { narrate: 'You dig where Rivet is wiggling. A giant button! Somebody in this world lost it a long time ago.' },
      { fn: () => { CK.setFlag(id); CK.G.flags.rivet_buttons = buttons() + 1; if (CK.OW) CK.OW.buildEntities(); } },
      { scraps: 8 },
      { fn: () => [{ narrate: `${U.pick(LINES)} (Buttons found: ${buttons()})` }].concat(buttons() === 5 ? [['pim', 'FIVE buttons? Rivet must really like you. Bottle-cap beetles only dig for people they\'ve picked.', 'happy'], { journal: 'Rivet has dug up five buttons with me. Pim says bottle-cap beetles only dig for people they\'ve picked.' }] : []) },
      { save: true },
    ];
  }

  // ================================================================ MEETING RIVET (Thimble Row, after the festival)
  CK.Chapters.thimble.objects.push({ type: 'npc', id: 'rivet_wild', name: 'Rivet', x: 19, y: 12, look: 'rivet', o: { s: 1.2 }, talk: 'rivet_meet', cond: () => f('th_done') && !has() });
  S.rivet_meet = [
    { narrate: 'A little bottle-cap beetle has been sitting by your feet since the Teapot. It clicks hopefully.' },
    ['pim', 'That\'s a bottle-cap beetle! They pick one person, and then they follow them forever. It picked YOU.', 'happy'],
    ['pim', 'It can smell buttons. Everyone loses buttons. There are buttons buried EVERYWHERE.', 'happy'],
    { choice: { who: 'sam', text: 'Bring the beetle along?', options: [
      { label: 'Come on, little one!', then: [
        ['sam', 'You need a name. Something small and sturdy. ...Rivet?', 'happy'],
        { narrate: 'Rivet clicks twice. That is apparently a yes.' },
        { flag: 'rivet' },
        { fn: () => { if (CK.OW) CK.OW.buildEntities(); } },
        { narrate: 'Rivet joins you! Rivet follows you everywhere in the Kingdom. When Rivet gets excited and runs off, follow: there\'s a button buried there.' },
        { journal: 'A bottle-cap beetle from Thimble Row picked me. I named it Rivet. Rivet can smell buried buttons, and there are two hidden in every place in the Kingdom.' },
        { save: true },
      ] },
      { label: 'Not yet', then: [{ narrate: 'The beetle settles down by the fountain to wait. It is very good at waiting.' }] },
    ] } },
  ];

  // Rivet stays in the Kingdom when Sam goes home, and says so
  const baseGoto = CK.gotoChapter;
  CK.gotoChapter = function (id, pos) {
    baseGoto(id, pos);
    if (id === 'campus' && has() && !f('rivet_home_note')) { CK.setFlag('rivet_home_note'); CK.runScript([{ narrate: 'Rivet stays on the Kingdom side of the box, guarding it. It will be right there when you come back.' }]); }
  };
  CK.debugRivet = { spots: (ow) => digSpots(ow || CK.OW) };
})();
