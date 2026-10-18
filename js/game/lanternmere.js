// Cardboard Kingdom - Chapter 8: The Lantern Festival.
// Back in the Kingdom for Lanternmere's first Lantern Festival. Every lantern is far too bright,
// the moon has vanished, and the Moth-kin are lost in the glare. Jules finally talks about the dark,
// a heron learns to dim his lanterns, and the moon turns out to be something Grandma made.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input, Data = CK.Data;
  const W = CK.W, H = CK.H, TS = 48;
  const f = (k) => CK.flag(k);
  const S = CK.Story.scripts;
  const lit = () => f('lm_lights');

  // ================================================================ DATA
  Object.assign(Data.speakers, {
    lux: { name: 'Mr. Lux', look: 'heron', ps: 1.7, py: 66, bg: '#fff1cc' },
    moth: { name: 'Moth-kin', look: 'moth', ps: 2.4, py: -14, bg: '#efe6f6' },
    dusk: { name: 'Elder Dusk', look: 'moth', ps: 2.4, py: -14, bg: '#e2dcf2', o: { mood: 'sad', seed: 7 } },
    otter: { name: 'Ferrywoman Wren', look: 'critter', ps: 2.2, py: 0, bg: '#e6f0f6', o: { species: 'bear', color: '#8a6a4a', scarf: '#5aa9e6' } },
  });
  Data.enemies.moth = {
    name: 'Moth-kin', hp: 34, atk: 9, def: 0, xp: 8, scraps: 5, draw: 'moth',
    moves: [{ name: 'Dizzy Dive', power: 1, w: 3 }, { name: 'Wing Dust', power: 0.7, all: true, w: 1 }],
  };
  Data.enemies.lux = {
    name: 'Mr. Lux', hp: 300, atk: 12, def: 2, xp: 70, scraps: 50, draw: 'heron', boss: true,
    moves: [{ name: 'Brilliant 3000', power: 0.8, all: true, w: 2, drain: true }, { name: 'Pole Poke', power: 1.4, w: 2 }, { name: 'Moths, Please Stop', summon: 'moth', w: 1 }],
  };
  Data.battles.lm_moths = { enemies: ['moth', 'moth', 'moth'], season: 'fall' };
  Data.battles.lm_lux = { enemies: ['moth', 'lux', 'moth'], season: 'fall', boss: true, music: 'boss' };

  // ================================================================ MAP
  const knock = (lines) => lines;
  CK.Chapters.lanternmere = {
    id: 'lanternmere', name: 'Lanternmere', w: 40, h: 24, season: 'fall', music: 'fall',
    start: [2, 12], noFlood: true,
    weather: () => null,
    // before the fix the night sky is a washed-out orange glare; after it, deep blue and starry
    nightTint: () => (lit() ? 'rgba(12,14,56,0.74)' : 'rgba(70,40,40,0.46)'),
    build(m) {
      m.scatter(',', 0.1, 81);
      m.ellipse(31, 19.5, 8.5, 4.6, '~');
      m.path([[1, 12], [30, 12]], '=');
      m.path([[8, 12], [8, 6]], '=');
      m.path([[20, 12], [20, 9]], '=');
      m.path([[30, 12], [30, 14]], '=');
      m.path([[15, 12], [15, 16], [24, 16]], '=');
      m.rect(30, 15, 2, 4, 'd');
      m.scatter('T', 0.05, 82);
      m.border('T');
    },
    post(m) {
      for (const o of this.objects) if (o.type === 'building') m.rect(o.x - Math.floor(o.bw / 2), o.y - o.bh + 1, o.bw, o.bh + 1, '.');
      for (const o of this.objects) if (o.type === 'house') m.rect(o.x, o.y, 2, 2, '.');
      for (const o of this.objects) if (o.type !== 'building' && o.type !== 'trigger' && o.type !== 'house' && m.get(o.x, o.y) !== '=' && !'~bBd'.includes(m.get(o.x, o.y))) m.set(o.x, o.y, '.');
      m.rect(2, 2, 10, 5, '.');
      m.rect(23, 8, 9, 4, '.');
      m.rect(1, 11, 3, 3, '.');
      m.rect(1, 12, 3, 1, '=');
    },
    objects: [
      { type: 'bench', x: 3, y: 14 },
      { type: 'building', id: 'luxshop', x: 20, y: 8, bw: 6, bh: 4, label: 'LUX LANTERNS', color: '#e9d8a6', roof: '#5a4a6a', door: 'Look', style: 'luxshop',
        script: () => [{ narrate: lit() ? 'The window display now says: LUX DARK-SKY LANTERNS. Light where you need it. Stars where you want them.' : 'The window display says: BRILLIANT 3000. BRIGHTER IS BETTER. VISIBLE FROM SPACE.' }] },
      { type: 'house', id: 'lm_a', x: 11, y: 8, roof: '#5aa9e6', knock: 'lm_knock_a' },
      { type: 'house', id: 'lm_b', x: 12, y: 14, roof: '#ff8fb1', knock: 'lm_knock_b' },
      { type: 'house', id: 'lm_c', x: 24, y: 17, roof: '#6cc56c', knock: 'lm_knock_c' },
      { type: 'deco', kind: 'stage', x: 27, y: 9 },
      { type: 'deco', kind: 'lanternstring', x: 24, y: 10 },
      { type: 'deco', kind: 'lanternstring', x: 30, y: 10, o: { flip: true } },
      // the lamps: huge glaring globes until the festival lights are redone
      ...[[10, 11], [17, 11], [14, 13], [22, 13], [27, 13], [6, 11], [25, 11], [33, 13]].map(([x, y], i) => ({
        type: 'deco', kind: 'luxlamp', x, y, seed: i,
        get light() { return lit() ? [80, 36] : [200, 64]; },
      })),
      { type: 'deco', kind: 'meadow', x: 4, y: 4 },
      { type: 'deco', kind: 'meadow', x: 9, y: 3, o: { small: true } },
      { type: 'stand', x: 17, y: 14, color: '#c94f2c', drink: 'cocoa', who: 'otter', line: "Hot cocoa for the festival! Marshmallows shaped like moons. Well. Like what moons USED to look like.", vendor: { species: 'bear', color: '#8a6a4a', scarf: '#5aa9e6' } },
      { type: 'chest', id: 'lm_chest', x: 36, y: 6, script: [{ narrate: 'An old fishing crate full of lantern hoods nobody bought. Someone has written "TRY THESE?" on the lid.' }, { scraps: 20 }] },
      // people
      { type: 'npc', id: 'jules_lm', x: 4, y: 13, look: 'jules', talk: 'lm_jules', cond: () => !CK.coop && !f('lm_lux') },
      { type: 'npc', id: 'jules_sq', x: 25, y: 13, look: 'jules', talk: 'lm_jules', cond: () => !CK.coop && f('lm_lux') },
      { type: 'npc', id: 'queen_lm', x: 29, y: 13, look: 'queen', o: { s: 0.9 }, talk: () => (!f('lm_queen') ? 'lm_queen' : lit() && !f('lm_done') ? 'lm_finale' : 'lm_queen_again') },
      { type: 'npc', id: 'dusk', x: 5, y: 3, look: 'moth', o: { s: 0.75, mood: 'sad', seed: 7 }, talk: 'lm_dusk', cond: () => f('lm_moths') },
      { type: 'npc', id: 'moth_a', x: 7, y: 5, look: 'moth', o: { s: 0.55, mood: 'happy', seed: 2 }, talk: 'lm_moth_talk', cond: () => f('lm_moths') },
      { type: 'npc', id: 'moth_b', x: 3, y: 5, look: 'moth', o: { s: 0.5, mood: 'happy', seed: 5 }, talk: 'lm_moth_talk', cond: () => f('lm_done') },
      { type: 'enemy', id: 'lm_moth1', x: 8, y: 8, look: 'moth', battle: 'lm_moths', patrol: [[8, 8], [9, 9], [7, 9], [8, 10]], cond: () => f('lm_queen') && !f('lm_moths') },
      { type: 'npc', id: 'lux', x: 21, y: 10, look: 'heron', o: { s: 0.8 }, talk: () => (f('lm_lux') ? 'lm_lux_after' : f('lm_moths') ? 'lm_lux' : 'lm_lux_early') },
      { type: 'site', id: 'lm_site', x: 23, y: 12, script: 'lm_site', cond: () => f('lm_lux') && !lit() },
      { type: 'npc', id: 'mayor_lm', x: 14, y: 10, look: 'mayor', o: { s: 0.9 }, talk: 'lm_mayor' },
      { type: 'npc', id: 'skipper_lm', x: 32, y: 14, look: 'skipper', talk: 'lm_skipper' },
    ],
    objective(G) {
      if (!f('lm_queen')) return 'Find Queen Corrina at the dock (east)';
      if (!f('lm_moths')) return 'Find out why the Moth-kin are swarming (path north to Moonmeadow)';
      if (!f('lm_lux')) return 'Ask Mr. Lux to dim his lanterns (Lux Lanterns shop)';
      if (!lit()) return 'Plan the festival lights (blueprint in the square)';
      if (!f('lm_done')) return 'The sky is clearing! Meet the Queen at the dock for the lantern float';
      return 'Free roam! Use the workbench by the gate to travel anywhere.';
    },
  };

  // the glowing box on campus brings the invitation once Grandma's bridge is done
  const portalScript = S.ep_portal;
  S.ep_portal = [
    { if: () => f('rb_done') && !f('lanternmere_arrived'), then: [
      { narrate: "Grandma's box is glowing again. Tucked into the flap is a tiny paper boat, and inside the boat, an invitation." },
      { narrate: '"Her Majesty Queen Corrina invites the Builder, and friends, to the first Lantern Festival of Lanternmere. Tonight. Bring someone to remember."' },
      { coop: [['jules', "Bring someone to remember. Okay. Yeah. Let's go.", 'sad']] },
      { solo: [['jules', "Hey! Wait! I'm coming this time. I have been holding the door of that box for a YEAR, Sam.", 'happy']] },
      { chapter: 'lanternmere', label: 'Lanternmere, an autumn night...' },
    ] },
  ].concat(portalScript);
  const campus = CK.Chapters.campus;
  const campusObjective = campus.objective;
  campus.objective = function (G) {
    if (f('rb_done') && !f('lanternmere_arrived')) return 'The box by the recycling center is glowing. There is something tucked in the flap';
    return campusObjective.call(this, G);
  };
  const baseTravel = CK.travelChoice;
  CK.travelChoice = function (text) {
    const c = baseTravel(text);
    if (f('lanternmere_arrived') && CK.G.chapter !== 'lanternmere') c.choice.options.splice(c.choice.options.length - 1, 0, { label: 'Lanternmere (autumn night)', then: [{ chapter: 'lanternmere', label: 'Lanternmere' }] });
    return c;
  };

  // ================================================================ SCRIPTS
  S.lanternmere_intro = [
    { fn: () => { CK.setFlag('lanternmere_night'); if (CK.OW) CK.OW.refresh(); } },
    { card: { title: 'Chapter 8', sub: 'The Lantern Festival' } },
    { narrate: 'Lanternmere is a little lake village in the Kingdom\'s autumn woods. Tonight every roof, fence and tree is hung with lanterns. Huge, round, blinding ones.' },
    { narrate: 'The sky above is a flat orange glow. Not one star.' },
    ['corry', 'Builder! And the Builder\'s friend! Welcome to the festival! Please do not look directly at the lanterns.', 'happy'],
    ['pip', 'They were not this bright last year. Last year there was a MOON.', 'sad'],
    ['jules', "It's so bright. Is it supposed to be this bright? It feels like being in a parking lot.", 'shock'],
    { journal: 'Came back through the box with Jules for the first Lantern Festival in Lanternmere. Everything is too bright, and there is no moon.' },
  ];
  S.lm_jules = [() => [!f('lm_moths')
    ? ['jules', "Somebody to remember, the invitation said. I know who I'd pick. I'm just... not great at talking about it.", 'sad']
    : !f('lm_lux') ? ['jules', "Lost in the dark, I get. Lost in too MUCH light? I didn't know that was a thing.", 'shock']
      : ['jules', 'Hoods on top, light pointing down. Like a lighthouse. Grandpa would have loved this.', 'happy']]];

  S.lm_queen = [
    ['queen', 'Builder! You came! And you brought a friend. Welcome, welcome, to Lanternmere\'s very first Lantern Festival.', 'happy'],
    ['queen', 'At midnight, each guest sets a lantern on the lake for someone they miss, and the Moth-kin carry the light up toward the moon.', 'happy'],
    ['queen', "Only... nobody has seen the moon since Mr. Lux opened his lantern shop and sold everyone a Brilliant 3000. And the Moth-kin have gone wild. They swarm every lantern and knock them over.", 'sad'],
    ['jules', 'Someone they miss...', 'sad'],
    ['queen', "The moths live in Moonmeadow, north of the village. Could you find out what's wrong? Gently. They're very soft.", 'sad'],
    { flag: 'lm_queen' },
    { fn: () => { if (CK.OW) CK.OW.buildEntities(); } },
  ];
  S.lm_queen_again = [() => [f('lm_done')
    ? ['queen', 'Look at all those stars. I had forgotten there were so many. Thank you, Builder. Thank you, Jules.', 'happy']
    : ['queen', 'Moonmeadow is to the north. And Mr. Lux\'s shop is the one you can see with your eyes closed.', 'sad']]];

  S.after_lm_moth1 = [
    { narrate: 'The moths flop down into the grass, dizzy. One of them is crying very small tears.' },
    ['moth', 'Too bright. Too bright everywhere. We fly by the moon. No moon, so we fly to the nearest bright thing. And round. And round. And round.', 'sad'],
    ['moth', 'We are not attacking. We are LOST.', 'sad'],
    ['pip', 'Light pollution! Real moths do this too. So do baby sea turtles, and birds flying south. Too much light at night and they cannot find their way.', 'sad'],
    ['jules', "Lost in the dark is bad. Lost in the light... I didn't know that was a thing.", 'shock'],
    ['corry', 'Then it is not the moths we must stop. It is the glare.', 'happy'],
    { flag: 'lm_moths' },
    { fn: () => { if (CK.OW) CK.OW.buildEntities(); } },
    { journal: 'The Moth-kin are not attacking. They are lost: the lanterns are so bright they cannot find the moon.' },
    { save: true },
  ];
  S.lm_dusk = [() => [f('lm_done')
    ? ['dusk', 'We knew she would come back for us, the lady who hung the moon. And she sent you.', 'happy']
    : ['dusk', 'The moon is a lantern too, you know. A very old one. Someone hung it there, long ago, for anyone who was lost.', 'sad']]];
  S.lm_moth_talk = [() => [lit() ? ['moth', 'The moon! The moon! We can see it! *happy fluttering*', 'happy'] : ['moth', 'Sorry for the pouncing. We get dizzy.', 'sad']]];

  S.lm_lux_early = [['lux', 'Welcome to Lux Lanterns! Brighter is better! Ask me about the Brilliant 3000. You can see it from SPACE.', 'happy']];
  S.lm_lux = [
    ['lux', 'Welcome to Lux Lanterns! Brighter is better! Have you seen the Brilliant 3000? You can see it from SPACE.', 'happy'],
    ['sam', "That's sort of the problem. The moths can't find the moon. Could you dim them? Just for tonight?", 'sad'],
    ['lux', 'Dim them? DIM them? Absolutely not. Nobody in Lanternmere will ever have to stand in the dark again. Not on my watch.', 'angry'],
    { narrate: 'A cloud of dizzy moths swoops down on his lantern pole.' },
    ['lux', 'Oh no, not again. Shoo! Shoo!', 'shock'],
    { battle: 'lm_lux' },
    { narrate: 'Mr. Lux sits down on his shop step and sets his lantern pole across his knees.' },
    ['lux', "I'm sorry. When I was a chick, I got lost on the marsh one night. No moon, no lights. All night long. I promised myself nobody would ever be that scared again.", 'sad'],
    ['jules', "I get it. I'm scared of the dark too. I have been since I was little.", 'sad'],
    ['sam', 'Jules? You never said.', 'shock'],
    ['jules', 'My grandpa kept the lighthouse at Gull Point. When he got sick I sat up with him at night, and the dark felt so big. After he died I started sleeping with the lights on. I\'m twenty. It\'s embarrassing.', 'sad'],
    ['sam', "It's not.", 'sad'],
    ['jules', "He used to say: a good light shows you the way. It doesn't blind you. A lighthouse doesn't light up the whole sky. It points.", 'happy'],
    ['jules', 'So what if we point the lanterns? Hoods on top. The light goes down onto the path, not up into the sky.', 'happy'],
    ['lux', 'Shielded lanterns. The light goes where you need it, and the moths could still see the moon...', 'shock'],
    ['lux', 'I have hoods! A whole crate! Nobody ever bought them. They were not BRILLIANT enough.', 'happy'],
    { flag: 'lm_lux' },
    { fn: () => { if (CK.OW) CK.OW.buildEntities(); } },
    { journal: 'Jules told us about Grandpa and the lighthouse at Gull Point. A good light shows you the way; it does not blind you. Mr. Lux has a crate of lantern hoods.' },
    { save: true },
  ];
  S.lm_lux_after = [() => [lit()
    ? ['lux', 'LUX DARK-SKY LANTERNS. New sign. Light where you need it, stars where you want them. I am taking pre-orders.', 'happy']
    : ['lux', 'The blueprint table is set up in the square. Hoods, posts, and, ahem, a few Brilliant 3000s, in case anyone still wants one.', 'sad']]];

  S.lm_site = [
    ['jules', 'Every bit of the path needs light so nobody trips. But no light can spill into Moonmeadow, and none can go up into the sky.', 'happy'],
    { puzzle: 'festival_lights' },
    { narrate: 'One by one, the Brilliant 3000s come down. Hoods go on. Little path posts glow along the walk, each one pointing its light at the ground.' },
    { flag: 'lm_lights' },
    { fn: () => { if (CK.OW) CK.OW.refresh(); } },
    { narrate: 'The orange haze thins, and thins, and then it is simply night. A deep, soft, blue night. And above the lake: stars.' },
    ['jules', 'Oh. Oh, wow. I forgot the dark could look like this.', 'happy'],
    { journal: 'Redid the festival lights with Jules: hooded lanterns and path posts. The stars came back.' },
    { save: true },
  ];

  S.lm_finale = [
    { fn: () => { CK.Scenes.push((CK.LM_SKY = new FestivalSky())); } },
    { wait: 1.5 },
    { narrate: 'The whole village gathers on the dock. Over the far hills, something round and pale is rising.' },
    { fn: () => { CK.LM_SKY.moonUp = true; } },
    { wait: 2.5 },
    { narrate: "It isn't a moon. It's a paper lantern, enormous and round, with tape at the seams. Around its rim, in faded pencil, are words:" },
    { narrate: '"FOR WHOEVER IS LOST: LOOK UP. — R.R., 1971"' },
    ['sam', 'Grandma hung the moon.', 'shock'],
    ['pip', 'Of course she did.', 'happy'],
    ['dusk', 'Now we can find our way.', 'happy'],
    { fn: () => { CK.LM_SKY.mothsGo = true; } },
    { wait: 2 },
    ['queen', 'Lanterns, everyone!', 'happy'],
    { fn: () => { CK.LM_SKY.launch(); } },
    { wait: 1.5 },
    ['jules', "This one's for Grandpa. He would have liked these. They point.", 'happy'],
    ['sam', "This one's for me, last year. The one who didn't know what to do. I did okay.", 'happy'],
    ['lux', 'And this one is for a little heron on a marsh. You can see the moon from here, kid.', 'happy'],
    ['corry', 'And this one is for everyone who ever got lost and got found again. Which is everyone.', 'happy'],
    { wait: 1.5 },
    ['jules', 'Sam? Can I add one to the journal? Rule Six: light the path, not the sky.', 'happy'],
    ['sam', "That's a perfect rule.", 'happy'],
    { wait: 1 },
    { fn: () => { CK.Scenes.remove(CK.LM_SKY); CK.LM_SKY = null; } },
    { scraps: 50 },
    { flag: 'lm_done' },
    { fn: () => { if (CK.OW) CK.OW.buildEntities(); } },
    { card: { title: 'Chapter 8 complete', sub: 'Rule Six: light the path, not the sky.', dur: 3.2 } },
    { journal: 'The moon over the Kingdom is a paper lantern Grandma hung in 1971: "For whoever is lost: look up." Jules floated a lantern for Grandpa and wrote Rule Six: light the path, not the sky.' },
    { save: true },
  ];

  S.lm_knock_a = [['hedgehog', "Can you believe it? I had to put my bed in the closet just to get some sleep. The Brilliant 3000 next door is like a second sun.", 'sad'], { scraps: 5 }];
  S.lm_knock_b = [['duck', "Festival treats! Take some scraps. And if you see a moon, tell it we miss it.", 'happy'], { scraps: 5 }];
  S.lm_knock_c = [['fox', "My grandmother says she used to count the stars from this porch. I never believed there were that many.", 'sad'], { snacks: 1 }];
  S.lm_mayor = [() => [lit()
    ? ['mayor', 'I came all the way from Blossom Hollow for this. Worth every slow step. Look at the STARS.', 'happy']
    : ['mayor', 'Tortoises are very sensitive to glare. I have been squinting since Tuesday.', 'sad']]];
  S.lm_skipper = [['skipper', "I'm on lantern-boat duty! Every lantern that floats gets a little paper boat. I folded two hundred!", 'happy']];

  // ================================================================ PROPS
  Object.assign(CK.DecoDraw, {
    luxlamp(ctx, e, x, y) {
      D.shadow(ctx, x + 4, y, 12, 4);
      D.box3(ctx, x - 3, y - 52, 6, 52, 4, { r: 1, lw: 2, fill: '#5a4a3a', flute: false });
      if (lit()) {
        // hooded: a little cardboard cap, light only on the ground
        const g = ctx.createRadialGradient(x, y + 2, 2, x, y + 2, 40);
        g.addColorStop(0, 'rgba(255,214,120,0.38)'); g.addColorStop(1, 'rgba(255,214,120,0)');
        ctx.save(); ctx.translate(x, y + 2); ctx.scale(1, 0.4); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        D.ball(ctx, x, y - 54, 6, '#ffd76a', { lw: 1.5 });
        D.poly(ctx, [x - 13, y - 56, x, y - 68, x + 13, y - 56, x + 9, y - 54, x - 9, y - 54], '#3a4a5a', D.C.ink, 2);
      } else {
        const pulse = 1 + Math.sin(this.t * 3 + (e.seed || 0)) * 0.04;
        const g = ctx.createRadialGradient(x, y - 60, 4, x, y - 60, 70 * pulse);
        g.addColorStop(0, 'rgba(255,240,180,0.55)'); g.addColorStop(1, 'rgba(255,200,120,0)');
        ctx.fillStyle = g; ctx.fillRect(x - 72, y - 132, 144, 144);
        D.ball(ctx, x, y - 62, 13 * pulse, '#fff6c8', { lw: 2 });
        // dizzy moths circling the glare
        if (!f('lm_moths')) for (let i = 0; i < 2; i++) {
          const a = this.t * 4 + i * 3 + (e.seed || 0);
          D.char(ctx, 'moth', x + Math.cos(a) * 22, y - 50 + Math.sin(a) * 9, { s: 0.28, mood: 'angry', seed: i + (e.seed || 0), noShadow: true });
        }
      }
    },
    lanternstring(ctx, e, x, y) {
      const flip = e.o && e.o.flip ? -1 : 1, x2 = x + flip * 96;
      for (const px of [x, x2]) { D.shadow(ctx, px + 3, y, 8, 3); D.box3(ctx, px - 3, y - 70, 6, 70, 4, { r: 1, lw: 2, fill: '#7a5a3a', flute: false }); }
      ctx.beginPath(); ctx.moveTo(x, y - 68); ctx.quadraticCurveTo((x + x2) / 2, y - 40, x2, y - 68); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 1.5; ctx.stroke();
      for (let i = 1; i < 6; i++) {
        const t = i / 6, lx = x + (x2 - x) * t, ly = y - 68 + 4 * 28 * t * (1 - t) + 8;
        const sw = Math.sin(this.t * 2 + i) * 2;
        D.egg(ctx, lx + sw, ly, 6, 8, ['#ef6b6b', '#ffd25a', '#6cc56c', '#5aa9e6', '#ff9ec7'][i % 5], { lw: 1.5, k: 0.4 });
      }
    },
    stage(ctx, e, x, y) {
      D.shadow(ctx, x + 10, y + 4, 70, 12);
      D.box3(ctx, x - 64, y - 22, 128, 22, 26, { r: 2, lw: 3, fill: '#c9925a' });
      D.box3(ctx, x - 60, y - 96, 8, 74, 5, { r: 1, lw: 2, fill: '#8a5a3a', flute: false });
      D.box3(ctx, x + 52, y - 96, 8, 74, 5, { r: 1, lw: 2, fill: '#8a5a3a', flute: false });
      D.cardboard(ctx, x - 66, y - 112, 132, 22, { r: 3, lw: 2.5, fill: '#5a4a6a', flute: false });
      D.text(ctx, 'LANTERN FESTIVAL', x, y - 96, { size: 12, weight: 700, align: 'center', color: '#ffe9a8' });
    },
    meadow(ctx, e, x, y) {
      const small = e.o && e.o.small, n = small ? 7 : 14;
      for (let i = 0; i < n; i++) {
        const gx = x - (small ? 40 : 80) + U.hash(i, 3) * (small ? 80 : 170), gy = y - 30 + U.hash(i, 4) * 70;
        const sw = Math.sin(this.t * 1.5 + i) * 3;
        for (let k = -1; k <= 1; k++) D.line(ctx, gx + k * 3, gy, gx + k * 5 + sw, gy - 22 - (k ? 0 : 6), '#8a9a4a', 2.2);
        if (i % 3 === 0) D.ball(ctx, gx + sw, gy - 26, 4, '#f2eefc', { lw: 1 });
      }
    },
  });

  // Mr. Lux's shop: a tidy storefront, with a giant glowing globe on the roof until it gets a hood
  CK.BuildingDraw.luxshop = function (ctx, e, x, y) {
    const bw = e.bw * TS, x0 = x - bw / 2, base = y + TS * 0.25, top = base - 110;
    D.shadow(ctx, x + 14, base + 6, bw / 2 + 18, 16, 0.32);
    D.box3(ctx, x0, top, bw, 110, 30, { r: 2, lw: 4, fill: e.color, flute: false });
    D.box3(ctx, x0 - 8, top - 6, bw + 16, 16, 34, { r: 2, lw: 3, fill: e.roof, flute: false });
    // striped awning
    ctx.save(); ctx.beginPath(); ctx.rect(x0 + 10, top + 26, bw - 20, 20); ctx.clip();
    for (let i = 0; i < 14; i++) { ctx.fillStyle = i % 2 ? '#fffaf0' : '#5a4a6a'; ctx.fillRect(x0 + 10 + i * 20, top + 26, 20, 20); }
    ctx.restore(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(x0 + 10, top + 26, bw - 20, 20);
    // display window full of lanterns
    D.rr(ctx, x0 + 22, top + 56, 96, 44, 4); ctx.fillStyle = '#ffe9a8'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 3; ctx.stroke();
    for (let i = 0; i < 4; i++) D.ball(ctx, x0 + 36 + i * 22, top + 80, 7, lit() ? '#ffd76a' : '#fffbe0', { lw: 1.5 });
    D.rr(ctx, x - 16 + 40, base - 50, 32, 46, 6); ctx.fillStyle = D.lgx(ctx, x + 24, x + 56, '#6a4a7a'); ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 3; ctx.stroke();
    D.cardboard(ctx, x - 70, top - 30, 140, 22, { r: 3, lw: 2.5, fill: '#fff4dc', flute: false });
    D.text(ctx, lit() ? 'LUX DARK-SKY LANTERNS' : 'LUX LANTERNS', x, top - 14, { size: 12, weight: 700, align: 'center', color: '#3d2412' });
    // the rooftop Brilliant 3000
    const gx = x0 + bw - 40, gy = top - 46;
    D.line(ctx, gx, top - 8, gx, gy, D.C.ink, 4);
    if (lit()) {
      D.ball(ctx, gx, gy - 4, 10, '#ffd76a', { lw: 2 });
      D.poly(ctx, [gx - 20, gy - 6, gx, gy - 24, gx + 20, gy - 6], '#3a4a5a', D.C.ink, 2.5);
    } else {
      const g = ctx.createRadialGradient(gx, gy - 8, 6, gx, gy - 8, 120);
      g.addColorStop(0, 'rgba(255,245,190,0.6)'); g.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = g; ctx.fillRect(gx - 120, gy - 128, 240, 240);
      D.ball(ctx, gx, gy - 8, 22, '#fffbe0', { lw: 2.5 });
    }
  };

  // ================================================================ FINALE: THE SKY OVER THE LAKE
  class FestivalSky {
    constructor() {
      this.t = 0;
      this.alwaysUpdate = true;
      this.moon = 0;
      this.moonUp = false;
      this.mothsGo = false;
      this.mothT = 0;
      this.lanterns = [];
      this.stars = [];
      for (let i = 0; i < 90; i++) this.stars.push({ x: U.hash(i, 1) * W, y: U.hash(i, 2) * 300, r: 0.8 + U.hash(i, 3) * 1.8, p: U.hash(i, 4) * 6 });
    }
    launch() {
      for (let i = 0; i < 26; i++) this.lanterns.push({ x: 140 + U.hash(i, 9) * 700, y: 450 + U.hash(i, 8) * 70, d: U.hash(i, 7), t0: this.t + i * 0.12, col: ['#ffd76a', '#ffb36b', '#ff9ec7', '#fff3b0'][i % 4] });
      CK.Audio.sfx('magic');
    }
    update(dt) {
      this.t += dt;
      if (this.moonUp) this.moon = Math.min(1, this.moon + dt * 0.35);
      if (this.mothsGo) this.mothT += dt;
    }
    draw(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, 360);
      g.addColorStop(0, '#0d1238'); g.addColorStop(1, '#2a2a63');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (const s of this.stars) {
        const tw = 0.5 + Math.sin(this.t * 2 + s.p) * 0.5;
        D.circle(ctx, s.x, s.y, s.r * (0.7 + tw * 0.5), `rgba(255,248,220,${0.4 + tw * 0.6})`);
      }
      // the paper moon: Grandma's lantern, rising over the hills
      const my = 330 - this.moon * 200, mx = 640;
      const mg = ctx.createRadialGradient(mx, my, 20, mx, my, 160);
      mg.addColorStop(0, `rgba(255,240,190,${0.35 * this.moon})`); mg.addColorStop(1, 'rgba(255,240,190,0)');
      ctx.fillStyle = mg; ctx.fillRect(mx - 160, my - 160, 320, 320);
      D.ball(ctx, mx, my, 62, '#fff4d0', { lw: 3, k: 0.5 });
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(mx, my, Math.abs(i) * 14 + 4, 62, 0, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(160,120,60,0.35)'; ctx.lineWidth = 1.5; ctx.stroke(); }
      D.rr(ctx, mx - 50, my - 6, 26, 10, 2); ctx.fillStyle = 'rgba(230,210,160,0.9)'; ctx.fill();
      if (this.moon > 0.95) { D.text(ctx, 'FOR WHOEVER IS LOST:', mx, my + 26, { size: 9, weight: 700, align: 'center', color: 'rgba(120,90,50,0.8)' }); D.text(ctx, 'LOOK UP', mx, my + 38, { size: 9, weight: 700, align: 'center', color: 'rgba(120,90,50,0.8)' }); }
      // far hills as cardboard flats
      const hill = (col, y0, amp, off) => {
        ctx.beginPath(); ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 40) ctx.lineTo(x, y0 + Math.sin(x * 0.01 + off) * amp);
        ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 3; ctx.stroke();
      };
      hill('#1f2a4a', 330, 26, 0);
      hill('#26345a', 360, 18, 2);
      // the lake, reflecting the moon
      ctx.fillStyle = '#16204a'; ctx.fillRect(0, 380, W, H - 380);
      for (let i = 0; i < 12; i++) {
        const ry = 392 + i * 13, w = (60 - i * 3) * this.moon;
        D.line(ctx, mx - w + Math.sin(this.t * 2 + i) * 6, ry, mx + w + Math.sin(this.t * 2 + i) * 6, ry, 'rgba(255,240,190,0.45)', 3);
      }
      // floating lanterns drifting out and up
      for (const L of this.lanterns) {
        const a = Math.max(0, this.t - L.t0);
        const x = L.x + Math.sin(a * 0.6 + L.d * 6) * 10 + a * 6, y = L.y - a * (8 + L.d * 10);
        const s = 0.7 + L.d * 0.5;
        const gl = ctx.createRadialGradient(x, y, 2, x, y, 30 * s);
        gl.addColorStop(0, 'rgba(255,210,120,0.5)'); gl.addColorStop(1, 'rgba(255,210,120,0)');
        ctx.fillStyle = gl; ctx.fillRect(x - 30 * s, y - 30 * s, 60 * s, 60 * s);
        D.box3(ctx, x - 7 * s, y - 10 * s, 14 * s, 16 * s, 5 * s, { r: 2, lw: 1.5, fill: L.col, flute: false });
        D.poly(ctx, [x - 10 * s, y + 6 * s, x + 10 * s, y + 6 * s, x + 6 * s, y + 11 * s, x - 6 * s, y + 11 * s], '#fffaf0', D.C.ink, 1);
        D.line(ctx, x - 6 * s, y + 20 * s, x + 6 * s, y + 20 * s, 'rgba(255,220,150,0.3)', 2);
      }
      // the Moth-kin rise toward the moon in a glowing ribbon
      if (this.mothsGo) for (let i = 0; i < 18; i++) {
        const p = Math.min(1, Math.max(0, (this.mothT - i * 0.12) / 3.5));
        if (p <= 0) continue;
        const x = 120 + i * 18 + (mx - 120 - i * 18) * p + Math.sin(this.t * 3 + i) * 14;
        const y = 470 - (470 - my) * p + Math.cos(this.t * 2 + i) * 10;
        D.circle(ctx, x, y, 9, 'rgba(255,240,170,0.18)');
        D.char(ctx, 'moth', x, y + 10, { s: 0.3, mood: 'happy', seed: i, noShadow: true, still: true });
      }
      // everyone on the dock, in silhouette-ish warm light
      D.box3(ctx, 40, 470, 360, 16, 20, { r: 2, lw: 3, fill: '#6a4a32', flute: false });
      const who = [['sam', 120], ['jules', 175], ['corry', 235], ['pip', 285], ['queen', 335]];
      for (const [k, px] of who) D.char(ctx, k, px, 472, { s: k === 'queen' ? 0.8 : 1.05, dir: 'up', mood: 'happy' });
      D.char(ctx, 'heron', 380, 472, { s: 0.7, dir: 'up' });
    }
  }
  CK.FestivalSky = FestivalSky;

  // ================================================================ PUZZLE: FESTIVAL LIGHTS
  // Light every path square, keep Moonmeadow dark, and send no light up into the sky.
  const LAMPS = {
    post: { name: 'Path post', cost: 2, glow: 0, color: '#ffd76a', key: 1, on: 'path', reach: (dc, dr) => Math.abs(dc) + Math.abs(dr) <= 1, note: 'lights a + shape · path only' },
    hood: { name: 'Hooded lantern', cost: 3, glow: 0, color: '#5aa9e6', key: 2, on: 'any', reach: (dc, dr) => Math.abs(dc) <= 1 && Math.abs(dr) <= 1, note: 'lights a 3x3 square · no sky glow' },
    globe: { name: 'Brilliant 3000', cost: 1, glow: 3, color: '#fffbe0', key: 3, on: 'any', reach: (dc, dr) => dc * dc + dr * dr <= 4, note: 'lights a big circle · sky glow!' },
  };
  CK.PuzzleDefs.festival_lights = {
    type: 'darksky', title: 'The Festival Lights', budget: 10, glowMax: 0,
    grid: ['mmmgpgggw', 'mmggpgggw', 'mgggPPPgw', 'ggggPPPpd', 'ppppgggww'],
    brief: 'Light every square of the path and the square (P) so nobody trips. Keep Moonmeadow (purple) dark, and send no light into the sky. Budget: 10 scraps.',
    hint: 'Posts only light their own square and the four next to it, so they are safe beside the meadow. A hooded lantern lights a whole 3x3 block: one in the middle of the square covers all six squares. The Brilliant 3000 is cheap, but it glows up into the sky.',
    lesson: 'Shielded lights point down at the ground where people walk. Unshielded lights also shine up and sideways, hiding the stars and confusing moths, birds and sea turtles.',
    solution: [[1, 4, 'post'], [4, 0, 'post'], [4, 3, 'hood'], [7, 2, 'hood']],
  };
  class DarkSkyPuzzle extends CK.Puzzle.PuzzleBase {
    constructor(def) {
      super(def);
      this.rows = def.grid.length; this.cols = def.grid[0].length;
      this.cs = 64; this.ox = 40; this.oy = 160;
      this.place = {};
      this.tool = 'hood';
      this.cursor = [4, 2];
      this.anim = 0;
    }
    T(c, r) { return this.def.grid[r][c]; }
    isPath(c, r) { return 'pPd'.includes(this.T(c, r)); }
    spent() { return Object.values(this.place).reduce((a, k) => a + LAMPS[k].cost, 0); }
    glow() { return Object.values(this.place).reduce((a, k) => a + LAMPS[k].glow, 0); }
    litMap() {
      const lit = {};
      for (const [key, k] of Object.entries(this.place)) {
        const [c, r] = key.split(',').map(Number);
        for (let rr = 0; rr < this.rows; rr++) for (let cc = 0; cc < this.cols; cc++) if (LAMPS[k].reach(cc - c, rr - r)) lit[cc + ',' + rr] = (lit[cc + ',' + rr] || 0) + 1;
      }
      return lit;
    }
    evaluate() {
      const lit = this.litMap();
      const dark = [], spill = [];
      for (let r = 0; r < this.rows; r++) for (let c = 0; c < this.cols; c++) {
        if (this.isPath(c, r) && !lit[c + ',' + r]) dark.push([c, r]);
        if (this.T(c, r) === 'm' && lit[c + ',' + r]) spill.push([c, r]);
      }
      const glow = this.glow();
      return { lit, dark, spill, glow, ok: !dark.length && !spill.length && glow <= this.def.glowMax };
    }
    clear() { this.place = {}; }
    applySolution() { this.place = {}; for (const [c, r, k] of this.def.solution) this.place[c + ',' + r] = k; }
    validate() { return this.spent() > this.def.budget ? `Over budget! ${this.spent()} / ${this.def.budget} scraps.` : null; }
    startTest() { this.state = 'test'; this.anim = 0; this.res = this.evaluate(); CK.Audio.sfx('magic'); }
    resetTest() { this.res = null; }
    cellAt(mx, my) {
      const c = Math.floor((mx - this.ox) / this.cs), r = Math.floor((my - this.oy) / this.cs);
      return c >= 0 && r >= 0 && c < this.cols && r < this.rows ? [c, r] : null;
    }
    toggle(c, r) {
      const key = c + ',' + r, t = this.T(c, r), L = LAMPS[this.tool];
      if (this.place[key]) { delete this.place[key]; CK.Audio.sfx('back'); return; }
      if (t === 'm') { CK.Audio.sfx('error'); this.flashMsg('That is Moonmeadow, where the Moth-kin sleep. No lanterns in the meadow!'); return; }
      if (t === 'w' || t === 'd') { CK.Audio.sfx('error'); this.flashMsg(t === 'w' ? 'That is the lake. Lanterns go on the lake later, at midnight!' : 'That is the dock. Keep it clear for the lantern float.'); return; }
      if (L.on === 'path' && !'pP'.includes(t)) { CK.Audio.sfx('error'); this.flashMsg('Path posts go on the path.'); return; }
      this.place[key] = this.tool;
      CK.Audio.sfx('build');
    }
    update(dt) {
      if (this.commonUpdate(dt)) {
        if (this.state === 'test') this.updateTest(dt);
        return;
      }
      for (const id of Object.keys(LAMPS)) if (Input.key('Digit' + LAMPS[id].key)) { this.tool = id; CK.Audio.sfx('blip'); }
      const [c, r] = this.cursor;
      if (Input.hit('left')) this.cursor = [Math.max(0, c - 1), r];
      if (Input.hit('right')) this.cursor = [Math.min(this.cols - 1, c + 1), r];
      if (Input.hit('up')) this.cursor = [c, Math.max(0, r - 1)];
      if (Input.hit('down')) this.cursor = [c, Math.min(this.rows - 1, r + 1)];
      if (Input.hit('ok')) this.toggle(...this.cursor);
      if (Input.mouse.moved) { const cell = this.cellAt(Input.mouse.x, Input.mouse.y); if (cell) this.cursor = cell; }
      if (Input.mouse.pressed) {
        const cell = this.cellAt(Input.mouse.x, Input.mouse.y);
        if (cell) this.toggle(...cell);
        Object.keys(LAMPS).forEach((id, i) => { if (D.inRect(Input.mouse.x, Input.mouse.y, 690, 248 + i * 44, 246, 38)) { this.tool = id; CK.Audio.sfx('blip'); } });
      }
    }
    updateTest(dt) {
      this.anim += dt;
      if (this.anim > 2.8 || CK.autoSkip) {
        const r = this.res;
        if (r.ok) {
          CK.setFlag('lm_lights');
          this.finish(true, 'The stars come out!', `Every step of the path is lit, the meadow stays dark, and the sky is clear. ${this.def.lesson}`);
        } else if (r.glow > this.def.glowMax) {
          this.finish(false, 'Sky glow!', 'The Brilliant 3000 shines up into the sky. The moon is still hidden. Try lanterns that point down.');
        } else if (r.spill.length) {
          this.finish(false, 'The moths woke up!', `Light spills into Moonmeadow (${r.spill.length} square${r.spill.length > 1 ? 's' : ''}). Use something with a smaller reach next to the meadow.`);
        } else {
          this.finish(false, 'Watch your step!', `${r.dark.length} square${r.dark.length > 1 ? 's' : ''} of the path ${r.dark.length > 1 ? 'are' : 'is'} still dark.`);
        }
      }
    }
    draw(ctx) {
      this.drawFrame(ctx);
      const { ox, oy, cs } = this;
      const res = this.state !== 'build' ? this.res : null;
      const preview = this.evaluate();
      const glow = res ? res.glow : this.glow();
      // the sky strip: stars when the glow is zero, an orange haze when it is not
      const sky = ctx.createLinearGradient(0, 74, 0, 146);
      sky.addColorStop(0, glow ? '#5a3a3a' : '#0d1238'); sky.addColorStop(1, glow ? '#b0703a' : '#2a2a63');
      ctx.fillStyle = sky; D.rr(ctx, ox, 74, this.cols * cs, 70, 8); ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 2.5; ctx.stroke();
      if (!glow) for (let i = 0; i < 30; i++) D.circle(ctx, ox + 10 + U.hash(i, 1) * (this.cols * cs - 20), 82 + U.hash(i, 2) * 54, 1 + U.hash(i, 3) * 1.4, `rgba(255,248,220,${0.5 + Math.sin(this.t * 2 + i) * 0.4})`);
      D.circle(ctx, ox + this.cols * cs - 50, 108, 18, glow ? 'rgba(255,240,200,0.15)' : '#fff4d0', glow ? null : D.C.ink, 2);
      D.text(ctx, glow ? `Sky glow: ${glow}  (the moon is hidden)` : 'Sky: clear and dark', ox + 14, 98, { size: 13, weight: 700, color: glow ? '#ffd6a8' : '#cfe0ff' });
      // the ground slab
      D.box3(ctx, ox - 8, oy - 8, this.cols * cs + 16, this.rows * cs + 16, 14, { fill: '#3a3048', lw: 3, flute: false });
      for (let r = 0; r < this.rows; r++) for (let c = 0; c < this.cols; c++) {
        const t = this.T(c, r), x = ox + c * cs, y = oy + r * cs, key = c + ',' + r;
        const col = { m: '#6a5a8a', g: '#4a6a4a', p: '#a08a6a', P: '#b89a6a', w: '#2a4a7a', d: '#7a5a3a' }[t];
        ctx.fillStyle = col; ctx.fillRect(x, y, cs, cs);
        if (t === 'm') for (let i = 0; i < 3; i++) D.ball(ctx, x + 14 + U.hash(c, r, i) * 36, y + 16 + U.hash(r, c, i) * 32, 3, '#e8e0fa', { lw: 0.8 });
        if (t === 'w') D.line(ctx, x + 12, y + 32 + Math.sin(this.t * 2 + c) * 3, x + 40, y + 32 + Math.sin(this.t * 2 + c) * 3, 'rgba(255,255,255,0.3)', 2);
        if (t === 'd') for (let i = 0; i < 4; i++) D.line(ctx, x, y + 8 + i * 16, x + cs, y + 8 + i * 16, 'rgba(0,0,0,0.25)', 2);
        // light pools: preview while building, full glow during the test
        const n = (res || preview).lit[key];
        if (n) {
          const a = res ? Math.min(1, this.anim / 1) : 0.6;
          ctx.fillStyle = t === 'm' ? `rgba(255,120,120,${0.45 * a})` : `rgba(255,214,120,${Math.min(0.55, 0.3 + n * 0.12) * a})`;
          ctx.fillRect(x, y, cs, cs);
        } else if (this.isPath(c, r)) {
          ctx.strokeStyle = 'rgba(255,214,120,0.6)'; ctx.setLineDash([5, 5]); ctx.lineWidth = 2; ctx.strokeRect(x + 6, y + 6, cs - 12, cs - 12); ctx.setLineDash([]);
        }
        ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.strokeRect(x, y, cs, cs);
        if (t === 'P' && c === 5 && r === 2) D.text(ctx, 'SQUARE', x + cs / 2, y - 4 + cs * 2 + 14, { size: 11, weight: 700, align: 'center', color: 'rgba(255,240,200,0.7)' });
      }
      // the lamps themselves, standing up off the grid
      for (const [key, k] of Object.entries(this.place)) {
        const [c, r] = key.split(',').map(Number), x = ox + c * cs + cs / 2, y = oy + r * cs + cs - 10;
        D.shadow(ctx, x + 3, y, 10, 3);
        D.box3(ctx, x - 2.5, y - 34, 5, 34, 3, { r: 1, lw: 1.8, fill: '#5a4a3a', flute: false });
        if (k === 'post') D.ball(ctx, x, y - 36, 6, '#ffd76a', { lw: 1.5 });
        if (k === 'hood') { D.ball(ctx, x, y - 36, 6, '#ffd76a', { lw: 1.5 }); D.poly(ctx, [x - 12, y - 38, x, y - 50, x + 12, y - 38], '#3a4a5a', D.C.ink, 2); }
        if (k === 'globe') { D.circle(ctx, x, y - 44, 26, 'rgba(255,240,180,0.3)'); D.ball(ctx, x, y - 44, 11, '#fffbe0', { lw: 2 }); }
      }
      // failing squares pulse during a test
      if (res && this.anim > 1) {
        for (const [c, r] of res.dark.concat(res.spill)) { ctx.strokeStyle = `rgba(255,90,90,${0.6 + Math.sin(this.t * 8) * 0.4})`; ctx.lineWidth = 4; ctx.strokeRect(ox + c * cs + 3, oy + r * cs + 3, cs - 6, cs - 6); }
        if (res.ok) for (let i = 0; i < 6; i++) {
          const p = ((this.anim - 1) * 0.4 + i / 6) % 1;
          D.char(ctx, 'moth', ox + 40 + i * 30 + p * 200, oy + 60 - p * 120, { s: 0.25, mood: 'happy', seed: i, noShadow: true, still: true });
        }
      }
      if (this.state === 'build') {
        const [c, r] = this.cursor, pulse = 0.5 + Math.sin(this.t * 6) * 0.5;
        ctx.strokeStyle = `rgba(255,236,120,${0.6 + pulse * 0.4})`; ctx.lineWidth = 4;
        ctx.strokeRect(ox + c * cs + 2, oy + r * cs + 2, cs - 4, cs - 4);
      }
      this.drawPanel(ctx, (ctx, px, y, pw) => {
        const sp = this.spent();
        D.text(ctx, `Budget: ${sp} / ${this.def.budget} scraps`, px + 16, y + 4, { size: 15, weight: 700, color: sp > this.def.budget ? '#c2410c' : '#3d2412' });
        D.text(ctx, `Path lit: ${preview.dark.length ? preview.dark.length + ' still dark' : 'all of it'} · Meadow: ${preview.spill.length ? 'too bright!' : 'dark'}`, px + 16, y + 24, { size: 12, color: '#5b3a1e' });
        Object.keys(LAMPS).forEach((id, i) => {
          const L = LAMPS[id], by = 248 + i * 44, sel = this.tool === id;
          D.rr(ctx, px + 14, by, pw - 28, 38, 8); ctx.fillStyle = sel ? '#fff0b8' : '#fffaf0'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = sel ? 2.5 : 1.5; ctx.stroke();
          D.ball(ctx, px + 32, by + 19, 9, L.color, { lw: 1.5 });
          D.text(ctx, `${L.key}. ${L.name} (${L.cost})`, px + 48, by + 17, { size: 14, weight: 700 });
          D.text(ctx, L.note, px + 48, by + 32, { size: 11, color: '#7a5434' });
        });
      });
      D.text(ctx, 'Click a square (or arrows + Z) to place the selected lantern. Click again to remove. Keys 1-3 switch.', 30, H - 14, { size: 13, color: '#cfe6ff' });
      this.drawOverlay(ctx);
    }
  }
  CK.PuzzleTypes.darksky = DarkSkyPuzzle;
})();
