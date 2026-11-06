// Cardboard Kingdom - game state, party stats, saving.
(function () {
  'use strict';
  const CK = window.CK;
  const Data = CK.Data;

  CK.newGame = function (coop) {
    CK.coop = !!coop;
    CK.G = {
      coop: !!coop,
      chapter: 'campus',
      flags: {},
      scraps: 0,
      snacks: 2,
      reinforce: 0,
      level: 1,
      xp: 0,
      owned: ['knight', 'tower', 'kite'],
      party: [
        { id: 'sam', costume: 'knight', hp: 1 },
        { id: 'corry', costume: 'tower', hp: 1 },
        { id: 'pip', costume: 'kite', hp: 1 },
      ],
      pos: null,
      pos2: null,
      journal: [],
      time: 0,
      items: {},
      pets: 0,
      found: {},
    };
    if (coop) {
      CK.G.owned.push('umbrella');
      CK.G.party.push({ id: 'jules', costume: 'umbrella', hp: 1 });
    }
    CK.healParty();
    return CK.G;
  };

  CK.xpToNext = (lvl) => 10 + lvl * 7;

  CK.stats = function (m) {
    const G = CK.G;
    const b = Data.party[m.id];
    const c = Data.costumes[m.costume] || { hp: 0, atk: 0 };
    const r = Data.reinforce[G.reinforce];
    return {
      name: b.name,
      maxHp: Math.round(b.hp + (G.level - 1) * b.hpG + c.hp),
      atk: Math.round(b.atk + (G.level - 1) * b.atkG + c.atk),
      def: r.def,
      water: r.water,
    };
  };

  CK.healParty = function () {
    for (const m of CK.G.party) m.hp = CK.stats(m).maxHp;
  };

  CK.gainXp = function (n) {
    const G = CK.G;
    G.xp += n;
    let ups = 0;
    while (G.xp >= CK.xpToNext(G.level)) {
      G.xp -= CK.xpToNext(G.level);
      G.level++;
      ups++;
    }
    return ups;
  };

  CK.flag = (k) => !!CK.G.flags[k];
  CK.setFlag = (k, v) => (CK.G.flags[k] = v === undefined ? true : v);

  CK.giveCostume = function (id) {
    if (!CK.G.owned.includes(id)) CK.G.owned.push(id);
  };

  CK.journal = function (text) {
    if (!CK.G.journal.includes(text)) CK.G.journal.push(text);
  };

  CK.saveGame = function () {
    const ow = CK.Scenes.find((s) => s.isOverworld);
    if (ow) {
      CK.G.pos = { x: ow.player.x, y: ow.player.y, chapter: CK.G.chapter };
      CK.G.pos2 = ow.p2 ? { x: ow.p2.x, y: ow.p2.y } : null;
    }
    CK.lastSave = CK.time;
    return CK.Save.write(CK.G);
  };
  CK.loadGame = function () {
    const d = CK.Save.read();
    if (!d || !d.party) return false;
    CK.newGame(d.coop);
    Object.assign(CK.G, d);
    CK.coop = !!CK.G.coop;
    return true;
  };
})();
