// Cardboard Kingdom - Chapter 7: Paper Birds.
// A summer weekend at Grandma Rosie's house in Riverbend. The attic is full of Dust Bunnies,
// a paper bird comes home, a rook with a clipboard finds a new job, and Sam finishes the
// footbridge Grandma started when she was eleven: a stone arch shaped by a hanging chain.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input, Data = CK.Data;
  const W = CK.W, H = CK.H, TS = 48;
  const f = (k) => CK.flag(k);
  const S = CK.Story.scripts;

  // ================================================================ DATA
  Data.seasons.riverbend = {
    name: 'Summer', ground: '#a6d97a', ground2: '#98cd6c', path: '#eed7a4', sand: '#f3dfa8', water: '#6cc6e0', waterD: '#3e9fc4',
    sky: ['#a8e0ff', '#fff0c8'], night: ['#1b2350', '#4a3366'], tree: 'oak', particle: 'sparkle',
  };
  Object.assign(Data.speakers, {
    rook: { name: 'Mortimer Rook', look: 'rook', ps: 2.2, py: 20, bg: '#ece4d2' },
    dust: { name: 'Dust Bunny', look: 'dust', ps: 2.6, py: -8, bg: '#ece8f4' },
    delgado: { name: 'Mr. Delgado', look: 'human', ps: 2.1, py: 26, bg: '#e6efe0', o: { adult: true, hair: '#cfcfcf', style: 'side', beard: true, top: '#6a8aa8', skin: '#c98e62', glasses: true } },
    tess: { name: 'Tess', look: 'human', ps: 2.3, py: 20, bg: '#fff0d6', o: { hair: '#e0a040', style: 'puff', top: '#ef6b6b', skin: '#f2c9a0' } },
  });
  Data.enemies.dust = {
    name: 'Dust Bunny', hp: 30, atk: 8, def: 0, xp: 7, scraps: 4, draw: 'dust',
    moves: [{ name: 'Fluff Pounce', power: 1, w: 3 }, { name: 'Big Sneeze', power: 0.7, all: true, w: 1 }],
  };
  Data.enemies.rook = {
    name: 'Mortimer Rook', hp: 240, atk: 11, def: 2, xp: 60, scraps: 40, draw: 'rook', boss: true,
    moves: [{ name: 'Red Tape', power: 0.7, all: true, w: 2, drain: true }, { name: 'Toll, Please', power: 1.35, w: 2 }, { name: 'Call the Committee', summon: 'magpie', w: 1 }],
  };
  Data.battles.rb_attic = { enemies: ['dust', 'dust', 'dust'], season: 'riverbend', bg: 'attic' };
  Data.battles.rb_rook = { enemies: ['magpie', 'rook', 'magpie'], season: 'riverbend', boss: true, music: 'boss' };

  // ================================================================ MAP
  const house = () => (!f('rb_grandma')
    ? [{ narrate: "Grandma's house: yellow siding, a porch swing, and three cats' worth of cushions. Better say hi to Grandma first. She's on the porch." }]
    : !f('rb_attic') ? 'rb_attic'
      : [{ narrate: U.pick(['The kitchen smells like lemon cookies. There is a plate with a note: FOR THE BUILDER (AND FRIENDS).', 'The attic ladder is folded up neatly. Somebody has dusted. Somebody small and fluffy.', 'Grandma\'s fridge is covered in drawings. One of them is yours, from when you were eight. It is a castle.']) }]);
  CK.Chapters.riverbend = {
    id: 'riverbend', name: 'Riverbend', w: 40, h: 24, season: 'riverbend', music: 'summer',
    start: [3, 12], noFollowers: true, noFlood: true,
    swaps: [{ flag: 'rb_arch', from: 'B', to: 'b' }],
    build(m) {
      m.scatter(',', 0.12, 71);
      m.river([[21, -1], [21, 6], [20, 12], [21, 18], [22, 25]], 1, '~');
      m.path([[1, 12], [38, 12]], '=', 'B');
      m.path([[9, 12], [9, 11]], '=');
      m.path([[30, 12], [30, 10]], '=');
      m.path([[27, 12], [27, 17], [33, 17]], '=');
      m.scatter('T', 0.05, 72);
      m.scatter('R', 0.008, 73);
      m.border('T');
    },
    post(m) {
      for (const o of this.objects) if (o.type === 'building') m.rect(o.x - Math.floor(o.bw / 2), o.y - o.bh + 1, o.bw, o.bh + 1, '.');
      for (const o of this.objects) if (o.type !== 'building' && o.type !== 'trigger' && m.get(o.x, o.y) !== '=' && !'~bB'.includes(m.get(o.x, o.y))) m.set(o.x, o.y, '.');
      m.rect(2, 13, 9, 5, '.');
      m.rect(28, 6, 8, 4, '.');
      m.rect(16, 10, 3, 5, '.');
      m.rect(1, 11, 3, 3, '.');
      m.rect(1, 12, 3, 1, '=');
    },
    objects: [
      { type: 'building', id: 'rosie', x: 9, y: 10, bw: 6, bh: 5, label: "Rosie's House", color: '#f2d27a', roof: '#c25b4a', door: 'Go in', style: 'cottage', script: house },
      { type: 'deco', kind: 'busstop', x: 2, y: 11, label: 'Bus', script: 'rb_bus' },
      { type: 'deco', kind: 'veggies', x: 4, y: 15 },
      { type: 'deco', kind: 'mailbox', x: 12, y: 11 },
      { type: 'sign', x: 15, y: 11, text: 'Willow Creek Footbridge. CLOSED (storm damage). Please use the highway bridge, 4 miles south.' },
      { type: 'cat', x: 13, y: 15 },
      // people
      { type: 'npc', id: 'grandma_porch', x: 7, y: 11, look: 'grandma', talk: () => (f('rb_grandma') ? 'rb_grandma_again' : 'rb_grandma'), cond: () => !f('rb_rook') },
      { type: 'npc', id: 'grandma_creek', x: 17, y: 11, look: 'grandma', talk: 'rb_grandma_creek', cond: () => f('rb_rook') && !f('rb_done') },
      { type: 'npc', id: 'grandma_garden', x: 31, y: 8, look: 'grandma', o: { mood: 'happy' }, talk: 'rb_grandma_after', cond: () => f('rb_done') },
      { type: 'npc', id: 'delgado', x: 14, y: 14, look: 'human', o: { adult: true, hair: '#cfcfcf', style: 'side', beard: true, top: '#6a8aa8', skin: '#c98e62', glasses: true }, talk: 'rb_delgado' },
      { type: 'npc', id: 'corvin_rb', x: 4, y: 13, look: 'magpie', o: { big: true, s: 0.8 }, talk: () => (f('rb_corvin') ? 'rb_corvin_again' : 'rb_corvin'), cond: () => f('rb_attic') && !f('rb_done') },
      { type: 'npc', id: 'corvin_home', x: 30, y: 8, look: 'magpie', o: { big: true, s: 0.7, mood: 'happy' }, talk: 'rb_corvin_after', cond: () => f('rb_done') },
      { type: 'npc', id: 'dust1', x: 6, y: 16, look: 'dust', o: { s: 0.7, mood: 'happy' }, talk: 'rb_dust_talk', cond: () => f('rb_attic') },
      { type: 'npc', id: 'dust2', x: 8, y: 16, look: 'dust', o: { s: 0.6, mood: 'happy', seed: 4 }, talk: 'rb_dust_talk2', cond: () => f('rb_attic') },
      { type: 'enemy', id: 'rb_rook', x: 18, y: 12, look: 'rook', battle: 'rb_rook', patrol: [[18, 12], [18, 13], [17, 13], [17, 12]], cond: () => f('rb_corvin') && !f('rb_rook') },
      { type: 'deco', kind: 'planks', x: 17, y: 14, cond: () => !f('rb_rook') },
      { type: 'site', id: 'rb_site', x: 18, y: 14, script: 'rb_site', cond: () => f('rb_rook') && !f('rb_arch') },
      { type: 'npc', id: 'rook_wait', x: 16, y: 14, look: 'rook', o: { mood: 'happy' }, talk: 'rb_rook_wait', cond: () => f('rb_rook') && !f('rb_arch') },
      { type: 'npc', id: 'rook_insp', x: 24, y: 11, look: 'rook', o: { mood: 'happy' }, talk: 'rb_rook_inspector', cond: () => f('rb_arch') },
      // across the creek: the town square and the community garden
      { type: 'deco', kind: 'veggies', x: 29, y: 7, o: { big: true } },
      { type: 'deco', kind: 'models', x: 33, y: 7, cond: () => f('rb_done') },
      { type: 'deco', kind: 'birdbath', x: 35, y: 14 },
      { type: 'stand', x: 25, y: 15, color: '#ffd25a', drink: 'lemonade', who: 'tess', line: "Lemonade's a quarter. For bridge builders it's free. Grandma Rosie's orders." },
      { type: 'npc', id: 'tess', x: 26, y: 14, look: 'human', o: { hair: '#e0a040', style: 'puff', top: '#ef6b6b', skin: '#f2c9a0' }, talk: 'rb_tess' },
      { type: 'bench', x: 34, y: 11 },
      { type: 'campfire', x: 31, y: 16 },
      { type: 'chest', id: 'rb_chest', x: 37, y: 20, script: [{ narrate: "A tackle box someone left by the creek. Inside: a pair of old drafting compasses with R.R. scratched on them." }, { scraps: 15 }] },
      { type: 'trigger', id: 'rb_done_go', x: 28, y: 6, w: 7, h: 5, script: 'rb_done', cond: () => f('rb_arch') && !f('rb_done') },
    ],
    objective(G) {
      if (!f('rb_grandma')) return "Visit Grandma Rosie (she's on her porch)";
      if (!f('rb_attic')) return "Fetch Grandma's toolbox from the attic (go inside)";
      if (!f('rb_corvin')) return 'Something silver is tapping at the window. Look by the garden';
      if (!f('rb_rook')) return 'Talk some sense into Mortimer Rook (by the creek)';
      if (!f('rb_arch')) return 'Design the stone arch (blueprint by the creek)';
      if (!f('rb_done')) return 'Walk across to the community garden';
      return 'Free roam! The bus back to campus is by the road (west).';
    },
  };

  // the bus stop on campus, once the town meeting is won
  const campus = CK.Chapters.campus;
  campus.objects.push({ type: 'deco', kind: 'busstop', x: 3, y: 13, label: 'Bus', script: 'rb_bus_go', cond: () => f('st_townhall') });
  const campusObjective = campus.objective;
  campus.objective = function (G) {
    if (f('st_townhall') && !f('rb_done')) return "Take the bus to Grandma's house in Riverbend (bus stop, west end of the path)";
    return campusObjective.call(this, G);
  };
  const campusPost = campus.post;
  campus.post = function (m) {
    campusPost.call(this, m);
    m.set(3, 13, '.');
  };
  CK.DECO_FOOT.busstop = [0.15, 0.2, 0.7, 0.5];
  CK.DECO_FOOT.models = [-1, -0.4, 2.6, 0.9];

  // ================================================================ SCRIPTS
  S.rb_bus_go = [
    { narrate: 'The 4:15 to Riverbend. Two hours, one transfer, and a driver who hums the whole way.' },
    { chapter: 'riverbend', label: 'Riverbend, early summer...' },
  ];
  S.rb_bus = [
    { if: () => !f('rb_done'), then: [['pip', "Not yet! Grandma's still waiting on us.", 'happy']] },
    { narrate: 'The bus back to campus. Grandma waves from the porch until you are out of sight.' },
    { chapter: 'campus', label: 'Back to Riverside...' },
  ];

  S.riverbend_intro = [
    { card: { title: 'Chapter 7', sub: 'Paper Birds' } },
    { narrate: "Summer. Sam's new job starts Monday: building rain gardens with Dr. Okafor's crew. First, a weekend at Grandma Rosie's." },
    { narrate: 'Riverbend has one road, one general store, one creek, and more birds than people.' },
    ['pip', "Is this where Grandma lives? It's so GREEN. And nobody is trying to flood anything!", 'happy'],
    ['sam', 'Pip, back in the pocket. People here have never seen a talking paper crane.', 'happy'],
    ['pip', "It's not a pocket, it's my office.", 'happy'],
    { coop: [
      ['jules', 'Your grandma has a PORCH SWING. And a CREEK. Sam, why have you never brought me here?', 'happy'],
      ['sam', 'Because you would never leave.', 'happy'],
    ] },
    { journal: "Took the bus to Grandma Rosie's house in Riverbend for the weekend." },
  ];

  S.rb_grandma = [
    ['grandma', 'There she is... there THEY are. My builder!', 'happy'],
    { narrate: 'Grandma Rosie smells like sawdust and lemon cookies. She is shorter than you remember. Her hug is exactly the same.' },
    ['grandma', 'Dr. Okafor called me. She says you stood up in front of the whole town with NUMBERS.', 'happy'],
    ['sam', 'I used your spillway. And your journal. I even added a rule. Rule Four: leave room for the rain.', 'happy'],
    ['grandma', "Leave room for the rain. Oh, that's good. That's better than any of mine.", 'happy'],
    ['pip', 'Hello, Grandma Rosie!', 'happy'],
    { narrate: 'Pip pops out of your pocket before you can stop it. Grandma does not even blink.' },
    ['grandma', "Hello, Pip. You've gotten taller.", 'happy'],
    ['sam', 'You can SEE him?', 'shock'],
    ['grandma', 'Sweetheart, who do you think showed an eight-year-old how to fold a crane?', 'happy'],
    { coop: [['jules', 'I have so many questions and I am going to ask none of them.', 'shock']] },
    ['grandma', "Now. I could use an engineer. The storm took out the footbridge over Willow Creek, and the community garden is on the other side. My tomatoes are over there, and these knees don't do creeks.", 'sad'],
    ['grandma', "Also, something's been rustling in the attic at night. Rustling and sort of... sighing. Probably raccoons.", 'sad'],
    ['pip', 'Probably!', 'shock'],
    ['grandma', "My old toolbox is up there. Bring it down and we'll take a look at that bridge together.", 'happy'],
    { flag: 'rb_grandma' },
    { journal: "Grandma can see Pip. She always could. The footbridge to her garden washed out, and something is rustling in her attic." },
  ];
  S.rb_grandma_again = [() => [
    !f('rb_attic') ? ['grandma', 'The attic ladder is at the end of the hall. Mind the third rung.', 'happy']
      : !f('rb_corvin') ? ['grandma', "Did you hear that tapping? Something's at the window by the garden.", 'shock']
        : ['grandma', "Mortimer Rook. Corvin's told me all about him. Go and talk to him, sweetheart. Gently.", 'happy'],
  ]];

  S.rb_attic = [
    { night: true, label: 'By the time you find the attic ladder, the sun has gone down...' },
    { narrate: 'The attic. Boxes up to the rafters, each one labeled in Grandma\'s neat capitals. Moonlight through one round window.' },
    { narrate: 'Something moves behind the boxes. Lots of somethings. Small, round, and glowing.' },
    ['corry', 'Builder! I am awake! I unfolded in your backpack when it got dark. Stand behind me!', 'shock'],
    { battle: 'rb_attic' },
    { narrate: 'The fluffballs stop. One sneezes. They all look extremely embarrassed.' },
    ['dust', 'Sorry. Sorry. We did not mean the pouncing. Nobody comes up here. Not for years and years.', 'sad'],
    ['dust', "Dust gathers where nobody visits. So we gathered. We just wanted somebody to open the boxes.", 'sad'],
    { narrate: "You open the biggest box. ROSIE · KINGDOM · 1971." },
    { narrate: 'Inside: a cardboard castle the size of a loaf of bread. A cardboard village. A river made of blue tape. And a popsicle-stick footbridge, snapped in half.' },
    { narrate: 'Under it, a notebook. The first page says: "Willow Creek Footbridge. Design by Rosalind Reyes, age 11."' },
    ['pip', "Sam. That's the Kingdom. The FIRST one. Before yours.", 'shock'],
    ['dust', 'We are the dust of the first Kingdom. We remember all of it. We remember her crying when the bridge broke.', 'sad'],
    ['corry', 'Then we shall bring her toolbox AND her bridge. A knight never leaves a job half done.', 'happy'],
    { narrate: 'Tap. Tap. Tap. Something silver is tapping on the round window. Then it flutters down toward the garden.' },
    { flag: 'rb_attic' },
    { fn: () => { if (CK.OW) CK.OW.buildEntities(); } },
    { journal: "The attic Dust Bunnies were lonely, not scary. Found Grandma's 1971 Kingdom box and her first bridge design, from when she was 11." },
    { save: true },
  ];
  S.rb_dust_talk = [() => [f('rb_done')
    ? ['dust', 'Grandma set up the old Kingdom in the garden! We get sun now. Sun is very nice for dust.', 'happy']
    : ['dust', 'We came outside! It is very big outside. We are going to sit right here, in case anybody visits.', 'happy']]];
  S.rb_dust_talk2 = [['dust', '*tiny sneeze* ...that means hello.', 'happy']];

  S.rb_corvin = [
    { narrate: 'On the garden fence sits a small silver bird with a gum-wrapper shine, a tailcoat, and round spectacles.' },
    ['corvin', 'Hello, Builder. I came through your box. I owed someone an apology, and it has taken me fifty years to be brave enough.', 'sad'],
    { npc: { id: 'grandma_porch', x: 5, y: 12 } },
    ['grandma', 'Corvin? My little gum-wrapper bird?', 'shock'],
    ['corvin', 'You folded me the day your footbridge washed away. You were eleven, and crying, and you said: keep my ideas safe until I am brave enough to try again.', 'sad'],
    ['corvin', 'So I kept them safe. Then I kept them locked up. Then I kept everybody\'s ideas locked up. Then I started a society for it. With pins.', 'sad'],
    ['grandma', "Oh, Corvin. Ideas aren't for keeping safe. They're for giving away.", 'sad'],
    ['grandma', "And I never did try again, did I? I built a hundred bridges for other people and never fixed my own.", 'sad'],
    ['corvin', 'There is one more thing. Mortimer Rook, my old second-in-command, followed me through the box. He did not take the reforms well.', 'sad'],
    ['corvin', 'He has claimed the creek and taken all the planks. He says the Society will build a TOLL bridge. One shiny thing per crossing.', 'sad'],
    ['sam', 'A toll bridge. Over my grandma\'s creek.', 'shock'],
    ['corvin', 'He is not wicked, Builder. He is just very fond of rules. And very afraid of not mattering.', 'sad'],
    { flag: 'rb_corvin' },
    { npc: { id: 'grandma_porch', x: 7, y: 11 } },
    { fn: () => { if (CK.OW) CK.OW.buildEntities(); } },
    { journal: 'Corvin came home. Grandma folded him the day her first bridge washed out. Now Mortimer Rook is guarding the creek for a toll bridge.' },
  ];
  S.rb_corvin_again = [['corvin', 'Mortimer is by the creek. He will be holding a clipboard. He is always holding a clipboard.', 'sad']];

  S.after_rb_rook = [
    { narrate: 'The two Quill agents flutter off to roost on the mailbox. Mortimer Rook straightens his bow tie, which is the most upset a rook can look.' },
    ['rook', 'Do you know what I was, in the Society? Assistant Deputy Keeper of the Minutes. Forty years. Every meeting.', 'sad'],
    ['rook', 'Then the Magister said: no more Society. No more meetings. No more minutes. What am I, without the minutes?', 'sad'],
    { npc: { id: 'grandma_creek', x: 16, y: 12 } },
    ['grandma', 'Mr. Rook. How do you feel about inspecting things?', 'happy'],
    ['rook', 'Inspecting... things?', 'shock'],
    ['grandma', "Every good bridge needs an inspector. Somebody who checks every stone and won't let anybody cut corners.", 'happy'],
    ['rook', 'I have a clipboard.', 'shock'],
    ['grandma', 'I noticed.', 'happy'],
    { narrate: "Sam looks at Rook's pile of planks. They're soggy and warped from the storm." },
    ['sam', 'These are ruined. Wood just washes away.', 'sad'],
    ['grandma', 'Then we build it the way the Romans did. Stone. An arch.', 'happy'],
    ['grandma', "Here's a trick my teacher showed me. Hang a chain between two nails. Whatever shape it sags into, flip it upside down. That arch will stand all by itself.", 'happy'],
    ['rook', 'Regulation 12-B: every bridge must have flowers. I will be requiring a planter. A large one.', 'happy'],
    { night: false, label: 'Morning...' },
    { narrate: 'Everyone gathers at the creek: Grandma in her garden hat, Corvin on her shoulder, a row of dust bunnies, and one very serious rook with a clipboard.' },
    { flag: 'rb_rook' },
    { fn: () => { if (CK.OW) CK.OW.buildEntities(); } },
    { journal: 'Mortimer Rook is the new Willow Creek Bridge Inspector. The planks are ruined, so we are building a stone arch, shaped like a hanging chain.' },
    { save: true },
  ];
  S.rb_rook_wait = [['rook', 'I am ready to inspect. I have sharpened my pencil. Twice.', 'happy']];
  S.rb_grandma_creek = [['grandma', 'The blueprint table is right there by the bank. Six joints, one flood line, and one very large planter.', 'happy']];

  S.rb_site = [
    ['grandma', 'Raise or lower each joint. The top has to clear the storm flood line, and the push has to stay inside the stones all the way across.', 'happy'],
    ['grandma', 'And if you get stuck: hang the chain.', 'happy'],
    { puzzle: 'willow_arch' },
    { narrate: 'Stone by stone, the arch goes up. The dust bunnies roll the mortar. Corry carries the big stones. Pip directs traffic from Grandma\'s hat.' },
    { narrate: 'The last stone, the keystone, slides in. Everyone holds their breath while Grandma knocks out the wooden form underneath.' },
    { shake: 4 },
    { narrate: 'It holds.' },
    { sfx: 'chest' },
    ['rook', 'Inspected. Approved. STAMPED.', 'happy'],
    ['grandma', 'Fifty-two years late. Right on time.', 'happy'],
    ['grandma', 'Rule Five, Sam. An arch stands because every stone leans on the next one. Nobody holds the whole bridge up alone.', 'happy'],
    ['sam', 'Not even you?', 'happy'],
    ['grandma', 'ESPECIALLY not me.', 'happy'],
    { flag: 'rb_arch' },
    { fn: () => { if (CK.OW) CK.OW.refresh(); } },
    { journal: 'Built the Willow Creek Arch. Rule Five: an arch stands because every stone leans on the next one.' },
    { save: true },
  ];

  S.rb_done = [
    { npc: { id: 'grandma_creek', x: 30, y: 9 } },
    { narrate: 'Grandma crosses the arch slowly, one hand on the rail, and walks straight to her garden plot. She picks the first ripe tomato of the summer and hands it to you.' },
    ['grandma', 'You know what I wanted when I was your age? I wanted somebody to tell me what I was supposed to be.', 'happy'],
    ['grandma', "Turns out nobody tells you. You build it. One stone at a time, leaning on the people next to you.", 'happy'],
    { narrate: 'She gives you the 1971 notebook. Under "Design by Rosalind Reyes, age 11" she has added, in fresh ink: "Finished by Sam, and friends."' },
    ['sam', 'Grandma...', 'sad'],
    ['grandma', 'It was always meant for you, sweetheart.', 'happy'],
    { coop: [['jules', "I'm not crying. The creek is just very... humid.", 'sad']] },
    ['corvin', 'Rosalind. Might I stay? There is a windowsill here with an excellent view of the tomatoes.', 'sad'],
    ['grandma', 'You might.', 'happy'],
    { scraps: 40 },
    { flag: 'rb_done' },
    { fn: () => { if (CK.OW) CK.OW.buildEntities(); } },
    { card: { title: 'Chapter 7 complete', sub: 'Rule Five: every stone leans on the next one.', dur: 3.2 } },
    { journal: 'Grandma gave me her 1971 notebook: "Finished by Sam, and friends." Corvin is staying with her. The dust bunnies got the old Kingdom set up in the garden, in the sun.' },
    { save: true },
  ];
  S.rb_grandma_after = [() => [U.pick([
    ['grandma', "Tomatoes, beans, and one zucchini that's gotten completely out of hand. Take some back to Jules.", 'happy'],
    ['grandma', "Mortimer inspected my garden hose this morning. Approved, with notes.", 'happy'],
    ['grandma', "I'm going to start a little building club down at the library. Kids, cardboard, tape. Want to teach the first one?", 'happy'],
  ])]];
  S.rb_corvin_after = [['corvin', 'I have taken up origami. I fold a new bird every morning and give it away. It is very freeing.', 'happy']];
  S.rb_rook_inspector = [() => [U.pick([
    ['rook', 'Arch: sound. Keystone: snug. Planter: magnificent. Approved.', 'happy'],
    ['rook', 'I have written minutes for the bridge opening. Forty-one pages. Would you like a copy?', 'happy'],
    ['rook', 'The Magister brought me a cup of tea this morning. We have never had tea together before. It was adequate. It was nice.', 'happy'],
  ])]];
  S.rb_delgado = [() => [f('rb_arch')
    ? ['delgado', "Well, I'll be. A stone arch, in Riverbend. My grandkids are going to fish off that thing for fifty years.", 'happy']
    : ['delgado', "Rosie's grandkid! She talks about you every Sunday. Engineer, she says. Builder. She's very proud.", 'happy']]];
  S.rb_tess = [() => [f('rb_arch')
    ? ['tess', 'I crossed the new bridge eleven times today. I am going for twenty.', 'happy']
    : ['tess', "There's a bird on the creek who keeps saying everything needs a permit. He's very polite about it.", 'shock']]];

  // ================================================================ PROPS
  Object.assign(CK.DecoDraw, {
    busstop(ctx, e, x, y) {
      D.shadow(ctx, x + 8, y, 26, 6);
      D.box3(ctx, x - 22, y - 18, 40, 10, 10, { r: 2, lw: 2.5, fill: '#5a8ab8', flute: false });
      for (const k of [-1, 1]) D.line(ctx, x + k * 16, y - 8, x + k * 16, y, D.C.ink, 3);
      D.line(ctx, x + 22, y, x + 22, y - 64, D.C.ink, 4);
      D.ball(ctx, x + 22, y - 70, 12, '#ef6b6b', { lw: 2.5 });
      D.text(ctx, 'BUS', x + 22, y - 66, { size: 10, weight: 700, align: 'center', color: '#fff' });
    },
    mailbox(ctx, e, x, y) {
      D.shadow(ctx, x, y, 12, 4);
      D.line(ctx, x, y, x, y - 26, '#8a5a2e', 5);
      D.box3(ctx, x - 12, y - 42, 22, 14, 8, { r: 6, lw: 2.5, fill: '#5aa9e6', flute: false });
      D.line(ctx, x + 10, y - 44, x + 10, y - 54, D.C.ink, 2);
      D.poly(ctx, [x + 10, y - 54, x + 18, y - 51, x + 10, y - 48], '#ef6b6b', D.C.ink, 1.5);
    },
    veggies(ctx, e, x, y) {
      const big = e.o && e.o.big;
      const w = big ? 150 : 110, h = big ? 64 : 52;
      D.box3(ctx, x - w / 2, y - h + 10, w, h, 8, { r: 3, lw: 2.5, fill: '#8a5a3a', top: '#a87048', flute: false });
      for (let r = 0; r < 2; r++) for (let i = 0; i < (big ? 6 : 4); i++) {
        const px = x - w / 2 + 16 + i * 24, py = y - h + 26 + r * 22;
        D.line(ctx, px, py, px, py - 18, '#8a6a3a', 2);
        D.egg(ctx, px - 3, py - 8, 7, 6, '#5fae4a', { lw: 1.4 });
        if ((i + r) % 2 === 0) D.ball(ctx, px + 4, py - 6, 4, '#ef5b4b', { lw: 1.2 });
      }
    },
    planks(ctx, e, x, y) {
      D.shadow(ctx, x + 4, y, 30, 6);
      for (let i = 0; i < 4; i++) {
        ctx.save(); ctx.translate(x, y - 6 - i * 7); ctx.rotate((i % 2 ? 0.08 : -0.06));
        D.box3(ctx, -28, -4, 56, 7, 5, { r: 1, lw: 2, fill: i % 2 ? '#9a7a5a' : '#8a6a4a', flute: false });
        ctx.restore();
      }
      D.circle(ctx, x + 14, y - 34, 3, '#c9d3e0', D.C.ink, 1);
      D.circle(ctx, x + 6, y - 36, 3, '#c9d3e0', D.C.ink, 1);
    },
    birdbath(ctx, e, x, y) {
      D.shadow(ctx, x, y, 18, 5);
      D.box3(ctx, x - 5, y - 30, 10, 30, 5, { r: 2, lw: 2, fill: '#c8c2b8', flute: false });
      D.egg(ctx, x + 2, y - 34, 22, 7, '#d8d2c8', { lw: 2 });
      D.ellipse(ctx, x + 2, y - 35, 16, 4, '#8fd6f0');
      const hop = Math.abs(Math.sin(this.t * 4)) * 3;
      D.char(ctx, 'critter', x + 12, y - 36 - hop, { s: 0.45, species: 'robin', color: '#9a6a4a', noShadow: true });
    },
    models(ctx, e, x, y) {
      // Grandma's 1971 cardboard Kingdom, set up in the sun
      D.shadow(ctx, x + 20, y + 4, 70, 10);
      D.box3(ctx, x - 50, y - 10, 120, 14, 14, { r: 2, lw: 2.5, fill: '#c9925a' });
      D.box3(ctx, x - 40, y - 46, 30, 36, 12, { r: 2, lw: 2, fill: '#d9a66b' });
      for (let i = 0; i < 3; i++) D.box3(ctx, x - 42 + i * 11, y - 54, 8, 8, 4, { r: 1, lw: 1.5, fill: '#d9a66b', flute: false });
      D.line(ctx, x - 25, y - 54, x - 25, y - 66, D.C.ink, 1.5);
      D.poly(ctx, [x - 25, y - 66, x - 15, y - 63, x - 25, y - 60], '#ef6b6b', D.C.ink, 1);
      for (let i = 0; i < 3; i++) {
        D.box3(ctx, x + 2 + i * 20, y - 26, 14, 16, 8, { r: 1, lw: 1.8, fill: ['#ecc38c', '#d9a66b', '#c99561'][i], flute: false });
        D.poly(ctx, [x + 1 + i * 20, y - 26, x + 9 + i * 20, y - 34, x + 17 + i * 20, y - 26], ['#ff8fb1', '#5aa9e6', '#ffd25a'][i], D.C.ink, 1.5);
      }
      D.rr(ctx, x - 48, y - 6, 116, 5, 2); ctx.fillStyle = '#5aa9e6'; ctx.fill();
    },
  });

  // Grandma's cottage: clapboard walls, a pitched roof, a porch with a swing, and flower boxes
  CK.BuildingDraw.cottage = function (ctx, e, x, y) {
    const bw = e.bw * TS, x0 = x - bw / 2, base = y + TS * 0.25;
    const wallH = 120, top = base - wallH, night = this.night;
    D.shadow(ctx, x + 18, base + 6, bw / 2 + 22, 18, 0.32);
    D.box3(ctx, x0, top, bw, wallH, 30, { r: 2, lw: 4, fill: e.color, flute: false, noTop: true });
    ctx.strokeStyle = 'rgba(120,80,20,.18)'; ctx.lineWidth = 2;
    for (let yy = top + 12; yy < base - 4; yy += 11) { ctx.beginPath(); ctx.moveTo(x0 + 4, yy); ctx.lineTo(x0 + bw - 4, yy); ctx.stroke(); }
    // roof: lit front slope, shaded gable end, ridge set back halfway
    const xl = x0 - 16, xr = x0 + bw + 16, ye = top + 8, dx = 26, dy = -48, rise = 66;
    const ridgeL = [xl + dx / 2, ye + dy / 2 - rise], ridgeR = [xr + dx / 2, ye + dy / 2 - rise];
    D.poly(ctx, [xr, ye, xr + dx, ye + dy, ridgeR[0], ridgeR[1]], D.shade(e.roof, -0.3), D.C.ink, 3.5);
    D.box3(ctx, x0 + bw - 70, ye - 96, 24, 50, 14, { r: 2, lw: 3, fill: '#b9674a', flute: false });
    if (!night || true) for (let i = 0; i < 3; i++) {
      const p = (this.t * 0.25 + i / 3) % 1;
      D.circle(ctx, x0 + bw - 52 + Math.sin(p * 5) * 6 + p * 14, ye - 104 - p * 50, 6 + p * 8, `rgba(240,240,240,${0.5 * (1 - p)})`);
    }
    ctx.beginPath(); ctx.moveTo(xl, ye); ctx.lineTo(xr, ye); ctx.lineTo(ridgeR[0], ridgeR[1]); ctx.lineTo(ridgeL[0], ridgeL[1]); ctx.closePath();
    const rg = ctx.createLinearGradient(0, ridgeL[1], 0, ye);
    rg.addColorStop(0, D.shade(e.roof, 0.18)); rg.addColorStop(1, D.shade(e.roof, -0.08));
    ctx.fillStyle = rg; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 3.5; ctx.stroke();
    ctx.save(); ctx.clip();
    for (let k = 1; k < 5; k++) {
      const t = k / 5, yy = ye + (ridgeL[1] - ye) * t, ox = (dx / 2) * t;
      D.line(ctx, xl + ox, yy, xr + ox, yy, 'rgba(60,20,10,.25)', 2);
      for (let i = 0; i < 14; i++) { const sx = xl + ox + i * 24 + (k % 2) * 12; D.line(ctx, sx, yy, sx + (dx / 10), yy + (ye - ridgeL[1]) / 5, 'rgba(60,20,10,.15)', 1.5); }
    }
    ctx.restore();
    // dormer with the round attic window
    const dmx = x - 4, dmy = ye - 50;
    D.box3(ctx, dmx - 22, dmy - 6, 44, 40, 10, { r: 3, lw: 3, fill: e.color, flute: false });
    D.poly(ctx, [dmx - 28, dmy - 4, dmx, dmy - 26, dmx + 28, dmy - 4], e.roof, D.C.ink, 3);
    D.circle(ctx, dmx, dmy + 14, 12, night ? '#ffe28a' : '#cfe6f2', D.C.ink, 3);
    D.line(ctx, dmx - 12, dmy + 14, dmx + 12, dmy + 14, D.C.ink, 2); D.line(ctx, dmx, dmy + 2, dmx, dmy + 26, D.C.ink, 2);
    // windows with flower boxes
    for (const wx of [x0 + 34, x0 + bw - 84]) {
      D.rr(ctx, wx, top + 22, 50, 42, 4); ctx.fillStyle = night ? '#ffd76a' : '#cfe6f2'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 3; ctx.stroke();
      D.line(ctx, wx + 25, top + 22, wx + 25, top + 64, D.C.ink, 2); D.line(ctx, wx, top + 43, wx + 50, top + 43, D.C.ink, 2);
      for (const k of [0, 1]) D.box3(ctx, wx - 12 + k * 56, top + 20, 8, 46, 4, { r: 1, lw: 2, fill: '#5aa9e6', flute: false });
      D.box3(ctx, wx - 4, top + 64, 58, 10, 6, { r: 2, lw: 2, fill: '#8a5a3a', flute: false });
      for (let i = 0; i < 5; i++) D.ball(ctx, wx + 4 + i * 11, top + 62, 4.5, ['#ff9ec7', '#ffd25a', '#ef6b6b', '#fff', '#a68be6'][i], { lw: 1.2 });
    }
    // porch: floor, posts, little roof, and the swing
    D.box3(ctx, x0 + 10, base - 6, bw - 20, 10, 18, { r: 2, lw: 3, fill: '#c9925a', flute: false });
    D.box3(ctx, x0 + 4, top + 74, bw - 8, 10, 22, { r: 2, lw: 3, fill: D.shade(e.roof, -0.05), flute: false });
    for (const px of [x0 + 18, x0 + bw - 26]) D.box3(ctx, px, top + 84, 8, base - top - 88, 5, { r: 1, lw: 2.5, fill: '#fffaf0', flute: false });
    const sw = Math.sin(this.t * 1.4) * 3;
    D.line(ctx, x0 + 48 + sw, top + 84, x0 + 48 + sw * 1.6, base - 30, D.C.ink, 1.5);
    D.line(ctx, x0 + 92 + sw, top + 84, x0 + 92 + sw * 1.6, base - 30, D.C.ink, 1.5);
    D.box3(ctx, x0 + 44 + sw * 1.6, base - 34, 52, 8, 8, { r: 2, lw: 2, fill: '#8fd08a', flute: false });
    D.rr(ctx, x - 16, base - 52, 32, 46, 8); ctx.fillStyle = D.lgx(ctx, x - 16, x + 16, '#4a8a5a'); ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 3; ctx.stroke();
    D.circle(ctx, x + 9, base - 28, 2.5, '#ffd25a');
    D.cardboard(ctx, x - 40, base - 74, 80, 16, { r: 3, lw: 2, fill: '#fff4dc', flute: false });
    D.text(ctx, e.label, x, base - 62, { size: 11, weight: 700, align: 'center', color: '#3d2412' });
  };

  // the finished Willow Creek Arch, painted into the ground so everyone walks right over it
  CK.Chapters.riverbend.paintGround = function (g, m) {
    if (!f('rb_arch')) return;
    let x1 = 99, x2 = -1;
    for (let x = 0; x < m.w; x++) if (m.get(x, 12) === 'b') { x1 = Math.min(x1, x); x2 = Math.max(x2, x); }
    if (x2 < 0) return;
    const L = (x1 - 0.5) * TS, R = (x2 + 1.5) * TS, y0 = 12 * TS + 2, y1 = 13 * TS - 2;
    // front face of the arch, with the opening showing the creek beneath
    g.beginPath(); g.moveTo(L, y1); g.lineTo(R, y1); g.lineTo(R, y1 + 30); g.lineTo(L, y1 + 30); g.closePath();
    g.fillStyle = '#a8a29a'; g.fill(); g.strokeStyle = D.C.ink; g.lineWidth = 3; g.stroke();
    g.beginPath(); g.ellipse((L + R) / 2, y1 + 32, (R - L) / 2 - 22, 26, 0, Math.PI, 0); g.closePath();
    g.fillStyle = '#2f6f8f'; g.fill(); g.stroke();
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const a = Math.PI + (Math.PI * i) / n, cx = (L + R) / 2, rx = (R - L) / 2 - 22;
      g.beginPath(); g.moveTo(cx + Math.cos(a) * rx, y1 + 32 + Math.sin(a) * 26); g.lineTo(cx + Math.cos(a) * (rx + 12), y1 + 32 + Math.sin(a) * 38); g.strokeStyle = 'rgba(40,20,10,.5)'; g.lineWidth = 2; g.stroke();
    }
    // the deck, paved in stone
    g.fillStyle = '#c9c0b0'; g.fillRect(L, y0, R - L, y1 - y0);
    g.strokeStyle = 'rgba(60,40,20,.25)'; g.lineWidth = 1.5;
    for (let xx = L + 16; xx < R; xx += 22) { g.beginPath(); g.moveTo(xx, y0); g.lineTo(xx, y1); g.stroke(); }
    g.beginPath(); g.moveTo(L, (y0 + y1) / 2); g.lineTo(R, (y0 + y1) / 2); g.stroke();
    g.strokeStyle = D.C.ink; g.lineWidth = 3; g.strokeRect(L, y0, R - L, y1 - y0);
    // low parapet along the far edge, and the regulation planter
    D.box3(g, L, y0 - 12, R - L, 10, 6, { r: 2, lw: 2.5, fill: '#b8b0a2', flute: false });
    D.box3(g, R - 34, y0 - 30, 28, 18, 8, { r: 2, lw: 2.5, fill: '#c25b4a', flute: false });
    for (let j = 0; j < 4; j++) D.ball(g, R - 28 + j * 6, y0 - 34, 4, ['#ff9ec7', '#ffd25a', '#ef6b6b', '#a68be6'][j], { lw: 1 });
  };

  // ================================================================ ATTIC BATTLE STAGE
  const baseBg = CK.Battle.prototype.drawBg;
  CK.Battle.prototype.drawBg = function (ctx) {
    if (this.def.bg !== 'attic') return baseBg.call(this, ctx);
    // sloped rafters, stacked boxes, one round moonlit window and a bare bulb
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#2a1d2e'); g.addColorStop(1, '#4a3328');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const roof = (side) => {
      ctx.save();
      if (side) { ctx.translate(W, 0); ctx.scale(-1, 1); }
      ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(W / 2, -40); ctx.lineTo(W / 2, 0); ctx.lineTo(0, 110); ctx.closePath();
      ctx.fillStyle = '#5a3d2a'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 3; ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const bx = 60 + i * 90;
        D.box3(ctx, bx, 80 - i * 22, 16, 300, 10, { r: 1, lw: 2.5, fill: '#6a4a32', flute: false });
      }
      ctx.restore();
    };
    roof(0); roof(1);
    D.circle(ctx, W / 2, 130, 52, '#6a4a32', D.C.ink, 4);
    D.circle(ctx, W / 2, 130, 42, '#1d2450');
    D.circle(ctx, W / 2 + 12, 120, 16, '#fff3b0');
    D.line(ctx, W / 2 - 42, 130, W / 2 + 42, 130, '#6a4a32', 5);
    D.line(ctx, W / 2, 88, W / 2, 172, '#6a4a32', 5);
    // moonbeam
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath(); ctx.moveTo(W / 2 - 40, 140); ctx.lineTo(W / 2 + 40, 140); ctx.lineTo(W / 2 + 200, 420); ctx.lineTo(W / 2 - 120, 420); ctx.closePath();
    ctx.fillStyle = 'rgba(160,170,255,0.08)'; ctx.fill(); ctx.restore();
    // stacks of labeled boxes, standing like stage flats
    const stack = [[40, 3, '#c9925a'], [160, 2, '#b98552'], [690, 2, '#c99561'], [810, 3, '#b98552']];
    for (const [sx, n, col] of stack) for (let i = 0; i < n; i++) {
      const sway = Math.sin(this.t * 0.6 + sx) * 1.5;
      D.box3(ctx, sx + (i % 2) * 8 + sway, 340 - (i + 1) * 62, 100, 60, 22, { r: 2, lw: 3, fill: col });
      D.text(ctx, ['ROSIE', 'XMAS', 'BOOKS', '1971'][(i + sx) % 4], sx + 50 + (i % 2) * 8 + sway, 340 - (i + 1) * 62 + 36, { size: 13, weight: 700, align: 'center', color: '#3d2412' });
    }
    // hanging bulb
    const swing = Math.sin(this.t * 1.2) * 0.08;
    ctx.save(); ctx.translate(300, 0); ctx.rotate(swing);
    D.line(ctx, 0, 0, 0, 120, D.C.ink, 2);
    const lg = ctx.createRadialGradient(0, 130, 4, 0, 130, 160);
    lg.addColorStop(0, 'rgba(255,220,140,0.45)'); lg.addColorStop(1, 'rgba(255,220,140,0)');
    ctx.fillStyle = lg; ctx.fillRect(-160, -30, 320, 320);
    D.ball(ctx, 0, 130, 11, '#fff3b0', { lw: 2 });
    ctx.restore();
    // drifting dust in the light
    for (let i = 0; i < 26; i++) {
      const p = (this.t * 0.05 + U.hash(i, 3)) % 1;
      D.circle(ctx, U.hash(i, 4) * W + Math.sin(this.t + i) * 12, 380 - p * 360, 1.6, `rgba(255,240,210,${0.5 * Math.sin(p * Math.PI)})`);
    }
    // floorboards in perspective
    const fy = 376;
    ctx.beginPath(); ctx.moveTo(-40, H + 10); ctx.lineTo(W + 40, H + 10); ctx.lineTo(W + 40, fy); ctx.lineTo(-40, fy); ctx.closePath();
    const fg = ctx.createLinearGradient(0, fy, 0, H);
    fg.addColorStop(0, '#4a3322'); fg.addColorStop(1, '#7a5636');
    ctx.fillStyle = fg; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(20,10,0,0.3)'; ctx.lineWidth = 2;
    for (let i = -14; i <= 14; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 80 * 0.4, fy); ctx.lineTo(W / 2 + i * 80, H + 10); ctx.stroke(); }
    ctx.restore();
    D.line(ctx, -10, fy, W + 10, fy, D.C.ink, 4);
  };

  // ================================================================ PUZZLE: THE WILLOW CREEK ARCH
  // Each stone only pushes on its neighbours, so the line of push (the thrust line) must stay inside
  // the stones. For a set of loads the ideal arch is the hanging-chain (funicular) shape turned upside
  // down, which has the same shape as the bending-moment diagram of a simple beam under those loads.
  CK.PuzzleDefs.willow_arch = {
    type: 'arch', title: 'The Willow Creek Arch',
    loads: [1, 1, 1, 1, 1, 4], start: [2, 3, 4, 4, 3, 2], solution: [3, 5, 6, 7, 6, 5],
    flood: 6, maxH: 10, tol: 0.6,
    brief: 'Raise or lower the six joints to shape a stone arch over Willow Creek. Its top must clear the storm flood line (6). Stones can only push on each other, so the push has to stay inside the stones all the way across. Rook insists on the big planter at joint 6.',
    hint: 'Press C to hang a chain with the same weights. It sags most where things are heavy, with a sharp kink under the planter. Flip that shape upside down and copy it: a steeper climb on the planter side.',
    lesson: 'An arch carries weight by pure squeezing (compression). The perfect shape is a hanging chain turned upside down: wherever a weight kinks the chain, the arch needs the same kink pushing up.',
  };
  function moments(P) {
    const n = P.length, L = n + 1;
    let ra = 0;
    P.forEach((p, i) => (ra += (p * (L - (i + 1))) / L));
    return P.map((_, j) => {
      const x = j + 1;
      let m = ra * x;
      for (let i = 0; i < j; i++) m -= P[i] * (x - (i + 1));
      return m;
    });
  }
  CK.archMoments = moments;

  class ArchPuzzle extends CK.Puzzle.PuzzleBase {
    constructor(def) {
      super(def);
      this.h = def.start.slice();
      this.n = def.loads.length;
      this.sel = 2;
      this.g = moments(def.loads);
      this.ox = 84; this.span = 520; this.base = 330; this.uy = 21;
      this.chain = false;
      this.anim = 0;
    }
    nx(i) { return this.ox + (this.span * i) / (this.n + 1); }
    ny(v) { return this.base - v * this.uy; }
    heights() { return [0].concat(this.h, [0]); }
    fit() {
      const g = this.g, h = this.h;
      let a = 0, b = 0;
      for (let i = 0; i < g.length; i++) { a += h[i] * g[i]; b += g[i] * g[i]; }
      const k = a / b;
      const dev = h.map((v, i) => v - k * g[i]);
      return { k, dev };
    }
    evaluate() {
      const { k, dev } = this.fit();
      const crown = Math.max(...this.h);
      let worst = -1, wv = 0;
      dev.forEach((d, i) => { if (Math.abs(d) > this.def.tol && Math.abs(d) > wv) { wv = Math.abs(d); worst = i; } });
      return { k, dev, crown, worst, ok: k > 0 && worst < 0 && crown >= this.def.flood };
    }
    clear() { this.h = this.def.start.slice(); }
    applySolution() { this.h = this.def.solution.slice(); }
    validate() { return null; }
    startTest() {
      this.state = 'test';
      this.anim = 0;
      this.res = this.evaluate();
      CK.Audio.sfx('build');
    }
    resetTest() { this.res = null; }
    pickAt(mx) {
      let best = null, bd = 40;
      for (let i = 1; i <= this.n; i++) { const d = Math.abs(mx - this.nx(i)); if (d < bd) { bd = d; best = i - 1; } }
      return best;
    }
    update(dt) {
      if (this.commonUpdate(dt)) {
        if (this.state === 'test') this.updateTest(dt);
        return;
      }
      if (Input.hit('left')) { this.sel = Math.max(0, this.sel - 1); CK.Audio.sfx('blip'); }
      if (Input.hit('right')) { this.sel = Math.min(this.n - 1, this.sel + 1); CK.Audio.sfx('blip'); }
      if (Input.hit('up')) { this.h[this.sel] = Math.min(this.def.maxH, this.h[this.sel] + 1); CK.Audio.sfx('tape'); }
      if (Input.hit('down')) { this.h[this.sel] = Math.max(0, this.h[this.sel] - 1); CK.Audio.sfx('tape'); }
      if (Input.key('KeyC')) { this.chain = !this.chain; CK.Audio.sfx('blip'); }
      const m = Input.mouse;
      if (m.pressed && m.x < 660) {
        const i = this.pickAt(m.x);
        if (i != null) { this.sel = i; this.dragging = true; } else if (D.inRect(m.x, m.y, 24, 470, 170, 34)) { this.chain = !this.chain; CK.Audio.sfx('blip'); }
      }
      if (!m.down) this.dragging = false;
      if (this.dragging && m.x < 660) {
        const v = Math.max(0, Math.min(this.def.maxH, Math.round((this.base - m.y) / this.uy)));
        if (v !== this.h[this.sel]) { this.h[this.sel] = v; CK.Audio.sfx('tape'); }
      }
    }
    updateTest(dt) {
      this.anim += dt;
      if (this.anim > 2.8 || CK.autoSkip) {
        const r = this.res;
        if (r.ok) {
          CK.setFlag('rb_arch');
          this.finish(true, 'Approved!', `The push stays inside every stone and the top clears the flood line. ${this.def.lesson}`);
        } else if (r.crown < this.def.flood) {
          this.finish(false, 'Washed out!', `The top of the arch is at ${r.crown}, but the storm flood line is at ${this.def.flood}. Raise the middle so floodwater can pass underneath.`);
        } else {
          const j = r.worst + 1, hi = r.dev[r.worst] > 0;
          this.finish(false, 'Crumble!', `At joint ${j} the push leaves the stones: that joint is too ${hi ? 'high (too pointy)' : 'low (too flat)'} for the weight on it. Try ${hi ? 'lowering' : 'raising'} it, or press C to hang the chain.`);
        }
      }
    }
    drawStone(ctx, x1, y1, x2, y2, t, col, depth) {
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
      const nx = (-dy / L) * t, ny = (dx / L) * t;
      const pts = [x1 + nx, y1 + ny, x2 + nx, y2 + ny, x2 - nx, y2 - ny, x1 - nx, y1 - ny];
      if (depth) {
        const back = pts.map((v, i) => v + (i % 2 ? -depth * 0.78 : depth * 0.42));
        D.poly(ctx, back, D.shade(col, -0.35), D.C.ink, 2);
      }
      ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
      for (let i = 2; i < 8; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
      ctx.closePath();
      ctx.fillStyle = D.vg(ctx, (x1 + x2) / 2, (y1 + y2) / 2, L * 0.7, col, 0.5);
      ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 2.5; ctx.stroke();
    }
    draw(ctx) {
      this.drawFrame(ctx);
      const d = this.def, n = this.n, hs = this.heights();
      const r = this.state !== 'build' ? this.res : null;
      const prog = r ? Math.min(1, this.anim / 1.4) : 0;
      const fall = r && !r.ok ? Math.max(0, this.anim - 1.5) : 0;
      // creek bed, water and the two stone abutments
      const L = this.nx(0), R = this.nx(n + 1);
      D.box3(ctx, L, this.base + 14, R - L, 120, 0, { fill: '#5f7f6a', lw: 0, flute: false });
      const wy = this.base + 30 + Math.sin(this.t * 2) * 2;
      ctx.fillStyle = 'rgba(80,180,230,0.75)'; ctx.fillRect(L, wy, R - L, this.base + 134 - wy);
      for (let i = 0; i < 9; i++) D.line(ctx, L + 20 + i * 58 + Math.sin(this.t + i) * 6, wy + 14 + (i % 3) * 18, L + 44 + i * 58 + Math.sin(this.t + i) * 6, wy + 14 + (i % 3) * 18, 'rgba(255,255,255,0.6)', 2);
      for (const [ax, dir] of [[L, -1], [R, 1]]) {
        const bx = dir < 0 ? ax - 70 : ax;
        D.box3(ctx, bx, this.base - 4, 70, 140, 14, { r: 2, lw: 3, fill: '#a8a29a', flute: false });
        for (let j = 0; j < 4; j++) D.line(ctx, bx + 4, this.base + 22 + j * 30, bx + 66, this.base + 22 + j * 30, 'rgba(0,0,0,.18)', 2);
        D.box3(ctx, bx - (dir < 0 ? 10 : -10), this.base - 18, 70, 14, 8, { r: 2, lw: 2, fill: '#8fd46c', flute: false });
      }
      // storm flood line
      const fy = this.ny(d.flood);
      ctx.setLineDash([10, 8]); D.line(ctx, L - 10, fy, R + 10, fy, 'rgba(255,140,140,0.9)', 2.5); ctx.setLineDash([]);
      D.text(ctx, `storm flood line (${d.flood})`, L + 6, fy - 8, { size: 12, weight: 700, color: '#ffc2c2' });
      // height ruler
      for (let v = 0; v <= d.maxH; v += 2) { D.text(ctx, String(v), 22, this.ny(v) + 4, { size: 12, color: '#9fd3ff', align: 'center' }); D.line(ctx, 32, this.ny(v), 40, this.ny(v), '#9fd3ff', 1.5); }
      // hanging-chain helper: the same loads hung from the abutments, sagging down through the creek
      if (this.chain) {
        const k = (Math.max(...this.h) || 6) / Math.max(...this.g);
        const cy = (i) => this.base + 20 + (i === 0 || i === n + 1 ? 0 : this.g[i - 1] * k * this.uy * 0.75);
        ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.moveTo(this.nx(0), cy(0));
        for (let i = 1; i <= n + 1; i++) ctx.lineTo(this.nx(i), cy(i));
        ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
        for (let i = 1; i <= n; i++) {
          const w = d.loads[i - 1];
          D.line(ctx, this.nx(i), cy(i), this.nx(i), cy(i) + 12, '#ffe9a8', 2);
          D.ball(ctx, this.nx(i), cy(i) + 14 + w * 2, 4 + w * 2.2, '#9a9fa8', { lw: 1.5 });
        }
        D.text(ctx, 'Hanging chain: flip it!', this.nx(2) - 10, this.base + 20 + Math.max(...this.g) * k * this.uy * 0.75 + 34, { size: 13, weight: 700, color: '#ffe9a8', outline: '#2f5f8a', ow: 3 });
      }
      // the arch: wedge stones between joints, with 2.5D thickness
      const T = d.tol * this.uy;
      for (let i = 0; i <= n; i++) {
        let x1 = this.nx(i), y1 = this.ny(hs[i]), x2 = this.nx(i + 1), y2 = this.ny(hs[i + 1]);
        const bad = r && fall > 0 && (r.worst === i || r.worst === i - 1 || r.crown < d.flood);
        ctx.save();
        if (bad) {
          const cx = (x1 + x2) / 2, cyy = (y1 + y2) / 2;
          ctx.translate(cx + fall * 30 * (i % 2 ? 1 : -1), cyy + fall * fall * 260);
          ctx.rotate(fall * 2 * (i % 2 ? 1 : -1));
          x1 -= cx; x2 -= cx; y1 -= cyy; y2 -= cyy;
        }
        this.drawStone(ctx, x1, y1, x2, y2, T, i === Math.floor(n / 2) ? '#c9c0b0' : '#b8b0a2', 10);
        ctx.restore();
      }
      // loads riding on the arch
      for (let i = 1; i <= n; i++) {
        const x = this.nx(i), y = this.ny(hs[i]) - T;
        const w = d.loads[i - 1];
        if (r && fall > 0 && (r.worst === i - 1 || r.worst === i - 2 || r.worst === i)) continue;
        if (w >= 3) {
          D.box3(ctx, x - 26, y - 30, 52, 30, 12, { r: 3, lw: 2.5, fill: '#c25b4a', flute: false });
          for (let j = 0; j < 5; j++) { D.line(ctx, x - 18 + j * 9, y - 30, x - 18 + j * 9, y - 44, '#4f9a4a', 2); D.ball(ctx, x - 18 + j * 9, y - 46, 4.5, ['#ff9ec7', '#ffd25a', '#ef6b6b', '#fff', '#a68be6'][j], { lw: 1.2 }); }
          D.text(ctx, `x${w}`, x, y - 10, { size: 13, weight: 700, align: 'center', color: '#fff' });
        } else D.box3(ctx, x - 12, y - 10, 24, 10, 6, { r: 2, lw: 2, fill: '#9a948a', flute: false });
      }
      // the thrust line, drawn on during a test
      if (r) {
        const pts = [[this.nx(0), this.base]].concat(this.g.map((g, i) => [this.nx(i + 1), this.ny(g * r.k)]), [[this.nx(n + 1), this.base]]);
        const upto = prog * (n + 1);
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          if (i - 1 >= upto) break;
          const t = Math.min(1, upto - (i - 1));
          ctx.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t);
        }
        ctx.strokeStyle = r.ok ? '#7dff9a' : '#ffb36b'; ctx.lineWidth = 4; ctx.setLineDash([12, 6]); ctx.stroke(); ctx.setLineDash([]);
        if (prog >= 1 && !r.ok && r.worst >= 0) {
          const x = this.nx(r.worst + 1), y = this.ny(this.h[r.worst]);
          D.circle(ctx, x, y, 18 + Math.sin(this.t * 10) * 3, null, '#ff5a5a', 4);
        }
        if (prog >= 1 && r.ok) {
          ctx.save(); ctx.translate(this.nx(n) - 20, this.base - 230); ctx.rotate(-0.18);
          D.rr(ctx, -70, -22, 140, 44, 8); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4; ctx.stroke();
          D.text(ctx, 'APPROVED', 0, 9, { size: 24, weight: 700, align: 'center', color: '#ef4444' });
          ctx.restore();
        }
      }
      // joint handles
      if (this.state === 'build') for (let i = 1; i <= n; i++) {
        const x = this.nx(i), y = this.ny(hs[i]), s = this.sel === i - 1;
        D.ball(ctx, x, y, s ? 9 : 6, s ? '#ffd25a' : '#e9eef6', { lw: 2 });
        D.text(ctx, String(i), x, this.base + 30, { size: 13, weight: 700, align: 'center', color: s ? '#ffd25a' : '#9fd3ff' });
        if (s) {
          const b = Math.sin(this.t * 6) * 2;
          D.poly(ctx, [x, y - 40 - b, x - 8, y - 28 - b, x + 8, y - 28 - b], '#ffd25a', D.C.ink, 1.5);
          D.poly(ctx, [x, y + 40 + b, x - 8, y + 28 + b, x + 8, y + 28 + b], '#ffd25a', D.C.ink, 1.5);
        }
      }
      D.button(ctx, 24, 470, 170, 34, this.chain ? 'Hide chain (C)' : 'Hang the chain (C)', { hover: D.inRect(Input.mouse.x, Input.mouse.y, 24, 470, 170, 34), size: 14 });
      this.drawPanel(ctx, (ctx, px, y) => {
        const top = Math.max(...this.h);
        D.text(ctx, `Top of arch: ${top}  (flood line ${d.flood})`, px + 16, y + 4, { size: 14, weight: 700, color: top >= d.flood ? '#3f8f3f' : '#c2410c' });
        D.text(ctx, `Joint ${this.sel + 1}: height ${this.h[this.sel]}, load ${d.loads[this.sel]}`, px + 16, y + 26, { size: 13, color: '#5b3a1e' });
        D.text(ctx, `Heights: ${this.h.join(' · ')}`, px + 16, y + 46, { size: 13, color: '#5b3a1e' });
      });
      D.text(ctx, 'Left/Right picks a joint, Up/Down raises it (or drag). T tests.', 210, H - 14, { size: 13, color: '#cfe6ff' });
      this.drawOverlay(ctx);
    }
  }
  CK.PuzzleTypes.arch = ArchPuzzle;
})();
