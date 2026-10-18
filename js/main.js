// Cardboard Kingdom - boot.
(function () {
  'use strict';
  const CK = window.CK;
  function start() {
    const boot = document.getElementById('boot');
    if (boot) boot.remove();
    CK.newGame();
    CK.boot(new CK.TitleScene());
    document.getElementById('game').focus();
  }
  // wait (briefly) for the rounded font so text measures correctly
  const fontReady = document.fonts && document.fonts.load ? document.fonts.load('600 20px Fredoka') : Promise.resolve();
  Promise.race([fontReady, new Promise((r) => setTimeout(r, 1500))]).then(start, start);

  // debug helpers for testing: CK.debug.chapter('fall'), CK.debug.puzzle('fall_bridge')
  CK.debug = {
    chapter(id) {
      CK.newGame();
      const order = ['spring', 'summer', 'fall', 'winter'];
      const flagsBefore = {
        summer: ['spring_arrived', 'sp_met_mayor', 'spring_dam', 'spring_boss'],
        fall: ['summer_arrived', 'su_met_skipper', 'summer_gates', 'su_wall_beaten', 'summer_boss'],
        winter: ['fall_arrived', 'fa_met_ember', 'fall_bridge', 'fall_boss'],
      };
      const idx = order.indexOf(id);
      for (let i = 1; i <= idx; i++) for (const f of flagsBefore[order[i]]) CK.setFlag(f);
      CK.G.level = [1, 4, 7, 10][idx] || 1;
      CK.G.owned = ['knight', 'tower', 'kite', 'lighthouse', 'bulldozer', 'bridge'].slice(0, 3 + idx);
      CK.healParty();
      CK.gotoChapter(id);
    },
    puzzle(id) {
      return CK.startPuzzle(id);
    },
    battle(id) {
      return CK.startBattle(id);
    },
  };
})();
