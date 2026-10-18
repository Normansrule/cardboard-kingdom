// Cardboard Kingdom - dialogue box, choices and the cutscene script runner.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D;
  const Input = CK.Input;
  const W = CK.W, H = CK.H;

  // ------------------------------------------------------------ dialogue
  class DialogueScene {
    constructor(who, text, mood, opts) {
      this.transparent = true;
      this.who = who;
      this.text = text;
      this.mood = mood;
      this.shown = 0;
      this.finished = false;
      this.opts = opts || {};
      this.t = 0;
    }
    enter() {
      if (CK.autoSkip) this.close();
    }
    close() {
      this.finished = true;
      CK.Scenes.remove(this);
    }
    update(dt) {
      this.t += dt;
      const len = this.text.length;
      if (this.shown < len) {
        const before = Math.floor(this.shown);
        this.shown = Math.min(len, this.shown + dt * 55 * (CK.textSpeed ? CK.textSpeed() : 1));
        if (Math.floor(this.shown) !== before && before % 3 === 0 && this.text[before] !== ' ') CK.Audio.sfx('talk');
      }
      if ((Input.hit('ok') || Input.mouse.pressed) && this.t > 0.12) {
        if (this.shown < len) this.shown = len;
        else {
          CK.Audio.sfx('blip');
          this.close();
        }
      }
    }
    draw(ctx) {
      const sp = CK.Data.speakers[this.who] || CK.Data.speakers.narrator;
      const hasP = !!sp.look;
      const x = 30, y = H - 168, w = W - 60, h = 150;
      const pop = Math.min(1, this.t * 6);
      ctx.save();
      ctx.translate(0, (1 - pop) * 40);
      ctx.globalAlpha = pop;
      D.panel(ctx, x, y, w, h, { fill: '#fff4dc', seed: 11 });
      let tx = x + 28;
      if (hasP) {
        D.portrait(ctx, this.who, x + 18, y + 20, this.mood);
        tx = x + 148;
      }
      if (sp.name) {
        const nw = D.measure(ctx, sp.name, 20, 700) + 40;
        D.tape(ctx, tx - 8, y - 16, nw, 30, -0.03, 0.95);
        D.text(ctx, sp.name, tx + nw / 2 - 8, y + 6, { size: 20, weight: 700, align: 'center', color: '#5b3a1e' });
      }
      const lines = D.wrap(ctx, this.text.slice(0, Math.floor(this.shown)), w - (tx - x) - 30, 22, 500);
      // wrap the full text once for stable layout
      const full = D.wrap(ctx, this.text, w - (tx - x) - 30, 22, 500);
      let n = Math.floor(this.shown);
      let ly = y + 46;
      for (const L of full) {
        const part = L.slice(0, Math.max(0, n));
        D.text(ctx, part, tx, ly, { size: 22, weight: 500, color: this.opts.italic ? '#6b5a4a' : '#3d2412' });
        n -= L.length + 1;
        ly += 30;
        if (n <= 0) break;
      }
      void lines;
      if (this.shown >= this.text.length) {
        const b = Math.sin(this.t * 6) * 3;
        D.poly(ctx, [x + w - 40, y + h - 30 + b, x + w - 24, y + h - 30 + b, x + w - 32, y + h - 20 + b], '#5b3a1e');
      }
      ctx.restore();
    }
  }
  CK.say = function (who, text, mood, opts) {
    const d = new DialogueScene(who, text, mood, opts);
    CK.Scenes.push(d);
    return d;
  };

  // ------------------------------------------------------------- choices
  class ChoiceScene {
    constructor(prompt, options, who) {
      this.transparent = true;
      this.prompt = prompt;
      this.options = options;
      this.who = who;
      this.sel = 0;
      this.finished = false;
      this.value = -1;
      this.t = 0;
    }
    enter() {
      if (CK.autoSkip) this.pick(0);
    }
    pick(i) {
      this.value = i;
      this.finished = true;
      CK.Audio.sfx('select');
      CK.Scenes.remove(this);
    }
    rects() {
      const n = this.options.length;
      // long lists (the fold-out map late in the game) go into two columns so they fit on screen
      if (n > 5) {
        const rows = Math.ceil(n / 2), bw = 410, bh = 40, gap = 10;
        const top = H - 180 - rows * (bh + gap);
        return this.options.map((o, i) => [W / 2 - bw - 6 + Math.floor(i / rows) * (bw + 12), top + (i % rows) * (bh + gap), bw, bh]);
      }
      const bw = 560, bh = 46, gap = 12;
      const top = H - 180 - n * (bh + gap);
      return this.options.map((o, i) => [W / 2 - bw / 2, top + i * (bh + gap), bw, bh]);
    }
    update(dt) {
      this.t += dt;
      if (Input.hit('up')) { this.sel = (this.sel + this.options.length - 1) % this.options.length; CK.Audio.sfx('blip'); }
      if (Input.hit('down')) { this.sel = (this.sel + 1) % this.options.length; CK.Audio.sfx('blip'); }
      const R = this.rects();
      R.forEach((r, i) => {
        if (Input.mouse.moved && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) this.sel = i;
      });
      Input.mouse.moved = false;
      if (this.t > 0.2) {
        if (Input.hit('ok')) this.pick(this.sel);
        else if (Input.mouse.pressed) R.forEach((r, i) => D.inRect(Input.mouse.x, Input.mouse.y, ...r) && this.pick(i));
      }
    }
    draw(ctx) {
      ctx.fillStyle = 'rgba(30,15,5,0.25)';
      ctx.fillRect(0, 0, W, H);
      D.panel(ctx, 30, H - 168, W - 60, 150, { fill: '#fff4dc' });
      if (this.who) D.portrait(ctx, this.who, 48, H - 148);
      D.text(ctx, this.prompt, this.who ? 178 : 58, H - 110, { size: 24, weight: 600, color: '#3d2412' });
      this.rects().forEach((r, i) => D.button(ctx, ...r, this.options[i], { hover: i === this.sel, size: 20 }));
    }
  }
  CK.choose = function (prompt, options, who) {
    const c = new ChoiceScene(prompt, options, who);
    CK.Scenes.push(c);
    return c;
  };

  // --------------------------------------------------------- reward popup
  class RewardScene {
    constructor(title, sub, icon) {
      this.transparent = true;
      this.title = title;
      this.sub = sub;
      this.icon = icon;
      this.t = 0;
      this.finished = false;
    }
    enter() {
      CK.Audio.sfx('chest');
      if (CK.autoSkip) this.close();
    }
    close() {
      this.finished = true;
      CK.Scenes.remove(this);
    }
    update(dt) {
      this.t += dt;
      if (this.t > 0.5 && (Input.hit('ok') || Input.mouse.pressed)) this.close();
    }
    draw(ctx) {
      ctx.fillStyle = `rgba(30,15,5,${Math.min(0.45, this.t)})`;
      ctx.fillRect(0, 0, W, H);
      const s = CK.Ease.outBack(Math.min(1, this.t * 2.5));
      ctx.save();
      ctx.translate(W / 2, H / 2 - 20);
      ctx.scale(s, s);
      for (let i = 0; i < 12; i++) {
        ctx.save();
        ctx.rotate(this.t * 0.5 + (i * Math.PI) / 6);
        ctx.globalAlpha = 0.25;
        D.poly(ctx, [0, 0, -20, -260, 20, -260], '#fff3a0');
        ctx.restore();
      }
      D.panel(ctx, -230, -120, 460, 240, { fill: '#fff4dc' });
      if (this.icon && CK.Data.costumes[this.icon]) {
        D.giant(ctx, this.icon, 0, 30, { s: 0.55, who: 'sam', mood: 'happy' });
      } else if (this.icon) D.icon(ctx, this.icon, 0, -20, 3);
      D.text(ctx, this.title, 0, 70, { size: 28, weight: 700, align: 'center', color: '#3d2412' });
      D.text(ctx, this.sub || '', 0, 100, { size: 17, weight: 500, align: 'center', color: '#6b4a2a' });
      ctx.restore();
    }
  }
  CK.reward = function (title, sub, icon) {
    const r = new RewardScene(title, sub, icon);
    CK.Scenes.push(r);
    return r;
  };

  // ---------------------------------------------------------- title card
  class CardScene {
    constructor(title, sub, dur) {
      this.title = title;
      this.sub = sub;
      this.t = 0;
      this.dur = dur || 3;
      this.finished = false;
      this.transparent = true;
    }
    update(dt) {
      this.t += dt;
      if (CK.autoSkip || this.t > this.dur || (this.t > 0.8 && (Input.hit('ok') || Input.mouse.pressed))) {
        this.finished = true;
        CK.Scenes.remove(this);
      }
    }
    draw(ctx) {
      const a = Math.min(1, this.t * 3, (this.dur - this.t) * 3);
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = 'rgba(30,15,5,0.55)';
      ctx.fillRect(0, 0, W, H);
      D.panel(ctx, W / 2 - 300, H / 2 - 80, 600, 160, { fill: '#fff4dc' });
      D.text(ctx, this.title, W / 2, H / 2 - 5, { size: 40, weight: 700, align: 'center', color: '#3d2412' });
      D.text(ctx, this.sub || '', W / 2, H / 2 + 38, { size: 20, weight: 500, align: 'center', color: '#7a5434' });
      ctx.globalAlpha = 1;
    }
  }
  CK.card = function (title, sub, dur) {
    const c = new CardScene(title, sub, dur);
    CK.Scenes.push(c);
    return c;
  };

  // --------------------------------------------------------- script runner
  // A script is an array of commands. ['who','text','mood'] is a line of dialogue.
  CK.runScript = function (script, done) {
    if (typeof script === 'string') script = CK.Story.scripts[script];
    if (!script) return { finished: true };
    CK.scriptRunning = (CK.scriptRunning || 0) + 1;
    const co = CK.co(function* () {
      const r = yield* runList(script);
      CK.scriptRunning--;
      if (!CK.scriptRunning && CK.OW && CK.Scenes.top() === CK.OW && !CK.autoSkip) CK.saveGame();
      done && done(r);
      return r;
    });
    return co;
  };

  function* runList(list) {
    for (const c of list) {
      const r = yield* exec(c);
      if (r === 'abort') return 'abort';
    }
    return 'ok';
  }

  function* exec(c) {
    const G = CK.G;
    if (typeof c === 'function') {
      const r = c(G);
      if (Array.isArray(r)) return yield* runList(r);
      return;
    }
    if (Array.isArray(c)) {
      const [who, text, mood] = c;
      const name = text.replace(/\{sam\}/g, 'Sam');
      yield CK.say(who, name, mood);
      return;
    }
    if (c.if && !c.if(G)) {
      if (c.else) return yield* runList(c.else);
      return;
    }
    // {if, then}: when true, run `then` and stop the rest of the script
    if (c.then && c.if) {
      yield* runList(c.then);
      return 'abort';
    }
    if (c.fn) {
      const r = c.fn(G);
      if (Array.isArray(r)) return yield* runList(r);
      return;
    }
    if (c.narrate) {
      yield CK.say('narrator', c.narrate, null, { italic: true });
    } else if (c.choice) {
      const ch = CK.choose(c.choice.text, c.choice.options.map((o) => o.label), c.choice.who);
      yield ch;
      const opt = c.choice.options[ch.value];
      if (opt && opt.then) return yield* runList(opt.then);
    } else if (c.flag) {
      CK.setFlag(c.flag);
    } else if (c.unflag) {
      delete G.flags[c.unflag];
    } else if (c.give) {
      CK.giveCostume(c.give);
      const cd = CK.Data.costumes[c.give];
      yield CK.reward('New costume: ' + cd.name, 'Special: ' + cd.special + '. Equip it from the menu (Esc).', c.give);
    } else if (c.scraps) {
      G.scraps += c.scraps;
      CK.Audio.sfx('coin');
      CK.toast(`+${c.scraps} cardboard scraps`);
    } else if (c.snacks) {
      G.snacks += c.snacks;
      CK.Audio.sfx('coin');
      CK.toast(`+${c.snacks} juice box${c.snacks > 1 ? 'es' : ''}`);
    } else if (c.wait) {
      yield c.wait;
    } else if (c.sfx) {
      CK.Audio.sfx(c.sfx);
    } else if (c.music) {
      CK.Audio.setMusic(c.music, c.night);
    } else if (c.shake) {
      if (CK.OW) CK.OW.shake = c.shake;
    } else if (c.journal) {
      CK.journal(c.journal);
      CK.toast('Journal updated');
    } else if (c.heal) {
      CK.healParty();
    } else if (c.save) {
      CK.saveGame();
    } else if (c.battle) {
      const b = CK.startBattle(c.battle);
      yield b;
      if (b.result === 'flee') return 'abort';
    } else if (c.puzzle) {
      const p = CK.startPuzzle(c.puzzle);
      yield p;
      if (!p.solved) return 'abort';
    } else if (c.night !== undefined) {
      yield CK.flaps(() => {
        if (c.night) CK.setFlag(G.chapter + '_night');
        else delete G.flags[G.chapter + '_night'];
        CK.OW && CK.OW.refresh();
      }, { label: c.label || (c.night ? 'Night falls over the Kingdom...' : 'Morning!') });
    } else if (c.npc) {
      CK.OW && CK.OW.setNpc(c.npc);
    } else if (c.card) {
      yield CK.card(c.card.title, c.card.sub, c.card.dur);
    } else if (c.goto) {
      // like {chapter}, but the script keeps going in the new place
      yield CK.flaps(() => CK.gotoChapter(c.goto), { label: c.label || '' });
    } else if (c.chapter) {
      yield CK.flaps(() => CK.gotoChapter(c.chapter), { label: c.label || '' });
      return 'abort';
    } else if (c.scene) {
      yield CK.flaps(() => CK.Scenes.replace(CK.makeScene(c.scene)), { label: c.label || '' });
      return 'abort';
    } else if (c.coop) {
      // lines that only happen when a friend is playing along
      if (CK.coop) return yield* runList(c.coop);
    } else if (c.solo) {
      if (!CK.coop) return yield* runList(c.solo);
    } else if (c.await) {
      yield c.await(G);
    } else if (c.face) {
      CK.OW && CK.OW.face(c.face);
    } else if (c.walk) {
      if (CK.OW) yield CK.OW.walkTo(c.walk);
    }
  }
})();
