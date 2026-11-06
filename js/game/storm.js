// Cardboard Kingdom - Chapter 6: Storm Season.
// After the credits, a real storm hits campus. Whimsy comes through the box for real,
// the Gutter Gremlins turn out to be refugees from a flooded drain, and the "villain"
// in the nice suit turns out to be just a person who forgot why he loved building things.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input, Data = CK.Data;
  const W = CK.W, H = CK.H;
  const f = (k) => CK.flag(k);
  const S = CK.Story.scripts;
  const after = () => f('credits_seen');
  const storm = () => f('st_storm') && !f('st_garden');

  // ================================================================ DATA
  Data.speakers.gremlin = { name: 'Gutter Gremlin', look: 'gremlin', ps: 2.6, py: -14, bg: '#dff3ee' };
  Data.enemies.gremlin = {
    name: 'Gutter Gremlin', hp: 26, atk: 7, def: 0, xp: 6, scraps: 4, draw: 'gremlin',
    moves: [{ name: 'Gutter Gush', power: 1, w: 3, water: true }, { name: 'Drain Splash', power: 0.7, all: true, w: 1, water: true, soak: true }],
  };
  Data.battles.cp_gremlins = { enemies: ['gremlin', 'gremlin', 'gremlin'], season: 'campusColor', rainy: true };

  // ================================================================ CAMPUS
  const campus = CK.Chapters.campus;
  campus.flood = [[4, 12], [5, 13], [6, 12], [7, 12], [8, 13], [9, 12], [10, 13], [12, 12], [6, 14], [8, 15], [11, 14]];
  const objs = [
    { type: 'notice', id: 'st_board', x: 13, y: 11, script: () => 'st_notice', cond: after, fresh: () => !f('st_notice') },
    { type: 'npc', id: 'penwright', x: 27, y: 15, look: 'penwright', talk: () => (f('st_townhall') ? 'st_pen_after' : f('st_penwright') ? 'st_pen_again' : 'st_penwright'), cond: () => after() && f('st_notice') && !storm() },
    { type: 'deco', kind: 'drain', x: 7, y: 13, cond: () => after() && !f('st_garden') },
    { type: 'enemy', id: 'st_grem', x: 9, y: 13, look: 'gremlin', battle: 'cp_gremlins', patrol: [[8, 13], [11, 13], [11, 14]], cond: storm },
    { type: 'npc', id: 'corry_rw', x: 5, y: 14, look: 'corry', talk: 'st_corry', cond: storm },
    { type: 'npc', id: 'grem_calm', x: 10, y: 14, look: 'gremlin', o: { mood: 'sad' }, talk: 'st_grem_talk', cond: () => f('st_gremlins') && !f('st_garden') },
    { type: 'site', id: 'st_site', x: 12, y: 16, script: 'st_site', cond: () => f('st_gremlins') && !f('st_garden') },
    { type: 'deco', kind: 'raingarden', x: 8, y: 14, cond: () => f('st_garden') },
    { type: 'npc', id: 'grem_happy', x: 11, y: 14, look: 'gremlin', o: { mood: 'happy' }, talk: 'st_grem_happy', cond: () => f('st_garden') },
  ];
  // the epilogue students head indoors when the storm hits
  for (const o of campus.objects) if (o.type === 'npc' && /^stu|^regatta|^jules_ep/.test(o.id)) {
    const c = o.cond;
    o.cond = (G) => (!c || c(G)) && !storm();
  }
  campus.objects.push(...objs);
  const lib = campus.objects.find((o) => o.id === 'lib');
  const libScript = lib.script;
  lib.script = () => (f('st_garden') && !f('st_townhall') ? 'st_townhall' : libScript());
  lib.door = undefined;
  const basePost = campus.post;
  campus.post = function (m) {
    basePost.call(this, m);
    for (const o of objs) if (o.type !== 'deco' || o.kind === 'raingarden') m.set(o.x, o.y, '.');
    m.rect(7, 13, 6, 3, '.');
  };
  const baseObjective = campus.objective;
  campus.objective = function (G) {
    if (after() && !f('st_townhall')) {
      if (!f('st_notice')) return 'Something new is pinned to the notice board (by the Mail Room)';
      if (!f('st_penwright')) return 'Find Mr. Penwright at the pond';
      if (!f('st_gremlins')) return 'Storm! Stop whatever is climbing out of the drain by the dorm';
      if (!f('st_garden')) return 'Design a rain garden to save the dorm (blueprint by the quad)';
      return 'Town meeting at the Library. Bring your numbers!';
    }
    return baseObjective.call(this, G);
  };

  // ================================================================ SCRIPTS
  S.st_notice = [
    { if: () => f('st_notice'), then: [{ narrate: 'PUBLIC MEETING, THURSDAY, LIBRARY. Someone has drawn a little frowny face on the parking garage.' }] },
    { card: { title: 'Chapter 6', sub: 'Storm Season' } },
    { narrate: 'A crisp new flyer: PUBLIC MEETING. The Reyes Pond Project. Penwright Development proposes filling in Reyes Pond to build a 400-space parking garage.' },
    { narrate: 'In the corner of the flyer there is a small logo. A silver feather. A quill.' },
    ['sam', 'Fill in the POND? Grandma designed that spillway. And... a silver quill?', 'shock'],
    ['sam', "No. Corvin is in the Kingdom, rebuilding houses with tape. This is the real world. People here don't scheme like that... right?", 'sad'],
    { coop: [
      ['jules', "A silver quill. Sam. SAM. It's them. It's the bird people. In OUR world.", 'shock'],
      ['sam', "Or it's a logo. Let's not accuse anyone of being a bird yet.", 'happy'],
    ] },
    { journal: 'Chapter 6. A flyer: Penwright Development wants to fill in Reyes Pond for a parking garage. Their logo is a silver quill.' },
    { flag: 'st_notice' },
    { fn: () => CK.OW && CK.OW.buildEntities() },
    ['sam', 'It says the developer is surveying the pond today. Time to meet this Mr. Penwright.'],
  ];

  S.st_penwright = [
    ['penwright', 'Oh! Hello. Careful of the little flags, those are for the survey. Arthur Penwright, Penwright Development.'],
    ['sam', 'You want to fill in the pond.', 'angry'],
    ['penwright', "I want to fix a problem. Every spring, Lot C floods. Cars, bikes, the shuttle stop. I get forty angry emails a week.", 'sad'],
    ['penwright', "Fill the pond, build a garage up high where the water can't reach. Problem solved. Everybody parks. Everybody's happy."],
    ['sam', "But water doesn't disappear when you pave over it. It just goes somewhere else.", 'sad'],
    ['penwright', 'You talk like an engineer. I almost was one, a long time ago.', 'happy'],
    { narrate: "Sam can't stop looking at the pin on his lapel. A tiny silver quill." },
    ['sam', 'That pin...', 'shock'],
    ['penwright', "This? I've had it since college. Is it back in fashion?", 'happy'],
    ['penwright', "Look. The meeting is Thursday at the Library. If you've got a better idea, bring numbers. I can't build with feelings."],
    { coop: [['jules', '(whispering) He seems... nice? Villains are not supposed to be nice.', 'shock']] },
    { flag: 'st_penwright' },
    { wait: 0.3 },
    { narrate: 'Thunder rumbles somewhere over the hills. The sky goes dark, fast.' },
    { night: true },
    { flag: 'st_storm' },
    { fn: () => { if (CK.OW) { CK.OW.refresh(); CK.Audio.setRain(true); } } },
    { shake: 6 },
    { narrate: 'Rain. Real rain, the hammering kind. In minutes the quad is a shallow lake, and all of it is rushing toward Haverford Hall.' },
    ['sam', "The dorm! The water's heading straight for the dorm!", 'shock'],
    { narrate: "Something wriggles in Sam's hoodie pocket. Pip unfolds, shakes out both wings, and stands up on Sam's palm. Moving. Talking." },
    ['pip', 'Squire Pip, reporting! Did you think a little thing like WORLDS would keep me folded?', 'happy'],
    { narrate: 'Across campus, the glowing box by the recycling center bursts open. Out clanks a full-size cardboard bear in a pot helmet.' },
    ['corry', "Did someone say WATER? Sir Corrugate, at your service! Oh no. Oh no, it's so wet here.", 'shock'],
    ['sam', "Corry! You're here! You're... real-world sized!", 'happy'],
    ['corry', "Your Grandma's Rule Three, Builder. Don't stop playing. Well, we heard you playing. Very loudly.", 'happy'],
    { coop: [['jules', 'There is a cardboard bear. On my campus. In a thunderstorm. Best. Tuesday. EVER.', 'happy']] },
    { narrate: 'And by the dorm, out of the storm drain, little green things are climbing. Lots of them. Glowing eyes. Bottle-cap hats.' },
    ['pip', 'Gremlins! Gutter Gremlins! Costumes on, everyone!', 'angry'],
    { journal: 'A real storm hit campus. Pip unfolded and Corry climbed out of the box. Our costumes work HERE. Gutter Gremlins are pouring out of the storm drain by the dorm.' },
  ];
  S.st_pen_again = [['penwright', "Thursday, at the Library. Numbers, not feelings. And maybe a raincoat.", 'happy']];
  S.st_corry = [['corry', "I'll hold the door! Well. I'll stand in front of the door. I am, technically, a box. Go, Builder!", 'happy']];

  S.after_st_grem = [
    { narrate: 'The gremlins stop. The glow fades from their eyes. Up close, they just look soaked. And very tired.' },
    ['gremlin', 'Gurgle. Sorry. SORRY. We not attack. We RUN.', 'sad'],
    ['sam', 'You can talk?', 'shock'],
    ['pip', 'Everybody can talk, if you listen the right way.', 'happy'],
    ['gremlin', 'We live in drain. Nice drain. Cozy drain. But every rain, more water. More, more. Drain fills up. We climb out or we wash away.', 'sad'],
    ['gremlin', 'Every year, more parking. More roof. More hard ground. Rain hits hard ground and RUNS. All of it. Into our drain.', 'sad'],
    ['sam', "...Runoff. Half the quad is pavement and roof. None of the rain soaks in. It all rushes to the lowest spot, and the lowest spot is the dorm.", 'sad'],
    ['sam', "And Lot C floods for the same reason. Mr. Penwright wants to fix it by paving over the pond. That would make it WORSE. The pond is where the water is SUPPOSED to go!", 'shock'],
    ['corry', 'So the monsters were never the problem. Again.', 'happy'],
    ['pip', "It's practically a tradition at this point.", 'happy'],
    { narrate: 'Someone in a raincoat jogs across the quad, holding a clipboard overhead. Dr. Okafor.' },
    ['okafor', 'Sam! I saw the flooding from my window. Is that a BEAR?', 'shock'],
    ['corry', 'Sir Corrugate. Pleasure.', 'happy'],
    ['okafor', '...Pleasure. Okay. We will talk about that later. First: this water needs to stop running at the dorm. Ideas, water resources major?'],
    ['sam', 'Rain gardens. Shallow planted dips that soak up water like a sponge. Rain barrels on the roof downspouts. Porous pavers, so the pavement can drink.', 'happy'],
    ['okafor', "Green infrastructure. That's my whole research grant, Sam. Let's sketch it right now. Blueprint's on the picnic table.", 'happy'],
    { flag: 'st_gremlins' },
    { fn: () => CK.OW && CK.OW.buildEntities() },
    { journal: 'The Gutter Gremlins were fleeing their flooded drain. The real enemy is runoff: too much hard ground. Plan: rain gardens, rain barrels, porous pavers.' },
    { save: true },
  ];
  S.st_grem_talk = [['gremlin', 'You fix? You make ground soft again? Gremlins help! Gremlins very good at digging.', 'sad']];
  S.st_grem_happy = [
    { if: () => f('st_townhall'), then: [['gremlin', 'Big news! Gremlin cousins in Lot C getting rain garden too! Whole family cozy!', 'happy']] },
    ['gremlin', 'Garden is best house. Soft. Flowers. Water comes slow now, like a nice bath.', 'happy'],
  ];

  S.st_site = [
    ['okafor', "Here's the quad from above. Arrows show which way the water runs. Every square gets the same rain. Keep the water at the dorm down to a puddle."],
    { puzzle: 'rain_garden' },
    { narrate: 'All night, in the rain, everybody digs. Corry shovels. Pip plants seedlings one at a time. The gremlins carry mulch in their bottle-cap hats.' },
    ['gremlin', 'Water slows down. Water soaks in. Drain has room. Drain is COZY again!', 'happy'],
    { night: false },
    { fn: () => { if (CK.OW) { CK.OW.refresh(); CK.Audio.setRain(false); } } },
    { narrate: 'Morning. The quad is dry except for one small, cheerful puddle. Where the worst flood was, a rain garden full of flowers is drinking up the last of the storm.' },
    ['corry', 'Builder, our box is calling. Pip and I should get home before somebody recycles us.', 'happy'],
    ['pip', "We'll be watching from the box. Go win your meeting!", 'happy'],
    { narrate: "Corry folds, and folds, and folds, until there is just a crayon bear waving from the side of Grandma's box again. Pip climbs into Sam's pocket and goes still. After one last wink." },
    { journal: 'Built the Reyes Rain Garden overnight with Dr. Okafor, Corry, Pip and the gremlins. The dorm stayed dry. Town meeting at the Library.' },
    { save: true },
  ];

  S.st_townhall = [
    { card: { title: 'Town Meeting', sub: 'Riverside Library, Thursday' } },
    { narrate: 'The library is packed. Students, professors, two ducks (nobody knows how). Mr. Penwright stands at the front beside a slide that says PARKING GARAGE in very large letters.' },
    ['penwright', '...and so, by filling Reyes Pond, we gain four hundred parking spaces and end the Lot C flooding. Questions?'],
    ['sam', 'Me. I have numbers.', 'happy'],
    { narrate: 'Sam unrolls the blueprint from the storm: rainfall, roof area, pavement, and how much water every rain garden and barrel soaked up.' },
    ['sam', 'Two nights ago, the quad sent almost every drop of rain straight to the dorm. With one rain garden and some barrels, it made a puddle.', 'happy'],
    ['sam', "And the pond isn't wasted space. It's a detention basin. It holds a storm and lets it out slowly through my grandmother's spillway. Fill it in, and Lot C floods worse. So does everything downstream.", 'happy'],
    ['okafor', "I checked the math. It holds. Also, I'll be needing that blueprint for my grant application.", 'happy'],
    { narrate: 'Mr. Penwright is quiet for a long moment. Then he unpins the silver quill and turns it over in his fingers.' },
    ['penwright', 'You said your grandmother built the spillway. Rosalind Reyes?', 'shock'],
    ['sam', 'You knew her?', 'shock'],
    ['penwright', 'She taught my hydraulics class. Spring, 1989. Every year she gave one silver quill pin to the student with the best blueprint.', 'sad'],
    ['penwright', 'I won it. Then I switched to business, because I was not sure engineering was "practical". Somewhere along the way I forgot why I loved it.', 'sad'],
    ['sam', '...I almost did the same thing. This year.', 'sad'],
    { journal: "TWIST: The silver quill was never a villain's symbol. It was Grandma's prize for the best blueprint. Corvin, the gum-wrapper bird she folded, must have borrowed it." },
    ['penwright', 'And this morning I found something on my desk. A little silver bird, folded from a gum wrapper. With a note.', 'shock'],
    { narrate: 'He unfolds it. In tiny, very fussy handwriting: "Listen to the kid. - C."' },
    ['sam', '(...Corvin.)', 'happy'],
    ['penwright', 'So. New plan. The garage goes on Lot C, raised up on columns, with a green roof. Porous pavers in every lot. Rain gardens across campus. And the pond stays.', 'happy'],
    ['penwright', "Penwright Development will pay for it. I'll need a consultant, though. Water resources. Summer job. Know anyone?", 'happy'],
    ['okafor', 'I might know a research group that would co-supervise.', 'happy'],
    { coop: [['jules', 'SAM. You got a JOB by being right at a town meeting. That is so nerdy. I am so proud.', 'happy']] },
    { solo: [{ narrate: 'From the back row, very loudly: "THAT\'S MY ROOMMATE!" It is Jules. Of course it is Jules.' }] },
    { flag: 'st_townhall' },
    { scraps: 40 },
    ['sam', "A year ago I thought I had to choose between the fun stuff and the real work. Turns out they're the same blueprint.", 'happy'],
    { narrate: 'That night, Sam writes a new rule in the journal, under Grandma\'s three. Rule Four: Leave room for the rain. Don\'t pave over everything, not the pond, and not yourself.' },
    { journal: "Mr. Penwright changed the plan: the pond stays, rain gardens everywhere, and I have a summer job. Nobody was the villain. The water just needed somewhere to go. Rule Four: Leave room for the rain." },
    { card: { title: 'Storm Season', sub: 'Complete. Thank you for playing!' } },
    { save: true },
  ];
  S.st_pen_after = [
    ['penwright', 'Rain garden number two goes in next week, by Lot C. Bring your bear. And your blueprint.', 'happy'],
    ['penwright', 'I dug out my old drafting pencils last night. Drew a bridge. A small one. It was terrible. I loved it.', 'happy'],
  ];

  // ============================================================ RAIN GARDEN
  // Top-down quad. Every square gets the same rain. Arrows show which way runoff flows.
  // Grass soaks up a little, pavement and roofs soak up nothing. Build to keep the dorm dry.
  const ITEMS = {
    garden: { name: 'Rain garden', on: 'g', cap: 12, cost: 4, color: '#6cc56c', key: '1', desc: 'A planted dip on grass. Soaks up 12. Best where lots of water gathers.' },
    pavers: { name: 'Porous pavers', on: 'p', cap: 4, cost: 2, color: '#b9b2a6', key: '2', desc: 'Pavement with gaps that let water through. Soaks up 4.' },
    barrel: { name: 'Rain barrel', on: 'R', cap: 4, cost: 1, color: '#5aa9e6', key: '3', desc: 'Catches 4 from the roof before it reaches the downspout.' },
  };
  CK.PuzzleDefs.rain_garden = {
    type: 'rain', title: 'The Reyes Rain Garden', budget: 24, limit: 4, rain: 2,
    terrain: ['gggggggg', 'RRgppggg', 'RRgppggg', 'gggppgpg', 'ppgppgpH'],
    flow: ['vvvvvvvv', 'vvvvvvvv', 'vvvvvvvv', 'vvvvvvvv', '>>>>>>>H'],
    spout: [1, 3],
    brief: 'Every square gets 2 rain. Grass soaks up 1, pavement and roof soak up nothing. Water follows the arrows to the dorm. Keep it to 4 or less: a puddle, not a flood.',
    hint: 'Water piles up as it flows. A rain garden at the bottom of a column or along the bottom path catches far more than one at the top. Rain barrels are cheap: the whole roof drains to one downspout.',
    lesson: 'Hard surfaces turn rain into runoff. Green infrastructure (rain gardens, barrels, porous paving) lets water soak in near where it falls, so drains and dorms do not flood.',
    solution: [[0, 1, 'barrel'], [0, 2, 'barrel'], [5, 4, 'garden'], [2, 4, 'garden'], [7, 3, 'garden'], [3, 4, 'pavers'], [3, 2, 'pavers'], [6, 4, 'pavers'], [6, 3, 'pavers'], [4, 4, 'pavers']],
  };

  class RainGardenPuzzle extends CK.Puzzle.PuzzleBase {
    constructor(def) {
      super(def);
      this.rows = def.terrain.length;
      this.cols = def.terrain[0].length;
      this.cs = 72;
      this.ox = 44;
      this.oy = 120;
      this.place = {};
      this.cursor = [3, 3];
      this.tool = 'garden';
      this.anim = 0;
    }
    T(c, r) { return this.def.terrain[r][c]; }
    next(c, r) {
      const d = this.def.flow[r][c];
      return d === 'v' ? [c, r + 1] : d === '>' ? [c + 1, r] : d === '<' ? [c - 1, r] : d === '^' ? [c, r - 1] : null;
    }
    spent() { return Object.values(this.place).reduce((a, k) => a + ITEMS[k].cost, 0); }
    // follow the water downhill: cells farther from the dorm are settled first
    simulate() {
      const d = this.def, k = (c, r) => c + ',' + r;
      const depth = (c, r) => { let n = 0, p = [c, r]; while (p && n < 99) { p = this.next(...p); n++; } return n; };
      const cells = [];
      for (let r = 0; r < this.rows; r++) for (let c = 0; c < this.cols; c++) if (this.T(c, r) !== 'R') cells.push([c, r]);
      cells.sort((a, b) => depth(...b) - depth(...a));
      const inflow = {}, out = {}, soak = {};
      let roof = 0, caught = 0;
      for (let r = 0; r < this.rows; r++) for (let c = 0; c < this.cols; c++) {
        if (this.T(c, r) === 'R') { roof += d.rain; if (this.place[k(c, r)] === 'barrel') caught += ITEMS.barrel.cap; } else inflow[k(c, r)] = d.rain;
      }
      caught = Math.min(roof, caught);
      inflow[k(...d.spout)] += roof - caught;
      let dorm = 0;
      for (const [c, r] of cells) {
        const key = k(c, r), w = inflow[key] || 0, t = this.T(c, r);
        if (t === 'H') { dorm += w; continue; }
        const it = this.place[key];
        const cap = it ? ITEMS[it].cap : t === 'g' ? 1 : 0;
        const left = Math.max(0, w - cap);
        soak[key] = w - left;
        out[key] = left;
        const n = this.next(c, r);
        inflow[k(...n)] = (inflow[k(...n)] || 0) + left;
      }
      return { dorm, inflow, out, soak, roof, caught };
    }
    clear() { this.place = {}; }
    applySolution() { for (const [c, r, it] of this.def.solution) this.place[c + ',' + r] = it; }
    validate() { return this.spent() > this.def.budget ? `Over budget! ${this.spent()} / ${this.def.budget} scraps.` : null; }
    startTest() {
      this.state = 'test';
      this.anim = 0;
      this.res = this.simulate();
      CK.Audio.sfx('splash');
    }
    resetTest() { this.res = null; }
    cellAt(mx, my) {
      const c = Math.floor((mx - this.ox) / this.cs), r = Math.floor((my - this.oy) / this.cs);
      return c >= 0 && r >= 0 && c < this.cols && r < this.rows ? [c, r] : null;
    }
    toggle(c, r, tool) {
      const key = c + ',' + r, t = this.T(c, r);
      if (this.place[key]) { delete this.place[key]; CK.Audio.sfx('back'); return; }
      const it = Object.keys(ITEMS).find((id) => ITEMS[id].on === t && (!tool || id === tool)) || Object.keys(ITEMS).find((id) => ITEMS[id].on === t);
      if (!it) { CK.Audio.sfx('error'); this.flashMsg(t === 'H' ? 'That is the dorm. Keep the water away from it!' : 'Nothing to build there.'); return; }
      this.place[key] = it;
      this.tool = it;
      CK.Audio.sfx('place');
    }
    update(dt) {
      if (this.commonUpdate(dt)) {
        if (this.state === 'test') this.updateTest(dt);
        return;
      }
      for (const id of Object.keys(ITEMS)) if (Input.key('Digit' + ITEMS[id].key)) { this.tool = id; CK.Audio.sfx('blip'); }
      const [c, r] = this.cursor;
      if (Input.hit('left')) this.cursor = [Math.max(0, c - 1), r];
      if (Input.hit('right')) this.cursor = [Math.min(this.cols - 1, c + 1), r];
      if (Input.hit('up')) this.cursor = [c, Math.max(0, r - 1)];
      if (Input.hit('down')) this.cursor = [c, Math.min(this.rows - 1, r + 1)];
      if (Input.hit('ok')) this.toggle(...this.cursor, null);
      if (Input.mouse.moved) { const cell = this.cellAt(Input.mouse.x, Input.mouse.y); if (cell) this.cursor = cell; }
      if (Input.mouse.pressed) {
        const cell = this.cellAt(Input.mouse.x, Input.mouse.y);
        if (cell) this.toggle(...cell, null);
        // tool chips in the panel
        Object.keys(ITEMS).forEach((id, i) => { if (D.inRect(Input.mouse.x, Input.mouse.y, 690, 238 + i * 44, 246, 38)) { this.tool = id; CK.Audio.sfx('blip'); } });
      }
    }
    updateTest(dt) {
      this.anim += dt;
      if (Math.random() < 0.9) this.parts.emit({ x: U.rand(this.ox, this.ox + this.cols * this.cs), y: this.oy - 40, vy: 520, vx: -40, life: 0.6, size: 2.5, shape: 'drop', color: '#9fd3ff' });
      if (this.anim > 3.2 || CK.autoSkip) {
        const ok = this.res.dorm <= this.def.limit;
        if (ok) {
          CK.setFlag('st_garden');
          this.finish(true, 'The dorm stays dry!', `Only ${this.res.dorm} reached the dorm. ${this.def.lesson}`);
        } else this.finish(false, 'Splash! The dorm flooded.', `${this.res.dorm} units of water reached the dorm (the limit is ${this.def.limit}). Follow the arrows: where does the water pile up?`);
      }
    }
    draw(ctx) {
      this.drawFrame(ctx);
      const { ox, oy, cs } = this;
      const res = this.state !== 'build' ? this.res : null;
      const grow = res ? Math.min(1, this.anim / 2.4) : 0;
      // the ground slab, with a little thickness
      D.box3(ctx, ox - 8, oy - 8, this.cols * cs + 16, this.rows * cs + 16, 16, { fill: '#6f5238', lw: 3, flute: false });
      for (let r = 0; r < this.rows; r++) for (let c = 0; c < this.cols; c++) {
        const t = this.T(c, r), x = ox + c * cs, y = oy + r * cs, key = c + ',' + r;
        if (t === 'R') continue;
        const col = t === 'g' ? '#8fd46c' : t === 'p' ? '#b8b4ae' : '#e2b27a';
        ctx.fillStyle = D.vg(ctx, x + cs / 2, y + cs / 2, cs * 0.8, col, 0.4);
        ctx.fillRect(x, y, cs, cs);
        if (t === 'p') { ctx.strokeStyle = 'rgba(0,0,0,.1)'; ctx.lineWidth = 2; ctx.strokeRect(x + 6, y + 6, cs - 12, cs - 12); }
        if (t === 'g') for (let i = 0; i < 4; i++) D.line(ctx, x + 12 + U.hash(c, r, i) * 48, y + 20 + U.hash(r, c, i) * 40, x + 14 + U.hash(c, r, i) * 48, y + 13 + U.hash(r, c, i) * 40, '#5fae4a', 2);
        const it = this.place[key];
        if (it === 'garden') {
          D.ellipse(ctx, x + cs / 2, y + cs / 2 + 4, cs * 0.4, cs * 0.3, '#6f5238', D.C.ink, 2);
          for (let i = 0; i < 6; i++) { const fx = x + 18 + U.hash(c, i) * 36, fy = y + 26 + U.hash(r, i) * 26; D.line(ctx, fx, fy, fx, fy - 9, '#4f9a4a', 2); D.ball(ctx, fx, fy - 10, 3.2, ['#ff9ec7', '#ffd25a', '#a68be6'][i % 3], { lw: 1 }); }
        } else if (it === 'pavers') {
          for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { D.rr(ctx, x + 8 + i * 19, y + 8 + j * 19, 16, 16, 3); ctx.fillStyle = '#d6d0c6'; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1.2; ctx.stroke(); }
        }
        // water while testing: deeper blue where more is flowing
        if (res && t !== 'H') {
          const w = (res.inflow[key] || 0) * grow;
          if (w > 0.01) { ctx.fillStyle = `rgba(70,160,235,${Math.min(0.75, 0.12 + w / 30)})`; ctx.fillRect(x + 2, y + 2, cs - 4, cs - 4); }
        }
        ctx.strokeStyle = 'rgba(40,20,10,.25)'; ctx.lineWidth = 1; ctx.strokeRect(x, y, cs, cs);
        // flow arrow
        const n = this.next(c, r);
        if (n && t !== 'H') {
          const ax = x + cs / 2, ay = y + cs / 2, dx = n[0] - c, dy = n[1] - r;
          const flowW = res ? 2 + Math.min(8, (res.out[key] || 0) / 4) * grow : 2;
          D.line(ctx, ax - dx * 12, ay - dy * 12, ax + dx * 16, ay + dy * 16, res ? '#1f6fb0' : 'rgba(30,90,160,.55)', flowW);
          D.poly(ctx, [ax + dx * 24, ay + dy * 24, ax + dx * 14 - dy * 7, ay + dy * 14 - dx * 7, ax + dx * 14 + dy * 7, ay + dy * 14 + dx * 7], res ? '#1f6fb0' : 'rgba(30,90,160,.55)');
        }
        if (res && t !== 'H') {
          const s = res.soak[key] || 0;
          if (s > 0 && grow > 0.9) D.text(ctx, `-${s}`, x + cs - 8, y + 18, { size: 13, weight: 700, align: 'right', color: '#2f7a2f', outline: '#fff', ow: 3 });
        }
      }
      // the library roof, a raised block, with its downspout
      const [sx, sy] = this.def.spout;
      D.box3(ctx, ox + 4, oy + cs + 4, cs * 2 - 8, cs * 2 - 8, 26, { fill: '#c9a77a', lw: 3, top: '#8a6a50', flute: false });
      D.text(ctx, 'LIBRARY', ox + cs, oy + cs * 2 + 6, { size: 14, weight: 700, align: 'center', color: '#3d2412' });
      D.line(ctx, ox + cs * 1.5, oy + cs * 3 - 6, ox + sx * cs + cs / 2, oy + sy * cs + cs / 2 - 10, '#8a96a6', 5);
      for (let r = 1; r <= 2; r++) for (let c = 0; c <= 1; c++) if (this.place[c + ',' + r] === 'barrel') {
        const bx = ox + c * cs + cs / 2 + (c ? 6 : -6), by = oy + r * cs + cs / 2 - 10;
        D.rr(ctx, bx - 13, by - 16, 26, 30, 7); ctx.fillStyle = D.lgx(ctx, bx - 13, bx + 13, '#5aa9e6'); ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 2; ctx.stroke();
        D.line(ctx, bx - 13, by - 6, bx + 13, by - 6, D.C.ink, 1.5);
      }
      // the dorm, waiting nervously at the bottom right
      const dx0 = ox + (this.cols - 1) * this.cs, dy0 = oy + (this.rows - 1) * cs;
      D.box3(ctx, dx0 + 6, dy0 + 10, cs - 12, cs - 14, 16, { fill: '#b9674a', lw: 2.5, top: '#5a5f6e', flute: false });
      D.rr(ctx, dx0 + cs / 2 - 8, dy0 + cs - 24, 16, 20, 5); ctx.fillStyle = '#5a3a22'; ctx.fill();
      D.text(ctx, 'DORM', dx0 + cs / 2, dy0 + 28, { size: 12, weight: 700, align: 'center', color: '#fff', outline: D.C.ink, ow: 3 });
      if (res) {
        const lvl = res.dorm * grow;
        D.text(ctx, `${Math.round(lvl)}`, dx0 + cs / 2, dy0 - 10, { size: 22, weight: 700, align: 'center', color: lvl > this.def.limit ? '#ef6b6b' : '#6cc56c', outline: '#fff', ow: 4 });
        if (lvl > this.def.limit) D.ellipse(ctx, dx0 + cs / 2, dy0 + cs - 2, 20 + lvl, 6 + lvl * 0.2, 'rgba(70,160,235,0.6)');
      }
      // cursor
      if (this.state === 'build') {
        const [c, r] = this.cursor;
        const pulse = 0.5 + Math.sin(this.t * 6) * 0.5;
        ctx.strokeStyle = `rgba(255,236,120,${0.6 + pulse * 0.4})`; ctx.lineWidth = 4;
        ctx.strokeRect(ox + c * cs + 2, oy + r * cs + 2, cs - 4, cs - 4);
      }
      this.drawPanel(ctx, (ctx, px, y, pw) => {
        const sp = this.spent();
        D.text(ctx, `Budget: ${sp} / ${this.def.budget} scraps`, px + 16, y + 4, { size: 15, weight: 700, color: sp > this.def.budget ? '#c2410c' : '#3d2412' });
        const r = this.state === 'build' ? null : this.res;
        D.text(ctx, r ? `Water at the dorm: ${r.dorm} (limit ${this.def.limit})` : `Keep the dorm at ${this.def.limit} or less`, px + 16, y + 24, { size: 13, color: '#5b3a1e' });
        Object.keys(ITEMS).forEach((id, i) => {
          const it = ITEMS[id], by = 238 + i * 44, sel = this.tool === id;
          D.rr(ctx, px + 14, by, pw - 28, 38, 8); ctx.fillStyle = sel ? '#fff0b8' : '#fffaf0'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = sel ? 2.5 : 1.5; ctx.stroke();
          D.ball(ctx, px + 32, by + 19, 9, it.color, { lw: 1.5 });
          D.text(ctx, `${it.key}. ${it.name}`, px + 48, by + 17, { size: 14, weight: 700 });
          D.text(ctx, `soaks ${it.cap} · ${it.cost} scraps · on ${it.on === 'g' ? 'grass' : it.on === 'p' ? 'pavement' : 'roof'}`, px + 48, by + 32, { size: 11, color: '#7a5434' });
        });
      });
      D.text(ctx, 'Click a square (or arrows + Z) to build what fits there. Click again to remove.', 30, H - 14, { size: 13, color: '#cfe6ff' });
      this.drawOverlay(ctx);
    }
  }
  CK.PuzzleTypes.rain = RainGardenPuzzle;
})();
