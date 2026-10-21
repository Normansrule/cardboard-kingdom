// Cardboard Kingdom - Costume Quest style turn-based battles.
// Kids become GIANT cardboard costumes. Press on the ring for perfect hits and blocks.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input, Data = CK.Data;
  const W = CK.W, H = CK.H;

  const PARTY_POS = [{ x: 330, y: 452 }, { x: 205, y: 410 }, { x: 100, y: 470 }, { x: 445, y: 505 }];
  // who presses buttons for whom in co-op: player 1 = Sam + Corry, player 2 = Jules + Pip
  const PLAYER_OF = { sam: 0, corry: 0, pip: 1, jules: 1 };
  const ENEMY_POS = [{ x: 640, y: 420 }, { x: 770, y: 462 }, { x: 880, y: 410 }];
  const BOSS_POS = { x: 760, y: 460 };

  class Battle {
    constructor(id) {
      this.id = id;
      this.def = Data.battles[id];
      this.season = Data.seasons[this.def.season] || Data.seasons.spring;
      this.night = CK.flag(CK.G.chapter + '_night');
      this.parts = new CK.Particles();
      this.finished = false;
      this.result = null;
      this.t = 0;
      this.ui = null;
      this.banner = null;
      this.qte = null;
      this.shake = 0;
      this.setup();
    }
    setup() {
      const G = CK.G;
      this.party = G.party.map((m, i) => {
        const st = CK.stats(m);
        return { side: 'party', m, id: m.id, name: st.name, costume: m.costume, hp: st.maxHp, maxHp: st.maxHp, atk: st.atk, def: st.def, water: st.water, charge: 0, soak: Math.round((G.wet || 0) * 40), pos: PARTY_POS[i], ox: 0, oy: 0, flash: 0, giant: 0, scale: 1, alive: true, swing: 0 };
      });
      this.fortify = 0;
      this.shield = 0;
      this.barricade = 0;
      this.gutter = 0;
      this.rainy = !!(this.def.rainy || this.def.final || (this.night && (this.def.season === 'spring' || this.def.season === 'summer')));
      this.enemies = [];
      this.def.enemies.forEach((k) => this.addEnemy(k, false));
      // Battle Stamps (post.js) adjust each fighter here
      if (CK.Stamps) CK.Stamps.setup(this);
    }
    addEnemy(key, entering) {
      const d = Data.enemies[key];
      const idx = this.enemies.filter((e) => e.alive).length;
      let pos = d.boss ? BOSS_POS : ENEMY_POS[this.freeSlot()];
      if (!pos) return null;
      const hp = Math.round(d.hp * (d.boss ? 1.15 : 1));
      const e = { side: 'enemy', key, d, name: d.name, hp, maxHp: hp, atk: d.atk * 1.7, def: d.def, pos, ox: entering ? 300 : 0, oy: 0, flash: 0, alive: true, stun: 0, seed: Math.floor(Math.random() * 50) + idx, scale: d.boss ? 1 : 0.9, swing: 0 };
      if (d.boss && this.def.enemies.length > 1) e.pos = { x: 770, y: 466 };
      this.enemies.push(e);
      if (entering) CK.tween(e, { ox: 0 }, 0.5, 'outBack');
      return e;
    }
    freeSlot() {
      const used = this.enemies.filter((e) => e.alive && !e.d.boss).map((e) => ENEMY_POS.indexOf(e.pos));
      const hasBoss = this.enemies.some((e) => e.alive && e.d.boss);
      const order = hasBoss ? [0, 2] : [0, 1, 2];
      for (const i of order) if (!used.includes(i)) return i;
      return -1;
    }
    enter() {
      CK.showTouchPad = false;
      this.prevMusic = [CK.Audio.track, CK.Audio.night];
      CK.Audio.setMusic(this.def.music || 'battle');
      const self = this;
      this.co = CK.co(function* () {
        yield* self.main();
      });
    }
    exit() {
      if (this.prevMusic) CK.Audio.setMusic(this.prevMusic[0], this.prevMusic[1]);
      this.co && this.co.cancel();
    }
    alive(side) {
      return (side === 'party' ? this.party : this.enemies).filter((c) => c.alive);
    }

    // ---------------------------------------------------------- main flow
    *main() {
      yield* this.intro();
      while (true) {
        // every foe shows what it's about to do, so Guard and Inspect are real choices
        for (const e of this.alive('enemy')) if (!e.intent) e.intent = this.pickMove(e);
        for (const m of this.party) {
          if (!m.alive || !this.alive('enemy').length) continue;
          m.guard = false;
          if (m.floppy) {
            yield* this.flop(m);
            continue;
          }
          if (CK.Stamps) yield* CK.Stamps.turnStart(this, m);
          const act = yield* this.choose(m);
          yield* this.doAction(m, act);
          if (this.endCheck) break;
        }
        if (this.endCheck === 'floor') return yield* this.floorEnd();
        if (!this.alive('enemy').length) return yield* this.victory();
        for (const e of this.enemies.slice()) {
          if (!e.alive) continue;
          if (e.stun > 0) {
            e.stun--;
            this.pop(e, 'Dazzled!', '#fff36a');
            yield 0.5;
            continue;
          }
          yield* this.enemyAct(e);
          if (!this.alive('party').length) return yield* this.defeat();
        }
        if (this.fortify > 0) this.fortify--;
        if (this.shield > 0) this.shield--;
        if (this.gutter > 0) this.gutter--;
        for (const m of this.party) {
          if (!m.alive) continue;
          if (this.rainy && !this.shield) this.addSoak(m, 6, true);
          else m.soak = Math.max(0, m.soak - 8);
        }
      }
    }
    playerOf(m) {
      return CK.coop ? PLAYER_OF[m.id] || 0 : 0;
    }
    inp(m) {
      return Input.p(this.playerOf(m));
    }
    // water soaks cardboard. A full meter means the fighter goes floppy and loses a turn.
    addSoak(t, amt, quiet) {
      if (!t.alive || amt <= 0) return;
      const G = CK.G;
      amt *= 1 - (t.water || 0);
      if (CK.Stamps) amt *= CK.Stamps.soakMul(t);
      if (G.items && G.items.poncho) amt *= 0.75;
      if (this.gutter > 0) amt *= 0.5;
      if (this.shield > 0) amt = 0;
      const before = t.soak;
      t.soak = Math.min(100, t.soak + Math.round(amt));
      if (t.soak >= 100 && !t.floppy) {
        t.floppy = true;
        this.pop(t, 'FLOPPY!', '#7fd0ff', 26, -80);
        CK.Audio.sfx('splash');
      } else if (!quiet && before < 50 && t.soak >= 50) this.pop(t, 'Soggy...', '#7fd0ff', 18, -80);
    }
    *flop(m) {
      this.banner = { text: m.name + ' is too floppy to move!', t: 0, small: true };
      CK.Audio.sfx('lose');
      yield 0.9;
      this.banner = null;
      m.floppy = false;
      m.soak = CK.G.items && CK.G.items.wax ? 20 : 45;
      this.pop(m, 'Drying out...', '#ffe9a8', 18, -60);
      yield 0.4;
    }
    *intro() {
      this.introT = 0;
      yield 0.4;
      CK.Audio.sfx('transform');
      this.banner = { text: 'CARDBOARD UP!', t: 0 };
      for (const m of this.party) {
        CK.tween(m, { giant: 1 }, 0.5, 'outBack');
        const p = m.pos;
        this.parts.burst(16, () => ({ x: p.x, y: p.y - 80, vx: U.rand(-220, 220), vy: U.rand(-300, -60), g: 500, life: 1.2, size: U.rand(6, 12), shape: 'square', color: U.pick(['#ecc38c', '#d9a66b', '#b07c45', '#f3e6b8']), spin: 6 }));
      }
      yield 0.9;
      this.banner = null;
      if (this.def.boss) {
        this.banner = { text: this.enemies.find((e) => e.d.boss).name, t: 0, small: true };
        yield 1.1;
        this.banner = null;
      }
    }
    *choose(m) {
      if (CK.autoBattle) {
        const target = this.alive('enemy')[0];
        const kind = m.charge >= 3 ? 'special' : 'attack';
        return { kind, target };
      }
      this.ui = { actor: m, mode: 'menu', sel: 0, choice: null, tsel: 0 };
      yield () => this.ui.choice;
      const c = this.ui.choice;
      this.ui = null;
      return c;
    }
    menuItems(m) {
      const cd = Data.costumes[m.costume];
      return [
        { kind: 'attack', label: 'Act: Attack', ok: true },
        { kind: 'special', label: cd.special + (m.charge >= 3 ? '' : ` (${m.charge}/3)`), ok: m.charge >= 3 },
        { kind: 'guard', label: 'Guard', ok: true },
        { kind: 'help', label: 'Help a friend', ok: this.party.some((p) => p !== m) },
        { kind: 'inspect', label: 'Inspect', ok: true },
        { kind: 'snack', label: `Juice Box (${CK.G.snacks})`, ok: CK.G.snacks > 0 },
        { kind: 'build', label: `Build (${CK.G.scraps} scraps)`, ok: CK.G.scraps >= 2 },
      ];
    }
    specialTargets(m) {
      const s = m.costume;
      if (s === 'knight' || s === 'bulldozer') return 'enemy';
      return 'none';
    }

    // ---------------------------------------------------------- party
    *doAction(m, act) {
      const G = CK.G;
      if (act.kind === 'guard') {
        // stand in front: single-target attacks come to you, and land half as hard
        m.guard = true;
        m.charge = Math.min(3, m.charge + 1);
        CK.Audio.sfx('block');
        this.pop(m, 'On guard!', '#9fd3ff', 24);
        if (CK.Stamps) CK.Stamps.onGuard(this, m);
        yield CK.tween(m, { ox: 30 }, 0.2, 'outQuad');
        yield 0.25;
        yield CK.tween(m, { ox: 0 }, 0.2);
        return;
      }
      if (act.kind === 'help') {
        const t = act.target;
        const stars = CK.Stamps ? CK.Stamps.helpStars(m) : 1;
        CK.Audio.sfx('heal');
        if (!t.alive) {
          // nobody stays down while a friend can reach them
          const frac = CK.Stamps ? CK.Stamps.reviveFrac(m) : 0.25;
          t.alive = true;
          t.dying = 0;
          t.giant = 1;
          t.hp = Math.max(1, Math.round(t.maxHp * frac));
          t.soak = 0;
          t.floppy = false;
          this.pop(t, 'Back on their feet!', '#7be07b', 22, -40);
        } else {
          const amt = Math.max(1, Math.round(t.maxHp * 0.1));
          t.hp = Math.min(t.maxHp, t.hp + amt);
          t.soak = Math.max(0, t.soak - 40);
          t.floppy = false;
          t.helped = true;
          this.pop(t, '+' + amt + ' · Helped!', '#7be07b', 22, -40);
        }
        t.charge = Math.min(3, t.charge + stars);
        this.hearts(t);
        yield 0.7;
        return;
      }
      if (act.kind === 'inspect') {
        // listen first: find where it's weak, and see exactly what it's about to do
        const e = act.target;
        const pow = CK.Stamps ? CK.Stamps.inspectPower(m) : { hits: 2, mul: 1.4 };
        e.marked = pow.hits;
        e.markMul = pow.mul;
        e.inspected = true;
        m.charge = Math.min(3, m.charge + 1);
        CK.Audio.sfx('magic');
        this.pop(e, 'Weak spot found!', '#ffd25a', 22, -40);
        this.parts.burst(10, () => ({ x: e.pos.x + U.rand(-30, 30), y: e.pos.y - U.rand(40, 140), vy: -40, life: 0.9, size: 6, shape: 'spark', color: '#ffd25a' }));
        yield 0.7;
        return;
      }
      if (act.kind === 'snack') {
        G.snacks--;
        const t = act.target;
        CK.Audio.sfx('heal');
        const amt = Math.round((18 + t.maxHp * 0.35) * (CK.Stamps ? CK.Stamps.snackMul(m) : 1));
        t.hp = Math.min(t.maxHp, t.hp + amt);
        t.soak = 0;
        if (CK.Stamps) CK.Stamps.afterSnack(this, m);
        this.pop(t, '+' + amt, '#7be07b');
        this.hearts(t);
        yield 0.6;
        return;
      }
      if (act.kind === 'attack') {
        let target = act.target;
        if (!target.alive) target = this.alive('enemy')[0];
        yield CK.tween(m, { ox: target.pos.x - m.pos.x - 150 }, 0.3, 'inOutQuad');
        const mult = yield* this.qteRing(target, 'attack', m);
        m.swing = 0;
        CK.tween(m, { swing: 1.2 }, 0.12, 'outQuad');
        this.hit(target, m.atk * mult, { perfect: mult > 1, attacker: m });
        m.charge = Math.min(3, m.charge + 1);
        yield 0.35;
        if (CK.Stamps) yield* CK.Stamps.afterAttack(this, m, target, mult);
        CK.tween(m, { swing: 0 }, 0.2);
        yield CK.tween(m, { ox: 0 }, 0.3, 'inOutQuad');
        return;
      }
      if (act.kind === 'special') {
        m.charge = 0;
        yield* this.special(m, act.target);
      }
      if (act.kind === 'build') yield* this.build(m, act.what);
    }
    *build(m, what) {
      const b = Data.builds[what];
      CK.G.scraps -= b.cost;
      this.banner = { text: b.name + '!', t: 0, small: true };
      CK.Audio.sfx('tape');
      yield CK.tween(m, { ox: 60 }, 0.25, 'outQuad');
      for (let i = 0; i < 3; i++) {
        this.parts.burst(8, () => ({ x: 545 + U.rand(-30, 30), y: 420 + U.rand(-40, 20), vx: U.rand(-120, 120), vy: U.rand(-200, -60), g: 500, life: 0.8, size: U.rand(5, 9), shape: 'square', color: U.pick(['#ecc38c', '#d9a66b', '#f3e6b8']), spin: 6 }));
        CK.Audio.sfx('tape');
        yield 0.18;
      }
      this.banner = null;
      if (what === 'barricade') {
        this.barricade = 3;
        this.barT = 0;
        CK.tween(this, { barT: 1 }, 0.4, 'outBack');
      } else {
        this.gutter = 2;
        for (const p of this.alive('party')) {
          p.soak = Math.max(0, p.soak - 60);
          p.floppy = false;
          this.pop(p, 'Drained!', '#9fd3ff', 20);
        }
      }
      yield CK.tween(m, { ox: 0 }, 0.25, 'inOutQuad');
    }
    *special(m, target) {
      const s = m.costume;
      const enemies = this.alive('enemy');
      this.banner = { text: Data.costumes[s].special + '!', t: 0, small: true };
      CK.Audio.sfx('magic');
      yield 0.6;
      this.banner = null;
      if (s === 'knight' || s === 'bulldozer') {
        if (!target || !target.alive) target = enemies[0];
        yield CK.tween(m, { ox: target.pos.x - m.pos.x - 160, oy: -40 }, 0.35, 'inOutQuad');
        const mult = yield* this.qteRing(target, 'attack', m);
        CK.tween(m, { swing: 1.4, oy: 0 }, 0.15, 'outQuad');
        this.hit(target, m.atk * (s === 'knight' ? 2.5 : 3) * mult, { perfect: mult > 1, big: true, attacker: m });
        if (s === 'bulldozer') {
          for (const p of this.party) p.soak = 0;
          this.parts.burst(24, () => ({ x: target.pos.x, y: target.pos.y, vx: U.rand(-250, 250), vy: U.rand(-350, -100), g: 600, life: 1.2, size: U.rand(5, 10), shape: 'circle', color: U.pick(['#8a5a2e', '#a47a4c', '#c99561']) }));
        } else for (let i = 0; i < 10; i++) this.parts.emit({ x: target.pos.x, y: target.pos.y - 80, vx: U.rand(-200, 200), vy: U.rand(-200, 0), life: 1, size: 10, shape: 'square', color: '#f3e6b8', spin: 8, g: 200 });
        yield 0.4;
        CK.tween(m, { swing: 0 }, 0.2);
        yield CK.tween(m, { ox: 0 }, 0.3);
      } else if (s === 'kite' || s === 'snowplow' || s === 'hardhat') {
        const mult0 = s === 'kite' ? 1.3 : s === 'snowplow' ? 1.7 : 2;
        let mult = 1.5;
        if (s !== 'hardhat') mult = yield* this.qteRing(enemies[Math.floor(enemies.length / 2)], 'attack', m);
        else {
          for (let i = 0; i < 20; i++) this.parts.emit({ x: U.rand(560, 920), y: U.rand(200, 460), life: 1, size: 3, shape: 'circle', color: '#9fd3ff' });
          this.pop(m, 'Calculated!', '#ffd25a');
        }
        for (const e of enemies) {
          if (s === 'kite') this.parts.burst(10, () => ({ x: e.pos.x - 100, y: e.pos.y - U.rand(20, 140), vx: U.rand(300, 500), vy: U.rand(-30, 30), life: 0.6, size: 6, shape: 'petal', color: '#ffd8e8' }));
          if (s === 'snowplow') this.parts.burst(14, () => ({ x: e.pos.x, y: e.pos.y - 30, vx: U.rand(-200, 200), vy: U.rand(-300, -50), g: 400, life: 1, size: U.rand(3, 7), shape: 'snow', color: '#fff' }));
          this.hit(e, m.atk * mult0 * mult, { perfect: mult > 1, attacker: m });
        }
        yield 0.8;
      } else if (s === 'umbrella') {
        this.shield = 2;
        CK.Audio.sfx('block');
        for (const p of this.alive('party')) {
          p.soak = 0;
          p.floppy = false;
          this.pop(p, 'Shielded!', '#9fd3ff');
        }
        yield 0.8;
      } else if (s === 'tower') {
        this.fortify = 2;
        CK.Audio.sfx('block');
        for (const p of this.party) this.pop(p, 'Fortified!', '#9fd3ff');
        yield 0.8;
      } else if (s === 'lighthouse') {
        this.beam = 1;
        CK.tween(this, { beam: 0 }, 1.2, 'inQuad');
        for (const e of enemies) {
          this.hit(e, m.atk * 0.7, { attacker: m });
          if (!e.d.boss || Math.random() < 0.6) e.stun = 1;
        }
        yield 1;
      } else if (s === 'bridge') {
        for (const p of this.alive('party')) {
          const amt = Math.round(p.maxHp * 0.5);
          p.hp = Math.min(p.maxHp, p.hp + amt);
          p.soak = 0;
          this.pop(p, '+' + amt, '#7be07b');
          this.hearts(p);
        }
        CK.Audio.sfx('heal');
        yield 0.9;
      }
    }
    hearts(t) {
      this.parts.burst(8, () => ({ x: t.pos.x + U.rand(-40, 40), y: t.pos.y - U.rand(60, 160), vy: -60, life: 1, size: 7, shape: 'star', color: '#ff9ec7' }));
    }
    hit(target, raw, o = {}) {
      if (!target.alive) return;
      if (CK.Stamps && o.attacker) raw *= CK.Stamps.atkMul(o.attacker);
      if (target.marked > 0 && target.side === 'enemy') {
        raw *= target.markMul || 1.4;
        target.marked--;
      }
      if (o.attacker && o.attacker.helped) {
        raw *= 1.25;
        o.attacker.helped = false;
      }
      let dmg = Math.max(1, Math.round(raw * U.rand(0.9, 1.1) * (CK.settings && CK.settings.story && target.side === 'enemy' ? 1.3 : 1)) - target.def);
      if (target.d && target.d.floor) {
        const floor = Math.ceil(target.maxHp * target.d.floor);
        if (target.hp - dmg <= floor) {
          dmg = Math.max(0, target.hp - floor);
          this.endCheck = 'floor';
        }
      }
      target.hp -= dmg;
      target.flash = 0.25;
      this.shake = o.big ? 14 : o.perfect ? 9 : 5;
      CK.Audio.sfx(o.perfect || o.big ? 'crit' : 'hit');
      const p = target.pos;
      this.pop(target, '' + dmg, o.perfect ? '#ffd25a' : '#fff', o.perfect ? 40 : 32);
      if (o.perfect) this.pop(target, 'PERFECT!', '#ffd25a', 22, -50);
      this.parts.burst(10, () => ({ x: p.x + target.ox, y: p.y - 80, vx: U.rand(-200, 200), vy: U.rand(-250, -50), g: 500, life: 0.7, size: U.rand(5, 9), shape: target.side === 'enemy' && target.d.draw !== 'magpie' && target.d.draw !== 'corvin' ? 'drop' : 'spark', color: target.side === 'enemy' ? '#7fd0ff' : '#ecc38c', spin: 6 }));
      CK.tween(target, { ox: target.ox + (target.side === 'enemy' ? 20 : -20) }, 0.08, 'outQuad', () => CK.tween(target, { ox: 0 }, 0.2));
      if (target.hp <= 0) {
        target.hp = 0;
        target.alive = false;
        target.dying = 1;
        CK.tween(target, { dying: 0 }, 0.6, 'inQuad');
        if (target.side === 'enemy') {
          CK.Audio.sfx('splash');
          this.parts.burst(20, () => ({ x: p.x, y: p.y - 60, vx: U.rand(-150, 150), vy: U.rand(-250, -50), g: 400, life: 1, size: U.rand(3, 8), shape: 'star', color: U.pick(['#fff36a', '#ffd8e8', '#bfe6ff']) }));
        } else this.pop(target, 'Soggy!', '#9fd3ff', 24, -40);
      }
    }
    pop(target, text, color, size, dy) {
      const p = target.pos;
      this.parts.emit({ x: p.x + (target.ox || 0) + U.rand(-10, 10), y: p.y - 170 + (dy || 0), vy: -50, life: 1.1, size: size || 26, shape: 'text', text, color, pop: true, fade: true });
    }

    // QTE ring: returns multiplier. Used for attacks (bonus) and blocks.
    *qteRing(target, kind, presser) {
      const p = target.pos;
      const who = presser ? this.playerOf(presser) : 0;
      const inp = Input.p(who);
      const q = { x: p.x + (target.ox || 0), y: p.y - (target.side === 'enemy' && target.d.boss ? 140 : 100), r: 110, kind, result: null, pressed: false, who };
      this.qte = q;
      const dur = kind === 'attack' ? 0.85 : 0.7;
      const t0 = this.t;
      const skill = CK.autoSkill || { hit: 1, block: 0 };
      const easy = CK.settings || {};
      const autoPress = (CK.autoBattle && Math.random() < (kind === 'attack' ? skill.hit : skill.block)) || easy.autoTime;
      while (this.t - t0 < dur) {
        q.r = 110 * (1 - (this.t - t0) / dur);
        const auto = autoPress && q.r < 30;
        if (!q.pressed && (inp.hit('ok') || Input.mouse.pressed || auto)) {
          q.pressed = true;
          q.good = easy.story ? q.r >= 8 && q.r <= 60 : q.r >= 18 && q.r <= 40;
          if (kind === 'attack') {
            if (q.good) CK.Audio.sfx('perfect');
            break;
          }
          if (q.good) {
            q.result = 'block';
            CK.Audio.sfx('block');
          }
        }
        yield 0;
      }
      this.qte = null;
      if (kind === 'attack') return q.good ? 1.5 : 1;
      return q.result === 'block' ? 0.5 : 1;
    }

    // ---------------------------------------------------------- enemies
    pickMove(e) {
      const d = e.d;
      const tot = d.moves.reduce((a, m) => a + m.w, 0);
      let r = Math.random() * tot, mv = d.moves[0];
      for (const m of d.moves) {
        if ((r -= m.w) <= 0) {
          mv = m;
          break;
        }
      }
      return mv;
    }
    *enemyAct(e) {
      const d = e.d;
      let mv = e.intent || this.pickMove(e);
      e.intent = null;
      if (mv.summon && this.freeSlot() < 0) mv = d.moves[0];
      if (mv.heal && e.hp > e.maxHp * 0.7) mv = d.moves[0];
      this.banner = { text: mv.name, t: 0, small: true, enemy: true };
      yield 0.55;
      this.banner = null;
      if (mv.summon) {
        const n = this.addEnemy(mv.summon, true);
        if (n) CK.Audio.sfx('whoosh');
        yield 0.6;
        return;
      }
      if (mv.heal) {
        const amt = Math.round(e.maxHp * mv.heal);
        e.hp = Math.min(e.maxHp, e.hp + amt);
        this.pop(e, '+' + amt, '#7be07b');
        CK.Audio.sfx('heal');
        yield 0.6;
        return;
      }
      const guards = this.alive('party').filter((p) => p.guard);
      const targets = mv.all ? this.alive('party') : [guards.length ? guards[0] : U.pick(this.alive('party'))];
      const focus = mv.all ? this.party[0].alive ? this.party[0] : targets[0] : targets[0];
      CK.tween(e, { ox: mv.all ? -60 : focus.pos.x - e.pos.x + 170 }, 0.45, 'inOutQuad');
      const mult = yield* this.qteRing(focus, 'block', focus);
      e.swing = 1;
      for (const t of targets) {
        let dmg = e.atk * mv.power * U.rand(0.9, 1.1);
        const walled = mv.water && this.barricade > 0;
        if (mv.water) dmg *= 1 - t.water;
        if (mv.water && this.shield > 0) dmg *= 0.4;
        if (walled) dmg *= 0.35;
        if (t.soak >= 50) dmg *= 1.25;
        if (this.fortify > 0) dmg *= 0.5;
        if (t.guard) dmg *= CK.Stamps ? CK.Stamps.guardMul(t) : 0.5;
        dmg *= mult;
        if (CK.settings && CK.settings.story) dmg *= 0.5;
        dmg = Math.max(1, Math.round(dmg - t.def));
        if (CK.Stamps) dmg = CK.Stamps.guard(this, t, dmg);
        t.hp -= dmg;
        t.flash = 0.25;
        this.pop(t, '' + dmg, mult < 1 ? '#9fd3ff' : '#ff8a8a');
        if (mult < 1) this.pop(t, 'BLOCKED!', '#9fd3ff', 22, -50);
        if (mv.water && !walled) this.addSoak(t, (mv.soak ? 42 : 22) * (mult < 1 ? 0.5 : 1));
        if (mv.drain && t.charge > 0 && mult >= 1) {
          t.charge--;
          this.pop(t, 'Charge -1', '#c9b0ff', 18, -80);
        }
        const p = t.pos;
        this.parts.burst(8, () => ({ x: p.x, y: p.y - 90, vx: U.rand(-180, 180), vy: U.rand(-200, -40), g: 500, life: 0.7, size: U.rand(4, 7), shape: mv.water ? 'drop' : 'square', color: mv.water ? '#6fc3ff' : '#ecc38c' }));
        if (t.hp <= 0 && !(CK.Stamps && CK.Stamps.rescue(this, t))) {
          t.hp = 0;
          t.alive = false;
          this.pop(t, 'Too soggy!', '#9fd3ff', 22, -40);
        }
      }
      if (CK.Stamps && mult < 1) CK.Stamps.counter(this, focus, e);
      if (mv.water && this.barricade > 0) {
        this.barricade--;
        this.parts.burst(12, () => ({ x: 545 + U.rand(-30, 30), y: 400 + U.rand(-60, 20), vx: U.rand(-160, 160), vy: U.rand(-220, -40), g: 500, life: 0.8, size: U.rand(4, 7), shape: 'drop', color: '#6fc3ff' }));
        this.pop({ pos: { x: 545, y: 470 } }, this.barricade ? 'Barricade held!' : 'Barricade washed away!', '#ffe9a8', 20);
      }
      this.shake = 8;
      CK.Audio.sfx(mv.water ? 'splash' : 'hit');
      yield 0.3;
      e.swing = 0;
      yield CK.tween(e, { ox: 0 }, 0.35, 'inOutQuad');
      yield 0.15;
    }

    // ---------------------------------------------------------- endings
    *victory() {
      const G = CK.G;
      CK.Audio.sfx('win');
      let xp = 0, scraps = 0;
      for (const e of this.enemies) {
        xp += e.d.xp;
        scraps += e.d.scraps;
      }
      if (CK.Stamps) [xp, scraps] = CK.Stamps.loot(this, xp, scraps);
      G.scraps += scraps;
      const ups = CK.gainXp(xp);
      this.banner = { text: 'VICTORY!', t: 0 };
      this.summary = [`+${xp} XP`, `+${scraps} cardboard scraps`];
      if (ups) this.summary.push(`Level up! Everyone is now level ${G.level}`);
      if (ups) CK.Audio.sfx('levelup');
      for (const m of this.party) {
        CK.tween(m, { oy: -30 }, 0.25, 'outQuad', () => CK.tween(m, { oy: 0 }, 0.3, 'outBounce'));
      }
      yield 0.8;
      this.waitKey = true;
      yield () => CK.autoSkip || CK.autoBattle || Input.hit('ok') || Input.mouse.pressed;
      this.waitKey = false;
      CK.healParty();
      G.wet = 0;
      this.end('win');
    }
    *floorEnd() {
      yield 0.6;
      this.banner = { text: '...the rain will not stop.', t: 0, small: true };
      yield 1.4;
      CK.healParty();
      this.end('turn');
    }
    *defeat() {
      CK.Audio.sfx('lose');
      this.banner = { text: 'Too soggy to go on...', t: 0, small: true };
      yield 1.2;
      this.banner = null;
      if (CK.autoBattle) {
        CK.healParty();
        return this.end('lose');
      }
      const opts = ['Try again (full health)', this.def.boss ? 'Try again with 2 extra juice boxes' : 'Back off for now'];
      const offerStory = CK.settings && !CK.settings.story;
      if (offerStory) opts.push('Turn on Story Mode and try again');
      const ch = CK.choose('Your cardboard got soggy! Dry off and try again?', opts);
      yield ch;
      if (offerStory && ch.value === 2) {
        CK.settings.story = true; CK.saveSettings();
        CK.toast('Story Mode on (change it any time in Settings)');
      }
      if (ch.value === 1 && !this.def.boss) {
        CK.healParty();
        this.end('flee');
        return;
      }
      if (ch.value === 1) CK.G.snacks += 2;
      this.setup();
      this.endCheck = null;
      this.parts = new CK.Particles();
      yield* this.main();
    }
    end(result) {
      this.result = result;
      CK.flaps(() => {
        this.finished = true;
        CK.Scenes.remove(this);
      });
    }

    // ---------------------------------------------------------- input
    update(dt, active) {
      this.t += dt;
      this.parts.update(dt);
      if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 40);
      for (const c of this.party.concat(this.enemies)) if (c.flash > 0) c.flash -= dt;
      if (this.banner) this.banner.t += dt;
      if (!active || !this.ui) return;
      const ui = this.ui;
      const m = ui.actor;
      const I = this.inp(m);
      if (ui.mode === 'build') {
        const keys = Object.keys(Data.builds);
        if (I.hit('up') || I.hit('left')) { ui.bsel = (ui.bsel + keys.length - 1) % keys.length; CK.Audio.sfx('blip'); }
        if (I.hit('down') || I.hit('right')) { ui.bsel = (ui.bsel + 1) % keys.length; CK.Audio.sfx('blip'); }
        if (I.hit('back')) { ui.mode = 'menu'; CK.Audio.sfx('back'); return; }
        let pick = I.hit('ok') ? ui.bsel : -1;
        if (Input.mouse.pressed) this.buildRects().forEach((r, i) => D.inRect(Input.mouse.x, Input.mouse.y, ...r) && (pick = i));
        if (pick >= 0) {
          const b = Data.builds[keys[pick]];
          ui.bsel = pick;
          if (CK.G.scraps < b.cost) { CK.Audio.sfx('error'); return; }
          CK.Audio.sfx('select');
          ui.choice = { kind: 'build', what: keys[pick] };
        }
        return;
      }
      if (ui.mode === 'menu') {
        const items = this.menuItems(m);
        if (I.hit('up')) { ui.sel = (ui.sel + items.length - 1) % items.length; CK.Audio.sfx('blip'); }
        if (I.hit('down')) { ui.sel = (ui.sel + 1) % items.length; CK.Audio.sfx('blip'); }
        let pick = I.hit('ok') ? ui.sel : -1;
        if (Input.mouse.pressed) this.menuRects(items).forEach((r, i) => D.inRect(Input.mouse.x, Input.mouse.y, ...r) && (pick = i));
        if (pick >= 0) {
          const it = items[pick];
          ui.sel = pick;
          if (!it.ok) { CK.Audio.sfx('error'); return; }
          CK.Audio.sfx('select');
          if (it.kind === 'attack' || (it.kind === 'special' && this.specialTargets(m) === 'enemy')) {
            ui.mode = 'target'; ui.kind = it.kind; ui.list = this.alive('enemy'); ui.tsel = 0;
          } else if (it.kind === 'help') {
            ui.mode = 'target'; ui.kind = 'help'; ui.list = this.party.filter((p) => p !== m);
            const down = ui.list.findIndex((p) => !p.alive);
            ui.tsel = down >= 0 ? down : ui.list.reduce((b, c, i) => (c.hp / c.maxHp < ui.list[b].hp / ui.list[b].maxHp ? i : b), 0);
          } else if (it.kind === 'inspect') {
            ui.mode = 'target'; ui.kind = 'inspect'; ui.list = this.alive('enemy'); ui.tsel = 0;
          } else if (it.kind === 'build') {
            ui.mode = 'build'; ui.bsel = 0;
          } else if (it.kind === 'snack') {
            ui.mode = 'target'; ui.kind = 'snack'; ui.list = this.alive('party');
            ui.tsel = ui.list.reduce((b, c, i) => (c.hp / c.maxHp < ui.list[b].hp / ui.list[b].maxHp ? i : b), 0);
          } else ui.choice = { kind: it.kind };
        }
      } else if (ui.mode === 'target') {
        const L = ui.list;
        if (I.hit('left') || I.hit('up')) { ui.tsel = (ui.tsel + L.length - 1) % L.length; CK.Audio.sfx('blip'); }
        if (I.hit('right') || I.hit('down')) { ui.tsel = (ui.tsel + 1) % L.length; CK.Audio.sfx('blip'); }
        if (I.hit('back')) { ui.mode = 'menu'; CK.Audio.sfx('back'); return; }
        let pick = I.hit('ok') ? ui.tsel : -1;
        if (Input.mouse.pressed) L.forEach((c, i) => { if (Math.abs(Input.mouse.x - c.pos.x) < 70 && Input.mouse.y > c.pos.y - 200 && Input.mouse.y < c.pos.y + 20) pick = i; });
        if (pick >= 0) {
          CK.Audio.sfx('select');
          ui.choice = { kind: ui.kind, target: L[pick] };
        }
      }
    }
    menuRects(items) {
      return items.map((it, i) => [W / 2 - 134, 96 + i * 36, 260, 31]);
    }
    buildRects() {
      return Object.keys(Data.builds).map((k, i) => [W / 2 - 130, 120 + i * 62, 260, 54]);
    }

    // ---------------------------------------------------------- render
    drawBg(ctx) {
      const S = this.season, night = this.night;
      const sky = night ? S.night : S.sky;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, sky[0]);
      g.addColorStop(0.7, sky[1]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      if (night) {
        for (let i = 0; i < 40; i++) {
          const tw = 0.5 + Math.sin(this.t * 2 + i) * 0.5;
          D.star(ctx, U.hash(i, 1) * W, U.hash(i, 2) * 220, 2 + tw * 2, `rgba(255,248,200,${0.4 + tw * 0.5})`, 4);
        }
        D.circle(ctx, 820, 80, 34, '#fff3b0');
        D.circle(ctx, 838, 70, 30, sky[0]);
      } else {
        D.circle(ctx, 820, 90, 44, 'rgba(255,240,150,.5)');
        D.circle(ctx, 820, 90, 34, '#ffe27a');
        for (let i = 0; i < 4; i++) {
          const cx = ((i * 270 + this.t * 12) % (W + 200)) - 100, cy = 70 + (i % 2) * 50;
          for (let j = 0; j < 3; j++) D.circle(ctx, cx + j * 26, cy - (j === 1 ? 10 : 0), 22, 'rgba(255,255,255,.85)');
        }
      }
      // cardboard cut-out hills, standing like stage flats: each has a visible edge and casts a shadow
      const hills = { spring: ['#8fcf72', '#ffb7d5'], summer: ['#3fc4e0', '#f8e3a6'], fall: ['#d98a3b', '#b5562e'], winter: ['#dfeaf6', '#b8cde6'] }[this.def.season] || ['#8fcf72', '#7cc46a'];
      const shade = night ? -0.45 : 0;
      const flat = (col, path, sway) => {
        ctx.save();
        ctx.translate(sway, 0);
        ctx.save(); ctx.translate(10, 8); path(); ctx.fillStyle = 'rgba(40,20,10,0.22)'; ctx.fill(); ctx.restore();
        ctx.save(); ctx.translate(5, 3); path(); ctx.fillStyle = D.shade(col, -0.35); ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        path();
        const g = ctx.createLinearGradient(0, 200, 0, 400);
        g.addColorStop(0, D.shade(col, 0.12 + shade)); g.addColorStop(1, D.shade(col, -0.12 + shade));
        ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 3; ctx.stroke();
        ctx.restore();
      };
      flat(hills[1], () => {
        ctx.beginPath(); ctx.moveTo(-20, 300);
        for (let x = -20; x <= W; x += 80) ctx.quadraticCurveTo(x + 40, 230 + Math.sin(x) * 30, x + 80, 290);
        ctx.lineTo(W + 20, 390); ctx.lineTo(-20, 390); ctx.closePath();
      }, Math.sin(this.t * 0.4) * 3);
      flat(hills[0], () => {
        ctx.beginPath(); ctx.moveTo(-20, 340);
        for (let x = -20; x <= W; x += 120) ctx.quadraticCurveTo(x + 60, 290, x + 120, 340);
        ctx.lineTo(W + 20, 392); ctx.lineTo(-20, 392); ctx.closePath();
      }, Math.sin(this.t * 0.5 + 1) * 2);
      // stage floor in perspective: boards run toward a vanishing point far behind the backdrop
      const fy = 376, vx = W / 2, vy = fy - 700;
      const floorCol = night ? '#7b5a3e' : D.C.card;
      ctx.beginPath(); ctx.moveTo(-40, H + 10); ctx.lineTo(W + 40, H + 10); ctx.lineTo(W + 40, fy); ctx.lineTo(-40, fy); ctx.closePath();
      const fg = ctx.createLinearGradient(0, fy, 0, H);
      fg.addColorStop(0, D.shade(floorCol, -0.22)); fg.addColorStop(0.35, floorCol); fg.addColorStop(1, D.shade(floorCol, 0.12));
      ctx.fillStyle = fg; ctx.fill();
      ctx.save(); ctx.clip();
      ctx.strokeStyle = 'rgba(90,50,20,0.28)'; ctx.lineWidth = 2;
      for (let i = -14; i <= 14; i++) {
        const bx = vx + i * 80;
        ctx.beginPath(); ctx.moveTo(vx + (bx - vx) * ((fy - vy) / (H + 10 - vy)), fy); ctx.lineTo(bx, H + 10); ctx.stroke();
      }
      for (const yy of [392, 414, 444, 484, 534]) { ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.strokeStyle = 'rgba(90,50,20,0.12)'; ctx.stroke(); }
      // pools of stage light under each side
      for (const [lx, ly, r] of [[260, 470, 230], [760, 450, 220]]) {
        ctx.save(); ctx.translate(lx, ly); ctx.scale(1, 0.32);
        const lg = ctx.createRadialGradient(0, 0, 10, 0, 0, r);
        lg.addColorStop(0, night ? 'rgba(255,220,150,0.22)' : 'rgba(255,250,220,0.32)'); lg.addColorStop(1, 'rgba(255,250,220,0)');
        ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      D.line(ctx, -10, fy, W + 10, fy, D.C.ink, 4);
      ctx.fillStyle = 'rgba(40,20,10,0.25)'; ctx.fillRect(0, fy + 2, W, 5);
      // curtains
      for (const side of [0, 1]) {
        ctx.save();
        if (side) { ctx.translate(W, 0); ctx.scale(-1, 1); }
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(70, 0); ctx.quadraticCurveTo(30, 200, 46, 380); ctx.quadraticCurveTo(20, 400, 0, 380); ctx.closePath();
        ctx.fillStyle = night ? '#7a2f4a' : '#ef6b6b'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 4; ctx.stroke();
        for (let i = 1; i < 3; i++) D.line(ctx, i * 18, 10, i * 14, 360, 'rgba(0,0,0,.15)', 3);
        ctx.restore();
      }
      D.cardboard(ctx, -10, -10, W + 20, 36, { r: 0, fill: night ? '#7a2f4a' : '#ef6b6b', lw: 4, flute: false });
      for (let i = 0; i < 16; i++) D.circle(ctx, i * 64 + 32, 26, 12, night ? '#7a2f4a' : '#ef6b6b', D.C.ink, 3);
      if (this.def.season === 'winter' || this.def.final) {
        for (let i = 0; i < 30; i++) {
          const y = (this.t * 40 + U.hash(i, 5) * H) % H;
          D.circle(ctx, (U.hash(i, 6) * W + Math.sin(this.t + i) * 10) % W, y, 2, 'rgba(255,255,255,.8)');
        }
      }
    }
    draw(ctx) {
      ctx.save();
      if (this.shake && CK.shakeK()) ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
      this.drawBg(ctx);
      this.drawBuilds(ctx);
      const all = this.party.concat(this.enemies).filter((c) => c.alive || c.dying > 0).sort((a, b) => a.pos.y - b.pos.y);
      for (const c of all) {
        ctx.save();
        if (!c.alive) {
          ctx.globalAlpha = Math.max(0, c.dying || 0);
        }
        const x = c.pos.x + c.ox, y = c.pos.y + c.oy;
        if (c.side === 'party') {
          if (c.giant < 0.5) D.char(ctx, c.id, x, y, { s: 1.6, dir: 'right', costume: c.costume, mood: 'happy' });
          else {
            const sc = 0.85 * Math.max(0.5, c.giant);
            if (c.floppy) {
              // soggy cardboard sags
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate(Math.sin(this.t * 1.5) * 0.06 - 0.12);
              ctx.scale(1.08, 0.78);
              ctx.translate(-x, -y);
            }
            D.giant(ctx, c.costume, x, y, { s: sc, who: c.id, mood: c.floppy || c.hp < c.maxHp * 0.3 ? 'sad' : this.ui && this.ui.actor === c ? 'happy' : 'angry', flash: c.flash > 0, swing: c.swing, seed: c.pos.x });
            if (c.floppy) ctx.restore();
            if (c.soak >= 50) for (let i = 0; i < 3; i++) {
              const dp = (this.t + i * 0.33) % 1;
              D.ellipse(ctx, x - 30 + i * 30, y - 120 + dp * 100, 4, 6, `rgba(90,180,240,${1 - dp})`);
            }
          }
          if (this.fortify > 0) {
            ctx.globalAlpha = 0.25 + Math.sin(this.t * 4) * 0.08;
            D.ellipse(ctx, x, y - 90, 80, 110, '#9fd3ff', '#5aa9e6', 3);
          }
          if (c.guard && c.alive) {
            const sy = y - 168 + Math.sin(this.t * 4) * 3;
            D.circle(ctx, x + 58, sy, 17, '#e6f3ff', D.C.ink, 2.5);
            D.icon(ctx, 'shield', x + 58, sy, 2.2);
            D.text(ctx, 'GUARD', x + 58, sy + 32, { size: 12, weight: 700, align: 'center', color: '#fff', outline: D.C.ink, ow: 3 });
          }
          if (this.shield > 0 && c.alive) {
            ctx.globalAlpha = 0.85;
            ctx.beginPath(); ctx.arc(x, y - 175, 70, Math.PI * 1.05, Math.PI * 1.95);
            ctx.strokeStyle = '#5aa9e6'; ctx.lineWidth = 6; ctx.stroke();
          }
        } else {
          D.enemy(ctx, c.d.draw, x, y, { s: c.scale, seed: c.seed, flash: c.flash > 0, stun: c.stun > 0, phase2: c.hp < c.maxHp * 0.5, calm: false });
          if (c.stun > 0) for (let i = 0; i < 3; i++) D.star(ctx, x + Math.cos(this.t * 4 + i * 2) * 30, y - 130 + Math.sin(this.t * 4 + i * 2) * 8, 7, '#fff36a', 5, this.t);
          if (c.alive) this.drawEnemyBar(ctx, c, x, y);
        }
        ctx.restore();
      }
      if (this.beam > 0) {
        ctx.globalAlpha = this.beam * 0.7;
        D.poly(ctx, [PARTY_POS[0].x, 220, W, 120, W, 520], '#fff8b0');
        ctx.fillStyle = `rgba(255,255,220,${this.beam * 0.4})`;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
      if (this.barricade > 0) this.drawBarricade(ctx);
      this.parts.draw(ctx);
      if (this.rainy) this.drawRain(ctx);
      if (this.qte) this.drawQte(ctx, this.qte);
      ctx.restore();
      this.drawParty(ctx);
      if (this.ui) this.drawUi(ctx);
      if (this.banner) this.drawBanner(ctx, this.banner);
      if (this.summary && this.waitKey) {
        D.panel(ctx, W / 2 - 200, 170, 400, 60 + this.summary.length * 30, { fill: '#fff4dc' });
        this.summary.forEach((s, i) => D.text(ctx, s, W / 2, 210 + i * 30, { size: 20, align: 'center', weight: 700, color: i === 2 ? '#ef6b6b' : D.C.ink }));
        D.text(ctx, 'Press Z / click to continue', W / 2, 238 + this.summary.length * 30, { size: 14, align: 'center', color: '#7a5434' });
      }
    }
    drawBuilds(ctx) {
      if (this.gutter > 0) {
        // a cardboard gutter channel carrying water off stage
        D.cardboard(ctx, -10, 516, 560, 18, { r: 6, lw: 3, fill: '#c99561', flute: false });
        ctx.fillStyle = '#6fc3ff';
        ctx.fillRect(0, 520, 550, 8);
        for (let i = 0; i < 8; i++) {
          const ph = (this.t * 1.2 + i / 8) % 1;
          D.ellipse(ctx, ph * 560, 524, 7, 2.5, 'rgba(255,255,255,.8)');
        }
      }
    }
    drawBarricade(ctx) {
      const s = this.barT == null ? 1 : this.barT;
      const x = 545, y = 500;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, Math.max(0.05, s));
      const h = 50 + this.barricade * 18;
      D.cardboard(ctx, -26, -h, 52, h, { r: 4, lw: 3, fill: '#d9a66b' });
      for (let i = 0; i < this.barricade; i++) D.tape(ctx, -30, -h + 14 + i * 22, 60, 10, (i % 2 ? 0.15 : -0.15));
      D.line(ctx, -12, -h + 8, -12, -8, 'rgba(0,0,0,.15)', 3);
      ctx.restore();
    }
    drawRain(ctx) {
      ctx.strokeStyle = 'rgba(180,210,255,0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 70; i++) {
        const x = (U.hash(i, 3) * (W + 100) - this.t * 160) % (W + 100);
        const y = (U.hash(i, 4) * H + this.t * 520) % H;
        const xx = x < 0 ? x + W + 100 : x;
        ctx.moveTo(xx, y);
        ctx.lineTo(xx - 5, y + 16);
      }
      ctx.stroke();
    }
    drawEnemyBar(ctx, c, x, y) {
      const big = c.d.boss;
      const w = big ? 220 : 110;
      const by = big ? 74 : y - ({ barnacle: 120, slush: 110, leafling: 125, splashling: 140, pumpbot: 140 }[c.d.draw] || 150);
      const bx = big ? W - w - 70 : x - w / 2;
      if (big) D.text(ctx, c.name, bx + w / 2, by - 8, { size: 18, align: 'center', weight: 700, color: '#fff', outline: D.C.ink });
      else D.text(ctx, c.name, x, by - 6, { size: 14, align: 'center', weight: 700, color: '#fff', outline: D.C.ink, ow: 3 });
      D.rr(ctx, bx, by, w, 12, 6); ctx.fillStyle = '#4a2c17'; ctx.fill();
      D.rr(ctx, bx + 2, by + 2, (w - 4) * (c.hp / c.maxHp), 8, 4); ctx.fillStyle = '#ef6b6b'; ctx.fill();
      if (c.d.floor) {
        const fx = bx + 2 + (w - 4) * c.d.floor;
        D.line(ctx, fx, by - 2, fx, by + 14, '#fff', 2);
      }
      // what it's about to do (enemies telegraph their moves)
      const mv = c.intent;
      if (mv && !this.summary) {
        const tag = mv.summon ? 'calls for help' : mv.heal ? 'patching up' : (mv.all ? 'everyone · ' : '') + (mv.water ? 'splash' : mv.drain ? 'drains stars' : 'hit');
        const label = (c.inspected ? mv.name + ': ' : 'Next: ') + tag;
        const ty = big ? by + 30 : by + 28;
        const tw = D.measure(ctx, label, 12, 700) + (mv.water ? 26 : 16);
        const tx = big ? bx + w / 2 : x;
        D.rr(ctx, tx - tw / 2, ty - 13, tw, 18, 9); ctx.fillStyle = mv.water ? 'rgba(220,240,255,0.92)' : 'rgba(255,244,220,0.92)'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 1.5; ctx.stroke();
        if (mv.water) D.icon(ctx, 'drop', tx - tw / 2 + 11, ty - 4, 0.7);
        D.text(ctx, label, tx + (mv.water ? 5 : 0), ty, { size: 12, weight: 700, align: 'center', color: mv.all ? '#c2410c' : D.C.ink });
      }
      if (c.marked > 0) {
        const mx = big ? bx - 22 : x + w / 2 + 14, my = by + 6;
        ctx.save(); ctx.translate(mx, my); ctx.rotate(this.t * 2);
        D.circle(ctx, 0, 0, 9, null, '#ffd25a', 3); D.line(ctx, -13, 0, 13, 0, '#ffd25a', 2); D.line(ctx, 0, -13, 0, 13, '#ffd25a', 2);
        ctx.restore();
        D.text(ctx, 'x' + c.marked, mx + 12, my + 14, { size: 11, weight: 700, color: '#ffd25a', outline: D.C.ink, ow: 3 });
      }
    }
    drawQte(ctx, q) {
      D.circle(ctx, q.x, q.y, 29, 'rgba(255,255,255,0.15)');
      ctx.setLineDash([6, 5]);
      D.circle(ctx, q.x, q.y, 29, null, q.kind === 'attack' ? '#ffd25a' : '#9fd3ff', 4);
      ctx.setLineDash([]);
      const near = q.r >= 18 && q.r <= 40;
      D.circle(ctx, q.x, q.y, Math.max(2, q.r), null, near ? '#ffffff' : q.kind === 'attack' ? '#ff9c3a' : '#5aa9e6', 6);
      if (q.kind === 'block') D.icon(ctx, 'shield', q.x, q.y, 1.3);
      else D.star(ctx, q.x, q.y, 10, '#ffd25a', 5, this.t * 3);
      const key = CK.coop ? (q.who ? 'P2: Enter' : 'P1: Space') : 'Press Z';
      D.text(ctx, q.kind === 'attack' ? key + ' when the rings meet!' : 'BLOCK! ' + key + ' when the rings meet!', q.x, q.y + 60, { size: 15, align: 'center', weight: 700, color: CK.coop && q.who ? '#bff5d6' : '#fff', outline: D.C.ink, ow: 4 });
    }
    drawParty(ctx) {
      this.party.forEach((c, i) => {
        const x = 14, y = 40 + i * 56;
        const active = this.ui && this.ui.actor === c;
        D.panel(ctx, x, y, 262, 52, { tape: false, inner: false, fill: active ? '#fff3b0' : c.alive ? '#fff4dc' : '#d9d0c4' });
        D.text(ctx, (CK.coop ? (this.playerOf(c) ? 'P2 ' : 'P1 ') : '') + c.name, x + 12, y + 19, { size: CK.coop ? 13 : 15, weight: 700, color: CK.coop && this.playerOf(c) ? '#2f7a55' : D.C.ink });
        D.text(ctx, Data.costumes[c.costume].name, x + 12, y + 37, { size: 12, weight: 600, color: D.C.textSoft });
        // soak meter
        D.rr(ctx, x + 118, y + 40, 100, 7, 3); ctx.fillStyle = 'rgba(74,44,23,.25)'; ctx.fill();
        if (c.soak > 0) { D.rr(ctx, x + 118, y + 40, 100 * c.soak / 100, 7, 3); ctx.fillStyle = c.floppy ? '#2f7fd0' : c.soak >= 50 ? '#4aa8f0' : '#9fd3ff'; ctx.fill(); }
        D.text(ctx, c.floppy ? 'FLOPPY' : 'soak', x + 222, y + 48, { size: 11, weight: 700, color: c.floppy ? '#1f5fa0' : D.C.textSoft });
        D.rr(ctx, x + 118, y + 8, 100, 12, 6); ctx.fillStyle = '#4a2c17'; ctx.fill();
        D.rr(ctx, x + 120, y + 10, 96 * Math.max(0, c.hp / c.maxHp), 8, 4); ctx.fillStyle = c.hp < c.maxHp * 0.3 ? '#ef6b6b' : '#6cc56c'; ctx.fill();
        D.text(ctx, `${c.hp}/${c.maxHp}`, x + 222, y + 19, { size: 13, weight: 700, color: D.C.text });
        for (let k = 0; k < 3; k++) D.star(ctx, x + 128 + k * 18, y + 32, 7, k < c.charge ? '#ffd25a' : 'rgba(74,44,23,.25)', 5);
        if (c.stamp && CK.drawStamp) CK.drawStamp(ctx, c.stamp, x + 290, y + 26, 30, { used: c.stampUsed });
        if (c.charge >= 3) D.text(ctx, 'READY!', x + 186, y + 37, { size: 12, weight: 700, color: D.C.label });
      });
      D.text(ctx, this.night ? 'Night battle' : '', 18, 30, { size: 13, color: '#fff' });
    }
    drawUi(ctx) {
      const ui = this.ui, m = ui.actor;
      const b = D.calm() ? 0 : Math.sin(this.t * 5) * 4;
      const ax = m.pos.x + m.ox, ay = m.pos.y - 225 + b;
      D.poly(ctx, [ax - 12, ay, ax + 12, ay, ax, ay + 16], '#ffd25a', D.C.ink, 2);
      if (ui.mode === 'menu') {
        const items = this.menuItems(m);
        D.panel(ctx, W / 2 - 150, 62, 292, 46 + items.length * 36, { fill: '#fff4dc' });
        D.text(ctx, (CK.coop ? (this.playerOf(m) ? 'Player 2 · ' : 'Player 1 · ') : '') + m.name + "'s turn", W / 2 - 4, 88, { size: 16, align: 'center', weight: 700, color: CK.coop && this.playerOf(m) ? '#2f7a55' : D.C.textSoft });
        this.menuRects(items).forEach((r, i) => D.button(ctx, ...r, items[i].label, { hover: i === ui.sel, disabled: !items[i].ok, size: 17 }));
        const it = items[ui.sel];
        const DESC = {
          attack: 'Swing your costume at one foe. Pressing on the ring makes it a PERFECT hit, but every hit lands either way.',
          build: 'Spend cardboard scraps to build a Barricade or a Gutter mid-fight. Water is the real enemy!',
          guard: 'Stand in front of your friends. Single-target attacks come to you, and land half as hard. +1 star.',
          help: 'Dry a friend off, mend them a little and give them a star. Their next hit lands harder. A friend who is down gets back up.',
          inspect: 'Listen first: find a foe\'s weak spot (the next 2 hits on it land 40% harder) and see exactly what it\'s about to do. +1 star.',
          snack: 'Heal one friend a lot and dry them off.',
        };
        if (it.kind === 'special' || DESC[it.kind]) {
          const desc = it.kind === 'special' ? Data.costumes[m.costume].desc : DESC[it.kind];
          const lines = D.wrap(ctx, desc, 206, D.T.small, 500);
          D.panel(ctx, W / 2 + 152, 120, 236, 30 + lines.length * 19, { tape: false, fill: '#fff' });
          lines.forEach((l, i) => D.text(ctx, l, W / 2 + 166, 142 + i * 19, { size: D.T.small, weight: 500, color: D.C.text }));
        }
      } else if (ui.mode === 'build') {
        const keys = Object.keys(Data.builds);
        D.panel(ctx, W / 2 - 146, 62, 292, 208, { fill: '#fff4dc' });
        D.text(ctx, `Build what? (${CK.G.scraps} scraps)`, W / 2, 96, { size: 16, align: 'center', weight: 700, color: D.C.textSoft });
        this.buildRects().forEach((r, i) => {
          const b = Data.builds[keys[i]];
          D.button(ctx, ...r, `${b.name} (${b.cost})`, { hover: i === ui.bsel, disabled: CK.G.scraps < b.cost, size: 17 });
        });
        const b = Data.builds[keys[ui.bsel]];
        D.panel(ctx, W / 2 + 156, 120, 230, 80, { tape: false, fill: '#fff' });
        D.wrap(ctx, b.desc, 200, 13, 500).forEach((l, i) => D.text(ctx, l, W / 2 + 170, 144 + i * 17, { size: 13, weight: 500 }));
      } else {
        const c = ui.list[ui.tsel];
        if (c) {
          const x = c.pos.x + c.ox, y = c.pos.y - (c.side === 'enemy' && c.d.boss ? 250 : 190) + b;
          D.poly(ctx, [x - 16, y, x + 16, y, x, y + 22], '#ef6b6b', D.C.ink, 3);
          D.text(ctx, ui.kind === 'snack' ? 'Give a juice box to who?' : ui.kind === 'help' ? 'Help who? (Esc: back)' : ui.kind === 'inspect' ? 'Inspect which foe? (Esc: back)' : 'Choose a target (Esc: back)', W / 2, H - 20, { size: 16, align: 'center', weight: 700, color: '#fff', outline: D.C.ink });
        }
      }
    }
    drawBanner(ctx, b) {
      const s = CK.Ease.outBack(Math.min(1, b.t * 4));
      ctx.save();
      ctx.translate(W / 2, b.small ? 130 : 200);
      ctx.scale(s, s);
      ctx.rotate(-0.03);
      const w = D.measure(ctx, b.text, b.small ? 26 : 52, 700) + 70;
      D.tape(ctx, -w / 2, b.small ? -26 : -44, w, b.small ? 46 : 76, 0, 0.95);
      D.text(ctx, b.text, 0, b.small ? 7 : 16, { size: b.small ? 26 : 52, align: 'center', weight: 700, color: b.enemy ? '#3a5a8a' : '#c2410c' });
      ctx.restore();
    }
  }
  CK.Battle = Battle;

  CK.startBattle = function (id) {
    const b = new Battle(id);
    const handle = { finished: false, result: null };
    CK.flaps(() => CK.Scenes.push(b), { close: 0.3, label: Data.battles[id].boss ? 'BOSS BATTLE!' : 'Monster ahead!' });
    CK.co(function* () {
      yield () => b.finished;
      handle.result = b.result;
      handle.finished = true;
    });
    return handle;
  };
})();
