// Cardboard Kingdom - civil engineering building puzzles.
//  dam    : side-view gravity dam. Water pressure grows with depth (p = rho*g*h).
//  gates  : top-down harbor flood defense. Levees + floodgates, boats must still reach docks.
//  truss  : bridge design solved with a real direct-stiffness truss analysis.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input;
  const W = CK.W, H = CK.H;

  // =================================================================== data
  const MATS = {
    single: { name: 'Single-wall', str: 1, cost: 1, color: '#ecc38c', key: '1' },
    double: { name: 'Double-wall', str: 2, cost: 2, color: '#d9a66b', key: '2' },
    triple: { name: 'Triple-wall', str: 3, cost: 3, color: '#b98455', key: '3' },
    laminated: { name: 'Laminated', str: 5, cost: 4, color: '#8a5a2e', key: '4' },
    spill: { name: 'Spillway chute', str: 2, cost: 2, color: '#9fb7c9', key: '5' },
    basin: { name: 'Stilling basin', str: 0, cost: 2, color: '#7d8a99', key: '6' },
  };
  CK.MATS = MATS;

  CK.PuzzleDefs = {
    spring_dam: {
      type: 'dam', title: 'Blossom Brook Check Dam', cols: 11, rows: 7, build: [4, 7], level: 5,
      budget: 16, supply: { single: 8, double: 3, triple: 2, laminated: 1 },
      brief: 'Hold back the brook until it is 5 blocks deep. Each row must be at least as strong as the water is deep there. Every block needs something under it.',
      hint: 'Deep water pushes hardest. Put your strongest cardboard (laminated, triple) at the bottom and get lighter toward the top, like a triangle. You do not have enough single-wall to do it all with one kind.',
      lesson: 'Water pressure grows with depth (p = ρ·g·h). That is why real dams are thick at the bottom and thin at the top.',
      solution: [[0, 4, 'laminated'], [0, 5, 'single'], [1, 4, 'triple'], [1, 5, 'single'], [2, 4, 'double'], [2, 5, 'single'], [3, 4, 'double'], [4, 4, 'single']],
    },
    winter_spillway: {
      type: 'dam', mode: 'spill', title: 'The Summit Spillway', cols: 12, rows: 8, build: [3, 9], minHeight: 5,
      budget: 22, supply: { single: 6, double: 3, triple: 2, laminated: 2, spill: 3, basin: 1 },
      brief: 'The storm never stops, so the water WILL go over the top. Build a dam at least 5 rows tall. Its top row must be all spillway chutes, and a stilling basin must sit right after the dam at the bottom. Overflow adds 1 extra block of push to every row.',
      hint: 'Rows need (height - row + 1) strength. A 5-tall dam needs 6, 5, 4, 3, 2 from the bottom up. Top row: spillway chutes. Then put the basin on the riverbed just downstream (right) of your bottom row.',
      lesson: 'Spillways let floods pass safely over a dam instead of breaking it, and stilling basins calm the falling water so it does not dig away the dam\'s toe. The flow can then spin turbines: rain becomes power.',
      solution: [[0, 3, 'laminated'], [0, 4, 'single'], [1, 3, 'laminated'], [1, 4, 'single'], [2, 3, 'triple'], [2, 4, 'single'], [3, 3, 'triple'], [4, 3, 'spill'], [0, 5, 'basin']],
    },
    summer_gates: {
      type: 'gates', title: 'Sunpatch Harbor Floodgates', budget: 6,
      grid: [
        '~~~~~~~~~~~~',
        '~~~~~~~~~~~~',
        '^^sss^C^^sss',
        '^^^s^^C^^^s^',
        'sHssssCssHss',
        'ssHs^sCs^sHs',
        '^sssssDsssss',
        '^^Hss^^^ssH^',
      ],
      brief: 'Tonight the storm surge floods every sand tile it can reach from the sea. Keep all houses dry. But the Brinemarsh boats must still sail from the sea to the dock, through canal water and open gates.',
      hint: 'Levees (1 scrap) go on sand. Floodgates (3 scraps) go on canal water: they close for storms and open for boats. Defend at the narrow spots behind the dunes, not along the whole beach.',
      lesson: 'Real harbors like London\'s Thames Barrier use gates that close only for storms. Engineers look for the narrowest "choke points" to defend, because walls are expensive.',
      solution: [[3, 3, 'levee'], [10, 3, 'levee'], [6, 3, 'gate']],
    },
    fall_bridge: {
      type: 'truss', title: 'Amberleaf Truss Bridge', cols: 7, rows: 3, budget: 30, load: 7,
      brief: 'Connect the dots with cardboard tubes so a cart can roll across. The whole bottom row is the road deck. Triangles hold their shape; squares fold flat. Click a tube again to reinforce it, right-click to remove it.',
      hint: 'Try a top chord one row up, a vertical tube at every column, and one diagonal per square. Slope the diagonals DOWN toward the middle so they get pulled (strong) instead of squished (weak). Then reinforce whatever glows red.',
      lesson: 'Trusses turn bending into pure push (compression) and pull (tension). Cardboard, like steel cables, is great in tension but long thin pieces buckle in compression (Euler buckling ∝ 1/L²).',
      solution: null,
    },
  };

  // ================================================================ base UI
  class PuzzleBase {
    constructor(def) {
      this.def = def;
      this.t = 0;
      this.finished = false;
      this.solved = false;
      this.parts = new CK.Particles();
      this.msg = null;
      this.state = 'build';
      this.showHint = false;
      this.fails = 0;
    }
    // after two failed tests, Grandma's sketchbook has the answer
    canBlueprint() {
      return this.fails >= 2 && !!this.applySolution && this.state === 'build';
    }
    enter() {
      CK.showTouchPad = false;
      this.prevMusic = [CK.Audio.track, CK.Audio.night];
      if (CK.autoSkip && this.applySolution) {
        this.applySolution();
        this.startTest();
      }
    }
    exit() {
      if (this.prevMusic) CK.Audio.setMusic(this.prevMusic[0], this.prevMusic[1]);
    }
    buttons() {
      const y = H - 58;
      return [
        { id: 'test', label: 'Test it! (T)', x: 686, y, w: 140 },
        { id: 'hint', label: 'Hint (H)', x: 832, y, w: 110 },
        { id: 'clear', label: 'Clear', x: 686, y: y - 48, w: 100 },
        { id: 'leave', label: 'Leave', x: 792, y: y - 48, w: 150 },
      ].concat(this.canBlueprint() ? [{ id: 'grandma', label: "Grandma's Blueprint (G)", x: 686, y: y - 96, w: 256 }] : []);
    }
    commonUpdate(dt) {
      this.t += dt;
      this.parts.update(dt);
      if (this.state === 'result') {
        if (this.t - this.resultT > 0.6 && (Input.hit('ok') || Input.mouse.pressed || CK.autoSkip)) {
          if (this.success) this.close(true);
          else {
            this.state = 'build';
            this.resetTest && this.resetTest();
          }
        }
        return true;
      }
      if (this.state === 'test') return true;
      let clicked = null;
      if (Input.mouse.pressed) for (const b of this.buttons()) if (D.inRect(Input.mouse.x, Input.mouse.y, b.x, b.y, b.w, 40)) clicked = b.id;
      if (Input.key('KeyT') || clicked === 'test') {
        this.tryTest();
        return true;
      }
      if (Input.key('KeyH') || clicked === 'hint') {
        this.showHint = !this.showHint;
        CK.Audio.sfx('blip');
        return true;
      }
      if (this.canBlueprint() && (Input.key('KeyG') || clicked === 'grandma')) {
        this.clear();
        this.applySolution();
        this.usedBlueprint = true;
        CK.Audio.sfx('magic');
        this.flashMsg("You flip open Grandma Rosie's sketchbook. There's a pencil drawing of this exact problem, solved. \"Don't worry, sweetheart. Everybody needs a hand sometimes.\" Press Test!");
        return true;
      }
      if (clicked === 'clear') {
        this.clear();
        CK.Audio.sfx('back');
        return true;
      }
      if (clicked === 'leave' || Input.key('Escape')) {
        this.close(false);
        return true;
      }
      return !!clicked;
    }
    tryTest() {
      const err = this.validate();
      if (err) {
        CK.Audio.sfx('error');
        this.flashMsg(err);
        return;
      }
      CK.Audio.sfx('select');
      this.startTest();
    }
    flashMsg(text) {
      this.msg = { text, t: 0 };
    }
    finish(success, title, body) {
      this.state = 'result';
      this.success = success;
      this.resultT = this.t;
      this.result = { title, body };
      if (success) {
        CK.Audio.sfx('win');
        this.parts.burst(60, () => ({ x: U.rand(100, 600), y: -10, vx: U.rand(-60, 60), vy: U.rand(80, 220), sway: 30, life: 3, size: U.rand(4, 7), shape: 'square', color: U.pick(['#ef6b6b', '#ffd25a', '#6cc56c', '#5aa9e6', '#ff9ec7']), spin: 5 }));
      } else {
        CK.Audio.sfx('break');
        this.fails++;
        if (this.fails === 2 && this.applySolution) this.result.body += "  (Stuck? Grandma's Blueprint is now available. Press G.)";
      }
    }
    close(solved) {
      this.solved = solved;
      CK.flaps(() => {
        this.finished = true;
        CK.Scenes.remove(this);
      });
    }
    drawFrame(ctx) {
      ctx.fillStyle = '#2f5f8a';
      ctx.fillRect(0, 0, W, H);
      // blueprint grid
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < W; x += 20) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = 0; y < H; y += 20) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
      D.text(ctx, this.def.title, 24, 40, { size: 26, weight: 700, color: '#fff' });
      D.text(ctx, 'BLUEPRINT', 24, 62, { size: 13, weight: 700, color: '#9fd3ff' });
    }
    drawPanel(ctx, extra) {
      const px = 676, pw = 274;
      D.panel(ctx, px, 14, pw, H - 140 - (this.canBlueprint() ? 48 : 0), { fill: '#fff4dc', tape: false });
      let y = 44;
      const text = this.showHint ? this.def.hint : this.def.brief;
      D.text(ctx, this.showHint ? 'HINT' : 'THE JOB', px + 16, y, { size: 13, weight: 700, color: '#ef6b6b' });
      y += 20;
      for (const l of D.wrap(ctx, text, pw - 32, 14, 500)) {
        D.text(ctx, l, px + 16, y, { size: 14, weight: 500 });
        y += 18;
      }
      y += 8;
      if (extra) extra(ctx, px, y, pw);
      for (const b of this.buttons()) {
        const hov = D.inRect(Input.mouse.x, Input.mouse.y, b.x, b.y, b.w, 40);
        D.button(ctx, b.x, b.y, b.w, 40, b.label, { hover: hov, size: 16, color: b.id === 'test' ? (hov ? '#a6e39a' : '#8fd08a') : b.id === 'grandma' ? (hov ? '#ffc9dc' : '#ffb3cc') : null });
      }
    }
    drawOverlay(ctx) {
      if (this.msg) {
        this.msg.t += 1 / 60;
        if (this.msg.t > 3.5) this.msg = null;
        else {
          const lines = D.wrap(ctx, this.msg.text, 560, 17, 600);
          const h = 26 + lines.length * 22;
          D.panel(ctx, 50, H - 30 - h, 600, h, { fill: '#ffe1d6', tape: false });
          lines.forEach((l, i) => D.text(ctx, l, 70, H - 30 - h + 30 + i * 22, { size: 17, weight: 600, color: '#8a2a2a' }));
        }
      }
      this.parts.draw(ctx);
      if (this.state === 'result') {
        const a = Math.min(1, (this.t - this.resultT) * 3);
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(20,30,50,0.45)';
        ctx.fillRect(0, 0, W, H);
        const body = D.wrap(ctx, this.result.body, 520, 17, 500);
        const h = 110 + body.length * 22;
        D.panel(ctx, W / 2 - 290, H / 2 - h / 2, 580, h, { fill: '#fff4dc' });
        D.text(ctx, this.result.title, W / 2, H / 2 - h / 2 + 46, { size: 30, weight: 700, align: 'center', color: this.success ? '#3f8f3f' : '#c2410c' });
        body.forEach((l, i) => D.text(ctx, l, W / 2, H / 2 - h / 2 + 80 + i * 22, { size: 17, weight: 500, align: 'center' }));
        D.text(ctx, this.success ? 'Click / Z to continue' : 'Click / Z to fix your design', W / 2, H / 2 + h / 2 - 18, { size: 14, align: 'center', color: '#7a5434' });
        ctx.globalAlpha = 1;
      }
    }
  }

  // ==================================================================== DAM
  class DamPuzzle extends PuzzleBase {
    constructor(def) {
      super(def);
      this.cs = Math.min(52, Math.floor(360 / def.rows));
      this.ox = 40;
      this.oy = 470 - def.rows * this.cs;
      this.grid = [];
      for (let r = 0; r < def.rows; r++) this.grid.push(new Array(def.cols).fill(null));
      this.mat = Object.keys(def.supply)[0];
      this.cursor = [0, def.build[0]];
      this.level = 0;
    }
    isBuild(c) {
      return c >= this.def.build[0] && c <= this.def.build[1];
    }
    used(mat) {
      let n = 0;
      for (const row of this.grid) for (const m of row) if (m === mat) n++;
      return n;
    }
    spent() {
      let s = 0;
      for (const row of this.grid) for (const m of row) if (m) s += MATS[m].cost;
      return s;
    }
    rowStrength(r) {
      let s = 0;
      for (const m of this.grid[r]) if (m) s += MATS[m].str;
      return s;
    }
    rowHas(r) {
      return this.grid[r].some((m) => m && m !== 'basin');
    }
    height() {
      let h = 0;
      while (h < this.def.rows && this.rowHas(h)) h++;
      return h;
    }
    targetLevel() {
      return this.def.mode === 'spill' ? this.height() : this.def.level;
    }
    need(r) {
      const L = this.targetLevel();
      return Math.max(0, L - r + (this.def.mode === 'spill' ? 1 : 0));
    }
    applySolution() {
      this.clear();
      for (const [r, c, m] of this.def.solution) this.grid[r][c] = m;
    }
    clear() {
      for (const row of this.grid) row.fill(null);
    }
    place(r, c) {
      if (!this.isBuild(c)) return this.flashMsg('You can only build in the dashed construction zone.');
      const m = this.mat;
      if (m === 'basin') {
        if (r !== 0) return this.flashMsg('The stilling basin sits on the riverbed (bottom row).');
      } else if (r > 0 && (!this.grid[r - 1][c] || this.grid[r - 1][c] === 'basin')) return this.flashMsg('Every block needs a block under it. Cardboard does not float... well, not for long.');
      const prev = this.grid[r][c];
      if (prev !== m && this.used(m) >= this.def.supply[m]) return this.flashMsg(`You are out of ${MATS[m].name}.`);
      this.grid[r][c] = m;
      CK.Audio.sfx('build');
      this.parts.burst(6, () => ({ x: this.ox + c * this.cs + 26, y: this.oy + (this.def.rows - 1 - r) * this.cs + 26, vx: U.rand(-80, 80), vy: U.rand(-120, -20), g: 300, life: 0.6, size: 5, shape: 'square', color: MATS[m].color }));
    }
    erase(r, c) {
      if (!this.grid[r][c]) return;
      for (let rr = r; rr < this.def.rows; rr++) {
        if (rr > r && (!this.grid[rr][c])) break;
        this.grid[rr][c] = null;
      }
      CK.Audio.sfx('tape');
    }
    validate() {
      if (this.spent() > this.def.budget) return `Over budget! ${this.spent()} / ${this.def.budget} scraps. Try cheaper materials up top.`;
      if (!this.rowHas(0)) return 'Place some cardboard first!';
      if (this.def.mode === 'spill') {
        const h = this.height();
        if (h < this.def.minHeight) return `The waterwheel needs a dam at least ${this.def.minHeight} rows tall. Yours is ${h}.`;
      }
      return null;
    }
    startTest() {
      this.state = 'test';
      this.level = 0;
      this.failRow = -1;
      this.burst = 0;
      this.testT = 0;
      CK.Audio.sfx('splash');
    }
    resetTest() {
      this.level = 0;
      this.failRow = -1;
      this.burst = 0;
    }
    analyze() {
      // returns {ok, row, kind}
      const L = this.targetLevel();
      const d = this.def;
      for (let r = 0; r < L; r++) {
        if (!this.rowHas(r)) return { ok: false, row: r, kind: 'leak' };
        if (this.rowStrength(r) < this.need(r)) return { ok: false, row: r, kind: 'weak' };
      }
      if (d.mode === 'spill') {
        const top = this.height() - 1;
        if (this.grid[top].some((m) => m && m !== 'spill')) return { ok: false, row: top, kind: 'crest' };
        let toe = -1;
        for (let c = d.cols - 1; c >= 0; c--) if (this.grid[0][c] && this.grid[0][c] !== 'basin') { toe = c; break; }
        if (toe < 0 || this.grid[0][toe + 1] !== 'basin') return { ok: false, row: 0, kind: 'basin' };
      }
      return { ok: true };
    }
    update(dt) {
      if (this.commonUpdate(dt) && this.state !== 'test') return;
      const d = this.def;
      if (this.state === 'test') {
        this.testT += dt;
        const res = this.analysis || (this.analysis = this.analyze());
        const L = this.targetLevel();
        const stopAt = res.ok ? L : res.kind === 'leak' ? res.row + 0.6 : res.kind === 'weak' ? Math.min(L, res.row + this.rowStrength(res.row) + 0.4 - (d.mode === 'spill' ? 1 : 0)) : L;
        this.level = Math.min(stopAt, this.level + dt * 1.6);
        if (this.level >= stopAt - 0.001) {
          this.holdT = (this.holdT || 0) + dt;
          if (!res.ok) {
            this.failRow = res.row;
            this.burst = Math.min(1, this.burst + dt * 1.2);
            if (this.holdT > 0.05 && !this.cracked) {
              this.cracked = true;
              CK.Audio.sfx('break');
            }
          } else if (d.mode === 'spill') this.burst = Math.min(1, this.burst + dt);
          if (this.holdT > 1.6) {
            this.holdT = 0;
            this.cracked = false;
            this.analysis = null;
            if (res.ok) this.finish(true, d.mode === 'spill' ? 'The spillway works!' : 'The dam holds!', d.lesson);
            else {
              const msgs = {
                leak: `Row ${res.row + 1} from the bottom has no cardboard at all, so the water poured straight through.`,
                weak: `Row ${res.row + 1} has strength ${this.rowStrength(res.row)}, but the water pushes ${this.need(res.row)} there. Deeper water pushes harder!`,
                crest: 'The water went over the top, but the top row is not all spillway chutes. Plain cardboard got washed away.',
                basin: 'The falling water dug away the dam\'s toe! Put a stilling basin on the riverbed right after the bottom row.',
              };
              this.finish(false, 'Splash! It broke.', msgs[res.kind]);
            }
          }
        }
        return;
      }
      // build input
      if (Input.hit('left')) this.cursor[1] = Math.max(0, this.cursor[1] - 1);
      if (Input.hit('right')) this.cursor[1] = Math.min(d.cols - 1, this.cursor[1] + 1);
      if (Input.hit('up')) this.cursor[0] = Math.min(d.rows - 1, this.cursor[0] + 1);
      if (Input.hit('down')) this.cursor[0] = Math.max(0, this.cursor[0] - 1);
      const mats = Object.keys(d.supply);
      mats.forEach((m) => { if (Input.key('Digit' + MATS[m].key)) { this.mat = m; CK.Audio.sfx('blip'); } });
      if (Input.hit('ok')) this.place(this.cursor[0], this.cursor[1]);
      if (Input.key('KeyX') || Input.key('Backspace')) this.erase(this.cursor[0], this.cursor[1]);
      const cell = this.cellAt(Input.mouse.x, Input.mouse.y);
      if (cell && Input.mouse.moved) this.cursor = cell;
      if (Input.mouse.pressed) {
        if (cell) this.grid[cell[0]][cell[1]] === this.mat ? this.erase(...cell) : this.place(...cell);
        this.matRects().forEach((rc, i) => { if (D.inRect(Input.mouse.x, Input.mouse.y, ...rc)) { this.mat = mats[i]; CK.Audio.sfx('blip'); } });
      }
      if (Input.mouse.rpressed && cell) this.erase(...cell);
    }
    cellAt(mx, my) {
      const c = Math.floor((mx - this.ox) / this.cs), rr = Math.floor((my - this.oy) / this.cs);
      const r = this.def.rows - 1 - rr;
      if (c < 0 || c >= this.def.cols || r < 0 || r >= this.def.rows) return null;
      return [r, c];
    }
    matRects() {
      return Object.keys(this.def.supply).map((m, i) => [690 + (i % 2) * 128, 250 + Math.floor(i / 2) * 58, 122, 52]);
    }
    draw(ctx) {
      this.drawFrame(ctx);
      const d = this.def, cs = this.cs, ox = this.ox, oy = this.oy;
      const gw = d.cols * cs, gh = d.rows * cs;
      const night = d.mode === 'spill';
      // sky
      const g = ctx.createLinearGradient(0, oy - 40, 0, oy + gh);
      g.addColorStop(0, night ? '#2c2c63' : '#bfe8ff');
      g.addColorStop(1, night ? '#4a3f7a' : '#ffe3f1');
      ctx.fillStyle = g;
      D.rr(ctx, ox - 10, oy - 30, gw + 20, gh + 70, 12);
      ctx.fill();
      // village downstream
      const bx0 = ox + (d.build[1] + 1) * cs;
      for (let i = 0; i < 2; i++) {
        const hx = ox + gw - 70 - i * 80, hy = oy + gh;
        if (hx < bx0 + 30) continue;
        D.cardboard(ctx, hx - 22, hy - 40, 44, 40, { r: 3, lw: 2, fill: '#e2b27a' });
        D.poly(ctx, [hx - 28, hy - 40, hx, hy - 64, hx + 28, hy - 40], i ? '#ff8fb1' : '#a68be6', D.C.ink, 2);
        D.char(ctx, i ? 'critter' : 'critter', hx + 34, hy, { s: 0.7, species: i ? 'bunny' : 'hedgehog', color: i ? '#fff' : '#e6c9a3', mood: this.state === 'result' && !this.success ? 'sad' : 'happy' });
      }
      if (night) {
        // waterwheel at the far right
        const wx = ox + gw - 40, wy = oy + gh - 60;
        ctx.save(); ctx.translate(wx, wy); ctx.rotate(this.burst > 0 && this.analysis == null && this.state !== 'build' ? this.t * 2 : this.state === 'result' && this.success ? this.t * 2 : 0);
        for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); D.rr(ctx, -4, 0, 8, 40, 3); ctx.fillStyle = '#c99561'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 2; ctx.stroke(); }
        ctx.restore();
        D.circle(ctx, wx, wy, 10, '#8a5a2e', D.C.ink, 2);
      }
      // build zone
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = 'rgba(74,44,23,0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(ox + d.build[0] * cs, oy, (d.build[1] - d.build[0] + 1) * cs, gh);
      ctx.setLineDash([]);
      for (let r = 0; r < d.rows; r++)
        for (let c = d.build[0]; c <= d.build[1]; c++) {
          ctx.strokeStyle = 'rgba(74,44,23,0.12)';
          ctx.strokeRect(ox + c * cs, oy + (d.rows - 1 - r) * cs, cs, cs);
        }
      // water upstream
      let toeL = d.build[0];
      for (let c = 0; c < d.cols; c++) if (this.grid.some((row) => row[c] && row[c] !== 'basin')) { toeL = c; break; }
      if (this.level > 0) {
        const lv = this.level;
        const wy = oy + gh - lv * cs;
        // fill per row up to the first block in that row
        for (let r = 0; r < Math.ceil(lv); r++) {
          let stop = d.cols;
          for (let c = 0; c < d.cols; c++) if (this.grid[r][c] && this.grid[r][c] !== 'basin') { stop = c; break; }
          if (r === this.failRow && this.burst > 0) stop = d.cols;
          const top = Math.max(wy, oy + (d.rows - 1 - r) * cs);
          ctx.fillStyle = 'rgba(76,194,234,0.8)';
          ctx.fillRect(ox, top, stop * cs, oy + (d.rows - r) * cs - top);
        }
        ctx.beginPath();
        for (let x = 0; x <= toeL * cs; x += 8) ctx.lineTo(ox + x, wy + Math.sin(x * 0.08 + this.t * 3) * 3);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        // pressure arrows on the upstream face
        for (let r = 0; r < Math.ceil(lv); r++) {
          const depth = Math.max(0, lv - r - 0.5) + (d.mode === 'spill' && this.state === 'test' && lv >= this.height() - 0.01 ? 1 : 0);
          const len = 10 + depth * 14;
          const ay = oy + (d.rows - 1 - r) * cs + cs / 2;
          const ax = ox + toeL * cs - 6;
          D.line(ctx, ax - len, ay, ax, ay, '#1f5f8f', 4);
          D.poly(ctx, [ax, ay, ax - 10, ay - 7, ax - 10, ay + 7], '#1f5f8f');
        }
        // spill / burst downstream
        if (this.burst > 0) {
          const fr = this.failRow >= 0 ? this.failRow : this.height() - 1;
          const y0 = oy + (d.rows - 1 - fr) * cs + 10;
          ctx.fillStyle = 'rgba(76,194,234,0.75)';
          const reach = this.burst * (gw - (d.build[1] + 1) * cs + cs);
          ctx.fillRect(ox + (d.build[1]) * cs, oy + gh - 26 * this.burst - (this.failRow >= 0 ? 30 : 0), reach, 26 * this.burst + (this.failRow >= 0 ? 30 : 0));
          if (Math.random() < 0.6) this.parts.emit({ x: ox + (d.build[1] + 0.5) * cs, y: y0, vx: U.rand(60, 160), vy: U.rand(-40, 40), g: 400, life: 0.8, size: 4, shape: 'drop', color: '#7fd0ff' });
        }
      }
      // blocks
      for (let r = 0; r < d.rows; r++)
        for (let c = 0; c < d.cols; c++) {
          const m = this.grid[r][c];
          if (!m) continue;
          let x = ox + c * cs, y = oy + (d.rows - 1 - r) * cs;
          if (r === this.failRow && this.burst > 0) {
            x += this.burst * 120 + (c - d.build[0]) * 10;
            y += this.burst * this.burst * 60;
            ctx.save(); ctx.translate(x + cs / 2, y + cs / 2); ctx.rotate(this.burst * (c % 2 ? 1 : -1)); ctx.translate(-x - cs / 2, -y - cs / 2);
          }
          if (m === 'spill') {
            D.cardboard(ctx, x + 1, y + 1, cs - 2, cs - 2, { r: 4, lw: 2.5, fill: MATS[m].color, horizontal: true });
            D.poly(ctx, [x + 4, y + 10, x + cs - 4, y + 22, x + cs - 4, y + 30, x + 4, y + 18], '#5aa9e6');
          } else if (m === 'basin') {
            D.cardboard(ctx, x + 1, y + cs - 22, cs - 2, 21, { r: 3, lw: 2.5, fill: MATS[m].color });
            for (let i = 0; i < 3; i++) D.rr(ctx, x + 6 + i * 15, y + cs - 32, 8, 12, 2), (ctx.fillStyle = '#5d6875'), ctx.fill();
          } else {
            D.cardboard(ctx, x + 1, y + 1, cs - 2, cs - 2, { r: 4, lw: 2.5, fill: MATS[m].color, fstep: 12 - MATS[m].str * 1.5 });
            D.text(ctx, '' + MATS[m].str, x + cs / 2, y + cs / 2 + 7, { size: 18, align: 'center', weight: 700, color: '#fff', outline: D.C.ink, ow: 3 });
          }
          if (r === this.failRow && this.burst > 0) ctx.restore();
        }
      // riverbed
      D.cardboard(ctx, ox - 10, oy + gh, gw + 20, 22, { r: 4, fill: '#8a6a4a', lw: 3 });
      // row readouts
      if (this.state === 'build' || this.state === 'test') {
        const L = this.targetLevel();
        for (let r = 0; r < d.rows; r++) {
          const y = oy + (d.rows - 1 - r) * cs + cs / 2 + 5;
          const need = r < L ? this.need(r) : 0;
          const has = this.rowStrength(r);
          if (r < L) D.text(ctx, 'push ' + need, ox + 6, y, { size: 13, weight: 700, color: '#1f5f8f' });
          if (has || r < L) {
            const ok = has >= need && (r >= L || this.rowHas(r));
            D.text(ctx, (ok ? '✓ ' : '✗ ') + has, ox + (d.build[1] + 1) * cs + 6, y, { size: 14, weight: 700, color: ok ? '#2f7a2f' : '#c2410c' });
          }
        }
        if (d.mode !== 'spill') {
          const ty = oy + gh - d.level * cs;
          ctx.setLineDash([10, 6]);
          D.line(ctx, ox, ty, ox + d.build[0] * cs, ty, '#1f5f8f', 2);
          ctx.setLineDash([]);
          D.text(ctx, 'flood level', ox + 6, ty - 6, { size: 12, weight: 700, color: '#1f5f8f' });
        }
      }
      // cursor
      if (this.state === 'build') {
        const [r, c] = this.cursor;
        ctx.strokeStyle = '#ffd25a';
        ctx.lineWidth = 3;
        ctx.strokeRect(ox + c * cs + 2, oy + (d.rows - 1 - r) * cs + 2, cs - 4, cs - 4);
      }
      this.drawPanel(ctx, (ctx, px, y, pw) => {
        const spent = this.spent();
        D.text(ctx, `Budget: ${spent} / ${d.budget} scraps`, px + 16, y + 6, { size: 16, weight: 700, color: spent > d.budget ? '#c2410c' : D.C.ink });
        if (d.mode === 'spill') D.text(ctx, `Dam height: ${this.height()} (need ${d.minHeight}+)`, px + 16, y + 26, { size: 14, weight: 600 });
        const mats = Object.keys(d.supply);
        this.matRects().forEach((rc, i) => {
          const m = mats[i], M = MATS[m];
          const sel = m === this.mat;
          D.rr(ctx, ...rc, 8); ctx.fillStyle = sel ? '#ffe9a8' : '#fffaf0'; ctx.fill(); ctx.strokeStyle = sel ? '#ef6b6b' : D.C.ink; ctx.lineWidth = sel ? 3 : 1.5; ctx.stroke();
          D.cardboard(ctx, rc[0] + 6, rc[1] + 8, 26, 26, { r: 3, lw: 2, fill: M.color, flute: false });
          D.text(ctx, `${M.key}. ${M.name}`, rc[0] + 38, rc[1] + 20, { size: 11, weight: 700 });
          D.text(ctx, `str ${M.str}  $${M.cost}  x${d.supply[m] - this.used(m)}`, rc[0] + 38, rc[1] + 38, { size: 11, weight: 500, color: '#7a5434' });
        });
      });
      if (this.state === 'build') D.text(ctx, 'Click to place, click again or right-click to remove. Keys: arrows, Z place, X erase, 1-6 materials.', 40, H - 14, { size: 13, color: '#cfe6ff' });
      this.drawOverlay(ctx);
    }
  }

  // ================================================================== GATES
  class GatesPuzzle extends PuzzleBase {
    constructor(def) {
      super(def);
      this.cells = def.grid.map((row) => row.split(''));
      this.rows = this.cells.length;
      this.cols = this.cells[0].length;
      this.cs = 50;
      this.ox = 40;
      this.oy = 86;
      this.place = this.cells.map((row) => row.map(() => null));
      this.cursor = [3, 5];
      this.flood = null;
    }
    clear() {
      this.place = this.cells.map((row) => row.map(() => null));
    }
    applySolution() {
      this.clear();
      for (const [c, r, k] of this.def.solution) this.place[r][c] = k;
    }
    spent() {
      let s = 0;
      for (const row of this.place) for (const p of row) if (p) s += p === 'gate' ? 3 : 1;
      return s;
    }
    toggle(r, c) {
      const t = this.cells[r][c];
      if (this.place[r][c]) {
        this.place[r][c] = null;
        CK.Audio.sfx('tape');
        return;
      }
      if (t === 's') this.place[r][c] = 'levee';
      else if (t === 'C') this.place[r][c] = 'gate';
      else if (t === 'D') return this.flashMsg('That is the dock. The Brinemarsh boats need it!');
      else if (t === 'H') return this.flashMsg('Someone lives there. Build around houses, not on them.');
      else return this.flashMsg('You can only build levees on sand and floodgates on canal water.');
      CK.Audio.sfx('build');
    }
    // BFS from the sea. storm: water spreads over sand/canal/dock/house unless blocked.
    spread(storm) {
      const R = this.rows, Cn = this.cols;
      const seen = this.cells.map((row) => row.map(() => -1));
      const q = [];
      for (let r = 0; r < R; r++) for (let c = 0; c < Cn; c++) if (this.cells[r][c] === '~') { seen[r][c] = 0; q.push([r, c]); }
      while (q.length) {
        const [r, c] = q.shift();
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nc < 0 || nr >= R || nc >= Cn || seen[nr][nc] >= 0) continue;
          const t = this.cells[nr][nc], p = this.place[nr][nc];
          let pass;
          if (storm) pass = !p && 'sCDH'.includes(t);
          else pass = 'CD'.includes(t) && p !== 'levee';
          if (!pass) continue;
          seen[nr][nc] = seen[r][c] + 1;
          q.push([nr, nc]);
        }
      }
      return seen;
    }
    validate() {
      if (this.spent() > this.def.budget) return `Over budget! ${this.spent()} / ${this.def.budget} scraps.`;
      return null;
    }
    startTest() {
      this.state = 'test';
      this.testT = 0;
      this.flood = this.spread(true);
      this.calm = this.spread(false);
      CK.Audio.sfx('thunder');
    }
    resetTest() {
      this.flood = null;
      this.calm = null;
    }
    update(dt) {
      if (this.commonUpdate(dt) && this.state !== 'test') return;
      if (this.state === 'test') {
        this.testT += dt;
        if (this.testT > 4.2) {
          let wet = 0, dockOk = true;
          for (let r = 0; r < this.rows; r++)
            for (let c = 0; c < this.cols; c++) {
              if (this.cells[r][c] === 'H' && this.flood[r][c] >= 0) wet++;
              if (this.cells[r][c] === 'D' && this.calm[r][c] < 0) dockOk = false;
            }
          if (wet) this.finish(false, 'Soggy huts!', `${wet} house${wet > 1 ? 's' : ''} flooded. Follow the blue: where did the water sneak in?`);
          else if (!dockOk) this.finish(false, 'The boats are stuck!', 'The town is dry, but the Brinemarsh boats cannot reach their dock. Use a floodgate on the canal instead of blocking it.');
          else this.finish(true, 'Harbor saved!', this.def.lesson);
        }
        return;
      }
      if (Input.hit('left')) this.cursor[1] = Math.max(0, this.cursor[1] - 1);
      if (Input.hit('right')) this.cursor[1] = Math.min(this.cols - 1, this.cursor[1] + 1);
      if (Input.hit('up')) this.cursor[0] = Math.max(0, this.cursor[0] - 1);
      if (Input.hit('down')) this.cursor[0] = Math.min(this.rows - 1, this.cursor[0] + 1);
      if (Input.hit('ok')) this.toggle(...this.cursor);
      const c = Math.floor((Input.mouse.x - this.ox) / this.cs), r = Math.floor((Input.mouse.y - this.oy) / this.cs);
      const inside = c >= 0 && r >= 0 && c < this.cols && r < this.rows;
      if (inside && Input.mouse.moved) this.cursor = [r, c];
      if (inside && (Input.mouse.pressed || Input.mouse.rpressed)) this.toggle(r, c);
    }
    draw(ctx) {
      this.drawFrame(ctx);
      const { cs, ox, oy } = this;
      const stormT = this.state === 'test' ? this.testT * 4 : this.state === 'result' ? 99 : -1;
      for (let r = 0; r < this.rows; r++)
        for (let c = 0; c < this.cols; c++) {
          const t = this.cells[r][c], x = ox + c * cs, y = oy + r * cs;
          const col = { '~': '#3fc4e0', s: '#f8e3a6', '^': '#d9c27a', H: '#f8e3a6', C: '#5fd0ea', D: '#5fd0ea', R: '#9aa0a8' }[t];
          ctx.fillStyle = col;
          ctx.fillRect(x, y, cs, cs);
          ctx.strokeStyle = 'rgba(74,44,23,0.12)';
          ctx.strokeRect(x, y, cs, cs);
          if (t === '^') {
            D.poly(ctx, [x + 4, y + cs - 6, x + cs / 2, y + 8, x + cs - 4, y + cs - 6], '#cbb26a', D.C.ink, 1.5);
            D.line(ctx, x + cs / 2, y + 16, x + cs / 2 - 6, y + 6, '#6cc56c', 2);
          }
          if (t === '~') { const ph = Math.sin(this.t * 2 + c) * 3; D.line(ctx, x + 10, y + 25 + ph, x + 40, y + 25 + ph, 'rgba(255,255,255,.6)', 2); }
          if (t === 'H') {
            D.cardboard(ctx, x + 9, y + 18, 32, 26, { r: 2, lw: 2, fill: '#f3e2c0' });
            D.poly(ctx, [x + 5, y + 20, x + 25, y + 4, x + 45, y + 20], '#ef6b6b', D.C.ink, 2);
          }
          if (t === 'D') {
            for (let i = 0; i < 3; i++) D.cardboard(ctx, x + 4, y + 4 + i * 14, cs - 8, 12, { r: 2, lw: 1.5, fill: '#c99561', flute: false });
            D.text(ctx, '⚓', x + cs / 2, y + cs / 2 + 7, { size: 18, align: 'center', color: D.C.ink });
          }
          // storm flood overlay
          if (this.flood && this.flood[r][c] > 0 && this.flood[r][c] <= stormT) {
            ctx.fillStyle = t === 'H' ? 'rgba(239,107,107,0.65)' : 'rgba(40,140,220,0.55)';
            ctx.fillRect(x, y, cs, cs);
          }
          const p = this.place[r][c];
          if (p === 'levee') {
            D.cardboard(ctx, x + 3, y + 8, cs - 6, cs - 16, { r: 6, lw: 2.5, fill: '#b98455' });
            D.tape(ctx, x + 6, y + 18, cs - 12, 10, 0, 0.9);
          }
          if (p === 'gate') {
            const closed = this.state === 'test' && this.testT < 3;
            D.cardboard(ctx, x + 2, y + 2, 8, cs - 4, { r: 2, lw: 2, fill: '#7d8a99', flute: false });
            D.cardboard(ctx, x + cs - 10, y + 2, 8, cs - 4, { r: 2, lw: 2, fill: '#7d8a99', flute: false });
            if (closed || this.state === 'build') D.cardboard(ctx, x + 8, y + 10, cs - 16, cs - 20, { r: 2, lw: 2, fill: closed ? '#c9d3e0' : 'rgba(201,211,224,0.6)' });
          }
        }
      // boats on calm phase
      if (this.state === 'test' && this.testT > 3) {
        for (let r = 0; r < this.rows; r++)
          for (let c = 0; c < this.cols; c++)
            if (this.calm[r][c] > 0 && this.calm[r][c] <= (this.testT - 3) * 12) {
              const x = ox + c * cs + cs / 2, y = oy + r * cs + cs / 2;
              D.circle(ctx, x, y, 4, '#fff');
            }
      }
      if (this.state === 'test') {
        const label = this.testT < 3 ? 'STORM SURGE! Gates closed.' : 'Calm morning. Gates open. Can the boats reach the dock?';
        D.text(ctx, label, 40, H - 14, { size: 17, weight: 700, color: '#fff' });
        if (this.testT < 3 && Math.random() < 0.5) this.parts.emit({ x: U.rand(ox, ox + this.cols * cs), y: oy - 10, vx: -40, vy: 400, life: 0.6, size: 3, shape: 'drop', color: '#bfe6ff' });
      }
      if (this.state === 'build') {
        const [r, c] = this.cursor;
        ctx.strokeStyle = '#ffd25a';
        ctx.lineWidth = 3;
        ctx.strokeRect(ox + c * cs + 2, oy + r * cs + 2, cs - 4, cs - 4);
      }
      this.drawPanel(ctx, (ctx, px, y) => {
        const spent = this.spent();
        D.text(ctx, `Budget: ${spent} / ${this.def.budget} scraps`, px + 16, y + 6, { size: 16, weight: 700, color: spent > this.def.budget ? '#c2410c' : D.C.ink });
        D.cardboard(ctx, px + 16, y + 22, 30, 24, { r: 5, lw: 2, fill: '#b98455' });
        D.text(ctx, 'Levee: on sand, 1 scrap', px + 54, y + 40, { size: 13, weight: 600 });
        D.cardboard(ctx, px + 16, y + 54, 30, 24, { r: 2, lw: 2, fill: '#c9d3e0' });
        D.text(ctx, 'Floodgate: on canal, 3 scraps', px + 54, y + 72, { size: 13, weight: 600 });
        D.text(ctx, 'Dunes (^) are high ground.', px + 16, y + 100, { size: 13, weight: 500, color: '#7a5434' });
      });
      if (this.state === 'build' || this.state === 'result') D.text(ctx, 'Click a tile to build or remove. Arrows + Z also work.', 40, H - 14, { size: 13, color: '#cfe6ff' });
      this.drawOverlay(ctx);
    }
  }

  // ================================================================== TRUSS
  // Direct stiffness method on a pin-jointed plane truss.
  CK.solveTruss = function (nodes, members, supports, loads) {
    // nodes: [[x,y]], members: [{a,b,ea}], supports: {idx:[fixX,fixY]}, loads: {idx:[fx,fy]}
    const used = new Set();
    for (const m of members) { used.add(m.a); used.add(m.b); }
    for (const k in supports) used.add(+k);
    const dof = {};
    let n = 0;
    for (const i of used) {
      const s = supports[i] || [false, false];
      dof[i] = [s[0] ? -1 : n++, s[1] ? -1 : n++];
    }
    const K = [];
    for (let i = 0; i < n; i++) K.push(new Float64Array(n + 1));
    for (const m of members) {
      const [x1, y1] = nodes[m.a], [x2, y2] = nodes[m.b];
      const L = Math.hypot(x2 - x1, y2 - y1), c = (x2 - x1) / L, s = (y2 - y1) / L, k = m.ea / L;
      const idx = [dof[m.a][0], dof[m.a][1], dof[m.b][0], dof[m.b][1]];
      const v = [-c, -s, c, s];
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (idx[i] >= 0 && idx[j] >= 0) K[idx[i]][idx[j]] += k * v[i] * v[j];
    }
    for (const k in loads) {
      if (!dof[k]) continue;
      const [fx, fy] = loads[k];
      if (dof[k][0] >= 0) K[dof[k][0]][n] += fx;
      if (dof[k][1] >= 0) K[dof[k][1]][n] += fy;
    }
    // gaussian elimination with partial pivoting
    let maxd = 0;
    for (let i = 0; i < n; i++) maxd = Math.max(maxd, Math.abs(K[i][i]));
    const order = [];
    for (let col = 0; col < n; col++) {
      let piv = col;
      for (let r = col + 1; r < n; r++) if (Math.abs(K[r][col]) > Math.abs(K[piv][col])) piv = r;
      if (Math.abs(K[piv][col]) < 1e-9 * Math.max(1, maxd)) {
        // find which node owns this dof for feedback
        let node = -1;
        for (const i in dof) if (dof[i][0] === col || dof[i][1] === col) node = +i;
        return { ok: false, mechanism: true, node };
      }
      [K[col], K[piv]] = [K[piv], K[col]];
      for (let r = col + 1; r < n; r++) {
        const f = K[r][col] / K[col][col];
        if (!f) continue;
        for (let k = col; k <= n; k++) K[r][k] -= f * K[col][k];
      }
      order.push(col);
    }
    const u = new Float64Array(n);
    for (let r = n - 1; r >= 0; r--) {
      let s = K[r][n];
      for (let k = r + 1; k < n; k++) s -= K[r][k] * u[k];
      u[r] = s / K[r][r];
    }
    const disp = {};
    for (const i in dof) disp[i] = [dof[i][0] >= 0 ? u[dof[i][0]] : 0, dof[i][1] >= 0 ? u[dof[i][1]] : 0];
    const forces = members.map((m) => {
      const [x1, y1] = nodes[m.a], [x2, y2] = nodes[m.b];
      const L = Math.hypot(x2 - x1, y2 - y1), c = (x2 - x1) / L, s = (y2 - y1) / L;
      const du = disp[m.b][0] - disp[m.a][0], dv = disp[m.b][1] - disp[m.a][1];
      return (m.ea / L) * (c * du + s * dv);
    });
    return { ok: true, disp, forces };
  };

  class TrussPuzzle extends PuzzleBase {
    constructor(def) {
      super(def);
      this.sp = 78;
      this.x0 = 92;
      this.y0 = 380;
      this.nodes = [];
      for (let r = 0; r < def.rows; r++) for (let c = 0; c < def.cols; c++) this.nodes.push([c, r]);
      this.members = [];
      this.sel = -1;
      this.cursor = 0;
      this.cartS = 0;
    }
    ni(c, r) {
      return r * this.def.cols + c;
    }
    npos(i, disp, scale) {
      const [c, r] = this.nodes[i];
      let x = this.x0 + c * this.sp, y = this.y0 - r * this.sp;
      if (disp && disp[i]) {
        x += disp[i][0] * scale;
        y -= disp[i][1] * scale;
      }
      return [x, y];
    }
    findMember(a, b) {
      return this.members.findIndex((m) => (m.a === a && m.b === b) || (m.a === b && m.b === a));
    }
    clear() {
      this.members = [];
      this.sel = -1;
    }
    applySolution() {
      // a Pratt truss: diagonals slope down to the middle (tension); top chord reinforced
      this.clear();
      const C = this.def.cols, mid = (C - 1) / 2;
      for (let c = 0; c < C - 1; c++) this.members.push({ a: this.ni(c, 0), b: this.ni(c + 1, 0), rf: false });
      for (let c = 0; c < C - 1; c++) this.members.push({ a: this.ni(c, 1), b: this.ni(c + 1, 1), rf: c >= 1 && c <= C - 3 });
      for (let c = 0; c < C; c++) this.members.push({ a: this.ni(c, 0), b: this.ni(c, 1), rf: false });
      for (let c = 0; c < C - 1; c++) this.members.push(c < mid ? { a: this.ni(c, 1), b: this.ni(c + 1, 0), rf: false } : { a: this.ni(c, 0), b: this.ni(c + 1, 1), rf: false });
    }
    spent() {
      return this.members.reduce((s, m) => s + (m.rf ? 2 : 1), 0);
    }
    clickNode(i) {
      if (this.sel < 0) {
        this.sel = i;
        CK.Audio.sfx('blip');
        return;
      }
      if (this.sel === i) {
        this.sel = -1;
        return;
      }
      const [c1, r1] = this.nodes[this.sel], [c2, r2] = this.nodes[i];
      if (Math.abs(c1 - c2) > 1 || Math.abs(r1 - r2) > 1) {
        this.flashMsg('Tubes can only reach neighboring dots (including diagonals).');
        this.sel = i;
        return;
      }
      const k = this.findMember(this.sel, i);
      if (k >= 0) this.toggleMember(k);
      else {
        this.members.push({ a: this.sel, b: i, rf: false });
        CK.Audio.sfx('build');
      }
      this.sel = i;
    }
    toggleMember(k) {
      const m = this.members[k];
      if (!m.rf) {
        m.rf = true;
        CK.Audio.sfx('tape');
      } else {
        this.members.splice(k, 1);
        CK.Audio.sfx('back');
      }
    }
    memberAt(mx, my) {
      let best = -1, bd = 10;
      this.members.forEach((m, k) => {
        const [x1, y1] = this.npos(m.a), [x2, y2] = this.npos(m.b);
        const dx = x2 - x1, dy = y2 - y1;
        const t = U.clamp(((mx - x1) * dx + (my - y1) * dy) / (dx * dx + dy * dy), 0, 1);
        const d = Math.hypot(mx - (x1 + t * dx), my - (y1 + t * dy));
        if (t > 0.15 && t < 0.85 && d < bd) { bd = d; best = k; }
      });
      return best;
    }
    nodeAt(mx, my) {
      for (let i = 0; i < this.nodes.length; i++) {
        const [x, y] = this.npos(i);
        if (Math.hypot(mx - x, my - y) < 18) return i;
      }
      return -1;
    }
    caps(m) {
      const [c1, r1] = this.nodes[m.a], [c2, r2] = this.nodes[m.b];
      const L = Math.hypot(c2 - c1, r2 - r1);
      return { T: m.rf ? 30 : 12, C: (m.rf ? 20 : 8) / (L * L), L };
    }
    analyzeAt(s) {
      const d = this.def;
      const supports = { [this.ni(0, 0)]: [true, true], [this.ni(d.cols - 1, 0)]: [false, true] };
      const loads = {};
      const i0 = Math.floor(s), f = s - i0;
      loads[this.ni(i0, 0)] = [0, -d.load * (1 - f)];
      if (i0 + 1 < d.cols) loads[this.ni(i0 + 1, 0)] = [0, -d.load * f];
      const mem = this.members.map((m) => ({ a: m.a, b: m.b, ea: m.rf ? 2.5 : 1 }));
      const r = CK.solveTruss(this.nodes, mem, supports, loads);
      if (!r.ok) return r;
      let worst = -1, wu = 0;
      r.util = r.forces.map((F, k) => {
        const cp = this.caps(this.members[k]);
        const u = F >= 0 ? F / cp.T : -F / cp.C;
        if (u > wu) { wu = u; worst = k; }
        return u;
      });
      r.worst = worst;
      r.maxU = wu;
      return r;
    }
    validate() {
      const d = this.def;
      if (this.spent() > d.budget) return `Over budget! ${this.spent()} / ${d.budget} scraps.`;
      for (let c = 0; c < d.cols - 1; c++) if (this.findMember(this.ni(c, 0), this.ni(c + 1, 0)) < 0) return 'The road deck (the whole bottom row) must be connected so the cart can roll across.';
      return null;
    }
    startTest() {
      this.state = 'test';
      this.cartS = 0;
      this.broken = -1;
      this.fallT = 0;
      this.mech = null;
      // precompute along the path
      this.samples = [];
      for (let s = 0; s <= this.def.cols - 1 + 1e-9; s += 0.1) this.samples.push([s, this.analyzeAt(s)]);
      this.failS = null;
      let maxd = 1e-9;
      for (const [, r] of this.samples) if (r.ok) for (const k in r.disp) maxd = Math.max(maxd, Math.abs(r.disp[k][0]), Math.abs(r.disp[k][1]));
      this.dscale = 16 / maxd;
      for (const [s, r] of this.samples) {
        if (!r.ok) { this.failS = s; this.mech = r; break; }
        if (r.maxU > 1) { this.failS = s; break; }
      }
      CK.Audio.sfx('select');
    }
    resetTest() {
      this.cartS = 0;
      this.broken = -1;
      this.fallT = 0;
      this.cur = null;
    }
    update(dt) {
      if (this.commonUpdate(dt) && this.state !== 'test') return;
      const d = this.def;
      if (this.state === 'test') {
        if (this.broken >= 0 || (this.mech && this.cartS >= this.failS)) {
          this.fallT += dt;
          if (this.fallT > 1.8) {
            if (this.mech) this.finish(false, 'It folded flat!', 'Part of your bridge can wiggle without bending a tube, so it collapsed. The highlighted dot is wobbly. Add tubes to make triangles!');
            else {
              const m = this.members[this.broken];
              const F = this.cur.forces[this.broken];
              this.finish(false, F < 0 ? 'A tube buckled!' : 'A tube snapped!', F < 0 ? `The red tube was squished too hard (compression) and buckled. Reinforce it, or make that part of the truss deeper so it carries less force.${this.caps(m).L > 1.1 ? ' Long diagonal tubes buckle 2x easier!' : ''}` : 'The red tube was pulled too hard (tension) and tore. Reinforce it!');
            }
          }
          return;
        }
        this.cartS += dt * 1.4;
        const sm = this.samples[Math.min(this.samples.length - 1, Math.round(this.cartS * 10))];
        this.cur = sm ? sm[1] : null;
        if (this.failS != null && this.cartS >= this.failS) {
          if (this.cur && this.cur.ok) this.broken = this.cur.worst;
          CK.Audio.sfx('break');
          this.shakeT = 0.5;
          return;
        }
        if (this.cartS >= d.cols - 1) {
          this.cartS = d.cols - 1;
          this.finish(true, 'The bridge holds!', d.lesson);
        }
        return;
      }
      // build input
      const mx = Input.mouse.x, my = Input.mouse.y;
      const C = d.cols, R = d.rows;
      if (Input.hit('left')) this.cursor = this.ni(Math.max(0, (this.cursor % C) - 1), Math.floor(this.cursor / C));
      if (Input.hit('right')) this.cursor = this.ni(Math.min(C - 1, (this.cursor % C) + 1), Math.floor(this.cursor / C));
      if (Input.hit('up')) this.cursor = this.ni(this.cursor % C, Math.min(R - 1, Math.floor(this.cursor / C) + 1));
      if (Input.hit('down')) this.cursor = this.ni(this.cursor % C, Math.max(0, Math.floor(this.cursor / C) - 1));
      if (Input.hit('ok')) this.clickNode(this.cursor);
      if (Input.key('KeyX')) this.sel = -1;
      if (Input.mouse.pressed) {
        const n = this.nodeAt(mx, my);
        if (n >= 0) {
          this.cursor = n;
          this.clickNode(n);
        } else {
          const k = this.memberAt(mx, my);
          if (k >= 0) this.toggleMember(k);
          else this.sel = -1;
        }
      }
      if (Input.mouse.rpressed) {
        const k = this.memberAt(mx, my);
        if (k >= 0) {
          this.members.splice(k, 1);
          CK.Audio.sfx('back');
        } else this.sel = -1;
      }
    }
    draw(ctx) {
      this.drawFrame(ctx);
      const d = this.def;
      ctx.save();
      if (this.shakeT > 0) {
        this.shakeT -= 1 / 60;
        ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
      }
      // canyon + river
      const L = this.x0, R = this.x0 + (d.cols - 1) * this.sp;
      ctx.fillStyle = '#3a83a8';
      ctx.fillRect(L, this.y0 + 40, R - L, 120);
      for (let i = 0; i < 6; i++) { const ph = (this.t * 40 + i * 70) % (R - L); D.line(ctx, L + ph, this.y0 + 70 + (i % 3) * 25, L + ph + 30, this.y0 + 70 + (i % 3) * 25, 'rgba(255,255,255,.5)', 3); }
      D.cardboard(ctx, L - 90, this.y0, 90, 160, { r: 4, fill: '#c9935a', lw: 3 });
      D.cardboard(ctx, R, this.y0, 90, 160, { r: 4, fill: '#c9935a', lw: 3 });
      for (const tx of [L - 60, R + 50]) { D.circle(ctx, tx, this.y0 - 30, 22, '#e8743b', D.C.ink, 3); D.line(ctx, tx, this.y0 - 8, tx, this.y0, D.C.ink, 4); }
      // supports
      const sp0 = this.npos(this.ni(0, 0)), sp1 = this.npos(this.ni(d.cols - 1, 0));
      D.poly(ctx, [sp0[0], sp0[1], sp0[0] - 14, sp0[1] + 22, sp0[0] + 14, sp0[1] + 22], '#7d8a99', D.C.ink, 2);
      D.poly(ctx, [sp1[0], sp1[1], sp1[0] - 14, sp1[1] + 18, sp1[0] + 14, sp1[1] + 18], '#7d8a99', D.C.ink, 2);
      D.circle(ctx, sp1[0] - 7, sp1[1] + 22, 4, '#7d8a99', D.C.ink, 1.5);
      D.circle(ctx, sp1[0] + 7, sp1[1] + 22, 4, '#7d8a99', D.C.ink, 1.5);
      // members
      const testing = this.state !== 'build' && this.cur && this.cur.ok;
      const disp = testing ? this.cur.disp : null;
      const scale = this.dscale || 6;
      this.members.forEach((m, k) => {
        let [x1, y1] = this.npos(m.a, disp, scale), [x2, y2] = this.npos(m.b, disp, scale);
        if (k === this.broken) {
          const ft = this.fallT;
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          D.line(ctx, x1, y1 + ft * ft * 200, mx - 6, my + ft * ft * 260 + 20, '#ef4444', 9);
          D.line(ctx, mx + 6, my + ft * ft * 240 + 20, x2, y2 + ft * ft * 200, '#ef4444', 9);
          return;
        }
        if (this.mech && this.cartS >= this.failS) { y1 += this.fallT * this.fallT * 140; y2 += this.fallT * this.fallT * 140; }
        let col = m.rf ? '#a8774c' : '#d9a66b';
        if (testing) {
          const u = Math.min(1.2, this.cur.util[k]);
          const F = this.cur.forces[k];
          col = u > 1 ? '#ef4444' : F >= 0 ? `rgb(${90 + (1 - u) * 120},${150 + (1 - u) * 60},${230})` : `rgb(${255},${190 - u * 110},${90 - u * 50})`;
        }
        ctx.lineCap = 'round';
        D.line(ctx, x1, y1, x2, y2, D.C.ink, m.rf ? 15 : 11);
        D.line(ctx, x1, y1, x2, y2, col, m.rf ? 10 : 6);
        if (m.rf) {
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          D.tape(ctx, mx - 8, my - 6, 16, 12, Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2, 0.95);
        }
      });
      // nodes
      for (let i = 0; i < this.nodes.length; i++) {
        let [x, y] = this.npos(i, disp, scale);
        if (this.mech && this.cartS >= this.failS) y += this.fallT * this.fallT * 140;
        const isSel = i === this.sel, isCur = i === this.cursor && this.state === 'build';
        const wobbly = this.mech && this.mech.node === i;
        D.circle(ctx, x, y, isSel ? 10 : 7, wobbly ? '#ef4444' : isSel ? '#ffd25a' : '#fffaf0', D.C.ink, 2.5);
        if (isCur) D.circle(ctx, x, y, 14, null, '#ffd25a', 3);
      }
      // hover preview
      if (this.state === 'build' && this.sel >= 0) {
        const [x1, y1] = this.npos(this.sel);
        ctx.setLineDash([6, 6]);
        D.line(ctx, x1, y1, Input.mouse.x, Input.mouse.y, 'rgba(255,255,255,.6)', 3);
        ctx.setLineDash([]);
      }
      // cart
      if (this.state !== 'build') {
        const s = this.cartS;
        const i0 = Math.min(d.cols - 2, Math.floor(s)), f = s - i0;
        const a = this.npos(this.ni(i0, 0), disp, scale), b = this.npos(this.ni(i0 + 1, 0), disp, scale);
        let cx = a[0] + (b[0] - a[0]) * f, cy = a[1] + (b[1] - a[1]) * f;
        if (this.broken >= 0 || (this.mech && this.cartS >= this.failS)) cy += this.fallT * this.fallT * 300;
        D.cardboard(ctx, cx - 26, cy - 34, 52, 26, { r: 4, lw: 2.5, fill: '#ef6b6b' });
        D.circle(ctx, cx - 16, cy - 6, 7, '#555', D.C.ink, 2);
        D.circle(ctx, cx + 16, cy - 6, 7, '#555', D.C.ink, 2);
        D.char(ctx, 'corry', cx, cy - 28, { s: 0.7, noShadow: true, mood: this.broken >= 0 ? 'shock' : 'happy' });
      }
      ctx.restore();
      this.drawPanel(ctx, (ctx, px, y) => {
        const spent = this.spent();
        D.text(ctx, `Budget: ${spent} / ${d.budget} scraps`, px + 16, y + 6, { size: 16, weight: 700, color: spent > d.budget ? '#c2410c' : D.C.ink });
        D.text(ctx, `Cart weight: ${d.load} · Tube: 1, reinforced: 2`, px + 16, y + 26, { size: 13, weight: 600 });
        D.line(ctx, px + 16, y + 44, px + 46, y + 44, '#6aa0e6', 7);
        D.text(ctx, 'pulled (tension)', px + 54, y + 49, { size: 13, weight: 600 });
        D.line(ctx, px + 16, y + 64, px + 46, y + 64, '#ff9c3a', 7);
        D.text(ctx, 'squished (compression)', px + 54, y + 69, { size: 13, weight: 600 });
        D.line(ctx, px + 16, y + 84, px + 46, y + 84, '#ef4444', 7);
        D.text(ctx, 'overloaded!', px + 54, y + 89, { size: 13, weight: 600 });
      });
      if (this.state === 'build') D.text(ctx, 'Click a dot, then a neighbor dot to add a tube. Click a tube to reinforce, again to remove. Right-click removes.', 30, H - 14, { size: 13, color: '#cfe6ff' });
      this.drawOverlay(ctx);
    }
  }

  CK.startPuzzle = function (id) {
    const def = CK.PuzzleDefs[id];
    const P = CK.PuzzleTypes[def.type] || TrussPuzzle;
    const pz = new P(def);
    const handle = { finished: false, solved: false };
    CK.flaps(() => CK.Scenes.push(pz), { label: 'Engineering time!' });
    CK.co(function* () {
      yield () => pz.finished;
      handle.solved = pz.solved;
      handle.finished = true;
    });
    return handle;
  };
  CK.Puzzle = { PuzzleBase, DamPuzzle, GatesPuzzle, TrussPuzzle };
  // more puzzle types can register here (see storm.js)
  CK.PuzzleTypes = { dam: DamPuzzle, gates: GatesPuzzle, truss: TrussPuzzle };
})();
