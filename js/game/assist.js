// Cardboard Kingdom - Easy Play: settings, Story Mode, running, and the goal marker.
//  * Settings (title screen and pause menu): Story Mode, auto-timed hits, text speed, goal marker,
//    always run, screen shake, reduce motion. Saved in the browser, separate from the save game.
//  * Goal marker: a bouncing golden arrow over whoever you need to talk to next, or an arrow at
//    the edge of the screen pointing the way (with a step count) when they're off screen.
//  * Hold Shift to run.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input, Data = CK.Data;
  const W = CK.W, H = CK.H, TS = 48;
  const C = D.C, TAU = Math.PI * 2;
  const stroke = (ctx, lw, col) => { ctx.strokeStyle = col || C.ink; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };

  // ================================================================ SETTINGS
  const DEFAULTS = { story: false, autoTime: false, text: 1, goal: true, run: false, shake: true, motion: 0 };
  const KEY = 'cardboard-kingdom-settings';
  const load = () => {
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return Object.assign({}, DEFAULTS); }
  };
  CK.settings = load();
  CK.saveSettings = function () { try { localStorage.setItem(KEY, JSON.stringify(CK.settings)); } catch (e) { /* storage blocked: settings just last this session */ } };
  // used by the dialogue box, battles and the overworld
  CK.textSpeed = () => [1, 2.2, 99][CK.settings.text] || 1;
  // Reduce motion: 0 = follow the computer's own setting, 1 = on, 2 = off
  const sysCalm = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  CK.reduceMotion = () => CK.settings.motion === 1 || (CK.settings.motion === 0 && sysCalm());
  CK.shakeK = () => (CK.settings.shake && !CK.reduceMotion() ? 1 : 0);
  const MOTION = ['Auto', 'On', 'Off'];

  const TEXT = ['Normal', 'Fast', 'Instant'];
  const OPTIONS = [
    { id: 'story', label: 'Story Mode', desc: 'Enemies hit half as hard, your hits land harder, and the PERFECT window is much wider. For when you just want the story.', val: () => (CK.settings.story ? 'On' : 'Off'), next: () => { CK.settings.story = !CK.settings.story; } },
    { id: 'autoTime', label: 'Auto-timed hits', desc: 'Every attack and block lands at the perfect moment by itself. Great for younger players or one-handed play.', val: () => (CK.settings.autoTime ? 'On' : 'Off'), next: () => { CK.settings.autoTime = !CK.settings.autoTime; } },
    { id: 'text', label: 'Text speed', desc: 'How fast dialogue types out.', val: () => TEXT[CK.settings.text], next: (d) => { CK.settings.text = (CK.settings.text + (d || 1) + 3) % 3; } },
    { id: 'goal', label: 'Goal marker', desc: 'A golden arrow that points to where the story goes next.', val: () => (CK.settings.goal ? 'On' : 'Off'), next: () => { CK.settings.goal = !CK.settings.goal; } },
    { id: 'run', label: 'Always run', desc: 'Move faster everywhere. (You can also hold Shift to run.)', val: () => (CK.settings.run ? 'On' : 'Off'), next: () => { CK.settings.run = !CK.settings.run; } },
    { id: 'shake', label: 'Screen shake', desc: 'Turn off if the shaking bothers you.', val: () => (CK.settings.shake ? 'On' : 'Off'), next: () => { CK.settings.shake = !CK.settings.shake; } },
    { id: 'motion', label: 'Reduce motion', desc: 'Calmer menus and pop-ups, no screen shake. Auto follows your computer\'s own setting.', val: () => MOTION[CK.settings.motion || 0] + (CK.settings.motion ? '' : CK.reduceMotion() ? ' (on)' : ' (off)'), on: () => CK.reduceMotion(), next: (d) => { CK.settings.motion = ((CK.settings.motion || 0) + (d || 1) + 3) % 3; } },
    { id: 'sound', label: 'Sound', desc: 'Music and sound effects. (M also toggles.)', val: () => (CK.Audio.muted ? 'Off' : 'On'), next: () => CK.Audio.toggleMute() },
  ];
  CK.SettingsOptions = OPTIONS;

  class SettingsScreen {
    constructor() { this.transparent = true; this.sel = 0; this.t = 0; }
    rect(i) { return [W / 2 - 300, 88 + i * 40, 600, 34]; }
    update(dt) {
      this.t += dt;
      const n = OPTIONS.length + 1;
      if (Input.hit('up')) { this.sel = (this.sel + n - 1) % n; CK.Audio.sfx('blip'); }
      if (Input.hit('down')) { this.sel = (this.sel + 1) % n; CK.Audio.sfx('blip'); }
      let pick = -1, dir = 1;
      for (let i = 0; i < n; i++) {
        const r = this.rect(i);
        if (Input.mouse.moved && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) this.sel = i;
        if (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) pick = i;
      }
      if (Input.hit('ok')) pick = this.sel;
      if (this.sel < OPTIONS.length && (Input.hit('left') || Input.hit('right'))) { pick = this.sel; dir = Input.hit('left') ? -1 : 1; }
      if (Input.hit('back') || pick === OPTIONS.length) {
        CK.saveSettings(); CK.Audio.sfx('back'); CK.Scenes.remove(this); return;
      }
      if (pick >= 0) { OPTIONS[pick].next(dir); CK.saveSettings(); CK.Audio.sfx('select'); }
    }
    draw(ctx) {
      ctx.fillStyle = 'rgba(30,15,5,0.6)'; ctx.fillRect(0, 0, W, H);
      D.panel(ctx, W / 2 - 330, 16, 660, H - 32, { fill: '#fffaf0' });
      D.text(ctx, 'Settings', W / 2, 62, { size: 28, weight: 700, align: 'center', color: C.text });
      OPTIONS.forEach((o, i) => {
        const [x, y, w, h] = this.rect(i), sel = i === this.sel;
        D.rr(ctx, x, y, w, h, 10); ctx.fillStyle = sel ? C.sheetHi : C.sheet; ctx.fill(); stroke(ctx, sel ? 2.5 : 1.5);
        D.text(ctx, o.label, x + 18, y + 23, { size: D.T.ui, weight: 700, color: C.text });
        const v = o.val(), on = o.on ? o.on() : v !== 'Off';
        const pw = 132, px = x + w - pw - 12;
        D.rr(ctx, px, y + 4, pw, 26, 13); ctx.fillStyle = on ? '#9ad07a' : '#e2d6c2'; ctx.fill(); stroke(ctx, 2);
        const vc = on ? '#24501c' : '#6a5a4a';
        D.text(ctx, v, px + pw / 2, y + 22, { size: 15, weight: 700, align: 'center', color: vc });
        // drawn arrows on the selected row say "left/right changes this"
        if (sel) { D.chevron(ctx, px + 14, y + 17, -1, vc); D.chevron(ctx, px + pw - 14, y + 17, 1, vc); }
      });
      const [bx, by] = this.rect(OPTIONS.length);
      D.button(ctx, bx + 200, by + 6, 200, 38, 'Done', { hover: this.sel === OPTIONS.length, size: 18 });
      const o = OPTIONS[this.sel];
      if (o) {
        const lines = D.balance(ctx, o.desc, 560, 15, 500);
        lines.slice(0, 2).forEach((l, i) => D.text(ctx, l, W / 2, H - 62 + i * 20, { size: 15, align: 'center', color: C.textSoft }));
      }
    }
  }
  CK.SettingsScreen = SettingsScreen;

  // ================================================================ RUNNING
  const baseMove = CK.Overworld.prototype.movePlayer;
  CK.Overworld.prototype.movePlayer = function (p, I, dt, who) {
    const run = CK.settings.run || (who === 0 ? Input.down.ShiftLeft || (!CK.coop && Input.down.ShiftRight) : Input.down.Quote);
    return baseMove.call(this, p, I, run ? dt * 1.45 : dt, who);
  };

  // ================================================================ GOAL MARKER
  // Works out who or what the current goal is about, from the goal text and what's on the map.
  // Chapters can also say exactly: ch.goal(G) returns an entity id, [tileX, tileY], or null.
  const STOP = new Set(['the', 'and', 'with', 'from', 'your', 'find', 'talk', 'meet', 'help', 'back', 'mister', 'keeper', 'captain', 'mayor', 'queen', 'doctor', 'grandma', 'harbormaster', 'inspector', 'magister', 'sir']);
  const words = (s) => (s || '').toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter((w) => w.length >= 3);
  function tokensFor(e) {
    const t = [];
    if (e.type === 'npc') {
      const sps = Object.entries(Data.speakers).filter(([, sp]) => sp.look && sp.look === e.look && sp.name);
      // a look shared by lots of speakers (critters, people) says nothing about who this is
      if (sps.length <= 2) for (const [k, sp] of sps) { t.push(sp.name.toLowerCase()); for (const w of words(sp.name)) if (!STOP.has(w)) t.push(w); if (k.length > 3) t.push(k); }
      if (e.id) for (const w of words(e.id.replace(/_/g, ' '))) if (!STOP.has(w) && w.length > 3) t.push(w);
    }
    if (e.label) { t.push(e.label.toLowerCase()); for (const w of words(e.label)) if (!STOP.has(w) && w.length > 3) t.push(w); }
    return t;
  }
  const KEYWORDS = [
    [/^(design|build|plan|engineer)|blueprint/i, (e) => e.type === 'site'],
    [/workbench/i, (e) => e.type === 'bench'],
    [/\bbox\b/i, (e) => e.type === 'portal'],
    [/notice/i, (e) => e.type === 'notice'],
    [/campfire/i, (e) => e.type === 'campfire'],
    [/\bbus\b/i, (e) => e.kind === 'busstop'],
  ];
  // goals the words alone can't place
  const ID = (id) => (e) => e.id === id;
  const OVERRIDES = [
    ['gullpoint', /lighthouse keeper/i, ID('gale')],
    ['gullpoint', /elder/i, ID('oldtin')],
    ['fall', /forest folk/i, ID('ember')],
    ['fall', /Hoot/, ID('hoot')],
    ['fall', /Archive/, (e) => e.type === 'trigger' && e.id.startsWith('fa_archive')],
    ['riverbend', /silver/i, ID('corvin_rb')],
    ['riverbend', /Rook/, ID('rb_rook')],
    ['riverbend', /community garden/i, ID('rb_done_go')],
    ['lanternmere', /Moth-kin/, ID('lm_moth1')],
    ['campus', /drain/i, ID('st_grem')],
    ['spring', /Defend the docks/, ID('sp_docks')],
  ];
  const triggerCenter = (e) => ({ x: (e.x + (e.w || 1) / 2) * TS, y: (e.y + (e.h || 1) / 2) * TS });
  function resolve(ow) {
    const ch = ow.ch, G = CK.G;
    const obj = ch.objective ? ch.objective(G) : '';
    if (!obj || /free roam/i.test(obj)) return null;
    if (ch.goal) {
      const g = ch.goal(G, obj);
      if (g === null) return null;
      if (Array.isArray(g)) return { x: (g[0] + 0.5) * TS, y: (g[1] + 0.75) * TS };
      if (typeof g === 'string') { const e = ow.ents.find((q) => q.id === g); if (e) return entPos(e); }
    }
    for (const [cid, re, test] of OVERRIDES) if (cid === ch.id && re.test(obj)) { const e = ow.ents.find(test); if (e) return entPos(e); }
    for (const [re, test] of KEYWORDS) if (re.test(obj)) { const e = ow.ents.find(test); if (e) return entPos(e); }
    // someone or somewhere named in the goal
    const low = obj.toLowerCase();
    let best = null, bs = 0;
    for (const e of ow.ents) {
      if (e.type !== 'npc' && e.type !== 'building' && e.type !== 'house') continue;
      for (const tk of tokensFor(e)) if (tk.length > bs && new RegExp('\\b' + tk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(low)) { best = e; bs = tk.length; }
    }
    if (best) return entPos(best);
    // 3) an active story trigger (somewhere you need to walk to)
    const tr = ow.ents.find((e) => e.type === 'trigger' && e.script && (!e.cond || e.cond(G)));
    if (tr) return triggerCenter(tr);
    // 4) a monster you need to catch
    if (/catch|defend|stop|fight|chase|calm|raid/i.test(obj)) { const en = ow.ents.find((e) => e.type === 'enemy'); if (en) return entPos(en); }
    return null;
  }
  function entPos(e) {
    if (e.type === 'house') return { x: e.px, y: (e.y + 1) * TS };
    if (e.type === 'building') return { x: e.px, y: (e.y + 1) * TS };
    if (e.type === 'trigger') return triggerCenter(e);
    return { x: e.px, y: e.py, e };
  }
  CK.goalTarget = function (ow) {
    ow = ow || CK.OW;
    if (!ow) return null;
    const r = resolve(ow);
    if (r && r.e && r.e.type === 'enemy') { r.x = r.e.px; r.y = r.e.py; }
    return r;
  };

  const baseHud = CK.Overworld.prototype.drawHud;
  CK.Overworld.prototype.drawHud = function (ctx) {
    if (CK.settings.goal && !CK.scriptRunning && CK.Scenes.top() === this && this.ch.id !== 'campus_intro') {
      // re-resolve a few times a second (moving enemies are tracked every frame)
      if (!this._goalT || this.t - this._goalT > 0.25) { this._goalT = this.t; this._goal = CK.goalTarget(this); }
      const g = this._goal;
      if (g) {
        if (g.e && g.e.type === 'enemy') { g.x = g.e.px; g.y = g.e.py; }
        drawGoal(ctx, this, g);
      }
    }
    baseHud.call(this, ctx);
  };
  function drawGoal(ctx, ow, g) {
    const sx = g.x - ow.camX, sy = g.y - ow.camY, p = ow.player;
    const dist = Math.hypot(g.x - p.x, g.y - p.y);
    if (dist < 70) return;
    const t = ow.t;
    const on = sx > 30 && sx < W - 30 && sy > 90 && sy < H - 20;
    if (on) {
      // a soft golden ring on the ground and a bouncing arrow over the target
      const k = 0.5 + Math.sin(t * 4) * 0.5;
      ctx.save();
      ctx.beginPath(); ctx.ellipse(sx, sy, 26 + k * 6, 9 + k * 2, 0, 0, TAU); ctx.strokeStyle = `rgba(255,210,90,${0.5 + k * 0.4})`; ctx.lineWidth = 3; ctx.stroke();
      const ay = sy - 96 - Math.abs(Math.sin(t * 4)) * 10;
      D.poly(ctx, [sx - 13, ay - 12, sx + 13, ay - 12, sx, ay + 6], '#ffd25a', C.ink, 2.5);
      D.rr(ctx, sx - 6, ay - 26, 12, 15, 3); ctx.fillStyle = '#ffd25a'; ctx.fill(); stroke(ctx, 2.5);
      ctx.restore();
      return;
    }
    // off screen: an arrow on the edge of the screen pointing the way
    const cx = W / 2, cy = H / 2 + 20;
    const a = Math.atan2(sy - cy, sx - cx);
    const rx = W / 2 - 54, ry = H / 2 - 74;
    const ex = cx + Math.cos(a) * rx, ey = cy + Math.sin(a) * ry;
    const bob = Math.sin(t * 5) * 4;
    ctx.save();
    ctx.translate(ex + Math.cos(a) * bob, ey + Math.sin(a) * bob);
    D.circle(ctx, 0, 0, 24, 'rgba(255,250,240,0.92)', C.ink, 2.5);
    ctx.save(); ctx.rotate(a);
    D.poly(ctx, [16, 0, -6, -11, -1, 0, -6, 11], '#ffb000', C.ink, 2);
    ctx.restore();
    const steps = Math.max(1, Math.round(dist / TS));
    D.text(ctx, steps + ' steps', 0, 40, { size: 12, weight: 700, align: 'center', color: '#fff3b0', outline: C.ink, ow: 3 });
    ctx.restore();
  }
})();
