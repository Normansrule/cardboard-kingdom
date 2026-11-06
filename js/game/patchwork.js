// Cardboard Kingdom - Patchwork Hall (v2.9).
// The Kingdom's old makers' hall, reopened. From the design direction: a recurring workshop hub,
// two new friends who aren't party members (Tansy the dormouse costume maker, Brindle the badger
// carpenter), and a Postcard Wall of every place you've rebuilt, before and after.
// Travel there from any workbench map once Blossom Hollow is safe.
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
  const open = () => f('spring_boss');

  // ================================================================ CHARACTERS
  // Brindle: a stocky badger carpenter in a canvas apron, with a pencil behind one ear.
  CH.badger = function (ctx, x, y, o) {
    const s = o.s || 1, mood = o.mood;
    const dir = o.dir || 'down';
    const side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    for (const k of [-1, 1]) D.egg(ctx, x + k * 7 * s, y - 2 * s, 6 * s, 3.4 * s, '#3a3438', { lw: 1.6 });
    // round grey body and a canvas apron with a pocket of nails
    D.egg(ctx, x, y - 17 * s, 15 * s, 15 * s, '#8a8790', { lw: 2.2, k: 0.6 });
    ctx.beginPath(); ctx.moveTo(x - 10 * s, y - 26 * s); ctx.lineTo(x + 10 * s, y - 26 * s); ctx.lineTo(x + 12 * s, y - 5 * s); ctx.lineTo(x - 12 * s, y - 5 * s); ctx.closePath();
    D.fillVol(ctx, x - 3 * s, y - 18 * s, 12 * s, '#d9c49a', 1.8);
    D.rr(ctx, x - 6 * s, y - 16 * s, 12 * s, 6 * s, 1.5 * s); ctx.fillStyle = '#c4ad80'; ctx.fill(); stroke(ctx, 1.2);
    D.line(ctx, x - 3 * s, y - 19 * s, x - 3 * s, y - 14 * s, '#6a6a72', 1.4);
    D.line(ctx, x + 2 * s, y - 19 * s, x + 2 * s, y - 14 * s, '#6a6a72', 1.4);
    for (const k of [-1, 1]) D.egg(ctx, x + k * 15 * s, y - 17 * s, 4.5 * s, 8.5 * s, '#8a8790', { rot: k * -0.3, lw: 1.6 });
    // head: grey with the white stripe and black eye bands
    const hy = y - 38 * s, hx = x + side * 2 * s;
    D.ball(ctx, hx, hy, 12.5 * s, '#8a8790', { lw: 2.2, k: 0.6 });
    for (const k of [-1, 1]) D.ball(ctx, hx + k * 9 * s, hy - 10 * s, 3.4 * s, '#3a3438', { lw: 1.4 });
    if (dir !== 'up') {
      ctx.save(); ctx.beginPath(); ctx.arc(hx, hy, 12 * s, 0, TAU); ctx.clip();
      for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(hx + k * 6 * s, hy - 1 * s, 4.2 * s, 9 * s, k * 0.25, 0, TAU); ctx.fillStyle = '#2d282c'; ctx.fill(); }
      ctx.beginPath(); ctx.ellipse(hx, hy - 4 * s, 3.2 * s, 11 * s, 0, 0, TAU); ctx.fillStyle = '#f6f2ea'; ctx.fill();
      ctx.restore();
      for (const k of [-1, 1]) {
        if (side && k === -side) continue;
        const ex = hx + side * 2 * s + k * 5.6 * s, ey = hy - 1 * s;
        if (mood === 'happy') { ctx.beginPath(); ctx.arc(ex, ey + 1 * s, 1.8 * s, Math.PI * 1.1, Math.PI * 1.9); stroke(ctx, 1.6, '#fff'); }
        else { D.circle(ctx, ex, ey, 1.7 * s, '#fff'); D.circle(ctx, ex + 0.4 * s, ey + 0.2 * s, 1 * s, '#120e14'); }
        if (mood === 'angry') D.line(ctx, ex - k * 2.6 * s, ey - 3 * s, ex + k * 2 * s, ey - 2 * s, '#fff', 1.2);
      }
      D.egg(ctx, hx + side * 3 * s, hy + 5.5 * s, 4 * s, 3 * s, '#e9e2d6', { lw: 1.2 });
      D.egg(ctx, hx + side * 4 * s, hy + 4 * s, 1.8 * s, 1.3 * s, '#2a2024', { lw: 0 });
      D.blush(ctx, hx + side * 2 * s, hy + 4 * s, 8 * s, 1.8 * s);
    }
    // the pencil behind the ear
    ctx.save(); ctx.translate(hx + 10 * s, hy - 8 * s); ctx.rotate(0.9);
    D.rr(ctx, -1.5 * s, -8 * s, 3 * s, 14 * s, 1); ctx.fillStyle = '#ffd25a'; ctx.fill(); stroke(ctx, 1);
    ctx.restore();
  };

  // Tansy: a dormouse costume maker. A big fluffy tail, a measuring tape scarf, pins in her beanie.
  CH.dormouse = function (ctx, x, y, o) {
    const s = o.s || 1;
    const side = o.dir === 'left' ? -1 : o.dir === 'right' ? 1 : 0;
    const k = side ? -side : 1;
    // the big fluffy tail sweeps up behind her
    ctx.beginPath();
    ctx.moveTo(x + k * 6 * s, y - 6 * s);
    ctx.quadraticCurveTo(x + k * 30 * s, y - 8 * s, x + k * 24 * s, y - 34 * s);
    ctx.lineCap = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 12 * s; ctx.stroke();
    ctx.strokeStyle = '#d9a874'; ctx.lineWidth = 9 * s; ctx.stroke();
    D.ball(ctx, x + k * 23 * s, y - 37 * s, 8 * s, '#e8bd8a', { lw: 2 });
    D.circle(ctx, x + k * 21 * s, y - 40 * s, 2.5 * s, 'rgba(255,245,230,0.7)');
    CH.critter(ctx, x, y, Object.assign({}, o, { species: 'mouse', color: '#e3b583', hat: 'beanie', hatColor: '#a68be6' }));
    // a measuring tape for a scarf, and two pins in the beanie
    D.rr(ctx, x - 12 * s, y - 22 * s, 24 * s, 5 * s, 2 * s); ctx.fillStyle = '#ffe36a'; ctx.fill(); stroke(ctx, 1.2);
    for (let i = 0; i < 6; i++) D.line(ctx, x - 10 * s + i * 4 * s, y - 22 * s, x - 10 * s + i * 4 * s, y - 20 * s, C.ink, 0.8);
    D.line(ctx, x + 6 * s, y - 22 * s, x + 9 * s, y - 12 * s, '#ffe36a', 4 * s);
    for (const px of [-4, 3]) { D.line(ctx, x + px * s, y - 48 * s, x + px * s + 2 * s, y - 55 * s, '#8a8a90', 1.2); D.circle(ctx, x + px * s + 2 * s, y - 56 * s, 1.8 * s, px < 0 ? '#ef6b6b' : '#5aa9e6', C.ink, 0.8); }
  };

  Object.assign(Data.speakers, {
    tansy: { name: 'Tansy', look: 'dormouse', ps: 2.3, py: 0, bg: '#fde9f1', o: {} },
    brindle: { name: 'Brindle', look: 'badger', ps: 2.1, py: 12, bg: '#ece7dc' },
  });
  const TANSY_O = Data.speakers.tansy.o;

  // ================================================================ PLACE
  Data.seasons.patchwork = {
    name: 'Workshop', ground: '#b8d98a', ground2: '#a9cf7c', path: '#efd3a0', sand: '#f3dfa8', water: '#7ccbe6', waterD: '#4aa8cc',
    sky: ['#ffe8c4', '#ffd6e2'], night: ['#1f1c46', '#4b2f62'], tree: 'blossom', particle: 'petal',
  };
  CK.Chapters.patchwork = {
    id: 'patchwork', name: 'Patchwork Hall', w: 30, h: 20, season: 'patchwork', music: 'spring',
    start: [3, 12], noFlood: true,
    build(m) {
      m.scatter(',', 0.14, 91);
      m.path([[1, 12], [28, 12]], '=');
      m.path([[15, 12], [15, 10]], '=');
      m.path([[22, 12], [22, 16]], '=');
      m.ellipse(25, 17, 3, 1.6, '~');
      m.scatter('T', 0.04, 92);
      m.border('T');
    },
    post(m) {
      for (const o of this.objects) if (o.type === 'building') m.rect(o.x - Math.floor(o.bw / 2) - 1, o.y - o.bh, o.bw + 2, o.bh + 2, '.');
      for (const o of this.objects) if (o.type !== 'building' && m.get(o.x, o.y) !== '=') m.set(o.x, o.y, '.');
      m.rect(1, 11, 3, 3, '.'); m.rect(1, 12, 3, 1, '=');
      m.rect(15, 10, 1, 1, '=');
      m.rect(4, 14, 8, 4, '.');
    },
    objects: [
      { type: 'building', id: 'hall', x: 15, y: 9, bw: 8, bh: 4, style: 'patchwork', door: 'Go in', script: () => [{ fn: () => { CK.Scenes.push(new HallScene()); } }] },
      { type: 'npc', id: 'tansy', x: 11, y: 11, look: 'dormouse', talk: () => tansyTalk() },
      { type: 'npc', id: 'brindle', x: 19, y: 11, look: 'badger', talk: () => brindleTalk() },
      { type: 'bench', x: 7, y: 15 },
      { type: 'campfire', x: 10, y: 16 },
      { type: 'deco', kind: 'lantern', x: 12, y: 13 },
      { type: 'deco', kind: 'lantern', x: 18, y: 13 },
      { type: 'deco', kind: 'lantern', x: 23, y: 14 },
      { type: 'deco', kind: 'dressform', x: 9, y: 10 },
      { type: 'deco', kind: 'lumber', x: 21, y: 10 },
      { type: 'sign', x: 4, y: 11, text: 'PATCHWORK HALL. Makers welcome. Menders very welcome. Mistakes extremely welcome.' },
      { type: 'cat', x: 24, y: 14 },
    ],
    objective() {
      if (!f('ph_tansy')) return 'Say hello to Tansy outside the hall';
      if (!f('ph_made')) return 'Tansy wants you to make something. Just for fun';
      return 'Free roam! The Postcard Wall is inside. Workbench to travel.';
    },
  };
  // props outside: Tansy's dress form with a half-made costume, and Brindle's lumber pile
  CK.DecoDraw.dressform = function (ctx, e, x, y) {
    D.shadow(ctx, x + 4, y, 16, 5);
    D.line(ctx, x, y, x, y - 30, C.ink, 3); D.line(ctx, x - 10, y, x + 10, y, C.ink, 3);
    D.egg(ctx, x, y - 44, 14, 18, '#ff8fb1', { lw: 2.2 });
    D.line(ctx, x - 12, y - 52, x + 12, y - 52, '#ffd25a', 3);
    for (let i = 0; i < 4; i++) D.circle(ctx, x - 6 + i * 4, y - 40 + (i % 2) * 6, 1.6, '#c9d3e0', C.ink, 0.8);
    D.ball(ctx, x, y - 66, 6, '#e8dcc8', { lw: 1.6 });
  };
  CK.DecoDraw.lumber = function (ctx, e, x, y) {
    D.shadow(ctx, x + 6, y, 30, 7);
    for (let i = 0; i < 3; i++) D.box3(ctx, x - 30 + i * 4, y - 12 - i * 10, 56, 9, 8, { r: 2, lw: 2, fill: i % 2 ? '#d9a66b' : '#c99561', flute: false });
    D.line(ctx, x + 20, y - 40, x + 34, y - 20, '#8a8a90', 3);
    D.rr(ctx, x + 16, y - 46, 10, 8, 2); ctx.fillStyle = '#8a5a2e'; ctx.fill(); stroke(ctx, 1.4);
  };
  CK.DECO_FOOT.lumber = [-0.6, -0.4, 1.4, 0.5];

  // the hall: a long cardboard workshop with a quilted, patched roof
  CK.BuildingDraw.patchwork = function (ctx, e, x, y) {
    const bw = e.bw * TS, x0 = x - bw / 2, base = y + TS * 0.25, top = base - 110;
    D.shadow(ctx, x + 18, base + 8, bw / 2 + 24, 18, 0.32);
    D.box3(ctx, x0, top, bw, 110, 30, { r: 2, lw: 4, fill: '#e8b77c', flute: false });
    // corrugated stripes on the wall
    ctx.save(); ctx.beginPath(); ctx.rect(x0, top, bw, 110); ctx.clip();
    for (let i = 0; i < bw; i += 10) D.line(ctx, x0 + i, top, x0 + i, base, 'rgba(120,70,20,0.08)', 4);
    ctx.restore();
    // quilted roof: a gable of fabric patches with stitching
    const rx0 = x0 - 16, rx1 = x0 + bw + 16, ry = top + 6, peak = top - 70;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(rx0, ry); ctx.lineTo(x, peak); ctx.lineTo(rx1, ry); ctx.closePath();
    ctx.fillStyle = '#c25b4a'; ctx.fill(); ctx.clip();
    const pc = ['#ef6b6b', '#ffd25a', '#6cc56c', '#5aa9e6', '#ff9ec7', '#a68be6', '#f2a93b', '#fff4dc'];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) {
      const px = rx0 + c * ((rx1 - rx0) / 9), py = peak + r * 20;
      ctx.fillStyle = pc[(r * 3 + c * 5) % pc.length]; ctx.fillRect(px, py, (rx1 - rx0) / 9 + 1, 21);
      ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(60,30,10,0.45)'; ctx.lineWidth = 1.2; ctx.strokeRect(px + 3, py + 3, (rx1 - rx0) / 9 - 6, 15); ctx.setLineDash([]);
    }
    const sh = ctx.createLinearGradient(rx0, 0, rx1, 0); sh.addColorStop(0, 'rgba(255,255,255,0.12)'); sh.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = sh; ctx.fillRect(rx0, peak, rx1 - rx0, ry - peak);
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(rx0, ry); ctx.lineTo(x, peak); ctx.lineTo(rx1, ry); ctx.closePath(); stroke(ctx, 4);
    // big double doors, warm windows and a sign
    D.rr(ctx, x - 26, base - 62, 52, 60, 10); ctx.fillStyle = D.lgx(ctx, x - 26, x + 26, '#8a5a2e'); ctx.fill(); stroke(ctx, 3);
    D.line(ctx, x, base - 60, x, base - 2, C.ink, 2.5);
    for (const k of [-1, 1]) D.circle(ctx, x + k * 6, base - 30, 2.5, '#ffd25a', C.ink, 1);
    const win = this.night ? '#ffd76a' : '#bfe6ff';
    for (const k of [-1, 1]) {
      const wx = x + k * (bw / 2 - 52);
      D.rr(ctx, wx - 26, top + 30, 52, 40, 6); ctx.fillStyle = win; ctx.fill(); stroke(ctx, 3);
      D.line(ctx, wx, top + 30, wx, top + 70, C.ink, 2); D.line(ctx, wx - 26, top + 50, wx + 26, top + 50, C.ink, 2);
      // a costume on a dress form shows through each window
      D.egg(ctx, wx + (k > 0 ? 8 : -8), top + 56, 7, 10, k > 0 ? '#ff8fb1' : '#5aa9e6', { lw: 1.4 });
    }
    const cols = ['#ef6b6b', '#ffd25a', '#6cc56c', '#5aa9e6', '#ff9ec7', '#a68be6'];
    ctx.beginPath(); ctx.moveTo(x0 - 8, top + 12); ctx.quadraticCurveTo(x, top + 34, x0 + bw + 8, top + 12); stroke(ctx, 2);
    for (let i = 0; i < 13; i++) {
      const t = i / 12, px = x0 - 8 + t * (bw + 16), py = top + 12 + Math.sin(t * Math.PI) * 11;
      D.poly(ctx, [px - 7, py, px + 7, py, px, py + 14 + Math.sin(this.t * 3 + i) * 1.5], cols[i % cols.length], C.ink, 1.4);
    }
    D.cardboard(ctx, x - 78, top - 96, 156, 26, { r: 4, lw: 3, fill: '#fff4dc', flute: false });
    D.text(ctx, 'PATCHWORK HALL', x, top - 77, { size: 16, weight: 700, align: 'center', color: '#c2410c' });
    D.line(ctx, x - 50, top - 70, x - 40, top - 52, C.ink, 2); D.line(ctx, x + 50, top - 70, x + 40, top - 52, C.ink, 2);
  };

  // ================================================================ TRAVEL
  const baseTravel = CK.travelChoice;
  CK.travelChoice = function (text) {
    const c = baseTravel(text);
    if (open() && CK.G.chapter !== 'patchwork') c.choice.options.splice(c.choice.options.length - 1, 0, { label: f('patchwork_arrived') ? 'Patchwork Hall (workshop)' : 'Patchwork Hall (new!)', then: [{ chapter: 'patchwork', label: 'Patchwork Hall' }] });
    return c;
  };

  // ================================================================ SCRIPTS
  S.patchwork_intro = [
    { card: { title: 'Patchwork Hall', sub: 'Makers welcome' } },
    { narrate: 'A long cardboard hall with a roof made of quilt patches. Somebody inside is singing, slightly out of tune, around a mouthful of pins.' },
    ['pip', 'Pell said a makers\' hall had reopened. She said, quote, "go, they need a Builder, and also they need fewer pins on the floor."', 'happy'],
    ['corry', 'A hall! With bunting! I have never been so ready to be welcomed.', 'happy'],
  ];
  S.ph_meet_tansy = [
    ['tansy', 'Mmf! Oh! Hello! Sorry. Pins. You\'re the Builder! I\'m Tansy. I make costumes. Badly, mostly. Sometimes on purpose.', 'happy'],
    ['sam', 'On purpose?', 'shock'],
    ['tansy', 'If you\'re only allowed to make good things, you stop making things. So I make bad ones first. Gets them out of the way.', 'happy'],
    ['tansy', 'This used to be where the whole Kingdom brought its making. Then the floods came and everybody was too busy bailing.', 'sad'],
    ['tansy', 'But you\'ve been fixing things, and people have started coming back. Brindle fixed the roof. Twice. The second time it stayed.', 'happy'],
    ['tansy', 'Inside, there\'s a wall for postcards. One for every place that gets put back together. Before and after. Go look!', 'happy'],
    ['tansy', 'And when you have a minute, I want you to make something. Not for a grade. Not to fix anything. Just because.', 'happy'],
    { flag: 'ph_tansy' },
    { journal: 'Met Tansy, a dormouse costume maker, and Brindle, a badger carpenter, at Patchwork Hall. Tansy makes bad things first "to get them out of the way."' },
  ];
  S.ph_make = [
    ['tansy', 'Right. Table, glue, scraps, tape. Make anything. It doesn\'t have to work. It especially doesn\'t have to be good.', 'happy'],
    ['sam', '...I don\'t really do that anymore. Everything I make gets marked.', 'sad'],
    ['tansy', 'Nobody\'s marking. I lost my red pen in 1998. Go on.', 'happy'],
    { choice: { who: 'sam', text: 'What will you make?', options: [
      { label: 'A tiny hat for Pip', then: [{ fn: () => CK.setFlag('ph_made', 'hat') }, { narrate: 'You fold a hat out of a juice-box label. It is too big, then too small, then exactly the size of a kite\'s head.' }, ['pip', 'A HAT. It is lopsided. It is the best hat in the Kingdom. I am never taking it off. Except in wind.', 'happy']] },
      { label: 'A cape for Corry', then: [{ fn: () => CK.setFlag('ph_made', 'cape') }, { narrate: 'You cut a cape from a cereal box. The cartoon tiger on the inside is now the lining. It is very dramatic.' }, ['corry', 'A CAPE. A cape with a TIGER inside it. Builder, I will wear this into every battle and to bed.', 'happy']] },
      { label: 'A paper boat, just because', then: [{ fn: () => CK.setFlag('ph_made', 'boat') }, { narrate: 'You fold a boat from a corrected problem set. The red marks end up on the sail. It floats. It actually floats.' }, ['pip', 'You sailed your homework! Fact: that is the best thing anyone has ever done with homework.', 'happy']] },
    ] } },
    ['sam', '...It\'s lopsided.', 'sad'],
    ['tansy', 'It\'s PERFECT. Look how lopsided it is!', 'happy'],
    ['sam', 'I used to make things because I wanted to see them work.', 'sad'],
    ['tansy', 'Did it work?', 'happy'],
    ['sam', '...Yeah. It did.', 'happy'],
    ['tansy', 'Then it goes on the shelf. The Just Because shelf. Everything on it is wonky. Everything on it is loved.', 'happy'],
    { journal: 'Made something at Patchwork Hall just because. It was lopsided. It worked. It\'s on the Just Because shelf now.' },
    { save: true },
  ];
  function tansyTalk() {
    if (!f('ph_tansy')) return 'ph_meet_tansy';
    if (!f('ph_made')) return 'ph_make';
    const lines = [
      ['tansy', 'I\'m making the Queen a crown out of a biscuit tin. It\'s terrible so far. Very promising.', 'happy'],
      ['tansy', 'Brindle says measure twice, cut once. I say cut once, then make it a different thing. We\'re both right. He hates that.', 'happy'],
      ['tansy', 'Every costume has a bad first version. The Box Knight\'s was a box. With a face on it. Mine, I mean. I made one too.', 'happy'],
    ];
    if (f('gp_done')) lines.push(['tansy', 'I heard Jules lit the lighthouse. I\'m making them a sou\'wester. Yellow. Lopsided. Obviously.', 'happy']);
    if (f('lb_built')) lines.push(['tansy', 'The Long Bridge! Postcard\'s on the wall. Brindle cried. He says it was sawdust.', 'happy']);
    return [U.pick(lines)];
  }
  const BRINDLE_MEET = [
    ['brindle', 'Brindle. Carpenter. I fixed that roof.', 'happy'],
    ['brindle', 'Twice. The second time it stayed.', 'happy'],
    ['brindle', 'You\'re the engineer? Good. Settle something. Keystones. Most important part of an arch, yes?', 'happy'],
    ['sam', 'Well... the keystone locks it, but the ends have to hold, or the whole arch spreads out.', 'sad'],
    ['brindle', '...', 'shock'],
    ['brindle', 'The keystone was excellent.', 'angry'],
    ['tansy', 'It had nowhere sensible to put its confidence.', 'happy'],
    ['brindle', 'Hmph. Fine. I\'ll look at the ends. I know wood, Builder. You know why things fall down. Could be useful.', 'happy'],
    { flag: 'ph_brindle' },
  ];
  function brindleTalk() {
    if (!f('ph_brindle')) return BRINDLE_MEET;
    const lines = [
      ['brindle', 'Fair warning: I\'m entering the Spring Flower Show again. Bristle\'s chrysanthemums don\'t stand a chance.', 'happy'],
      ['brindle', 'I tried your trick. Looked at where it pushes before I built anything. Stool didn\'t wobble. Don\'t tell Tansy.', 'happy'],
      ['brindle', 'Measure twice, cut once. And then, if Tansy\'s watching, measure a third time so she can\'t say anything.', 'happy'],
    ];
    if (f('rb_arch')) lines.push(['brindle', 'Saw your arch at Willow Creek. Good abutments. ...Keystone could have been bigger.', 'happy']);
    if (f('ph_made')) lines.push(['brindle', 'Saw the thing you made. Wonky. Glue\'s holding, though. That\'s the main thing.', 'happy']);
    return [U.pick(lines)];
  }

  // ================================================================ POSTCARDS
  // A real before/after picture of every repair, rendered from the game's own maps with the
  // story flags rolled back (before) and forward (after).
  const CARDS = [
    { id: 'dam', ch: 'spring', at: [9, 12], undo: ['spring_dam', 'spring_boss'], need: 'spring_dam', title: 'Blossom Hollow', caption: 'The check dam held the brook back. The village dried out and everyone moved home.' },
    { id: 'gates', ch: 'summer', at: [12, 12], undo: ['summer_gates', 'summer_boss', 'su_wall_beaten'], need: 'summer_gates', title: 'Sunpatch Shores', caption: 'Floodgates at the harbor mouth: the storm surge stops, and the huts stay dry.' },
    { id: 'bridge', ch: 'fall', at: [18, 12], undo: ['fall_bridge', 'fall_boss'], need: 'fall_bridge', title: 'Amberleaf Woods', caption: 'A truss bridge over the creek, and the burrows drained out.' },
    { id: 'spillway', ch: 'winter', at: [12, 16], undo: ['winter_done'], need: 'winter_done', title: 'Frostfold Peak', caption: 'The Summit Dam got its spillway. Floods pass safely around it now.' },
    { id: 'garden', ch: 'campus', at: [11, 14], undo: ['st_garden'], need: 'st_garden', title: 'Reyes Pond (campus)', caption: 'The rain garden soaks up the storm instead of the dorm.' },
    { id: 'arch', ch: 'riverbend', at: [20, 12], undo: ['rb_arch', 'rb_done'], need: 'rb_arch', title: 'Willow Creek', caption: 'Grandma\'s footbridge, finished as a stone arch. Every stone leans on the next one.' },
    { id: 'lights', ch: 'lanternmere', at: [20, 11], undo: ['lm_lights', 'lm_done'], need: 'lm_lights', night: true, title: 'Lanternmere', caption: 'Hooded lanterns light the path, not the sky. The stars came back.' },
    { id: 'shore', ch: 'gullpoint', at: [25, 9], undo: ['gp_shore', 'gp_moved', 'gp_done'], need: 'gp_moved', title: 'Gull Point', caption: 'A living shoreline, and the lighthouse rolled back from the edge.' },
    { id: 'span', ch: 'longbridge', at: [19, 11], undo: ['lb_built', 'lb_fair', 'lb_done'], need: 'lb_built', title: 'The Great Gorge', caption: 'The Long Bridge, built by the whole Kingdom.' },
  ];
  CK.Postcards = CARDS;
  const cache = {};
  function renderView(card, after) {
    const G = CK.G, real = G.flags;
    const flags = Object.assign({}, real);
    if (after) { flags[card.need] = true; }
    else for (const k of card.undo) delete flags[k];
    if (card.night) flags[card.ch + '_night'] = true; else delete flags[card.ch + '_night'];
    const saveCh = G.chapter, saveMusic = CK.Audio.setMusic, saveRain = CK.Audio.setRain, saveOW = CK.OW;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    try {
      G.flags = flags; G.chapter = card.ch;
      CK.Audio.setMusic = () => {}; CK.Audio.setRain = () => {};
      const ow = new CK.Overworld(card.ch, { x: -900, y: -900 });
      ow.drawHud = () => {};
      ow.player.x = -900; ow.player.y = -900;
      for (const t of ow.trail) { t.x = -900; t.y = -900; }
      if (ow.p2) { ow.p2.x = -900; ow.p2.y = -900; }
      ow.camX = U.clamp(card.at[0] * TS - W / 2, 0, ow.map.w * TS - W);
      ow.camY = U.clamp(card.at[1] * TS - H / 2, 0, ow.map.h * TS - H);
      ow.t = 2;
      const g = c.getContext('2d');
      const busy = CK.scriptRunning; CK.scriptRunning = 1;
      ow.draw(g);
      CK.scriptRunning = busy;
    } catch (e) {
      console.warn('postcard', card.id, e);
    } finally {
      G.flags = real; G.chapter = saveCh; CK.Audio.setMusic = saveMusic; CK.Audio.setRain = saveRain; CK.OW = saveOW;
    }
    return c;
  }
  CK.postcardView = function (card, after) {
    const k = card.id + (after ? '_a' : '_b');
    return cache[k] || (cache[k] = renderView(card, after));
  };
  const earned = (card) => f(card.need);

  function drawPostcard(ctx, card, x, y, w, h, after, o = {}) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(o.rot || 0);
    D.rr(ctx, -w / 2 + 4, -h / 2 + 6, w, h, 4); ctx.fillStyle = 'rgba(40,20,10,0.3)'; ctx.fill();
    D.rr(ctx, -w / 2, -h / 2, w, h, 4); ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 2);
    const pad = Math.max(4, w * 0.035), iw = w - pad * 2, ih = h - pad * 2 - (o.caption ? 0 : 0);
    if (card && earned(card)) {
      ctx.save(); D.rr(ctx, -w / 2 + pad, -h / 2 + pad, iw, ih, 2); ctx.clip();
      ctx.drawImage(CK.postcardView(card, after), -w / 2 + pad, -h / 2 + pad, iw, ih);
      ctx.restore();
      D.rr(ctx, -w / 2 + pad, -h / 2 + pad, iw, ih, 2); stroke(ctx, 1.5);
      const tag = after ? 'AFTER' : 'BEFORE';
      const tw = D.measure(ctx, tag, 11, 700) + 14;
      D.rr(ctx, -w / 2 + pad + 4, -h / 2 + pad + 4, tw, 18, 9); ctx.fillStyle = after ? '#6cc56c' : '#9aa0a8'; ctx.fill(); stroke(ctx, 1.2);
      D.text(ctx, tag, -w / 2 + pad + 4 + tw / 2, -h / 2 + pad + 17, { size: 11, weight: 700, align: 'center', color: '#fff' });
    } else {
      D.rr(ctx, -w / 2 + pad, -h / 2 + pad, iw, ih, 2); ctx.fillStyle = '#efe4d0'; ctx.fill();
      D.text(ctx, '?', 0, 10, { size: Math.min(40, h * 0.4), weight: 700, align: 'center', color: '#c9b79a' });
    }
    ctx.restore();
  }

  // ================================================================ INSIDE THE HALL
  const GIFT = { sp_a: 'trowel', su_a: 'umbrella', fa_a: 'lantern', wi_a: 'mittens', lm_a: 'chart', gp_a: 'bucket' };
  class HallScene {
    constructor() { this.t = 0; this.sel = 0; this.after = true; this.flip = 1; this.zoom = false; this.parts = new CK.Particles(); }
    enter() { CK.Audio.sfx('blip'); CK.showTouchPad = false; }
    exit() { CK.showTouchPad = true; }
    update(dt) {
      this.t += dt; this.parts.update(dt);
      this.flip = Math.min(1, this.flip + dt * 5);
      if (Math.random() < dt * 3) this.parts.emit({ x: U.rand(0, W), y: -10, vx: U.rand(-10, 10), vy: U.rand(10, 25), life: 8, size: 2, shape: 'circle', color: 'rgba(255,240,200,0.6)', fade: true });
      const n = CARDS.length;
      if (Input.hit('left')) { this.sel = (this.sel + n - 1) % n; CK.Audio.sfx('blip'); }
      if (Input.hit('right')) { this.sel = (this.sel + 1) % n; CK.Audio.sfx('blip'); }
      if (Input.hit('up')) { this.sel = (this.sel + n - this.per()) % n; CK.Audio.sfx('blip'); }
      if (Input.hit('down')) { this.sel = (this.sel + this.per()) % n; CK.Audio.sfx('blip'); }
      CARDS.forEach((c, i) => { const r = this.slot(i); if (Input.mouse.moved && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) this.sel = i; if (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) { this.sel = i; this.toggle(); } });
      if (Input.hit('ok')) this.toggle();
      if (Input.hit('back') || (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, W - 132, H - 50, 112, 36))) { CK.Audio.sfx('back'); CK.Scenes.remove(this); }
    }
    toggle() {
      if (!earned(CARDS[this.sel])) { CK.Audio.sfx('error'); return; }
      this.after = !this.after; this.flip = 0; CK.Audio.sfx('whoosh');
    }
    per() { return CARDS.length > 10 ? 6 : 5; }
    slot(i) {
      // up to 10 postcards in two rows of 5; more than that, two rows of 6 smaller ones
      if (CARDS.length > 10) return [56 + (i % 6) * 70, 106 + Math.floor(i / 6) * 82, 62, 46];
      return [62 + (i % 5) * 84, 104 + Math.floor(i / 5) * 84, 74, 56];
    }
    drawRoom(ctx) {
      // back wall: corrugated cardboard in warm light, a strip of high windows
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#edc38a'); g.addColorStop(1, '#d39c5e');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < W; i += 14) D.line(ctx, i, 0, i, 380, 'rgba(120,70,20,0.07)', 6);
      for (let i = 0; i < 6; i++) {
        const wx = 30 + i * 160;
        D.rr(ctx, wx, 8, 100, 26, 6); ctx.fillStyle = '#cdeeff'; ctx.fill(); stroke(ctx, 2.5);
        ctx.save(); ctx.globalAlpha = 0.1; D.poly(ctx, [wx, 34, wx + 100, 34, wx + 150, 380, wx + 30, 380], '#fff8d6'); ctx.restore();
      }
      // quilt bunting along the top
      const cols = ['#ef6b6b', '#ffd25a', '#6cc56c', '#5aa9e6', '#ff9ec7', '#a68be6'];
      for (let i = 0; i < 24; i++) D.poly(ctx, [i * 40 + 4, 40, i * 40 + 36, 40, i * 40 + 20, 56 + Math.sin(this.t * 2 + i) * 1.5], cols[i % 6], C.ink, 1.3);
      // floorboards and a rag rug
      const fy = 380;
      ctx.fillStyle = '#b07c45'; ctx.fillRect(0, fy, W, H - fy);
      for (let i = 0; i < 6; i++) D.line(ctx, 0, fy + i * 30, W, fy + i * 30, 'rgba(60,30,10,0.18)', 2);
      D.line(ctx, 0, fy, W, fy, C.ink, 4);
      ctx.save(); ctx.translate(W / 2, 470); ctx.scale(1, 0.28);
      for (let r = 5; r > 0; r--) { ctx.beginPath(); ctx.arc(0, 0, r * 46, 0, TAU); ctx.fillStyle = ['#ef6b6b', '#ffd25a', '#6cc56c', '#5aa9e6', '#ff9ec7'][r % 5]; ctx.fill(); }
      ctx.restore();
    }
    drawWall(ctx) {
      // the Postcard Wall: a cork board of every place you've rebuilt
      D.cardboard(ctx, 36, 72, 456, 226, { r: 6, lw: 3, fill: '#c99561', flute: false });
      D.rr(ctx, 46, 82, 436, 206, 4); ctx.fillStyle = '#b98455'; ctx.fill();
      for (let i = 0; i < 60; i++) D.circle(ctx, 50 + U.hash(i, 1) * 428, 86 + U.hash(i, 2) * 198, 1.5, 'rgba(60,30,10,0.25)');
      D.tape(ctx, 164, 60, 200, 28, -0.02, 0.95);
      D.text(ctx, 'THE POSTCARD WALL', 264, 80, { size: 16, weight: 700, align: 'center', color: '#5b3a1e' });
      CARDS.forEach((c, i) => {
        const [x, y, w, h] = this.slot(i);
        drawPostcard(ctx, c, x, y, w, h, true, { rot: (U.hash(i, 3) - 0.5) * 0.12 });
        D.circle(ctx, x + w / 2, y + 2, 4, ['#ef6b6b', '#5aa9e6', '#ffd25a'][i % 3], C.ink, 1.2);
        if (i === this.sel) { D.rr(ctx, x - 5, y - 5, w + 10, h + 10, 6); stroke(ctx, 3.5, '#fff3b0'); }
      });
      const got = CARDS.filter(earned).length;
      D.text(ctx, `${got} of ${CARDS.length} places rebuilt`, 264, 282, { size: 13, weight: 700, align: 'center', color: '#fff4dc' });
    }
    drawShelves(ctx) {
      // gifts from the Neighbor Round errands, and the Just Because shelf
      const round = CK.G.round || { returned: {} };
      const shelf = (sx, w, label) => {
        D.box3(ctx, sx, 344, w, 10, 10, { r: 2, lw: 2.5, fill: '#8a5a2e', flute: false });
        D.text(ctx, label, sx + w / 2, 372, { size: 11, weight: 700, align: 'center', color: '#5b3a1e' });
      };
      shelf(36, 270, 'THANK-YOU SHELF');
      shelf(326, 166, 'JUST BECAUSE (wonky, loved)');
      const gifts = Object.keys(GIFT).filter((k) => round.returned && round.returned[k]);
      if (!gifts.length) D.text(ctx, '(neighbors leave thank-yous here)', 171, 334, { size: 11, weight: 600, align: 'center', color: 'rgba(60,30,10,0.5)' });
      gifts.forEach((k, i) => this.drawGift(ctx, GIFT[k], 64 + i * 43, 342));
      const made = f('ph_made') ? CK.G.flags.ph_made : null;
      if (made) this.drawMade(ctx, made, 370, 342);
      else D.text(ctx, '(empty, for now)', 409, 334, { size: 11, weight: 600, align: 'center', color: 'rgba(60,30,10,0.5)' });
      // letters from the Kingdom Post, stacked at the end of the shelf
      const n = CK.G.letters ? Object.keys(CK.G.letters.delivered || {}).length : 0;
      for (let i = 0; i < Math.min(n, 8); i++) { ctx.save(); ctx.translate(456 + (i % 2) * 14, 336 - Math.floor(i / 2) * 6); ctx.rotate((i % 3 - 1) * 0.12); CK.drawEnvelope(ctx, 0, 0, 22, 15, '#fffaf0'); ctx.restore(); }
    }
    drawGift(ctx, kind, x, y) {
      ctx.save(); ctx.translate(x, y);
      if (kind === 'trowel') { D.rr(ctx, -3, -34, 6, 18, 2); ctx.fillStyle = '#8a5a2e'; ctx.fill(); stroke(ctx, 1.5); D.poly(ctx, [-9, -16, 9, -16, 0, 2], '#c9d3e0', C.ink, 1.5); }
      if (kind === 'umbrella') { ctx.beginPath(); ctx.arc(0, -26, 18, Math.PI, 0); ctx.closePath(); ctx.fillStyle = '#ef6b6b'; ctx.fill(); stroke(ctx, 1.5); D.line(ctx, 0, -26, 0, 0, C.ink, 2); }
      if (kind === 'lantern') { D.rr(ctx, -9, -26, 18, 22, 5); ctx.fillStyle = '#fff3c4'; ctx.fill(); stroke(ctx, 1.5); D.poly(ctx, [-11, -26, 0, -34, 11, -26], '#ef6b6b', C.ink, 1.5); for (let i = 0; i < 3; i++) D.circle(ctx, -4 + i * 4, -2, 1.5, '#7fd0ff'); }
      if (kind === 'mittens') for (const k of [-1, 1]) { D.egg(ctx, k * 8, -12, 7, 11, '#a68be6', { lw: 1.5 }); D.egg(ctx, k * 8 + k * 6, -16, 3, 5, '#a68be6', { lw: 1.2 }); }
      if (kind === 'chart') { D.rr(ctx, -16, -30, 32, 28, 2); ctx.fillStyle = '#2f3e66'; ctx.fill(); stroke(ctx, 1.5); for (let i = 0; i < 7; i++) D.star(ctx, -12 + U.hash(i, 4) * 24, -26 + U.hash(i, 5) * 20, 2, '#fff3b0', 5); }
      if (kind === 'bucket') { ctx.beginPath(); ctx.moveTo(-12, -26); ctx.lineTo(12, -26); ctx.lineTo(9, 0); ctx.lineTo(-9, 0); ctx.closePath(); ctx.fillStyle = '#ef6b6b'; ctx.fill(); stroke(ctx, 1.5); D.ball(ctx, 0, -28, 5, '#f07a3a', { lw: 1.2 }); }
      ctx.restore();
    }
    drawMade(ctx, kind, x, y) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.12);
      if (kind === 'hat') { D.poly(ctx, [-18, 0, 18, 0, 3, -30], '#ffd25a', C.ink, 2); D.line(ctx, -18, 0, 18, 0, '#ef6b6b', 4); D.circle(ctx, 3, -32, 4, '#ff8fb1', C.ink, 1.5); }
      if (kind === 'cape') { ctx.beginPath(); ctx.moveTo(-14, -34); ctx.quadraticCurveTo(-26, -6, -20, 0); ctx.lineTo(20, 0); ctx.quadraticCurveTo(26, -6, 14, -34); ctx.closePath(); ctx.fillStyle = '#ef6b6b'; ctx.fill(); stroke(ctx, 2); for (let i = 0; i < 4; i++) D.line(ctx, -10 + i * 7, -24, -12 + i * 7, -6, '#f2a93b', 2.5); }
      if (kind === 'boat') { D.poly(ctx, [-24, -12, 24, -12, 14, 0, -14, 0], '#fffaf0', C.ink, 2); D.poly(ctx, [0, -12, 0, -42, 20, -16], '#fffaf0', C.ink, 2); for (let i = 0; i < 3; i++) D.line(ctx, 4, -36 + i * 7, 12, -34 + i * 7, '#ef6b6b', 1.5); }
      ctx.restore();
    }
    drawFolks(ctx) {
      // Tansy at her sewing table (left), Brindle at his workbench (right)
      D.char(ctx, 'dormouse', 92, 522, { s: 2.2, mood: 'happy', dir: 'right' });
      D.box3(ctx, 126, 494, 150, 34, 16, { r: 3, lw: 3, fill: '#c99561', flute: false });
      for (let i = 0; i < 5; i++) D.circle(ctx, 142 + i * 26, 496, 5, ['#ef6b6b', '#5aa9e6', '#ffd25a', '#6cc56c', '#ff9ec7'][i], C.ink, 1.2);
      D.char(ctx, 'badger', 516, 526, { s: 2.1, mood: 'happy', dir: 'left' });
      D.box3(ctx, 330, 498, 150, 32, 16, { r: 3, lw: 3, fill: '#a97c4c', flute: false });
      for (let i = 0; i < 3; i++) { D.rr(ctx, 342 + i * 44, 490, 34, 9, 2); ctx.fillStyle = '#d9b07a'; ctx.fill(); stroke(ctx, 1.2); }
    }
    draw(ctx) {
      this.drawRoom(ctx);
      this.drawWall(ctx);
      this.drawShelves(ctx);
      this.drawFolks(ctx);
      this.parts.draw(ctx);
      // the selected postcard, held up big on the right, flipping between before and after
      const card = CARDS[this.sel];
      const k = Math.abs(Math.cos((1 - this.flip) * Math.PI / 2));
      ctx.save(); ctx.translate(722, 190); ctx.scale(Math.max(0.05, k), 1);
      drawPostcard(ctx, card, -190, -116, 380, 232, earned(card) ? this.after : true, { rot: 0.02 });
      ctx.restore();
      D.panel(ctx, 532, 318, 380, 92, { fill: '#fffaf0', tape: false });
      D.text(ctx, earned(card) ? card.title : 'Not rebuilt yet', 722, 342, { size: 17, weight: 700, align: 'center' });
      const cap = earned(card) ? card.caption : 'This postcard fills in when you rebuild somewhere new.';
      D.wrap(ctx, cap, 350, 13, 500).forEach((l, i) => D.text(ctx, l, 722, 362 + i * 17, { size: 13, weight: 500, align: 'center', color: '#5b3a1e' }));
      if (earned(card)) D.text(ctx, 'Z / click: flip ' + (this.after ? 'back to before' : 'to after'), 722, 400, { size: 12, weight: 700, align: 'center', color: '#c2410c' });
      D.text(ctx, 'Arrows: pick a postcard · X: leave', 722, H - 70, { size: 12, weight: 700, align: 'center', color: '#fff4dc' });
      D.button(ctx, W - 132, H - 50, 112, 36, 'Leave', { size: 15 });
    }
  }
  CK.HallScene = HallScene;
})();
