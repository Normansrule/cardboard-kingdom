// Cardboard Kingdom - overworld exploration scene.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input;
  const W = CK.W, H = CK.H;
  const TS = (CK.TS = 48);

  class Overworld {
    constructor(chId, pos) {
      this.isOverworld = true;
      this.alwaysUpdate = true;
      this.ch = CK.Chapters[chId];
      this.seasonId = this.ch.seasonOf ? this.ch.seasonOf() : this.ch.season;
      this.season = CK.Data.seasons[this.seasonId];
      this.parts = new CK.Particles();
      this.fx = new CK.Particles();
      this.shake = 0;
      this.t = 0;
      this.player = { x: 0, y: 0, dir: 'right', walk: 0, moving: false };
      const p = pos || { x: (this.ch.start[0] + 0.5) * TS, y: (this.ch.start[1] + 0.7) * TS };
      this.player.x = p.x;
      this.player.y = p.y;
      this.trail = [];
      for (let i = 0; i < 60; i++) this.trail.push({ x: this.player.x - 1, y: this.player.y, dir: 'right' });
      if (CK.coop) {
        const q = CK.G.pos2 && pos ? CK.G.pos2 : { x: p.x - 30, y: p.y + 4 };
        this.p2 = { x: q.x, y: q.y, dir: 'right', walk: 0, moving: false };
      }
      this.grace = 1.2;
      this.camX = 0;
      this.camY = 0;
      this.triggersInside = {};
      this.lightCanvas = document.createElement('canvas');
      this.lightCanvas.width = W;
      this.lightCanvas.height = H;
      this.refresh();
      this.snapCamera();
    }
    get night() {
      return CK.flag(this.ch.id + '_night');
    }
    enter() {
      CK.OW = this;
      CK.showTouchPad = true;
      CK.Audio.setMusic(this.ch.music, this.night);
      CK.Audio.setRain(this.weather() === 'rain' || this.weather() === 'storm');
    }
    // night weather per season: a rainy spring, stormy summer, foggy fall, snowy winter
    weather() {
      if (this.ch.weather) return this.ch.weather();
      const s = this.seasonId;
      if (s === 'campus') return 'drizzle';
      if (s === 'campusColor') return CK.flag('st_storm') && !CK.flag('st_garden') ? 'storm' : null;
      if (!this.night) return null;
      return { spring: 'rain', summer: 'storm', fall: 'fog', winter: 'snow' }[s] || null;
    }
    // the costume a player is wearing decides their field power
    costumeOf(who) {
      const id = who === 1 ? 'jules' : 'sam';
      const m = CK.G.party.find((q) => q.id === id);
      return m ? m.costume : null;
    }
    anyWearing(c) {
      return this.costumeOf(0) === c || (this.p2 && this.costumeOf(1) === c);
    }
    exit() {
      if (CK.OW === this) CK.OW = null;
      CK.showTouchPad = false;
    }

    // ------------------------------------------------------------- setup
    refresh() {
      const ch = this.ch;
      this.map = CK.buildChapterMap(ch);
      for (const sw of ch.swaps || []) if (CK.flag(sw.flag)) for (let y = 0; y < this.map.h; y++) for (let x = 0; x < this.map.w; x++) if (this.map.get(x, y) === sw.from) this.map.set(x, y, sw.to);
      // barricades shoved and drifts plowed stay that way
      const cl = CK.G.flags['cleared_' + ch.id] || [];
      for (const k of cl) {
        const [x, y] = k.split(',').map(Number);
        this.map.set(x, y, this.map.get(x, y) === 'S' ? ',' : '.');
      }
      this.flooded = ch.noFlood ? false : ch.id === 'campus' ? CK.flag('st_storm') && !CK.flag('st_garden') : !CK.flag(ch.id === 'spring' ? 'spring_dam' : ch.id === 'summer' ? 'summer_gates' : ch.id === 'fall' ? 'fall_bridge' : 'winter_done');
      this.buildEntities();
      this.prerender();
      CK.Audio.setMusic(ch.music, this.night);
    }
    buildEntities() {
      const G = CK.G;
      this.ents = [];
      for (const o of this.ch.objects) {
        if (o.cond && !o.cond(G)) continue;
        if (o.type === 'enemy' && CK.flag('foe_' + o.id)) continue;
        if (o.type === 'knightfig' && CK.G.found && CK.G.found[o.id]) continue;
        if (this.hidden && this.hidden[o.id]) continue;
        const e = Object.assign({}, o);
        e.px = (o.x + 0.5) * TS;
        e.py = (o.y + 0.75) * TS;
        if (o.type === 'house') {
          e.px = (o.x + 1) * TS;
          e.py = (o.y + 1) * TS;
        }
        if (o.type === 'enemy') {
          e.pts = (o.patrol || [[o.x, o.y]]).map(([x, y]) => [(x + 0.5) * TS, (y + 0.75) * TS]);
          e.pi = 0;
          e.walk = 0;
          e.seed = Math.floor(Math.random() * 99);
        }
        if (o.type === 'npc') e.dir = 'down';
        if (this.npcOverride && this.npcOverride[o.id]) Object.assign(e, this.npcOverride[o.id]);
        this.ents.push(e);
      }
      this.trees = [];
      for (let y = 0; y < this.map.h; y++) for (let x = 0; x < this.map.w; x++) if (this.map.get(x, y) === 'T') this.trees.push({ x, y, px: (x + 0.5) * TS, py: (y + 0.95) * TS, seed: U.hash(x, y, 5) });
    }
    setNpc(o) {
      this.npcOverride = this.npcOverride || {};
      this.hidden = this.hidden || {};
      if (o.hide) this.hidden[o.id] = true;
      else {
        delete this.hidden[o.id];
        const ov = {};
        if (o.x != null) {
          ov.px = (o.x + 0.5) * TS;
          ov.py = (o.y + 0.75) * TS;
        }
        if (o.dir) ov.dir = o.dir;
        this.npcOverride[o.id] = Object.assign(this.npcOverride[o.id] || {}, ov);
      }
      this.buildEntities();
    }
    face(dir) {
      this.player.dir = dir;
    }
    walkTo([tx, ty]) {
      const self = this;
      const target = { x: (tx + 0.5) * TS, y: (ty + 0.7) * TS };
      return CK.co(function* () {
        let guard = 0;
        while (Math.hypot(target.x - self.player.x, target.y - self.player.y) > 4 && guard++ < 600) {
          const dx = target.x - self.player.x, dy = target.y - self.player.y;
          const d = Math.hypot(dx, dy);
          self.player.x += (dx / d) * Math.min(d, 2.4);
          self.player.y += (dy / d) * Math.min(d, 2.4);
          self.player.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
          self.player.walk += 0.25;
          self.pushTrail();
          yield 0;
        }
      });
    }
    snapCamera() {
      const mw = this.map.w * TS, mh = this.map.h * TS;
      const cx = this.p2 ? (this.player.x + this.p2.x) / 2 : this.player.x, cy = this.p2 ? (this.player.y + this.p2.y) / 2 : this.player.y;
      this.camX = U.clamp(cx - W / 2, 0, mw - W);
      this.camY = U.clamp(cy - H / 2, 0, mh - H);
    }

    // --------------------------------------------------------- collision
    solidAt(px, py, ignoreEnt, who) {
      const tx = Math.floor(px / TS), ty = Math.floor(py / TS);
      const tile = this.map.get(tx, ty);
      if (CK.SOLID.has(tile)) return true;
      // shallows: only someone wearing the Suspension Bridge can span them
      if (tile === 'h' && (who == null || this.costumeOf(who) !== 'bridge')) return true;
      for (const e of this.ents) {
        if (e === ignoreEnt) continue;
        if (e.type === 'building') {
          const x0 = e.x - Math.floor(e.bw / 2), y0 = e.y - e.bh + 1;
          if (px > x0 * TS + 2 && px < (x0 + e.bw) * TS - 2 && py > y0 * TS + 18 && py < (e.y + 1) * TS - 4) return true;
        } else if (e.type === 'chest' && e.hidden && !this.anyWearing('lighthouse')) {
          continue;
        } else if (e.type === 'knightfig' || e.type === 'cat') {
          continue;
        } else if (e.type === 'house') {
          if (px > e.x * TS + 4 && px < (e.x + 2) * TS - 4 && py > e.y * TS + 10 && py < (e.y + 1) * TS) return true;
        } else if (e.type === 'deco') {
          const fp = DECO_FOOT[e.kind];
          if (fp && px > (e.x + fp[0]) * TS && px < (e.x + fp[0] + fp[2]) * TS && py > (e.y + fp[1]) * TS && py < (e.y + fp[1] + fp[3]) * TS) return true;
        } else if (e.type !== 'enemy' && e.type !== 'trigger') {
          if (Math.abs(px - e.px) < 16 && Math.abs(py - e.py) < 12) return true;
        }
      }
      return false;
    }
    blocked(x, y, ignore, who) {
      return this.solidAt(x - 10, y - 4, ignore, who) || this.solidAt(x + 10, y - 4, ignore, who) || this.solidAt(x - 10, y + 4, ignore, who) || this.solidAt(x + 10, y + 4, ignore, who);
    }
    // co-op: the two players must stay on the same screen
    leashOk(a, b) {
      return !b || (Math.abs(a.x - b.x) < W - 140 && Math.abs(a.y - b.y) < H - 150);
    }
    movePlayer(p, I, dt, who) {
      let dx = 0, dy = 0;
      if (I.held('left')) dx -= 1;
      if (I.held('right')) dx += 1;
      if (I.held('up')) dy -= 1;
      if (I.held('down')) dy += 1;
      // tap/click to walk (player 1)
      if (who === 0 && Input.mouse.down && !CK.Touch.enabled) {
        const mx = Input.mouse.x + this.camX, my = Input.mouse.y + this.camY;
        const ddx = mx - p.x, ddy = my - p.y;
        if (Math.hypot(ddx, ddy) > 20) {
          dx = Math.abs(ddx) > 12 ? Math.sign(ddx) : 0;
          dy = Math.abs(ddy) > 12 ? Math.sign(ddy) : 0;
        }
      }
      p.moving = false;
      if (!dx && !dy) return;
      const fast = this.costumeOf(who) === 'kite' ? 1.2 : 1;
      const sp = (165 * fast * dt) / (dx && dy ? Math.SQRT2 : 1);
      if (dx) p.dir = dx > 0 ? 'right' : 'left';
      if (dy && !dx) p.dir = dy > 0 ? 'down' : 'up';
      const other = who === 0 ? this.p2 : this.player;
      const nx = p.x + dx * sp, ny = p.y + dy * sp;
      if (!this.blocked(nx, p.y, null, who) && this.leashOk({ x: nx, y: p.y }, other)) p.x = nx;
      if (!this.blocked(p.x, ny, null, who) && this.leashOk({ x: p.x, y: ny }, other)) p.y = ny;
      p.moving = true;
      p.walk += dt * 12;
      if (Math.floor(p.walk / Math.PI) !== Math.floor((p.walk - dt * 12) / Math.PI)) {
        CK.Audio.sfx('step');
        // a little puff of dust (or snow) at every footfall
        const snowy = this.seasonId === 'winter';
        for (let i = 0; i < 2; i++) this.fx.emit({ x: p.x + U.rand(-6, 6), y: p.y - 1, vx: -dx * U.rand(10, 30) + U.rand(-12, 12), vy: U.rand(-14, -4), life: 0.45, size: U.rand(3, 4.5), grow: 7, color: snowy ? 'rgba(255,255,255,0.8)' : 'rgba(236,222,196,0.65)', shape: 'circle' });
      }
      // walking in the rain soaks your cardboard (unless someone has the Parasol up)
      const w = this.weather();
      if ((w === 'rain' || w === 'storm') && !this.anyWearing('umbrella')) CK.G.wet = Math.min(1, (CK.G.wet || 0) + dt * (w === 'storm' ? 0.05 : 0.03));
      if (who === 0) this.pushTrail();
    }
    pushTrail() {
      const p = this.player;
      const last = this.trail[0];
      if (Math.hypot(last.x - p.x, last.y - p.y) > 2.5) {
        this.trail.unshift({ x: p.x, y: p.y, dir: p.dir });
        if (this.trail.length > 60) this.trail.pop();
      }
    }

    // ------------------------------------------------------------- update
    update(dt, active) {
      this.t += dt;
      this.parts.update(dt);
      this.fx.update(dt);
      this.ambient(dt);
      if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 20);
      if (active) CK.showTouchPad = true;
      const busy = !active || CK.scriptRunning > 0 || CK.Trans.busy;
      const p = this.player;
      if (!busy) {
        if (Input.hit('menu')) {
          CK.Audio.sfx('select');
          CK.Scenes.push(new CK.PauseMenu());
          return;
        }
        this.movePlayer(p, Input.p(0), dt, 0);
        if (this.p2) this.movePlayer(this.p2, Input.p(1), dt, 1);
        if (Input.p(0).hit('ok') || (Input.mouse.pressed && this.focus && this.focusClicked())) this.interact(this.focus, 0);
        else if (this.p2 && Input.p(1).hit('ok')) this.interact(this.focus2, 1);
        if (!CK.scriptRunning) this.checkTriggers();
      } else {
        p.moving = false;
        if (this.p2) this.p2.moving = false;
      }
      this.grace = Math.max(0, this.grace - dt);
      this.updateEnemies(dt, busy);
      this.focus = busy ? null : this.findFocus(p, 0);
      this.focus2 = busy || !this.p2 ? null : this.findFocus(this.p2, 1);
      // keep player 2 close during cutscenes
      if (this.p2 && busy && Math.hypot(this.p2.x - p.x, this.p2.y - p.y) > 220) {
        const t = this.trail[24];
        this.p2.x = t.x;
        this.p2.y = t.y;
      }
      // camera (midpoint of both players in co-op)
      const mw = this.map.w * TS, mh = this.map.h * TS;
      const cx = this.p2 ? (p.x + this.p2.x) / 2 : p.x, cy = this.p2 ? (p.y + this.p2.y) / 2 : p.y;
      const tx = U.clamp(cx - W / 2, 0, mw - W), ty = U.clamp(cy - H / 2 - 20, 0, mh - H);
      this.camX += (tx - this.camX) * Math.min(1, dt * 6);
      this.camY += (ty - this.camY) * Math.min(1, dt * 6);
      CK.G.time += dt;
    }
    focusClicked() {
      const f = this.focus;
      const mx = Input.mouse.x + this.camX, my = Input.mouse.y + this.camY;
      return Math.hypot(mx - f.ix, my - f.iy) < 50;
    }
    // a few butterflies flutter around the screen by day (fall has moths of the friendly kind)
    drawButterflies(ctx, ox, oy) {
      if (this.night || this.seasonId === 'winter' || this.seasonId === 'campus') return;
      const bs = (this.bflies = this.bflies || []);
      const dt = 1 / 60;
      while (bs.length < 4) bs.push({ x: this.camX + Math.random() * W, y: this.camY + Math.random() * H, a: Math.random() * 6.28, ph: Math.random() * 6.28, col: U.pick(['#ffd25a', '#ff9ec7', '#9fd3ff', '#fffaf0', '#c9a6ff']) });
      for (const b of bs) {
        b.ph += dt * 14;
        b.a += (Math.sin(b.ph * 0.13) * 1.6) * dt;
        b.x += Math.cos(b.a) * 38 * dt;
        b.y += Math.sin(b.a) * 26 * dt + Math.sin(b.ph * 0.5) * 0.4;
        if (b.x < this.camX - 60 || b.x > this.camX + W + 60 || b.y < this.camY - 60 || b.y > this.camY + H + 60) {
          b.x = this.camX + Math.random() * W; b.y = this.camY + (Math.random() < 0.5 ? -20 : H + 20); b.a = Math.random() * 6.28;
        }
        const x = b.x - ox, y = b.y - oy, fl = Math.abs(Math.sin(b.ph));
        D.ellipse(ctx, x + 6, y + 26, 4, 1.5, 'rgba(40,20,10,0.15)');
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.cos(b.a) * 0.3);
        for (const k of [-1, 1]) {
          ctx.save(); ctx.scale(k * (0.25 + fl * 0.75), 1);
          D.ellipse(ctx, 4, -2, 4.5, 3.6, b.col, D.C.ink, 1);
          D.ellipse(ctx, 3, 3, 3, 2.4, b.col, D.C.ink, 1);
          ctx.restore();
        }
        D.line(ctx, 0, -4, 0, 4, D.C.ink, 1.6);
        ctx.restore();
      }
    }
    ambient(dt) {
      const kind = this.night && this.season.particle !== 'snow' ? 'firefly' : this.season.particle;
      const rate = { petal: 6, leaf: 5, snow: 22, sparkle: 4, firefly: 3 }[kind] || 0;
      if (Math.random() < rate * dt) {
        const x = this.camX + Math.random() * W, y = this.camY - 10;
        if (kind === 'petal') this.parts.emit({ x, y, vx: 20 + Math.random() * 30, vy: 30 + Math.random() * 20, sway: 30, life: 9, size: 4, color: U.pick(['#ffc1dc', '#ffd8e8', '#ff9ec7']), shape: 'petal', spin: 2, fade: false });
        if (kind === 'leaf') this.parts.emit({ x, y, vx: 30 + Math.random() * 30, vy: 40 + Math.random() * 20, sway: 40, life: 9, size: 6, color: U.pick(['#e8743b', '#f2a93b', '#c94f2c', '#d9b44a']), shape: 'leaf', spin: 2, fade: false });
        if (kind === 'snow') this.parts.emit({ x, y, vx: -10 + Math.random() * 20, vy: 40 + Math.random() * 30, sway: 20, life: 12, size: 1.5 + Math.random() * 2.5, color: '#ffffff', shape: 'snow', fade: false });
        if (kind === 'sparkle') this.parts.emit({ x, y: this.camY + Math.random() * H, life: 0.8, size: 5, color: '#fffbe0', shape: 'spark', spin: 3 });
        if (kind === 'firefly') this.parts.emit({ x, y: this.camY + Math.random() * H, vx: U.rand(-15, 15), vy: U.rand(-15, 5), sway: 25, life: 5, size: 2.5, shape: 'firefly', color: '#fff3a0' });
      }
    }
    updateEnemies(dt, busy) {
      for (const e of this.ents) {
        if (e.type !== 'enemy') continue;
        if (busy) continue;
        let p = this.player;
        if (this.p2 && Math.hypot(this.p2.x - e.px, this.p2.y - e.py) < Math.hypot(p.x - e.px, p.y - e.py)) p = this.p2;
        const dPlayer = Math.hypot(p.x - e.px, p.y - e.py);
        let tx, ty, sp;
        if (dPlayer < 170 && this.grace <= 0) {
          tx = p.x; ty = p.y; sp = 95;
          e.alert = Math.min(1, (e.alert || 0) + dt * 4);
        } else {
          e.alert = Math.max(0, (e.alert || 0) - dt);
          const pt = e.pts[e.pi];
          tx = pt[0]; ty = pt[1]; sp = 45;
          if (Math.hypot(tx - e.px, ty - e.py) < 4) e.pi = (e.pi + 1) % e.pts.length;
        }
        const dx = tx - e.px, dy = ty - e.py, d = Math.hypot(dx, dy);
        if (d > 1) {
          const nx = e.px + (dx / d) * sp * dt, ny = e.py + (dy / d) * sp * dt;
          const free = (x, y) => !this.solidAt(x - 8, y, e) && !this.solidAt(x + 8, y, e);
          if (free(nx, e.py)) e.px = nx;
          if (free(e.px, ny)) e.py = ny;
          e.walk += dt * 10;
          e.dir = dx < 0 ? 'left' : 'right';
        }
        if (dPlayer < 30 && this.grace <= 0) {
          this.grace = 2;
          const id = e.id;
          CK.Audio.sfx('select');
          this.fx.emit({ x: e.px, y: e.py - 60, life: 0.8, size: 26, text: '!', shape: 'text', color: '#ef6b6b', vy: -20 });
          const b = CK.startBattle(e.battle);
          CK.co(function* () {
            yield b;
            if (b.result === 'win') {
              CK.setFlag('foe_' + id);
              if (CK.OW) CK.OW.buildEntities();
              const after = CK.Story.scripts['after_' + id];
              if (after) CK.runScript(after);
              else CK.saveGame();
            }
          });
          return;
        }
      }
    }
    checkTriggers() {
      const p = this.player;
      const tx = p.x / TS, ty = p.y / TS;
      for (const o of this.ch.objects) {
        if (o.type !== 'trigger') continue;
        const inside = tx >= o.x && tx < o.x + o.w && ty >= o.y && ty < o.y + o.h;
        const was = this.triggersInside[o.id];
        this.triggersInside[o.id] = inside;
        if (inside && !was && (!o.cond || o.cond(CK.G))) {
          CK.runScript(o.script);
          return;
        }
      }
    }
    findFocus(p, who) {
      p = p || this.player;
      const fx = p.x + (p.dir === 'left' ? -26 : p.dir === 'right' ? 26 : 0);
      const fy = p.y + (p.dir === 'up' ? -26 : p.dir === 'down' ? 22 : -4);
      let best = null, bd = 46;
      // field-power tiles right in front of the player
      const ftx = Math.floor(fx / TS), fty = Math.floor(fy / TS);
      const ft = this.map.get(ftx, fty);
      if (ft === 'Q' || ft === 'S') {
        best = { type: 'tile', tile: ft, tx: ftx, ty: fty, ix: (ftx + 0.5) * TS, iy: (fty + 0.8) * TS };
        bd = 30;
      }
      for (const e of this.ents) {
        if (e.type === 'enemy' || e.type === 'trigger') continue;
        if (e.type === 'deco' && e.kind !== 'leafpile' && !e.script) continue;
        let ix = e.px, iy = e.py;
        if (e.type === 'house') {
          ix = e.px;
          iy = (e.y + 1) * TS + 6;
        }
        if (e.type === 'building') iy = (e.y + 1) * TS + 4;
        if (e.type === 'chest' && CK.flag('chest_' + e.id)) continue;
        if (e.type === 'chest' && e.hidden && !this.anyWearing('lighthouse')) continue;
        const d = Math.min(Math.hypot(fx - ix, fy - iy), Math.hypot(p.x - ix, p.y - iy) + 8);
        if (d < bd) {
          bd = d;
          best = e;
          e.ix = ix;
          e.iy = iy;
        }
      }
      return best;
    }
    interact(e, who) {
      if (!e) return;
      CK.Audio.sfx('blip');
      const G = CK.G;
      const wear = this.costumeOf(who || 0);
      const name = who === 1 ? 'Jules' : 'Sam';
      if (e.type === 'tile') {
        const need = e.tile === 'Q' ? 'bulldozer' : 'snowplow';
        if (wear !== need) {
          CK.runScript([{ narrate: e.tile === 'Q' ? 'A Silver Quill barricade, bolted shut. Something big and pushy could shove it aside. (Field power: Bulldozer costume)' : 'A deep snowdrift. You would need something to plow through it. (Field power: Snowplow costume)' }]);
          return;
        }
        const key = 'cleared_' + this.ch.id;
        G.flags[key] = (G.flags[key] || []).concat([e.tx + ',' + e.ty]);
        this.map.set(e.tx, e.ty, e.tile === 'S' ? ',' : '.');
        this.prerender();
        this.shake = 6;
        CK.Audio.sfx(e.tile === 'Q' ? 'break' : 'whoosh');
        this.fx.burst(18, () => ({ x: e.ix, y: e.iy - 20, vx: U.rand(-200, 200), vy: U.rand(-260, -60), g: 500, life: 1, size: U.rand(4, 9), shape: e.tile === 'Q' ? 'square' : 'snow', color: e.tile === 'Q' ? U.pick(['#a9b1c2', '#cfd6de', '#8a93a3']) : '#fff', spin: 6 }));
        CK.toast(e.tile === 'Q' ? `${name} bulldozes the barricade!` : `${name} plows the drift!`);
        return;
      }
      if (e.type === 'deco' && e.script) {
        CK.runScript(typeof e.script === 'function' ? e.script(G) : e.script);
        return;
      }
      if (e.type === 'deco' && e.kind === 'leafpile') {
        CK.Audio.sfx('whoosh');
        this.fx.burst(30, () => ({ x: e.px + U.rand(-20, 20), y: e.py - 10, vx: U.rand(-220, 220), vy: U.rand(-320, -100), g: 300, life: 1.6, size: 6, shape: 'leaf', color: U.pick(['#e8743b', '#f2a93b', '#c94f2c', '#d9b44a']), spin: 4, sway: 30 }));
        const k = 'leaf_' + e.x + '_' + e.y;
        if (!CK.flag(k)) {
          CK.setFlag(k);
          CK.runScript([{ narrate: `${name} cannonballs into the leaf pile. Crunch! Something was hiding in there.` }, { scraps: 4 }]);
        } else CK.toast('Crunch! Still the best feeling.');
        return;
      }
      if (e.type === 'stand') {
        G.wet = 0;
        CK.healParty();
        CK.Audio.sfx('heal');
        const k = 'stand_' + this.ch.id + (this.night ? '_n' : '_d');
        const first = !CK.flag(k);
        CK.setFlag(k);
        CK.runScript([[e.who || 'narrator', e.line, 'happy'], { narrate: `Warm ${e.drink}. Everyone's cardboard dries out and stops feeling floppy.` }].concat(first ? [{ snacks: 1 }] : []));
        return;
      }
      if (e.type === 'campfire') {
        G.wet = 0;
        CK.healParty();
        CK.saveGame();
        CK.Audio.sfx('heal');
        this.fx.burst(10, () => ({ x: e.px + U.rand(-10, 10), y: e.py - 30, vx: U.rand(-30, 30), vy: U.rand(-90, -40), life: 1.2, size: 3, shape: 'spark', color: '#ffd25a' }));
        CK.runScript([{ narrate: 'You warm your hands by the cardboard campfire (it is very carefully pretend fire). Everyone dries off and rests. Game saved.' }]);
        return;
      }
      if (e.type === 'cat') {
        G.pets = (G.pets || 0) + 1;
        CK.Audio.sfx('heal');
        e.purr = 1.5;
        this.fx.burst(6, () => ({ x: e.px + U.rand(-14, 14), y: e.py - 40, vy: -50, life: 1.1, size: 7, shape: 'star', color: '#ff9ec7' }));
        const k = 'pet_' + this.ch.id;
        if (!CK.flag(k)) {
          CK.setFlag(k);
          const n = ['campus', 'spring', 'summer', 'fall', 'winter'].filter((c) => CK.flag('pet_' + c)).length;
          const lines = [['biscuit', U.pick(['Mrrp.', 'Prrrrrrrrr.', '*slow blink*', 'Mew? Mew.']), 'happy'], { narrate: `${name} pets Biscuit. (${n}/5 places)` }];
          if (n === 5) lines.push(['pip', "Biscuit has followed us to every corner of the Kingdom. And your world. I think Biscuit is the real Royal Engineer.", 'happy'], { scraps: 20 }, { journal: 'Petted Biscuit the cat in all five places. Biscuit seems to slip between worlds whenever it likes. Cats.' });
          CK.runScript(lines);
        } else CK.toast('Biscuit purrs. (pets: ' + G.pets + ')');
        return;
      }
      if (e.type === 'shop') {
        CK.Scenes.push(new CK.ShopScene());
        return;
      }
      if (e.type === 'building' || e.type === 'portal' || e.type === 'knightfig') {
        const sc = typeof e.script === 'function' ? e.script(G) : e.script || [{ narrate: e.text }];
        CK.runScript(sc);
        return;
      }
      if (e.type === 'npc') {
        e.dir = 'down';
        const sc = typeof e.talk === 'function' ? e.talk(G) : e.talk;
        CK.runScript(sc);
      } else if (e.type === 'house') {
        if (e.broken && !CK.flag(e.broken)) {
          CK.runScript([{ narrate: 'This home has gone soggy and collapsed. Nobody can live here until the water is under control.' }, ['pip', 'Poor thing. Cardboard and floods do not mix.', 'sad']]);
        } else if (CK.flag('knock_' + e.id)) {
          CK.runScript([{ narrate: 'You already visited this house. Someone inside waves at you through the window.' }]);
        } else {
          CK.Audio.sfx('knock');
          CK.setFlag('knock_' + e.id);
          this.fx.emit({ x: e.px, y: e.py - 30, life: 0.8, size: 18, text: 'knock knock!', shape: 'text', color: '#fff', vy: -30 });
          CK.runScript([{ wait: 0.5 }].concat(CK.Story.scripts[e.knock] || []));
        }
      } else if (e.type === 'chest') {
        CK.setFlag('chest_' + e.id);
        CK.Audio.sfx('chest');
        this.fx.burst(14, () => ({ x: e.px, y: e.py - 20, vx: U.rand(-80, 80), vy: U.rand(-160, -60), g: 300, life: 1, size: 6, shape: 'square', color: U.pick(['#ecc38c', '#d9a66b', '#ffd25a']) }));
        CK.runScript(e.script);
      } else if (e.type === 'bench') {
        CK.Scenes.push(new CK.Workbench());
      } else if (e.type === 'site' || e.type === 'notice') {
        CK.runScript(typeof e.script === 'function' ? e.script(G) : e.script);
      } else if (e.type === 'sign') {
        CK.runScript([{ narrate: e.text }]);
      }
    }

    // ------------------------------------------------------------- render
    prerender() {
      const m = this.map, S = this.season;
      const c = document.createElement('canvas');
      c.width = m.w * TS;
      c.height = m.h * TS;
      const g = c.getContext('2d');
      const isWater = (x, y) => '~bBd'.includes(m.get(x, y)) || (x < 0 || y < 0 || x >= m.w || y >= m.h ? false : false);
      // ground
      g.fillStyle = S.ground;
      g.fillRect(0, 0, c.width, c.height);
      for (let y = 0; y < m.h; y++)
        for (let x = 0; x < m.w; x++) {
          const h = U.hash(x, y, 9);
          if (h < 0.4) {
            g.fillStyle = S.ground2;
            g.beginPath();
            g.ellipse(x * TS + h * 60, y * TS + 24, 16 + h * 12, 8, 0, 0, 6.28);
            g.fill();
          }
        }
      // grass tufts, lit from the upper left
      if (!/winter/.test(this.seasonId)) {
        const dark = D.shade(S.ground, -0.22), lite = D.shade(S.ground, 0.22);
        for (let y = 0; y < m.h; y++)
          for (let x = 0; x < m.w; x++) {
            if (!'.,'.includes(m.get(x, y))) continue;
            const h = U.hash(x, y, 21);
            if (h > 0.22) continue;
            const X = x * TS + 8 + U.hash(x, y, 22) * 30, Y = y * TS + 14 + U.hash(x, y, 23) * 26;
            g.lineCap = 'round';
            for (let i = -1; i <= 1; i++) {
              D.line(g, X + i * 3, Y, X + i * 5 + 1, Y - 7 - (i === 0 ? 3 : 0), dark, 2.4);
              D.line(g, X + i * 3 - 0.6, Y - 2, X + i * 5 + 0.4, Y - 7 - (i === 0 ? 3 : 0), lite, 1);
            }
          }
      }
      const blob = (x, y, col, pad, test) => {
        g.fillStyle = col;
        const X = x * TS, Y = y * TS;
        D.rr(g, X + pad, Y + pad, TS - pad * 2, TS - pad * 2, 14);
        g.fill();
        if (test(x + 1, y)) g.fillRect(X + TS / 2, Y + pad, TS / 2 + pad, TS - pad * 2);
        if (test(x - 1, y)) g.fillRect(X - pad, Y + pad, TS / 2 + pad, TS - pad * 2);
        if (test(x, y + 1)) g.fillRect(X + pad, Y + TS / 2, TS - pad * 2, TS / 2 + pad);
        if (test(x, y - 1)) g.fillRect(X + pad, Y - pad, TS - pad * 2, TS / 2 + pad);
      };
      const isSand = (x, y) => 'sz'.includes(m.get(x, y));
      const isPath = (x, y) => '=bdBi'.includes(m.get(x, y)) && m.get(x, y) !== 'i';
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (isSand(x, y)) blob(x, y, S.sand, -2, (a, b) => isSand(a, b) || isWater(a, b));
      // paths are worn a little into the ground: a shaded lip on top, the path itself just below
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.get(x, y) === '=') blob(x, y, D.shade(S.path, -0.22), 5, isPath);
      g.save();
      g.translate(0, 3);
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.get(x, y) === '=') blob(x, y, S.path, 5, isPath);
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.get(x, y) === '=' && U.hash(x, y, 31) < 0.35)
        D.egg(g, x * TS + 12 + U.hash(x, y, 32) * 24, y * TS + 16 + U.hash(x, y, 33) * 18, 3.2, 2.2, D.hexShade(S.path, -0.12), { lw: 0 });
      g.restore();
      // ice
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.get(x, y) === 'i') {
        blob(x, y, '#cdeefa', 0, (a, b) => m.get(a, b) === 'i');
        D.line(g, x * TS + 10, y * TS + 30, x * TS + 22, y * TS + 18, 'rgba(255,255,255,.8)', 2);
      }
      // shallows (wade-able with the Suspension Bridge)
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.get(x, y) === 'h') {
        blob(x, y, S.water, 0, (a, b) => m.get(a, b) === 'h' || isWater(a, b));
        g.globalAlpha = 0.5;
        blob(x, y, '#e8f8ff', 6, (a, b) => m.get(a, b) === 'h');
        g.globalAlpha = 1;
        for (let i = 0; i < 2; i++) D.ellipse(g, x * TS + 14 + i * 20, y * TS + 18 + i * 12, 7, 4, '#b9a88f', D.C.ink, 1.5);
      }
      // water sits a little below the ground: a dark bank shows above the waterline
      for (let y = 0; y < m.h; y++)
        for (let x = 0; x < m.w; x++) {
          if (!isWater(x, y)) continue;
          blob(x, y, D.shade(S.ground, -0.42), -2, isWater);
        }
      g.save();
      g.translate(0, 7);
      for (let y = 0; y < m.h; y++)
        for (let x = 0; x < m.w; x++) {
          if (!isWater(x, y)) continue;
          blob(x, y, S.waterD, -1, isWater);
        }
      for (let y = 0; y < m.h; y++)
        for (let x = 0; x < m.w; x++) {
          if (!isWater(x, y)) continue;
          blob(x, y, S.water, 4, isWater);
        }
      g.restore();
      // decor and solids
      for (let y = 0; y < m.h; y++)
        for (let x = 0; x < m.w; x++) {
          const t = m.get(x, y);
          const X = x * TS, Y = y * TS, h = U.hash(x, y, 4);
          if (t === ',') this.drawDecor(g, X + 10 + h * 24, Y + 14 + U.hash(x, y, 6) * 22, h);
          if (t === 'z') {
            D.ellipse(g, X + 18 + h * 14, Y + 24, 5, 4, h > 0.5 ? '#ffd1dc' : '#fff4e0', D.C.ink, 1.2);
          }
          if (t === 'R') {
            D.shadow(g, X + 28, Y + 42, 20, 6, 0.3);
            D.egg(g, X + 24, Y + 32, 18, 13, '#9aa0a8', { lw: 2 });
            if (this.seasonId === 'winter') D.ellipse(g, X + 24, Y + 26, 14, 5, '#fff');
          }
          if (t === 'S') {
            D.shadow(g, X + 28, Y + 42, 24, 6, 0.2);
            D.egg(g, X + 24, Y + 32, 22, 14, '#eef6ff', { lw: 2, stroke: '#a9c4dc', k: 0.5 });
          }
          if (t === 'b' || t === 'd') {
            const vert = t === 'd' || (isWater(x, y - 1) && isWater(x, y + 1) && !(isWater(x - 1, y) && isWater(x + 1, y)));
            for (let i = 0; i < 4; i++) {
              if (vert) D.cardboard(g, X + 2, Y + i * 12, TS - 4, 11, { r: 2, lw: 2, fill: i % 2 ? '#c99561' : '#d9a66b', flute: false });
              else D.cardboard(g, X + i * 12, Y + 2, 11, TS - 4, { r: 2, lw: 2, fill: i % 2 ? '#c99561' : '#d9a66b', flute: false });
            }
          }
          if (t === 'B') {
            D.cardboard(g, X + 4, Y + 18, 14, 12, { r: 2, lw: 2, fill: '#a47a4c', flute: false });
            D.cardboard(g, X + 28, Y + 22, 12, 10, { r: 2, lw: 2, fill: '#a47a4c', flute: false });
          }
          if (t === 'w') {
            D.box3(g, X, Y - 10, TS - 8, TS + 10, 18, { r: 2, lw: 3, fill: '#a9b1c2', flute: false });
            D.icon(g, 'feather', X + 20, Y + 10, 1);
          }
          if (t === 'Q') {
            D.shadow(g, X + 30, Y + TS - 2, 26, 6, 0.3);
            D.box3(g, X + 2, Y - 4, TS - 12, TS, 16, { r: 2, lw: 3, fill: '#b8c0cf', flute: false });
            D.line(g, X + 6, Y + 2, X + TS - 6, Y + 26, '#8a93a3', 4);
            D.line(g, X + TS - 6, Y + 2, X + 6, Y + 26, '#8a93a3', 4);
            D.circle(g, X + 24, Y + 14, 7, '#e9eef6', D.C.ink, 2);
            D.icon(g, 'feather', X + 24, Y + 14, 0.6);
          }
          if (t === 'f') {
            D.line(g, X, Y + 26, X + TS, Y + 26, D.C.cardDD, 4);
            D.line(g, X + 8, Y + 14, X + 8, Y + 40, D.C.cardDD, 5);
            D.line(g, X + 36, Y + 14, X + 36, Y + 40, D.C.cardDD, 5);
          }
        }
      // chapters can paint extra ground details (like a stone bridge deck)
      if (this.ch.paintGround) this.ch.paintGround.call(this, g, m);
      this.ground = c;
    }
    drawDecor(g, x, y, h) {
      const s = this.seasonId;
      if (s === 'campus' || s === 'campusColor') {
        const col = s === 'campus' ? ['#c9c9c9', '#b8b8c8', '#d8d0b8'] : ['#ffffff', '#ffd25a', '#ff9ec7'];
        D.circle(g, x, y, 2.5, col[Math.floor(h * 3)]);
        D.circle(g, x + 5, y + 3, 2, col[(Math.floor(h * 3) + 1) % 3]);
      } else if (s === 'spring') {
        const col = h < 0.33 ? '#ffffff' : h < 0.66 ? '#ffb7d5' : '#ffe38a';
        for (let i = 0; i < 5; i++) D.circle(g, x + Math.cos(i * 1.26) * 4, y + Math.sin(i * 1.26) * 4, 3, col);
        D.circle(g, x, y, 2.2, '#ffcf3a');
      } else if (s === 'summer') {
        for (let i = -1; i <= 1; i++) D.line(g, x, y + 6, x + i * 5, y - 4, '#79b84a', 2.5);
      } else if (s === 'fall') {
        for (let i = 0; i < 3; i++) {
          g.save();
          g.translate(x + i * 6 - 6, y + (i % 2) * 5);
          g.rotate(h * 6 + i);
          D.poly(g, [0, -6, 5, 0, 0, 6, -5, 0], ['#e8743b', '#f2a93b', '#c94f2c'][(i + Math.floor(h * 3)) % 3]);
          g.restore();
        }
      } else {
        D.ellipse(g, x, y, 9, 4, '#ffffff');
        D.ellipse(g, x + 2, y + 2, 6, 2, '#d8e6f3');
      }
    }
    // tree canopies are shaded once and cached as sprites, then drawn with a little sway
    canopySprite(type) {
      this.canopies = this.canopies || {};
      if (this.canopies[type]) return this.canopies[type];
      const c = document.createElement('canvas');
      c.width = 120; c.height = 110;
      const g = c.getContext('2d');
      const x = 60, y = 104;
      if (type === 'pine') {
        for (let i = 0; i < 3; i++) {
          const w = 28 - i * 6, yy = y - 22 - i * 17;
          D.poly(g, [x - w, yy, x, yy - 28, x + w, yy], '#3f8f6a', D.C.ink, 2.5);
          D.poly(g, [x, yy - 28, x + w, yy, x + w * 0.1, yy], '#2f7456');
          D.poly(g, [x - w * 0.55, yy - 12, x, yy - 28, x + w * 0.4, yy - 12], '#ffffff');
          D.poly(g, [x - w, yy, x, yy - 28, x + w, yy], null, D.C.ink, 2.5);
        }
      } else {
        const col = type === 'blossom' ? '#ffb7d5' : type === 'oak' ? '#6cc56c' : '#e8743b';
        const alt = type === 'blossom' ? '#ff9ec7' : type === 'oak' ? '#4fae5a' : '#f2a93b';
        const pts = [[-15, -40], [15, -40], [0, -57], [-7, -46], [9, -49]];
        for (const [ox, oy] of pts) D.circle(g, x + ox, y + oy, 18, null, D.C.ink, 4);
        pts.forEach(([ox, oy], i) => {
          g.beginPath(); g.arc(x + ox, y + oy, 17, 0, Math.PI * 2);
          g.fillStyle = D.vg(g, x + ox, y + oy, 18, i % 2 ? alt : col, 0.8); g.fill();
        });
        // a soft shadow under the canopy, and a few blossoms or leaves for texture
        g.save();
        g.beginPath(); for (const [ox, oy] of pts) { g.moveTo(x + ox + 17, y + oy); g.arc(x + ox, y + oy, 17, 0, Math.PI * 2); } g.clip();
        const sh = g.createLinearGradient(0, y - 70, 0, y - 22);
        sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(40,20,40,0.28)');
        g.fillStyle = sh; g.fillRect(0, 0, 120, 110);
        for (let i = 0; i < 9; i++) D.circle(g, x - 26 + U.hash(i, 7) * 52, y - 66 + U.hash(i, 8) * 36, 2.2, type === 'blossom' ? '#fff0f6' : 'rgba(255,255,255,.35)');
        g.restore();
      }
      this.canopies[type] = c;
      return c;
    }
    drawTree(ctx, tr) {
      const x = tr.px - this.camX, y = tr.py - this.camY;
      if (x < -60 || x > W + 60 || y < -20 || y > H + 100) return;
      const sway = Math.sin(this.t * 1.5 + tr.seed * 6) * 2;
      const type = this.season.tree;
      D.shadow(ctx, x + 6, y - 1, 24, 7, 0.3);
      if (type === 'palm') {
        ctx.beginPath(); ctx.moveTo(x, y - 2); ctx.quadraticCurveTo(x + 10, y - 30, x + 4 + sway, y - 58);
        ctx.strokeStyle = D.C.ink; ctx.lineWidth = 10; ctx.stroke(); ctx.strokeStyle = '#b98455'; ctx.lineWidth = 7; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 2; ctx.stroke();
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + (i - 2) * 0.7 + sway * 0.02;
          ctx.beginPath(); ctx.moveTo(x + 4 + sway, y - 58);
          ctx.quadraticCurveTo(x + 4 + sway + Math.cos(a) * 26, y - 70 + Math.sin(a) * 14, x + 4 + sway + Math.cos(a) * 34, y - 50 + Math.sin(a) * 8);
          ctx.strokeStyle = D.C.ink; ctx.lineWidth = 10; ctx.stroke(); ctx.strokeStyle = i < 2 ? '#7ad67a' : i > 2 ? '#4fa04f' : '#6cc56c'; ctx.lineWidth = 7; ctx.stroke();
        }
        D.ball(ctx, x + 2 + sway, y - 54, 4.5, '#8a5a2e', { lw: 1.5 }); D.ball(ctx, x + 8 + sway, y - 54, 4.5, '#8a5a2e', { lw: 1.5 });
        return;
      }
      D.rr(ctx, x - 6, y - 32, 12, 32, 4);
      ctx.fillStyle = D.lgx(ctx, x - 6, x + 6, '#8a5a2e'); ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 2; ctx.stroke();
      ctx.drawImage(this.canopySprite(type), x - 60 + sway, y - 104);
      if (this.night && tr.seed < 0.12) {
        // shy little eyes peeking out of the leaves at night
        const blink = Math.sin(this.t * 0.9 + tr.seed * 40) > 0.94;
        if (!blink) {
          D.ellipse(ctx, x - 5 + sway, y - 44, 2.6, 3.4, '#fff6b0');
          D.ellipse(ctx, x + 5 + sway, y - 44, 2.6, 3.4, '#fff6b0');
        }
      }
    }
    drawHouse(ctx, e) {
      const x = e.x * TS - this.camX, y = e.y * TS - this.camY;
      const broken = e.broken && !CK.flag(e.broken);
      const night = this.night;
      D.shadow(ctx, x + 56, y + 46, 58, 12, 0.32);
      if (broken) {
        ctx.save(); ctx.translate(x + 48, y + 44); ctx.rotate(-0.08);
        D.cardboard(ctx, -40, -20, 50, 20, { r: 3, lw: 2, fill: '#b98f62' });
        ctx.rotate(0.3);
        D.cardboard(ctx, -6, -30, 44, 16, { r: 3, lw: 2, fill: '#a98057' });
        ctx.restore();
        D.poly(ctx, [x + 20, y + 22, x + 50, y + 4, x + 70, y + 26], e.roof, D.C.ink, 2);
        D.ellipse(ctx, x + 48, y + 50, 46, 8, 'rgba(90,170,230,0.55)');
        D.tape(ctx, x + 30, y + 26, 30, 10, 0.4);
        return;
      }
      const style = e.style || 'box';
      const wall = style === 'hut' ? '#f3e2c0' : style === 'snow' ? '#d9c3a3' : style === 'burrow' ? '#c9935a' : '#e2b27a';
      const d = 22, dx = d * 0.42, dy = -d * 0.78;
      D.box3(ctx, x + 8, y - 6, 80, 54, d, { fill: wall, noTop: true });
      if (style === 'burrow') {
        ctx.beginPath(); ctx.arc(x + 48 + dx * 0.5, y - 2 + dy * 0.5, 48, Math.PI, 0); ctx.closePath();
        D.fillVol(ctx, x + 40, y - 20, 50, e.roof, 3);
        for (let i = 0; i < 6; i++) D.ball(ctx, x + 14 + i * 14, y - 10 - Math.sin(i) * 10, 6, '#f2a93b', { lw: 1.2 });
      } else {
        const roofD = d + 8, rdx = roofD * 0.42, rdy = -roofD * 0.78;
        // far (left) slope, near (right) slope, then the gable end facing us
        D.poly(ctx, [x - 4, y + 2, x + 48, y - 42, x + 48 + rdx, y - 42 + rdy, x - 4 + rdx, y + 2 + rdy], D.shade(e.roof, 0.18), D.C.ink, 3);
        D.poly(ctx, [x + 48, y - 42, x + 100, y + 2, x + 100 + rdx, y + 2 + rdy, x + 48 + rdx, y - 42 + rdy], D.shade(e.roof, -0.22), D.C.ink, 3);
        ctx.save(); ctx.beginPath(); ctx.moveTo(x + 48, y - 42); ctx.lineTo(x + 100, y + 2); ctx.lineTo(x + 100 + rdx, y + 2 + rdy); ctx.lineTo(x + 48 + rdx, y - 42 + rdy); ctx.clip();
        ctx.strokeStyle = 'rgba(0,0,0,.14)'; ctx.lineWidth = 2;
        for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x + 48 + (52 * i) / 6, y - 42 + (44 * i) / 6); ctx.lineTo(x + 48 + (52 * i) / 6 + rdx, y - 42 + (44 * i) / 6 + rdy); ctx.stroke(); }
        if (style === 'snow') { ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.fillRect(x + 40, y - 70, 80, 40); }
        ctx.restore();
        D.poly(ctx, [x - 4, y + 2, x + 48, y - 42, x + 100, y + 2], e.roof, D.C.ink, 3);
        ctx.save(); ctx.beginPath(); ctx.moveTo(x - 4, y + 2); ctx.lineTo(x + 48, y - 42); ctx.lineTo(x + 100, y + 2); ctx.clip();
        const rg = ctx.createLinearGradient(x, y - 42, x + 60, y + 2);
        rg.addColorStop(0, 'rgba(255,255,255,.25)'); rg.addColorStop(1, 'rgba(0,0,0,.12)');
        ctx.fillStyle = rg; ctx.fillRect(x - 10, y - 50, 120, 60);
        ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x - 10, y - 6 - i * 9); ctx.lineTo(x + 110, y - 6 - i * 9); ctx.stroke(); }
        ctx.restore();
        D.circle(ctx, x + 48, y - 18, 7, this.night ? '#ffd76a' : '#bfe6ff', D.C.ink, 2);
        if (style === 'snow') D.poly(ctx, [x + 12, y - 12, x + 48, y - 42, x + 84, y - 12, x + 70, y - 8, x + 48, y - 26, x + 26, y - 8], '#fff');
        if (style === 'hut') for (let i = 0; i < 7; i++) D.line(ctx, x + 6 + i * 14, y + 2, x + 6 + i * 14, y + 8, '#c9a04a', 3);
        // chimney
        D.box3(ctx, x + 70, y - 34, 10, 16, 6, { fill: '#b9674a', lw: 2, flute: false });
      }
      // door + windows
      D.rr(ctx, x + 38, y + 18, 20, 30, 8); ctx.fillStyle = D.lgx(ctx, x + 38, x + 58, '#8a5a2e'); ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 2; ctx.stroke();
      D.circle(ctx, x + 53, y + 34, 2, '#ffd25a');
      D.box3(ctx, x + 34, y + 46, 28, 4, 6, { fill: '#a9a29a', lw: 1.5, flute: false });
      const win = night ? '#ffd76a' : '#bfe6ff';
      D.rr(ctx, x + 14, y + 10, 18, 16, 3); ctx.fillStyle = win; ctx.fill(); ctx.stroke();
      D.rr(ctx, x + 64, y + 10, 18, 16, 3); ctx.fillStyle = win; ctx.fill(); ctx.stroke();
      D.line(ctx, x + 23, y + 10, x + 23, y + 26, D.C.ink, 1.5);
      D.line(ctx, x + 73, y + 10, x + 73, y + 26, D.C.ink, 1.5);
      if (!CK.flag('knock_' + e.id) && this.focus === e) D.text(ctx, 'Knock!', x + 48, y - 50, { size: 16, align: 'center', color: '#fff', outline: D.C.ink });
    }
    drawDeco(ctx, e) {
      const x = e.px - this.camX, y = e.py - this.camY;
      // later chapters register their own props here
      if (CK.DecoDraw[e.kind]) return CK.DecoDraw[e.kind].call(this, ctx, e, x, y);
      switch (e.kind) {
        case 'lantern':
          D.line(ctx, x, y, x, y - 40, D.C.ink, 4);
          D.shadow(ctx, x + 4, y, 10, 3.5);
          D.rr(ctx, x - 8, y - 56, 16, 18, 5); ctx.fillStyle = D.vg(ctx, x, y - 47, 12, this.night ? '#ffd76a' : '#fff3c4', 0.6); ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 2; ctx.stroke();
          D.poly(ctx, [x - 10, y - 56, x, y - 64, x + 10, y - 56], '#ef6b6b', D.C.ink, 2);
          break;
        case 'bigtree': {
          const sw = Math.sin(this.t) * 2;
          D.shadow(ctx, x, y, 50, 12);
          D.rr(ctx, x - 12, y - 60, 24, 60, 6); ctx.fillStyle = '#8a5a2e'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 3; ctx.stroke();
          const pts = [[-36, -80], [36, -80], [0, -112], [-22, -100], [22, -104], [0, -78]];
          for (const [ox, oy] of pts) D.circle(ctx, x + ox + sw, y + oy, 32, null, D.C.ink, 4);
          pts.forEach(([ox, oy], i) => D.circle(ctx, x + ox + sw, y + oy, 31, ['#ffb7d5', '#ffc9e0', '#ff9ec7'][i % 3]));
          break;
        }
        case 'boat': {
          const bob = Math.sin(this.t * 2 + e.x) * 3;
          ctx.save(); ctx.translate(x, y + bob); ctx.rotate(Math.sin(this.t * 1.5 + e.x) * 0.05);
          D.poly(ctx, [-44, -10, 44, -10, 32, 14, -32, 14], '#8a5a2e', D.C.ink, 3);
          D.cardboard(ctx, -20, -26, 40, 16, { r: 3, lw: 2, fill: D.C.card });
          D.tape(ctx, -30, -6, 20, 8, 0.2); D.tape(ctx, 10, 0, 20, 8, -0.3);
          D.line(ctx, 0, -10, 0, -62, D.C.ink, 4);
          D.poly(ctx, [2, -60, 34, -30, 2, -26], '#fffaf0', D.C.ink, 2);
          D.poly(ctx, [0, -62, -14, -58, 0, -54], '#5aa9e6', D.C.ink, 1.5);
          ctx.restore();
          break;
        }
        case 'umbrella':
          D.line(ctx, x, y, x, y - 50, D.C.ink, 3);
          ctx.beginPath(); ctx.arc(x, y - 48, 30, Math.PI, 0); ctx.closePath();
          ctx.fillStyle = '#ef6b6b'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 2; ctx.stroke();
          ctx.save(); ctx.beginPath(); ctx.arc(x, y - 48, 30, Math.PI, 0); ctx.clip();
          for (let i = -2; i <= 2; i += 2) { ctx.fillStyle = '#fff'; ctx.fillRect(x + i * 10 - 5, y - 80, 10, 40); }
          ctx.restore();
          break;
        case 'engine': {
          D.shadow(ctx, x + 24, y + 30, 90, 14);
          D.enemy(ctx, 'moatengine', x + 24, y + 40, { s: 0.6, phase2: this.night });
          if (this.night && !CK.flag('summer_boss')) for (let i = 0; i < 2; i++) this.fx.emit({ x: e.px - 40 + U.rand(-5, 5), y: e.py - 30, vx: U.rand(-140, -60), vy: U.rand(-80, -20), g: 300, life: 0.8, size: 4, shape: 'drop', color: '#6fc3ff' });
          break;
        }
        case 'archive': {
          D.shadow(ctx, x + 24, y + 26, 100, 14);
          D.box3(ctx, x - 70, y - 90, 190, 116, 30, { r: 2, lw: 4, fill: '#d9b98a', noTop: true });
          D.poly(ctx, [x + 25, y - 150, x + 134, y - 88, x + 134 + 16, y - 88 - 30, x + 25 + 16, y - 150 - 30], D.shade('#8a5a2e', -0.2), D.C.ink, 4);
          D.poly(ctx, [x - 84, y - 88, x + 25, y - 150, x + 134, y - 88], '#8a5a2e', D.C.ink, 4);
          for (let i = 0; i < 5; i++) D.cardboard(ctx, x - 58 + i * 38, y - 80, 14, 96, { r: 2, lw: 2, fill: '#f0e2c6', flute: false });
          D.rr(ctx, x + 6, y - 30, 36, 56, 16); ctx.fillStyle = '#5a3a22'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 3; ctx.stroke();
          D.text(ctx, 'ROYAL ARCHIVE', x + 25, y - 96, { size: 14, align: 'center', color: '#fffaf0', weight: 700 });
          break;
        }
        case 'leafpile':
          for (let i = 0; i < 18; i++) {
            ctx.save(); ctx.translate(x + (U.hash(i, 1) - 0.5) * 44, y - 6 - U.hash(i, 2) * 20); ctx.rotate(i);
            D.poly(ctx, [0, -7, 5, 0, 0, 7, -5, 0], ['#e8743b', '#f2a93b', '#c94f2c'][i % 3], D.C.ink, 1);
            ctx.restore();
          }
          break;
        case 'castle': {
          D.shadow(ctx, x + 72, y + 40, 160, 18);
          D.box3(ctx, x - 70, y - 120, 280, 160, 36, { r: 2, lw: 4, fill: '#d6c7b0' });
          for (let i = 0; i < 9; i++) D.box3(ctx, x - 70 + i * 32, y - 138, 20, 18, 10, { r: 2, lw: 3, fill: '#d6c7b0', flute: false });
          for (const tx of [-90, 190]) {
            D.box3(ctx, x + tx, y - 180, 60, 220, 24, { r: 2, lw: 4, fill: '#c9b8a0', noTop: true });
            D.poly(ctx, [x + tx - 8, y - 178, x + tx + 30, y - 236, x + tx + 68, y - 178], '#a68be6', D.C.ink, 4);
            D.poly(ctx, [x + tx + 4, y - 190, x + tx + 30, y - 226, x + tx + 56, y - 190], '#fff');
          }
          D.rr(ctx, x + 40, y - 40, 64, 80, 30); ctx.fillStyle = '#5a3a22'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 4; ctx.stroke();
          D.line(ctx, x + 72, y - 160, x + 72, y - 220, D.C.ink, 4);
          D.poly(ctx, [x + 72, y - 220, x + 116, y - 208, x + 72, y - 196], '#ffd25a', D.C.ink, 2);
          for (const wx of [-40, 150]) { D.rr(ctx, x + wx, y - 90, 26, 34, 12); ctx.fillStyle = this.night ? '#ffd76a' : '#bfe6ff'; ctx.fill(); ctx.stroke(); }
          break;
        }
        case 'cage':
          if (!CK.flag('winter_done')) D.enemy(ctx, 'drizzle', x, y + 40, { s: 0.45, cage: true });
          else D.enemy(ctx, 'drizzle', x, y + 40, { s: 0.3, calm: true });
          break;
        case 'pumpkin': {
          D.shadow(ctx, x, y, 16, 5);
          for (const i of [-1, 1, 0]) D.egg(ctx, x + i * 7, y - 12, 9, 12, '#f2892b', { lw: 2 });
          D.rr(ctx, x - 2, y - 28, 4, 6, 1); ctx.fillStyle = '#5a8a3a'; ctx.fill();
          const glow = this.night ? '#fff07a' : '#7a3a12';
          D.poly(ctx, [x - 8, y - 16, x - 4, y - 20, x - 2, y - 15], glow);
          D.poly(ctx, [x + 8, y - 16, x + 4, y - 20, x + 2, y - 15], glow);
          D.poly(ctx, [x - 7, y - 9, x + 7, y - 9, x + 3, y - 5, x - 3, y - 5], glow);
          break;
        }
        case 'spillway': {
          // Grandma's real spillway on the campus pond
          D.cardboard(ctx, x - 30, y - 30, 60, 30, { r: 3, lw: 3, fill: '#c7c2b8', flute: false });
          for (let i = 0; i < 4; i++) {
            const ph = (this.t * 1.5 + i / 4) % 1;
            D.line(ctx, x - 22 + i * 14, y - 28 + ph * 24, x - 22 + i * 14, y - 22 + ph * 24, 'rgba(160,220,255,.9)', 3);
          }
          D.text(ctx, '1974', x, y - 34, { size: 11, weight: 700, align: 'center', color: '#5b5b5b' });
          break;
        }
        case 'drain': {
          // a storm drain grate. In a storm it gurgles and overflows
          D.rr(ctx, x - 22, y - 12, 44, 18, 4); ctx.fillStyle = '#5a5f6a'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 2.5; ctx.stroke();
          for (let i = 0; i < 6; i++) D.line(ctx, x - 17 + i * 7, y - 9, x - 17 + i * 7, y + 3, '#2a2c33', 3);
          if (this.flooded) for (let i = 0; i < 3; i++) {
            const ph = (this.t * 1.4 + i / 3) % 1;
            D.ellipse(ctx, x - 10 + i * 10, y - 4 - ph * 10, 3, 3 - ph * 2, `rgba(120,200,255,${1 - ph})`);
          }
          break;
        }
        case 'raingarden': {
          // a shallow planted dip that soaks up the rain, tended by retired gremlins
          D.ellipse(ctx, x, y - 6, 62, 22, '#6f5238', D.C.ink, 3);
          D.ellipse(ctx, x + 2, y - 4, 54, 17, '#8a6a48');
          const flowers = ['#ff9ec7', '#ffd25a', '#a68be6', '#fffaf0', '#ef6b6b'];
          for (let i = 0; i < 16; i++) {
            const fx = x + (U.hash(i, 1) - 0.5) * 96, fy = y - 8 + (U.hash(i, 2) - 0.5) * 26;
            const sw = Math.sin(this.t * 2 + i) * 1.5;
            D.line(ctx, fx, fy, fx + sw, fy - 12, '#4f9a4a', 2.5);
            D.ball(ctx, fx + sw, fy - 13, 3.6, flowers[i % 5], { lw: 1 });
          }
          for (let i = 0; i < 3; i++) {
            const gx = x - 34 + i * 34, peek = Math.max(0, Math.sin(this.t * 0.8 + i * 2)) * 6;
            D.rr(ctx, gx - 6, y - 22 - peek, 12, 4, 2); ctx.fillStyle = '#ef6b6b'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 1.2; ctx.stroke();
            if (peek > 3) { D.circle(ctx, gx - 2.5, y - 16 - peek, 1.4, D.C.ink); D.circle(ctx, gx + 2.5, y - 16 - peek, 1.4, D.C.ink); }
          }
          break;
        }
        case 'snowman':
          D.circle(ctx, x, y - 14, 16, '#fff', '#9fb8cf', 2);
          D.circle(ctx, x, y - 38, 11, '#fff', '#9fb8cf', 2);
          D.eyes(ctx, x, y - 40, 4, 1.8, {});
          D.poly(ctx, [x, y - 37, x + 10, y - 35, x, y - 33], '#ffad3b');
          D.rr(ctx, x - 9, y - 50, 18, 4, 1); ctx.fillStyle = '#ef6b6b'; ctx.fill();
          break;
      }
    }
    drawBuilding(ctx, e, x, y) {
      if (e.style && CK.BuildingDraw[e.style]) return CK.BuildingDraw[e.style].call(this, ctx, e, x, y);
      const bw = e.bw * TS, bh = e.bh * TS;
      const x0 = x - bw / 2, y0 = y + TS * 0.25 - bh;
      D.shadow(ctx, x + 14, y + 8, bw / 2 + 16, 16, 0.32);
      D.box3(ctx, x0, y0 + 20, bw, bh - 20, 34, { r: 2, lw: 4, fill: e.color || '#b9674a', flute: false, noTop: true });
      // brick lines
      ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.lineWidth = 2;
      for (let yy = y0 + 34; yy < y0 + bh; yy += 14) { ctx.beginPath(); ctx.moveTo(x0 + 4, yy); ctx.lineTo(x0 + bw - 4, yy); ctx.stroke(); }
      D.box3(ctx, x0 - 8, y0 + 4, bw + 16, 22, 44, { r: 2, lw: 4, fill: e.roof || '#5a5f6e', flute: false });
      const night = this.night;
      const cols = Math.max(2, Math.floor(bw / 44));
      for (let r = 0; r < Math.floor((bh - 70) / 40); r++)
        for (let c = 0; c < cols; c++) {
          const wx = x0 + 14 + c * ((bw - 28) / cols) + 4, wy = y0 + 38 + r * 40;
          if (Math.abs(wx + 12 - x) < 26 && r === Math.floor((bh - 70) / 40) - 1) continue;
          D.rr(ctx, wx, wy, 24, 26, 3); ctx.fillStyle = night ? (U.hash(c, r, e.x) > 0.4 ? '#ffd76a' : '#3a3552') : '#cfe6f2'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 2; ctx.stroke();
        }
      D.rr(ctx, x - 16, y + TS * 0.25 - 44, 32, 44, 8); ctx.fillStyle = D.lgx(ctx, x - 16, x + 16, '#5a3a22'); ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 3; ctx.stroke();
      D.box3(ctx, x - 24, y + TS * 0.25 - 2, 48, 6, 10, { fill: '#a9a29a', lw: 2, flute: false });
      D.cardboard(ctx, x - D.measure(ctx, e.label, 13, 700) / 2 - 10, y0 + 6, D.measure(ctx, e.label, 13, 700) + 20, 18, { r: 3, lw: 2, fill: '#fff4dc', flute: false });
      D.text(ctx, e.label, x, y0 + 20, { size: 13, weight: 700, align: 'center', color: '#3d2412' });
    }
    drawEnt(ctx, e) {
      const x = e.px - this.camX, y = e.py - this.camY;
      const pad = e.type === 'building' ? 300 : 120;
      if (x < -pad || x > W + pad || y < -80 || y > H + 300) return;
      switch (e.type) {
        case 'house': this.drawHouse(ctx, e); break;
        case 'deco': this.drawDeco(ctx, e); break;
        case 'npc': {
          if (e.look === 'leafpile') { this.drawDeco(ctx, { kind: 'leafpile', px: e.px, py: e.py }); D.eyes(ctx, x, y - 16, 5, 2.2, { happy: true }); break; }
          const facing = Math.abs(this.player.x - e.px) < 120 && Math.abs(this.player.y - e.py) < 120 ? (this.player.x < e.px ? 'left' : 'right') : 'down';
          D.char(ctx, e.look, x, y, Object.assign({ dir: facing, seed: e.x }, e.o || {}));
          break;
        }
        case 'enemy': {
          const look = e.look;
          if (look === 'magpie' || look === 'swabby' || look === 'splashling') D.char(ctx, look, x, y, { walk: e.walk, seed: e.seed, mood: 'angry' });
          else D.enemy(ctx, look, x, y, { s: 0.45, seed: e.seed });
          if (e.alert > 0.2) D.text(ctx, '!', x, y - 56 - e.alert * 6, { size: 26, align: 'center', color: '#ef6b6b', outline: '#fff' });
          break;
        }
        case 'chest': {
          const open = CK.flag('chest_' + e.id);
          if (e.hidden && !open && !this.anyWearing('lighthouse')) break;
          if (e.hidden && !open) D.circle(ctx, x, y - 14, 26 + Math.sin(this.t * 4) * 3, 'rgba(255,246,168,.35)');
          D.shadow(ctx, x + 4, y, 22, 6);
          D.box3(ctx, x - 18, y - 26, 36, 26, 12, { r: 2, lw: 3, fill: open ? '#c99561' : '#e2b27a', noTop: !open });
          if (!open) {
            D.box3(ctx, x - 20, y - 32, 40, 8, 13, { r: 2, lw: 3, fill: '#ecc38c', flute: false });
            D.tape(ctx, x - 6, y - 32, 12, 32, 0, 0.9);
            if (Math.sin(this.t * 3 + e.x) > 0.6) D.star(ctx, x + 14, y - 34, 5, '#fff7b0', 4, this.t);
          } else {
            D.poly(ctx, [x - 18, y - 26, x - 26, y - 40, x - 4, y - 36], '#ecc38c', D.C.ink, 2);
            D.poly(ctx, [x + 18, y - 26, x + 26, y - 40, x + 4, y - 36], '#ecc38c', D.C.ink, 2);
          }
          break;
        }
        case 'bench':
          D.shadow(ctx, x, y, 26, 6);
          D.line(ctx, x - 18, y - 14, x - 18, y, D.C.ink, 4);
          D.line(ctx, x + 18, y - 14, x + 18, y, D.C.ink, 4);
          D.box3(ctx, x - 24, y - 26, 48, 12, 14, { r: 2, lw: 3, fill: '#c99561' });
          D.tape(ctx, x - 14, y - 34, 18, 8, 0.2);
          D.circle(ctx, x + 10, y - 31, 5, '#cfd6de', D.C.ink, 2);
          D.circle(ctx, x + 10, y - 31, 2, '#fff');
          break;
        case 'site': {
          const done = CK.flag(e.id);
          D.shadow(ctx, x, y, 20, 5);
          D.line(ctx, x, y, x, y - 24, D.C.ink, 4);
          D.rr(ctx, x - 22, y - 50, 44, 30, 4); ctx.fillStyle = done ? '#8fd08a' : '#5aa9e6'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 2.5; ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.5;
          for (let i = 1; i < 4; i++) D.line(ctx, x - 18, y - 50 + i * 7.5, x + 18, y - 50 + i * 7.5, 'rgba(255,255,255,.5)', 1);
          D.text(ctx, done ? '✓' : '?', x, y - 28, { size: 18, align: 'center', color: '#fff', weight: 700 });
          if (!done) { const b = Math.sin(this.t * 4) * 3; D.star(ctx, x + 22, y - 54 + b, 6, '#ffd25a', 5, this.t); }
          break;
        }
        case 'building': this.drawBuilding(ctx, e, x, y); break;
        case 'stand': {
          D.shadow(ctx, x, y, 34, 7);
          D.box3(ctx, x - 30, y - 34, 60, 34, 14, { r: 2, lw: 3, fill: '#e2b27a' });
          D.line(ctx, x - 28, y - 34, x - 28, y - 70, D.C.ink, 4);
          D.line(ctx, x + 28, y - 34, x + 28, y - 70, D.C.ink, 4);
          ctx.save(); ctx.beginPath(); ctx.rect(x - 36, y - 84, 72, 18); ctx.clip();
          for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#fff' : e.color || '#ef6b6b'; ctx.fillRect(x - 36 + i * 12, y - 84, 12, 18); }
          ctx.restore();
          ctx.strokeStyle = D.C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(x - 36, y - 84, 72, 18);
          for (let i = 0; i < 3; i++) {
            D.rr(ctx, x - 20 + i * 14, y - 46, 10, 12, 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
            const st = (this.t * 0.8 + i * 0.3) % 1;
            D.circle(ctx, x - 15 + i * 14 + Math.sin(st * 6) * 2, y - 50 - st * 18, 2 + st * 2, `rgba(255,255,255,${0.7 - st * 0.7})`);
          }
          D.text(ctx, e.drink.toUpperCase(), x, y - 14, { size: 11, weight: 700, align: 'center', color: '#5b3a1e' });
          if (e.vendor) D.char(ctx, 'critter', x + 2, y - 30, Object.assign({ s: 0.8, noShadow: true }, e.vendor));
          break;
        }
        case 'campfire': {
          D.shadow(ctx, x, y, 22, 6);
          for (let i = 0; i < 6; i++) D.ellipse(ctx, x + Math.cos(i) * 18, y - 4 + Math.sin(i) * 6, 6, 4, '#9aa0a8', D.C.ink, 1.5);
          D.cardboard(ctx, x - 16, y - 12, 32, 8, { r: 3, lw: 2, fill: '#8a5a2e', flute: false });
          for (let i = 0; i < 3; i++) {
            const f = Math.sin(this.t * 8 + i * 2) * 3;
            D.poly(ctx, [x - 12 + i * 8, y - 10, x - 6 + i * 8 + f, y - 36 - (i === 1 ? 12 : 0) + Math.abs(f), x + i * 8, y - 10], ['#ff9c3a', '#ffd25a', '#ef6b6b'][i], D.C.ink, 2);
          }
          if (Math.random() < 0.1) this.fx.emit({ x: e.px + U.rand(-8, 8), y: e.py - 30, vy: -40, vx: U.rand(-10, 10), life: 1, size: 2, shape: 'spark', color: '#ffd25a' });
          break;
        }
        case 'cat': {
          const purr = e.purr > 0;
          if (purr) e.purr -= 1 / 60;
          D.char(ctx, 'cat', x, y, { s: 1.1, purr, seed: e.x });
          if (purr) D.text(ctx, 'prrr', x + 18, y - 34, { size: 12, weight: 700, color: '#ff9ec7', outline: '#fff', ow: 3 });
          break;
        }
        case 'shop': {
          D.shadow(ctx, x, y, 40, 8);
          D.box3(ctx, x - 40, y - 46, 80, 46, 18, { r: 2, lw: 3, fill: '#c9935a', noTop: true });
          D.poly(ctx, [x, y - 76, x + 48, y - 46, x + 48 + 8, y - 46 - 14, x + 8, y - 76 - 14], D.shade('#6cc56c', -0.2), D.C.ink, 3);
          D.poly(ctx, [x - 48, y - 46, x, y - 76, x + 48, y - 46], '#6cc56c', D.C.ink, 3);
          D.cardboard(ctx, x - 34, y - 70, 68, 16, { r: 3, lw: 2, fill: '#fff4dc', flute: false });
          D.text(ctx, "NIB'S SWAPS", x, y - 58, { size: 11, weight: 700, align: 'center', color: '#5b3a1e' });
          D.char(ctx, 'critter', x, y - 22, { s: 0.85, noShadow: true, species: 'mouse', color: '#d6d0cc', hat: 'beanie', hatColor: '#5aa9e6' });
          D.box3(ctx, x - 40, y - 22, 80, 22, 10, { r: 2, lw: 3, fill: '#e2b27a' });
          D.icon(ctx, 'snack', x - 18, y - 10, 0.7);
          D.icon(ctx, 'scrap', x + 18, y - 10, 0.7);
          break;
        }
        case 'portal': {
          // the glowing box
          const pulse = 0.6 + Math.sin(this.t * 3) * 0.4;
          const gr = ctx.createRadialGradient(x, y - 40, 10, x, y - 40, 110);
          gr.addColorStop(0, `rgba(255,220,120,${0.55 * pulse})`); gr.addColorStop(1, 'rgba(255,220,120,0)');
          ctx.fillStyle = gr; ctx.fillRect(x - 110, y - 150, 220, 220);
          D.shadow(ctx, x, y, 38, 9);
          D.box3(ctx, x - 34, y - 78, 68, 78, 26, { r: 2, lw: 3, top: '#fff3c0' });
          D.poly(ctx, [x - 34, y - 78, x - 30, y - 100, x - 2, y - 96, x, y - 78], D.C.cardL, D.C.ink, 2);
          D.poly(ctx, [x + 34, y - 78, x + 30, y - 100, x + 6, y - 96, x, y - 78], D.C.cardL, D.C.ink, 2);
          // crayon bear knight on the side
          D.circle(ctx, x, y - 42, 11, null, '#8a5a2e', 2);
          D.circle(ctx, x - 8, y - 52, 3.5, null, '#8a5a2e', 2);
          D.circle(ctx, x + 8, y - 52, 3.5, null, '#8a5a2e', 2);
          D.circle(ctx, x - 4, y - 44, 1.3, D.C.ink); D.circle(ctx, x + 4, y - 44, 1.3, D.C.ink);
          D.line(ctx, x - 12, y - 28, x + 12, y - 28, '#ef6b6b', 3);
          D.text(ctx, e.label || 'SAM', x, y - 8, { size: 11, weight: 700, align: 'center', color: '#c2410c' });
          if (Math.random() < 0.15) this.fx.emit({ x: e.px + U.rand(-30, 30), y: e.py - U.rand(10, 80), vy: -30, life: 1, size: 4, shape: 'star', color: '#fff3a0' });
          break;
        }
        case 'knightfig': {
          const b = Math.abs(Math.sin(this.t * 2 + e.x)) * 3;
          ctx.save(); ctx.translate(x, y - b); ctx.rotate(Math.sin(this.t * 1.5 + e.x) * 0.06);
          D.char(ctx, e.look, 0, 0, Object.assign({ s: 0.62, mood: 'happy' }, e.o || {}));
          ctx.restore();
          if (Math.sin(this.t * 2 + e.x * 3) > 0.7) D.star(ctx, x + 12, y - 34, 4, '#fff7b0', 4, this.t);
          break;
        }
        case 'notice': {
          // a cork notice board on two posts, with flyers
          D.shadow(ctx, x + 4, y, 26, 6);
          D.line(ctx, x - 20, y, x - 20, y - 30, D.C.ink, 4);
          D.line(ctx, x + 20, y, x + 20, y - 30, D.C.ink, 4);
          D.box3(ctx, x - 28, y - 64, 56, 38, 6, { r: 2, lw: 2.5, fill: '#c9925a', flute: false });
          const fresh = e.fresh && e.fresh();
          [[-22, -60, '#fffaf0', -0.08], [-2, -58, '#ffe08a', 0.06], [8, -46, '#bfe6ff', -0.04]].forEach(([fx, fy, col, rot], i) => {
            ctx.save(); ctx.translate(x + fx + 7, y + fy + 8); ctx.rotate(rot);
            D.rr(ctx, -8, -9, 16, 18, 1); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 1.2; ctx.stroke();
            for (let k = 0; k < 3; k++) D.line(ctx, -5, -4 + k * 4, 5, -4 + k * 4, 'rgba(0,0,0,.25)', 1);
            if (i === 0 && fresh) D.icon(ctx, 'feather', 0, 0, 0.5);
            ctx.restore();
            D.circle(ctx, x + fx + 7, y + fy, 1.8, '#ef6b6b');
          });
          if (fresh) { const b = Math.sin(this.t * 4) * 3; D.text(ctx, '!', x, y - 72 + b, { size: 22, align: 'center', color: '#ef6b6b', outline: '#fff', weight: 700 }); }
          break;
        }
        case 'sign':
          D.shadow(ctx, x, y, 14, 4);
          D.line(ctx, x, y, x, y - 22, D.C.ink, 4);
          D.box3(ctx, x - 18, y - 42, 36, 22, 5, { r: 2, lw: 2.5, fill: '#ecc38c', flute: false });
          for (let i = 0; i < 2; i++) D.line(ctx, x - 11, y - 35 + i * 7, x + 11, y - 35 + i * 7, D.C.cardDD, 2);
          break;
      }
    }
    draw(ctx) {
      const sk = this.shake * (CK.shakeK ? CK.shakeK() : 1);
      const ox = Math.round(this.camX + (Math.random() - 0.5) * sk), oy = Math.round(this.camY + (Math.random() - 0.5) * sk);
      // the real world, before: everything a little grey
      const muted = this.seasonId === 'campus';
      ctx.save();
      ctx.drawImage(this.ground, ox, oy, W, H, 0, 0, W, H);
      this.drawWater(ctx, ox, oy);
      if (this.flooded) for (const [fx, fy] of this.ch.flood || []) {
        const X = fx * TS - ox, Y = fy * TS - oy;
        if (X < -60 || X > W || Y < -60 || Y > H) continue;
        D.ellipse(ctx, X + 24, Y + 28, 26, 12, 'rgba(90,175,235,0.5)');
        D.ellipse(ctx, X + 18, Y + 26, 8, 3, 'rgba(255,255,255,0.5)');
      }
      const saveCam = [this.camX, this.camY];
      this.camX = ox; this.camY = oy;
      // y-sorted entities
      const list = [];
      for (const t of this.trees) list.push({ y: t.py, f: () => this.drawTree(ctx, t) });
      for (const e of this.ents) {
        if (e.type === 'trigger') continue;
        let sy = e.py;
        if (e.type === 'house') sy = (e.y + 1) * TS - 2;
        if (e.type === 'deco' && e.kind === 'castle') sy = (e.y + 1) * TS;
        if (e.type === 'deco' && e.kind === 'cage') sy = 0;
        if (e.type === 'building') sy = (e.y + 1) * TS - 4;
        if (!(muted && e.vivid)) list.push({ y: sy, f: () => this.drawEnt(ctx, e) });
      }
      const p = this.player;
      const G = CK.G;
      const costume = (id) => (G.party.find((m) => m.id === id) || {}).costume;
      const f1 = this.trail[16], f2 = this.trail[32];
      if (!this.ch.noFollowers) {
        list.push({ y: f2.y, f: () => D.char(ctx, 'pip', f2.x - ox, f2.y - oy, { dir: f2.dir, costume: costume('pip') }) });
        list.push({ y: f1.y, f: () => D.char(ctx, 'corry', f1.x - ox, f1.y - oy, { dir: f1.dir, walk: p.moving ? p.walk : 0, costume: costume('corry') }) });
      }
      const real = this.ch.id === 'campus';
      if (this.p2) {
        const q = this.p2;
        list.push({ y: q.y, f: () => D.char(ctx, 'jules', q.x - ox, q.y - oy, { dir: q.dir, walk: q.moving ? q.walk : 0, costume: real ? null : costume('jules'), night: this.night }) });
      }
      list.push({ y: p.y, f: () => D.char(ctx, 'sam', p.x - ox, p.y - oy, { dir: p.dir, walk: p.moving ? p.walk : 0, costume: real ? null : costume('sam'), night: this.night }) });
      list.sort((a, b) => a.y - b.y);
      for (const it of list) it.f();
      if (muted) {
        // drain most of the color out of the world (one blend pass, cheap)
        ctx.globalCompositeOperation = 'saturation';
        ctx.fillStyle = 'rgba(128,128,128,0.75)';
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
        for (const e of this.ents) if (e.vivid) this.drawEnt(ctx, e);
      }
      // chapter-specific world effects (drawn over the world, under weather, night and the HUD)
      if (this.ch.worldFx) this.ch.worldFx.call(this, ctx, ox, oy);
      this.fx.draw(ctx, ox, oy);
      if (!muted) this.drawButterflies(ctx, ox, oy);
      if (!this.lightGrad) {
        const lg = ctx.createRadialGradient(W * 0.28, H * 0.12, 40, W * 0.5, H * 0.55, W * 0.78);
        lg.addColorStop(0, 'rgba(255,244,214,0.16)');
        lg.addColorStop(0.55, 'rgba(255,244,214,0)');
        lg.addColorStop(1, 'rgba(40,24,60,0.26)');
        this.lightGrad = lg;
      }
      ctx.fillStyle = this.lightGrad;
      ctx.fillRect(0, 0, W, H);
      this.camX = saveCam[0]; this.camY = saveCam[1];
      ctx.restore();
      this.drawWeather(ctx, ox, oy, 'under');
      if (this.night) this.drawNight(ctx, ox, oy);
      this.parts.draw(ctx, ox, oy);
      this.drawWeather(ctx, ox, oy, 'over');
      if (this.p2) {
        D.text(ctx, 'P2', this.p2.x - ox, this.p2.y - oy - (this.costumeOf(1) === 'umbrella' && this.ch.id !== 'campus' ? 92 : 64), { size: 13, weight: 700, align: 'center', color: '#bff5d6', outline: D.C.ink, ow: 3 });
        D.text(ctx, 'P1', p.x - ox, p.y - oy - 66, { size: 13, weight: 700, align: 'center', color: '#fff3b0', outline: D.C.ink, ow: 3 });
      }
      if (!CK.scriptRunning) {
        if (this.focus) this.drawPrompt(ctx, this.focus, ox, oy, CK.coop ? 'Spc' : 'Z', 0);
        if (this.focus2 && this.focus2 !== this.focus) this.drawPrompt(ctx, this.focus2, ox, oy, 'Ent', 1);
      }
      this.drawHud(ctx);
    }
    drawPrompt(ctx, f, ox, oy, key, who) {
      const b = Math.sin(this.t * 6) * 3;
      const wear = this.costumeOf(who);
      const label = f.promptLabel || (CK.promptLabel && CK.promptLabel(f)) || {
        npc: 'Talk', notice: 'Read', chest: 'Open', bench: 'Workbench', site: 'Blueprint', stand: 'Warm up', campfire: 'Rest', cat: 'Pet', shop: 'Shop', portal: 'Look', knightfig: 'Look', building: f.door || 'Enter', deco: f.label || 'Jump in!',
      }[f.type] || (f.type === 'house' ? (CK.houseLabel && CK.houseLabel(f)) || (CK.flag('knock_' + f.id) ? 'Peek' : 'Knock') : f.type === 'tile' ? (f.tile === 'Q' ? (wear === 'bulldozer' ? 'Shove!' : 'Barricade') : wear === 'snowplow' ? 'Plow!' : 'Snowdrift') : 'Read');
      const fx = f.ix - ox, fy = (f.type === 'house' ? f.y * TS - 30 : f.type === 'building' ? f.iy - 90 : f.iy - 70) - oy + b;
      ctx.font = `700 15px ${CK.FONT}`;
      const w = D.measure(ctx, label, 15, 700) + 44;
      D.rr(ctx, fx - w / 2, fy - 18, w, 26, 13); ctx.fillStyle = who ? '#e6f7ef' : '#fffaf0'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 2; ctx.stroke();
      D.text(ctx, label, fx + 10, fy, { size: 15, weight: 700, align: 'center', color: D.C.ink });
      D.rr(ctx, fx - w / 2 + 4, fy - 14, 24, 18, 8); ctx.fillStyle = who ? '#7fe0a8' : '#ffd25a'; ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke();
      D.text(ctx, key, fx - w / 2 + 16, fy - 1, { size: key.length > 1 ? 9 : 11, align: 'center', weight: 700 });
    }
    // rain, storm flashes, fog banks, campus drizzle
    drawWeather(ctx, ox, oy, layer) {
      const w = this.weather();
      if (!w || w === 'snow') return;
      if (layer === 'under' && w === 'fog') {
        for (let i = 0; i < 7; i++) {
          const x = ((i * 260 + this.t * 14) % (W + 400)) - 200, y = 80 + (i % 4) * 120 + Math.sin(this.t * 0.3 + i) * 20;
          const gr = ctx.createRadialGradient(x, y, 10, x, y, 190);
          gr.addColorStop(0, 'rgba(230,225,245,0.32)'); gr.addColorStop(1, 'rgba(230,225,245,0)');
          ctx.fillStyle = gr; ctx.fillRect(x - 190, y - 190, 380, 380);
        }
        return;
      }
      if (layer !== 'over' || w === 'fog') return;
      const n = w === 'storm' ? 110 : w === 'rain' ? 70 : 36;
      ctx.strokeStyle = w === 'drizzle' ? 'rgba(200,205,215,0.5)' : 'rgba(190,215,255,0.55)';
      ctx.lineWidth = w === 'storm' ? 2.2 : 1.6;
      ctx.beginPath();
      const sl = w === 'storm' ? 9 : 4;
      for (let i = 0; i < n; i++) {
        let x = (U.hash(i, 3) * (W + 100) - this.t * (w === 'storm' ? 240 : 90)) % (W + 100);
        if (x < 0) x += W + 100;
        const y = (U.hash(i, 4) * H + this.t * (w === 'drizzle' ? 260 : 520)) % H;
        ctx.moveTo(x, y);
        ctx.lineTo(x - sl, y + (w === 'drizzle' ? 9 : 16));
      }
      ctx.stroke();
      if (w === 'storm') {
        const ph = this.t % 7.3;
        if (ph < 0.12 || (ph > 0.2 && ph < 0.27)) {
          ctx.fillStyle = 'rgba(235,240,255,0.55)';
          ctx.fillRect(0, 0, W, H);
          if (!this.thunderAt || this.t - this.thunderAt > 3) { this.thunderAt = this.t; this.shake = 4; CK.Audio.sfx('thunder'); }
        }
      }
    }
    drawWater(ctx, ox, oy) {
      const m = this.map;
      const x0 = Math.floor(ox / TS), y0 = Math.floor(oy / TS);
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let y = y0; y <= y0 + 12; y++)
        for (let x = x0; x <= x0 + 21; x++) {
          if (m.get(x, y) !== '~') continue;
          const h = U.hash(x, y, 1);
          if (h > 0.55) continue;
          const ph = (this.t * 0.8 + h * 10) % 2;
          const X = x * TS - ox + 10 + h * 20 + ph * 6, Y = y * TS - oy + 14 + h * 22;
          ctx.moveTo(X, Y);
          ctx.quadraticCurveTo(X + 5, Y - 4, X + 10, Y);
          ctx.quadraticCurveTo(X + 15, Y + 4, X + 20, Y);
        }
      ctx.stroke();
    }
    drawNight(ctx, ox, oy) {
      const lc = this.lightCanvas;
      const g = lc.getContext('2d');
      g.globalCompositeOperation = 'source-over';
      g.clearRect(0, 0, W, H);
      g.fillStyle = this.ch.nightTint ? this.ch.nightTint() : this.seasonId === 'winter' ? 'rgba(14,12,52,0.74)' : 'rgba(20,14,58,0.66)';
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'destination-out';
      const lights = [];
      const p = this.player;
      const lamp = this.anyWearing('lighthouse') ? 1.6 : 1;
      lights.push([p.x - ox, p.y - oy - 20, (this.seasonId === 'winter' ? 115 : 140) * lamp, 1]);
      if (this.p2) lights.push([this.p2.x - ox, this.p2.y - oy - 20, (this.seasonId === 'winter' ? 115 : 140) * lamp, 1]);
      for (const e of this.ents) {
        if (e.type === 'deco' && e.kind === 'lantern') lights.push([e.px - ox, e.py - oy - 48, 110, 1]);
        if (e.type === 'house' && !(e.broken && !CK.flag(e.broken))) lights.push([e.px - ox, e.py - oy - 20, 80, 0.8]);
        if (e.type === 'deco' && (e.kind === 'castle' || e.kind === 'archive')) lights.push([e.px - ox + 40, e.py - oy - 40, 160, 0.8]);
        if (e.type === 'chest' && !CK.flag('chest_' + e.id)) lights.push([e.px - ox, e.py - oy - 16, 40, 0.6]);
        if (e.type === 'campfire') lights.push([e.px - ox, e.py - oy - 20, 150 + Math.sin(this.t * 9) * 6, 1]);
        if (e.type === 'stand' || e.type === 'shop') lights.push([e.px - ox, e.py - oy - 40, 100, 0.9]);
        if (e.type === 'portal') lights.push([e.px - ox, e.py - oy - 40, 170, 1]);
        if (e.type === 'deco' && e.light) lights.push([e.px - ox, e.py - oy - (e.light[1] || 30), e.light[0], 1]);
        if (e.type === 'deco' && e.kind === 'pumpkin') lights.push([e.px - ox, e.py - oy - 14, 70, 0.9]);
        if (e.type === 'building') lights.push([e.px - ox, e.py - oy - 30, 120, 0.7]);
      }
      for (const pt of this.parts.list) if (pt.shape === 'firefly') lights.push([pt.x - ox, pt.y - oy, 30, 0.5]);
      for (const [x, y, r, a] of lights) {
        if (x < -r || x > W + r || y < -r || y > H + r) continue;
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, `rgba(0,0,0,${a})`);
        gr.addColorStop(0.6, `rgba(0,0,0,${a * 0.5})`);
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      ctx.drawImage(lc, 0, 0);
      // warm glows
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const [x, y, r, a] of lights) {
        if (r < 60 || x < -r || x > W + r || y < -r || y > H + r) continue;
        const gr = ctx.createRadialGradient(x, y, 0, x, y, r * 0.5);
        gr.addColorStop(0, `rgba(255,190,90,${(this.seasonId === 'winter' ? 0.08 : 0.15) * a})`);
        gr.addColorStop(1, 'rgba(255,190,90,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      ctx.restore();
    }
    drawHud(ctx) {
      const G = CK.G;
      D.panel(ctx, 12, 10, 268, 58, { seed: 1, tape: false });
      D.icon(ctx, this.night ? 'moon' : 'sun', 40, 39, 1);
      D.text(ctx, this.ch.name, 64, 34, { size: 18, weight: 700, color: D.C.ink });
      D.text(ctx, this.season.name + (this.night ? ' · Night' : ' · Day') + '  ·  Lv ' + G.level, 64, 55, { size: D.T.small, weight: 600, color: D.C.textSoft });
      D.panel(ctx, 12, 74, 150, 34, { seed: 2, tape: false, inner: false });
      D.icon(ctx, 'scrap', 32, 91, 0.9);
      D.text(ctx, '' + G.scraps, 46, 98, { size: 17, weight: 700 });
      D.icon(ctx, 'snack', 102, 92, 0.85);
      D.text(ctx, '' + G.snacks, 116, 98, { size: 17, weight: 700 });
      const obj = this.ch.objective(G);
      if (obj) {
        const lines = D.wrap(ctx, obj, 300, 16, 600);
        const h = 36 + lines.length * 20;
        D.panel(ctx, W - 344, 10, 332, h, { seed: 4, tape: false, fill: D.C.sheet });
        D.text(ctx, 'Goal', W - 326, 32, { size: D.T.small, weight: 700, color: D.C.label });
        lines.forEach((l, i) => D.text(ctx, l, W - 326, 52 + i * 20, { size: 16, weight: 600, color: D.C.text }));
      }
      // field power + wetness
      const fp = CK.Data.fieldPowers[this.costumeOf(0)];
      let hy = 114;
      if (fp && this.ch.id !== 'campus') {
        const fw = Math.max(150, D.measure(ctx, 'Field power: ' + fp, D.T.small, 600) + 24);
        D.panel(ctx, 12, hy, fw, 30, { seed: 5, tape: false, inner: false, fill: '#eaf4ff' });
        D.text(ctx, 'Field power: ' + fp, 24, hy + 20, { size: D.T.small, weight: 600, color: '#2f5f8a' });
        hy += 36;
      }
      if ((G.wet || 0) > 0.05) {
        D.panel(ctx, 12, hy, 160, 30, { seed: 6, tape: false, inner: false, fill: '#dff0ff' });
        D.text(ctx, 'Rain-soaked ' + Math.round(G.wet * 100) + '%', 24, hy + 20, { size: D.T.small, weight: 700, color: '#1f5fa0' });
      }
      if (CK.lastSave && CK.time - CK.lastSave < 2.5) {
        ctx.globalAlpha = Math.min(1, (2.5 - (CK.time - CK.lastSave)) * 2);
        D.cardboard(ctx, W - 64, H - 100, 40, 30, { r: 4, lw: 2.5 });
        D.text(ctx, 'saved', W - 44, H - 78, { size: 12, weight: 700, align: 'center', color: D.C.text });
        ctx.globalAlpha = 1;
      }
      // controls reminder: on a paper strip so it reads over any scenery, then it steps aside
      // after the first few seconds in a place (Esc still lists everything)
      const ha = U.clamp((14 - this.t) / 1.5, 0, 1);
      if (!CK.Touch.enabled && ha > 0 && CK.Scenes.top() === this) {
        const hint = CK.coop ? 'P1: WASD + Space  ·  P2: Arrows + Enter  ·  Esc menu  ·  M sound' : 'Arrows/WASD move  ·  Z/Space talk  ·  Esc menu  ·  M sound';
        const hw = D.measure(ctx, hint, D.T.small, 600) + 28;
        ctx.globalAlpha = ha;
        D.rr(ctx, W - 12 - hw, H - 36, hw, 26, 13); ctx.fillStyle = 'rgba(255,250,240,0.85)'; ctx.fill();
        D.text(ctx, hint, W - 12 - hw / 2, H - 18, { size: D.T.small, align: 'center', color: D.C.text });
        ctx.globalAlpha = 1;
      }
    }
  }
  CK.Overworld = Overworld;

  // solid footprints for big decorations: [dx, dy, w, h] in tiles from the object tile
  CK.DecoDraw = CK.DecoDraw || {};
  CK.BuildingDraw = CK.BuildingDraw || {};
  const DECO_FOOT = (CK.DECO_FOOT = {
    bigtree: [-0.3, -0.4, 1.6, 0.9],
    engine: [-1, -1, 3.4, 2.2],
    archive: [-1.4, -1.5, 4, 1.9],
    castle: [-1.9, -2.5, 6.6, 3.1],
    snowman: [0.1, 0.2, 0.8, 0.6],
    umbrella: [0.3, 0.4, 0.4, 0.4],
  });
  // keep the castle door walkable (it is the gate scene)

  CK.gotoChapter = function (id, pos) {
    CK.G.chapter = id;
    const ow = new Overworld(id, pos);
    CK.Scenes.replace(ow);
    if (!CK.flag(id + '_arrived')) {
      CK.setFlag(id + '_arrived');
      CK.healParty();
      CK.runScript(id + '_intro');
    }
    CK.saveGame();
  };
})();
