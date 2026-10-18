// Cardboard Kingdom - procedural "cardboard and marker" art kit.
(function () {
  'use strict';
  const CK = window.CK;
  const U = CK.U;
  const D = (CK.D = {});
  const C = (D.C = {
    card: '#d9a66b', cardL: '#ecc38c', cardD: '#b07c45', cardDD: '#8a5a2e',
    ink: '#4a2c17', tape: '#f3e6b8', paper: '#fffaf0',
    red: '#ef6b6b', blue: '#5aa9e6', green: '#6cc56c', yellow: '#ffd25a', pink: '#ff9ec7',
    purple: '#a68be6', water: '#4cc2ea', waterD: '#2a8fc0', silver: '#c9d3e0', night: '#1d1847',
  });

  // ------------------------------------------------------------ primitives
  D.rr = function (ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  D.circle = function (ctx, x, y, r, fill, stroke, lw) {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw || 2;
      ctx.stroke();
    }
  };
  D.ellipse = function (ctx, x, y, rx, ry, fill, stroke, lw, rot) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, Math.PI * 2);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw || 2;
      ctx.stroke();
    }
  };
  D.poly = function (ctx, pts, fill, stroke, lw) {
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw || 2;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  };
  D.line = function (ctx, x1, y1, x2, y2, color, lw) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw || 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };
  // soft contact shadow. Light comes from the upper left, so shadows fall a little down and to the right.
  D.shadow = function (ctx, x, y, rx, ry, a) {
    a = a == null ? 0.26 : a;
    rx = Math.max(1, rx);
    ctx.save();
    ctx.translate(x + rx * 0.1, y + ry * 0.12);
    ctx.scale(1, Math.max(0.05, ry / rx));
    const g = ctx.createRadialGradient(0, 0, rx * 0.15, 0, 0, rx * 1.12);
    g.addColorStop(0, `rgba(40,20,10,${a})`);
    g.addColorStop(0.55, `rgba(40,20,10,${a * 0.75})`);
    g.addColorStop(1, 'rgba(40,20,10,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rx * 1.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  D.shade = function (hex, amt) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map((ch) => ch + ch).join('');
    const n = parseInt(c, 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (amt < 0) {
      r *= 1 + amt; g *= 1 + amt; b *= 1 + amt;
    } else {
      r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt;
    }
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  };

  // ------------------------------------------------------- 2.5D lighting
  // Everything is lit from the upper left. D.vg makes a "volume" gradient for any round form,
  // D.ball / D.egg are shaded spheres, and D.box3 draws a box in 3/4 view (front, lit top, shaded side).
  const isHex = (c) => typeof c === 'string' && c[0] === '#';
  D.vg = function (ctx, x, y, r, col, k) {
    if (!isHex(col)) return col;
    k = k == null ? 1 : k;
    const g = ctx.createRadialGradient(x - r * 0.38, y - r * 0.45, r * 0.05, x, y, r * 1.1);
    g.addColorStop(0, D.shade(col, 0.4 * k));
    g.addColorStop(0.45, col);
    g.addColorStop(1, D.shade(col, -0.3 * k));
    return g;
  };
  D.lgx = function (ctx, x0, x1, col, k) {
    if (!isHex(col)) return col;
    k = k == null ? 1 : k;
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, D.shade(col, 0.28 * k));
    g.addColorStop(0.4, col);
    g.addColorStop(1, D.shade(col, -0.28 * k));
    return g;
  };
  D.ball = function (ctx, x, y, r, col, o = {}) {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2);
    ctx.fillStyle = D.vg(ctx, x, y, r, col, o.k);
    ctx.fill();
    if (o.lw !== 0) {
      ctx.strokeStyle = o.stroke || C.ink;
      ctx.lineWidth = o.lw || 2.2;
      ctx.stroke();
    }
  };
  D.egg = function (ctx, x, y, rx, ry, col, o = {}) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), o.rot || 0, 0, Math.PI * 2);
    ctx.fillStyle = D.vg(ctx, x, y, Math.max(rx, ry), col, o.k);
    ctx.fill();
    if (o.lw !== 0) {
      ctx.strokeStyle = o.stroke || C.ink;
      ctx.lineWidth = o.lw || 2.2;
      ctx.stroke();
    }
  };
  // fill the current path with volume shading centred on (x, y)
  D.fillVol = function (ctx, x, y, r, col, lw, k) {
    ctx.fillStyle = D.vg(ctx, x, y, r, col, k);
    ctx.fill();
    if (lw !== 0) {
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = lw || 2.2;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  };
  // A cardboard box in 3/4 view. (x, y) is the top-left of the front face, d the depth.
  D.box3 = function (ctx, x, y, w, h, d, o = {}) {
    const col = o.fill || C.card;
    const lw = o.lw == null ? 3 : o.lw;
    const dx = d * 0.42, dy = -d * 0.78;
    if (!o.noSide) D.poly(ctx, [x + w, y, x + w + dx, y + dy, x + w + dx, y + h + dy, x + w, y + h], isHex(col) ? D.shade(col, -0.28) : col, C.ink, lw);
    if (!o.noTop) {
      D.poly(ctx, [x, y, x + w, y, x + w + dx, y + dy, x + dx, y + dy], isHex(o.top || col) ? D.shade(o.top || col, o.top ? 0 : 0.22) : col, C.ink, lw);
      if (o.flaps) {
        // open box flaps along the top edges
        D.poly(ctx, [x + dx, y + dy, x + dx - d * 0.15, y + dy - d * 0.9, x + w * 0.45 + dx, y + dy - d * 0.7, x + w * 0.45 + dx, y + dy], D.shade(col, 0.1), C.ink, lw * 0.8);
      }
    }
    D.cardboard(ctx, x, y, w, h, { r: o.r == null ? 2 : o.r, fill: col, lw, flute: o.flute, fstep: o.fstep, horizontal: o.horizontal });
    return { tx: x + dx, ty: y + dy };
  };

  // cardboard slab with corrugation lines + marker outline
  D.cardboard = function (ctx, x, y, w, h, o = {}) {
    const fill = o.fill || C.card;
    const r = o.r == null ? 8 : o.r;
    ctx.save();
    D.rr(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.clip();
    if (o.flute !== false) {
      ctx.strokeStyle = 'rgba(120,70,30,0.13)';
      ctx.lineWidth = 2;
      const step = o.fstep || 7;
      ctx.beginPath();
      if (o.horizontal) for (let yy = y + 3; yy < y + h; yy += step) { ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); }
      else for (let xx = x + 3; xx < x + w; xx += step) { ctx.moveTo(xx, y); ctx.lineTo(xx, y + h); }
      ctx.stroke();
    }
    if (o.shade !== false) {
      // soft top light and a darker foot, so every slab reads as a solid piece of card
      const g = ctx.createLinearGradient(x, y, x + w * 0.25, y + h);
      g.addColorStop(0, 'rgba(255,255,255,0.24)');
      g.addColorStop(0.4, 'rgba(255,255,255,0)');
      g.addColorStop(1, 'rgba(80,40,10,0.2)');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
    if (o.outline !== false) {
      D.rr(ctx, x, y, w, h, r);
      ctx.strokeStyle = o.stroke || C.ink;
      ctx.lineWidth = o.lw || 3;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  };

  D.tape = function (ctx, x, y, w, h, ang, alpha) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(ang || 0);
    ctx.globalAlpha *= alpha == null ? 0.85 : alpha;
    ctx.fillStyle = C.tape;
    ctx.beginPath();
    const z = 4;
    ctx.moveTo(-w / 2, -h / 2);
    ctx.lineTo(w / 2, -h / 2);
    for (let i = 0; i <= 4; i++) ctx.lineTo(w / 2 + (i % 2 ? z : 0), -h / 2 + (h * i) / 4);
    ctx.lineTo(-w / 2, h / 2);
    for (let i = 4; i >= 0; i--) ctx.lineTo(-w / 2 - (i % 2 ? z : 0), -h / 2 + (h * i) / 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(-w / 2, -h / 2, w, h * 0.3);
    ctx.restore();
  };

  D.text = function (ctx, s, x, y, o = {}) {
    const size = o.size || 20;
    ctx.font = `${o.weight || 600} ${size}px ${CK.FONT}`;
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = o.base || 'alphabetic';
    if (o.outline) {
      ctx.lineWidth = o.ow || Math.max(3, size / 5);
      ctx.strokeStyle = o.outline;
      ctx.lineJoin = 'round';
      ctx.strokeText(s, x, y);
    }
    ctx.fillStyle = o.color || C.ink;
    ctx.fillText(s, x, y);
  };
  D.measure = function (ctx, s, size, weight) {
    ctx.font = `${weight || 600} ${size}px ${CK.FONT}`;
    return ctx.measureText(s).width;
  };
  D.wrap = function (ctx, s, maxW, size, weight) {
    ctx.font = `${weight || 600} ${size}px ${CK.FONT}`;
    const out = [];
    for (const para of String(s).split('\n')) {
      const words = para.split(' ');
      let line = '';
      for (const w of words) {
        const t = line ? line + ' ' + w : w;
        if (ctx.measureText(t).width > maxW && line) {
          out.push(line);
          line = w;
        } else line = t;
      }
      out.push(line);
    }
    return out;
  };

  D.panel = function (ctx, x, y, w, h, o = {}) {
    ctx.save();
    ctx.fillStyle = 'rgba(40,20,5,0.25)';
    D.rr(ctx, x + 4, y + 5, w, h, 10);
    ctx.fill();
    ctx.restore();
    D.cardboard(ctx, x, y, w, h, { r: 10, fill: o.fill || C.cardL, seed: o.seed, lw: 3, horizontal: true });
    if (o.inner !== false && h > 40 && w > 40) {
      ctx.strokeStyle = 'rgba(120,70,30,0.25)';
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 2;
      D.rr(ctx, x + 7, y + 7, w - 14, h - 14, 6);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (o.tape !== false && w > 80) {
      D.tape(ctx, x - 10, y - 4, 40, 14, -0.6, 0.8);
      D.tape(ctx, x + w - 30, y + h - 10, 40, 14, -0.6, 0.8);
    }
  };

  D.button = function (ctx, x, y, w, h, label, o = {}) {
    const hov = o.hover;
    const col = o.disabled ? '#bfae97' : o.color || (hov ? C.yellow : C.paper);
    const dy = hov && !o.disabled ? -2 : 0;
    ctx.fillStyle = 'rgba(40,20,5,0.3)';
    D.rr(ctx, x + 2, y + 4, w, h, 9);
    ctx.fill();
    D.rr(ctx, x, y + dy, w, h, 9);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    D.text(ctx, label, x + w / 2, y + dy + h / 2 + (o.size || 18) * 0.36, {
      size: o.size || 18, align: 'center', color: o.disabled ? '#7d6a55' : C.ink,
    });
  };
  D.inRect = (mx, my, x, y, w, h) => mx >= x && mx <= x + w && my >= y && my <= y + h;

  D.star = function (ctx, x, y, r, fill, n, rot) {
    n = n || 5;
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = (i * Math.PI) / n + (rot || 0) - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };
  D.heart = function (ctx, x, y, s, fill) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.35);
    ctx.bezierCurveTo(x - s, y - s * 0.4, x - s * 0.4, y - s, x, y - s * 0.35);
    ctx.bezierCurveTo(x + s * 0.4, y - s, x + s, y - s * 0.4, x, y + s * 0.35);
    ctx.fillStyle = fill;
    ctx.fill();
  };

  D.icon = function (ctx, name, x, y, s) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    switch (name) {
      case 'scrap':
        ctx.rotate(-0.2);
        D.cardboard(ctx, -9, -8, 18, 16, { r: 2, lw: 2 });
        D.tape(ctx, -10, -3, 20, 6, 0.1, 0.9);
        break;
      case 'snack':
        D.rr(ctx, -7, -10, 14, 19, 2);
        ctx.fillStyle = '#ff9d5c';
        ctx.fill();
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.fillRect(-4, -4, 8, 6);
        D.line(ctx, 3, -10, 6, -16, '#fff', 2);
        break;
      case 'sun':
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * 6.28 + CK.time * 0.5;
          D.line(ctx, Math.cos(a) * 11, Math.sin(a) * 11, Math.cos(a) * 15, Math.sin(a) * 15, '#ffb238', 3);
        }
        D.circle(ctx, 0, 0, 9, '#ffd25a', C.ink, 2);
        break;
      case 'moon':
        D.circle(ctx, 0, 0, 10, '#fff3b0', C.ink, 2);
        D.circle(ctx, 5, -3, 8, '#2b2560');
        D.star(ctx, -12, -10, 4, '#fff3b0');
        break;
      case 'shield':
        D.poly(ctx, [-9, -10, 9, -10, 9, 0, 0, 11, -9, 0], C.cardL, C.ink, 2);
        D.line(ctx, 0, -8, 0, 8, C.cardD, 2);
        break;
      case 'feather':
        D.ellipse(ctx, 0, 0, 4, 12, C.silver, C.ink, 2, 0.5);
        D.line(ctx, -5, 10, 5, -10, C.ink, 1.5);
        break;
    }
    ctx.restore();
  };

  D.particle = function (ctx, p, x, y) {
    switch (p.shape) {
      case 'circle':
        D.circle(ctx, x, y, p.size, p.color);
        break;
      case 'ring':
        D.circle(ctx, x, y, p.size, null, p.color, 3);
        break;
      case 'drop':
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.atan2(p.vy, p.vx) - Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 1.6);
        ctx.quadraticCurveTo(p.size, 0, 0, p.size);
        ctx.quadraticCurveTo(-p.size, 0, 0, -p.size * 1.6);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
        break;
      case 'petal':
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.abs(Math.sin(p.ph * 1.3)) * 0.6 + 0.4);
        D.ellipse(ctx, 0, 0, p.size, p.size * 0.6, p.color);
        ctx.restore();
        break;
      case 'leaf':
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.abs(Math.sin(p.ph)) * 0.7 + 0.3);
        D.poly(ctx, [0, -p.size, p.size * 0.7, 0, 0, p.size, -p.size * 0.7, 0], p.color);
        D.line(ctx, 0, -p.size, 0, p.size, 'rgba(90,40,10,.4)', 1);
        ctx.restore();
        break;
      case 'snow':
        D.circle(ctx, x, y, p.size, p.color);
        break;
      case 'square':
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.8);
        ctx.strokeStyle = 'rgba(74,44,23,.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.8);
        ctx.restore();
        break;
      case 'star':
        D.star(ctx, x, y, p.size, p.color, 5, p.rot);
        break;
      case 'spark':
        D.star(ctx, x, y, p.size, p.color, 4, p.rot);
        break;
      case 'text': {
        const sc = p.pop ? 1 + Math.max(0, (p.life - p.max + 0.25) * 3) : 1;
        D.text(ctx, p.text, x, y, { size: p.size * sc, align: 'center', color: p.color, outline: p.outline || C.ink, ow: 5, weight: 700 });
        break;
      }
      case 'firefly': {
        const g = ctx.createRadialGradient(x, y, 0, x, y, p.size * 4);
        g.addColorStop(0, 'rgba(255,240,140,0.9)');
        g.addColorStop(1, 'rgba(255,240,140,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - p.size * 4, y - p.size * 4, p.size * 8, p.size * 8);
        break;
      }
    }
  };

  // ------------------------------------------------------------- faces
  function eyes(ctx, x, y, sp, r, o = {}) {
    const blink = o.blink || (Math.sin(CK.time * 1.3 + (o.seed || 0)) > 0.985);
    if (o.happy) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(x - sp, y + 1, r, Math.PI * 1.15, Math.PI * 1.85);
      ctx.moveTo(x + sp + r * 0.9, y);
      ctx.arc(x + sp, y + 1, r, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      return;
    }
    if (blink) {
      D.line(ctx, x - sp - r, y, x - sp + r, y, C.ink, 2);
      D.line(ctx, x + sp - r, y, x + sp + r, y, C.ink, 2);
      return;
    }
    if (o.sad) {
      D.line(ctx, x - sp - r, y - r * 1.3, x - sp + r, y - r * 0.8, C.ink, 1.6);
      D.line(ctx, x + sp + r, y - r * 1.3, x + sp - r, y - r * 0.8, C.ink, 1.6);
    }
    if (o.angry) {
      D.line(ctx, x - sp - r, y - r * 0.9, x - sp + r, y - r * 0.3, C.ink, 2);
      D.line(ctx, x + sp + r, y - r * 0.9, x + sp - r, y - r * 0.3, C.ink, 2);
    }
    D.ellipse(ctx, x - sp, y, r * 0.8, r, o.eyeColor || '#2b1a10');
    D.ellipse(ctx, x + sp, y, r * 0.8, r, o.eyeColor || '#2b1a10');
    D.circle(ctx, x - sp + r * 0.3, y - r * 0.4, r * 0.35, '#fff');
    D.circle(ctx, x + sp + r * 0.3, y - r * 0.4, r * 0.35, '#fff');
  }
  D.eyes = eyes;
  function blush(ctx, x, y, sp, r) {
    D.ellipse(ctx, x - sp, y, r, r * 0.6, 'rgba(255,120,140,0.45)');
    D.ellipse(ctx, x + sp, y, r, r * 0.6, 'rgba(255,120,140,0.45)');
  }
  D.blush = blush;
  function mouth(ctx, x, y, w, kind) {
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (kind === 'o') {
      D.ellipse(ctx, x, y + 1, w * 0.35, w * 0.45, '#7a2a2a', C.ink, 1.5);
      return;
    }
    if (kind === 'flat') {
      ctx.moveTo(x - w / 2, y);
      ctx.lineTo(x + w / 2, y);
    } else if (kind === 'sad') ctx.arc(x, y + w * 0.5, w / 2, Math.PI * 1.2, Math.PI * 1.8);
    else ctx.arc(x, y - w * 0.2, w / 2, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  }
  D.mouth = mouth;

  // Characters, battle costumes and monsters live in chars.js.
})();
