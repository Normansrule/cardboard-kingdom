// Cardboard Kingdom - tiny hand-built engine core.
// Loop, scenes, input, tweens, coroutines, particles, transitions, saving.
(function () {
  'use strict';
  const CK = (window.CK = window.CK || {});
  const W = (CK.W = 960);
  const H = (CK.H = 540);
  CK.FONT = '"Fredoka", "Trebuchet MS", "Comic Sans MS", sans-serif';

  // ---------------------------------------------------------------- utils
  const U = (CK.U = {
    clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
    lerp: (a, b, t) => a + (b - a) * t,
    rand: (a, b) => a + Math.random() * (b - a),
    randi: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
    approach: (v, t, d) => (v < t ? Math.min(v + d, t) : Math.max(v - d, t)),
    dist: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
    // deterministic 0..1 noise from integers
    hash(x, y, s) {
      let h = (x * 374761393 + y * 668265263 + (s || 0) * 1442695041) | 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
    },
  });

  CK.Ease = {
    linear: (t) => t,
    inQuad: (t) => t * t,
    outQuad: (t) => t * (2 - t),
    inOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    outCubic: (t) => --t * t * t + 1,
    inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    outBack: (t) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    outElastic: (t) =>
      t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1,
    outBounce: (t) => {
      const n = 7.5625, d = 2.75;
      if (t < 1 / d) return n * t * t;
      if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
      if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
      return n * (t -= 2.625 / d) * t + 0.984375;
    },
  };

  // --------------------------------------------------------------- tweens
  const tweens = [];
  CK.tween = function (obj, props, dur, ease, done) {
    const tw = { obj, from: {}, to: props, t: 0, dur: Math.max(dur, 0.0001), finished: false, done };
    tw.ease = typeof ease === 'function' ? ease : CK.Ease[ease || 'outQuad'];
    for (const k in props) tw.from[k] = obj[k];
    tweens.push(tw);
    return tw;
  };
  CK.updateTweens = function (dt) {
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i];
      tw.t += dt;
      const p = Math.min(1, tw.t / tw.dur);
      const e = tw.ease(p);
      for (const k in tw.to) tw.obj[k] = tw.from[k] + (tw.to[k] - tw.from[k]) * e;
      if (p >= 1) {
        tweens.splice(i, 1);
        tw.finished = true;
        tw.done && tw.done();
      }
    }
  };

  // ----------------------------------------------------------- coroutines
  // yield a number (seconds), a function (wait until it returns true),
  // or any object with .finished (tweens, other coroutines).
  const cos = [];
  class Co {
    constructor(genFn) {
      this.gen = genFn();
      this.wait = null;
      this.finished = false;
      this.value = undefined;
      this.advance();
    }
    ready(dt) {
      const w = this.wait;
      if (w == null) return true;
      if (typeof w === 'number') {
        this.wait -= dt;
        return this.wait <= 0;
      }
      if (typeof w === 'function') return !!w();
      if (typeof w === 'object' && 'finished' in w) return w.finished;
      return true;
    }
    advance() {
      let r;
      try {
        r = this.gen.next(this.value);
      } catch (e) {
        console.error(e);
        this.finished = true;
        return;
      }
      if (r.done) {
        this.finished = true;
        this.value = r.value;
        return;
      }
      this.wait = r.value;
    }
    update(dt) {
      if (this.finished) return;
      if (this.ready(dt)) this.advance();
    }
    cancel() {
      this.finished = true;
    }
  }
  CK.co = function (genFn) {
    const c = new Co(genFn);
    if (!c.finished) cos.push(c);
    return c;
  };
  CK.updateCos = function (dt) {
    for (let i = 0; i < cos.length; i++) cos[i].update(dt);
    for (let i = cos.length - 1; i >= 0; i--) if (cos[i].finished) cos.splice(i, 1);
  };

  // ---------------------------------------------------------------- input
  const KEYMAP = {
    up: ['ArrowUp', 'KeyW'],
    down: ['ArrowDown', 'KeyS'],
    left: ['ArrowLeft', 'KeyA'],
    right: ['ArrowRight', 'KeyD'],
    ok: ['Space', 'Enter', 'KeyZ', 'KeyE'],
    back: ['Escape', 'KeyX', 'Backspace'],
    menu: ['Escape', 'Tab'],
  };
  const Input = (CK.Input = {
    down: {},
    pressed: {},
    mouse: { x: 0, y: 0, down: false, pressed: false, rpressed: false, moved: false },
    virtual: {},
    vpressed: {},
    anyPressed: false,
    held(a) {
      if (this.virtual[a]) return true;
      return (KEYMAP[a] || [a]).some((k) => this.down[k]);
    },
    hit(a) {
      if (this.vpressed[a]) return true;
      return (KEYMAP[a] || [a]).some((k) => this.pressed[k]);
    },
    key(code) {
      return !!this.pressed[code];
    },
    consume() {
      this.pressed = {};
      this.vpressed = {};
      this.mouse.pressed = false;
      this.mouse.rpressed = false;
      this.anyPressed = false;
    },
  });

  // Two players on one keyboard (co-op). Player 1: WASD + Space/Z/E/F.
  // Player 2: arrows + Enter / . / /. Outside co-op both sets drive player 1.
  const PMAP = [
    { up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'], ok: ['Space', 'KeyZ', 'KeyE', 'KeyF'], back: ['KeyX', 'KeyQ', 'Escape'] },
    { up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'], ok: ['Enter', 'Period', 'Slash', 'ShiftRight', 'Numpad0'], back: ['Backspace', 'Comma'] },
  ];
  CK.coop = false;
  Input.p = function (n) {
    if (!CK.coop) return Input;
    const map = PMAP[n] || PMAP[0];
    return {
      held: (a) => (n === 0 && Input.virtual[a]) || (map[a] || []).some((k) => Input.down[k]),
      hit: (a) => (n === 0 && Input.vpressed[a]) || (map[a] || []).some((k) => Input.pressed[k]),
    };
  };

  // ------------------------------------------------------------- particles
  class Particles {
    constructor() {
      this.list = [];
    }
    emit(o) {
      const p = Object.assign(
        { x: 0, y: 0, vx: 0, vy: 0, life: 1, size: 4, color: '#fff', shape: 'circle', g: 0, drag: 0, spin: 0, rot: 0, fade: true, grow: 0, sway: 0 },
        o
      );
      p.max = p.life;
      p.rot = p.rot || Math.random() * 6.28;
      p.ph = Math.random() * 6.28;
      this.list.push(p);
      return p;
    }
    burst(n, f) {
      for (let i = 0; i < n; i++) this.emit(f(i));
    }
    update(dt) {
      for (let i = this.list.length - 1; i >= 0; i--) {
        const p = this.list[i];
        p.life -= dt;
        if (p.life <= 0) {
          this.list.splice(i, 1);
          continue;
        }
        p.vy += p.g * dt;
        p.vx *= 1 - p.drag * dt;
        p.vy *= 1 - p.drag * dt;
        p.ph += dt * 2;
        p.x += (p.vx + Math.sin(p.ph) * p.sway) * dt;
        p.y += p.vy * dt;
        p.rot += p.spin * dt;
        p.size += p.grow * dt;
      }
    }
    draw(ctx, ox = 0, oy = 0) {
      for (const p of this.list) {
        const a = p.fade ? Math.min(1, (p.life / p.max) * 2) : 1;
        ctx.globalAlpha = a * (p.alpha == null ? 1 : p.alpha);
        CK.D.particle(ctx, p, p.x - ox, p.y - oy);
      }
      ctx.globalAlpha = 1;
    }
  }
  CK.Particles = Particles;

  // ------------------------------------------------------------- scenes
  const Scenes = (CK.Scenes = {
    stack: [],
    push(s) {
      this.stack.push(s);
      s.enter && s.enter();
      return s;
    },
    pop() {
      const s = this.stack.pop();
      s && s.exit && s.exit();
      return s;
    },
    remove(s) {
      const i = this.stack.indexOf(s);
      if (i >= 0) {
        this.stack.splice(i, 1);
        s.exit && s.exit();
      }
    },
    replace(s) {
      while (this.stack.length) this.pop();
      return this.push(s);
    },
    top() {
      return this.stack[this.stack.length - 1];
    },
    find(pred) {
      return this.stack.find(pred);
    },
    update(dt) {
      const top = this.top();
      const list = this.stack.slice();
      for (const s of list) if (s === top || s.alwaysUpdate) s.update(dt, s === top);
    },
    draw(ctx) {
      let i = this.stack.length - 1;
      while (i > 0 && this.stack[i].transparent) i--;
      for (; i < this.stack.length; i++) if (i >= 0) this.stack[i].draw(ctx);
    },
  });

  // --------------------------------------------------------- transitions
  // "Box flaps" close over the screen, swap, then open.
  const Trans = (CK.Trans = { p: 0, busy: false, label: '' });
  CK.flaps = function (midFn, opts = {}) {
    const done = { finished: false };
    Trans.busy = true;
    Trans.label = opts.label || '';
    CK.co(function* () {
      CK.Audio.sfx('whoosh');
      yield CK.tween(Trans, { p: 1 }, opts.close || 0.35, 'inQuad');
      if (midFn) midFn();
      yield opts.hold || 0.15;
      yield CK.tween(Trans, { p: 0 }, opts.open || 0.4, 'outQuad');
      Trans.busy = false;
      Trans.label = '';
      done.finished = true;
    });
    return done;
  };
  function drawTrans(ctx) {
    if (Trans.p <= 0.001) return;
    const hh = (H / 2) * Trans.p;
    CK.D.cardboard(ctx, -10, hh - H / 2 - 10, W + 20, H / 2 + 10, { r: 0, seed: 7, lw: 5 });
    CK.D.cardboard(ctx, -10, H - hh, W + 20, H / 2 + 10, { r: 0, seed: 9, lw: 5 });
    if (Trans.p > 0.85) {
      CK.D.tape(ctx, W / 2 - 220, H / 2 - 18, 440, 36, 0, 0.9);
      if (Trans.label) CK.D.text(ctx, Trans.label, W / 2, H / 2 + 8, { size: 22, align: 'center', color: '#5b3a1e' });
    }
  }

  // ------------------------------------------------------------- saving
  CK.Save = {
    key: 'cardboard_kingdom_save_v1',
    write(data) {
      try {
        localStorage.setItem(this.key, JSON.stringify(data));
        return true;
      } catch (e) {
        return false;
      }
    },
    read() {
      try {
        const s = localStorage.getItem(this.key);
        return s ? JSON.parse(s) : null;
      } catch (e) {
        return null;
      }
    },
    clear() {
      try {
        localStorage.removeItem(this.key);
      } catch (e) {}
    },
  };

  // ------------------------------------------------------------- toasts
  const toasts = [];
  CK.toast = function (text, color) {
    toasts.push({ text, color: color || '#fffaf0', t: 0 });
    if (toasts.length > 4) toasts.shift();
  };
  CK.clearToasts = () => (toasts.length = 0); // for automated screenshots
  function drawToasts(ctx, dt) {
    let y = 70;
    for (let i = toasts.length - 1; i >= 0; i--) {
      const t = toasts[i];
      t.t += dt;
      if (t.t > 3) {
        toasts.splice(i, 1);
        continue;
      }
    }
    for (const t of toasts) {
      const a = Math.min(1, t.t * 4, (3 - t.t) * 2);
      const slide = (1 - Math.min(1, t.t * 5)) * 30;
      ctx.globalAlpha = a;
      ctx.font = `600 18px ${CK.FONT}`;
      const w = ctx.measureText(t.text).width + 36;
      CK.D.panel(ctx, W / 2 - w / 2, y - slide, w, 36, { seed: 3 });
      CK.D.text(ctx, t.text, W / 2, y - slide + 24, { size: 18, align: 'center', color: '#4a2c17' });
      ctx.globalAlpha = 1;
      y += 42;
    }
  }

  // ---------------------------------------------------------- touch pad
  const Touch = (CK.Touch = { enabled: false, sticks: {} });
  const PAD = { x: 110, y: H - 110, r: 70 };
  const BTN = { ok: { x: W - 90, y: H - 100, r: 38, label: 'A' }, back: { x: W - 175, y: H - 60, r: 30, label: 'B' } };
  function drawTouch(ctx) {
    if (!Touch.enabled || !CK.showTouchPad) return;
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(PAD.x, PAD.y, PAD.r, 0, 6.28);
    ctx.fill();
    for (const k in BTN) {
      const b = BTN[k];
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, 6.28);
      ctx.fill();
    }
    ctx.globalAlpha = 0.8;
    for (const k in BTN) CK.D.text(ctx, BTN[k].label, BTN[k].x, BTN[k].y + 8, { size: 24, align: 'center', color: '#4a2c17' });
    ctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- boot
  let canvas, ctx, scale = 1;
  CK.boot = function (firstScene) {
    canvas = document.getElementById('game');
    ctx = canvas.getContext('2d');
    CK.canvas = canvas;
    CK.ctx = ctx;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const s = Math.min(window.innerWidth / W, window.innerHeight / H);
      canvas.style.width = W * s + 'px';
      canvas.style.height = H * s + 'px';
      canvas.width = Math.round(W * s * dpr);
      canvas.height = Math.round(H * s * dpr);
      scale = s * dpr;
    }
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('keydown', (e) => {
      CK.Audio.init();
      if (!Input.down[e.code]) {
        Input.pressed[e.code] = true;
        Input.anyPressed = true;
      }
      Input.down[e.code] = true;
      if (e.code === 'KeyM') CK.Audio.toggleMute();
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab', 'Backspace'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      Input.down[e.code] = false;
    });
    window.addEventListener('blur', () => {
      Input.down = {};
      Input.virtual = {};
    });
    function toLocal(cx, cy) {
      const r = canvas.getBoundingClientRect();
      return [((cx - r.left) / r.width) * W, ((cy - r.top) / r.height) * H];
    }
    canvas.addEventListener('mousemove', (e) => {
      [Input.mouse.x, Input.mouse.y] = toLocal(e.clientX, e.clientY);
      Input.mouse.moved = true;
    });
    canvas.addEventListener('mousedown', (e) => {
      CK.Audio.init();
      [Input.mouse.x, Input.mouse.y] = toLocal(e.clientX, e.clientY);
      if (e.button === 2) Input.mouse.rpressed = true;
      else {
        Input.mouse.down = true;
        Input.mouse.pressed = true;
      }
      Input.anyPressed = true;
    });
    window.addEventListener('mouseup', () => (Input.mouse.down = false));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // touch: virtual stick + buttons, taps act as clicks elsewhere
    function handleTouches(e) {
      e.preventDefault();
      CK.Audio.init();
      Touch.enabled = true;
      const v = { up: false, down: false, left: false, right: false, ok: false, back: false };
      for (const t of e.touches) {
        const [x, y] = toLocal(t.clientX, t.clientY);
        if (CK.showTouchPad && Math.hypot(x - PAD.x, y - PAD.y) < PAD.r * 1.4) {
          const dx = x - PAD.x, dy = y - PAD.y;
          if (dx < -18) v.left = true;
          if (dx > 18) v.right = true;
          if (dy < -18) v.up = true;
          if (dy > 18) v.down = true;
          continue;
        }
        let onBtn = false;
        if (CK.showTouchPad)
          for (const k in BTN)
            if (Math.hypot(x - BTN[k].x, y - BTN[k].y) < BTN[k].r * 1.3) {
              v[k] = true;
              onBtn = true;
            }
        if (!onBtn) {
          Input.mouse.x = x;
          Input.mouse.y = y;
        }
      }
      for (const k in v) {
        if (v[k] && !Input.virtual[k]) {
          Input.vpressed[k] = true;
          Input.anyPressed = true;
        }
        Input.virtual[k] = v[k];
      }
    }
    canvas.addEventListener('touchstart', (e) => {
      const before = e.touches.length;
      handleTouches(e);
      const t = e.changedTouches[0];
      const [x, y] = toLocal(t.clientX, t.clientY);
      const onPad = CK.showTouchPad && (Math.hypot(x - PAD.x, y - PAD.y) < PAD.r * 1.4 || Object.values(BTN).some((b) => Math.hypot(x - b.x, y - b.y) < b.r * 1.3));
      if (!onPad && before) {
        Input.mouse.x = x;
        Input.mouse.y = y;
        Input.mouse.pressed = true;
        Input.mouse.down = true;
        Input.anyPressed = true;
      }
    }, { passive: false });
    canvas.addEventListener('touchmove', handleTouches, { passive: false });
    canvas.addEventListener('touchend', (e) => {
      handleTouches(e);
      if (!e.touches.length) Input.mouse.down = false;
    }, { passive: false });

    Scenes.push(firstScene);

    let last = performance.now();
    let acc = 0;
    const STEP = 1 / 60;
    CK.time = 0;
    function frame(now) {
      let dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      acc += dt;
      let steps = 0;
      while (acc >= STEP && steps < 5) {
        CK.time += STEP;
        CK.updateTweens(STEP);
        CK.updateCos(STEP);
        Scenes.update(STEP);
        CK.Audio.update();
        Input.consume();
        acc -= STEP;
        steps++;
      }
      if (steps >= 5) acc = 0;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, W, H);
      try {
        Scenes.draw(ctx);
      } catch (e) {
        console.error(e);
      }
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      drawTouch(ctx);
      drawToasts(ctx, dt);
      drawTrans(ctx);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  // headless stepping for automated tests
  CK.step = function (seconds) {
    const STEP = 1 / 60;
    for (let t = 0; t < seconds; t += STEP) {
      CK.time += STEP;
      CK.updateTweens(STEP);
      CK.updateCos(STEP);
      Scenes.update(STEP);
      Input.consume();
    }
  };
})();
