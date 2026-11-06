// Cardboard Kingdom - Chapter 13: Home Again (v2.13).
// From the design direction's ending: "When Sam returns home, the model is still imperfect and the
// degree is still a decision, not magically solved. They repair one corner, answer their friend,
// and take a manageable next step." Back on campus after the marsh:
//  * Sam's studio model bridge got crushed, and there's a message from a classmate, Ren, that Sam
//    never answered ("want to team up for the bridge crit?"). Crit Day is tomorrow.
//  * The engineering studio: a new interior, drafting tables, desk lamps, everyone's models.
//  * Rebuild the model bridge with Ren (a balsa truss), and present it at Crit Day.
//  * Sam picks a next step with Dr. Okafor (three choices, all good), Grandma calls, and Sam fixes
//    one corner of the old crushed model and keeps it. Rule Eleven: take the next step, not every step.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input, Data = CK.Data;
  const W = CK.W, H = CK.H, TS = 48;
  const C = D.C, TAU = Math.PI * 2;
  const f = (k) => CK.flag(k);
  const S = CK.Story.scripts;
  const stroke = (ctx, lw, col) => { ctx.strokeStyle = col || C.ink; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };
  const active = () => f('rm_done') && !f('hm_done');
  const REN = { hair: '#6a4ab8', style: 'side', skin: '#e0a878', top: '#e8a33b', pants: '#4a4a5a' };

  Object.assign(Data.speakers, {
    ren: { name: 'Ren', look: 'human', ps: 2.3, py: 20, bg: '#fff0d8', o: REN },
  });

  // ================================================================ PUZZLE
  CK.PuzzleDefs.model_bridge = {
    type: 'truss', title: 'Studio Crit: the Model Bridge', cols: 6, rows: 2, budget: 25, load: 6,
    brief: 'Balsa sticks and glue, with Ren. The bottom row is the deck, and on Crit Day a weighted toy cart rolls all the way across. Connect the dots so it holds. Triangles hold their shape; squares fold flat. Click a stick again to double it up.',
    hint: 'Same idea as the Amberleaf bridge: a top chord, a post at every joint, and a diagonal in every square, leaning down toward the middle so they get pulled, not squished.',
    lesson: 'It isn\'t the strongest bridge in the room. It\'s the best one you two have made, and you can say exactly why every stick is where it is. That\'s the whole point of a crit.',
    solution: null,
  };

  // ================================================================ THE STUDIO
  // A cutscene backdrop: the third-floor studio in Brennan Engineering, late afternoon.
  class StudioScene {
    constructor(mode) { this.t = 0; this.mode = mode || 'day'; this.finished = false; this.parts = new CK.Particles(); }
    update(dt) {
      this.t += dt; this.parts.update(dt);
      if (Math.random() < dt * 1.2) this.parts.emit({ x: U.rand(80, 880), y: U.rand(40, 200), vx: U.rand(-4, 4), vy: U.rand(-3, 3), life: 6, size: 2, shape: 'circle', color: 'rgba(255,240,200,0.5)', fade: true });
    }
    draw(ctx) {
      const crit = this.mode === 'crit', late = this.mode === 'late', eve = this.mode === 'eve' || late;
      // back wall and big windows onto the campus
      ctx.fillStyle = '#e8dccb'; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 2; i++) {
        const wx = 320 + i * 310, wy = 18, ww = 270, wh = 150;
        D.rr(ctx, wx, wy, ww, wh, 6);
        const g = ctx.createLinearGradient(0, wy, 0, wy + wh);
        if (eve) { g.addColorStop(0, '#2a2f6a'); g.addColorStop(1, '#ff9a6a'); } else { g.addColorStop(0, '#9fdcff'); g.addColorStop(1, '#ffe3f1'); }
        ctx.fillStyle = g; ctx.fill();
        // campus trees in fall colors outside, and (at dusk) the first lit windows across the quad
        ctx.save(); D.rr(ctx, wx, wy, ww, wh, 6); ctx.clip();
        if (eve) for (let k = 0; k < 6; k++) D.rr(ctx, wx + 20 + k * 42, wy + 70, 10, 12, 1), ctx.fillStyle = '#ffd25a', ctx.fill();
        for (let k = 0; k < 4; k++) { const tx = wx + 34 + k * 68, ty = wy + wh - 8; D.line(ctx, tx, ty + 10, tx, ty - 14, '#6a4426', 5); D.ball(ctx, tx, ty - 34, 26, ['#e8743b', '#f2a93b', '#6cc56c', '#e05a4a'][(i * 2 + k) % 4], { lw: 2 }); }
        ctx.restore();
        D.rr(ctx, wx, wy, ww, wh, 6); stroke(ctx, 4);
        D.line(ctx, wx + ww / 2, wy, wx + ww / 2, wy + wh, C.ink, 3); D.line(ctx, wx, wy + wh / 2, wx + ww, wy + wh / 2, C.ink, 3);
        ctx.save(); ctx.globalAlpha = eve ? 0.08 : 0.14; D.poly(ctx, [wx, wy + wh, wx + ww, wy + wh, wx + ww + 60, 262, wx + 40, 262], '#fff8d6'); ctx.restore();
      }
      // a corkboard of pinned blueprints and crit notes
      D.cardboard(ctx, 30, 26, 250, 140, { r: 4, lw: 3, fill: '#c99561', flute: false });
      for (let i = 0; i < 5; i++) { const px = 46 + i * 46, py = 40 + (i % 2) * 40; D.rr(ctx, px, py, 36, 46, 2); ctx.fillStyle = ['#fffaf0', '#dff0ff', '#fff3b0', '#fffaf0', '#ffe3ef'][i]; ctx.fill(); stroke(ctx, 1.2); for (let k = 0; k < 4; k++) D.line(ctx, px + 4, py + 8 + k * 8, px + 30, py + 8 + k * 8, 'rgba(60,60,90,0.35)', 1); D.circle(ctx, px + 18, py + 2, 3, '#ef6b6b'); }
      D.text(ctx, 'CRIT: FRIDAY', 155, 156, { size: 14, weight: 700, align: 'center', color: '#c2410c' });
      // a shelf with past studio projects (and, at the very end, Sam's kept model)
      D.box3(ctx, 30, 196, 250, 10, 8, { r: 2, lw: 2.5, fill: '#c9a77a', flute: false });
      D.box3(ctx, 46, 176, 22, 20, 6, { fill: '#ef9f6b', lw: 2, flute: false }); D.box3(ctx, 80, 168, 16, 28, 6, { fill: '#9fc7e8', lw: 2, flute: false });
      if (f('hm_fixed') && !late) this.model(ctx, 200, 194, 'kept', 0.5);
      ctx.save(); ctx.translate(0, -120);
      // floor
      ctx.fillStyle = '#b8a48a'; ctx.fillRect(0, 380, W, H);
      for (let i = 0; i < 8; i++) D.line(ctx, 0, 380 + i * 22, W, 380 + i * 22, 'rgba(60,40,20,0.12)', 2);
      D.line(ctx, 0, 380, W, 380, C.ink, 4);
      // drafting tables with other people's models
      this.table(ctx, 330, 380, 'arch');
      this.table(ctx, 760, 380, crit ? 'tall' : 'beam');
      // Sam's desk, front and centre: the crushed model, a notebook of corrections, a lamp
      D.box3(ctx, 380, 404, 300, 26, 22, { r: 3, lw: 3, fill: '#d9b07a', flute: false });
      for (const lx of [392, 664]) D.line(ctx, lx, 430, lx, 520, '#6a4426', 6);
      const lampX = 640; D.line(ctx, lampX, 402, lampX - 20, 330, C.ink, 3); D.line(ctx, lampX - 20, 330, lampX + 20, 300, C.ink, 3);
      D.poly(ctx, [lampX + 4, 292, lampX + 40, 296, lampX + 30, 318, lampX + 10, 314], '#ef6b6b', C.ink, 2);
      const lg = ctx.createRadialGradient(lampX + 20, 330, 4, lampX + 20, 380, 120); lg.addColorStop(0, 'rgba(255,240,170,0.5)'); lg.addColorStop(1, 'rgba(255,240,170,0)');
      ctx.fillStyle = lg; ctx.fillRect(lampX - 120, 300, 240, 140);
      // notebook: more red than pencil
      ctx.save(); ctx.translate(430, 398); ctx.rotate(-0.08);
      D.rr(ctx, 0, -16, 70, 20, 2); ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 1.5);
      for (let k = 0; k < 3; k++) D.line(ctx, 6, -12 + k * 5, 60, -12 + k * 5, k === 1 ? 'rgba(60,60,90,0.4)' : 'rgba(220,40,40,0.6)', 1.6);
      ctx.restore();
      this.model(ctx, 530, 398, late ? (f('hm_fixed') ? 'kept' : 'crushed') : f('hm_built') ? 'new' : 'crushed');
      // a phone, face up
      D.rr(ctx, 600, 386, 16, 26, 3); ctx.fillStyle = '#2a2a33'; ctx.fill(); stroke(ctx, 1.4);
      D.rr(ctx, 602, 389, 12, 18, 2); ctx.fillStyle = f('hm_replied') ? '#bff5d6' : '#ffe3a0'; ctx.fill();
      ctx.restore();
      if (eve) { ctx.fillStyle = late ? 'rgba(30,24,70,0.45)' : 'rgba(60,40,90,0.18)'; ctx.fillRect(0, 0, W, H); }
      if (late) {
        // only Sam's desk lamp is on
        const lg2 = ctx.createRadialGradient(560, 270, 10, 560, 280, 260); lg2.addColorStop(0, 'rgba(255,230,150,0.45)'); lg2.addColorStop(1, 'rgba(255,230,150,0)');
        ctx.fillStyle = lg2; ctx.fillRect(260, 80, 600, 400);
      }
      this.parts.draw(ctx);
      if (crit) { D.panel(ctx, W / 2 - 160, 8, 320, 40, { fill: '#fff4dc', tape: false }); D.text(ctx, 'CRIT DAY · LOAD TEST', W / 2, 34, { size: 18, weight: 700, align: 'center', color: '#c2410c' }); }
    }
    table(ctx, x, y, kind) {
      D.box3(ctx, x - 90, y - 4, 180, 18, 14, { r: 2, lw: 2.5, fill: '#c9a77a', flute: false });
      for (const k of [-1, 1]) D.line(ctx, x + k * 80, y + 14, x + k * 80, y + 90, '#6a4426', 5);
      ctx.save(); ctx.strokeStyle = '#e8c48c'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      if (kind === 'arch') { ctx.beginPath(); ctx.arc(x, y - 4, 60, Math.PI, 0); ctx.stroke(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y - 4, 62, Math.PI, 0); ctx.stroke(); }
      else if (kind === 'tall') { for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + k * 50, y - 6); ctx.lineTo(x + k * 40, y - 90); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(x - 60, y - 30); ctx.lineTo(x + 60, y - 30); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(x - 70, y - 20); ctx.lineTo(x + 70, y - 20); ctx.stroke(); for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(x + i * 20, y - 20); ctx.lineTo(x + i * 20, y - 6); ctx.stroke(); } }
      ctx.restore();
    }
    // the model: crushed flat, the new truss, or (at the end) the old one with one corner fixed
    model(ctx, x, y, state, sc) {
      ctx.save(); ctx.lineCap = 'round';
      if (sc) { ctx.translate(x, y); ctx.scale(sc, sc); ctx.translate(-x, -y); }
      const stick = (x1, y1, x2, y2, col) => { D.line(ctx, x1, y1, x2, y2, C.ink, 5); D.line(ctx, x1, y1, x2, y2, col || '#f0d29a', 3); };
      if (state === 'kept') {
        // the old crushed model, still mostly flat, with one corner glued back up in fresh balsa
        for (let i = 4; i < 11; i++) { const a = U.hash(i, 9) * 1.4 - 0.7, cx = x - 80 + i * 16; stick(cx, y - 2, cx + Math.cos(a) * 26, y - 6 - Math.abs(Math.sin(a)) * 26); }
        stick(x - 80, y - 4, x + 80, y - 2);
        const fresh = '#ffe2a6', x0 = x - 80;
        stick(x0, y - 2, x0 + 30, y - 2, fresh); stick(x0 + 30, y - 2, x0 + 60, y - 2, fresh);
        stick(x0, y - 2, x0, y - 34, fresh); stick(x0 + 30, y - 2, x0 + 30, y - 34, fresh); stick(x0, y - 34, x0 + 30, y - 34, fresh);
        stick(x0, y - 34, x0 + 30, y - 2, fresh); stick(x0 + 30, y - 34, x0 + 60, y - 2, fresh);
        D.text(ctx, 'one corner', x0 + 20, y - 44, { size: 11, weight: 700, align: 'center', color: '#3e7a5a' });
      } else if (state === 'crushed') {
        for (let i = 0; i < 11; i++) { const a = U.hash(i, 9) * 1.4 - 0.7, cx = x - 80 + i * 16; stick(cx, y - 2, cx + Math.cos(a) * 26, y - 6 - Math.abs(Math.sin(a)) * 26); }
        stick(x - 80, y - 4, x + 80, y - 2);
        D.text(ctx, 'v3 (v4?)', x + 52, y - 30, { size: 11, weight: 700, color: '#c2410c' });
      } else {
        const n = 5, w = 160, h = 34, x0 = x - w / 2;
        for (let i = 0; i < n; i++) { const xa = x0 + i * (w / n), xb = xa + w / n; stick(xa, y, xb, y); stick(xa, y - h, xb, y - h); stick(xa, y, xa, y - h); i < n / 2 ? stick(xa, y - h, xb, y) : stick(xa, y, xb, y - h); }
        stick(x0 + w, y, x0 + w, y - h);
      }
      ctx.restore();
    }
  }
  CK.StudioScene = StudioScene;
  // studio + people standing in it, so dialogue lines play over the room
  class StudioPeople extends StudioScene {
    constructor(mode, who) { super(mode); this.who = who || ['sam', 'ren']; }
    draw(ctx) {
      super.draw(ctx);
      const spots = { sam: [250, 372], ren: [770, 372], jules: [140, 372], okafor: [880, 372], corry: [60, 340] };
      const top = CK.Scenes.top(), talking = top && top.who;
      for (const w of this.who) {
        const [x, y] = spots[w], mood = talking === w ? top.mood || 'happy' : 'happy';
        if (w === 'ren') D.char(ctx, 'human', x, y, Object.assign({ s: 2.4, dir: 'left', mood }, REN));
        else D.char(ctx, w, x, y, { s: w === 'corry' ? 0.9 : 2.4, dir: w === 'sam' || w === 'jules' ? 'right' : 'left', mood });
      }
    }
  }
  // Sam's phone, held up close: the three-week-old message, and (once answered) the reply
  class PhoneScene {
    constructor(call) { this.transparent = true; this.call = call; this.t0 = CK.time; this.msgs = [{ from: 'ren', text: 'hey, want to team up for the bridge crit? no pressure :)', time: '3 weeks ago' }]; }
    update(dt) { this.t += dt; }
    draw(ctx) {
      ctx.fillStyle = 'rgba(20,20,40,0.35)'; ctx.fillRect(0, 0, W, H);
      const px = W - 330, py = 20 + Math.max(0, 1 - (CK.time - this.t0) * 4) * 400, pw = 260, ph = 340;
      ctx.save(); ctx.translate(px + pw / 2, py + ph / 2); ctx.rotate(-0.03); ctx.translate(-pw / 2, -ph / 2);
      D.rr(ctx, 0, 0, pw, ph, 30); ctx.fillStyle = '#ef8fb0'; ctx.fill(); stroke(ctx, 4);   // a pink phone case with a sticker
      D.rr(ctx, 12, 14, pw - 24, ph - 28, 22); ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 2);
      D.rr(ctx, 12, 14, pw - 24, 50, 22); ctx.fillStyle = '#ffe3a0'; ctx.fill();
      if (this.call) {
        // a video call: Grandma, in her garden, holding the phone too close
        ctx.save(); D.rr(ctx, 12, 14, pw - 24, ph - 28, 22); ctx.clip();
        const g = ctx.createLinearGradient(0, 14, 0, ph); g.addColorStop(0, '#bfe8ff'); g.addColorStop(1, '#bfe6a0'); ctx.fillStyle = g; ctx.fillRect(0, 0, pw, ph);
        for (let k = 0; k < 6; k++) D.ball(ctx, 24 + k * 44, ph - 70 + (k % 2) * 10, 22, ['#7cc46a', '#f2a93b', '#6cc56c'][k % 3], { lw: 2 });
        for (let k = 0; k < 5; k++) D.ball(ctx, 36 + k * 48, ph - 96 + (k % 2) * 8, 6, ['#ff9ec7', '#ffd25a', '#ef6b6b'][k % 3], { lw: 1.2 });
        D.char(ctx, 'grandma', pw / 2, ph + 40, { s: 4.2, mood: 'happy', noShadow: true });
        ctx.restore();
        D.rr(ctx, 12, 14, pw - 24, 50, 22); ctx.fillStyle = 'rgba(255,250,240,0.85)'; ctx.fill();
        D.text(ctx, this.call, pw / 2, 46, { size: 16, weight: 700, align: 'center', color: C.ink });
        D.circle(ctx, pw / 2 - 90, ph - 46, 14, '#ef6b6b'); D.circle(ctx, pw / 2 + 90, ph - 46, 14, '#7cc46a');
        D.rr(ctx, pw / 2 - 30, ph - 24, 60, 4, 2); ctx.fillStyle = C.ink; ctx.fill();
        ctx.restore();
        return;
      }
      D.circle(ctx, 44, 39, 15, REN.top); D.text(ctx, 'R', 44, 45, { size: 16, weight: 700, align: 'center', color: '#fff' });
      D.text(ctx, 'Ren (studio)', 68, 45, { size: 16, weight: 700, color: C.ink });
      let y = 80;
      for (const m of this.msgs) {
        const mine = m.from === 'sam', bw = 170, lines = D.wrap(ctx, m.text, bw - 20, 13);
        const bh = 16 + lines.length * 18, bx = mine ? pw - 24 - bw : 24;
        if (m.time) { D.text(ctx, m.time, pw / 2, y + 2, { size: 11, align: 'center', color: '#8a7a6a' }); y += 14; }
        D.rr(ctx, bx, y, bw, bh, 12); ctx.fillStyle = mine ? '#9fdcff' : '#f1e6d6'; ctx.fill(); stroke(ctx, 1.5);
        lines.forEach((ln, i) => D.text(ctx, ln, bx + 10, y + 22 + i * 18, { size: 13, color: C.ink }));
        y += bh + 8;
      }
      if (this.msgs.length === 1) D.text(ctx, 'Seen', pw - 30, y, { size: 11, align: 'right', color: '#c2410c' });
      D.rr(ctx, pw / 2 - 30, ph - 24, 60, 4, 2); ctx.fillStyle = C.ink; ctx.fill();
      ctx.restore();
    }
  }
  let phone = null;
  const showPhone = { fn: () => { phone = new PhoneScene(); CK.Scenes.push(phone); } };
  const showCall = { fn: () => { phone = new PhoneScene('Grandma Rosie'); CK.Scenes.push(phone); } };
  const hidePhone = { fn: () => { if (phone) CK.Scenes.remove(phone); phone = null; } };
  const sent = (mine, back) => ({ fn: () => { if (phone) phone.msgs.push({ from: 'sam', text: mine, time: 'now' }, { from: 'ren', text: back }); } });
  let studio = null;
  const enterStudio = (mode, who) => ({ fn: () => { if (studio) CK.Scenes.remove(studio); studio = new StudioPeople(mode, who); CK.Scenes.push(studio); } });
  const leaveStudio = { fn: () => { if (studio) CK.Scenes.remove(studio); studio = null; } };

  // ================================================================ SCRIPTS
  S.hm_intro = [
    { card: { title: 'Chapter 13', sub: 'Home Again' } },
    { narrate: 'Back on campus. The pond is full of ducks, the regatta flags are still up, and Sam\'s phone has been buzzing in their pocket for three weeks.' },
    showPhone,
    { narrate: 'One message, from Ren, a classmate from studio. Sent three weeks ago. Seen. Never answered.' },
    ['sam', '...Oh no. Crit Day is tomorrow. And my model is...', 'shock'],
    { narrate: 'Sam\'s model bridge, version three, is still on the studio desk upstairs. The last time Sam saw it, a desk lamp had fallen on it. It was very, very flat.' },
    ['jules', 'You can answer it, you know. Messages don\'t expire. They just get heavier. I would know. I didn\'t call my mom for a month.', 'happy'],
    { choice: { who: 'sam', text: 'Answer Ren?', options: [
      { label: '"Sorry I went quiet. Still want to team up?"', then: [{ flag: 'hm_replied' }, sent('sorry I went quiet. still want to team up?', 'YES. studio, 20 min? i have glue'), { narrate: 'Three dots. Then: "YES. studio, 20 min? i have glue."' }] },
      { label: '"I\'m back. My model got crushed. Help?"', then: [{ flag: 'hm_replied' }, sent('i\'m back. my model got crushed. help?', 'mine collapsed too lol. studio, 20 min?'), { narrate: 'Three dots. Then: "mine collapsed too lol. studio, 20 min?"' }] },
    ] } },
    hidePhone,
    { flag: 'hm_start' },
    { fn: () => { if (CK.OW) CK.OW.refresh(); } },
    { journal: 'Back on campus. My model bridge got crushed, and I never answered Ren\'s message about teaming up for Crit Day. I answered it. Studio, 20 minutes.' },
    { save: true },
  ];
  S.hm_studio = [
    enterStudio('day', ['sam', 'ren']),
    ['ren', 'Hey! You came. I thought maybe you were ignoring me because my design was bad.', 'sad'],
    ['sam', 'I wasn\'t ignoring you. I wasn\'t answering anyone. Everything I made kept coming back covered in red pen, and I just... stopped.', 'sad'],
    ['ren', 'Same, honestly. Mine was so heavy it collapsed under its own weight. My crit note just says "why".', 'happy'],
    ['sam', 'Okay. Let\'s make one together. Triangles. Lots of triangles.', 'happy'],
    { fn: () => { if (studio) CK.Scenes.remove(studio); studio = null; } },
    { puzzle: 'model_bridge' },
    enterStudio('eve', ['sam', 'ren']),
    { flag: 'hm_built' },
    ['ren', 'It\'s... not perfect. That joint\'s got way too much glue.', 'happy'],
    ['sam', 'It\'s ours, though. And I can tell you why every stick is where it is.', 'happy'],
    { narrate: 'They stay until the custodian turns the lights off on them. Twice.' },
    leaveStudio,
    { journal: 'Built a model truss bridge with Ren in the studio. Not perfect. Too much glue on one joint. Ours.' },
    { save: true },
  ];
  S.hm_crit = [
    enterStudio('crit', ['sam', 'ren', 'okafor']),
    { narrate: 'Crit Day. Dr. Okafor rolls a weighted toy cart across each bridge in turn. The arch holds. The tall one wobbles. One very beautiful bridge folds in half.' },
    { narrate: 'Sam and Ren\'s bridge creaks, bends a little, and holds.' },
    ['okafor', 'It\'s not the strongest bridge in the room.', 'happy'],
    ['okafor', 'But it\'s the best one either of you has made, and you can both tell me exactly why it stands. That\'s an engineer.', 'happy'],
    ['ren', 'Did she just say "engineer" about US?', 'shock'],
    ['sam', 'I used to make things because I wanted to see them work. ...It worked.', 'happy'],
    leaveStudio,
    { flag: 'hm_crit' },
    { journal: 'Crit Day: our bridge wasn\'t the strongest. It held. Dr. Okafor called us engineers. Ren screamed a little.' },
    { save: true },
  ];
  S.hm_next = [
    enterStudio('eve', ['sam', 'okafor']),
    ['okafor', 'So. Water resources, you said, at the end of last term. Still the plan?', 'happy'],
    ['sam', 'Still the plan. I just... don\'t want to burn out on the way there again.', 'sad'],
    ['okafor', 'Then let\'s not design the whole degree today. What\'s the next step? Just the next one.', 'happy'],
    { choice: { who: 'sam', text: 'Sam\'s next step', options: [
      { label: 'A lighter load next term, plus the stream lab', then: [{ fn: () => CK.setFlag('hm_path', 'lighter') }, ['sam', 'Four classes, not six. And the stream restoration lab on Fridays, with real mud.', 'happy'], ['okafor', 'Four is plenty. I\'ll sign it. And wear boots to the lab.', 'happy']] },
      { label: 'A gap semester, building with Grandma', then: [{ fn: () => CK.setFlag('hm_path', 'gap') }, ['sam', 'A semester off. Grandma\'s Riverbend garden floods every spring, and the town wants a rain garden. I want to build it. Then come back.', 'happy'], ['okafor', 'That isn\'t stopping. That\'s fieldwork. Send me photos, and come back in the fall.', 'happy']] },
      { label: 'A river project with Jules', then: [{ fn: () => CK.setFlag('hm_path', 'jules') }, ['sam', 'Jules wants to study rivers, and I want to build things for them. Could we do an independent study together? Fish and floods.', 'happy'], ['okafor', 'A biologist and an engineer on the same stream. Do you know how rare that is? Yes. Write me a page.', 'happy']] },
    ] } },
    ['okafor', 'And Sam? Whatever you pick, you\'re allowed to change it later. That\'s not failing. That\'s iterating.', 'happy'],
    enterStudio('eve', ['sam']),
    { narrate: 'Dr. Okafor heads home. Sam\'s phone buzzes. A video call. GRANDMA ROSIE.' },
    showCall,
    { fn: () => {
      const p = CK.G.flags.hm_path;
      return [
        ['grandma', p === 'gap' ? 'A whole semester in my garden? Pish. You\'ll be bored in a week. Bring boots. I\'ve already made up the spare bed.' : p === 'jules' ? 'You and Ike\'s grandkid, on a river together. Oh, love. He\'d have liked that more than I can say.' : 'Four classes and mud on Fridays. That\'s the most sensible thing you\'ve said since you were eight.', 'happy'],
        ['grandma', 'You know what I did after my first box went soft? I fixed one corner of it. Just one. Then I could look at it again.', 'happy'],
      ];
    } },
    hidePhone,
    { flag: 'hm_next' },
    { save: true },
  ];
  S.hm_finale = [
    enterStudio('late', ['sam']),
    { narrate: 'Late. The studio is empty. Sam takes the old crushed model, version three, out of the bin.' },
    { narrate: 'One stick at a time, they glue a single corner back together. Just one. The rest stays flat.' },
    { flag: 'hm_fixed' },
    ['sam', 'It\'s still mostly broken. That\'s okay. I can look at it now.', 'happy'],
    ['sam', 'I don\'t have to fix everything tonight. Just the next corner.', 'happy'],
    { narrate: 'Sam puts it on the shelf above the desk, next to Grandma\'s sketchbook and a terrible spoon shaped like a ramp.' },
    ['sam', 'Rule Eleven: take the next step, not every step.', 'happy'],
    leaveStudio,
    { flag: 'hm_done' },
    { journal: 'Rule Eleven: take the next step, not every step. I fixed one corner of the crushed model and put it on the shelf. The degree is still a decision. That\'s okay.' },
    { card: { title: 'Chapter 13 complete', sub: 'Home Again' } },
    { save: true },
  ];
  // the studio evening rolls straight into Crit Day, and the talk with Dr. Okafor into the late-night repair
  S.hm_studio = S.hm_studio.concat([{ card: { title: 'The next morning', sub: 'Crit Day' } }], S.hm_crit);
  S.hm_next = S.hm_next.concat(S.hm_finale);
  const PATH_LINES = {
    lighter: ['okafor', 'Four classes and the stream lab. I put you on the Friday crew. Boots, Sam. I\'m serious about the boots.', 'happy'],
    gap: ['okafor', 'Rain garden photos, every week, please. Label your plants. Come back in the fall and teach us something.', 'happy'],
    jules: ['okafor', 'Your one-page proposal with Jules was three pages. That\'s the right kind of wrong. Approved.', 'happy'],
  };
  S.hm_visit = [
    enterStudio('day', ['sam']),
    { narrate: 'The studio, on an ordinary afternoon. On the shelf above Sam\'s desk: the old model, with one corner fixed.' },
    (G) => [G.flags.hm_path === 'gap' ? ['sam', 'Riverbend next week. I\'m packing boots, a shovel, and Grandma\'s sketchbook. Mostly boots.', 'happy'] : G.flags.hm_path === 'jules' ? ['sam', 'Jules counts the fish, I design the bends. Fen would be so proud of us.', 'happy'] : ['sam', 'Four classes. And Fridays in the stream. I\'m actually looking forward to a Friday.', 'happy']],
    leaveStudio,
  ];
  function renTalk() {
    if (!f('hm_built')) return [['ren', 'Studio\'s third floor of Brennan. I have glue. So much glue.', 'happy']];
    const p = CK.G.flags.hm_path;
    return [U.pick([
      p === 'gap' ? ['ren', 'A rain garden! Send me pictures. I\'ll save you a desk next to mine for when you\'re back.', 'happy'] : ['ren', 'Same team next semester? I already wrote it in my planner. In pen.', 'happy'],
      ['ren', 'My mom framed the crit photo. We\'re both blinking. It\'s perfect.', 'happy'],
    ])];
  }

  // ================================================================ WIRING INTO CAMPUS
  const campus = CK.Chapters.campus;
  campus.objects.push({ type: 'npc', id: 'ren', name: 'Ren', x: 25, y: 9, look: 'human', o: REN, talk: () => renTalk(), cond: () => f('hm_start') });
  const eng = campus.objects.find((o) => o.id === 'eng');
  if (eng) {
    const baseScript = eng.script;
    eng.script = (G) => {
      if (f('hm_done')) return 'hm_visit';
      if (!active() || !f('hm_start')) return typeof baseScript === 'function' ? baseScript(G) : baseScript;
      if (!f('hm_crit')) return 'hm_studio';
      return 'hm_next';
    };
  }
  const okOut = campus.objects.find((o) => o.id === 'okafor_out');
  if (okOut) {
    const baseTalk = okOut.talk;
    okOut.talk = (G) => {
      if (f('hm_done')) return [PATH_LINES[G.flags.hm_path] || PATH_LINES.lighter];
      if (!active() || !f('hm_start')) return typeof baseTalk === 'function' ? baseTalk(G) : baseTalk;
      if (!f('hm_crit')) return [['okafor', 'Crit is in the studio, third floor. Bring something you can explain. That matters more than something that\'s pretty.', 'happy']];
      return [['okafor', 'Come up to the studio when you\'re ready. No rush. Well. A little rush. I lock up at six.', 'happy']];
    };
  }
  const baseObjective = campus.objective;
  campus.objective = function (G) {
    if (active() && f('hm_start')) {
      if (!f('hm_crit')) return 'Meet Ren in the studio (Brennan Engineering, north)';
      return 'Talk to Dr. Okafor about what\'s next (studio)';
    }
    if (f('hm_done')) return 'Free time! Fish at the pond, say hi to Ren, or take Grandma\'s box back to the Kingdom';
    return baseObjective.call(this, G);
  };
  // coming home after the marsh starts the chapter
  const baseGoto = CK.gotoChapter;
  CK.gotoChapter = function (id, pos) {
    baseGoto(id, pos);
    if (id === 'campus' && active() && !f('hm_start')) CK.runScript('hm_intro');
  };
  // and the fold-out map says so
  const baseTravel = CK.travelChoice;
  CK.travelChoice = function (text) {
    const c = baseTravel(text);
    if (active() && !f('hm_start')) {
      const home = c.choice.options.find((o) => /campus/i.test(o.label));
      if (home) home.label = 'Home (campus) (new chapter!)';
    }
    return c;
  };
})();
