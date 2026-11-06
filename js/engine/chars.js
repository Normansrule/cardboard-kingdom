// Cardboard Kingdom - characters, battle costumes and monsters.
//
// Art direction (v2.1):
//  * Kids and the cardboard knights use Costume Quest proportions: a big round head, a small body,
//    dot eyes and rosy cheeks, with homemade cardboard costumes worn over their clothes.
//  * Monsters are a little spooky (glowing eyes, toothy grins, fins and horns) but round and soft.
//    Once they calm down the glow fades and they get ordinary friendly eyes.
//  * The Silver Quill Society look like ordinary, tidy birds in suits: normal eyes, a silver quill pin.
//  * Everything is lit from the upper left and shaded with D.ball / D.vg / D.box3 for a 2.5D diorama look.
(function () {
  'use strict';
  const CK = window.CK;
  const U = CK.U;
  const D = CK.D;
  const C = D.C;
  const eyes = D.eyes;
  const CH = (D.chars = {});
  const TAU = Math.PI * 2;

  // shade a hex colour and keep it hex, so it can feed another gradient
  function hexShade(col, amt) {
    const m = D.shade(col, amt).match(/\d+/g);
    return '#' + m.slice(0, 3).map((v) => (+v).toString(16).padStart(2, '0')).join('');
  }
  D.hexShade = hexShade;

  function stroke(ctx, lw, col) {
    ctx.strokeStyle = col || C.ink;
    ctx.lineWidth = lw || 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // ------------------------------------------------------------ faces
  // Costume Quest face: small dark oval eyes set low, big pink cheeks, a tiny mouth.
  // (x, y) is the middle of the face; s = 1 suits a head of radius 18.
  function cqFace(ctx, x, y, s, o = {}) {
    const mood = o.mood;
    const sp = 6.4 * s;
    const ey = y + 1 * s;
    const blink = Math.sin(CK.time * 1.3 + (o.seed || 0) * 1.7) > 0.986;
    // cheeks first so the eyes sit on top
    D.ellipse(ctx, x - 10 * s, y + 6 * s, 3.8 * s, 2.5 * s, 'rgba(255,105,120,0.42)');
    D.ellipse(ctx, x + 10 * s, y + 6 * s, 3.8 * s, 2.5 * s, 'rgba(255,105,120,0.42)');
    ctx.lineCap = 'round';
    if (mood === 'happy') {
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 2.2 * Math.max(0.6, s);
      ctx.beginPath();
      ctx.arc(x - sp, ey + 1.5 * s, 2.8 * s, Math.PI * 1.1, Math.PI * 1.9);
      ctx.moveTo(x + sp + 2.8 * s * Math.cos(Math.PI * 1.1), ey + 1.5 * s + 2.8 * s * Math.sin(Math.PI * 1.1));
      ctx.arc(x + sp, ey + 1.5 * s, 2.8 * s, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else if (blink) {
      D.line(ctx, x - sp - 2.4 * s, ey, x - sp + 2.4 * s, ey, C.ink, 2 * Math.max(0.6, s));
      D.line(ctx, x + sp - 2.4 * s, ey, x + sp + 2.4 * s, ey, C.ink, 2 * Math.max(0.6, s));
    } else {
      const ry = (mood === 'shock' ? 3.9 : 3.3) * s;
      D.ellipse(ctx, x - sp, ey, 2.4 * s, ry, '#2b1a10');
      D.ellipse(ctx, x + sp, ey, 2.4 * s, ry, '#2b1a10');
      D.circle(ctx, x - sp + 0.8 * s, ey - 1.3 * s, 0.95 * s, '#fff');
      D.circle(ctx, x + sp + 0.8 * s, ey - 1.3 * s, 0.95 * s, '#fff');
    }
    const bw = 1.8 * Math.max(0.6, s);
    if (mood === 'sad') {
      D.line(ctx, x - sp - 3 * s, ey - 5 * s, x - sp + 2.5 * s, ey - 6.5 * s, C.ink, bw);
      D.line(ctx, x + sp + 3 * s, ey - 5 * s, x + sp - 2.5 * s, ey - 6.5 * s, C.ink, bw);
    } else if (mood === 'angry') {
      D.line(ctx, x - sp - 3 * s, ey - 6.5 * s, x - sp + 2.5 * s, ey - 4.5 * s, C.ink, bw);
      D.line(ctx, x + sp + 3 * s, ey - 6.5 * s, x + sp - 2.5 * s, ey - 4.5 * s, C.ink, bw);
    } else if (mood === 'shock') {
      D.line(ctx, x - sp - 2.5 * s, ey - 7 * s, x - sp + 2.5 * s, ey - 7.5 * s, C.ink, bw);
      D.line(ctx, x + sp + 2.5 * s, ey - 7 * s, x + sp - 2.5 * s, ey - 7.5 * s, C.ink, bw);
    }
    const my = y + 7.5 * s;
    if (mood === 'shock') D.ellipse(ctx, x, my + 1 * s, 2 * s, 2.6 * s, '#7a2a2a', C.ink, 1.4);
    else if (mood === 'sad') {
      ctx.beginPath(); ctx.arc(x, my + 3 * s, 3 * s, Math.PI * 1.2, Math.PI * 1.8); stroke(ctx, 1.8 * Math.max(0.6, s));
    } else if (mood === 'angry') {
      // determined little grin
      ctx.beginPath(); ctx.moveTo(x - 3.5 * s, my); ctx.quadraticCurveTo(x, my + 4.5 * s, x + 3.5 * s, my); ctx.closePath();
      ctx.fillStyle = '#7a2a2a'; ctx.fill(); stroke(ctx, 1.4 * Math.max(0.6, s));
      D.rr(ctx, x - 2.4 * s, my, 4.8 * s, 1.4 * s, 0.5 * s); ctx.fillStyle = '#fff'; ctx.fill();
    } else if (mood === 'happy') {
      ctx.beginPath(); ctx.moveTo(x - 4 * s, my - 0.5 * s); ctx.quadraticCurveTo(x, my + 5.5 * s, x + 4 * s, my - 0.5 * s); ctx.closePath();
      ctx.fillStyle = '#7a2a2a'; ctx.fill(); stroke(ctx, 1.4 * Math.max(0.6, s));
      D.ellipse(ctx, x, my + 2.4 * s, 1.8 * s, 1 * s, '#ff8fa0');
    } else {
      ctx.beginPath(); ctx.arc(x, my - 1 * s, 2.8 * s, Math.PI * 0.2, Math.PI * 0.8); stroke(ctx, 1.8 * Math.max(0.6, s));
    }
  }
  D.cqFace = cqFace;

  // Monster eyes: glowing and a bit spooky when angry, ordinary and friendly otherwise.
  function monsterEyes(ctx, x, y, sp, r, o = {}) {
    const scary = o.mood === 'angry';
    if (!scary) {
      eyes(ctx, x, y, sp, r * 0.62, { seed: o.seed, sad: o.mood === 'sad', happy: o.mood === 'happy' });
      return;
    }
    const glow = o.glow || '255,236,120';
    const pulse = 0.75 + Math.sin(CK.time * 3 + (o.seed || 0)) * 0.25;
    for (const ex of [x - sp, x + sp]) {
      const g = ctx.createRadialGradient(ex, y, r * 0.2, ex, y, r * 2.4);
      g.addColorStop(0, `rgba(${glow},${0.55 * pulse})`);
      g.addColorStop(1, `rgba(${glow},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(ex - r * 2.4, y - r * 2.4, r * 4.8, r * 4.8);
    }
    const blink = Math.sin(CK.time * 1.1 + (o.seed || 0) * 2.3) > 0.985;
    for (const side of [-1, 1]) {
      const ex = x + side * sp;
      if (blink) { D.line(ctx, ex - r, y, ex + r, y, C.ink, 2); continue; }
      // almond eye, tilted for a mischievous look
      ctx.save();
      ctx.translate(ex, y);
      ctx.rotate(side * 0.18);
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.78, 0, 0, TAU);
      ctx.fillStyle = `rgb(${o.glow ? glow : '255,246,170'})`;
      ctx.fill();
      stroke(ctx, Math.max(1.5, r * 0.32));
      const look = Math.sin(CK.time * 0.7 + (o.seed || 0)) * r * 0.2;
      D.ellipse(ctx, look, r * 0.05, r * 0.32, r * 0.62, '#2b1a10');
      D.circle(ctx, look + r * 0.15, -r * 0.3, r * 0.15, '#fff');
      ctx.restore();
      // heavy brow
      D.line(ctx, ex - side * r * 1.2, y - r * 1.25, ex + side * r * 0.9, y - r * 0.75, C.ink, Math.max(2, r * 0.45));
    }
  }
  D.monsterEyes = monsterEyes;

  // Wide toothy grin when angry; a soft smile otherwise.
  function monsterGrin(ctx, x, y, w, o = {}) {
    if (o.mood !== 'angry') {
      D.mouth(ctx, x, y, w * 0.45, o.mood === 'sad' ? 'sad' : 'smile');
      return;
    }
    const h = w * 0.42;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.quadraticCurveTo(x, y + h * 0.15, x + w / 2, y);
    ctx.quadraticCurveTo(x + w * 0.3, y + h * 1.3, x, y + h * 1.2);
    ctx.quadraticCurveTo(x - w * 0.3, y + h * 1.3, x - w / 2, y);
    ctx.closePath();
    ctx.fillStyle = '#3a1428';
    ctx.fill();
    ctx.save();
    ctx.clip();
    D.ellipse(ctx, x, y + h * 1.15, w * 0.22, h * 0.4, '#ff7f9a');
    // little triangle teeth along the top lip
    const n = o.teeth || 5;
    ctx.fillStyle = '#fffaf0';
    for (let i = 0; i < n; i++) {
      const tx = x - w / 2 + (w * (i + 0.5)) / n;
      const ty = y + h * 0.08;
      ctx.beginPath();
      ctx.moveTo(tx - w / n / 2.2, ty - 2);
      ctx.lineTo(tx + w / n / 2.2, ty - 2);
      ctx.lineTo(tx, ty + h * 0.5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.quadraticCurveTo(x, y + h * 0.15, x + w / 2, y);
    ctx.quadraticCurveTo(x + w * 0.3, y + h * 1.3, x, y + h * 1.2);
    ctx.quadraticCurveTo(x - w * 0.3, y + h * 1.3, x - w / 2, y);
    stroke(ctx, Math.max(1.5, w * 0.08));
    // one cheeky fang poking up from the bottom
    if (o.fang !== false) D.poly(ctx, [x + w * 0.18, y + h * 1.12, x + w * 0.28, y + h * 1.12, x + w * 0.23, y + h * 0.62], '#fffaf0', C.ink, 1.2);
  }
  D.monsterGrin = monsterGrin;

  // ---------------------------------------------------------- humans
  // Every kid, student and grown-up is built from this.
  // o: s, dir, walk, mood, skin, hair, style, top, pants, shoes, glasses, cardigan, hood, suit, tie, beard, adult, costume
  function kid(ctx, x, y, o) {
    const s = o.s || 1;
    const dir = o.dir || 'down';
    const walk = o.walk || 0;
    const adult = !!o.adult;
    const legH = (adult ? 11 : 7.5) * s;
    const bodyH = (adult ? 25 : 16) * s;
    const headR = (adult ? 15.5 : 18) * s;
    const bob = Math.abs(Math.sin(walk)) * 2 * s;
    const ground = y;
    y -= bob;
    const skin = o.skin || '#f2c9a0';
    const top = o.top || '#8a8a9a';
    const hair = o.hair || '#2b2b2b';
    const st = o.style || 'short';
    const side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    // legs and shoes
    const sw = Math.sin(walk) * 3 * s;
    for (const k of [-1, 1]) {
      const lift = k < 0 ? Math.max(0, sw) : Math.max(0, -sw);
      const lx = x + k * 4.6 * s;
      D.rr(ctx, lx - 3 * s, ground - legH - lift - 1 * s, 6 * s, legH, 2 * s);
      ctx.fillStyle = o.pants || '#4b4b5a';
      ctx.fill();
      stroke(ctx, 1.6);
      D.egg(ctx, lx + (side || k) * 0.8 * s, ground - lift - 1.6 * s, 4.4 * s, 2.7 * s, o.shoes || '#3a2c2a', { lw: 1.6 });
    }
    const tTop = y - legH - bodyH;
    const tBot = y - legH + 2 * s;
    // hood (behind the head)
    if (o.hood && !o.costume) D.egg(ctx, x - side * 2 * s, tTop + 1 * s, 13 * s, 6 * s, hexShade(top, -0.12), { lw: 2 });
    // arms swing opposite to the legs
    for (const k of [-1, 1]) {
      const ax = x + k * 12.5 * s;
      const ay = tTop + 8 * s + (k < 0 ? -sw : sw) * 0.5;
      D.egg(ctx, ax, ay, 3.8 * s, 7 * s, o.suit || top, { rot: -k * 0.25, lw: 1.8 });
      D.ball(ctx, ax + k * 1.2 * s, ay + 6.5 * s, 2.8 * s, skin, { lw: 1.5 });
    }
    // torso: a soft rounded tunic, a little wider at the hem
    ctx.beginPath();
    ctx.moveTo(x - 9.5 * s, tTop);
    ctx.quadraticCurveTo(x, tTop - 3 * s, x + 9.5 * s, tTop);
    ctx.quadraticCurveTo(x + 12.5 * s, tTop + bodyH * 0.5, x + 12 * s, tBot);
    ctx.quadraticCurveTo(x, tBot + 2.5 * s, x - 12 * s, tBot);
    ctx.quadraticCurveTo(x - 12.5 * s, tTop + bodyH * 0.5, x - 9.5 * s, tTop);
    ctx.closePath();
    D.fillVol(ctx, x, (tTop + tBot) / 2, 15 * s, o.suit || top, 2);
    if (dir !== 'up') {
      if (o.suit) {
        // shirt, tie and lapels
        D.poly(ctx, [x - 5 * s, tTop, x + 5 * s, tTop, x, tTop + bodyH * 0.55], '#fffaf0', C.ink, 1.3);
        D.poly(ctx, [x - 1.6 * s, tTop + 1.5 * s, x + 1.6 * s, tTop + 1.5 * s, x + 1.2 * s, tTop + bodyH * 0.5, x, tTop + bodyH * 0.58, x - 1.2 * s, tTop + bodyH * 0.5], o.tie || '#c9d3e0', C.ink, 1);
        D.line(ctx, x - 5 * s, tTop, x - 2 * s, tTop + bodyH * 0.6, C.ink, 1.3);
        D.line(ctx, x + 5 * s, tTop, x + 2 * s, tTop + bodyH * 0.6, C.ink, 1.3);
        if (o.pin) D.icon(ctx, 'feather', x - 6 * s, tTop + 6 * s, 0.38 * s);
      } else if (o.cardigan) {
        D.line(ctx, x - 3.5 * s, tTop + 1 * s, x - 3.5 * s, tBot, o.cardigan, 3.2 * s);
        D.line(ctx, x + 3.5 * s, tTop + 1 * s, x + 3.5 * s, tBot, o.cardigan, 3.2 * s);
      } else if (o.hood && !o.costume) {
        D.line(ctx, x - 3 * s, tTop + 2 * s, x - 3.5 * s, tTop + 8 * s, '#fffaf0', 1.4);
        D.line(ctx, x + 3 * s, tTop + 2 * s, x + 3.5 * s, tTop + 8 * s, '#fffaf0', 1.4);
        D.rr(ctx, x - 6 * s, tTop + bodyH * 0.55, 12 * s, 4 * s, 2 * s);
        ctx.fillStyle = 'rgba(0,0,0,.12)';
        ctx.fill();
      }
    }
    if (o.costume) D.costumeBody(ctx, o.costume, x, tTop, tBot, s, dir);
    // head
    const hx = x + side * 1.5 * s;
    const hy = tTop - headR + 4.5 * s;
    if (st === 'puff') {
      D.ball(ctx, hx - headR * 0.9, hy - headR * 0.62, headR * 0.5, hair);
      D.ball(ctx, hx + headR * 0.9, hy - headR * 0.62, headR * 0.5, hair);
    }
    if (st === 'long') {
      D.rr(ctx, hx - headR * 1.05, hy - headR * 0.3, headR * 2.1, headR * 1.45, headR * 0.5);
      D.fillVol(ctx, hx, hy, headR * 1.3, hair, 2);
    }
    if (st === 'bun' || st === 'grey') D.ball(ctx, hx, hy - headR * 1.05, headR * 0.38, hair);
    // ears
    if (dir !== 'up') {
      if (side >= 0) D.ball(ctx, hx - headR * 0.96, hy + 2 * s, 3.4 * s, skin, { lw: 1.6 });
      if (side <= 0) D.ball(ctx, hx + headR * 0.96, hy + 2 * s, 3.4 * s, skin, { lw: 1.6 });
    }
    D.ball(ctx, hx, hy, headR, skin, { lw: 2.2, k: 0.6 });
    // hair
    if (dir === 'up') {
      D.ball(ctx, hx, hy - 0.5 * s, headR + 1 * s, hair, { lw: 2.2 });
    } else {
      hairFront(ctx, st, hx, hy, headR, hair, side, s);
    }
    if (dir !== 'up') {
      const fx = hx + side * 4.5 * s;
      if (o.beard) {
        ctx.beginPath();
        ctx.arc(fx, hy + 4 * s, headR * 0.72, Math.PI * 0.12, Math.PI * 0.88);
        ctx.quadraticCurveTo(fx, hy + headR * 1.1, fx + headR * 0.72 * Math.cos(Math.PI * 0.12), hy + 4 * s + headR * 0.72 * Math.sin(Math.PI * 0.12));
        ctx.fillStyle = o.beard;
        ctx.fill();
      }
      cqFace(ctx, fx, hy + 2.5 * s, headR / 18, { mood: o.mood, seed: o.seed });
      if (o.glasses) {
        const gs = headR / 18;
        ctx.beginPath();
        ctx.arc(fx - 6.4 * gs, hy + 3.5 * s, 4.8 * gs, 0, TAU);
        ctx.moveTo(fx + 6.4 * gs + 4.8 * gs, hy + 3.5 * s);
        ctx.arc(fx + 6.4 * gs, hy + 3.5 * s, 4.8 * gs, 0, TAU);
        ctx.moveTo(fx - 1.6 * gs, hy + 3 * s);
        ctx.lineTo(fx + 1.6 * gs, hy + 3 * s);
        stroke(ctx, 1.6, o.glasses === true ? C.ink : o.glasses);
        D.line(ctx, fx - 8.5 * gs, hy + 1 * s, fx - 6.5 * gs, hy - 0.5 * s, 'rgba(255,255,255,.8)', 1.2);
      }
    }
    if (o.costume) D.costumeHat(ctx, o.costume, hx, hy + 1.5 * s, s * 1.18, dir);
    return { hx, hy, headR };
  }
  D.kid = kid;

  function hairFront(ctx, st, x, y, r, hair, side, s) {
    ctx.beginPath();
    if (st === 'mop') {
      // messy fringe with a cowlick
      ctx.arc(x, y - 1 * s, r + 1.5 * s, Math.PI * 1.02, Math.PI * 1.98);
      const pts = [0.95, 0.7, 0.45, 0.2, -0.05, -0.3, -0.55, -0.8, -0.98];
      for (let i = 0; i < pts.length; i++) {
        const px = x + pts[i] * r + side * 2 * s;
        const py = y - r * 0.18 + (i % 2 ? -r * 0.22 : r * 0.02);
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      D.fillVol(ctx, x, y - r * 0.6, r, hair, 2.2);
      ctx.beginPath();
      ctx.moveTo(x - 2 * s, y - r - 0.5 * s);
      ctx.quadraticCurveTo(x + 2 * s, y - r - 9 * s, x + 7 * s, y - r - 5 * s);
      ctx.quadraticCurveTo(x + 3 * s, y - r - 3 * s, x + 2 * s, y - r);
      D.fillVol(ctx, x, y - r, r * 0.5, hair, 1.8);
      return;
    }
    if (st === 'grey') {
      // soft curls
      for (let i = 0; i < 7; i++) {
        const a = Math.PI * (1.02 + i * 0.16);
        D.ball(ctx, x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.8 - 1 * s, r * 0.3, hair, { lw: 1.6 });
      }
      return;
    }
    if (st === 'side') {
      // a neat side part with a swoop
      ctx.arc(x, y - 1 * s, r + 1 * s, Math.PI * 0.98, Math.PI * 2.02);
      ctx.quadraticCurveTo(x + r * 0.3, y - r * 0.55, x - r * 0.35, y - r * 0.62);
      ctx.quadraticCurveTo(x - r * 0.7, y - r * 0.3, x - r - 1 * s, y);
      ctx.closePath();
      D.fillVol(ctx, x, y - r * 0.6, r, hair, 2.2);
      D.line(ctx, x - r * 0.35, y - r * 0.62, x - r * 0.2, y - r * 0.98, 'rgba(0,0,0,.3)', 1.4);
      return;
    }
    if (st === 'puff' || st === 'bun' || st === 'long') {
      ctx.arc(x, y - 1 * s, r + 1 * s, Math.PI * 1.0, Math.PI * 2.0);
      ctx.quadraticCurveTo(x + r * 0.5, y - r * 0.35, x, y - r * 0.5);
      ctx.quadraticCurveTo(x - r * 0.5, y - r * 0.35, x - r - 1 * s, y - 1 * s);
      ctx.closePath();
      D.fillVol(ctx, x, y - r * 0.6, r, hair, 2.2);
      return;
    }
    // short
    ctx.arc(x, y - 1 * s, r + 1 * s, Math.PI * 1.0, Math.PI * 2.0);
    ctx.quadraticCurveTo(x + r * 0.4, y - r * 0.6, x - r * 0.2, y - r * 0.45);
    ctx.quadraticCurveTo(x - r * 0.7, y - r * 0.35, x - r - 1 * s, y - 1 * s);
    ctx.closePath();
    D.fillVol(ctx, x, y - r * 0.6, r, hair, 2.2);
  }

  CH.sam = (ctx, x, y, o) => kid(ctx, x, y, Object.assign({ hair: '#6b4426', style: 'mop', skin: '#f2c9a0', top: o.night ? '#5a6fb0' : '#6c8ed8', hood: true, pants: '#3f4f73', shoes: '#f3eee4', seed: 1 }, o));
  CH.jules = (ctx, x, y, o) => kid(ctx, x, y, Object.assign({ hair: '#1f1a17', style: 'puff', skin: '#a8714a', top: o.night ? '#3e8a64' : '#4fb07f', pants: '#3d3a52', shoes: '#ef6b6b', seed: 7 }, o));
  CH.human = (ctx, x, y, o) => kid(ctx, x, y, Object.assign({ skin: '#e8b48a', seed: 4 }, o));
  CH.okafor = (ctx, x, y, o) => kid(ctx, x, y, Object.assign({ adult: true, hair: '#2a2420', skin: '#7a4a2e', top: '#c7865a', pants: '#4a4036', style: 'short', glasses: true, seed: 8, cardigan: '#8a5a3a', beard: '#3a2a20' }, o));
  CH.grandma = (ctx, x, y, o) => kid(ctx, x, y, Object.assign({ adult: true, hair: '#e8e4ec', skin: '#f0c7a6', top: '#e88aa8', pants: '#6a5a7a', style: 'grey', glasses: '#8a5a7a', seed: 9, cardigan: '#fffaf0' }, o));
  // Mr. Penwright, the developer. An ordinary man in an ordinary suit (with a silver quill pin).
  CH.penwright = (ctx, x, y, o) => kid(ctx, x, y, Object.assign({ adult: true, hair: '#7d6b5a', skin: '#efc7a2', style: 'side', suit: '#596273', tie: '#c9d3e0', pants: '#454c5a', shoes: '#2a2228', pin: true, seed: 11 }, o));

  // ------------------------------------------------- costumes on the map
  // Homemade costume pieces worn over clothes, Costume Quest style.
  D.costumeBody = function (ctx, c, x, top, bot, s, dir) {
    const h = bot - top;
    const back = dir === 'up';
    switch (c) {
      case 'knight':
        D.box3(ctx, x - 12 * s, top + 1 * s, 24 * s, h, 4 * s, { fill: C.card, lw: 1.8, fstep: 4 * s, r: 3 * s });
        if (!back) {
          D.line(ctx, x, top + 4 * s, x, bot - 3 * s, '#ef6b6b', 3.2 * s);
          D.line(ctx, x - 6 * s, top + h * 0.42, x + 6 * s, top + h * 0.42, '#ef6b6b', 3.2 * s);
        }
        D.tape(ctx, x - 13 * s, top + h * 0.7, 10 * s, 4 * s, -0.4, 0.9);
        break;
      case 'tower':
        D.box3(ctx, x - 13 * s, top - 1 * s, 26 * s, h + 2 * s, 4 * s, { fill: '#cbbba5', lw: 1.8, flute: false });
        ctx.strokeStyle = 'rgba(80,50,30,.3)';
        ctx.lineWidth = 1.2;
        for (let r = 0; r < 3; r++) {
          const yy = top + 2 * s + r * (h / 3);
          ctx.beginPath(); ctx.moveTo(x - 12 * s, yy); ctx.lineTo(x + 12 * s, yy); ctx.stroke();
        }
        if (!back) { D.rr(ctx, x - 3 * s, bot - 8 * s, 6 * s, 8 * s, 3 * s); ctx.fillStyle = '#6a4a2e'; ctx.fill(); }
        break;
      case 'kite':
        D.poly(ctx, [x, top - 4 * s, x + 13 * s, top + h * 0.45, x, bot + 3 * s, x - 13 * s, top + h * 0.45], '#ff8fb1', C.ink, 1.8);
        D.poly(ctx, [x, top - 4 * s, x + 13 * s, top + h * 0.45, x, top + h * 0.45], '#ffc2d6');
        D.line(ctx, x, top - 4 * s, x, bot + 3 * s, C.ink, 1);
        break;
      case 'lighthouse':
        D.rr(ctx, x - 11 * s, top, 22 * s, h, 4 * s);
        ctx.fillStyle = D.lgx(ctx, x - 11 * s, x + 11 * s, '#fffaf0');
        ctx.fill();
        ctx.save(); ctx.clip();
        ctx.fillStyle = '#ef6b6b';
        ctx.fillRect(x - 12 * s, top + h * 0.2, 24 * s, h * 0.22);
        ctx.fillRect(x - 12 * s, top + h * 0.65, 24 * s, h * 0.22);
        ctx.restore();
        D.rr(ctx, x - 11 * s, top, 22 * s, h, 4 * s); stroke(ctx, 1.8);
        break;
      case 'bulldozer':
        D.box3(ctx, x - 13 * s, top, 26 * s, h, 4 * s, { fill: '#ffc93c', lw: 1.8, flute: false });
        ctx.save(); D.rr(ctx, x - 13 * s, bot - 5 * s, 26 * s, 5 * s, 1); ctx.clip();
        for (let i = -3; i < 4; i++) D.line(ctx, x + i * 5 * s, bot, x + i * 5 * s + 5 * s, bot - 6 * s, '#2b2b2b', 2.2 * s);
        ctx.restore();
        break;
      case 'bridge':
        D.box3(ctx, x - 15 * s, top - 6 * s, 5 * s, h + 6 * s, 3 * s, { fill: '#ef6b6b', lw: 1.5, flute: false });
        D.box3(ctx, x + 10 * s, top - 6 * s, 5 * s, h + 6 * s, 3 * s, { fill: '#ef6b6b', lw: 1.5, flute: false });
        ctx.beginPath(); ctx.moveTo(x - 12.5 * s, top - 5 * s); ctx.quadraticCurveTo(x, top + h * 0.7, x + 12.5 * s, top - 5 * s); stroke(ctx, 1.6);
        break;
      case 'snowplow':
        D.box3(ctx, x - 12 * s, top, 24 * s, h, 4 * s, { fill: '#6fa8dc', lw: 1.8, flute: false });
        if (!back) D.poly(ctx, [x - 15 * s, bot - 6 * s, x + 15 * s, bot - 6 * s, x + 12 * s, bot + 1 * s, x - 12 * s, bot + 1 * s], '#ef6b6b', C.ink, 1.5);
        break;
      case 'umbrella':
        D.rr(ctx, x - 12 * s, top, 24 * s, h + 1 * s, 6 * s);
        D.fillVol(ctx, x, (top + bot) / 2, 14 * s, '#ffd84a', 1.8);
        if (!back) for (let i = 0; i < 2; i++) D.circle(ctx, x, top + 5 * s + i * 6 * s, 1.6 * s, '#fffaf0', C.ink, 1);
        break;
      case 'hardhat':
        D.rr(ctx, x - 12 * s, top, 24 * s, h, 5 * s);
        D.fillVol(ctx, x, (top + bot) / 2, 14 * s, '#ff9c3a', 1.8);
        ctx.fillStyle = '#fff36a';
        ctx.fillRect(x - 11.5 * s, top + h * 0.35, 23 * s, 2.5 * s);
        ctx.fillRect(x - 11.5 * s, top + h * 0.7, 23 * s, 2.5 * s);
        break;
    }
  };

  // little costume hats, drawn over the head (hy = head centre)
  D.costumeHat = function (ctx, c, x, hy, s, dir) {
    switch (c) {
      case 'knight':
        // a cardboard pot helmet with the visor pushed up and a feather
        ctx.beginPath(); ctx.arc(x, hy - 2 * s, 16 * s, Math.PI, 0); ctx.closePath();
        D.fillVol(ctx, x - 3 * s, hy - 10 * s, 16 * s, '#c9d3e0', 2);
        D.rr(ctx, x - 17 * s, hy - 4 * s, 34 * s, 4.5 * s, 2 * s); ctx.fillStyle = '#aeb9c7'; ctx.fill(); stroke(ctx, 1.8);
        ctx.beginPath(); ctx.moveTo(x, hy - 18 * s); ctx.quadraticCurveTo(x + 4 * s, hy - 32 * s, x + 12 * s, hy - 30 * s); ctx.quadraticCurveTo(x + 6 * s, hy - 24 * s, x + 2 * s, hy - 18 * s);
        D.fillVol(ctx, x + 5 * s, hy - 26 * s, 8 * s, '#ef6b6b', 1.5);
        break;
      case 'tower':
        D.box3(ctx, x - 13 * s, hy - 24 * s, 26 * s, 11 * s, 4 * s, { fill: '#cbbba5', lw: 1.8, flute: false, noTop: true });
        for (let i = 0; i < 3; i++) D.box3(ctx, x - 13 * s + i * 10 * s, hy - 30 * s, 6 * s, 7 * s, 3 * s, { fill: '#cbbba5', lw: 1.6, flute: false });
        D.line(ctx, x, hy - 30 * s, x, hy - 40 * s, C.ink, 1.6);
        D.poly(ctx, [x, hy - 40 * s, x + 9 * s, hy - 37 * s, x, hy - 34 * s], '#6fc3ff', C.ink, 1.2);
        break;
      case 'kite':
        // paper bow with ribbon tails
        D.poly(ctx, [x, hy - 18 * s, x - 10 * s, hy - 24 * s, x - 10 * s, hy - 12 * s], '#ff8fb1', C.ink, 1.6);
        D.poly(ctx, [x, hy - 18 * s, x + 10 * s, hy - 24 * s, x + 10 * s, hy - 12 * s], '#ff8fb1', C.ink, 1.6);
        D.ball(ctx, x, hy - 18 * s, 3 * s, '#ffd25a', { lw: 1.4 });
        break;
      case 'lighthouse':
        D.rr(ctx, x - 8 * s, hy - 30 * s, 16 * s, 12 * s, 4 * s);
        ctx.fillStyle = 'rgba(255,240,150,0.95)'; ctx.fill(); stroke(ctx, 1.8);
        D.poly(ctx, [x - 10 * s, hy - 30 * s, x, hy - 38 * s, x + 10 * s, hy - 30 * s], '#ef6b6b', C.ink, 1.8);
        D.rr(ctx, x - 11 * s, hy - 19 * s, 22 * s, 4 * s, 2 * s); ctx.fillStyle = C.cardD; ctx.fill(); stroke(ctx, 1.5);
        break;
      case 'bulldozer':
        // a yellow hard hat with a little beacon
        ctx.beginPath(); ctx.arc(x, hy - 6 * s, 15 * s, Math.PI, 0); ctx.closePath();
        D.fillVol(ctx, x - 3 * s, hy - 12 * s, 15 * s, '#ffc93c', 2);
        D.rr(ctx, x - 18 * s, hy - 8 * s, 36 * s, 4 * s, 2 * s); ctx.fillStyle = '#f0b52a'; ctx.fill(); stroke(ctx, 1.6);
        D.ball(ctx, x, hy - 23 * s, 3.5 * s, Math.sin(CK.time * 8) > 0 ? '#ff8a3a' : '#ffd25a', { lw: 1.4 });
        break;
      case 'bridge':
        ctx.beginPath(); ctx.arc(x, hy - 6 * s, 19 * s, Math.PI, 0); stroke(ctx, 3.5 * s, '#ef6b6b');
        for (let i = -2; i <= 2; i++) D.line(ctx, x + i * 7 * s, hy - 6 * s - Math.sqrt(Math.max(0, 361 - 49 * i * i)) * s, x + i * 7 * s, hy - 12 * s, C.ink, 1);
        break;
      case 'snowplow':
        // a woolly hat with a pom-pom
        ctx.beginPath(); ctx.arc(x, hy - 5 * s, 16 * s, Math.PI, 0); ctx.closePath();
        D.fillVol(ctx, x - 3 * s, hy - 12 * s, 16 * s, '#6fa8dc', 2);
        D.rr(ctx, x - 17 * s, hy - 7 * s, 34 * s, 5 * s, 2.5 * s); ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 1.5);
        D.ball(ctx, x, hy - 22 * s, 4.5 * s, '#ef6b6b', { lw: 1.5 });
        break;
      case 'umbrella':
        D.line(ctx, x + 2 * s, hy - 10 * s, x + 2 * s, hy - 30 * s, C.ink, 2);
        ctx.beginPath(); ctx.arc(x + 2 * s, hy - 28 * s, 19 * s, Math.PI, 0);
        for (let i = 3; i >= -3; i--) ctx.quadraticCurveTo(x + 2 * s + i * 6.3 * s + 3 * s, hy - 25 * s, x + 2 * s + i * 6.3 * s, hy - 28 * s);
        ctx.closePath();
        D.fillVol(ctx, x - 4 * s, hy - 38 * s, 19 * s, '#5aa9e6', 2);
        D.line(ctx, x + 2 * s, hy - 46 * s, x + 2 * s, hy - 28 * s, 'rgba(255,255,255,.6)', 1.6);
        D.ball(ctx, x + 2 * s, hy - 47 * s, 2.5 * s, '#ef6b6b', { lw: 1.2 });
        break;
      case 'hardhat':
        ctx.beginPath(); ctx.arc(x, hy - 6 * s, 15.5 * s, Math.PI, 0); ctx.closePath();
        D.fillVol(ctx, x - 3 * s, hy - 12 * s, 16 * s, '#ffc93c', 2);
        D.rr(ctx, x - 19 * s, hy - 8 * s, 38 * s, 4.5 * s, 2 * s); ctx.fillStyle = '#f0b52a'; ctx.fill(); stroke(ctx, 1.6);
        D.line(ctx, x, hy - 21 * s, x, hy - 8 * s, '#e0a91c', 2.5 * s);
        break;
    }
  };

  // ------------------------------------------------- the cardboard knights
  // Sir Corrugate: a big gentle bear in fridge-box armour and a pot helmet.
  CH.corry = function (ctx, x, y, o) {
    const s = (o.s || 1) * 1.1;
    const walk = o.walk || 0;
    const bob = Math.abs(Math.sin(walk)) * 2 * s;
    const dir = o.dir || 'down';
    const side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const ground = y;
    y -= bob;
    const fur = '#c58b52';
    const sw = Math.sin(walk) * 3 * s;
    for (const k of [-1, 1]) {
      const lift = k < 0 ? Math.max(0, sw) : Math.max(0, -sw);
      D.egg(ctx, x + k * 6 * s, ground - 4 * s - lift, 5 * s, 5 * s, hexShade(fur, -0.12), { lw: 1.8 });
    }
    // arms (paws)
    for (const k of [-1, 1]) D.egg(ctx, x + k * 15.5 * s, y - 21 * s + (k < 0 ? -sw : sw) * 0.5, 4.5 * s, 7.5 * s, fur, { rot: -k * 0.3, lw: 1.8 });
    // fridge-box breastplate
    const wear = o.costume && o.costume !== 'knight';
    if (wear) {
      ctx.beginPath(); ctx.ellipse(x, y - 18 * s, 13 * s, 12 * s, 0, 0, TAU);
      D.fillVol(ctx, x, y - 18 * s, 14 * s, fur, 2);
      D.costumeBody(ctx, o.costume, x, y - 29 * s, y - 6 * s, s, dir);
    } else {
      D.box3(ctx, x - 13 * s, y - 30 * s, 26 * s, 24 * s, 5 * s, { fill: C.card, lw: 2, fstep: 4 * s, r: 3 * s });
      if (dir !== 'up') {
        // painted crest: a red heart on a shield, because Corry is all heart
        D.poly(ctx, [x - 7 * s, y - 26 * s, x + 7 * s, y - 26 * s, x + 7 * s, y - 16 * s, x, y - 10 * s, x - 7 * s, y - 16 * s], '#fffaf0', C.ink, 1.5);
        D.heart(ctx, x, y - 18 * s, 4.5 * s, '#ef6b6b');
      }
      D.tape(ctx, x - 15 * s, y - 12 * s, 10 * s, 4 * s, 0.4, 0.9);
    }
    const hy = y - 44 * s;
    // ears
    for (const k of [-1, 1]) {
      D.ball(ctx, x + k * 13 * s, hy - 12 * s, 6.5 * s, fur, { lw: 2 });
      D.circle(ctx, x + k * 13 * s, hy - 12 * s, 3.4 * s, '#ecc39a');
    }
    D.ball(ctx, x, hy, 18 * s, fur, { lw: 2.2, k: 0.7 });
    if (dir !== 'up') {
      const fx = x + side * 4 * s;
      D.egg(ctx, fx, hy + 7 * s, 8 * s, 6 * s, '#efcfa6', { lw: 1.5 });
      D.egg(ctx, fx, hy + 4 * s, 3.2 * s, 2.4 * s, '#3a2418', { lw: 0 });
      cqFace(ctx, fx, hy - 1.5 * s, 0.92 * s, { mood: o.mood, seed: 2 });
    }
    if (o.costume && o.costume !== 'knight') D.costumeHat(ctx, o.costume, x, hy, s * 1.15, dir);
    else {
      // pot helmet, visor up, red plume
      ctx.beginPath(); ctx.arc(x, hy - 5 * s, 17.5 * s, Math.PI * 1.08, Math.PI * 1.92); ctx.closePath();
      D.fillVol(ctx, x - 4 * s, hy - 14 * s, 16 * s, '#c9d3e0', 2);
      D.rr(ctx, x - 14 * s, hy - 15 * s, 28 * s, 4.5 * s, 2 * s); ctx.fillStyle = '#9fadbf'; ctx.fill(); stroke(ctx, 1.6);
      ctx.beginPath(); ctx.moveTo(x - 1 * s, hy - 21 * s); ctx.quadraticCurveTo(x - 4 * s, hy - 36 * s, x + 9 * s, hy - 36 * s); ctx.quadraticCurveTo(x + 3 * s, hy - 30 * s, x + 3 * s, hy - 21 * s);
      D.fillVol(ctx, x + 2 * s, hy - 30 * s, 9 * s, '#ef6b6b', 1.6);
    }
  };

  // Pip: a tiny origami crane squire. Folded paper catches the light on alternate faces.
  CH.pip = function (ctx, x, y, o) {
    const s = o.s || 1;
    const hover = Math.sin(CK.time * 4 + 1) * 3 * s;
    const fl = Math.sin(CK.time * 12) * 0.5;
    y = y - 10 * s + hover;
    const flip = o.dir === 'left' ? -1 : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flip, 1);
    const lit = '#ffffff', mid = '#f1ece6', dark = '#d9d1cc';
    D.poly(ctx, [-2 * s, -10 * s, -18 * s, -24 * s - fl * 10 * s, -8 * s, -6 * s], dark, C.ink, 2);
    D.poly(ctx, [-12 * s, -6 * s, 0, -16 * s, 0, 2 * s], mid, C.ink, 2);
    D.poly(ctx, [0, -16 * s, 12 * s, -6 * s, 0, 2 * s], dark, C.ink, 2);
    D.poly(ctx, [-12 * s, -6 * s, -20 * s, -14 * s, -16 * s, -4 * s], mid, C.ink, 2);
    D.poly(ctx, [6 * s, -10 * s, 14 * s, -28 * s, 17 * s, -26 * s, 10 * s, -8 * s], lit, C.ink, 2);
    D.poly(ctx, [14 * s, -28 * s, 24 * s, -26 * s, 17 * s, -24 * s], '#ffad3b', C.ink, 1.5);
    D.circle(ctx, 15.5 * s, -27 * s, 1.7 * s, C.ink);
    D.circle(ctx, 15.9 * s, -27.5 * s, 0.6 * s, '#fff');
    D.ellipse(ctx, 14 * s, -24.5 * s, 2 * s, 1.2 * s, 'rgba(255,105,120,0.5)');
    D.poly(ctx, [12 * s, -22 * s, 18 * s, -21 * s, 10 * s, -17 * s], '#ef6b6b', C.ink, 1);
    D.poly(ctx, [2 * s, -10 * s, 14 * s, -26 * s + fl * 10 * s, 8 * s, -6 * s], lit, C.ink, 2);
    ctx.restore();
    if (o.costume) D.costumeHat(ctx, o.costume, x + 4 * flip * s, y - 24 * s, s * 0.6, o.dir);
  };

  // ----------------------------------------------- the kingdom's critters
  CH.critter = function (ctx, x, y, o) {
    const s = o.s || 1;
    const sp = o.species || 'bunny';
    const col = o.color || '#f0e2d0';
    const bob = Math.abs(Math.sin(o.walk || CK.time * 2 + (o.seed || 0))) * 1.5 * s;
    y -= bob;
    // little cardboard box body, every critter wears one
    D.box3(ctx, x - 10 * s, y - 18 * s, 20 * s, 17 * s, 4 * s, { fill: o.box || C.card, lw: 1.8, fstep: 4 * s, r: 3 * s });
    for (const k of [-1, 1]) D.egg(ctx, x + k * 6 * s, y - 1.5 * s, 4 * s, 2.5 * s, hexShade(col, -0.15), { lw: 1.5 });
    if (o.scarf) {
      D.rr(ctx, x - 12 * s, y - 21 * s, 24 * s, 5 * s, 2.5 * s); ctx.fillStyle = o.scarf; ctx.fill(); stroke(ctx, 1.4);
      D.rr(ctx, x + 4 * s, y - 18 * s, 4 * s, 9 * s, 1.5 * s); ctx.fill(); stroke(ctx, 1.4);
    }
    const hy = y - 33 * s;
    const R = 15 * s;
    if (sp === 'bunny') {
      for (const k of [-1, 1]) {
        D.egg(ctx, x + k * 6.5 * s, hy - 18 * s, 4.5 * s, 12 * s, col, { rot: k * 0.15, lw: 2 });
        D.ellipse(ctx, x + k * 6.5 * s, hy - 18 * s, 2.2 * s, 8 * s, '#ffb7c9', null, 0, k * 0.15);
      }
    } else if (sp === 'fox' || sp === 'cat') {
      for (const k of [-1, 1]) D.poly(ctx, [x + k * 13 * s, hy - 4 * s, x + k * 10 * s, hy - 21 * s, x + k * 2 * s, hy - 11 * s], col, C.ink, 2);
      for (const k of [-1, 1]) D.poly(ctx, [x + k * 11 * s, hy - 8 * s, x + k * 9.5 * s, hy - 17 * s, x + k * 5 * s, hy - 11 * s], '#3a2418');
    } else if (sp === 'mouse') {
      for (const k of [-1, 1]) {
        D.ball(ctx, x + k * 12 * s, hy - 10 * s, 8 * s, col, { lw: 2 });
        D.circle(ctx, x + k * 12 * s, hy - 10 * s, 4.5 * s, '#ffb7c9');
      }
    } else if (sp === 'bear') {
      for (const k of [-1, 1]) {
        D.ball(ctx, x + k * 11 * s, hy - 11 * s, 6 * s, col, { lw: 2 });
        D.circle(ctx, x + k * 11 * s, hy - 11 * s, 3 * s, D.shade(col, 0.35));
      }
    } else if (sp === 'hedgehog') {
      for (let i = -3; i <= 3; i++) D.poly(ctx, [x + i * 4.2 * s - 4 * s, hy - 7 * s, x + i * 4.8 * s, hy - 21 * s, x + i * 4.2 * s + 4 * s, hy - 7 * s], '#8a6040', C.ink, 1.5);
    } else if (sp === 'owl') {
      for (const k of [-1, 1]) D.poly(ctx, [x + k * 13 * s, hy - 5 * s, x + k * 11 * s, hy - 18 * s, x + k * 4 * s, hy - 11 * s], col, C.ink, 2);
    }
    D.ball(ctx, x, hy, R, col, { lw: 2.2, k: 0.7 });
    const fs = R / 18;
    if (sp === 'duck' || sp === 'owl' || sp === 'robin') {
      if (sp === 'owl') {
        D.circle(ctx, x - 6 * s, hy - 1 * s, 6 * s, '#fff4e0', C.ink, 1.5);
        D.circle(ctx, x + 6 * s, hy - 1 * s, 6 * s, '#fff4e0', C.ink, 1.5);
      }
      if (sp === 'robin') D.egg(ctx, x, hy + 7 * s, 8 * s, 6 * s, '#f07a4a', { lw: 0 });
      cqFace(ctx, x, hy - 2.5 * s, fs, { mood: o.mood, seed: o.seed });
      const beak = sp === 'duck' ? [x - 6.5 * s, hy + 4 * s, x + 6.5 * s, hy + 4 * s, x, hy + 10 * s] : [x - 3 * s, hy + 3.5 * s, x + 3 * s, hy + 3.5 * s, x, hy + 9 * s];
      D.poly(ctx, beak, '#ffad3b', C.ink, 1.5);
    } else {
      if (sp === 'fox') D.egg(ctx, x, hy + 7 * s, 8 * s, 5.5 * s, '#fff5ea', { lw: 0 });
      if (sp === 'bear' || sp === 'mouse') D.egg(ctx, x, hy + 6 * s, 6 * s, 4.5 * s, D.shade(col, 0.4), { lw: 0 });
      cqFace(ctx, x, hy - 1.5 * s, fs, { mood: o.mood, seed: o.seed });
      D.egg(ctx, x, hy + 4 * s, 2 * s, 1.5 * s, '#3a2418', { lw: 0 });
    }
    // hats
    if (o.hat === 'flowers') for (let i = -2; i <= 2; i++) D.ball(ctx, x + i * 5.5 * s, hy - 13 * s + Math.abs(i) * 1.8 * s, 3.2 * s, i % 2 ? '#ffd1e6' : '#ffef9a', { lw: 1 });
    if (o.hat === 'sunhat') {
      D.egg(ctx, x, hy - 11 * s, 20 * s, 5.5 * s, '#ffe08a', { lw: 2 });
      D.egg(ctx, x, hy - 15 * s, 10 * s, 6.5 * s, '#ffe08a', { lw: 2 });
      D.line(ctx, x - 10 * s, hy - 13 * s, x + 10 * s, hy - 13 * s, '#ef6b6b', 2.5);
    }
    if (o.hat === 'beanie') {
      ctx.beginPath(); ctx.arc(x, hy - 4 * s, 15.5 * s, Math.PI, 0); ctx.closePath();
      D.fillVol(ctx, x - 3 * s, hy - 10 * s, 15 * s, o.hatColor || '#ef6b6b', 2);
      D.ball(ctx, x, hy - 20 * s, 4.2 * s, '#fffaf0', { lw: 1.5 });
    }
    if (o.hat === 'hardhat') {
      ctx.beginPath(); ctx.arc(x, hy - 4 * s, 15 * s, Math.PI, 0); ctx.closePath();
      D.fillVol(ctx, x - 3 * s, hy - 10 * s, 15 * s, '#ffc93c', 2);
      D.rr(ctx, x - 18 * s, hy - 6 * s, 36 * s, 4 * s, 2); ctx.fillStyle = '#f0b52a'; ctx.fill(); stroke(ctx, 1.6);
    }
    if (o.hat === 'crown') D.poly(ctx, [x - 9 * s, hy - 11 * s, x - 9 * s, hy - 22 * s, x - 4 * s, hy - 15 * s, x, hy - 24 * s, x + 4 * s, hy - 15 * s, x + 9 * s, hy - 22 * s, x + 9 * s, hy - 11 * s], '#ffd25a', C.ink, 2);
  };

  // Mayor Mossworth: a cardboard tortoise in a top hat
  CH.mayor = function (ctx, x, y, o) {
    const s = o.s || 1;
    D.egg(ctx, x - 12 * s, y - 3 * s, 5 * s, 3.5 * s, '#9bd07a', { lw: 1.5 });
    D.egg(ctx, x + 8 * s, y - 3 * s, 5 * s, 3.5 * s, '#9bd07a', { lw: 1.5 });
    D.ball(ctx, x + 17 * s, y - 17 * s, 11 * s, '#9bd07a', { lw: 2 });
    cqFace(ctx, x + 19 * s, y - 18 * s, 0.55 * s, { mood: o.mood, seed: 4 });
    ctx.beginPath(); ctx.arc(x - 2 * s, y - 6 * s, 19 * s, Math.PI, 0); ctx.closePath();
    D.fillVol(ctx, x - 6 * s, y - 14 * s, 18 * s, C.card, 2);
    ctx.save(); ctx.clip();
    for (let i = -2; i <= 2; i++) D.poly(ctx, [x - 2 * s + i * 9 * s, y - 22 * s + Math.abs(i) * 4 * s, x + 3 * s + i * 9 * s, y - 16 * s + Math.abs(i) * 4 * s, x - 2 * s + i * 9 * s, y - 10 * s + Math.abs(i) * 4 * s, x - 7 * s + i * 9 * s, y - 16 * s + Math.abs(i) * 4 * s], null, C.cardDD, 1.4);
    ctx.restore();
    D.box3(ctx, x - 11 * s, y - 37 * s, 16 * s, 13 * s, 4 * s, { fill: '#4a4a5a', lw: 1.6, flute: false });
    D.rr(ctx, x - 15 * s, y - 26 * s, 24 * s, 3.5 * s, 1.5 * s); ctx.fillStyle = '#3a3a48'; ctx.fill(); stroke(ctx, 1.4);
    D.line(ctx, x - 11 * s, y - 29 * s, x + 5 * s, y - 29 * s, '#ef6b6b', 2.5 * s);
  };

  // Queen Corrina: a swan in a cardboard castle gown
  CH.queen = function (ctx, x, y, o) {
    const s = o.s || 1;
    ctx.beginPath(); ctx.moveTo(x - 17 * s, y); ctx.quadraticCurveTo(x - 12 * s, y - 16 * s, x - 10 * s, y - 27 * s); ctx.lineTo(x + 10 * s, y - 27 * s); ctx.quadraticCurveTo(x + 12 * s, y - 16 * s, x + 17 * s, y); ctx.closePath();
    D.fillVol(ctx, x, y - 14 * s, 18 * s, '#c7b2f0', 2);
    for (let i = -1; i <= 1; i++) D.box3(ctx, x + i * 7 * s - 3 * s, y - 33 * s, 6 * s, 7 * s, 2 * s, { fill: '#c7b2f0', lw: 1.4, flute: false });
    ctx.beginPath(); ctx.moveTo(x, y - 28 * s); ctx.quadraticCurveTo(x - 14 * s, y - 44 * s, x, y - 52 * s);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 9.5 * s; ctx.lineCap = 'round'; ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 6.5 * s; ctx.stroke();
    D.ball(ctx, x + 2 * s, y - 55 * s, 11 * s, '#ffffff', { lw: 2, k: 0.6 });
    D.poly(ctx, [x + 11 * s, y - 57 * s, x + 20 * s, y - 53 * s, x + 11 * s, y - 51 * s], '#ffad3b', C.ink, 1.5);
    cqFace(ctx, x + 3 * s, y - 56 * s, 0.55 * s, { mood: o.mood, seed: 5 });
    D.poly(ctx, [x - 6 * s, y - 64 * s, x - 6 * s, y - 72 * s, x - 2 * s, y - 67 * s, x + 2 * s, y - 74 * s, x + 5 * s, y - 67 * s, x + 9 * s, y - 72 * s, x + 9 * s, y - 64 * s], '#ffd25a', C.ink, 1.5);
    D.circle(ctx, x + 2 * s, y - 68 * s, 1.5 * s, '#ef6b6b');
  };

  // Biscuit, a cardboard cat who turns up everywhere
  CH.cat = function (ctx, x, y, o) {
    const s = o.s || 1;
    const col = o.color || '#e9b46a';
    const tail = Math.sin(CK.time * 3 + (o.seed || 0)) * 0.4;
    ctx.save(); ctx.translate(x + 10 * s, y - 8 * s); ctx.rotate(-0.8 + tail);
    D.rr(ctx, -2.5 * s, -18 * s, 5 * s, 18 * s, 2.5 * s); D.fillVol(ctx, 0, -9 * s, 9 * s, col, 2);
    ctx.restore();
    D.box3(ctx, x - 11 * s, y - 14 * s, 22 * s, 13 * s, 3 * s, { fill: col, lw: 1.8, fstep: 4 * s, r: 4 * s });
    const hy = y - 21 * s;
    for (const k of [-1, 1]) D.poly(ctx, [x + k * 11 * s, hy - 3 * s, x + k * 9.5 * s, hy - 16 * s, x + k * 2 * s, hy - 9 * s], col, C.ink, 2);
    for (const k of [-1, 1]) D.poly(ctx, [x + k * 9.5 * s, hy - 6 * s, x + k * 8.6 * s, hy - 13 * s, x + k * 4.5 * s, hy - 9 * s], '#ffb7c9');
    D.ball(ctx, x, hy, 11 * s, col, { lw: 2, k: 0.6 });
    cqFace(ctx, x, hy - 1 * s, 0.58 * s, { mood: o.mood === 'happy' || o.purr ? 'happy' : null, seed: 5 });
    D.poly(ctx, [x - 1.5 * s, hy + 2.5 * s, x + 1.5 * s, hy + 2.5 * s, x, hy + 4.5 * s], '#ff8fa8');
    D.line(ctx, x - 6 * s, hy + 3.5 * s, x - 14 * s, hy + 1.5 * s, C.ink, 1);
    D.line(ctx, x + 6 * s, hy + 3.5 * s, x + 14 * s, hy + 1.5 * s, C.ink, 1);
  };

  // ------------------------------------------- monsters of the Brinemarsh
  // The water pirates. A bit spooky, never mean-looking for long.
  CH.swabby = function (ctx, x, y, o) {
    const s = o.s || 1;
    const col = o.color || '#5fb8a6';
    const mood = o.mood;
    const sq = 1 + Math.sin(CK.time * 5 + (o.seed || 0)) * 0.05;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1 / sq, sq);
    // fin ears behind the head
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(k * 12 * s, -34 * s);
      ctx.quadraticCurveTo(k * 26 * s, -42 * s, k * 25 * s, -28 * s);
      ctx.quadraticCurveTo(k * 20 * s, -26 * s, k * 13 * s, -22 * s);
      ctx.closePath();
      D.fillVol(ctx, k * 18 * s, -32 * s, 9 * s, hexShade(col, -0.1), 1.8);
      D.line(ctx, k * 15 * s, -30 * s, k * 22 * s, -34 * s, 'rgba(0,0,0,.2)', 1.2);
      D.line(ctx, k * 15 * s, -27 * s, k * 22 * s, -29 * s, 'rgba(0,0,0,.2)', 1.2);
    }
    // little webbed feet
    for (const k of [-1, 1]) D.egg(ctx, k * 8 * s, -2 * s, 6 * s, 3 * s, hexShade(col, -0.25), { lw: 1.6 });
    // pear-shaped body
    ctx.beginPath();
    ctx.moveTo(-16 * s, -3 * s);
    ctx.bezierCurveTo(-20 * s, -26 * s, -13 * s, -44 * s, 0, -44 * s);
    ctx.bezierCurveTo(13 * s, -44 * s, 20 * s, -26 * s, 16 * s, -3 * s);
    ctx.quadraticCurveTo(0, 3 * s, -16 * s, -3 * s);
    ctx.closePath();
    D.fillVol(ctx, 0, -24 * s, 26 * s, col, 2.2);
    D.egg(ctx, 0, -11 * s, 10 * s, 7.5 * s, '#fff4d6', { lw: 0, k: 0.3 });
    ctx.globalAlpha *= 0.55;
    for (let i = 0; i < 5; i++) D.circle(ctx, (U.hash(i, 1, 3) - 0.5) * 22 * s, -20 * s - U.hash(i, 2, 3) * 18 * s, (1.2 + U.hash(i, 3) * 1.6) * s, '#e7fff6');
    ctx.globalAlpha /= 0.55;
    // bandana with polka dots and a knot
    ctx.beginPath();
    ctx.moveTo(-14.5 * s, -33 * s);
    ctx.quadraticCurveTo(0, -50 * s, 14.5 * s, -33 * s);
    ctx.quadraticCurveTo(0, -38 * s, -14.5 * s, -33 * s);
    ctx.closePath();
    D.fillVol(ctx, -3 * s, -40 * s, 12 * s, o.band || '#ef6b6b', 1.8);
    for (let i = -1; i <= 1; i++) D.circle(ctx, i * 6 * s, -40 * s + Math.abs(i) * 1.5 * s, 1.2 * s, '#fffaf0');
    D.poly(ctx, [13 * s, -34 * s, 22 * s, -38 * s, 20 * s, -30 * s], o.band || '#ef6b6b', C.ink, 1.4);
    D.poly(ctx, [13 * s, -34 * s, 21 * s, -28 * s, 16 * s, -26 * s], o.band || '#ef6b6b', C.ink, 1.4);
    monsterEyes(ctx, 0, -25 * s, 6.5 * s, 4.2 * s, { mood, seed: o.seed });
    if (o.patch) {
      D.line(ctx, -14 * s, -33 * s, 13 * s, -19 * s, '#2b2b2b', 1.6);
      D.ellipse(ctx, 6.5 * s, -25 * s, 4.6 * s, 4 * s, '#2b2b2b', C.ink, 1.2);
    }
    monsterGrin(ctx, 0, -15 * s, 13 * s, { mood, teeth: 4 });
    ctx.restore();
    // a soggy mop
    if (o.mop !== false) {
      const mx = x + 17 * s, my = y - 6 * s;
      D.line(ctx, mx, my, mx + 5 * s, my - 34 * s, C.ink, 4 * s);
      D.line(ctx, mx, my, mx + 5 * s, my - 34 * s, '#b07c45', 2.4 * s);
      for (let i = -3; i <= 3; i++) {
        const sway = Math.sin(CK.time * 3 + i) * 1.5 * s;
        D.line(ctx, mx + i * 1.6 * s, my - 2 * s, mx + i * 2.6 * s + sway, my + 7 * s, '#9fb3c4', 2.6 * s);
      }
    }
    const dp = (CK.time * 0.8 + (o.seed || 0)) % 1;
    D.ellipse(ctx, x - 8 * s, y - 2 * s + dp * 10 * s, 2 * s, 3 * s, 'rgba(90,180,240,' + (1 - dp) + ')');
  };

  CH.bess = function (ctx, x, y, o) {
    const s = (o.s || 1) * 1.3;
    CH.swabby(ctx, x, y, { s, color: '#4f9bc0', band: '#2a4f7e', seed: 9, mood: o.mood, mop: false });
    // patchwork captain's coat
    ctx.beginPath();
    ctx.moveTo(x - 16 * s, y - 2 * s); ctx.lineTo(x - 13 * s, y - 20 * s); ctx.lineTo(x + 13 * s, y - 20 * s); ctx.lineTo(x + 16 * s, y - 2 * s);
    ctx.quadraticCurveTo(x, y + 2 * s, x - 16 * s, y - 2 * s);
    D.fillVol(ctx, x, y - 10 * s, 18 * s, '#3c5f96', 2);
    D.rr(ctx, x - 11 * s, y - 15 * s, 7 * s, 6 * s, 1); ctx.fillStyle = '#e88f6b'; ctx.fill();
    D.rr(ctx, x + 4 * s, y - 11 * s, 7 * s, 6 * s, 1); ctx.fillStyle = C.card; ctx.fill();
    for (let i = 0; i < 2; i++) D.ball(ctx, x - 1 * s, y - 15 * s + i * 6 * s, 1.6 * s, '#ffd25a', { lw: 1 });
    // a soup-ladle hook
    D.line(ctx, x + 17 * s, y - 12 * s, x + 23 * s, y - 24 * s, '#c9d3e0', 2.4 * s);
    ctx.beginPath(); ctx.arc(x + 24 * s, y - 27 * s, 3.5 * s, Math.PI * 0.6, Math.PI * 2.2); stroke(ctx, 2.2 * s, '#c9d3e0');
    // tricorn with a bottle-cap badge
    ctx.beginPath();
    ctx.moveTo(x - 21 * s, y - 37 * s);
    ctx.quadraticCurveTo(x - 12 * s, y - 50 * s, x, y - 56 * s);
    ctx.quadraticCurveTo(x + 12 * s, y - 50 * s, x + 21 * s, y - 37 * s);
    ctx.quadraticCurveTo(x, y - 44 * s, x - 21 * s, y - 37 * s);
    ctx.closePath();
    D.fillVol(ctx, x - 4 * s, y - 46 * s, 18 * s, '#2f2a3a', 2);
    ctx.beginPath(); ctx.moveTo(x - 18 * s, y - 39 * s); ctx.quadraticCurveTo(x, y - 46 * s, x + 18 * s, y - 39 * s); stroke(ctx, 1.4 * s, '#ffd25a');
    D.ball(ctx, x, y - 47 * s, 3.4 * s, '#ef6b6b', { lw: 1.4 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      D.circle(ctx, x + Math.cos(a) * 3.6 * s, y - 47 * s + Math.sin(a) * 3.6 * s, 0.8 * s, '#ffd25a');
    }
  };

  CH.skipper = function (ctx, x, y, o) {
    const s = (o.s || 1) * 0.72;
    CH.swabby(ctx, x, y, { s, color: '#8fdcae', band: '#ffd25a', seed: 3, mood: o.mood, mop: false });
    // folded paper sailor hat
    D.poly(ctx, [x - 14 * s, y - 42 * s, x, y - 60 * s, x + 14 * s, y - 42 * s], '#fffaf0', C.ink, 1.6);
    D.poly(ctx, [x - 15 * s, y - 42 * s, x + 15 * s, y - 42 * s, x + 12 * s, y - 38 * s, x - 12 * s, y - 38 * s], '#e8e1d2', C.ink, 1.4);
  };

  CH.splashling = function (ctx, x, y, o) {
    const s = o.s || 1;
    const mood = o.mood;
    const w = Math.sin(CK.time * 6 + (o.seed || 0)) * 2 * s;
    // two curling water horns
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + k * 4 * s, y - 30 * s);
      ctx.quadraticCurveTo(x + k * 12 * s, y - 44 * s + w * 0.5, x + k * 7 * s, y - 46 * s);
      ctx.quadraticCurveTo(x + k * 10 * s, y - 40 * s, x + k * 2 * s, y - 31 * s);
      ctx.fillStyle = 'rgba(110,200,245,0.95)';
      ctx.fill();
      stroke(ctx, 1.8, '#1f6f9a');
    }
    ctx.beginPath();
    ctx.moveTo(x, y - 38 * s);
    ctx.bezierCurveTo(x + 17 * s + w, y - 16 * s, x + 17 * s, y, x, y);
    ctx.bezierCurveTo(x - 17 * s, y, x - 17 * s - w, y - 16 * s, x, y - 38 * s);
    const g = ctx.createRadialGradient(x - 5 * s, y - 20 * s, 2 * s, x, y - 12 * s, 20 * s);
    g.addColorStop(0, 'rgba(200,240,255,0.95)');
    g.addColorStop(0.5, 'rgba(90,195,240,0.9)');
    g.addColorStop(1, 'rgba(40,130,200,0.95)');
    ctx.fillStyle = g;
    ctx.fill();
    stroke(ctx, 2.2, '#1f5f8a');
    D.ellipse(ctx, x - 6 * s, y - 22 * s, 2.6 * s, 5 * s, 'rgba(255,255,255,.7)', null, 0, 0.3);
    monsterEyes(ctx, x, y - 15 * s, 5.5 * s, 3.6 * s, { mood, seed: o.seed, glow: '180,255,250' });
    monsterGrin(ctx, x, y - 8 * s, 10 * s, { mood, teeth: 4, fang: false });
  };

  // ---------------------------------------- the Silver Quill Society
  // Ordinary-looking magpies in tidy suits. The menace is in the paperwork.
  CH.magpie = function (ctx, x, y, o) {
    const s = o.s || 1;
    const big = !!o.big;
    const mood = o.mood;
    const bob = Math.abs(Math.sin(o.walk || CK.time * 3 + (o.seed || 0))) * 1.5 * s;
    const dir = o.dir || 'down';
    const side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const ground = y;
    y -= bob;
    const suit = big ? '#2f3442' : '#4a5160';
    // a short glossy tail behind the coat
    D.poly(ctx, [x - 6 * s, y - 12 * s, x - 13 * s, y - 2 * s, x - 7 * s, y, x - 1 * s, y - 8 * s], '#2b3a5a', C.ink, 1.4);
    // thin legs
    for (const k of [-1, 1]) {
      D.line(ctx, x + k * 4 * s, y - 8 * s, x + k * 4 * s, ground - 1 * s, '#3a3a44', 2 * s);
      D.line(ctx, x + k * 4 * s, ground - 1 * s, x + k * 4 * s + 4 * s, ground - 1 * s, '#3a3a44', 1.8 * s);
    }
    // suit (tail coat for the Magister)
    ctx.beginPath();
    ctx.moveTo(x - 10 * s, y - 30 * s);
    ctx.quadraticCurveTo(x - 13 * s, y - 18 * s, x - (big ? 14 : 12) * s, y - (big ? 2 : 7) * s);
    ctx.lineTo(x + (big ? 14 : 12) * s, y - (big ? 2 : 7) * s);
    ctx.quadraticCurveTo(x + 13 * s, y - 18 * s, x + 10 * s, y - 30 * s);
    ctx.closePath();
    D.fillVol(ctx, x, y - 18 * s, 16 * s, suit, 2);
    if (dir !== 'up') {
      // white shirt front, silver tie, lapels and the quill pin
      D.poly(ctx, [x - 5 * s, y - 30 * s, x + 5 * s, y - 30 * s, x, y - 15 * s], '#fffaf0', C.ink, 1.2);
      D.poly(ctx, [x - 1.6 * s, y - 28 * s, x + 1.6 * s, y - 28 * s, x + 1.1 * s, y - 18 * s, x, y - 16 * s, x - 1.1 * s, y - 18 * s], big ? '#a8b3c4' : '#c9d3e0', C.ink, 0.9);
      D.line(ctx, x - 5 * s, y - 30 * s, x - 2 * s, y - 15 * s, C.ink, 1.2);
      D.line(ctx, x + 5 * s, y - 30 * s, x + 2 * s, y - 15 * s, C.ink, 1.2);
      D.icon(ctx, 'feather', x + 6.5 * s, y - 25 * s, 0.32 * s);
      if (big) {
        // waistcoat buttons and a watch chain
        for (let i = 0; i < 2; i++) D.circle(ctx, x - 0.5 * s, y - 12 * s + i * 4 * s, 0.9 * s, '#c9d3e0');
        ctx.beginPath(); ctx.moveTo(x - 7 * s, y - 13 * s); ctx.quadraticCurveTo(x - 3 * s, y - 9 * s, x, y - 12 * s); stroke(ctx, 1, '#c9d3e0');
      }
    }
    // wing-sleeves with white shoulder patches
    for (const k of [-1, 1]) {
      D.egg(ctx, x + k * 12 * s, y - 21 * s, 4 * s, 8.5 * s, suit, { rot: -k * 0.2, lw: 1.6 });
      D.egg(ctx, x + k * 12.5 * s, y - 13.5 * s, 3 * s, 2.6 * s, '#20202a', { lw: 1.2 });
    }
    // head: glossy black with a white cheek
    const hy = y - 40 * s;
    const R = 12.5 * s;
    D.ball(ctx, x, hy, R, '#2a2733', { lw: 2.2, k: 1.4 });
    if (dir !== 'up') {
      const fx = x + side * 3 * s;
      
      // ordinary bird eyes: white ring, dark pupil, a slightly lowered lid
      for (const k of [-1, 1]) {
        if (side && k === -side) continue;
        const ex = fx + k * 4.8 * s;
        const ey = hy - 1 * s;
        D.circle(ctx, ex, ey, 2.7 * s, '#fffaf0', C.ink, 1);
        D.circle(ctx, ex + side * 0.6 * s, ey + 0.3 * s, 1.5 * s, '#120e14');
        D.circle(ctx, ex + side * 0.6 * s + 0.5 * s, ey - 0.4 * s, 0.5 * s, '#fff');
        const lid = mood === 'happy' ? 0 : mood === 'angry' ? 0.55 : 0.32;
        if (lid) {
          ctx.beginPath(); ctx.arc(ex, ey, 2.9 * s, Math.PI * (1 + lid * 0.2), Math.PI * (2 - lid * 0.2)); ctx.closePath();
          ctx.fillStyle = '#2a2733'; ctx.fill();
        }
        if (mood === 'angry') D.line(ctx, ex - k * 3 * s, ey - 3.4 * s, ex + k * 2.5 * s, ey - 2.4 * s, '#55525e', 1.4);
        if (mood === 'sad') D.line(ctx, ex - k * 3 * s, ey - 2.4 * s, ex + k * 2.5 * s, ey - 3.6 * s, '#55525e', 1.4);
      }
      // beak
      const bx = fx + side * 5 * s;
      D.poly(ctx, side ? [bx, hy + 1 * s, bx + side * 9 * s, hy + 3 * s, bx, hy + 5 * s] : [fx - 3 * s, hy + 2.5 * s, fx + 3 * s, hy + 2.5 * s, fx, hy + 8.5 * s], '#3d3d46', C.ink, 1.2);
      if (big) {
        // round silver spectacles
        ctx.beginPath();
        ctx.arc(fx - 4.8 * s, hy - 1 * s, 3.8 * s, 0, TAU);
        ctx.moveTo(fx + 4.8 * s + 3.8 * s, hy - 1 * s);
        ctx.arc(fx + 4.8 * s, hy - 1 * s, 3.8 * s, 0, TAU);
        stroke(ctx, 1.3, '#c9d3e0');
      }
    }
    if (big) {
      // a quill pen tucked behind the head, and a neat crest
      ctx.save(); ctx.translate(x + 11 * s, hy - 8 * s); ctx.rotate(0.6);
      D.ellipse(ctx, 0, -6 * s, 2.6 * s, 9 * s, '#e9eef6', C.ink, 1.2);
      D.line(ctx, 0, -14 * s, 0, 6 * s, C.ink, 1.1);
      ctx.restore();
    }
  };

  CH.drizzle = function (ctx, x, y, o) {
    const s = o.s || 1;
    for (let i = -2; i <= 2; i++) D.ball(ctx, x + i * 9 * s, y - 24 * s + Math.abs(i) * 3 * s, 11 * s, '#a7b2c6', { lw: 2, k: 0.7 });
    for (let i = -2; i <= 2; i++) D.circle(ctx, x + i * 9 * s, y - 24 * s + Math.abs(i) * 3 * s, 9 * s, '#a7b2c6');
    eyes(ctx, x, y - 24 * s, 6 * s, 2.5 * s, { sad: true, seed: 6 });
    for (let i = 0; i < 3; i++) {
      const p = (CK.time * 1.5 + i / 3) % 1;
      D.line(ctx, x - 10 * s + i * 10 * s, y - 12 * s + p * 14 * s, x - 11 * s + i * 10 * s, y - 8 * s + p * 14 * s, '#6fb5e8', 2);
    }
  };

  D.char = function (ctx, look, x, y, o) {
    o = o || {};
    if (!o.noShadow) D.shadow(ctx, x, y, 14 * (o.s || 1), 5 * (o.s || 1));
    const f = CH[look] || CH.critter;
    // a little life: idle breathing, and squash-and-stretch on every step
    const seed = o.seed != null ? o.seed : look.length * 1.7;
    let sx = 1, sy = 1;
    if (o.walk) {
      const k = Math.abs(Math.cos(o.walk)) - 0.5;
      sx = 1 + k * 0.06;
      sy = 1 - k * 0.06;
    } else if (!o.still) {
      const b = Math.sin(CK.time * 2.2 + seed) * 0.018;
      sx = 1 - b * 0.5;
      sy = 1 + b;
    }
    if (sx !== 1) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(sx, sy);
      f(ctx, 0, 0, o);
      ctx.restore();
    } else f(ctx, x, y, o);
  };

  // ---------------------------------------------------- portrait (dialogue)
  D.portrait = function (ctx, who, x, y, mood) {
    const P = CK.Data.speakers[who] || {};
    ctx.save();
    D.rr(ctx, x, y, 110, 110, 14);
    const bg = P.bg || '#fff3dc';
    const g = ctx.createRadialGradient(x + 40, y + 30, 5, x + 55, y + 55, 90);
    g.addColorStop(0, D.shade(bg, 0.5));
    g.addColorStop(1, D.shade(bg, -0.1));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();
    const look = P.look || 'critter';
    const o = Object.assign({ s: P.ps || 2.1, mood, dir: 'down', seed: 2 }, P.o || {});
    const off = P.py || 0;
    D.char(ctx, look, x + 55, y + 128 + off, Object.assign(o, { noShadow: true }));
    ctx.restore();
    D.rr(ctx, x, y, 110, 110, 14);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  // ---------------------------------------------------- giant battle forms
  // The costume becomes real, Costume Quest style. The wearer's face peeks out of a window.
  function peekFace(ctx, who, x, y, r, mood) {
    const s = r / 18;
    const looks = {
      sam: { skin: '#f2c9a0', hair: '#6b4426', style: 'mop' },
      jules: { skin: '#a8714a', hair: '#1f1a17', style: 'puff' },
    };
    if (who === 'corry') {
      for (const k of [-1, 1]) D.ball(ctx, x + k * 13 * s, y - 12 * s, 6 * s, '#c58b52', { lw: 1.8 });
      D.ball(ctx, x, y, r, '#c58b52', { lw: 2, k: 0.7 });
      D.egg(ctx, x, y + 7 * s, 8 * s, 6 * s, '#efcfa6', { lw: 1.4 });
      D.egg(ctx, x, y + 4 * s, 3.2 * s, 2.4 * s, '#3a2418', { lw: 0 });
      cqFace(ctx, x, y - 1.5 * s, 0.92 * s, { mood, seed: 2 });
      return;
    }
    if (who === 'pip') {
      D.ball(ctx, x, y, r, '#ffffff', { lw: 2, k: 0.5 });
      D.poly(ctx, [x + r * 0.5, y + r * 0.05, x + r * 1.3, y + r * 0.25, x + r * 0.5, y + r * 0.45], '#ffad3b', C.ink, 1.5);
      cqFace(ctx, x - r * 0.12, y - r * 0.05, s * 0.85, { mood, seed: 3 });
      return;
    }
    const L = looks[who] || looks.sam;
    if (L.style === 'puff') {
      D.ball(ctx, x - r * 0.9, y - r * 0.62, r * 0.5, L.hair, { lw: 1.8 });
      D.ball(ctx, x + r * 0.9, y - r * 0.62, r * 0.5, L.hair, { lw: 1.8 });
    }
    D.ball(ctx, x, y, r, L.skin, { lw: 2, k: 0.6 });
    hairFront(ctx, L.style, x, y, r, L.hair, 0, s);
    cqFace(ctx, x, y + 2.5 * s, s, { mood, seed: who === 'jules' ? 7 : 1 });
  }
  D.peekFace = peekFace;

  // a dark window cut into cardboard, with the face inside
  function window_(ctx, x, y, w, h, r) {
    D.rr(ctx, x, y, w, h, r);
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, '#1d1630');
    g.addColorStop(1, '#3a2c4a');
    ctx.fillStyle = g;
    ctx.fill();
    stroke(ctx, 3);
  }

  D.giant = function (ctx, type, x, y, o = {}) {
    const t = CK.time;
    const s = o.s || 1;
    const who = o.who || 'sam';
    const b = Math.sin(t * 2.2 + (o.seed || 0)) * 2;
    D.shadow(ctx, x, y, 62 * s, 14 * s, 0.3);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    if (o.flash) ctx.filter = 'brightness(1.8)';
    switch (type) {
      case 'knight': {
        // a kid-built knight: box armour, bucket helmet, paper-towel-tube sword, pizza-box shield
        D.box3(ctx, -28, -44, 20, 44, 10, { fill: '#c99561', lw: 3, fstep: 6 });
        D.box3(ctx, 8, -44, 20, 44, 10, { fill: '#c99561', lw: 3, fstep: 6 });
        D.box3(ctx, -44, -128 + b, 88, 88, 18, { fill: C.card, lw: 3, flaps: true });
        // painted tabard cross
        D.rr(ctx, -9, -118 + b, 18, 70, 3); ctx.fillStyle = '#ef6b6b'; ctx.fill(); stroke(ctx, 2.5);
        D.rr(ctx, -30, -96 + b, 60, 16, 3); ctx.fillStyle = '#ef6b6b'; ctx.fill(); stroke(ctx, 2.5);
        D.tape(ctx, -40, -60 + b, 26, 9, 0.5);
        // shoulder pads
        for (const k of [-1, 1]) {
          ctx.beginPath(); ctx.arc(k * 44, -116 + b, 18, Math.PI, 0); ctx.closePath();
          D.fillVol(ctx, k * 44 - 4, -122 + b, 18, '#c9d3e0', 3);
        }
        // bucket helmet with visor slot
        ctx.beginPath();
        ctx.moveTo(-34, -132 + b); ctx.lineTo(-30, -192 + b);
        ctx.quadraticCurveTo(0, -204 + b, 30, -192 + b); ctx.lineTo(34, -132 + b);
        ctx.quadraticCurveTo(0, -126 + b, -34, -132 + b);
        ctx.fillStyle = D.lgx(ctx, -34, 34, '#c9d3e0'); ctx.fill(); stroke(ctx, 3);
        for (let i = -2; i <= 2; i++) D.circle(ctx, i * 12, -140 + b, 2, '#8a96a6');
        window_(ctx, -24, -180 + b, 48, 36, 12);
        ctx.save(); D.rr(ctx, -24, -180 + b, 48, 36, 12); ctx.clip();
        peekFace(ctx, who, 0, -158 + b, 19, o.mood);
        ctx.restore();
        D.rr(ctx, -24, -180 + b, 48, 36, 12); stroke(ctx, 3);
        // plume
        ctx.beginPath(); ctx.moveTo(-4, -198 + b); ctx.quadraticCurveTo(-10, -236 + b, 26, -232 + b); ctx.quadraticCurveTo(8, -218 + b, 6, -198 + b);
        D.fillVol(ctx, 6, -220 + b, 18, '#ef6b6b', 3);
        // sword: foil-wrapped tube
        ctx.save(); ctx.translate(58, -84 + b); ctx.rotate(0.3 + (o.swing || 0));
        D.rr(ctx, -7, -118, 14, 112, 6); ctx.fillStyle = D.lgx(ctx, -7, 7, '#e9eef6'); ctx.fill(); stroke(ctx, 3);
        D.line(ctx, -2, -110, -2, -14, 'rgba(255,255,255,.9)', 2);
        D.box3(ctx, -22, -10, 44, 10, 6, { fill: C.cardD, lw: 3, flute: false });
        D.rr(ctx, -5, 0, 10, 24, 4); ctx.fillStyle = '#8a5a2e'; ctx.fill(); stroke(ctx, 2.5);
        D.tape(ctx, -9, -70, 18, 10, 0.2);
        ctx.restore();
        // pizza-box shield
        ctx.beginPath(); ctx.arc(-58, -82 + b, 28, 0, TAU);
        D.fillVol(ctx, -58, -82 + b, 28, C.cardL, 3);
        ctx.beginPath(); ctx.arc(-58, -82 + b, 20, 0, TAU); stroke(ctx, 2, 'rgba(120,70,30,.35)');
        D.heart(ctx, -58, -80 + b, 13, '#ef6b6b');
        break;
      }
      case 'tower': {
        const bb = b * 0.5;
        D.box3(ctx, -50, -156 + bb, 100, 156, 22, { fill: '#cbbba5', lw: 3, fstep: 9, noTop: true });
        for (let i = 0; i < 4; i++) D.box3(ctx, -50 + i * 27, -180 + bb, 19, 24, 8, { fill: '#cbbba5', lw: 3, flute: false });
        ctx.strokeStyle = 'rgba(80,50,30,.22)'; ctx.lineWidth = 2;
        for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) ctx.strokeRect(-46 + c * 31 + (r % 2) * 14, -148 + r * 26 + bb, 28, 24);
        window_(ctx, -26, -126 + bb, 52, 52, 24);
        ctx.save(); D.rr(ctx, -26, -126 + bb, 52, 52, 24); ctx.clip();
        peekFace(ctx, who, 0, -98 + bb, 20, o.mood);
        ctx.restore();
        D.rr(ctx, -26, -126 + bb, 52, 52, 24); stroke(ctx, 3);
        D.rr(ctx, -17, -44, 34, 44, 16); ctx.fillStyle = D.lgx(ctx, -17, 17, '#8a5a2e'); ctx.fill(); stroke(ctx, 3);
        D.line(ctx, 0, -180 + bb, 0, -224 + bb, C.ink, 3);
        const fw = Math.sin(t * 4) * 4;
        D.poly(ctx, [0, -224 + bb, 34, -216 + bb + fw, 0, -206 + bb], '#6fc3ff', C.ink, 2);
        break;
      }
      case 'kite': {
        const flap = Math.sin(t * 6) * 0.15;
        ctx.save(); ctx.translate(0, -112 + b * 2); ctx.rotate(flap);
        D.poly(ctx, [0, -82, 62, 0, 0, 72, -62, 0], '#ff8fb1', C.ink, 3);
        D.poly(ctx, [0, -82, 62, 0, 0, 0], '#ffc2d6');
        D.poly(ctx, [0, 72, -62, 0, 0, 0], '#e8729a');
        D.line(ctx, 0, -82, 0, 72, C.ink, 2.5);
        D.line(ctx, -62, 0, 62, 0, C.ink, 2.5);
        D.ball(ctx, 0, -6, 24, '#fff4dc', { lw: 3 });
        peekFace(ctx, who, 0, -6, 19, o.mood);
        ctx.restore();
        ctx.beginPath(); ctx.moveTo(0, -40 + b * 2);
        for (let i = 0; i < 5; i++) ctx.quadraticCurveTo(-15 + (i % 2) * 30, -30 + i * 8, Math.sin(t * 3 + i) * 10, -20 + i * 8);
        stroke(ctx, 2);
        for (let i = 0; i < 3; i++) {
          const bx = Math.sin(t * 3 + i) * 10;
          D.poly(ctx, [bx - 7, -30 + i * 9, bx + 7, -30 + i * 9, bx, -21 + i * 9], ['#ffd25a', '#6cc56c', '#5aa9e6'][i], C.ink, 1);
        }
        break;
      }
      case 'lighthouse': {
        ctx.beginPath(); ctx.moveTo(-42, 0); ctx.lineTo(-29, -152); ctx.lineTo(29, -152); ctx.lineTo(42, 0); ctx.closePath();
        ctx.fillStyle = D.lgx(ctx, -42, 42, '#fffaf0'); ctx.fill();
        ctx.save(); ctx.clip();
        ctx.fillStyle = D.lgx(ctx, -42, 42, '#ef6b6b');
        ctx.fillRect(-50, -42, 100, 30); ctx.fillRect(-50, -104, 100, 30);
        ctx.restore();
        ctx.beginPath(); ctx.moveTo(-42, 0); ctx.lineTo(-29, -152); ctx.lineTo(29, -152); ctx.lineTo(42, 0); ctx.closePath(); stroke(ctx, 3);
        D.box3(ctx, -36, -170, 72, 18, 10, { fill: C.cardD, lw: 3, flute: false });
        D.rr(ctx, -26, -216, 52, 46, 12);
        const lg = ctx.createRadialGradient(0, -193, 4, 0, -193, 36);
        lg.addColorStop(0, '#fffbe0'); lg.addColorStop(1, '#ffd84a');
        ctx.fillStyle = lg; ctx.fill(); stroke(ctx, 3);
        peekFace(ctx, who, 0, -193, 18, o.mood);
        ctx.beginPath(); ctx.moveTo(-32, -216); ctx.quadraticCurveTo(0, -250, 32, -216); ctx.closePath();
        D.fillVol(ctx, -6, -226, 22, '#ef6b6b', 3);
        const beam = (Math.sin(t * 2) + 1) / 2;
        ctx.globalAlpha = 0.22 + beam * 0.2;
        D.poly(ctx, [26, -200, 150, -248, 150, -152], '#fff6a8');
        ctx.globalAlpha = 1;
        break;
      }
      case 'bulldozer': {
        // treads
        D.rr(ctx, -74, -38, 148, 34, 17); ctx.fillStyle = D.lgx(ctx, -74, 74, '#4a4a55'); ctx.fill(); stroke(ctx, 3);
        for (let i = -2; i <= 2; i++) D.ball(ctx, i * 27, -21, 10, '#8a8f99', { lw: 2 });
        const bb = b * 0.5;
        D.box3(ctx, -60, -104 + bb, 104, 66, 18, { fill: '#ffc93c', lw: 3, flute: false });
        D.box3(ctx, -44, -156 + bb, 64, 52, 14, { fill: '#ffc93c', lw: 3, flute: false });
        window_(ctx, -36, -150 + bb, 48, 40, 8);
        ctx.save(); D.rr(ctx, -36, -150 + bb, 48, 40, 8); ctx.clip();
        peekFace(ctx, who, -12, -128 + bb, 18, o.mood);
        ctx.restore();
        D.rr(ctx, -36, -150 + bb, 48, 40, 8); stroke(ctx, 3);
        D.ball(ctx, -12, -168 + bb, 6, Math.sin(t * 8) > 0 ? '#ff8a3a' : '#ffd25a', { lw: 2 });
        ctx.fillStyle = '#2b2b2b';
        for (let i = 0; i < 5; i++) { ctx.save(); D.rr(ctx, -60, -56 + bb, 104, 12, 2); ctx.clip(); D.line(ctx, -60 + i * 24, -44 + bb, -48 + i * 24, -56 + bb, '#2b2b2b', 8); ctx.restore(); }
        ctx.save(); ctx.translate(50, -62); ctx.rotate(o.swing || 0);
        ctx.beginPath(); ctx.moveTo(0, -42); ctx.lineTo(40, -52); ctx.quadraticCurveTo(58, -10, 50, 32); ctx.lineTo(10, 22); ctx.closePath();
        ctx.fillStyle = D.lgx(ctx, 0, 54, '#aab3bd'); ctx.fill(); stroke(ctx, 3);
        ctx.restore();
        break;
      }
      case 'bridge': {
        D.box3(ctx, -84, -74, 168, 16, 14, { fill: C.cardD, lw: 3, flute: false });
        D.box3(ctx, -74, -176, 20, 176, 10, { fill: '#ef6b6b', lw: 3, flute: false });
        D.box3(ctx, 54, -176, 20, 176, 10, { fill: '#ef6b6b', lw: 3, flute: false });
        ctx.beginPath(); ctx.moveTo(-64, -170); ctx.quadraticCurveTo(0, -62 + b, 64, -170); stroke(ctx, 4.5);
        for (let i = -4; i <= 4; i++) {
          const xx = i * 12.5;
          const yy = -170 + (1 - (xx / 64) ** 2) * 54 + b * (1 - (xx / 64) ** 2) * 0.5;
          D.line(ctx, xx, yy, xx, -74, C.ink, 2);
        }
        D.box3(ctx, -28, -136 + b, 56, 50, 10, { fill: C.cardL, lw: 3 });
        window_(ctx, -20, -130 + b, 40, 38, 14);
        ctx.save(); D.rr(ctx, -20, -130 + b, 40, 38, 14); ctx.clip();
        peekFace(ctx, who, 0, -110 + b, 17, o.mood);
        ctx.restore();
        D.rr(ctx, -20, -130 + b, 40, 38, 14); stroke(ctx, 3);
        break;
      }
      case 'snowplow': {
        D.rr(ctx, -64, -40, 128, 36, 18); ctx.fillStyle = D.lgx(ctx, -64, 64, '#3e4a5a'); ctx.fill(); stroke(ctx, 3);
        for (let i = -2; i <= 2; i++) D.ball(ctx, i * 23, -22, 9, '#8a8f99', { lw: 2 });
        const bb = b * 0.5;
        D.box3(ctx, -52, -124 + bb, 94, 84, 18, { fill: '#6fa8dc', lw: 3, flute: false });
        window_(ctx, -40, -112 + bb, 56, 40, 10);
        ctx.save(); D.rr(ctx, -40, -112 + bb, 56, 40, 10); ctx.clip();
        peekFace(ctx, who, -12, -90 + bb, 18, o.mood);
        ctx.restore();
        D.rr(ctx, -40, -112 + bb, 56, 40, 10); stroke(ctx, 3);
        D.ball(ctx, -10, -140 + bb, 7, '#ffd25a', { lw: 2 });
        ctx.save(); ctx.translate(58, -42); ctx.rotate(o.swing || 0);
        ctx.beginPath(); ctx.moveTo(0, -62); ctx.quadraticCurveTo(32, -20, 0, 22); ctx.lineTo(16, 22); ctx.quadraticCurveTo(48, -20, 16, -62); ctx.closePath();
        D.fillVol(ctx, 10, -20, 30, '#ef6b6b', 3);
        ctx.restore();
        break;
      }
      case 'umbrella': {
        // a yellow cardboard raincoat-suit with a giant paper parasol
        D.box3(ctx, -24, -42, 18, 42, 8, { fill: '#f0c43a', lw: 3, flute: false });
        D.box3(ctx, 6, -42, 18, 42, 8, { fill: '#f0c43a', lw: 3, flute: false });
        D.rr(ctx, -40, -124 + b, 80, 86, 20);
        D.fillVol(ctx, -6, -84 + b, 52, '#ffd84a', 3);
        for (let i = 0; i < 3; i++) D.ball(ctx, 0, -106 + i * 20 + b, 4.5, '#fffaf0', { lw: 2 });
        // hood
        ctx.beginPath(); ctx.arc(0, -148 + b, 34, Math.PI * 0.85, Math.PI * 2.15); ctx.closePath();
        D.fillVol(ctx, -8, -156 + b, 34, '#ffd84a', 3);
        peekFace(ctx, who, 0, -144 + b, 20, o.mood);
        ctx.save(); ctx.translate(44, -114 + b); ctx.rotate(-0.25 + (o.swing || 0) * 0.6);
        D.line(ctx, 0, 0, 0, -122, C.ink, 6);
        D.line(ctx, 0, 0, 0, -122, '#8a5a2e', 3.5);
        ctx.beginPath(); ctx.moveTo(-94, -112); ctx.quadraticCurveTo(0, -206, 94, -112);
        for (let i = 3; i >= -3; i--) ctx.quadraticCurveTo(i * 31 + 15, -102, i * 31, -112);
        ctx.closePath();
        D.fillVol(ctx, -20, -160, 90, '#5aa9e6', 3);
        for (let i = -2; i <= 2; i++) D.line(ctx, 0, -162, i * 35, -110, 'rgba(255,255,255,.5)', 2);
        D.ball(ctx, 0, -164, 6, '#ef6b6b', { lw: 2 });
        ctx.restore();
        break;
      }
      case 'hardhat': {
        D.box3(ctx, -26, -48, 20, 48, 8, { fill: '#5a6d8a', lw: 3, flute: false });
        D.box3(ctx, 6, -48, 20, 48, 8, { fill: '#5a6d8a', lw: 3, flute: false });
        D.rr(ctx, -44, -130 + b, 88, 88, 16);
        D.fillVol(ctx, -6, -90 + b, 56, '#ff9c3a', 3);
        ctx.fillStyle = '#fff36a'; ctx.fillRect(-43, -100 + b, 86, 9); ctx.fillRect(-43, -74 + b, 86, 9);
        peekFace(ctx, who, 0, -158 + b, 30, o.mood);
        ctx.beginPath(); ctx.arc(0, -170 + b, 34, Math.PI, 0); ctx.closePath();
        D.fillVol(ctx, -8, -182 + b, 34, '#ffc93c', 3);
        D.rr(ctx, -46, -174 + b, 92, 11, 5); ctx.fillStyle = '#f0b52a'; ctx.fill(); stroke(ctx, 3);
        ctx.save(); ctx.translate(52, -98 + b); ctx.rotate(-0.3 + (o.swing || 0));
        D.rr(ctx, -7, -92, 15, 92, 4); ctx.fillStyle = D.lgx(ctx, -7, 8, '#ffe08a'); ctx.fill(); stroke(ctx, 3);
        for (let i = 0; i < 8; i++) D.line(ctx, -7, -86 + i * 10, -1, -86 + i * 10, C.ink, 1.5);
        ctx.restore();
        D.box3(ctx, -74, -104 + b, 36, 24, 8, { fill: '#5aa9e6', lw: 3, flute: false });
        break;
      }
    }
    ctx.restore();
  };

  // ----------------------------------------------------------- enemies
  // Monsters and Society agents in battle. feet (x, y)
  D.enemy = function (ctx, type, x, y, o = {}) {
    const t = CK.time;
    const s = (o.s || 1) * ({ barnacle: 1.5, leafling: 1.6, slush: 1.45, pumpbot: 1.35 }[type] || 1);
    const mood = o.calm ? 'happy' : o.mood || 'angry';
    ctx.save();
    if (o.flash) ctx.filter = 'brightness(2)';
    if (o.stun) ctx.globalAlpha = 0.85;
    switch (type) {
      case 'swabby': D.shadow(ctx, x, y, 40 * s, 10 * s); CH.swabby(ctx, x, y, { s: 2.6 * s, seed: o.seed, mood, patch: o.seed % 2 }); break;
      case 'splashling': D.shadow(ctx, x, y, 32 * s, 8 * s); CH.splashling(ctx, x, y, { s: 2.6 * s, seed: o.seed, mood }); break;
      case 'bess': D.shadow(ctx, x, y, 56 * s, 12 * s); CH.bess(ctx, x, y, { s: 2.7 * s, mood }); break;
      case 'magpie': D.shadow(ctx, x, y, 32 * s, 9 * s); CH.magpie(ctx, x, y, { s: 2.5 * s, seed: o.seed, mood: o.calm ? 'sad' : 'angry' }); break;
      case 'corvin': D.shadow(ctx, x, y, 50 * s, 12 * s); CH.magpie(ctx, x, y, { s: 3.6 * s, big: true, seed: 1, mood: o.calm ? 'sad' : 'angry' }); break;
      case 'barnacle': {
        // a rocky shell with crab claws and a glow inside
        D.shadow(ctx, x, y, 44 * s, 10 * s);
        for (const k of [-1, 1]) {
          const snap = Math.sin(t * 4 + k) * 0.15;
          ctx.save(); ctx.translate(x + k * 40 * s, y - 22 * s); ctx.rotate(k * (0.4 + snap));
          D.egg(ctx, 0, 0, 13 * s, 10 * s, '#e8744a', { lw: 2.5 });
          D.poly(ctx, [k * 2 * s, -2 * s, k * 14 * s, -6 * s, k * 6 * s, 3 * s], '#3a1c14');
          ctx.restore();
        }
        ctx.beginPath(); ctx.moveTo(x - 40 * s, y); ctx.quadraticCurveTo(x - 40 * s, y - 62 * s, x, y - 66 * s); ctx.quadraticCurveTo(x + 40 * s, y - 62 * s, x + 40 * s, y); ctx.closePath();
        D.fillVol(ctx, x, y - 32 * s, 46 * s, '#9fb0b8', 3);
        for (let i = 0; i < 6; i++) {
          const bx = x + (i - 2.5) * 12 * s, by = y - 12 * s - (i % 2) * 18 * s - (i > 1 && i < 4 ? 22 * s : 0);
          D.poly(ctx, [bx - 6 * s, by, bx - 2.5 * s, by - 10 * s, bx + 2.5 * s, by - 10 * s, bx + 6 * s, by], '#d6e0e3', C.ink, 1.5);
          D.ellipse(ctx, bx, by - 10 * s, 2.5 * s, 1.2 * s, '#5a6a72');
        }
        D.egg(ctx, x, y - 38 * s, 22 * s, 13 * s, '#2a2235', { lw: 2 });
        monsterEyes(ctx, x, y - 40 * s, 9 * s, 5 * s, { mood, seed: o.seed });
        break;
      }
      case 'pumpbot': {
        // a Quill pumping machine: tidy, grey, stamped with the Society's feather
        D.shadow(ctx, x, y, 42 * s, 9 * s);
        for (const k of [-1, 1]) D.ball(ctx, x + k * 16 * s, y - 9 * s, 10 * s, '#5a5f6a', { lw: 2 });
        D.box3(ctx, x - 32 * s, y - 76 * s, 64 * s, 64 * s, 16 * s, { fill: '#8fa0b5', lw: 3, flute: false });
        window_(ctx, x - 22 * s, y - 64 * s, 44 * s, 20 * s, 8 * s);
        const lamp = o.phase2 ? '#ff8a6a' : '#ffe14d';
        D.ball(ctx, x - 9 * s, y - 54 * s, 4.5 * s, lamp, { lw: 1.5 });
        D.ball(ctx, x + 9 * s, y - 54 * s, 4.5 * s, lamp, { lw: 1.5 });
        // a pressure gauge
        D.circle(ctx, x - 14 * s, y - 28 * s, 8 * s, '#fffaf0', C.ink, 2);
        D.line(ctx, x - 14 * s, y - 28 * s, x - 14 * s + Math.cos(t * 2) * 6 * s, y - 28 * s + Math.sin(t * 2) * 6 * s, '#ef6b6b', 2);
        D.icon(ctx, 'feather', x + 12 * s, y - 28 * s, s);
        D.box3(ctx, x + 32 * s, y - 52 * s, 26 * s, 10 * s, 6 * s, { fill: '#6f7d8f', lw: 2, flute: false });
        break;
      }
      case 'leafling': {
        D.shadow(ctx, x, y, 32 * s, 8 * s);
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * TAU + t * 0.5;
          D.poly(ctx, [x + Math.cos(a) * 18 * s, y - 30 * s + Math.sin(a) * 18 * s, x + Math.cos(a + 0.3) * 33 * s, y - 30 * s + Math.sin(a + 0.3) * 33 * s, x + Math.cos(a + 0.6) * 18 * s, y - 30 * s + Math.sin(a + 0.6) * 18 * s], ['#e8743b', '#f2a93b', '#c94f2c'][i % 3], C.ink, 1.5);
        }
        for (const k of [-1, 1]) D.poly(ctx, [x + k * 8 * s, y - 46 * s, x + k * 16 * s, y - 64 * s, x + k * 15 * s, y - 44 * s], '#c94f2c', C.ink, 1.8);
        D.ball(ctx, x, y - 30 * s, 22 * s, '#e8743b', { lw: 2.2 });
        monsterEyes(ctx, x, y - 33 * s, 8 * s, 4.4 * s, { mood, seed: o.seed });
        monsterGrin(ctx, x, y - 22 * s, 16 * s, { mood, teeth: 4 });
        break;
      }
      case 'slush': {
        D.shadow(ctx, x, y, 40 * s, 9 * s);
        const w = Math.sin(t * 4 + (o.seed || 0)) * 3 * s;
        ctx.beginPath(); ctx.moveTo(x - 38 * s, y);
        ctx.quadraticCurveTo(x - 36 * s - w, y - 54 * s, x, y - 56 * s);
        ctx.quadraticCurveTo(x + 36 * s + w, y - 54 * s, x + 38 * s, y);
        ctx.closePath();
        ctx.fillStyle = D.vg(ctx, x, y - 28 * s, 42 * s, '#d4ecf9'); ctx.fill(); stroke(ctx, 3, '#4a7a9a');
        // icicle drips along the brow
        for (let i = -2; i <= 2; i++) D.poly(ctx, [x + i * 10 * s - 3 * s, y - 46 * s + Math.abs(i) * 3 * s, x + i * 10 * s + 3 * s, y - 46 * s + Math.abs(i) * 3 * s, x + i * 10 * s, y - 38 * s + Math.abs(i) * 3 * s], '#ffffff', '#7aa6c4', 1);
        D.circle(ctx, x - 16 * s, y - 40 * s, 5 * s, '#fff');
        monsterEyes(ctx, x, y - 28 * s, 10 * s, 5 * s, { mood, seed: o.seed, glow: '170,225,255' });
        monsterGrin(ctx, x, y - 16 * s, 20 * s, { mood, teeth: 5 });
        break;
      }
      case 'moatengine': {
        D.shadow(ctx, x, y, 90 * s, 16 * s);
        D.box3(ctx, x - 80 * s, y - 150 * s, 160 * s, 150 * s, 30 * s, { fill: '#8f9db0', lw: 4, flute: false });
        for (let i = 0; i < 3; i++) D.box3(ctx, x - 70 * s + i * 50 * s, y - 192 * s, 36 * s, 42 * s, 12 * s, { fill: '#6f7d8f', lw: 3, flute: false });
        window_(ctx, x - 56 * s, y - 128 * s, 112 * s, 44 * s, 14 * s);
        const lamp = o.phase2 ? '#ff6b6b' : '#ffe14d';
        D.ball(ctx, x - 24 * s, y - 106 * s, 10 * s, lamp, { lw: 2 });
        D.ball(ctx, x + 24 * s, y - 106 * s, 10 * s, lamp, { lw: 2 });
        const wheel = t * 3;
        ctx.save(); ctx.translate(x, y - 40 * s); ctx.rotate(wheel);
        for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); D.rr(ctx, -4 * s, 0, 8 * s, 30 * s, 3); ctx.fillStyle = '#c9d3e0'; ctx.fill(); stroke(ctx, 2); }
        ctx.restore();
        D.ball(ctx, x, y - 40 * s, 10 * s, '#5a5f6a', { lw: 2 });
        D.icon(ctx, 'feather', x + 60 * s, y - 70 * s, 1.6 * s);
        D.box3(ctx, x - 120 * s, y - 120 * s, 44 * s, 18 * s, 10 * s, { fill: '#6f7d8f', lw: 3, flute: false });
        break;
      }
      case 'clogwood': {
        D.shadow(ctx, x, y, 96 * s, 18 * s);
        for (let i = 0; i < 44; i++) {
          const a = U.hash(i, 1) * TAU, r = Math.sqrt(U.hash(i, 2)) * 72 * s;
          const lx = x + Math.cos(a) * r * 1.2, ly = y - 82 * s + Math.sin(a) * r * 0.9 + Math.sin(t * 2 + i) * 2;
          ctx.save(); ctx.translate(lx, ly); ctx.rotate(a + t * 0.3);
          const col = ['#e8743b', '#f2a93b', '#c94f2c', '#b5562e', '#d9b44a'][i % 5];
          D.poly(ctx, [0, -14 * s, 10 * s, 0, 0, 14 * s, -10 * s, 0], Math.sin(a) < -0.2 ? D.shade(col, 0.15) : Math.sin(a) > 0.4 ? D.shade(col, -0.2) : col, C.ink, 1.5);
          ctx.restore();
        }
        if (o.calm) {
          eyes(ctx, x, y - 96 * s, 22 * s, 9 * s, { sad: true, seed: 4 });
          D.mouth(ctx, x, y - 66 * s, 22 * s, 'sad');
        } else {
          monsterEyes(ctx, x, y - 98 * s, 24 * s, 11 * s, { mood: 'angry', seed: 4 });
          monsterGrin(ctx, x, y - 72 * s, 48 * s, { mood: 'angry', teeth: 6 });
        }
        break;
      }
      case 'drizzle': {
        D.shadow(ctx, x, y, 110 * s, 16 * s, 0.3);
        const yy = y - 150 * s;
        const col = o.calm ? '#cfd8e6' : '#7d879c';
        for (let i = 0; i < 9; i++) {
          const ox = (i - 4) * 26 * s, oy = Math.abs(i - 4) * 9 * s + Math.sin(t * 1.5 + i) * 4;
          D.ball(ctx, x + ox, yy + oy, 38 * s, col, { lw: 3, k: 0.6 });
        }
        for (let i = 0; i < 9; i++) {
          const ox = (i - 4) * 26 * s, oy = Math.abs(i - 4) * 9 * s + Math.sin(t * 1.5 + i) * 4;
          ctx.beginPath(); ctx.arc(x + ox, yy + oy, 35 * s, 0, TAU);
          ctx.fillStyle = D.vg(ctx, x + ox, yy + oy - 6 * s, 38 * s, col, 0.6); ctx.fill();
        }
        eyes(ctx, x, yy, 30 * s, 10 * s, { sad: !o.calm, happy: o.calm, seed: 6, eyeColor: '#2b1a10' });
        if (o.calm) D.blush(ctx, x, yy + 18 * s, 40 * s, 8 * s);
        D.mouth(ctx, x, yy + 26 * s, 20 * s, o.calm ? 'smile' : 'sad');
        for (let i = 0; i < 14; i++) {
          const p = (t * 1.2 + i * 0.37) % 1;
          const rx = x + (U.hash(i, 3) - 0.5) * 200 * s;
          D.line(ctx, rx, yy + 40 * s + p * 140 * s, rx - 3, yy + 52 * s + p * 140 * s, '#6fb5e8', 3);
        }
        if (o.cage) {
          for (let i = -3; i <= 3; i++) D.line(ctx, x + i * 40 * s, yy - 70 * s, x + i * 40 * s, yy + 60 * s, C.silver, 5);
          ctx.beginPath(); ctx.ellipse(x, yy - 70 * s, 130 * s, 20 * s, 0, 0, TAU); stroke(ctx, 5, C.silver);
        }
        break;
      }
      case 'gremlin': {
        // Gutter Gremlins: storm-drain imps that only show up in the real world when it pours
        D.shadow(ctx, x, y, 30 * s, 8 * s);
        CH.gremlin(ctx, x, y, { s: 2.4 * s, seed: o.seed, mood });
        break;
      }
      case 'moth': D.shadow(ctx, x, y, 30 * s, 8 * s); CH.moth(ctx, x, y, { s: 2.5 * s, seed: o.seed, mood }); break;
      case 'heron': D.shadow(ctx, x, y, 40 * s, 10 * s); CH.heron(ctx, x, y, { s: 2.9 * s, seed: 1, mood: o.calm ? 'sad' : 'angry' }); break;
      case 'dust': D.shadow(ctx, x, y, 30 * s, 8 * s); CH.dust(ctx, x, y, { s: 2.5 * s, seed: o.seed, mood }); break;
      case 'rook': D.shadow(ctx, x, y, 44 * s, 11 * s); CH.rook(ctx, x, y, { s: 3.3 * s, seed: 2, mood: o.calm ? 'sad' : 'angry' }); break;
      default:
        D.shadow(ctx, x, y, 30 * s, 8 * s);
        D.ball(ctx, x, y - 30 * s, 28 * s, '#cccccc');
    }
    ctx.restore();
  };

  // Gutter Gremlin: a soggy little leaf-and-bottlecap imp from the storm drains
  CH.gremlin = function (ctx, x, y, o) {
    const s = o.s || 1;
    const mood = o.mood;
    const hop = Math.abs(Math.sin(CK.time * 5 + (o.seed || 0))) * 3 * s;
    y -= hop;
    for (const k of [-1, 1]) D.egg(ctx, x + k * 6 * s, y + hop - 2 * s, 4.5 * s, 2.5 * s, '#4a5a4a', { lw: 1.5 });
    // a bottle-cap hat and leaf ears
    for (const k of [-1, 1]) {
      ctx.save(); ctx.translate(x + k * 13 * s, y - 20 * s); ctx.rotate(k * 0.9);
      D.poly(ctx, [0, -8 * s, 5 * s, 0, 0, 8 * s, -5 * s, 0], '#6faa4a', C.ink, 1.5);
      ctx.restore();
    }
    ctx.beginPath(); ctx.ellipse(x, y - 14 * s, 13 * s, 14 * s, 0, 0, TAU);
    D.fillVol(ctx, x, y - 14 * s, 15 * s, '#5f8f9a', 2);
    D.egg(ctx, x, y - 8 * s, 7 * s, 5 * s, '#cfe6e0', { lw: 0, k: 0.3 });
    D.box3(ctx, x - 8 * s, y - 29.5 * s, 16 * s, 3.5 * s, 3 * s, { fill: '#ef6b6b', lw: 1.5, flute: false });
    monsterEyes(ctx, x, y - 17 * s, 5 * s, 3.2 * s, { mood, seed: o.seed });
    monsterGrin(ctx, x, y - 10 * s, 9 * s, { mood, teeth: 3, fang: false });
    const dp = (CK.time + (o.seed || 0) * 0.3) % 1;
    D.ellipse(ctx, x + 9 * s, y - 4 * s + dp * 8 * s, 1.5 * s, 2.2 * s, `rgba(90,180,240,${1 - dp})`);
  };

  // Dust Bunny: a fluffball of attic dust with long floppy ears. Spooky glowing eyes in the dark,
  // a shy little smile once somebody finally comes up to visit.
  CH.dust = function (ctx, x, y, o) {
    const s = o.s || 1;
    const mood = o.mood;
    const seed = o.seed || 0;
    const hop = Math.abs(Math.sin(CK.time * 3.2 + seed)) * 2.5 * s;
    const ground = y;
    y -= hop;
    const fur = '#b9b2ad';
    // drifting motes
    for (let i = 0; i < 4; i++) {
      const p = (CK.time * 0.35 + i * 0.25 + seed * 0.1) % 1;
      D.circle(ctx, x + Math.sin(p * 6 + i) * 18 * s, y - 10 * s - p * 34 * s, (1.4 - p) * 1.4 * s, `rgba(220,214,206,${0.7 * (1 - p)})`);
    }
    for (const k of [-1, 1]) D.egg(ctx, x + k * 6 * s, ground - 1.6 * s, 4.2 * s, 2.4 * s, hexShade(fur, -0.2), { lw: 1.4 });
    // ears: long, soft, one always flopping over
    for (const k of [-1, 1]) {
      ctx.save();
      ctx.translate(x + k * 6 * s, y - 24 * s);
      ctx.rotate(k * (0.25 + (k > 0 ? 0.55 + Math.sin(CK.time * 2 + seed) * 0.08 : 0)));
      D.egg(ctx, 0, -9 * s, 4.2 * s, 10 * s, fur, { lw: 1.8 });
      D.ellipse(ctx, 0, -8 * s, 2 * s, 6.5 * s, '#e8c6c6');
      ctx.restore();
    }
    // fuzzy round body: a ring of little puffs around a shaded ball
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU + seed;
      D.circle(ctx, x + Math.cos(a) * 14 * s, y - 13 * s + Math.sin(a) * 12.5 * s, 4.2 * s, hexShade(fur, -0.1 + U.hash(i, seed) * 0.1), C.ink, 1.2);
    }
    D.ball(ctx, x, y - 13 * s, 14 * s, fur, { lw: 0, k: 0.8 });
    if (mood === 'angry') {
      monsterEyes(ctx, x, y - 15 * s, 5 * s, 3 * s, { mood, seed, glow: '190,160,255' });
      monsterGrin(ctx, x, y - 8 * s, 8 * s, { mood, teeth: 4, fang: false });
    } else {
      eyes(ctx, x, y - 14 * s, 5 * s, 2 * s, { happy: mood === 'happy', sad: mood === 'sad', seed });
      D.blush(ctx, x, y - 9.5 * s, 8.5 * s, 2.4 * s);
      D.mouth(ctx, x, y - 8.5 * s, 4 * s, mood === 'sad' ? 'sad' : 'smile');
    }
  };

  // Mortimer Rook: Corvin's old second-in-command. A tidy, ordinary rook in a tweed waistcoat,
  // bow tie and half-moon reading glasses, never without his clipboard.
  CH.rook = function (ctx, x, y, o) {
    const s = o.s || 1;
    const mood = o.mood;
    const bob = Math.abs(Math.sin(o.walk || CK.time * 2.6 + (o.seed || 0))) * 1.4 * s;
    const dir = o.dir || 'down';
    const side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const ground = y;
    y -= bob;
    const tweed = '#7a6a4e';
    D.poly(ctx, [x - 6 * s, y - 12 * s, x - 14 * s, y - 1 * s, x - 7 * s, y + 1 * s, x - 1 * s, y - 8 * s], '#262433', C.ink, 1.4);
    for (const k of [-1, 1]) {
      D.line(ctx, x + k * 4 * s, y - 8 * s, x + k * 4 * s, ground - 1 * s, '#3a3a44', 2 * s);
      D.line(ctx, x + k * 4 * s, ground - 1 * s, x + k * 4 * s + 4 * s, ground - 1 * s, '#3a3a44', 1.8 * s);
    }
    // black feathered body with a tweed waistcoat over it
    ctx.beginPath();
    ctx.moveTo(x - 10 * s, y - 30 * s);
    ctx.quadraticCurveTo(x - 14 * s, y - 16 * s, x - 11 * s, y - 6 * s);
    ctx.lineTo(x + 11 * s, y - 6 * s);
    ctx.quadraticCurveTo(x + 14 * s, y - 16 * s, x + 10 * s, y - 30 * s);
    ctx.closePath();
    D.fillVol(ctx, x, y - 18 * s, 16 * s, '#2a2733', 2);
    if (dir !== 'up') {
      ctx.beginPath();
      ctx.moveTo(x - 8 * s, y - 27 * s);
      ctx.lineTo(x - 9.5 * s, y - 8 * s);
      ctx.lineTo(x, y - 5 * s);
      ctx.lineTo(x + 9.5 * s, y - 8 * s);
      ctx.lineTo(x + 8 * s, y - 27 * s);
      ctx.lineTo(x, y - 18 * s);
      ctx.closePath();
      D.fillVol(ctx, x, y - 16 * s, 12 * s, tweed, 1.6);
      for (let i = 0; i < 3; i++) D.circle(ctx, x, y - 15 * s + i * 3.4 * s, 0.9 * s, '#e9d8a6');
      // white collar and a little red bow tie
      D.poly(ctx, [x - 4 * s, y - 29 * s, x + 4 * s, y - 29 * s, x, y - 22 * s], '#fffaf0', C.ink, 1.1);
      D.poly(ctx, [x - 4 * s, y - 28 * s, x, y - 26.5 * s, x - 4 * s, y - 25 * s], '#c94f4f', C.ink, 1);
      D.poly(ctx, [x + 4 * s, y - 28 * s, x, y - 26.5 * s, x + 4 * s, y - 25 * s], '#c94f4f', C.ink, 1);
    }
    // wings; one holds the clipboard
    D.egg(ctx, x - 12 * s, y - 20 * s, 4 * s, 8.5 * s, '#2a2733', { rot: 0.2, lw: 1.6 });
    ctx.save();
    ctx.translate(x + 13 * s, y - 16 * s);
    ctx.rotate(-0.15);
    D.rr(ctx, -5 * s, -9 * s, 11 * s, 14 * s, 1.5 * s);
    ctx.fillStyle = '#c9925a'; ctx.fill(); stroke(ctx, 1.4);
    D.rr(ctx, -3.6 * s, -6.5 * s, 8.2 * s, 10.5 * s, 0.8 * s);
    ctx.fillStyle = '#fffaf0'; ctx.fill();
    for (let i = 0; i < 3; i++) D.line(ctx, -2.4 * s, -4 * s + i * 2.6 * s, 3.4 * s, -4 * s + i * 2.6 * s, 'rgba(0,0,0,.35)', 0.8 * s);
    D.rr(ctx, -1.6 * s, -10 * s, 4.2 * s, 2.2 * s, 0.6 * s); ctx.fillStyle = '#c9d3e0'; ctx.fill();
    ctx.restore();
    D.egg(ctx, x + 11 * s, y - 20 * s, 4 * s, 8 * s, '#2a2733', { rot: -0.3, lw: 1.6 });
    // head: glossy black with the pale bare face rooks have around the beak
    const hy = y - 40 * s;
    D.ball(ctx, x, hy, 12.5 * s, '#24222e', { lw: 2.2, k: 1.4 });
    if (dir !== 'up') {
      const fx = x + side * 3 * s;
      D.egg(ctx, fx + side * 3 * s, hy + 4 * s, 5.5 * s, 4 * s, '#d9d2cc', { lw: 0, k: 0.3 });
      for (const k of [-1, 1]) {
        if (side && k === -side) continue;
        const ex = fx + k * 4.8 * s, ey = hy - 2 * s;
        D.circle(ctx, ex, ey, 2.5 * s, '#fffaf0', C.ink, 1);
        D.circle(ctx, ex + side * 0.6 * s, ey + 0.3 * s, 1.4 * s, '#120e14');
        D.circle(ctx, ex + side * 0.6 * s + 0.5 * s, ey - 0.4 * s, 0.45 * s, '#fff');
        if (mood === 'angry') D.line(ctx, ex - k * 3 * s, ey - 3.3 * s, ex + k * 2.5 * s, ey - 2.4 * s, '#6a6670', 1.4);
        if (mood === 'sad') D.line(ctx, ex - k * 3 * s, ey - 2.4 * s, ex + k * 2.5 * s, ey - 3.6 * s, '#6a6670', 1.4);
      }
      const bx = fx + side * 5 * s;
      D.poly(ctx, side ? [bx, hy + 1 * s, bx + side * 10 * s, hy + 4 * s, bx, hy + 6 * s] : [fx - 3.2 * s, hy + 2.5 * s, fx + 3.2 * s, hy + 2.5 * s, fx, hy + 10 * s], '#58545e', C.ink, 1.2);
      // half-moon reading glasses perched low
      for (const k of [-1, 1]) {
        if (side && k === -side) continue;
        ctx.beginPath();
        ctx.arc(fx + k * 4.8 * s, hy + 0.2 * s, 3.2 * s, 0, Math.PI);
        stroke(ctx, 1.2, '#d9b45a');
      }
      if (!side) D.line(ctx, fx - 1.6 * s, hy + 0.2 * s, fx + 1.6 * s, hy + 0.2 * s, '#d9b45a', 1);
    }
  };

  // Moth-kin: a round fuzzy moth with feathery antennae and big soft wings. In the glare they
  // get dizzy, glowy-eyed and grabby; in the dark they are sleepy and sweet.
  CH.moth = function (ctx, x, y, o) {
    const s = o.s || 1;
    const mood = o.mood;
    const seed = o.seed || 0;
    const hover = 8 * s + Math.sin(CK.time * 3 + seed) * 3 * s;
    y -= hover;
    const fur = '#e9dcc2', wing = '#c9b48e';
    const flap = 0.6 + Math.abs(Math.sin(CK.time * 9 + seed)) * 0.4;
    // wings with eye spots
    for (const k of [-1, 1]) {
      ctx.save();
      ctx.translate(x + k * 6 * s, y - 16 * s);
      ctx.scale(k * flap, 1);
      ctx.beginPath(); ctx.ellipse(10 * s, -6 * s, 13 * s, 10 * s, -0.4, 0, TAU);
      D.fillVol(ctx, 8 * s, -8 * s, 14 * s, wing, 1.8);
      ctx.beginPath(); ctx.ellipse(8 * s, 6 * s, 9 * s, 7 * s, 0.4, 0, TAU);
      D.fillVol(ctx, 8 * s, 6 * s, 10 * s, hexShade(wing, -0.1), 1.8);
      D.circle(ctx, 12 * s, -6 * s, 3.2 * s, '#8a6a9a', C.ink, 1);
      D.circle(ctx, 12 * s, -6 * s, 1.4 * s, '#fff3b0');
      ctx.restore();
    }
    // feathery antennae
    for (const k of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(x + k * 3 * s, y - 26 * s); ctx.quadraticCurveTo(x + k * 6 * s, y - 36 * s, x + k * 11 * s, y - 37 * s);
      stroke(ctx, 1.4);
      for (let i = 0; i < 4; i++) D.line(ctx, x + k * (5 + i * 1.6) * s, y - (31 + i * 1.5) * s, x + k * (7 + i * 1.6) * s, y - (28 + i * 1.5) * s, C.ink, 1);
    }
    // fluffy body with a ruff
    D.egg(ctx, x, y - 6 * s, 7 * s, 9 * s, hexShade(fur, -0.15), { lw: 1.8 });
    for (let i = 0; i < 9; i++) { const a = Math.PI * (0.05 + i * 0.11); D.circle(ctx, x + Math.cos(a) * 11 * s, y - 14 * s + Math.sin(a) * 6 * s, 3.4 * s, '#fffaf0', C.ink, 1); }
    D.ball(ctx, x, y - 19 * s, 11 * s, fur, { lw: 2, k: 0.8 });
    if (mood === 'angry') {
      monsterEyes(ctx, x, y - 20 * s, 4.8 * s, 3.3 * s, { mood, seed, glow: '255,190,90' });
      monsterGrin(ctx, x, y - 13 * s, 7 * s, { mood, teeth: 3, fang: false });
    } else {
      eyes(ctx, x, y - 20 * s, 4.6 * s, 2.3 * s, { happy: mood === 'happy', sad: mood === 'sad', seed });
      D.blush(ctx, x, y - 15 * s, 7.5 * s, 2.2 * s);
      D.mouth(ctx, x, y - 14 * s, 3.4 * s, mood === 'sad' ? 'sad' : 'smile');
    }
  };

  // Mr. Lux: a tall, tidy grey heron who sells very, very bright lanterns. Cardigan, neat crest,
  // and a lantern on a long pole that he never puts down.
  CH.heron = function (ctx, x, y, o) {
    const s = o.s || 1;
    const mood = o.mood;
    const dir = o.dir || 'down';
    const side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const sway = Math.sin(CK.time * 1.6 + (o.seed || 0)) * 1.2 * s;
    const grey = '#b9c2cc';
    for (const k of [-1, 1]) {
      D.line(ctx, x + k * 4 * s, y - 16 * s, x + k * 4 * s, y - 1 * s, '#d9a24a', 2 * s);
      D.line(ctx, x + k * 4 * s, y - 1 * s, x + k * 4 * s + 5 * s, y - 1 * s, '#d9a24a', 1.8 * s);
    }
    // body in a mustard cardigan
    ctx.beginPath(); ctx.ellipse(x + sway * 0.3, y - 28 * s, 12 * s, 14 * s, 0, 0, TAU);
    D.fillVol(ctx, x, y - 30 * s, 15 * s, '#d9b24a', 2);
    D.poly(ctx, [x - 4 * s, y - 40 * s, x + 4 * s, y - 40 * s, x, y - 24 * s], '#eef1f4', C.ink, 1.2);
    for (let i = 0; i < 3; i++) D.circle(ctx, x + 2 * s, y - 34 * s + i * 4.5 * s, 1 * s, '#7a5a2a');
    D.egg(ctx, x - 12 * s, y - 28 * s, 4 * s, 9 * s, '#d9b24a', { rot: 0.2, lw: 1.6 });
    // the lantern pole
    const lx = x + 18 * s, ly = y - 66 * s;
    D.line(ctx, lx, y - 2 * s, lx, ly, '#6a4a32', 2.2 * s);
    D.line(ctx, lx, ly, lx + 8 * s, ly, '#6a4a32', 1.8 * s);
    const glow = ctx.createRadialGradient(lx + 8 * s, ly + 10 * s, 1, lx + 8 * s, ly + 10 * s, 26 * s);
    glow.addColorStop(0, 'rgba(255,230,140,0.55)'); glow.addColorStop(1, 'rgba(255,230,140,0)');
    ctx.fillStyle = glow; ctx.fillRect(lx - 20 * s, ly - 18 * s, 56 * s, 56 * s);
    D.ball(ctx, lx + 8 * s, ly + 10 * s, 6 * s, '#fff3b0', { lw: 1.6 });
    D.egg(ctx, x + 12 * s, y - 28 * s, 4 * s, 9 * s, '#d9b24a', { rot: -0.4, lw: 1.6 });
    // long neck and head
    const hx = x + side * 4 * s + sway, hy = y - 62 * s;
    ctx.beginPath(); ctx.moveTo(x - 3 * s, y - 40 * s); ctx.quadraticCurveTo(x - 8 * s + sway, y - 52 * s, hx - 3 * s, hy + 6 * s);
    ctx.lineTo(hx + 3 * s, hy + 6 * s); ctx.quadraticCurveTo(x - 1 * s + sway, y - 52 * s, x + 3 * s, y - 40 * s); ctx.closePath();
    D.fillVol(ctx, x, y - 50 * s, 8 * s, grey, 1.6);
    D.ball(ctx, hx, hy, 8 * s, grey, { lw: 2 });
    // a neat black crest plume
    ctx.beginPath(); ctx.moveTo(hx - 2 * s, hy - 6 * s); ctx.quadraticCurveTo(hx - 12 * s, hy - 10 * s, hx - 16 * s, hy - 4 * s); stroke(ctx, 2 * s, '#2a2733');
    D.line(ctx, hx - 5 * s, hy - 3 * s, hx + 5 * s, hy - 3 * s, '#2a2733', 2.4 * s);
    if (dir !== 'up') {
      for (const k of [-1, 1]) {
        if (side && k === -side) continue;
        const ex = hx + k * 3.6 * s, ey = hy - 0.5 * s;
        D.circle(ctx, ex, ey, 2.2 * s, '#fff3b0', C.ink, 1);
        D.circle(ctx, ex + side * 0.5 * s, ey + 0.2 * s, 1.1 * s, '#120e14');
        if (mood === 'angry') D.line(ctx, ex - k * 2.6 * s, ey - 2.8 * s, ex + k * 2 * s, ey - 2 * s, '#4a4a55', 1.2);
        if (mood === 'sad') D.line(ctx, ex - k * 2.6 * s, ey - 2 * s, ex + k * 2 * s, ey - 3 * s, '#4a4a55', 1.2);
      }
      const bx = hx + side * 4 * s;
      D.poly(ctx, side ? [bx, hy + 1 * s, bx + side * 15 * s, hy + 3 * s, bx, hy + 5 * s] : [hx - 2.4 * s, hy + 3 * s, hx + 2.4 * s, hy + 3 * s, hx, hy + 14 * s], '#e0a83a', C.ink, 1.2);
    }
  };
})();
