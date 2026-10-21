// Cardboard Kingdom - title screen, dorm prologue, menus, workbench and ending.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input, Data = CK.Data;
  const W = CK.W, H = CK.H;

  // simple vertical list helper used by menus
  function listNav(state, n) {
    if (Input.hit('up')) { state.sel = (state.sel + n - 1) % n; CK.Audio.sfx('blip'); }
    if (Input.hit('down')) { state.sel = (state.sel + 1) % n; CK.Audio.sfx('blip'); }
  }
  function clickList(rects, state) {
    let pick = -1;
    rects.forEach((r, i) => {
      if (Input.mouse.moved && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) state.sel = i;
      if (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) pick = i;
    });
    return pick;
  }

  // ================================================================ TITLE
  class TitleScene {
    constructor() {
      this.t = 0;
      this.sel = 0;
      this.parts = new CK.Particles();
      this.hasSave = !!CK.Save.read();
    }
    enter() {
      CK.Audio.setMusic('title');
      CK.Audio.setRain(false);
    }
    items() {
      return (this.hasSave ? ['Continue'] : []).concat(['New Game (1 player)', 'New Game (2 players)', 'Settings']);
    }
    rects() {
      return this.items().map((s, i) => [W / 2 - 150, 300 + i * 56, 300, 46]);
    }
    update(dt) {
      this.t += dt;
      this.parts.update(dt);
      if (Math.random() < dt * 8) this.parts.emit({ x: Math.random() * W, y: -10, vx: U.rand(10, 40), vy: U.rand(30, 60), sway: 30, life: 12, size: 5, color: U.pick(['#ffc1dc', '#ffd8e8', '#ff9ec7']), shape: 'petal', spin: 2, fade: false });
      if (CK.Trans.busy) return;
      const items = this.items();
      listNav(this, items.length);
      let pick = clickList(this.rects(), this);
      if (Input.hit('ok')) pick = this.sel;
      if (pick >= 0) {
        CK.Audio.sfx('select');
        if (items[pick] === 'Settings') {
          CK.Scenes.push(new CK.SettingsScreen());
        } else if (items[pick] === 'Continue' && CK.loadGame()) {
          const G = CK.G;
          CK.flaps(() => {
            if (!CK.Chapters[G.chapter]) CK.gotoChapter(CK.flag('epilogue') ? 'campus' : G.chapter === 'ending' ? 'winter' : 'campus');
            else {
              CK.Scenes.replace(new CK.Overworld(G.chapter, G.pos && G.pos.chapter === G.chapter ? G.pos : null));
            }
          }, { label: 'Welcome back!' });
        } else {
          CK.newGame(items[pick].includes('2 players'));
          CK.flaps(() => CK.gotoChapter('campus'), { label: CK.coop ? 'Two friends, one rut...' : 'Tuesday. Again.' });
        }
      }
    }
    draw(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#9fdcff');
      g.addColorStop(1, '#ffe3f1');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      // hills + castle
      ctx.fillStyle = '#a3dc86';
      ctx.beginPath(); ctx.moveTo(0, 420); ctx.quadraticCurveTo(240, 340, 480, 410); ctx.quadraticCurveTo(720, 470, W, 380); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
      ctx.strokeStyle = D.C.ink; ctx.lineWidth = 4; ctx.stroke();
      ctx.save(); ctx.translate(760, 400); ctx.scale(0.55, 0.55);
      CK.OW_DRAW_CASTLE && CK.OW_DRAW_CASTLE(ctx);
      ctx.restore();
      D.cardboard(ctx, 690, 250, 150, 150, { r: 4, lw: 4, fill: '#d6c7b0' });
      for (let i = 0; i < 5; i++) D.cardboard(ctx, 690 + i * 30, 232, 20, 22, { r: 2, lw: 3, fill: '#d6c7b0', flute: false });
      D.rr(ctx, 745, 330, 40, 70, 18); ctx.fillStyle = '#5a3a22'; ctx.fill(); ctx.stroke();
      D.line(ctx, 765, 232, 765, 180, D.C.ink, 4);
      D.poly(ctx, [765, 180, 805, 192, 765, 204], '#ffd25a', D.C.ink, 2);
      // cast
      D.char(ctx, 'corry', 150, 470, { s: 2, mood: 'happy' });
      D.char(ctx, 'sam', 250, 480, { s: 2, mood: 'happy', costume: 'knight' });
      D.char(ctx, 'pip', 330, 440, { s: 1.8, dir: 'right' });
      D.char(ctx, 'swabby', 860, 500, { s: 1.4, mood: 'happy' });
      D.char(ctx, 'critter', 620, 490, { s: 1.4, species: 'bunny', color: '#fff', hat: 'flowers', mood: 'happy' });
      this.parts.draw(ctx);
      // logo
      const b = D.calm() ? 0 : Math.sin(this.t * 1.6) * 3;
      ctx.save(); ctx.translate(W / 2, 140 + b); ctx.rotate(-0.03);
      D.cardboard(ctx, -330, -80, 660, 150, { r: 16, lw: 5, fill: '#d9a66b' });
      D.tape(ctx, -350, -86, 80, 26, -0.5);
      D.tape(ctx, 270, 40, 80, 26, -0.5);
      D.text(ctx, 'Cardboard Kingdom', 0, 18, { size: 70, weight: 700, align: 'center', color: '#fffaf0', outline: D.C.ink, ow: 10 });
      D.text(ctx, 'a cozy adventure about building a better life', 0, 54, { size: 18, weight: 600, align: 'center', color: D.C.text });
      ctx.restore();
      const items = this.items();
      this.rects().forEach((r, i) => D.button(ctx, ...r, items[i], { hover: i === this.sel, size: 22 }));
      if (CK.Scenes.top() === this) {
        const hint = 'Arrows + Z/Enter, or click  ·  M sound  ·  2 players: P1 WASD + Space, P2 Arrows + Enter';
        const hw = D.measure(ctx, hint, D.T.small, 600) + 32;
        D.rr(ctx, W / 2 - hw / 2, H - 36, hw, 26, 13); ctx.fillStyle = 'rgba(255,250,240,0.82)'; ctx.fill();
        D.text(ctx, hint, W / 2, H - 18, { size: D.T.small, align: 'center', color: D.C.text });
      }
    }
  }

  // ================================================================ DORM
  class DormScene {
    constructor(ending) {
      this.t = 0;
      this.ending = !!ending;
      this.rain = [];
      for (let i = 0; i < 60; i++) this.rain.push([Math.random() * 300, Math.random() * 260]);
      this.boxOpen = 0;
      this.samIn = 0;
    }
    enter() {
      CK.Audio.setMusic(this.ending ? 'ending' : 'dorm');
      CK.Audio.setRain(!this.ending);
      CK.G.chapter = 'dorm';
      const self = this;
      if (this.ending) return this.playEnding();
      CK.runScript([
        { wait: 0.8 },
        { narrate: '11:48 PM. Rain taps on the dorm window. On the laptop: "CE 341 Problem Set 4: Hydraulics. Due 8:00 AM."' },
        ['sam', 'Question 3. "Design a spillway for a 12-meter dam." ...Cool. Cool cool cool.', 'sad'],
        ['sam', 'I used to love this stuff. Building things. When did it all turn into grades and deadlines?', 'sad'],
        ['sam', "Everyone else seems to know where they're going. I just feel like I'm floating. Like I'm getting rained on all the time.", 'sad'],
        { narrate: 'In the corner sits the giant cardboard box from move-in day. Grandma\'s handwriting on the side: "FRAGILE: SAM\'S STUFF."' },
        ['sam', "When I was a kid, I'd sit in boxes like that for hours. Pretend they were castles. Draw knights on the sides.", 'happy'],
        ['sam', "...Nobody's watching. Five minutes.", 'happy'],
        (G) => { CK.tween(self, { samIn: 1 }, 1.2, 'inOutQuad'); },
        { wait: 1.3 },
        { narrate: 'Sam climbs in and pulls the flaps shut. It smells like tape and old crayons. The rain gets quieter... and quieter...' },
        { fn: () => CK.Audio.setRain(false) },
        { chapter: 'spring', label: '...and then, a breeze full of blossoms.' },
      ]);
    }
    playEnding() {
      const self = this;
      CK.runScript([
        { wait: 1 },
        { narrate: 'Sam opens their eyes. Morning sun streams through the window. The rain has stopped.' },
        ['sam', '...the box.', 'shock'],
        { narrate: 'On top of the laptop sits a tiny origami crane, wearing a very small red bandana.' },
        ['sam', 'Pip.', 'happy'],
        { narrate: 'Sam opens Problem Set 4. Question 3: "Design a spillway for a 12-meter dam."' },
        ['sam', "Huh. I know exactly how to do this. Spillway on the crest, stilling basin at the toe. Size it for the flood, not the average day.", 'happy'],
        ['sam', "It was never about the grade. It's about making sure somebody downstream stays dry.", 'happy'],
        ['sam', "My life isn't perfect. My classes are still hard. But it's mine. And I can build it a little better, one block at a time.", 'happy'],
        { fn: () => (self.done = true) },
      ]);
    }
    update(dt) {
      this.t += dt;
      for (const r of this.rain) {
        r[1] += dt * 300;
        if (r[1] > 260) r[1] = 0;
      }
      if (this.done && (Input.hit('ok') || Input.mouse.pressed || CK.autoSkip) && !this.credits) {
        this.credits = true;
        CK.Scenes.push(new CreditsScene());
      }
    }
    draw(ctx) {
      const night = !this.ending;
      ctx.fillStyle = night ? '#3a3352' : '#f3e2c8';
      ctx.fillRect(0, 0, W, H);
      // wall stripes
      for (let i = 0; i < 12; i++) { ctx.fillStyle = night ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'; ctx.fillRect(i * 80, 0, 40, 380); }
      // window
      const wx = 80, wy = 60;
      ctx.fillStyle = night ? '#1d1a3a' : '#bfe8ff';
      ctx.fillRect(wx, wy, 300, 260);
      if (night) {
        ctx.strokeStyle = 'rgba(160,190,255,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (const [x, y] of this.rain) { ctx.moveTo(wx + x, wy + y); ctx.lineTo(wx + x - 4, wy + y + 14); }
        ctx.stroke();
      } else {
        D.circle(ctx, wx + 230, wy + 70, 34, '#ffe27a');
        for (let i = 0; i < 3; i++) D.circle(ctx, wx + 60 + i * 26, wy + 110, 22, '#fff');
        ctx.fillStyle = '#ffb7d5';
        for (let i = 0; i < 6; i++) D.circle(ctx, wx + 30 + i * 50, wy + 230 + Math.sin(i) * 10, 26, '#ffc1dc');
      }
      ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 10; ctx.strokeRect(wx, wy, 300, 260);
      D.line(ctx, wx + 150, wy, wx + 150, wy + 260, '#6b4a2a', 8);
      D.line(ctx, wx, wy + 130, wx + 300, wy + 130, '#6b4a2a', 8);
      // floor
      ctx.fillStyle = night ? '#4b3a33' : '#c9a07a';
      ctx.fillRect(0, 380, W, 160);
      // desk + laptop
      D.cardboard(ctx, 440, 300, 300, 24, { r: 4, fill: '#8a5a2e', flute: false });
      D.line(ctx, 460, 324, 460, 470, D.C.ink, 8);
      D.line(ctx, 720, 324, 720, 470, D.C.ink, 8);
      D.rr(ctx, 520, 210, 150, 92, 6); ctx.fillStyle = '#2b2b38'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 3; ctx.stroke();
      D.rr(ctx, 528, 218, 134, 76, 3); ctx.fillStyle = night ? '#dfe9ff' : '#fffbe6'; ctx.fill();
      D.text(ctx, 'PS4: Hydraulics', 595, 238, { size: 11, align: 'center', weight: 700 });
      D.text(ctx, night ? 'Q3: design a spillway' : 'Q3: spillway ✓', 595, 256, { size: 10, align: 'center' });
      if (!night) {
        D.line(ctx, 545, 280, 585, 270, '#5aa9e6', 3);
        D.line(ctx, 585, 270, 640, 284, '#5aa9e6', 3);
      }
      D.poly(ctx, [505, 302, 685, 302, 700, 312, 490, 312], '#555', D.C.ink, 2);
      // books + pizza box + lamp
      for (let i = 0; i < 3; i++) D.cardboard(ctx, 690 - i * 4, 280 - i * 12, 50, 12, { r: 2, lw: 2, fill: ['#ef6b6b', '#5aa9e6', '#6cc56c'][i], flute: false });
      if (night) {
        const gr = ctx.createRadialGradient(470, 260, 0, 470, 260, 140);
        gr.addColorStop(0, 'rgba(255,220,140,0.35)'); gr.addColorStop(1, 'rgba(255,220,140,0)');
        ctx.fillStyle = gr; ctx.fillRect(330, 120, 280, 280);
      }
      D.line(ctx, 470, 300, 470, 240, D.C.ink, 4);
      D.poly(ctx, [450, 240, 490, 240, 480, 220, 460, 220], '#ffd25a', D.C.ink, 2);
      if (!night) {
        // the crane on the laptop
        ctx.save(); ctx.translate(640, 208);
        D.char(ctx, 'pip', 0, 0, { s: 0.6, noShadow: true });
        ctx.restore();
      }
      // the big box
      const bx = 800, by = 470;
      D.cardboard(ctx, bx - 90, by - 150, 180, 150, { r: 4, lw: 4 });
      D.text(ctx, 'FRAGILE', bx, by - 100, { size: 20, align: 'center', weight: 700, color: '#c2410c' });
      D.text(ctx, "SAM'S STUFF", bx, by - 76, { size: 16, align: 'center', weight: 600, color: '#5b3a1e' });
      // bear doodle on box
      D.circle(ctx, bx, by - 36, 16, null, D.C.ink, 2);
      D.circle(ctx, bx - 12, by - 50, 5, null, D.C.ink, 2);
      D.circle(ctx, bx + 12, by - 50, 5, null, D.C.ink, 2);
      D.circle(ctx, bx - 5, by - 38, 1.6, D.C.ink);
      D.circle(ctx, bx + 5, by - 38, 1.6, D.C.ink);
      D.poly(ctx, [bx - 90, by - 150, bx - 70, by - 190 + this.samIn * 40, bx, by - 150], D.C.cardL, D.C.ink, 3);
      D.poly(ctx, [bx + 90, by - 150, bx + 70, by - 190 + this.samIn * 40, bx, by - 150], D.C.cardL, D.C.ink, 3);
      // Sam
      if (this.ending) D.char(ctx, 'sam', 600, 470, { s: 2.6, dir: 'down', mood: 'happy' });
      else {
        const sx = U.lerp(600, bx, this.samIn), sy = U.lerp(470, by - 60, this.samIn);
        if (this.samIn < 0.95) D.char(ctx, 'sam', sx, sy, { s: 2.6, dir: this.samIn > 0 ? 'right' : 'down', mood: 'sad', walk: this.samIn * 20 });
      }
      if (this.done) D.text(ctx, 'Click / Z', W - 20, H - 16, { size: 14, align: 'right', color: '#5b3a1e' });
    }
  }
  CK.DormScene = DormScene;

  // ================================================================ ENDING
  class EndingScene {
    constructor() {
      this.t = 0;
      this.parts = new CK.Particles();
      this.line = -1;
    }
    enter() {
      CK.Audio.setMusic('ending');
      CK.G.chapter = 'ending';
      const self = this;
      const lines = CK.Story.endingLines;
      const script = [{ wait: 0.6 }];
      lines.forEach((l, i) => {
        script.push((G) => { self.line = i; });
        script.push({ narrate: l });
      });
      script.push(
        (G) => { self.line = 99; },
        ['queen', 'Sam. The Kingdom would be honored if you stayed. Royal Engineer, forever. We could build anything together.', 'happy'],
        { choice: { who: 'sam', text: 'Stay in the Cardboard Kingdom?', options: [
          { label: 'Stay forever', then: [
            ['corry', "We would love that more than anything. But Sam... Rule 2 is for you too. Don't leave your own world out in the rain.", 'happy'],
            ['pip', "This place came from you. It'll always be here. But you have bridges to build out there. Real ones!", 'happy'],
            ['sam', "...You're right. I came here to hide. I think I'm ready to go back and build instead.", 'happy'],
          ] },
          { label: 'Go home', then: [
            ['sam', "I love it here. But I have a world too. It's messy and hard, and it could use some building.", 'happy'],
          ] },
        ] } },
        ['bess', "Go on, giant. Build 'em something good. And make the gutters wide, eh?", 'happy'],
        ['corry', "Whenever you build something with care, a little bit of you comes back here. That's how the Kingdom grows.", 'happy'],
        ['pip', "I'm a full knight now, so this is official: Sir Sam, Royal Engineer, you're dismissed! ...I'll miss you SO much.", 'sad'],
        ['sam', "How do I even get home? The box is back on campus.", 'shock'],
        ['corvin', "...The same way all water does. Downhill. Every river finds the sea. Yours finds your world.", 'sad'],
        ['bess', "Which is why the Brinemarsh crew built you THIS. Wax-sealed hull. Taped seams. Named her the Rule Two.", 'happy'],
        { narrate: 'TWIST: The way home is not a door or a portal. It is a cardboard boat, built by the monsters, floating down the brand new spillway river.' },
        { coop: [['jules', "Dibs on the front seat. Sam, you paddle. I'll do the moral support.", 'happy']] },
        { narrate: 'Pip folds itself very small and tucks into Sam\'s hoodie pocket. The boat drifts onto the river. The cherry blossoms swirl, and the world goes soft and pink and warm...' },
        { journal: 'TWIST: The way home was a cardboard boat built by the Brinemarsh monsters, sailing down the spillway river into my own world.' },
        { fn: () => CK.flaps(() => {
          CK.setFlag('epilogue');
          delete CK.G.flags.campus_night;
          CK.gotoChapter('campus', { x: 18.5 * 48, y: 15.7 * 48 });
          CK.runScript('ep_intro');
        }, { label: 'Home.' }) }
      );
      CK.runScript(script);
    }
    update(dt) {
      this.t += dt;
      this.parts.update(dt);
      if (Math.random() < dt * 10) this.parts.emit({ x: Math.random() * W, y: -10, vx: U.rand(10, 40), vy: U.rand(30, 60), sway: 30, life: 12, size: 5, color: U.pick(['#ffc1dc', '#ffd8e8', '#ff9ec7']), shape: 'petal', spin: 2, fade: false });
      if (Math.random() < dt * 2) this.parts.burst(12, () => ({ x: U.rand(200, 760), y: U.rand(60, 200), vx: U.rand(-120, 120), vy: U.rand(-120, 40), g: 120, life: 1.4, size: 4, shape: 'star', color: U.pick(['#ffd25a', '#ff9ec7', '#9fd3ff']) }));
    }
    draw(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#bfe8ff');
      g.addColorStop(1, '#ffe3f1');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(0, -120);
      ctx.fillStyle = '#a3dc86';
      ctx.beginPath(); ctx.moveTo(0, 380); ctx.quadraticCurveTo(480, 320, W, 380); ctx.lineTo(W, H + 120); ctx.lineTo(0, H + 120); ctx.fill();
      ctx.strokeStyle = D.C.ink; ctx.lineWidth = 4; ctx.stroke();
      // waterwheel + river
      ctx.fillStyle = '#6ccff0';
      ctx.beginPath(); ctx.moveTo(0, 470); ctx.quadraticCurveTo(480, 430, W, 480); ctx.lineTo(W, 520); ctx.quadraticCurveTo(480, 470, 0, 510); ctx.fill();
      ctx.save(); ctx.translate(860, 430); ctx.rotate(this.t);
      for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); D.rr(ctx, -4, 0, 8, 44, 3); ctx.fillStyle = '#c99561'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 2; ctx.stroke(); }
      ctx.restore();
      // the little cloud
      D.enemy(ctx, 'drizzle', 150, 300, { s: 0.35, calm: true });
      // the whole gang
      const cast = [
        ['queen', 470, 390, { s: 1.6, mood: 'happy' }],
        ['mayor', 330, 400, { s: 1.5 }],
        ['bess', 620, 410, { s: 1.3, mood: 'happy' }],
        ['skipper', 690, 420, { s: 1.4, mood: 'happy' }],
        ['corry', 250, 440, { s: 1.6, mood: 'happy' }],
        ['sam', 400, 460, { s: 1.8, mood: 'happy', costume: 'hardhat' }],
        ['pip', 520, 440, { s: 1.5, dir: 'left' }],
        ['critter', 580, 470, { s: 1.3, species: 'bunny', color: '#fff', hat: 'flowers', mood: 'happy' }],
        ['critter', 760, 460, { s: 1.3, species: 'duck', color: '#ffe67a', hat: 'sunhat', mood: 'happy' }],
        ['critter', 160, 470, { s: 1.3, species: 'fox', color: '#f29a52', scarf: '#5aa9e6', mood: 'happy' }],
        ['magpie', 860, 500, { s: 1.1 }],
      ].concat(CK.coop ? [['jules', 300, 470, { s: 1.6, mood: 'happy', costume: 'umbrella' }]] : []);
      cast.sort((a, b) => a[2] - b[2]).forEach(([k, x, y, o]) => D.char(ctx, k, x, y + Math.abs(Math.sin(this.t * 3 + x)) * -6, o));
      D.tape(ctx, 836, 456, 50, 14, 0.3);
      ctx.restore();
      this.parts.draw(ctx);
    }
  }

  class CreditsScene {
    constructor() {
      this.t = 0;
    }
    update(dt) {
      this.t += dt;
      if (this.t > 2 && (Input.hit('ok') || Input.mouse.pressed || CK.autoSkip)) {
        CK.setFlag('credits_seen');
        CK.flaps(() => {
          CK.gotoChapter('campus', { x: 35.5 * 48, y: 20.7 * 48 });
          CK.toast('Free roam! The glowing box returns to the Kingdom.');
        });
        this.t = -999;
      }
    }
    draw(ctx) {
      const a = Math.min(1, this.t);
      ctx.fillStyle = `rgba(30,18,10,${0.85 * a})`;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = a;
      D.text(ctx, 'THE END', W / 2, 150, { size: 64, weight: 700, align: 'center', color: '#fffaf0', outline: D.C.ink, ow: 8 });
      D.text(ctx, 'Find contentment in the world you live in.', W / 2, 240, { size: 26, weight: 600, align: 'center', color: '#ffe3f1' });
      D.text(ctx, 'Then build it a little better, one block at a time.', W / 2, 280, { size: 26, weight: 600, align: 'center', color: '#ffe3f1' });
      D.text(ctx, 'Cardboard Kingdom · a custom-built HTML5 engine · made with tape and hope', W / 2, 380, { size: 16, align: 'center', color: '#d9c3a3' });
      D.text(ctx, 'Rule 3: Don\'t stop playing.', W / 2, 330, { size: 20, weight: 700, align: 'center', color: '#ffd25a' });
      if (this.t > 2) D.text(ctx, 'Click / Z to keep exploring (free roam)', W / 2, 470, { size: 16, align: 'center', color: '#d9c3a3' });
      ctx.globalAlpha = 1;
    }
  }

  // ================================================================ PARTY / COSTUMES
  class PartyScreen {
    constructor(fromBench) {
      this.transparent = true;
      this.sel = 0;
      this.mode = 'member';
      this.csel = 0;
      this.fromBench = fromBench;
      this.t = 0;
    }
    update(dt) {
      this.t += dt;
      const G = CK.G;
      const owned = G.owned;
      if (this.mode === 'member') {
        const n = G.party.length;
        if (Input.hit('left')) { this.sel = (this.sel + n - 1) % n; CK.Audio.sfx('blip'); }
        if (Input.hit('right')) { this.sel = (this.sel + 1) % n; CK.Audio.sfx('blip'); }
        let pick = Input.hit('ok') ? this.sel : -1;
        if (Input.mouse.pressed) for (let i = 0; i < n; i++) if (D.inRect(Input.mouse.x, Input.mouse.y, ...this.mrect(i))) pick = i;
        if (pick >= 0) {
          this.sel = pick;
          this.mode = 'costume';
          this.csel = Math.max(0, owned.indexOf(G.party[pick].costume));
          CK.Audio.sfx('select');
        }
        if (Input.hit('back') || (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, W - 150, H - 60, 130, 44))) {
          CK.Audio.sfx('back');
          CK.Scenes.remove(this);
        }
      } else {
        const n = owned.length;
        if (Input.hit('left') || Input.hit('up')) { this.csel = (this.csel + n - 1) % n; CK.Audio.sfx('blip'); }
        if (Input.hit('right') || Input.hit('down')) { this.csel = (this.csel + 1) % n; CK.Audio.sfx('blip'); }
        let pick = Input.hit('ok') ? this.csel : -1;
        if (Input.mouse.pressed) owned.forEach((c, i) => { if (D.inRect(Input.mouse.x, Input.mouse.y, ...this.crect(i))) pick = i; });
        if (pick >= 0) {
          const c = owned[pick];
          const me = G.party[this.sel];
          const other = G.party.find((m) => m.costume === c && m !== me);
          if (other) other.costume = me.costume;
          me.costume = c;
          CK.healParty();
          CK.Audio.sfx('transform');
          this.mode = 'member';
        }
        if (Input.hit('back')) { this.mode = 'member'; CK.Audio.sfx('back'); }
      }
    }
    mrect(i) {
      const n = CK.G.party.length, w = (W - 120 - (n - 1) * 20) / n;
      return [60 + i * (w + 20), 80, w, 260];
    }
    crect(i) {
      return [60 + (i % 4) * 214, 360 + Math.floor(i / 4) * 52, 204, 44];
    }
    draw(ctx) {
      const G = CK.G;
      ctx.fillStyle = 'rgba(30,15,5,0.9)';
      ctx.fillRect(0, 0, W, H);
      D.text(ctx, 'Party & Costumes', 60, 56, { size: 30, weight: 700, color: '#fff', outline: D.C.ink });
      D.text(ctx, `Level ${G.level} · XP ${G.xp}/${CK.xpToNext(G.level)} · Armor: ${Data.reinforce[G.reinforce].name}`, 340, 54, { size: 16, weight: 600, color: '#ffe9a8' });
      G.party.forEach((m, i) => {
        const st = CK.stats(m);
        const [x, y, w] = this.mrect(i);
        const on = i === this.sel;
        D.panel(ctx, x, y, w, 260, { fill: on ? '#fff3b0' : '#fff4dc', tape: on });
        ctx.save();
        ctx.beginPath(); ctx.rect(x + 4, y + 4, w - 8, 200); ctx.clip();
        D.giant(ctx, m.costume, x + w / 2, y + 200, { s: w < 240 ? 0.6 : 0.7, who: m.id, mood: 'happy' });
        ctx.restore();
        D.text(ctx, st.name, x + 16, y + 226, { size: 18, weight: 700, color: D.C.text });
        D.text(ctx, `${Data.costumes[m.costume].name}  ·  HP ${st.maxHp}  ·  ATK ${st.atk}`, x + 16, y + 248, { size: D.T.small, weight: 600, color: D.C.textSoft });
      });
      if (this.mode === 'costume') {
        D.text(ctx, `Choose a costume for ${CK.stats(G.party[this.sel]).name}:`, 60, 350, { size: 18, weight: 700, color: '#fff', outline: D.C.ink });
        G.owned.forEach((c, i) => {
          const wearer = G.party.find((m) => m.costume === c);
          D.button(ctx, ...this.crect(i), Data.costumes[c].name + (wearer ? ` (${CK.stats(wearer).name.split(' ').pop()})` : ''), { hover: i === this.csel, size: 15 });
        });
        const cd = Data.costumes[G.owned[this.csel]];
        D.panel(ctx, 60, H - 76, 840, 56, { tape: false, fill: '#fff' });
        D.text(ctx, `${cd.special}: ${cd.desc}  (HP ${cd.hp >= 0 ? '+' : ''}${cd.hp}, ATK +${cd.atk})`, 76, H - 50, { size: D.T.small, weight: 600, color: D.C.text });
        const fp = Data.fieldPowers[G.owned[this.csel]];
        if (fp) D.text(ctx, 'Field power (worn by Sam' + (CK.coop ? ' or Jules' : '') + '): ' + fp, 76, H - 30, { size: D.T.small, weight: 600, color: '#2f5f8a' });
      } else {
        D.text(ctx, 'Pick a party member to change costume. Each costume has its own Special.', 60, 380, { size: 16, weight: 600, color: '#fff' });
        D.button(ctx, W - 150, H - 60, 130, 44, 'Done', { hover: true });
      }
    }
  }

  // ================================================================ WORKBENCH
  class Workbench {
    constructor() {
      this.transparent = true;
      const G = CK.G, next = Data.reinforce[G.reinforce + 1];
      // don't open with the cursor on a button you can't press yet
      this.sel = next && G.scraps >= next.cost ? 0 : 1;
      this.t = 0;
    }
    items() {
      const G = CK.G;
      const next = Data.reinforce[G.reinforce + 1];
      return [
        next ? `Reinforce to ${next.name} (${next.cost} scraps)` : 'Armor fully reinforced!',
        'Change costumes',
        'Rest & save',
        'Fold-out map (travel)',
        'Leave',
      ];
    }
    rects() {
      return this.items().map((s, i) => [W / 2 - 220, 230 + i * 54, 440, 46]);
    }
    update(dt) {
      this.t += dt;
      const items = this.items();
      listNav(this, items.length);
      let pick = clickList(this.rects(), this);
      if (Input.hit('ok')) pick = this.sel;
      if (Input.hit('back')) pick = 4;
      if (pick < 0) return;
      const G = CK.G;
      if (pick === 0) {
        const next = Data.reinforce[G.reinforce + 1];
        if (!next) return CK.Audio.sfx('error');
        if (G.scraps < next.cost) {
          CK.Audio.sfx('error');
          CK.toast(`Need ${next.cost - G.scraps} more scraps. Knock on doors and win battles!`);
          return;
        }
        G.scraps -= next.cost;
        G.reinforce++;
        CK.healParty();
        CK.Audio.sfx('tape');
        CK.Audio.sfx('levelup');
        CK.toast(`Armor reinforced: ${next.name}!`);
      } else if (pick === 1) {
        CK.Scenes.push(new PartyScreen(true));
      } else if (pick === 2) {
        CK.healParty();
        G.wet = 0;
        CK.saveGame();
        CK.Audio.sfx('heal');
        CK.toast('Rested and saved.');
      } else if (pick === 3) {
        CK.Scenes.remove(this);
        CK.runScript([CK.travelChoice('Unfold the map. Where to?')]);
      } else {
        CK.Audio.sfx('back');
        CK.Scenes.remove(this);
      }
    }
    draw(ctx) {
      const G = CK.G;
      ctx.fillStyle = D.C.scrim;
      ctx.fillRect(0, 0, W, H);
      D.panel(ctx, W / 2 - 260, 24, 520, 496, { fill: D.C.sheet });
      D.text(ctx, 'Cardboard Workbench', W / 2, 76, { size: 28, weight: 700, align: 'center', color: D.C.text });
      const cur = Data.reinforce[G.reinforce];
      D.text(ctx, `Armor: ${cur.name}  ·  Scraps: ${G.scraps}`, W / 2, 104, { size: D.T.ui, weight: 600, align: 'center', color: D.C.textSoft });
      const next = Data.reinforce[G.reinforce + 1] || cur;
      D.balance(ctx, '"' + next.fact + '"', 420, D.T.small, 500).slice(0, 3).forEach((l, i) => D.text(ctx, l, W / 2, 140 + i * 19, { size: D.T.small, weight: 500, align: 'center', color: D.C.text }));
      D.text(ctx, `Reinforcing adds defense and makes water attacks ${Math.round(next.water * 100)}% weaker.`, W / 2, 204, { size: D.T.small, align: 'center', color: D.C.textSoft });
      const items = this.items();
      this.rects().forEach((r, i) => D.button(ctx, ...r, items[i], { hover: i === this.sel, size: 17, disabled: i === 0 && (!Data.reinforce[G.reinforce + 1] || G.scraps < Data.reinforce[G.reinforce + 1].cost) }));
    }
  }
  CK.Workbench = Workbench;

  // ================================================================ JOURNAL
  class JournalScreen {
    constructor() {
      this.transparent = true;
    }
    update() {
      if (Input.hit('back') || Input.hit('ok') || Input.mouse.pressed) {
        CK.Audio.sfx('back');
        CK.Scenes.remove(this);
      }
    }
    draw(ctx) {
      ctx.fillStyle = D.C.scrim;
      ctx.fillRect(0, 0, W, H);
      D.panel(ctx, 80, 30, W - 160, H - 60, { fill: '#fffaf0' });
      D.text(ctx, "Sam's Journal", W / 2, 76, { size: 28, weight: 700, align: 'center', color: D.C.text });
      let y = 112;
      const entries = CK.G.journal.slice(-8);
      if (!entries.length) D.text(ctx, 'Nothing written yet.', W / 2, y, { size: 16, align: 'center' });
      for (const e of entries) {
        for (const l of D.wrap(ctx, '• ' + e, W - 240, 15, 500)) {
          D.text(ctx, l, 110, y, { size: 15, weight: 500, color: D.C.text });
          y += 20;
        }
        y += 8;
      }
    }
  }

  // ================================================================ PAUSE
  class PauseMenu {
    constructor() {
      this.transparent = true;
      this.sel = 0;
    }
    items() {
      return ['Resume', 'Party & Costumes', 'Friends', 'Stamps & Letters', 'Journal', 'Settings', 'Save game', 'Quit to title'];
    }
    rects() {
      // three groups: get back to playing / look at your stuff / leave. Gaps do the grouping.
      const gap = (i) => (i >= 1 ? 14 : 0) + (i >= 5 ? 14 : 0);
      return this.items().map((s, i) => [W / 2 - 140, 100 + i * 44 + gap(i), 280, 38]);
    }
    update() {
      const items = this.items();
      listNav(this, items.length);
      let pick = clickList(this.rects(), this);
      if (Input.hit('ok')) pick = this.sel;
      if (Input.hit('back')) pick = 0;
      if (pick < 0) return;
      CK.Audio.sfx('select');
      if (pick === 0) CK.Scenes.remove(this);
      else if (pick === 1) CK.Scenes.push(new PartyScreen(false));
      else if (pick === 2) CK.Scenes.push(new CK.FriendsScreen());
      else if (pick === 3) CK.Scenes.push(new CK.StampScreen());
      else if (pick === 4) CK.Scenes.push(new JournalScreen());
      else if (pick === 5) CK.Scenes.push(new CK.SettingsScreen());
      else if (pick === 6) CK.toast(CK.saveGame() ? 'Game saved!' : 'Could not save (browser storage blocked).');
      else if (pick === 7) {
        CK.saveGame();
        CK.flaps(() => CK.Scenes.replace(new TitleScene()));
      }
    }
    draw(ctx) {
      ctx.fillStyle = D.C.scrim;
      ctx.fillRect(0, 0, W, H);
      D.panel(ctx, W / 2 - 180, 24, 360, 496, { fill: D.C.sheet });
      D.text(ctx, 'Paused', W / 2, 74, { size: D.T.title, weight: 700, align: 'center', color: D.C.text });
      const items = this.items();
      this.rects().forEach((r, i) => D.button(ctx, ...r, items[i], { hover: i === this.sel, size: D.T.ui }));
      // where you are, so the menu doubles as a "what was I doing?" check
      const ow = CK.OW, obj = ow && ow.ch && ow.ch.objective ? ow.ch.objective(CK.G) : '';
      if (obj) D.text(ctx, D.wrap(ctx, obj, 300, D.T.small, 600)[0], W / 2, 500, { size: D.T.small, weight: 600, align: 'center', color: D.C.textSoft });
    }
  }
  CK.PauseMenu = PauseMenu;

  CK.TitleScene = TitleScene;
  CK.makeScene = function (name) {
    if (name === 'ending') return new EndingScene();
    if (name === 'title') return new TitleScene();
    if (name === 'credits') return new CreditsScene();
    return new DormScene();
  };
})();
