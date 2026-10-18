// Cardboard Kingdom - the real world: a grey campus prologue, a full-color epilogue,
// the Cardboard Boat Regatta, Nib's shop and the fold-out travel map.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input, Data = CK.Data;
  const W = CK.W, H = CK.H;
  const f = (k) => CK.flag(k);
  const S = CK.Story.scripts;
  const ep = () => f('epilogue');

  // ================================================================ MAP
  CK.Chapters.campus = {
    id: 'campus', name: 'Riverside University', w: 40, h: 24,
    start: [5, 12], noFollowers: true,
    seasonOf: () => (ep() ? 'campusColor' : 'campus'),
    get season() {
      return ep() ? 'campusColor' : 'campus';
    },
    get music() {
      return ep() ? 'spring' : 'dorm';
    },
    build(m) {
      m.scatter(',', 0.1, 41);
      m.ellipse(22, 18.5, 5.2, 2.6, '~');
      m.path([[1, 12], [38, 12]], '=');
      m.path([[20, 12], [20, 7]], '=');
      m.path([[5, 12], [5, 11]], '=');
      m.path([[11, 12], [11, 11]], '=');
      m.path([[31, 12], [31, 8]], '=');
      m.path([[33, 12], [33, 20]], '=');
      m.path([[14, 12], [14, 16], [17, 16]], '=');
      m.scatter('T', 0.05, 42);
      m.border('T');
    },
    post(m) {
      // nothing grows through a building
      for (const o of this.objects) if (o.type === 'building') m.rect(o.x - Math.floor(o.bw / 2), o.y - o.bh + 1, o.bw, o.bh + 1, '.');
      m.rect(36, 19, 3, 3, '.');
    },
    objects: [
      // buildings (x, y = the front door)
      { type: 'building', id: 'dorm', x: 5, y: 10, bw: 6, bh: 5, label: 'Haverford Hall', color: '#b9674a', door: 'Dorm', script: () => [{ narrate: ep() ? 'Your dorm. Your bed is unmade, and somehow that feels fine today.' : 'Your dorm. Problem Set 4 is waiting upstairs. It can keep waiting.' }] },
      { type: 'building', id: 'eng', x: 20, y: 6, bw: 8, bh: 5, label: 'Brennan Engineering', color: '#8a8f9e', roof: '#4a4f5e', door: 'Knock', script: () => (ep() ? 'ep_okafor' : 'cp_okafor') },
      { type: 'building', id: 'lib', x: 31, y: 7, bw: 6, bh: 4, label: 'Library', color: '#c9a77a', roof: '#6a5040', door: 'Enter', script: () => [{ narrate: ep() ? 'You check out a book called "Small Dams for Small Towns". The librarian gives you a thumbs up.' : 'Quiet. Everyone is studying. Nobody looks happy about it.' }] },
      { type: 'building', id: 'mail', x: 11, y: 10, bw: 4, bh: 3, label: 'Mail Room', color: '#7aa0b8', roof: '#3e5a6e', door: 'Mail', script: 'cp_mail' },
      { type: 'building', id: 'recycle', x: 33, y: 19, bw: 5, bh: 3, label: 'Recycling', color: '#6cae6c', roof: '#3f6f3f', door: 'Look', script: () => [{ narrate: 'Bins for paper, plastic and cans. A sign says: FLATTEN YOUR BOXES! Sam has never flattened a box with joy, until now.' }] },
      { type: 'deco', kind: 'spillway', x: 27, y: 19 },
      { type: 'sign', x: 12, y: 14, text: 'Reyes Pond. Spillway designed 1974. Please do not feed the ducks bread.' },
      { type: 'cat', x: 14, y: 14 },
      // prologue folks
      { type: 'npc', id: 'jules_cp', x: 7, y: 13, look: 'jules', talk: 'cp_jules', cond: () => !CK.coop && !ep() },
      { type: 'npc', id: 'okafor_out', x: 23, y: 8, look: 'okafor', talk: () => (ep() ? 'ep_okafor' : 'cp_okafor') },
      { type: 'npc', id: 'stu1', x: 26, y: 13, look: 'human', o: { hair: '#2b2b2b', top: '#9a8fb0', style: 'long' }, talk: () => (ep() ? [['student', "Did you see the cardboard knight on the library steps? Someone's being whimsical. I love it.", 'happy']] : [['student', "Three midterms this week. I've forgotten what the sun looks like.", 'sad']]) },
      { type: 'npc', id: 'stu2', x: 9, y: 15, look: 'human', o: { hair: '#c96a2a', top: '#6a8a6a', style: 'bun', skin: '#f2c9a0' }, talk: () => (ep() ? [['student', 'The regatta! My boat is called the S.S. Overthinking. It is very sturdy.', 'happy']] : [['student', "I switched majors twice. Honestly? It's fine. You're allowed to not know yet.", 'happy']]) },
      { type: 'npc', id: 'stu3', x: 29, y: 15, look: 'human', o: { hair: '#1f1a17', top: '#d08a5a', style: 'short', skin: '#7a4a2e', glasses: true }, talk: () => (ep() ? [['student', "Is it me, or is everything brighter today? Like someone turned the saturation up.", 'happy']] : [['student', 'Grey again. It is ALWAYS grey on Tuesdays.', 'sad']]) },
      { type: 'trigger', id: 'cp_dusk_go', x: 30, y: 13, w: 6, h: 6, script: 'cp_dusk', cond: () => f('cp_okafor') && f('cp_mail') && !f('cp_dusk') && !ep() },
      { type: 'portal', id: 'box', x: 37, y: 20, vivid: true, label: "SAM'S", script: () => (ep() ? 'ep_portal' : 'cp_box'), cond: () => (f('cp_dusk') && !ep()) || f('credits_seen') },
      // epilogue
      { type: 'npc', id: 'jules_ep', x: 18, y: 15, look: 'jules', talk: 'ep_jules', cond: () => ep() && !CK.coop },
      { type: 'npc', id: 'regatta', x: 16, y: 17, look: 'human', o: { hair: '#5a3a22', top: '#ef6b6b', style: 'puff', skin: '#e8b48a' }, talk: 'ep_regatta', cond: ep },
      { type: 'deco', kind: 'boat', x: 22, y: 18, cond: ep },
      { type: 'knightfig', id: 'k_corry', x: 2, y: 21, look: 'corry', cond: ep, script: () => knight('k_corry', 'Sir Corrugate', 'holding a paper-towel-tube sword the size of a toothpick') },
      { type: 'knightfig', id: 'k_bess', x: 38, y: 2, look: 'bess', o: { s: 0.5 }, cond: ep, script: () => knight('k_bess', 'Captain Bess', 'wearing a tiny patchwork coat, saluting the pond') },
      { type: 'knightfig', id: 'k_queen', x: 13, y: 3, look: 'queen', o: { s: 0.5 }, cond: ep, script: () => knight('k_queen', 'Queen Corrina', 'perched on a bottle-cap throne') },
      { type: 'knightfig', id: 'k_skip', x: 27, y: 10, look: 'skipper', cond: ep, script: () => knight('k_skip', 'Skipper', 'riding a paper boat on a puddle') },
      { type: 'knightfig', id: 'k_hoot', x: 8, y: 18, look: 'critter', o: { species: 'owl', color: '#b98d62' }, cond: ep, script: () => knight('k_hoot', 'Professor Hoot', 'reading a stamp-sized book about drainage') },
      { type: 'knightfig', id: 'k_drizzle', x: 30, y: 22, look: 'drizzle', o: { s: 0.5 }, cond: ep, script: () => knight('k_drizzle', 'the little Drizzle cloud', 'watering a dandelion. Happily') },
    ],
    objective() {
      if (!ep()) {
        if (!f('cp_okafor')) return 'Meet your advisor, Dr. Okafor (Brennan Engineering, north)';
        if (!f('cp_mail')) return 'Pick up your package at the Mail Room';
        if (!f('cp_dusk')) return "Take Grandma's giant box to the recycling center (east)";
        return 'The box is... glowing? (by the recycling center)';
      }
      const n = Object.keys(CK.G.found || {}).length;
      if (!f('ep_okafor')) return 'Tell Dr. Okafor what you decided (Brennan Engineering)';
      if (!f('ep_regatta')) return 'Race in the Cardboard Boat Regatta (by the pond)';
      return `Free roam! Cardboard friends found: ${n}/6. The glowing box goes back to the Kingdom.`;
    },
  };

  function knight(id, name, what) {
    return [
      (G) => {
        G.found[id] = true;
        if (CK.OW) CK.OW.buildEntities();
      },
      { sfx: 'chest' },
      (G) => {
        const n = Object.keys(G.found).length;
        const out = [{ narrate: `A tiny cardboard ${name}, ${what}. Nobody on campus knows who keeps leaving them. (${n}/6)` }];
        if (n === 6) out.push(['sam', 'Whimsy was here the whole time. I just had to look for it.', 'happy'], { journal: 'Found all six cardboard friends hidden around campus. The Kingdom is closer than it looks.' }, { scraps: 30 });
        return out;
      },
    ];
  }

  // ================================================================ PROLOGUE
  S.campus_intro = [
    { card: { title: 'Prologue', sub: 'Riverside University, the real world' } },
    { narrate: 'Tuesday. Overcast. The kind of grey that gets into your socks.' },
    ['sam', 'Week six of junior year. Civil engineering. I used to think that meant building bridges. So far it means problem sets ABOUT bridges.', 'sad'],
    ['sam', "Dr. Okafor wants to see me about 'my concentration'. As in: pick one, Sam. Structures? Water? Transportation? Anything?", 'sad'],
    ['sam', "Everyone else seems to know where they're going. I just feel like I'm floating. Like I'm getting rained on all the time.", 'sad'],
    { coop: [
      ['jules', "Roomie! You're doing the sad walk again. I'm coming with you. Player Two, reporting for moral support.", 'happy'],
      ['sam', "Thanks, Jules. Arrows and Enter, by the way. You know. For the moral support.", 'happy'],
    ] },
    { journal: "Junior year. Stuck. Dr. Okafor wants me to pick a concentration and I don't know what I want anymore." },
  ];
  S.cp_jules = [
    { if: () => f('cp_mail'), then: [['jules', "A box from your grandma? That thing is HUGE. You could live in it. Please don't live in it.", 'happy']] },
    ['jules', "Morning, roomie. You look like a soggy cereal box.", 'happy'],
    ['jules', "Dr. Okafor's office is in Brennan Engineering, north of the quad. Oh, and the mail room says you've got a package. A BIG one."],
    ['sam', "Thanks, Jules. Do you ever feel like you're just... going through the motions?", 'sad'],
    ['jules', "Every Tuesday. That's why I do something silly on Tuesdays. Today I'm wearing two different socks. Try it!", 'happy'],
  ];
  S.cp_okafor = [
    { if: () => f('cp_okafor'), then: [['okafor', "Take your time, Sam. But do take it. And go check your mail, the mail room called me. Twice.", 'happy']] },
    ['okafor', "Sam! Come in, sit. So. Your concentration form is... blank."],
    ['sam', "I know. I'm sorry. I just don't know what I want anymore. Everyone else seems so sure.", 'sad'],
    ['okafor', "Can I tell you a secret? Almost nobody is sure. The sure ones are just louder.", 'happy'],
    ['okafor', "When you applied here, you wrote an essay about building a dam in a creek with your grandmother. You were SO excited. Where did that kid go?"],
    ['sam', "Grades happened, I guess. Deadlines. It all turned into homework.", 'sad'],
    ['okafor', "Then go find the fun again before you pick. Come tell me when you do. I'll be here. Grading. Forever.", 'happy'],
    { coop: [['jules', "Find the fun. I'm the fun, Sam. I'm right here.", 'happy']] },
    { flag: 'cp_okafor' },
    (G) => (f('cp_mail') ? [['sam', "Okay. One giant box to deal with. The recycling center is east, past the pond.", 'sad']] : []),
  ];
  S.cp_mail = [
    { if: () => ep(), then: [{ narrate: 'The mail room. A postcard from Grandma: a crayon drawing of a bear knight. "Proud of you. -R."' }] },
    { if: () => f('cp_mail'), then: [{ narrate: 'The mail room. Nothing else today except a coupon for pizza.' }] },
    { narrate: 'The clerk wheels out a box. A REALLY big box. A refrigerator box, held together with about forty years of tape.' },
    { narrate: '"Dear Sam. I was cleaning out the garage and found our old kingdom box. You and I built a whole kingdom in it the summer you were eight. My old sketchbook is inside too. Maybe they will help with whatever you are figuring out. Love, Grandma Rosie."' },
    { narrate: '"P.S. Nobody gets left out in the rain."' },
    ['sam', "...Rule Two. We had rules. I completely forgot we had rules.", 'shock'],
    { narrate: "The sketchbook is full of pencil bridges, dams and canals. On the last page: a dam on a mountain, and a big question mark. \"Something's missing. I'll figure it out someday. - R.\"" },
    { journal: "Grandma Rosie sent our old kingdom box and her sketchbook. Last page: a mountain dam with a question mark. 'Something's missing.'" },
    { flag: 'cp_mail' },
    (G) => (f('cp_okafor') ? [['sam', "This box is way too big for a dorm room. I'll take it to the recycling center, east past the pond. Grandma would understand... right?", 'sad']] : [['sam', "I should still go see Dr. Okafor. Brennan Engineering, north.", 'sad']]),
  ];
  S.cp_dusk = [
    { narrate: 'Sam drags the giant box across campus. The sky turns from grey to darker grey. A drizzle starts.' },
    { night: true },
    { music: 'dorm', night: true },
    { flag: 'cp_dusk' },
    { fn: () => CK.OW && CK.OW.refresh() },
    { narrate: 'By the recycling bins, the box sits in the rain. And it is... glowing.' },
  ];
  S.cp_box = [
    { narrate: "On the side of the box, in faded crayon, there's a drawing of a bear in armor, and the words SAM'S KINGDOM." },
    ['sam', "I drew that. I don't even remember drawing that.", 'shock'],
    { narrate: 'The crayon bear... waves.' },
    ['sam', "...Okay. That's new.", 'shock'],
    { coop: [['jules', "Did the drawing just WAVE at us? Sam. SAM. The box is GLOWING. We're getting in, right? We're definitely getting in.", 'shock']] },
    { narrate: 'Warm light spills out of the flaps. It smells like tape, old crayons and cherry blossoms.' },
    { choice: { who: 'sam', text: 'Climb into the box?', options: [
      { label: 'Climb in', then: [
        { narrate: 'Sam climbs in and pulls the flaps shut. The rain gets quieter... and quieter...' },
        { coop: [{ narrate: 'Jules climbs in too, obviously, and steps on Sam\'s foot.' }] },
        { chapter: 'spring', label: '...and then, a breeze full of blossoms.' },
      ] },
      { label: 'Not yet', then: [['sam', "It's a box. It's just a box. ...A glowing box.", 'sad']] },
    ] } },
  ];

  // ================================================================ EPILOGUE
  S.ep_intro = [
    { card: { title: 'Epilogue', sub: 'The real world, in color' } },
    { narrate: 'Sunrise. A cardboard boat drifts across Reyes Pond and bumps gently into the bank.' },
    ['sam', "I'm... home. On the campus pond. In a boat built by a sponge pirate.", 'happy'],
    { narrate: "Something wriggles in Sam's hoodie pocket. A tiny origami crane in a red bandana peeks out, winks, and then goes very still, the way paper should." },
    ['sam', 'Pip!', 'happy'],
    { narrate: 'The grass is so green. The sky is so blue. Cherry petals drift across the quad.' },
    ['sam', 'Was the world always this colorful? Or am I finally looking at it?', 'happy'],
    { solo: [
      ['jules', "SAM! Where WERE you all night? Why are you in a BOAT? Why is the boat... honestly really well built?", 'shock'],
      ['sam', 'Long story. There was a bear. And a cloud. And I think I picked my concentration.', 'happy'],
    ] },
    { coop: [
      ['jules', "We're back. We're BACK. My socks are still wet from the Brinemarsh. That was REAL, right?", 'shock'],
      ['sam', "It was real. And I think I finally know what I want to do.", 'happy'],
    ] },
    ['jules', "Oh! The Cardboard Boat Regatta is today, right here on the pond! You have to enter. You're basically a professional now.", 'happy'],
    { journal: 'Sailed home down the spillway river. The real world looks different now. Brighter. Maybe it always was.' },
  ];
  S.ep_jules = [
    { if: () => f('ep_regatta'), then: [['jules', "I told everyone you're a cardboard boat prodigy. You're welcome. Also, there's a tiny cardboard knight on the library steps?", 'happy']] },
    ['jules', "Regatta sign-ups are by the pond! And go tell Dr. Okafor whatever it is you figured out. You've got that look.", 'happy'],
  ];
  S.ep_okafor = [
    { if: () => f('ep_okafor'), then: [['okafor', "Water resources. I already filed the form. Go race your boat, Sam.", 'happy']] },
    ['okafor', "Sam! You look... different. Rested? Sunburned? Is that a paper crane in your pocket?", 'shock'],
    ['sam', "I figured it out. I want to work on water. Floods, dams, drainage. Making sure nobody gets left out in the rain.", 'happy'],
    ['okafor', "Water resources engineering. That is a wonderful fit.", 'happy'],
    { narrate: "Sam shows Dr. Okafor Grandma's sketchbook. Dr. Okafor flips a page, then another, then stops." },
    ['okafor', "Wait. 'R. Reyes'? Rosalind Reyes? Sam, she designed the spillway on our pond! In 1974! It's in your textbook. Chapter 9. Problem Set 4.", 'shock'],
    ['sam', "Grandma was a REAL engineer?! She always said she just 'liked building stuff'.", 'shock'],
    ['okafor', "The best ones always say that.", 'happy'],
    ['okafor', "And this mountain dam with the question mark. She never finished it?"],
    ['sam', "She did. Well, we did. It needed a spillway.", 'happy'],
    { journal: "TWIST: Grandma Rosie was a real civil engineer. She designed the spillway on the campus pond in 1974. Declared my concentration: water resources." },
    { flag: 'ep_okafor' },
  ];
  S.ep_regatta = [
    { if: () => f('ep_regatta'), then: [['student', "Great race! Come back next year. Bring that crane, it's good luck.", 'happy']] },
    ['student', "Cardboard Boat Regatta! Build a boat, paddle across the pond, try not to sink!", 'happy'],
    { if: () => !f('ep_okafor'), then: [['student', "Sign-ups close soon, but you've got time. Go do whatever you were about to do first!", 'happy']] },
    ['sam', "Cardboard and water. My two favorite enemies.", 'happy'],
    { await: () => CK.startRegatta() },
    (G) => {
      const pl = G.flags.regatta_place || 4;
      return pl === 1
        ? [['student', 'FIRST PLACE! And your boat barely got damp! How?!', 'happy'], ['sam', 'Wax seal. Waterproofing is half of all good engineering.', 'happy']]
        : [['student', `Place ${pl}! And you stayed afloat, which honestly puts you ahead of most of us.`, 'happy'], ['sam', "Didn't win. Had a great time anyway. That's new for me.", 'happy']];
    },
    { flag: 'ep_regatta' },
    { wait: 0.4 },
    { narrate: "Sam's phone buzzes. GRANDMA ROSIE." },
    ['grandma', 'Sam, sweetheart! Did the box arrive?', 'happy'],
    ['sam', "It did. Grandma... I went there. The Kingdom. I met Corry and Pip. And the Queen gave me your hard hat.", 'happy'],
    { narrate: 'A long pause on the line.' },
    ['grandma', "...Oh. Oh, my goodness. Is Sir Corrugate still wearing the sash I drew on him?", 'happy'],
    ['sam', "He is. And I finished your mountain dam. It needed a spillway.", 'happy'],
    ['grandma', "Of course it did. Water always needs somewhere to go. So do people.", 'happy'],
    ['grandma', "Is there... a silver bird? I folded one from a gum wrapper, a long time ago. I always felt bad that I left him behind.", 'sad'],
    ['sam', "Magister Corvin. He's doing better now. He's rebuilding houses. With tape. He complains a lot.", 'happy'],
    ['grandma', "I left that kingdom when I grew up because I thought I had to. Then I spent forty years building real things for real people. It turns out it's the same job.", 'happy'],
    ['sam', "I want to do that too. The real one. And keep visiting the other one.", 'happy'],
    ['grandma', "Then here's Rule Three, sweetheart. Don't stop playing.", 'happy'],
    { journal: "Called Grandma. Rule Three: Don't stop playing." },
    { scene: 'credits', label: 'Rule Three: Don\'t stop playing.' },
  ];
  S.ep_portal = [
    { narrate: "Grandma's box sits by the recycling center, glowing softly. Nobody has recycled it. Nobody ever will." },
    (G) => [CK.travelChoice('Where to?')],
  ];

  // ================================================================ TRAVEL
  CK.travelChoice = function (text) {
    const names = { campus: 'Home (campus)', spring: 'Blossom Hollow (spring)', summer: 'Sunpatch Shores (summer)', fall: 'Amberleaf Woods (fall)', winter: 'Frostfold Peak (winter)' };
    const here = CK.G.chapter;
    const opts = ['spring', 'summer', 'fall', 'winter'].filter((c) => f(c + '_arrived') && c !== here);
    if (ep() && here !== 'campus') opts.unshift('campus');
    const options = opts.map((c) => ({ label: names[c], then: [{ chapter: c, label: names[c].split(' (')[0] }] }));
    options.push({ label: 'Stay here', then: [] });
    return { choice: { who: 'pip', text, options } };
  };

  // ================================================================ SHOP
  class ShopScene {
    constructor() {
      this.transparent = true;
      this.sel = 0;
    }
    items() {
      return Data.shop.concat([{ id: 'leave', name: 'Leave' }]);
    }
    rects() {
      return this.items().map((s, i) => [W / 2 - 230, 150 + i * 56, 460, 48]);
    }
    update() {
      const items = this.items();
      if (Input.hit('up')) { this.sel = (this.sel + items.length - 1) % items.length; CK.Audio.sfx('blip'); }
      if (Input.hit('down')) { this.sel = (this.sel + 1) % items.length; CK.Audio.sfx('blip'); }
      let pick = Input.hit('ok') ? this.sel : -1;
      this.rects().forEach((r, i) => {
        if (Input.mouse.moved && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) this.sel = i;
        if (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) pick = i;
      });
      if (Input.hit('back')) pick = items.length - 1;
      if (pick < 0) return;
      const it = items[pick];
      const G = CK.G;
      if (it.id === 'leave') {
        CK.Audio.sfx('back');
        CK.Scenes.remove(this);
        return;
      }
      if ((it.once && G.items[it.id]) || G.scraps < it.cost) {
        CK.Audio.sfx('error');
        CK.toast(it.once && G.items[it.id] ? 'You already have that!' : `Need ${it.cost - G.scraps} more scraps.`);
        return;
      }
      G.scraps -= it.cost;
      if (it.id === 'juice1') G.snacks += 1;
      else if (it.id === 'juice3') G.snacks += 3;
      else G.items[it.id] = true;
      CK.Audio.sfx('coin');
      CK.toast('Bought: ' + it.name);
    }
    draw(ctx) {
      const G = CK.G;
      ctx.fillStyle = 'rgba(30,15,5,0.6)';
      ctx.fillRect(0, 0, W, H);
      D.panel(ctx, W / 2 - 270, 30, 540, 480, { fill: '#fff4dc' });
      D.text(ctx, "Nib's Swap Shop", W / 2, 76, { size: 28, weight: 700, align: 'center' });
      D.text(ctx, `"Everything's made of something else!"   Scraps: ${G.scraps}   Juice boxes: ${G.snacks}`, W / 2, 108, { size: 14, weight: 600, align: 'center', color: '#7a5434' });
      const items = this.items();
      this.rects().forEach((r, i) => {
        const it = items[i];
        const owned = it.once && G.items[it.id];
        D.button(ctx, ...r, it.id === 'leave' ? 'Leave' : `${it.name}  ·  ${owned ? 'owned' : it.cost + ' scraps'}`, { hover: i === this.sel, size: 17, disabled: it.id !== 'leave' && (owned || G.scraps < it.cost) });
      });
      const it = items[this.sel];
      if (it.desc) D.text(ctx, it.desc, W / 2, 470, { size: 15, weight: 600, align: 'center', color: '#5b3a1e' });
    }
  }
  CK.ShopScene = ShopScene;

  // ================================================================ REGATTA
  // Alternate left/right paddle strokes. A steady rhythm beats frantic mashing:
  // fast taps only give a small push. Leaky hulls fill with water and slow down.
  const HULLS = [
    { id: 'plain', name: 'Plain cardboard', desc: 'Lightest and fastest... until it soaks through.', speed: 1.12, leak: 1 },
    { id: 'tape', name: 'Duct-tape seams', desc: 'Taped seams leak a lot less.', speed: 1.05, leak: 0.45 },
    { id: 'wax', name: "Wax-sealed (Grandma's way)", desc: 'A little heavier, but water slides right off.', speed: 1, leak: 0 },
  ];
  const RACE = 1000;
  class RegattaScene {
    constructor() {
      this.t = 0;
      this.state = 'build';
      this.sel = 2;
      this.finished = false;
      this.parts = new CK.Particles();
      this.rivals = [
        { name: 'S.S. Overthinking', col: '#a68be6', base: 47, x: 0, v: 0, ph: 1 },
        { name: 'Rowing Club (Box Div.)', col: '#ef6b6b', base: 53, x: 0, v: 0, ph: 2 },
        { name: 'The Soggy Biscuit', col: '#ffd25a', base: 59, x: 0, v: 0, ph: 3 },
      ];
      this.me = { x: 0, v: 0, water: 0, last: -9, lastSide: null, stroke: 0, side: 0 };
      this.place = 0;
      this.order = [];
    }
    enter() {
      CK.showTouchPad = false;
      this.prevMusic = [CK.Audio.track, CK.Audio.night];
      CK.Audio.setMusic('battle');
    }
    exit() {
      if (this.prevMusic) CK.Audio.setMusic(this.prevMusic[0], this.prevMusic[1]);
    }
    hullRects() {
      return HULLS.map((h, i) => [W / 2 - 250, 190 + i * 76, 500, 66]);
    }
    stroke(side) {
      const me = this.me;
      const dt = this.t - me.last;
      let boost = dt >= 0.45 ? 40 : 40 * (dt / 0.45) * (dt / 0.45);
      if (me.lastSide === side) boost *= 0.5;
      me.v += boost * this.hull.speed;
      me.last = this.t;
      me.lastSide = side;
      me.stroke = 1;
      me.side = side;
      me.quality = boost / 40;
      CK.Audio.sfx(boost > 30 ? 'splash' : 'blip');
      for (let i = 0; i < 6; i++) this.parts.emit({ x: 200 + (side ? 40 : -40), y: this.laneY(3) + 10, vx: U.rand(-150, -40), vy: U.rand(-120, -30), g: 400, life: 0.6, size: 4, shape: 'drop', color: '#bfe6ff' });
    }
    laneY(i) {
      return 190 + i * 82;
    }
    update(dt) {
      this.t += dt;
      this.parts.update(dt);
      if (this.state === 'build') {
        if (Input.hit('up')) { this.sel = (this.sel + 2) % 3; CK.Audio.sfx('blip'); }
        if (Input.hit('down')) { this.sel = (this.sel + 1) % 3; CK.Audio.sfx('blip'); }
        let pick = Input.hit('ok') ? this.sel : -1;
        this.hullRects().forEach((r, i) => {
          if (Input.mouse.moved && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) this.sel = i;
          if (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) pick = i;
        });
        if (CK.autoSkip) pick = 2;
        if (pick >= 0) {
          this.hull = HULLS[pick];
          this.state = 'count';
          this.countT = 3;
          CK.Audio.sfx('select');
        }
        return;
      }
      if (this.state === 'count') {
        const before = Math.ceil(this.countT);
        this.countT -= dt;
        if (Math.ceil(this.countT) !== before) CK.Audio.sfx(this.countT <= 0 ? 'perfect' : 'blip');
        if (this.countT <= 0) this.state = 'race';
        return;
      }
      if (this.state === 'race') {
        const me = this.me;
        // inputs: solo = alternate left/right (A/D, arrows or click halves); co-op = P1 left, P2 right
        let L = false, R = false;
        if (CK.coop) {
          L = Input.p(0).hit('ok') || Input.p(0).hit('left');
          R = Input.p(1).hit('ok') || Input.p(1).hit('right');
        } else {
          L = Input.hit('left');
          R = Input.hit('right') || Input.hit('ok');
        }
        if (Input.mouse.pressed) (Input.mouse.x < W / 2 ? (L = true) : (R = true));
        if (CK.autoSkip && this.t - me.last >= 0.5) (me.lastSide === 0 ? (R = true) : (L = true));
        if (L) this.stroke(0);
        if (R) this.stroke(1);
        me.stroke = Math.max(0, me.stroke - dt * 3);
        me.water = Math.min(1, me.water + this.hull.leak * dt * 0.05);
        me.v *= Math.exp(-1.2 * dt);
        me.x += me.v * (1 - 0.6 * me.water) * dt;
        for (const r of this.rivals) {
          r.v = r.base * (1 + Math.sin(this.t * 1.3 + r.ph) * 0.12) * Math.min(1, this.t / 2);
          r.x += r.v * dt;
          if (r.x >= RACE && !this.order.includes(r)) this.order.push(r);
        }
        if (me.x >= RACE && !this.order.includes(me)) {
          this.order.push(me);
          this.place = this.order.length;
          this.state = 'done';
          this.doneT = this.t;
          CK.Audio.sfx(this.place === 1 ? 'win' : 'levelup');
          CK.G.flags.regatta_place = this.place;
          if (this.place === 1) this.parts.burst(60, () => ({ x: U.rand(100, 860), y: -10, vx: U.rand(-60, 60), vy: U.rand(80, 220), sway: 30, life: 3, size: U.rand(4, 7), shape: 'square', color: U.pick(['#ef6b6b', '#ffd25a', '#6cc56c', '#5aa9e6', '#ff9ec7']), spin: 5 }));
        }
        return;
      }
      if (this.state === 'done' && this.t - this.doneT > 1 && (Input.hit('ok') || Input.mouse.pressed || CK.autoSkip)) {
        this.state = 'closing';
        CK.flaps(() => {
          this.finished = true;
          CK.Scenes.remove(this);
        });
      }
    }
    drawBoat(ctx, x, y, col, sink, me) {
      const bob = Math.sin(this.t * 4 + x * 0.01) * 3;
      ctx.save();
      ctx.translate(x, y + bob + sink * 18);
      ctx.rotate(Math.sin(this.t * 3 + x) * 0.03);
      D.poly(ctx, [-50, -14, 50, -14, 38, 12, -38, 12], col, D.C.ink, 3);
      D.cardboard(ctx, -30, -24, 60, 12, { r: 3, lw: 2, fill: D.C.card, flute: false });
      if (me) {
        D.char(ctx, 'sam', -8, -12, { s: 0.9, dir: 'right', mood: 'happy', noShadow: true });
        if (CK.coop) D.char(ctx, 'jules', 16, -12, { s: 0.9, dir: 'right', mood: 'happy', noShadow: true });
        ctx.save(); ctx.translate(4, -30); ctx.rotate((this.me.side ? 1 : -1) * (0.3 + this.me.stroke * 0.6));
        D.line(ctx, 0, 0, 0, 44, '#8a5a2e', 4);
        D.ellipse(ctx, 0, 46, 5, 9, '#c99561', D.C.ink, 2);
        ctx.restore();
        if (this.me.water > 0.05) { ctx.globalAlpha = 0.7; D.rr(ctx, -36, 4 - this.me.water * 14, 72, this.me.water * 14, 4); ctx.fillStyle = '#6fc3ff'; ctx.fill(); ctx.globalAlpha = 1; }
      } else {
        D.char(ctx, 'critter', 0, -12, { s: 0.8, species: U.pick(['bunny']), color: '#fff', noShadow: true });
      }
      ctx.restore();
    }
    draw(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#9fdcff');
      g.addColorStop(0.3, '#ffe3f1');
      g.addColorStop(0.31, '#5fd0f5');
      g.addColorStop(1, '#3aa9da');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      // far bank with campus
      ctx.fillStyle = '#9ee07a';
      ctx.fillRect(0, 130, W, 36);
      for (let i = 0; i < 8; i++) D.cardboard(ctx, i * 130 + ((this.me.x * -0.1) % 130), 70, 90, 64, { r: 3, lw: 3, fill: ['#b9674a', '#8a8f9e', '#c9a77a'][i % 3], flute: false });
      // lane ripples scroll with you
      const cam = Math.max(0, this.me.x - 160);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 40; i++) {
        const x = ((U.hash(i, 1) * 1400 - cam * 0.9) % 1100 + 1100) % 1100 - 70, y = 175 + U.hash(i, 2) * 360;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 10, y - 4, x + 20, y); ctx.stroke();
      }
      // finish line
      const fx = 200 + (RACE - this.me.x) * 0.9;
      if (fx < W + 40) {
        for (let i = 0; i < 18; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#3d2412'; ctx.fillRect(fx, 160 + i * 21, 12, 21); }
        D.text(ctx, 'FINISH', fx + 6, 156, { size: 18, weight: 700, align: 'center', color: '#fff', outline: D.C.ink });
      }
      this.rivals.forEach((r, i) => {
        const x = 200 + (r.x - this.me.x) * 0.9;
        this.drawBoat(ctx, x, this.laneY(i), r.col, 0, false);
        if (x > -60 && x < W + 60) D.text(ctx, r.name, x, this.laneY(i) - 44, { size: 13, weight: 700, align: 'center', color: '#fff', outline: D.C.ink, ow: 3 });
      });
      this.drawBoat(ctx, 200, this.laneY(3), '#c99561', this.me.water, true);
      this.parts.draw(ctx);
      // progress bar
      D.panel(ctx, 20, 12, W - 40, 44, { tape: false, fill: '#fff4dc' });
      D.text(ctx, 'Cardboard Boat Regatta', 36, 40, { size: 18, weight: 700 });
      const bx = 280, bw = W - 340;
      D.rr(ctx, bx, 26, bw, 14, 7); ctx.fillStyle = '#d9c3a3'; ctx.fill();
      for (const r of this.rivals) D.circle(ctx, bx + bw * Math.min(1, r.x / RACE), 33, 7, r.col, D.C.ink, 2);
      D.circle(ctx, bx + bw * Math.min(1, this.me.x / RACE), 33, 9, '#6c8ed8', D.C.ink, 2);
      if (this.state === 'build') {
        ctx.fillStyle = 'rgba(20,30,50,0.45)';
        ctx.fillRect(0, 0, W, H);
        D.panel(ctx, W / 2 - 290, 100, 580, 380, { fill: '#fff4dc' });
        D.text(ctx, 'Build your boat', W / 2, 146, { size: 28, weight: 700, align: 'center' });
        D.text(ctx, 'Water is the enemy of cardboard. Choose your hull.', W / 2, 172, { size: 15, align: 'center', color: '#7a5434' });
        this.hullRects().forEach((r, i) => {
          D.button(ctx, ...r, '', { hover: i === this.sel, size: 17 });
          D.text(ctx, HULLS[i].name, r[0] + 20, r[1] + 28, { size: 18, weight: 700 });
          D.text(ctx, HULLS[i].desc, r[0] + 20, r[1] + 50, { size: 14, weight: 500, color: '#7a5434' });
        });
      } else if (this.state === 'count') {
        D.text(ctx, this.countT > 0 ? '' + Math.ceil(this.countT) : 'GO!', W / 2, H / 2, { size: 90, weight: 700, align: 'center', color: '#fff', outline: D.C.ink, ow: 10 });
        D.text(ctx, CK.coop ? 'P1 (Space) and P2 (Enter) take turns paddling. Steady rhythm wins!' : 'Alternate LEFT and RIGHT to paddle. A steady rhythm beats mashing!', W / 2, H / 2 + 60, { size: 18, weight: 700, align: 'center', color: '#fff', outline: D.C.ink });
      } else if (this.state === 'race') {
        // rhythm meter: green zone = a full-power stroke
        const since = Math.min(1.2, this.t - this.me.last);
        D.panel(ctx, W / 2 - 160, H - 66, 320, 52, { tape: false, fill: '#fff4dc' });
        D.rr(ctx, W / 2 - 140, H - 50, 280, 12, 6); ctx.fillStyle = '#d9c3a3'; ctx.fill();
        D.rr(ctx, W / 2 - 140 + 280 * (0.45 / 1.2), H - 50, 280 * (0.4 / 1.2), 12, 6); ctx.fillStyle = '#8fd08a'; ctx.fill();
        D.line(ctx, W / 2 - 140 + 280 * (since / 1.2), H - 56, W / 2 - 140 + 280 * (since / 1.2), H - 32, D.C.ink, 4);
        D.text(ctx, (CK.coop ? (this.me.lastSide === 0 ? 'P2 next!' : 'P1 next!') : this.me.lastSide === 0 ? 'RIGHT next' : 'LEFT next') + '  ·  stroke in the green', W / 2, H - 22, { size: 12, weight: 700, align: 'center', color: '#5b3a1e' });
        if (this.hull.leak > 0 && this.me.water > 0.2) D.text(ctx, 'Your hull is soaking through!', 200, this.laneY(3) + 52, { size: 14, weight: 700, align: 'center', color: '#fff', outline: '#2f7fd0' });
      } else {
        ctx.fillStyle = 'rgba(20,30,50,0.4)';
        ctx.fillRect(0, 0, W, H);
        D.panel(ctx, W / 2 - 220, 170, 440, 180, { fill: '#fff4dc' });
        D.text(ctx, this.place === 1 ? '1st place!' : ['', '', '2nd place!', '3rd place!', '4th place!'][this.place], W / 2, 230, { size: 40, weight: 700, align: 'center', color: this.place === 1 ? '#c2410c' : '#3d2412' });
        D.text(ctx, this.hull.leak ? `Hull: ${this.hull.name}. ${Math.round(this.me.water * 100)}% soaked.` : 'Wax-sealed hull: bone dry!', W / 2, 270, { size: 16, align: 'center', color: '#7a5434' });
        if (this.t - this.doneT > 1) D.text(ctx, 'Click / Z to continue', W / 2, 320, { size: 14, align: 'center', color: '#7a5434' });
      }
    }
  }
  CK.RegattaScene = RegattaScene;
  CK.startRegatta = function () {
    const r = new RegattaScene();
    const handle = { finished: false };
    CK.flaps(() => CK.Scenes.push(r), { label: 'Regatta time!' });
    CK.co(function* () {
      yield () => r.finished;
      handle.place = r.place;
      handle.finished = true;
    });
    return handle;
  };
})();
