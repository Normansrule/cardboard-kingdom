// Cardboard Kingdom - Friends: personality for the main cast.
//  * Emotes: little cartoon bubbles (!, ?, hearts, music notes, sweat drops) over heads and portraits.
//  * Fidgets: stand still and everyone does their own thing. Corry polishes his helmet, Pip does
//    loop-the-loops, Sam doodles bridges in the air, Jules hums.
//  * Banter: while you walk, the party chats in speech bubbles, without stopping the game.
//  * Campfire Talks: sit by any campfire with a friend for a heart-to-heart. Each talk deepens
//    your bond (and gives a small boost), and new talks open up as the story goes on.
//  * Friends page (pause menu): who everyone is, what they want, what they're scared of.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input;
  const W = CK.W, H = CK.H;
  const C = D.C, TAU = Math.PI * 2;
  const f = (k) => CK.flag(k);
  const S = CK.Story.scripts;
  const stroke = (ctx, lw, col) => { ctx.strokeStyle = col || C.ink; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };

  // ================================================================ EMOTES
  // drawEmote(ctx, kind, x, y, t): a speech-bubble icon centred at (x, y)
  function heart(ctx, x, y, r, col) {
    ctx.beginPath();
    ctx.moveTo(x, y + r * 0.9);
    ctx.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.4, x, y - r * 0.5);
    ctx.bezierCurveTo(x + r * 0.7, y - r * 1.4, x + r * 1.6, y - r * 0.2, x, y + r * 0.9);
    ctx.fillStyle = col; ctx.fill(); stroke(ctx, 1.6);
  }
  function note(ctx, x, y, s, col) {
    D.egg(ctx, x, y, 3.6 * s, 2.7 * s, col, { lw: 1.4, rot: -0.4 });
    D.line(ctx, x + 3 * s, y - 1 * s, x + 3 * s, y - 13 * s, C.ink, 1.8);
    ctx.beginPath(); ctx.moveTo(x + 3 * s, y - 13 * s); ctx.quadraticCurveTo(x + 9 * s, y - 10 * s, x + 7 * s, y - 5 * s); stroke(ctx, 1.8);
  }
  const EMOTES = {
    '!': (ctx, x, y) => { D.rr(ctx, x - 3, y - 11, 6, 14, 3); ctx.fillStyle = '#ef6b6b'; ctx.fill(); stroke(ctx, 1.4); D.circle(ctx, x, y + 8, 3, '#ef6b6b', C.ink, 1.4); },
    '?': (ctx, x, y) => D.text(ctx, '?', x, y + 8, { size: 24, weight: 700, align: 'center', color: '#5aa9e6', outline: C.ink, ow: 3 }),
    heart: (ctx, x, y, t) => heart(ctx, x, y, 8 + Math.sin(t * 8) * 1, '#ff7aa0'),
    note: (ctx, x, y, t) => { note(ctx, x - 5, y + 6 + Math.sin(t * 5) * 2, 1, '#a68be6'); note(ctx, x + 6, y + 2 + Math.sin(t * 5 + 1) * 2, 0.8, '#5aa9e6'); },
    sweat: (ctx, x, y) => { D.egg(ctx, x + 2, y, 5, 8, '#9fd6ff', { lw: 1.4 }); D.circle(ctx, x, y - 1, 1.6, '#ffffff'); },
    anger: (ctx, x, y) => { for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 6, y + Math.sin(a) * 6, 4.5, a + Math.PI * 0.6, a + Math.PI * 1.4); stroke(ctx, 2.6, '#e0453a'); } },
    zzz: (ctx, x, y, t) => { for (let i = 0; i < 3; i++) D.text(ctx, 'z', x - 6 + i * 6, y + 8 - i * 6 - ((t * 6) % 3), { size: 11 + i * 2, weight: 700, color: '#6a7ab0', outline: '#fff', ow: 2 }); },
    spark: (ctx, x, y, t) => { for (let i = 0; i < 3; i++) { const r = 3 + ((t * 3 + i * 0.33) % 1) * 5, sx = x - 8 + i * 8, sy = y + (i % 2) * 6 - 3; D.poly(ctx, [sx, sy - r, sx + r * 0.3, sy - r * 0.3, sx + r, sy, sx + r * 0.3, sy + r * 0.3, sx, sy + r, sx - r * 0.3, sy + r * 0.3, sx - r, sy, sx - r * 0.3, sy - r * 0.3], '#ffd25a', C.ink, 1); } },
    idea: (ctx, x, y) => { D.ball(ctx, x, y - 2, 7, '#fff3b0', { lw: 1.6 }); D.rr(ctx, x - 3.5, y + 5, 7, 5, 1); ctx.fillStyle = '#a9aeb6'; ctx.fill(); stroke(ctx, 1.2); for (let i = 0; i < 5; i++) { const a = -Math.PI + i * Math.PI / 4; D.line(ctx, x + Math.cos(a) * 10, y - 2 + Math.sin(a) * 10, x + Math.cos(a) * 13, y - 2 + Math.sin(a) * 13, '#ffb000', 1.6); } },
    bridge: (ctx, x, y) => { ctx.beginPath(); ctx.arc(x, y + 7, 11, Math.PI, 0); stroke(ctx, 2, '#5b3a1e'); D.line(ctx, x - 14, y - 2, x + 14, y - 2, '#5b3a1e', 2); for (let i = -2; i <= 2; i++) D.line(ctx, x + i * 5, y - 2, x + i * 5, y + 7 - Math.sqrt(Math.max(0, 121 - (i * 5) ** 2)) + 4, '#5b3a1e', 1); },
    tear: (ctx, x, y) => { D.egg(ctx, x, y + 2, 4, 6, '#9fd6ff', { lw: 1.3 }); },
    star: (ctx, x, y, t) => { const r = 8 + Math.sin(t * 6); const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; pts.push(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } D.poly(ctx, pts, '#ffd25a', C.ink, 1.5); },
  };
  CK.drawEmote = function (ctx, kind, x, y, t, bubble = true) {
    const fn = EMOTES[kind];
    if (!fn) return;
    if (bubble) {
      ctx.beginPath(); ctx.ellipse(x, y, 17, 15, 0, 0, TAU);
      ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 2);
      D.poly(ctx, [x - 4, y + 13, x + 4, y + 13, x - 2, y + 21], '#fffaf0');
      ctx.beginPath(); ctx.moveTo(x - 4, y + 14); ctx.lineTo(x - 2, y + 21); ctx.lineTo(x + 4, y + 14); stroke(ctx, 2);
    }
    fn(ctx, x, y, t || CK.time);
  };

  // portraits show an emote for strong feelings
  const MOOD_EMOTE = { shock: '!', angry: 'anger', sad: 'tear' };
  const basePortrait = D.portrait;
  D.portrait = function (ctx, who, x, y, mood) {
    basePortrait.call(this, ctx, who, x, y, mood);
    const k = MOOD_EMOTE[mood];
    if (k && who !== 'narrator') {
      const pop = Math.min(1, ((CK.time * 1.5) % 4) * 4);
      ctx.save(); ctx.translate(x + 96, y + 8); ctx.scale(0.8 * pop, 0.8 * pop);
      CK.drawEmote(ctx, k, 0, 0, CK.time);
      ctx.restore();
    }
  };

  // ================================================================ FIDGETS
  // While the player stands still, each friend does their own little thing.
  const FIDGET = {
    corry: { cycle: 7, off: 1.5, len: 1.4, emote: 'spark' },
    pip: { cycle: 6, off: 3.2, len: 0.9, emote: null },
    sam: { cycle: 9, off: 4.5, len: 2.2, emote: 'bridge' },
    jules: { cycle: 8, off: 0.4, len: 2.6, emote: 'note' },
  };
  const baseChar = D.char;
  D.char = function (ctx, look, x, y, o) {
    const F = FIDGET[look];
    const idle = CK._owIdle;
    if (!F || !CK._owDraw || idle == null || idle < 2.5 || (o && (o.noShadow || o.walk))) return baseChar.call(this, ctx, look, x, y, o);
    const ph = (idle + F.off) % F.cycle;
    if (ph > F.len) return baseChar.call(this, ctx, look, x, y, o);
    const k = ph / F.len;
    ctx.save();
    if (look === 'pip') {
      // a loop-the-loop: hop up, spin all the way round, land
      const hop = Math.sin(k * Math.PI) * 26;
      ctx.translate(x, y - 22 - hop); ctx.rotate(k * TAU); ctx.translate(-x, -(y - 22));
      baseChar.call(this, ctx, look, x, y, Object.assign({}, o, { still: true }));
    } else if (look === 'corry') {
      // polishing the pot helmet: a little rock side to side
      const r = Math.sin(k * Math.PI * 6) * 0.07;
      ctx.translate(x, y); ctx.rotate(r); ctx.translate(-x, -y);
      baseChar.call(this, ctx, look, x, y, Object.assign({}, o, { mood: 'happy' }));
    } else if (look === 'sam') {
      // a big stretch, then a bridge doodle in the air
      const st = 1 + Math.sin(Math.min(1, k * 2) * Math.PI) * 0.07;
      ctx.translate(x, y); ctx.scale(1 / Math.sqrt(st), st); ctx.translate(-x, -y);
      baseChar.call(this, ctx, look, x, y, Object.assign({}, o, { still: true }));
    } else {
      // humming and swaying
      const r = Math.sin(k * Math.PI * 4) * 0.05;
      ctx.translate(x, y); ctx.rotate(r); ctx.translate(-x, -y);
      baseChar.call(this, ctx, look, x, y, Object.assign({}, o, { mood: 'happy' }));
    }
    ctx.restore();
    if (F.emote && k > 0.15) {
      const lift = look === 'jules' ? -k * 14 : 0;
      ctx.save(); ctx.translate(x + 18, y - 76 + lift); const sc = Math.min(1, (k - 0.15) * 6) * 0.8; ctx.scale(sc, sc);
      CK.drawEmote(ctx, F.emote, 0, 0, CK.time, look !== 'jules');
      ctx.restore();
    }
  };

  // ================================================================ BANTER
  // Little conversations that play out in speech bubbles while you walk. Each one plays once.
  // `who` lists who must be around; `when` is when it fits the story.
  const ch = (id) => () => CK.G.chapter === id;
  const BANTER = [
    // anywhere in the Kingdom
    { id: 'kettle', who: ['pip', 'corry'], when: () => true, lines: [['pip', 'Fact: a flock of birds circling together is called a kettle. I would like to be in a kettle.', 'idea'], ['corry', 'You are in a kettle, Pip. We are the kettle.', 'heart'], ['pip', 'I am in a KETTLE!', 'star']] },
    { id: 'knot', who: ['corry', 'sam'], when: () => true, lines: [['corry', 'Builder, your shoelace was untied. I have tied it in a knightly knot.', 'spark'], ['sam', "What's a knightly knot?", '?'], ['corry', 'A double knot, tied with confidence.']] },
    { id: 'steps', who: ['pip', 'sam'], when: () => true, lines: [['pip', 'We have walked three thousand one hundred and two steps today.', 'idea'], ['sam', 'Pip, you were flying the whole time.'], ['pip', 'I was counting YOUR steps. Three thousand one hundred and three.']] },
    { id: 'front', who: ['corry', 'pip'], when: () => true, lines: [['corry', 'Should danger strike, fear not. I shall stand in front.', 'spark'], ['pip', 'Last time you stood in front of a puddle and screamed.', 'sweat'], ['corry', 'That was a battle cry. A wet one.']] },
    { id: 'doodle', who: ['sam', 'corry'], when: () => true, lines: [['sam', 'I drew another bridge on my hand.', 'bridge'], ['corry', 'A fine bridge. Is it load-bearing?'], ['sam', 'Emotionally.']] },
    { id: 'ledger', who: ['corry'], when: () => f('ft_corry_1'), lines: [['corry', 'Item: the Builder said "thank you" to a mailbox. Small Deed. Writing it down.', 'spark']] },
    { id: 'stickers', who: ['corry', 'sam'], when: () => f('ft_corry_1'), lines: [['corry', 'I have eight stickers left. I must ration my approval.', 'sweat'], ['sam', 'You gave a squirrel one yesterday.'], ['corry', 'It was a very brave squirrel.']] },
    { id: 'windy', who: ['pip'], when: () => true, lines: [['pip', 'Wheeee! Sorry. Wind. Wheeeee!', 'star']] },
    // spring
    { id: 'sp_blossom', who: ['pip', 'corry'], when: ch('spring'), lines: [['pip', 'Cherry blossoms are only open for about a week. A WEEK, Corry.', '!'], ['corry', 'Then we must admire them twice as hard.', 'heart']] },
    { id: 'sp_rain', who: ['corry', 'sam'], when: ch('spring'), lines: [['corry', '...Is that a raincloud?', 'sweat'], ['sam', "It's a sheep, Corry."], ['corry', 'Hm. A suspicious sheep.']] },
    // summer
    { id: 'su_sun', who: ['corry', 'pip'], when: ch('summer'), lines: [['corry', 'Pip, have you applied sunscreen?', '?'], ['pip', "I'm paper. I'll just fade a bit. It's very vintage.", 'star']] },
    { id: 'su_crab', who: ['pip', 'sam'], when: ch('summer'), lines: [['pip', 'Fact: crabs walk sideways because their legs bend that way.', 'idea'], ['sam', 'I walk sideways when I see my email.', 'sweat']] },
    // fall
    { id: 'fa_leaves', who: ['corry', 'pip'], when: ch('fall'), lines: [['corry', 'I shall now jump into that leaf pile with honor.'], ['pip', 'Is there a version without honor? That one looks fun.', '?']] },
    { id: 'fa_charter', who: ['corry', 'sam'], when: () => CK.G.chapter === 'fall' && f('fall_arrived'), lines: [['corry', 'Builder... you spelled "kingdom" with two Gs on the charter.', 'sweat'], ['sam', 'I was EIGHT.'], ['corry', 'It is the official spelling now. Kinggdom.', 'heart']] },
    // winter
    { id: 'wi_cold', who: ['corry', 'pip'], when: ch('winter'), lines: [['corry', 'My teeth would be chattering, if I had teeth.', 'sweat'], ['pip', 'You have a felt mouth.'], ['corry', 'It is chattering in spirit.']] },
    { id: 'wi_snow', who: ['pip', 'sam'], when: ch('winter'), lines: [['pip', 'Every snowflake has six sides. I have caught two hundred. All six. Every time.', 'star'], ['sam', "You're very good at catching things."], ['pip', 'Except a breeze. I am bad at that. Very bad.', 'sweat']] },
    // the real world: Sam thinking out loud (no followers there)
    { id: 'cp_think', who: ['sam'], when: () => CK.G.chapter === 'campus' && f('epilogue'), lines: [['sam', 'Huh. The campus looks different when you know a crab lives in the drain.', 'idea']] },
    { id: 'cp_lamp', who: ['sam'], when: () => CK.G.chapter === 'campus' && f('lm_done'), lines: [['sam', "Note to self: new desk lamp bulb. Jules won't say it, but the old one flickers.", 'idea']] },
    { id: 'rb_cookies', who: ['sam'], when: ch('riverbend'), lines: [['sam', "Grandma's kitchen still smells like burnt sugar. She says it's on purpose.", 'heart']] },
    // with Jules (co-op, or anywhere Jules is along)
    { id: 'j_moths', who: ['jules', 'pip'], when: ch('lanternmere'), lines: [['jules', 'Do the Moth-kin have names?', '?'], ['pip', 'Moths do not usually—'], ['jules', "That one's Gerald.", 'heart'], ['pip', 'That one is DEFINITELY Gerald.', 'star']] },
    { id: 'j_fish', who: ['jules', 'corry'], when: () => true, lines: [['jules', "Fun fact: an octopus has three hearts.", 'idea'], ['corry', 'Three hearts! Imagine the courage.', '!'], ['jules', "Also blue blood. They're basically knights.", 'heart']] },
    { id: 'j_lost', who: ['jules', 'sam'], when: () => true, lines: [['jules', 'Quick question. Which way is north?', '?'], ['sam', "We've been walking north for ten minutes."], ['jules', "Cool, cool. And I've been walking...?", 'sweat']] },
    { id: 'j_hum', who: ['jules', 'sam'], when: () => true, lines: [['jules', '♪ Oh the box was cold and the night was long... ♪', 'note'], ['sam', 'Are you humming a sea shanty?'], ['jules', "I hum when I'm nervous. Also when I'm not nervous. It's a whole thing.", 'sweat']] },
    { id: 'gp_names', who: ['jules', 'sam'], when: ch('gullpoint'), lines: [['jules', "That gull is Admiral Squawk. That one's Brenda.", 'heart'], ['sam', 'How can you tell them apart?'], ['jules', "Brenda has a Brenda face. Grandpa named every gull here, you know.", 'note']] },
    { id: 'gp_cold', who: ['corry', 'pip'], when: ch('gullpoint'), lines: [['corry', 'Sea spray. My nemesis.', 'anger'], ['pip', 'Fact: salt water freezes at a lower temperature than fresh water.', 'idea'], ['corry', 'So it is wetter for LONGER. Unacceptable.', 'sweat']] },
    { id: 'gp_tin', who: ['pip', 'sam'], when: () => CK.G.chapter === 'gullpoint' && f('gp_tin'), lines: [['pip', 'Old Tin says his bucket is too small. I am going to measure every bucket in the Kingdom.', 'idea'], ['sam', 'All of them?'], ['pip', 'I have already started. Forty-one buckets.', 'star']] },
    { id: 'lm_bright', who: ['corry', 'sam'], when: () => CK.G.chapter === 'lanternmere' && !f('lm_lights'), lines: [['corry', 'I cannot see my own sword. It is either very shiny or very lost.', 'sweat']] },
    { id: 'lm_dark', who: ['pip', 'corry'], when: () => CK.G.chapter === 'lanternmere' && f('lm_lights'), lines: [['pip', 'I can see the Big Dipper! And the Little Dipper! And a medium one I just made up!', 'star'], ['corry', 'The Medium Dipper. I approve.', 'heart']] },
    // later: friends who know each other better
    { id: 'late_box', who: ['corry', 'sam'], when: () => f('ft_corry_3'), lines: [['corry', 'Builder, about the front row at your graduation...', '?'], ['sam', "Saving you a seat. Promise."], ['corry', 'I have begun polishing the helmet. It will take some months.', 'spark']] },
    { id: 'late_tape', who: ['pip', 'sam'], when: () => f('ft_pip_3'), lines: [['pip', 'My tape spot is the strongest bit of me. Poke it. Go on.', 'star'], ['sam', '...It is very strong.'], ['pip', 'Fixed spots are stronger. Grandma science.', 'heart']] },
  ];
  const speakerPos = (ow, who) => {
    if (who === 'sam') return ow.player;
    if (who === 'jules') return ow.p2 || null;
    if (ow.ch.noFollowers) return null;
    if (who === 'corry') return ow.trail[16];
    if (who === 'pip') return ow.trail[32];
    return null;
  };
  function pickBanter(ow) {
    const ok = BANTER.filter((b) => !f('bt_' + b.id) && b.who.every((w) => speakerPos(ow, w)) && b.when());
    if (!ok.length) return null;
    return ok[Math.floor(U.hash(Math.floor(CK.G.time || 0), ok.length) * ok.length)] || ok[0];
  }
  CK.Banter = BANTER;

  const baseUpdate = CK.Overworld.prototype.update;
  CK.Overworld.prototype.update = function (dt, active) {
    baseUpdate.call(this, dt, active);
    const p = this.player;
    const busy = !active || CK.scriptRunning > 0 || CK.Trans.busy;
    // idle time for fidgets
    this.idleT = p.moving || busy ? 0 : (this.idleT || 0) + dt;
    // banter: after a while of walking around
    if (this.banter) {
      const b = this.banter;
      b.t += dt;
      const L = b.lines[b.i];
      if (b.t > Math.max(2.6, L[1].length * 0.055)) { b.i++; b.t = 0; if (b.i >= b.lines.length) this.banter = null; }
      return;
    }
    if (busy) return;
    this.walkT = (this.walkT || 0) + (p.moving ? dt : dt * 0.25);
    if (this.walkT > (this.banterGap || 16)) {
      this.walkT = 0;
      this.banterGap = 24 + Math.random() * 14;
      const pick = pickBanter(this);
      if (pick) { CK.setFlag('bt_' + pick.id); this.banter = { lines: pick.lines, i: 0, t: 0 }; CK.Audio.sfx('blip'); }
    }
  };
  const baseDraw = CK.Overworld.prototype.draw;
  CK.Overworld.prototype.draw = function (ctx) {
    CK._owDraw = true; CK._owIdle = this.idleT || 0;
    try { baseDraw.call(this, ctx); } finally { CK._owDraw = false; }
    if (this.banter && CK.Scenes.top() === this) {
      const b = this.banter, L = b.lines[b.i], pos = speakerPos(this, L[0]);
      if (pos) drawBubble(ctx, pos.x - this.camX, pos.y - this.camY - (L[0] === 'pip' ? 96 : 84), L[1], L[2], Math.min(1, b.t * 6), L[0]);
    }
  };
  const NAMECOL = { sam: '#5a7ad8', corry: '#b0703a', pip: '#e0608a', jules: '#3e9a6a' };
  function drawBubble(ctx, x, y, text, emote, pop, who) {
    const lines = D.wrap(ctx, text, 230, 14, 600);
    const w = Math.min(260, Math.max(...lines.map((l) => D.measure(ctx, l, 14, 600))) + 28 + (emote ? 22 : 0)), h = lines.length * 18 + 18;
    let bx = U.clamp(x - w / 2, 8, W - w - 8);
    const by = Math.max(8, y - h);
    ctx.save();
    ctx.globalAlpha = pop;
    ctx.translate(x, y); ctx.scale(0.8 + pop * 0.2, 0.8 + pop * 0.2); ctx.translate(-x, -y);
    D.rr(ctx, bx, by, w, h, 12); ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 2.5);
    const tx = U.clamp(x, bx + 14, bx + w - 14);
    D.poly(ctx, [tx - 7, by + h - 1, tx + 7, by + h - 1, tx - 2, by + h + 10], '#fffaf0');
    ctx.beginPath(); ctx.moveTo(tx - 7, by + h); ctx.lineTo(tx - 2, by + h + 10); ctx.lineTo(tx + 7, by + h); stroke(ctx, 2.5);
    D.rr(ctx, bx, by, 5, h, 2); ctx.fillStyle = NAMECOL[who] || '#999'; ctx.fill();
    let ty = by + 22;
    for (const l of lines) { D.text(ctx, l, bx + 14 + (emote ? 22 : 0), ty, { size: 14, weight: 600, color: '#3d2412' }); ty += 18; }
    if (emote) { ctx.save(); ctx.translate(bx + 22, by + h / 2); ctx.scale(0.7, 0.7); CK.drawEmote(ctx, emote, 0, 0, CK.time, false); ctx.restore(); }
    ctx.restore();
  }

  // ================================================================ PROFILES
  CK.Friends = {
    sam: {
      name: 'Sam', title: 'The Builder (reluctantly)', look: 'sam', o: { mood: 'happy' },
      wants: 'To want something. Anything. Properly.',
      fears: 'Being ordinary. Letting Grandma down.',
      quirk: 'Doodles tiny bridges on napkins, receipts, homework and their own hand. Says "okay okay okay" when overwhelmed.',
      likes: 'Lists. Rainy windows. Grandma\'s sketchbook. Problem sets, secretly.',
      secret: 'Kept every Kingdom drawing from age eight in a shoebox under the bed. Even the bad ones.',
      secretAt: () => f('epilogue'),
    },
    corry: {
      name: 'Sir Corrugate', title: 'Knight of the Fridge Box', look: 'corry', o: { mood: 'happy' },
      wants: 'To do one truly Great Deed.',
      fears: 'Ordinary rain. Being put back in a box.',
      quirk: 'Keeps a Ledger of Deeds and awards gold-star stickers for bravery. Only has nine left. Speaks exclusively in proclamations.',
      likes: 'Polishing his pot helmet. Front-row seats. Double knots.',
      secret: 'Spent twelve years in a box in Grandma\'s garage, waiting. He was never angry. He just wondered.',
      perk: 'Each talk: +4 max HP. Every two talks: +1 attack.',
    },
    pip: {
      name: 'Pip', title: 'A kite folded in five minutes', look: 'pip', o: { mood: 'happy' },
      wants: 'To fly above the clouds.',
      fears: 'Scissors. Being "just paper".',
      quirk: 'Counts everything: stars, steps, buckets, bats. Knows a fact for every occasion and talks at about three hundred words a minute.',
      likes: 'Wind. Facts. Being held on to.',
      secret: 'The tape on Pip\'s tail is Grandma\'s very first repair, from the day eight-year-old Sam tore it on a fence.',
      perk: 'Each talk: +4 max HP. Every two talks: +1 attack.',
    },
    jules: {
      name: 'Jules Marsh', title: 'Roommate, marine-biology major', look: 'jules', o: { mood: 'happy' },
      wants: 'To matter to someone. To count fish and make sure they\'re okay.',
      fears: 'The dark. Disappointing a whole family of doctors.',
      quirk: 'Names every animal on sight (that gull is Brenda). Hums sea shanties when nervous. Can get lost in a straight hallway.',
      likes: 'Octopuses, gulls, bad puns, the desk lamp being left on.',
      secret: 'Switched out of pre-med in October and hasn\'t told anyone at home.',
      perk: 'Each talk: +4 max HP. Every two talks: +1 attack.',
    },
    grandma: {
      name: 'Grandma Rosie', title: 'Rosalind Reyes, the first Builder', look: 'grandma', o: { mood: 'happy' },
      wants: 'For Sam to stop trying to be finished.',
      fears: 'Being treated as fragile.',
      quirk: 'Cheats at gin rummy, badly. Says "pish." Keeps a pencil behind each ear in case one gets lost.',
      likes: 'Arches, her garden, burnt sugar, a good argument.',
      secret: 'Knew Jules was Ike\'s grandkid from Sam\'s very first letter home.',
      perk: 'All four talks: Grandma\'s Blueprint after 1 failed test',
    },
  };
  const ORDER = ['sam', 'corry', 'pip', 'jules', 'grandma'];
  const bond = (id) => (CK.G.bonds && CK.G.bonds[id]) || 0;
  CK.bond = bond;

  // bonds make friends a little sturdier
  const baseStats = CK.stats;
  CK.stats = function (m) {
    const s = baseStats(m);
    const b = bond(m.id);
    if (b) { s.maxHp += b * 4; s.atk += Math.floor(b / 2); }
    return s;
  };
  const baseCanBlueprint = CK.Puzzle.PuzzleBase.prototype.canBlueprint;
  CK.Puzzle.PuzzleBase.prototype.canBlueprint = function () {
    if (bond('grandma') >= 4) return this.fails >= 1 && !!this.applySolution && this.state === 'build';
    return baseCanBlueprint.call(this);
  };

  // ================================================================ CAMPFIRE TALKS
  // Four talks per friend. Each opens up as the story goes on, and needs the one before.
  const julesHere = () => CK.coop || f('lanternmere_arrived');
  const TALKS = {
    corry: [
      { title: 'The Ledger of Deeds', when: () => true, lines: [
        ['corry', 'Builder. A moment, if you please. I must update the Ledger.', 'happy'],
        { narrate: 'Sir Corrugate produces a small notebook bound in packing tape. Every page is full of tiny, careful handwriting.' },
        ['corry', 'Item: the Builder carried a lost snail off the path. Small Deed. Item: Pip did not fly into a tree for one entire hour. Medium Deed.', 'happy'],
        ['sam', 'You write all of that down?', 'shock'],
        ['corry', 'A knight keeps a record. Otherwise, how would anyone know we were good?', 'happy'],
        ['sam', 'How many deeds have you done, Corry?'],
        ['corry', 'Four hundred and twelve Small Deeds. Thirty Medium. Great Deeds...', 'sad'],
        ['corry', 'Those are pending.', 'sad'],
        ['corry', 'Hold still.', 'happy'],
        { narrate: 'He peels a gold star sticker off the back of the notebook and presses it carefully onto your sleeve.' },
        ['corry', 'The Order of the Reasonably Brave. Do not lose it. I only have nine.', 'happy'],
      ] },
      { title: 'Brave but Nice', when: () => f('fall_arrived'), lines: [
        ['corry', 'Builder. Do you remember the day you made me?', 'sad'],
        ['sam', 'Kind of. I remember the box. I remember Grandma letting me use the good scissors.'],
        ['corry', 'You drew my face three times. The first one was too angry. The second was too surprised.', 'happy'],
        ['corry', 'The third one, you held up to the window and said: "There. Brave, but nice."', 'happy'],
        ['corry', 'I have tried very hard to be brave but nice ever since.', 'sad'],
        ['sam', "Corry... you don't have to try. You just are.", 'happy'],
        ['corry', 'That is an extremely Great thing to say. I am writing it in the Ledger.', 'happy'],
        { narrate: 'He writes something down, then covers the page with his paw so you cannot see.' },
      ] },
      { title: 'Twelve Years in a Box', when: () => f('epilogue'), lines: [
        ['corry', 'May I confess something unknightly?', 'sad'],
        ['corry', 'I am afraid of the rain. Not storms. Ordinary rain. A knight of cardboard goes soft in the rain, and soft knights cannot hold a sword.', 'sad'],
        ['corry', 'And another thing. When you grew up, the box went into the garage. For twelve years I sat in the dark, in a box, in a garage.', 'sad'],
        ['corry', 'I was not angry. I just wondered if you would come back.', 'sad'],
        ['sam', "...I'm sorry, Corry. I didn't forget you. I just forgot how to remember.", 'sad'],
        ['corry', 'Will you put me in a box again? When you are all the way grown?', 'sad'],
        ['sam', "No. You're coming to my graduation. Front row.", 'happy'],
        ['corry', 'The FRONT row.', 'shock'],
        ['corry', 'I shall need to begin polishing my helmet immediately.', 'happy'],
      ] },
      { title: 'Great Deed No. 1', when: () => f('gp_done'), lines: [
        ['corry', 'I have reviewed the Ledger. I must report: I have still done zero Great Deeds.', 'sad'],
        ['sam', "Corry, you've fought pirates. A storm. A giant crab in a bucket.", 'shock'],
        ['corry', 'Medium, all of them. Everybody helped.', 'sad'],
        ['corry', 'But tonight I understood something. Keeper Ike built a whole lighthouse. Grandma built a whole Kingdom. Neither of them built it alone.', 'happy'],
        ['corry', 'Perhaps a Great Deed is just a great many Small Deeds, done by friends, that nobody wrote down.', 'happy'],
        ['sam', 'So write it down.', 'happy'],
        { narrate: 'Sir Corrugate turns to the very last page of the Ledger and writes, in big letters: GREAT DEED NO. 1. EVERYTHING. TOGETHER.' },
        ['corry', 'There. I may now retire, a satisfied knight.', 'happy'],
        ['corry', 'I am joking. I shall never retire. Who would award the stickers?', 'happy'],
      ] },
    ],
    pip: [
      { title: 'Counting Stars', when: () => true, lines: [
        ['pip', 'Did you know you can see about two and a half thousand stars from here, and I have counted four hundred and six, and also a bat?', 'happy'],
        ['sam', 'Why do you count everything, Pip?'],
        ['pip', 'Because when I count, my string stops feeling wobbly.', 'sad'],
        ['pip', 'Paper is very wobbly, Sam. One big gust and whoosh. Counting is like holding on to something.', 'sad'],
        ['sam', 'What are you holding on to right now?'],
        ['pip', 'You, mostly. You are a very good string.', 'happy'],
        ['pip', 'Four hundred and seven. Oh, that one was a plane. Doesn\'t count. Four hundred and six.', 'happy'],
      ] },
      { title: 'Five Minutes', when: () => f('summer_arrived'), lines: [
        ['pip', 'Can I tell you my worst fear? Scissors.', 'sad'],
        ['sam', "That's fair."],
        ['pip', 'And my second worst fear is that I am small. Corry is a knight. Grandma is a Builder. I am a kite that took five minutes to fold.', 'sad'],
        ['sam', "Pip, you remember every fact you've ever heard. You've saved us in like six puzzles.", 'happy'],
        ['pip', 'Seven. But who\'s counting.', 'happy'],
        ['pip', 'Me. I am counting.', 'happy'],
      ] },
      { title: 'The Tape on My Tail', when: () => f('rb_done'), lines: [
        ['pip', 'See this bit of tape on my tail? You tore it on a fence when you were eight. You cried SO hard.', 'happy'],
        ['pip', 'Grandma sat on the porch with you and fixed me with one piece of tape, and she said: "Things that get fixed are stronger in the fixed spot."', 'happy'],
        ['sam', "I don't remember that.", 'shock'],
        ['pip', 'I do. I remember everything. It was a Tuesday. It was partly cloudy.', 'happy'],
        ['pip', 'That\'s why I am not scared of tearing anymore. Only of scissors. Scissors are different. Scissors are on purpose.', 'sad'],
      ] },
      { title: 'Above the Clouds', when: () => f('gp_done'), lines: [
        ['pip', 'I always wanted to fly above the clouds. Above everything. Where nobody has to hold my string.', 'sad'],
        ['pip', 'But tonight, up by the lighthouse, I flew really, REALLY high. And the best part was looking down and seeing all of you, holding on.', 'happy'],
        ['pip', 'I think a kite isn\'t a thing that flies. It\'s a thing that flies with someone.', 'happy'],
        ['sam', "That's the best fact you've ever told me.", 'happy'],
        ['pip', 'It is not a fact. It is a feeling. I am branching out.', 'happy'],
      ] },
    ],
    jules: [
      { title: 'The Major', when: julesHere, lines: [
        ['jules', "Can I tell you something I haven't told anyone? Not even my mom.", 'sad'],
        ['jules', "I'm not pre-med anymore. I switched to marine biology. In October.", 'sad'],
        ['sam', "Jules, that's great? Why is it a secret?", 'shock'],
        ['jules', 'Because my whole family is doctors. My mom. My aunt. My cousin, who is eleven and already wants to be a surgeon.', 'sad'],
        ['jules', 'And I just want to count fish. Count them, and name them, and make sure they\'re okay.', 'sad'],
        ['sam', "That's taking care of something. That's a doctor thing.", 'happy'],
        ['jules', '...Huh. I\'m stealing that for when I tell her.', 'happy'],
      ] },
      { title: 'The Desk Lamp', when: () => julesHere() && f('lm_done'), lines: [
        ['jules', 'Can I ask you something? First semester, you always left your desk lamp on. All night.', 'happy'],
        ['sam', 'I was studying.'],
        ['jules', 'You were asleep, Sam. You snore like a little leaf blower. You left it on for me, didn\'t you?', 'happy'],
        ['sam', "...You never said anything about the dark. You just looked at the lamp a lot.", 'sad'],
        ['jules', "You're a really good roommate. I hate it.", 'happy'],
      ] },
      { title: 'Names for Everything', when: () => julesHere() && f('gullpoint_arrived'), lines: [
        ['jules', "I've named all the Shellbacks. That's Lieutenant Pinchy. That's Teacup. That's Mrs. Beans.", 'happy'],
        ['sam', 'Why Mrs. Beans?'],
        ['jules', "Look at her. She's clearly a Mrs. Beans.", 'happy'],
        ['jules', 'Grandpa named every gull at Gull Point. He said if you name something, you start looking after it.', 'sad'],
        ['jules', 'I named you on the first day, you know. "Roommate Who Leaves The Lamp On." Very official.', 'happy'],
        ['sam', "That's not a name, that's a sentence.", 'happy'],
        ['jules', "It's a long name. You're a lot of person.", 'happy'],
      ] },
      { title: 'Keeper', when: () => julesHere() && f('gp_done'), lines: [
        ['jules', 'I called my mom. I told her. About the major.', 'sad'],
        ['sam', 'And?'],
        ['jules', 'She was quiet for a long time. Then she said Grandpa would have been thrilled. Then she cried. Then I cried.', 'sad'],
        ['jules', "Then she asked if fish get sick, and I said YES, and she said: \"So you're a doctor after all.\"", 'happy'],
        ['jules', 'Your turn. What do you actually want, Sam?', 'happy'],
        ['sam', '...I want to build things that let people stay. In their homes. By their ponds. Near their crabs.', 'happy'],
        ['jules', "That's the most you thing anyone has ever said.", 'happy'],
        { narrate: 'Sam takes out a pencil and draws a tiny bridge on the back of Jules\'s hand. Jules does not wash it off for three days.' },
      ] },
    ],
    grandma: [
      { title: 'Gin Rummy', when: () => f('rb_grandma'), lines: [
        ['grandma', "Sit, love. I'll deal. Gin rummy, a penny a point.", 'happy'],
        { narrate: 'Grandma wins four hands in a row.' },
        ['sam', "Grandma, there's a card in your sleeve.", 'shock'],
        ['grandma', 'Pish. That is a decorative card.', 'happy'],
        ['grandma', 'Your grandfather never caught me once in forty years. You have good eyes. Builder\'s eyes.', 'happy'],
        ['grandma', "Don't let anyone tell you that noticing small things is a small thing.", 'happy'],
      ] },
      { title: 'The First Bridge', when: () => f('rb_done'), lines: [
        ['grandma', 'You want to know the worst day of my life? I was eleven.', 'sad'],
        ['grandma', 'My footbridge washed away. Three weeks of work. I stood in that creek in my good shoes and howled.', 'sad'],
        ['sam', 'What did you do?'],
        ['grandma', 'Folded a bird out of a gum wrapper and told it all my ideas, so they\'d be safe. Then I built the bridge again. Worse. Then again. Better.', 'happy'],
        ['grandma', 'Everyone wants to know what to BE, Sam. Nobody wants to hear that the answer is: try, wash out, try again.', 'happy'],
      ] },
      { title: 'Who Hung the Moon', when: () => f('rb_done') && f('lm_done'), lines: [
        ['sam', 'Grandma. The moon. In Lanternmere.', 'shock'],
        ['grandma', 'Oh, you found that, did you.', 'happy'],
        ['grandma', 'The summer I was twelve, my father moved away, and I didn\'t sleep for a month. So I built the biggest lantern I could and hung it where I could see it from anywhere.', 'sad'],
        ['grandma', '"For whoever is lost." I meant me, mostly. Turned out a lot of people needed it.', 'sad'],
        ['grandma', "That's the trick of building things, love. You make them for yourself, and then they belong to everyone.", 'happy'],
      ] },
      { title: 'Ike', when: () => f('rb_done') && f('gp_done'), lines: [
        ['grandma', 'You went to Gull Point.', 'sad'],
        ['sam', 'Jules lit the lamp.', 'happy'],
        ['grandma', 'Isaac Marsh. Best friend I ever had. He could whistle with two fingers and he could not, for the life of him, spell "lighthouse."', 'happy'],
        ['grandma', 'We wrote letters for fifty years. He told me all about his grandkid. Smart as anything, scared of the dark, named every pigeon in the city.', 'happy'],
        ['grandma', 'In September you wrote home that your new roommate was called Jules Marsh. I had to sit down on the kitchen floor.', 'shock'],
        ['sam', 'You KNEW? This whole time?', 'shock'],
        ['grandma', 'I knew the box would know what to do.', 'happy'],
        ['grandma', "I miss him, love. That's all. Missing someone is just love with nowhere to go. So give it somewhere to go.", 'sad'],
        ['grandma', 'Now. Go and tell Jules their grandfather cheated at checkers.', 'happy'],
      ] },
    ],
  };
  CK.Talks = TALKS;
  const nextTalk = (id) => { const t = TALKS[id]; const i = bond(id); return i < t.length ? t[i] : null; };
  const talkReady = (id) => { const t = nextTalk(id); return !!t && t.when(); };
  CK.talkReady = talkReady;
  function friendsAt(e) {
    const list = [];
    const owCh = CK.G.chapter;
    if (owCh !== 'riverbend' && owCh !== 'campus') { list.push('corry', 'pip'); if (julesHere()) list.push('jules'); }
    else if (julesHere() && CK.coop) list.push('jules');
    if (owCh === 'riverbend' && f('rb_grandma')) list.push('grandma');
    return list;
  }

  // a cozy scene to sit in while you talk: night sky, the fire, two logs
  class CampfireScene {
    constructor(who) { this.who = who; this.t = 0; this.alwaysUpdate = true; this.parts = new CK.Particles(); }
    update(dt) {
      this.t += dt; this.parts.update(dt);
      if (Math.random() < dt * 14) this.parts.emit({ x: W / 2 + U.rand(-14, 14), y: 330, vx: U.rand(-20, 20), vy: U.rand(-90, -50), life: 1.4, size: U.rand(2, 4), shape: 'spark', color: U.pick(['#ffd25a', '#ff9a3a', '#fff3b0']) });
    }
    draw(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#141a3a'); g.addColorStop(0.6, '#2a2348'); g.addColorStop(1, '#3a2a2a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 60; i++) { const tw = 0.5 + Math.sin(this.t * 2 + i) * 0.5; D.circle(ctx, U.hash(i, 41) * W, U.hash(i, 42) * 220, 0.8 + U.hash(i, 43) * 1.5, `rgba(255,248,220,${0.3 + tw * 0.6})`); }
      // tree silhouettes as cardboard flats
      for (let i = 0; i < 9; i++) { const tx = i * 120 + 20, th = 120 + U.hash(i, 44) * 60; D.poly(ctx, [tx - 40, 300, tx, 300 - th, tx + 40, 300], '#1c2a2a', C.ink, 2); }
      ctx.fillStyle = '#3a3030'; ctx.fillRect(0, 290, W, H - 290);
      // firelight
      const fl = 1 + Math.sin(this.t * 11) * 0.04 + Math.sin(this.t * 7) * 0.03;
      const glow = ctx.createRadialGradient(W / 2, 330, 10, W / 2, 330, 320 * fl);
      glow.addColorStop(0, 'rgba(255,190,90,0.55)'); glow.addColorStop(1, 'rgba(255,190,90,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
      // logs to sit on
      for (const lx of [W / 2 - 170, W / 2 + 170]) D.box3(ctx, lx - 60, 340, 120, 22, 14, { r: 8, lw: 2.5, fill: '#7a5034', flute: false });
      // the (very carefully pretend) cardboard fire
      for (let i = -2; i <= 2; i++) D.box3(ctx, W / 2 - 34 + (i + 2) * 14, 344 - Math.abs(i) * 2, 12, 10, 6, { r: 2, lw: 1.5, fill: '#8a6a4a', flute: false });
      const flame = (col, s, ph) => { const fx = W / 2, fy = 340; ctx.beginPath(); ctx.moveTo(fx - 26 * s, fy); ctx.quadraticCurveTo(fx - 30 * s, fy - 40 * s, fx + Math.sin(this.t * 6 + ph) * 6, fy - 78 * s); ctx.quadraticCurveTo(fx + 30 * s, fy - 40 * s, fx + 26 * s, fy); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); stroke(ctx, 2); };
      flame('#ff8a3a', fl, 0); flame('#ffd25a', 0.65 * fl, 1); flame('#fff3b0', 0.35 * fl, 2);
      this.parts.draw(ctx);
      // the two of you
      const friend = this.who === 'grandma' ? 'grandma' : this.who;
      D.char(ctx, 'sam', W / 2 - 170, 352, { s: 1.5, dir: 'right', mood: 'happy' });
      D.char(ctx, friend, W / 2 + 170, 352, { s: friend === 'pip' ? 1.6 : 1.5, dir: 'left', mood: 'happy' });
      D.text(ctx, this.title || '', W / 2, 48, { size: 22, weight: 700, align: 'center', color: '#ffe9b8', outline: C.ink, ow: 4 });
    }
  }
  CK.CampfireScene = CampfireScene;

  function talkScript(id) {
    const T = nextTalk(id);
    const n = bond(id) + 1;
    const hearts = '♥'.repeat(n) + '♡'.repeat(TALKS[id].length - n);
    return [
      { fn: () => { const sc = new CampfireScene(id); sc.title = `Campfire Talk: ${T.title}`; CK.Scenes.push((CK._camp = sc)); } },
      { wait: 0.8 },
      ...T.lines,
      { wait: 0.6 },
      { fn: () => { CK.G.bonds = CK.G.bonds || {}; CK.G.bonds[id] = n; CK.setFlag(`ft_${id}_${n}`); CK.healParty(); CK.toast(`${CK.Friends[id].name}  ${hearts}`, '#ff9ec7'); CK.Audio.sfx('levelup'); } },
      { wait: 1.2 },
      { fn: () => { CK.Scenes.remove(CK._camp); CK._camp = null; } },
      { save: true },
    ];
  }
  CK.talkScript = talkScript;

  const baseInteract = CK.Overworld.prototype.interact;
  CK.Overworld.prototype.interact = function (e, who) {
    if (!e || e.type !== 'campfire') return baseInteract.call(this, e, who);
    const G = CK.G;
    G.wet = 0;
    CK.healParty();
    CK.saveGame();
    CK.Audio.sfx('heal');
    this.fx.burst(10, () => ({ x: e.px + U.rand(-10, 10), y: e.py - 30, vx: U.rand(-30, 30), vy: U.rand(-90, -40), life: 1.2, size: 3, shape: 'spark', color: '#ffd25a' }));
    const ready = friendsAt(e).filter(talkReady);
    const intro = { narrate: 'You warm your hands by the cardboard campfire (it is very carefully pretend fire). Everyone dries off and rests. Game saved.' };
    if (!ready.length) { CK.runScript([intro]); return; }
    const options = ready.map((id) => ({ label: `Sit with ${CK.Friends[id].name}: "${nextTalk(id).title}"`, then: talkScript(id) }));
    options.push({ label: 'Just rest', then: [] });
    CK.runScript([intro, { choice: { text: 'Someone looks like they want to talk.', options } }]);
  };
  // campfires in the places that didn't have one
  const addFire = (chId, x, y) => { const c = CK.Chapters[chId]; if (c && !c.objects.some((o) => o.type === 'campfire')) c.objects.push({ type: 'campfire', x, y }); };
  addFire('lanternmere', 6, 15);
  addFire('campus', 16, 17);

  // a little "!" floats over campfires when somebody wants to talk
  const baseDrawEnt = CK.Overworld.prototype.drawEnt;
  CK.Overworld.prototype.drawEnt = function (ctx, e) {
    baseDrawEnt.call(this, ctx, e);
    if (e.type === 'campfire' && friendsAt(e).some(talkReady)) {
      const x = e.px - this.camX, y = e.py - this.camY - 70 + Math.sin(this.t * 4) * 4;
      ctx.save(); ctx.translate(x, y); ctx.scale(0.85, 0.85); CK.drawEmote(ctx, 'heart', 0, 0, this.t); ctx.restore();
    }
  };

  // ================================================================ FRIENDS PAGE
  class FriendsScreen {
    constructor() { this.transparent = true; this.sel = 0; this.t = 0; }
    list() { return ORDER.filter((id) => id === 'sam' || id === 'corry' || id === 'pip' || (id === 'jules' && julesHere()) || (id === 'grandma' && f('rb_grandma'))); }
    update(dt) {
      this.t += dt;
      const L = this.list();
      if (Input.hit('up')) { this.sel = (this.sel + L.length - 1) % L.length; CK.Audio.sfx('blip'); }
      if (Input.hit('down')) { this.sel = (this.sel + 1) % L.length; CK.Audio.sfx('blip'); }
      L.forEach((id, i) => {
        const r = [70, 96 + i * 74, 220, 66];
        if (Input.mouse.moved && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) this.sel = i;
      });
      if (Input.hit('back') || Input.hit('ok') || (Input.mouse.pressed && !D.inRect(Input.mouse.x, Input.mouse.y, 70, 96, 220, 74 * L.length))) {
        CK.Audio.sfx('back');
        CK.Scenes.remove(this);
      }
    }
    draw(ctx) {
      ctx.fillStyle = 'rgba(30,15,5,0.6)'; ctx.fillRect(0, 0, W, H);
      D.panel(ctx, 50, 24, W - 100, H - 48, { fill: '#fffaf0' });
      D.text(ctx, 'Friends', W / 2, 66, { size: 28, weight: 700, align: 'center' });
      const L = this.list();
      L.forEach((id, i) => {
        const P = CK.Friends[id], y = 96 + i * 74, sel = i === this.sel;
        D.rr(ctx, 70, y, 220, 66, 10); ctx.fillStyle = sel ? '#fff0b8' : '#fff4dc'; ctx.fill(); stroke(ctx, sel ? 2.5 : 1.5);
        ctx.save(); D.rr(ctx, 76, y + 6, 54, 54, 8); ctx.clip(); ctx.fillStyle = '#e8dcc8'; ctx.fillRect(76, y + 6, 54, 54);
        D.char(ctx, P.look, P.look === 'pip' ? 100 : 103, y + (P.look === 'pip' ? 52 : 84), Object.assign({ s: P.look === 'pip' ? 1.2 : 1.0, noShadow: true }, P.o)); ctx.restore();
        D.text(ctx, P.name, 140, y + 28, { size: 15, weight: 700 });
        if (id !== 'sam') {
          const b = bond(id), n = TALKS[id].length;
          for (let k = 0; k < n; k++) { ctx.save(); ctx.translate(148 + k * 20, y + 46); heart(ctx, 0, 0, 6, k < b ? '#ff7aa0' : '#e8dcc8'); ctx.restore(); }
          if (talkReady(id)) { ctx.save(); ctx.translate(274, y + 16); ctx.scale(0.55, 0.55); CK.drawEmote(ctx, '!', 0, 0, this.t); ctx.restore(); }
        } else D.text(ctx, 'you', 140, y + 50, { size: 12, color: '#7a5434' });
      });
      // detail card
      const id = L[this.sel] || 'sam', P = CK.Friends[id];
      const x0 = 320, y0 = 92, w = W - 100 - 290;
      ctx.save(); D.rr(ctx, x0, y0, 150, 170, 12); ctx.clip();
      const bg = ctx.createRadialGradient(x0 + 60, y0 + 50, 10, x0 + 75, y0 + 90, 140); bg.addColorStop(0, '#fff3dc'); bg.addColorStop(1, '#e8c89a');
      ctx.fillStyle = bg; ctx.fillRect(x0, y0, 150, 170);
      D.char(ctx, P.look, P.look === 'pip' ? x0 + 70 : x0 + 75, y0 + (P.look === 'pip' ? 130 : 160), Object.assign({ s: P.look === 'pip' ? 2.6 : 2.0 }, P.o));
      ctx.restore(); D.rr(ctx, x0, y0, 150, 170, 12); stroke(ctx, 2.5);
      D.text(ctx, P.name, x0 + 168, y0 + 26, { size: 24, weight: 700 });
      D.text(ctx, P.title, x0 + 168, y0 + 50, { size: 14, weight: 600, color: '#7a5434' });
      let y = y0 + 80;
      const row = (label, text, col) => {
        D.text(ctx, label, x0 + 168, y, { size: 13, weight: 700, color: col || '#c2410c' });
        const ls = D.wrap(ctx, text, w - 250, 13, 500);
        for (const l of ls) { D.text(ctx, l, x0 + 240, y, { size: 13, weight: 500 }); y += 18; }
        y += 6;
      };
      row('Wants', P.wants);
      row('Fears', P.fears);
      y = Math.max(y, y0 + 198);
      const full = (label, text, col) => {
        D.text(ctx, label, x0, y, { size: 13, weight: 700, color: col || '#c2410c' });
        const ls = D.wrap(ctx, text, w - 90, 13, 500);
        for (const l of ls) { D.text(ctx, l, x0 + 72, y, { size: 13, weight: 500 }); y += 18; }
        y += 8;
      };
      full('Quirk', P.quirk);
      full('Likes', P.likes);
      const unlocked = id === 'sam' ? P.secretAt() : bond(id) >= 3;
      full('Secret', unlocked ? P.secret : id === 'sam' ? '(keep playing)' : '(share 3 campfire talks to find out)', '#7a4ab0');
      if (id !== 'sam') {
        const T = nextTalk(id);
        const status = !T ? 'All campfire talks shared. ♥' : talkReady(id) ? `New talk ready at a campfire: "${T.title}"` : 'Next talk opens up later in the story.';
        full('Talks', status, '#3e7a5a');
        if (P.perk) full('Bond', P.perk, '#3e7a5a');
      }
      D.text(ctx, 'Up/Down to browse · Z or click to close', W / 2, H - 36, { size: 13, align: 'center', color: '#7a5434' });
    }
  }
  CK.FriendsScreen = FriendsScreen;
})();
