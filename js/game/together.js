// Cardboard Kingdom - A Kingdom that lives together (v2.25).
// Builds on the neighbor friendships in friendships.js:
//  * Favours: after their first heart story, each neighbor asks for one small thing that sends you
//    into the rest of the game (find a paper crane, dig up treasure, shake trees for colours...).
//    Nothing expires. Finish it whenever, then tell them: hearts, bottle caps, and they let slip
//    something they love.
//  * The Neighborhood Picnic: once four neighbors have told you their three-heart stories, the Mayor
//    offers to host. Everyone you've met comes to Blossom Hollow, from every season, and they talk
//    to EACH OTHER (Hoot and his first reader, Nib measuring the Mayor's hat). It ends with a group
//    photo you keep on the Neighbors page.
//  * Little lives: when you're not right next to them, neighbors do their own thing on the map.
//    Robin sorts letters, Bristle rakes, Ember sketches, Mama Burrow knits hearts.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input;
  const W = CK.W, H = CK.H;
  const C = D.C, TAU = Math.PI * 2;
  const f = (k) => CK.flag(k);
  const OW = CK.Overworld.prototype;
  const NB = CK.Neighbors9;
  const { N, IDS, st, hearts, evSeen, met } = NB;
  const stroke = (ctx, lw, col) => { ctx.strokeStyle = col || C.ink; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };
  const tallyOf = (k) => (CK.Pastimes.pt().tally[k] || 0);

  // ================================================================ FAVOURS
  // key/n: a Pastimes tally to watch, counted from when you said yes.
  const FAV = {
    clover: { key: 'cranesJob', n: 1, what: 'Find one of Grandma Rosie\'s paper cranes',
      ask: [['bunny', 'Knight, have you ever seen one of Grandma Rosie\'s paper cranes? Robin says they\'re hidden all over the Kingdom.', 'idea'], ['bunny', 'Could you find one and tell me what wish was on it? I want to know what a grown-up wishes for.', 'happy']],
      thanks: [['bunny', 'You found one! What did the wish say? ...Oh. That\'s a good wish. I\'m putting it on the Brave List. Number: wishing.', 'heart']] },
    robin: { key: 'signsRead', n: 2, what: 'Check that two signposts point the right way',
      ask: [['robin', 'Could you check two signposts for me? If a sign points the wrong way, a whole letter goes to the wrong pond.', 'sweat'], ['robin', 'It happened once. The frogs were very polite about it.', 'happy']],
      thanks: [['robin', 'Both pointing true! The mail thanks you. I thank you. Hm hm hmmm.', 'heart']] },
    mayor: { key: 'visits', n: 1, what: 'Sit for a moment at one of the Kingdom\'s quiet landmarks',
      ask: [['mayor', 'A favour, Sam. Visit one of the quiet corners of the Kingdom. A well, a lookout, a picnic spot. Sit for a moment.', 'happy'], ['mayor', 'A mayor should know his places. I am too slow to visit them all. Tell me about one.', 'happy']],
      thanks: [['mayor', 'Ah. You sat. I can tell. You have a sitting face. Tell me everything... slowly.', 'heart']] },
    dabble: { key: 'drinks', n: 1, what: 'Try a warm drink at a stand, for "research"',
      ask: [['duck', 'Undercover mission. Go have a warm drink at one of the stands in the Kingdom.', 'idea'], ['duck', 'Then tell me if it beats nine waves. Be honest. Be brutal. Be a little bit nice.', 'happy']],
      thanks: [['duck', 'Seven waves? SEVEN? Ha! ...Quack. Sorry. That\'s a happy quack.', 'heart']] },
    nib: { key: 'digs', n: 1, what: 'Dig up a buried treasure and measure the hole',
      ask: [['mouse', 'Treasure maps have an X. Can you dig one up for me?', 'idea'], ['mouse', 'And tell me how deep the hole was. In mouse-lengths, please. Rough estimates are fine. Technically.', 'happy']],
      thanks: [['mouse', 'Eleven mouse-lengths deep? That\'s technically a whole engineering project. I\'m putting it in the notebook.', 'heart']] },
    ember: { key: 'shakes', n: 3, what: 'Shake three trees for Ember\'s colour ideas',
      ask: [['fox', 'I need colours for next year\'s Lantern Walk. Shake three trees for me and tell me what falls.', 'idea'], ['fox', 'Leaves, apples, a surprised squirrel. It\'s all inspiration.', 'happy']],
      thanks: [['fox', 'Apple-red, leaf-gold and surprised-squirrel-brown. That\'s a whole collection. You have an eye, Sam.', 'heart']] },
    bristle: { key: 'placed', n: 1, what: 'Make a cozy corner in your patch',
      ask: [['hedgehog', 'Would you... make a cozy corner in your garden patch? Something nice to sit by. For the critters.', 'sweat'], ['hedgehog', 'Sorry. Only if you want. You don\'t have to. Thank you.', 'happy']],
      thanks: [['hedgehog', 'You made a cozy corner! The critters are going to love it. I love it. Sorry. Thank you.', 'heart']] },
    hoot: { key: 'spots', n: 2, what: 'Sketch any two critters for Volume Twelve',
      ask: [['owl', 'Data for Volume Twelve! Sketch any two critters for me.', 'idea'], ['owl', 'Footnote: from outside. With your feet wet. That is the scientific method now.', 'happy']],
      thanks: [['owl', 'Two sketches! Hoo. Footnote: these are going in the appendix. Second footnote: the appendix is my favourite part.', 'heart']] },
    mama: { key: 'petsJob', n: 1, what: 'Give Biscuit the cat a scratch from Mama Burrow',
      ask: [['bear', 'That cardboard cat keeps turning up at my door for stew. Every place, every season. I don\'t know how.', 'happy'], ['bear', 'Give Biscuit a scratch from me next time you see it, would you, dear?', 'happy']],
      thanks: [['bear', 'You found it? And it purred? Good. Everybody needs somebody to scratch behind their ears, dear. Even cats who walk between worlds.', 'heart']] },
  };
  const fav = () => { const s = st(); s.fav = s.fav || {}; s.favDone = s.favDone || {}; return s; };
  const favActive = (id) => fav().fav[id] !== undefined && !fav().favDone[id];
  const favProg = (id) => Math.min(FAV[id].n, tallyOf(FAV[id].key) - fav().fav[id]);
  const favReady = (id) => favActive(id) && favProg(id) >= FAV[id].n;
  const favOpen = (id) => evSeen(id) >= 1 && fav().fav[id] === undefined && !fav().favDone[id];
  const favCount = () => Object.keys(fav().favDone).length;

  // an unsure neighbor tells you something they love, as a thank-you
  function revealLove(id) {
    const s = st(), known = (s.known[id] = s.known[id] || {});
    const dec = N[id].loves.find((d) => known[d] !== 'love');
    if (!dec) return [];
    known[dec] = 'love';
    const d = CK.Garden.DECOR.find((q) => q.id === dec);
    return [{ narrate: `${N[id].name} whispers: "Between you and me, I love a good ${d.name.toLowerCase()}." (Noted on the Neighbors page.)` }];
  }

  NB.PRE.push((id, ow, e) => {
    if (!FAV[id] || !favReady(id)) return null;
    return FAV[id].thanks.concat([{ fn: () => {
      fav().favDone[id] = true;
      NB.addPts(id, 6, ow, e);
      CK.Pastimes.caps(25, 'favour for ' + N[id].name);
      CK.Pastimes.tally('favours');
      return revealLove(id).concat([{ journal: `Did ${N[id].name} a favour: ${FAV[id].what.charAt(0).toLowerCase() + FAV[id].what.slice(1)}.` }]);
    } }]);
  });
  NB.EXTRA.push((id) => {
    if (!FAV[id] || !favOpen(id)) return null;
    return { label: 'Can I help with anything?', then: FAV[id].ask.concat([{ fn: () => {
      fav().fav[id] = tallyOf(FAV[id].key);
      CK.toast(`Favour for ${N[id].name}: ${FAV[id].what}. (No rush. It's on the Neighbors page.)`, '#ffe3ef');
    } }]) };
  });

  // ================================================================ THE PICNIC
  const picnicDone = () => !!st().picnic;
  const picnicReady = () => !picnicDone() && f('spring_dam') && IDS.filter((id) => evSeen(id) >= 3).length >= 4;
  const guests = () => IDS.filter(met);

  NB.EXTRA.push((id) => {
    if (id !== 'mayor' || !picnicReady()) return null;
    return { label: '♥ Mayor, shall we have a picnic?', then: picnicScript() };
  });

  // where everyone sits: back row behind the blanket, front row in front, the party on the left
  const BACK = [[318, 262], [404, 252], [490, 248], [576, 252], [662, 262]];
  const FRONT = [[360, 352], [460, 360], [560, 360], [656, 350]];
  function seats(who) {
    const out = {};
    who.forEach((id, i) => { out[id] = i < 5 ? BACK[i] : FRONT[i - 5]; });
    return out;
  }
  function drawBackdrop(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#bfe6ff'); g.addColorStop(0.5, '#e8f7ff'); g.addColorStop(0.51, '#bfe39a'); g.addColorStop(1, '#8fcf6a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // soft hills and blossom trees, all a bit like cut paper
    ctx.fillStyle = '#a8d98a'; ctx.beginPath(); ctx.moveTo(0, 290); ctx.quadraticCurveTo(240, 200, 520, 270); ctx.quadraticCurveTo(760, 330, W, 230); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    for (const [x, y, r] of [[90, 210, 54], [830, 190, 62], [740, 230, 40], [200, 240, 36]]) {
      D.rr(ctx, x - 6, y, 12, 70, 4); ctx.fillStyle = '#8a5a3a'; ctx.fill(); stroke(ctx, 2);
      D.ball(ctx, x, y - r * 0.4, r, '#ffc2d8', { lw: 2.2 });
      for (let k = 0; k < 6; k++) D.circle(ctx, x + Math.cos(k * 1.1) * r * 0.55, y - r * 0.4 + Math.sin(k * 1.7) * r * 0.45, 4, '#ff8fb8');
    }
    // bunting across the top
    ctx.beginPath(); ctx.moveTo(0, 30); ctx.quadraticCurveTo(W / 2, 90, W, 30); stroke(ctx, 2);
    for (let i = 1; i < 16; i++) {
      const x = (i / 16) * W, k = i / 16, y = 30 + 4 * 60 * k * (1 - k) * (1 / 1.0) * 1;
      const sw = D.calm() ? 0 : Math.sin(t * 2 + i) * 2;
      D.poly(ctx, [x - 12, y, x + 12, y, x + sw, y + 24], ['#ef6b6b', '#ffd25a', '#7fc6f0', '#9bd07a', '#c9a7ff'][i % 5], C.ink, 1.6);
    }
    // falling petals
    if (!D.calm()) for (let i = 0; i < 18; i++) { const px = (U.hash(i, 1, 9) * W + t * 20 * (0.5 + U.hash(i, 2, 9))) % W, py = (U.hash(i, 3, 9) * H + t * 30) % H; D.egg(ctx, px, py, 3, 2, '#ffb7d5', { lw: 0, rot: t + i }); }
  }
  function drawBlanket(ctx) {
    ctx.save(); ctx.beginPath(); ctx.ellipse(490, 306, 230, 44, 0, 0, TAU); ctx.clip();
    ctx.fillStyle = '#fffaf0'; ctx.fillRect(250, 250, 480, 120);
    ctx.fillStyle = 'rgba(232,80,80,.45)'; for (let x = 250; x < 740; x += 22) ctx.fillRect(x, 250, 11, 120); for (let y = 250; y < 370; y += 16) ctx.fillRect(250, y, 480, 8);
    ctx.restore(); ctx.beginPath(); ctx.ellipse(490, 306, 230, 44, 0, 0, TAU); stroke(ctx, 2.4);
    // food
    for (const [x, y] of [[400, 300], [420, 312], [560, 296]]) D.poly(ctx, [x - 12, y + 6, x + 12, y + 6, x, y - 10], '#ffe9b0', C.ink, 1.6);
    D.ellipse(ctx, 490, 312, 26, 10, '#e8a24a', C.ink, 1.8); D.ellipse(ctx, 490, 308, 20, 6, '#c9542c');
    D.poly(ctx, [600, 316, 618, 316, 620, 290, 598, 290], 'rgba(220,240,255,.9)', C.ink, 1.6); D.poly(ctx, [599, 314, 619, 314, 620, 302, 598, 302], '#ffad3b');
    for (const [x, y] of [[452, 322], [466, 326], [528, 324]]) D.ball(ctx, x, y, 6, '#ef6b6b', { lw: 1.4 });
  }
  // the whole picnic. o.cheer: everyone's arms up for the photo
  function drawPicnic(ctx, who, t, o = {}) {
    drawBackdrop(ctx, t);
    const S = seats(who), talking = CK.talkingWho;
    const draw = (id) => {
      const R = N[id], sp = CK.Data.speakers[R.spk], [x, y] = S[id], mayor = sp.look === 'mayor';
      const pose = o.cheer ? 'cheer' : undefined;
      D.char(ctx, sp.look, x, y, Object.assign({ s: mayor ? 1.55 : 1.5, seed: x }, sp.o, { prop: NB.propOf(id), mood: o.cheer ? 'happy' : sp.o && sp.o.mood, pose, talk: talking === R.spk, gaze: [((490 - x) / 300), 0.2] }));
    };
    who.slice(0, 5).forEach(draw);
    drawBlanket(ctx);
    who.slice(5).forEach(draw);
    const party = [['corry', 110, 335, 1.2], ['pip', 220, 230, 1.2], ['sam', 205, 365, 1.35]];
    for (const [k, x, y, s] of party) D.char(ctx, k, x, y, { s, dir: 'right', talk: talking === k, mood: o.cheer ? 'happy' : undefined, pose: o.cheer ? 'cheer' : undefined });
  }

  class PicnicScene {
    constructor(who) { this.who = who; this.t = 0; this.flash = 0; this.cheer = false; }
    update(dt) { this.t += dt; if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 1.6); }
    snap() { this.flash = 1; this.cheer = true; CK.Audio.sfx('perfect'); }
    draw(ctx) {
      drawPicnic(ctx, this.who, this.t, { cheer: this.cheer });
      if (this.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${this.flash})`; ctx.fillRect(0, 0, W, H); }
    }
  }

  // a polaroid of the picnic
  function drawPhoto(ctx, cx, cy, sc, who, t, rot) {
    const pw = W * sc, ph = H * sc * 0.78;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot || 0);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-pw / 2 - 14 + 6, -ph / 2 - 14 + 8, pw + 28, ph + 70);
    ctx.fillStyle = '#fffdf6'; ctx.fillRect(-pw / 2 - 14, -ph / 2 - 14, pw + 28, ph + 70); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.strokeRect(-pw / 2 - 14, -ph / 2 - 14, pw + 28, ph + 70);
    ctx.save(); ctx.beginPath(); ctx.rect(-pw / 2, -ph / 2, pw, ph); ctx.clip();
    ctx.translate(-pw / 2, -ph / 2); ctx.scale(sc, sc); ctx.translate(0, -H * 0.1);
    drawPicnic(ctx, who, t, { cheer: true });
    ctx.restore();
    D.text(ctx, 'The Neighborhood Picnic, Blossom Hollow', 0, ph / 2 + 30, { size: 16, weight: 700, align: 'center', color: '#5a3a22' });
    D.text(ctx, `${who.length} neighbors, 3 friends, 1 blanket`, 0, ph / 2 + 48, { size: 12, weight: 600, align: 'center', color: '#8a6a4a' });
    ctx.restore();
  }
  class PhotoCard {
    constructor(who) { this.who = who; this.t = 0; this.transparent = true; this.finished = false; }
    update(dt) {
      this.t += dt;
      if (CK.autoSkip || (this.t > 0.7 && (Input.hit('ok') || Input.hit('back') || Input.mouse.pressed))) { this.finished = true; CK.Scenes.remove(this); }
    }
    draw(ctx) {
      const P = D.pal(), k = D.calm() ? 1 : CK.Ease.ui(Math.min(1, this.t * 2.5));
      ctx.fillStyle = P.scrim; ctx.fillRect(0, 0, W, H);
      drawPhoto(ctx, W / 2, H / 2 - 20 + (1 - k) * 40, 0.62, this.who, 3, -0.03 * k);
      D.text(ctx, 'Kept on the Neighbors page (press P there)', W / 2, H - 22, { size: D.T.small, weight: 700, align: 'center', color: '#fffaf0' });
    }
  }

  // who says what. need: everyone in it must be at the picnic.
  const LINES = [
    { need: ['mayor'], lines: [['mayor', 'Citizens of the Kingdom. Friends. Neighbors. (Pause for applause.)', 'happy'], { narrate: 'Everyone claps. The Mayor has to sit down for a moment.' }] },
    { need: ['clover', 'robin'], lines: [['bunny', 'Robin! Did you bring any letters?', 'happy'], ['robin', 'Just one. It\'s for everybody. It says THANK YOU, very loopy.', 'heart']] },
    { need: ['hoot', 'bristle'], lines: [['owl', 'Footnote: Bristle has finished Volume Three. In under a month.', 'happy'], ['hedgehog', 'Sorry. I mean, yes. I liked the bit about the gutters. I read it twice.', 'heart']] },
    { need: ['nib', 'mayor'], lines: [['mouse', 'Mayor, technically your hat is thirty-one mouse-lengths tall.', 'idea'], ['mayor', 'Thirty-two. I measured twice.', 'happy']] },
    { need: ['dabble', 'mama'], lines: [['duck', 'Mama Burrow, your stew is ten waves. I don\'t give ten waves. I gave you ten waves.', 'happy'], ['bear', 'And your juice, dear. Bramble drank three cups. He is vibrating.', 'happy']] },
    { need: ['ember', 'clover'], lines: [['fox', 'Clover, that flower crown is first-cherry-of-June pink. Iconic.', 'happy'], ['bunny', 'I don\'t know what iconic means but I AM it.', 'star']] },
    { need: ['ember', 'bristle'], lines: [{ narrate: 'Bristle is wearing the cape Ember made him. It is caught on four of his prickles. He looks very proud.' }] },
    { need: ['robin', 'dabble'], lines: [['robin', 'Dabble, you and your sister sent each other eleven postcards this month. From fifteen minutes away.', 'happy'], ['duck', 'We have a LOT to catch up on.', 'heart']] },
    { need: ['nib', 'hoot'], lines: [['mouse', 'Professor, can I borrow Volume Seven? Technically I\'ll understand most of it.', 'idea'], ['owl', 'Hoo! A SECOND reader! Footnote: I may cry into the sandwiches.', 'heart']] },
    { need: ['mama', 'clover'], lines: [['bear', 'Clover, dear, is that your monster friend by the hedge? Puddle? Tell Puddle there\'s stew.', 'happy'], { narrate: 'A very small monster in a too-big flower crown edges up to the blanket and takes one sandwich, very politely.' }] },
    { need: [], lines: [['pip', 'I count everyone, three of us, one blanket and forty-one sandwiches.', 'happy'], ['corry', 'Forty. I have had one. For the Ledger.', 'happy']] },
    { need: [], lines: [['sam', 'Grandma always says you know a bridge works when people stop on it to talk.', 'happy'], ['sam', 'I think that goes for a whole kingdom.', 'heart']] },
  ];
  function picnicScript() {
    let sc = null;
    const who = guests();
    const has = (ids) => ids.every((id) => who.includes(id));
    const talk = [];
    for (const L of LINES) if (has(L.need)) talk.push(...L.lines);
    return [
      ['mayor', 'A picnic! For everyone you\'ve helped! From every corner of the Kingdom! I shall need... a very large blanket.', 'happy'],
      { fn: () => { sc = new PicnicScene(who); return [{ await: () => CK.flaps(() => CK.Scenes.push(sc), { label: 'The Neighborhood Picnic' }) }]; } },
      { wait: 0.6 },
    ].concat(talk, [
      ['mayor', 'Everyone, squeeze together. Robin, the camera, please.', 'happy'],
      ['robin', 'Say... CARDBOARD!', 'happy'],
      { fn: () => { sc.snap(); st().picnic = { who: who.slice() }; } },
      { wait: 1.2 },
      { await: () => { const c = new PhotoCard(who); CK.Scenes.push(c); return c; } },
      { fn: () => [{ await: () => CK.flaps(() => CK.Scenes.remove(sc), { label: '' }) }] },
      { fn: () => { CK.Pastimes.caps(40, 'the picnic'); if (CK.Garden) { const pt = CK.G.pt; pt.decor = pt.decor || {}; pt.decor.picnic = (pt.decor.picnic || 0) + 1; } CK.toast('A picnic blanket for your patch, from the Mayor', '#ffe3ef'); } },
      { journal: 'The Neighborhood Picnic in Blossom Hollow: neighbors from every season on one blanket, talking to each other. Grandma says you know a bridge works when people stop on it to talk. We took a photo.' },
      { save: true },
    ]);
  }

  // the Mayor's idea, said once, when it's possible
  const baseUpdate = OW.update;
  OW.update = function (dt, active) {
    baseUpdate.call(this, dt, active);
    if (active && !CK.scriptRunning && picnicReady() && !st().picnicHint) {
      st().picnicHint = true;
      CK.toast('Mayor Mossworth has an idea for all your neighbors. (Blossom Hollow)', '#ffe3ef');
    }
  };

  // ================================================================ NEIGHBORS PAGE
  NB.detailExtra = function (ctx, P, id, x, y, w) {
    if (!met(id)) return;
    let t = null;
    if (FAV[id]) {
      if (fav().favDone[id]) t = `Favour done: ${FAV[id].what}. ✓`;
      else if (favReady(id)) t = `Favour: ${FAV[id].what}. Done! Go and tell them.`;
      else if (favActive(id)) t = `Favour: ${FAV[id].what} (${Math.max(0, favProg(id))}/${FAV[id].n}).`;
      else if (favOpen(id)) t = `${N[id].name} might need a hand. Ask them.`;
    }
    if (t) D.text(ctx, t, x, y, { size: 13, weight: 700, color: '#b0567a' });
    if (id === 'mayor' && picnicReady()) D.text(ctx, 'The Mayor wants to host a picnic for everyone. Talk to him!', x, y + 20, { size: 13, weight: 700, color: '#b0567a' });
  };
  const NS = CK.NeighborsScreen.prototype;
  const baseNSUpdate = NS.update, baseNSDraw = NS.draw;
  NS.update = function (dt) {
    if (this.photo) {
      this.t += dt;
      if (Input.hit('ok') || Input.hit('back') || Input.key('KeyP') || Input.mouse.pressed) { CK.Audio.sfx('back'); this.photo = false; }
      return;
    }
    if (Input.key('KeyP') && picnicDone()) { CK.Audio.sfx('select'); this.photo = true; return; }
    baseNSUpdate.call(this, dt);
  };
  NS.draw = function (ctx) {
    baseNSDraw.call(this, ctx);
    const P = D.pal();
    if (picnicDone() && !this.photo) D.text(ctx, 'P: picnic photo', W - 60, 66, { size: D.T.small, weight: 800, align: 'right', color: '#d84a7a' });
    if (this.photo) {
      ctx.fillStyle = P.scrim; ctx.fillRect(0, 0, W, H);
      drawPhoto(ctx, W / 2, H / 2 - 24, 0.62, st().picnic.who, this.t, -0.02);
    }
  };

  // ================================================================ LITTLE LIVES
  // Small things they do while you're not right beside them. Drawn over the map, never blocking.
  const ACT = {
    robin(ctx, x, y, t) { const k = (t % 3) / 3; if (k > 0.6) return; const a = 1 - k / 0.6; ctx.save(); ctx.globalAlpha = a; ctx.translate(x + 18, y - 22 - k * 50); ctx.rotate(Math.sin(t * 3) * 0.3); D.rr(ctx, -6, -4, 12, 8, 1.5); ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 1.2); D.poly(ctx, [-6, -4, 6, -4, 0, 1], null, C.ink, 1); ctx.restore(); },
    bristle(ctx, x, y, t) { for (let i = 0; i < 3; i++) { const k = ((t * 0.7 + i / 3) % 1); const lx = x + 28 + k * 30 * (i - 1), ly = y - 6 - Math.sin(k * Math.PI) * 26; ctx.save(); ctx.globalAlpha = 1 - k; ctx.translate(lx, ly); ctx.rotate(t * 3 + i); D.egg(ctx, 0, 0, 6, 3.5, ['#e8743b', '#f2a93b', '#c94f2c'][i], { lw: 1 }); ctx.restore(); } },
    ember(ctx, x, y, t) { for (let i = 0; i < 3; i++) { const k = ((t * 0.5 + i / 3) % 1); ctx.save(); ctx.globalAlpha = 1 - k; D.circle(ctx, x + 18 + i * 8, y - 50 - k * 26, 3.6, ['#ef6b6b', '#ffd25a', '#5aa9e6'][i]); ctx.restore(); } },
    mama(ctx, x, y, t) { const k = (t % 2.6) / 2.6; ctx.save(); ctx.globalAlpha = Math.sin(k * Math.PI); D.heart(ctx, x + 24, y - 52 - k * 26, 8, '#ef6b6b'); ctx.restore(); },
    hoot(ctx, x, y, t) { const k = (t % 3.2) / 3.2; if (k > 0.5) return; ctx.save(); ctx.globalAlpha = 1 - k * 2; D.text(ctx, ['hm', 'aha', 'hoo'][Math.floor(t / 3.2) % 3], x + 20, y - 62 - k * 20, { size: 12, weight: 800, color: '#5a3a22' }); ctx.restore(); },
    nib(ctx, x, y, t) { const k = Math.floor(t * 1.5) % 4; for (let i = 0; i < k; i++) D.text(ctx, '' + (i + 1), x - 26 + i * 9, y + 6, { size: 10, weight: 800, color: '#7a7a86' }); },
    dabble(ctx, x, y, t) { const k = (t % 2) / 2; ctx.save(); ctx.globalAlpha = Math.sin(k * Math.PI); D.star(ctx, x + 22, y - 22, 3 + k * 3, '#fff6c0', 4, t); ctx.restore(); },
    clover(ctx, x, y, t) { for (let i = 0; i < 2; i++) { const k = ((t * 0.4 + i / 2) % 1); ctx.save(); ctx.globalAlpha = 1 - k; D.egg(ctx, x - 10 + i * 18 + Math.sin(t * 2 + i) * 6, y - 60 + k * 50, 3, 2, '#ffb7d5', { lw: 0, rot: t + i }); ctx.restore(); } },
    mayor(ctx, x, y, t) { const k = (t % 3) / 3; if (k > 0.3) return; D.star(ctx, x - 4, y - 46, 2 + Math.sin(k / 0.3 * Math.PI) * 5, '#ffffff', 4, 0); },
  };
  const baseDrawEnt = OW.drawEnt;
  OW.drawEnt = function (ctx, e) {
    baseDrawEnt.call(this, ctx, e);
    if (e.type !== 'npc' || !ACT[e.id] || !N[e.id] || D.calm() || CK.talkingWho) return;
    const dx = this.player.x - e.px, dy = this.player.y - e.py;
    if (Math.abs(dx) < 120 && Math.abs(dy) < 120) return;
    if (NB.readyEvent(e.id)) return; // the heart bubble is showing
    ACT[e.id](ctx, e.px - this.camX + (e.paceOff || 0), e.py - this.camY, this.t + e.x);
  };

  // ================================================================ JOBS + CHALLENGE
  CK.Pastimes.CHALLENGES.push({ id: 'favours', name: 'Helping Paw', what: 'favours done for neighbors', tiers: [2, 5, 9], val: favCount, gold: 'pawprint' });

  CK.Together = { FAV, LINES, picnicReady, drawPicnic, PicnicScene };
  CK.debugTogether = {
    favReady(id) { fav().fav[id] = tallyOf(FAV[id].key) - FAV[id].n; },
    picnic() { for (const id of IDS) { st().heard[id] = st().heard[id] || ''; st().ev[id] = Math.max(evSeen(id), 3); st().pts[id] = Math.max(st().pts[id] || 0, 12); } CK.setFlag('spring_dam'); },
    script: picnicScript,
  };
})();
