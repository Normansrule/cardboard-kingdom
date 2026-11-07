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
    // interface tokens ("Kingdom Post", mirrored in css/post.css): every menu, box and label
    // pulls from these instead of its own hex
    sheet: '#fbf3e2', sheetHi: '#efe8fb', line: '#e3d3b4', scrim: 'rgba(20,32,74,0.58)',
    text: '#2a2140', textSoft: '#5a5070', label: '#b8322a',
    off: '#e9e2d3', offText: '#6a6070',
    violet: '#5b3fa0', violetD: '#3d2875', airRed: '#e2483a', airBlue: '#2c56a3', navy: '#141d3d',
  });
  // Paper for the interface. Day is a cream postcard; night is the same card under a lamp.
  // Menus, dialogue, the HUD and buttons read D.pal(); world art never does.
  const PAPER = {
    day: {
      sheet: C.sheet, sheetHi: C.sheetHi, line: C.line, text: C.text, soft: C.textSoft, label: C.label,
      accent: C.violet, accentD: C.violetD, onAccent: '#ffffff', edge: C.text, scrim: C.scrim, off: C.off, offText: C.offText,
      shadow: 'rgba(20,32,74,0.28)',
    },
    night: {
      sheet: '#26335f', sheetHi: '#33427a', line: '#3a4777', text: '#f6ecd6', soft: '#c9c2dc', label: '#ffb4a8',
      accent: '#b9a4ff', accentD: '#7d68c9', onAccent: '#1b1440', edge: '#0d1430', scrim: 'rgba(8,12,30,0.62)', off: '#2e3a66', offText: '#c9c2dc',
      shadow: 'rgba(0,0,0,0.4)',
    },
  };
  D.PAPER = PAPER;
  // Paper setting: 0 = Auto (follows day and night in the game), 1 = always day, 2 = always night
  D.night = function () {
    const p = (CK.settings && CK.settings.paper) || 0;
    if (p) return p === 2;
    const ow = CK.OW;
    return !!(ow && ow.night && CK.Scenes && CK.Scenes.stack && CK.Scenes.stack.includes(ow));
  };
  D.pal = () => (D.night() ? PAPER.night : PAPER.day);
  // type scale (canvas px at 960x540). Nothing readable goes below `small`.
  D.T = { display: 70, title: 30, heading: 24, body: 20, ui: 17, small: 14 };
  // Two voices: Bagel Fat One for headings and stamps (big and bold, or asked for), Nunito for reading.
  D.font = function (size, weight, o) {
    const disp = o && o.display != null ? o.display : size >= 26 && (weight || 600) >= 700;
    return disp ? `400 ${size}px ${CK.DISPLAY}` : `${weight || 600} ${size}px ${CK.FONT}`;
  };
  // true when the player (or their system) asked for less movement
  D.calm = () => !!(CK.reduceMotion && CK.reduceMotion());

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
    ctx.font = D.font(size, o.weight, o);
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
  D.measure = function (ctx, s, size, weight, o) {
    ctx.font = D.font(size, weight, o);
    return ctx.measureText(s).width;
  };
  D.wrap = function (ctx, s, maxW, size, weight) {
    ctx.font = D.font(size, weight);
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

  // like D.wrap, but evens out the lines so a short paragraph never ends on one lonely word
  D.balance = function (ctx, s, maxW, size, weight) {
    const n = D.wrap(ctx, s, maxW, size, weight).length;
    if (n < 2) return D.wrap(ctx, s, maxW, size, weight);
    let lo = maxW / 2, hi = maxW;
    for (let i = 0; i < 10; i++) {
      const mid = (lo + hi) / 2;
      if (D.wrap(ctx, s, mid, size, weight).length > n) lo = mid;
      else hi = mid;
    }
    return D.wrap(ctx, s, hi, size, weight);
  };

  // A postcard: cream card, ink edge, a soft shadow that falls down and to the right.
  // o.theme follows day/night paper; o.airmail adds the red-and-blue border; o.lines rules it like a letter.
  D.panel = function (ctx, x, y, w, h, o = {}) {
    const P = o.theme ? D.pal() : PAPER.day;
    const fill = o.fill || P.sheet, r = o.r == null ? 8 : o.r;
    ctx.save();
    ctx.fillStyle = P.shadow;
    D.rr(ctx, x + 3, y + 6, w, h, r);
    ctx.fill();
    D.rr(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    if (o.airmail && w > 60 && h > 40) {
      ctx.save();
      ctx.clip();
      D.airmail(ctx, x, y, w, h, fill);
      ctx.restore();
      D.rr(ctx, x + 7, y + 7, w - 14, h - 14, Math.max(2, r - 4));
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (o.lines) {
      ctx.strokeStyle = P.line;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let ly = y + (o.lineTop || 40); ly < y + h - 12; ly += o.lines) { ctx.moveTo(x + 16, ly); ctx.lineTo(x + w - 16, ly); }
      ctx.stroke();
    }
    D.rr(ctx, x, y, w, h, r);
    ctx.strokeStyle = o.edge || P.edge;
    ctx.lineWidth = o.lw || 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  };
  // diagonal airmail stripes filling a rect (call inside a clip)
  D.airmail = function (ctx, x, y, w, h, gapCol) {
    ctx.fillStyle = gapCol || C.sheet;
    ctx.fillRect(x, y, w, h);
    const cols = [C.airRed, null, C.airBlue, null], widths = [14, 7, 14, 7];
    let k = 0;
    for (let s = -h; s < w + h; k++) {
      const c = cols[k % 4], sw = widths[k % 4];
      if (c) D.poly(ctx, [x + s, y + h, x + s + sw, y + h, x + s + sw + h, y, x + s + h, y], c);
      s += sw;
    }
  };
  // A perforated stamp. o.holes is the colour behind it; o.art(ctx, ix, iy, iw, ih) draws the picture.
  D.stamp = function (ctx, x, y, w, h, o = {}) {
    const hole = o.hole || 3.2, pitch = o.pitch || 9;
    ctx.save();
    ctx.fillStyle = o.shadow || 'rgba(20,32,74,0.25)';
    ctx.fillRect(x + 2, y + 4, w, h);
    ctx.fillStyle = o.paper || '#ffffff';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = o.holes || C.sheet;
    ctx.beginPath();
    for (let px = x; px <= x + w + 0.1; px += pitch) { ctx.moveTo(px + hole, y); ctx.arc(px, y, hole, 0, Math.PI * 2); ctx.moveTo(px + hole, y + h); ctx.arc(px, y + h, hole, 0, Math.PI * 2); }
    for (let py = y + pitch; py < y + h - 0.1; py += pitch) { ctx.moveTo(x + hole, py); ctx.arc(x, py, hole, 0, Math.PI * 2); ctx.moveTo(x + w + hole, py); ctx.arc(x + w, py, hole, 0, Math.PI * 2); }
    ctx.fill();
    const m = o.margin == null ? 7 : o.margin, ix = x + m, iy = y + m, iw = w - m * 2, ih = h - m * 2;
    ctx.beginPath();
    ctx.rect(ix, iy, iw, ih);
    ctx.fillStyle = o.fill || C.sheetHi;
    ctx.fill();
    if (o.art) { ctx.save(); ctx.clip(); o.art(ctx, ix, iy, iw, ih); ctx.restore(); }
    if (o.value) D.text(ctx, o.value, ix + iw - 4, iy + ih - 5, { size: 14, weight: 800, align: 'right', color: C.text });
    ctx.restore();
  };
  // A round postmark with its wavy cancellation lines. k (0..1) is how much ink has landed.
  D.postmark = function (ctx, cx, cy, r, lines, o = {}) {
    const col = o.color || C.violet, k = o.k == null ? 1 : o.k;
    ctx.save();
    // k > 1 is the moment before the stamp lands: a touch bigger, a touch fainter
    ctx.globalAlpha *= (o.alpha == null ? 0.88 : o.alpha) * Math.min(1, 1 / k);
    ctx.translate(cx, cy);
    ctx.rotate(o.rot == null ? -0.22 : o.rot);
    ctx.scale(k, k);
    ctx.strokeStyle = col;
    ctx.lineWidth = Math.max(2, r * 0.07);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = Math.max(1, r * 0.03);
    ctx.beginPath(); ctx.arc(0, 0, r * 0.84, 0, Math.PI * 2); ctx.stroke();
    const n = lines.length, fs = Math.max(10, Math.round(r * (n > 1 ? 0.26 : 0.34)));
    lines.forEach((l, i) => D.text(ctx, l, 0, (i - (n - 1) / 2) * fs * 1.15 + fs * 0.36, { size: fs, weight: 800, align: 'center', color: col, display: false }));
    if (o.waves !== false) {
      ctx.lineWidth = Math.max(2, r * 0.07);
      for (let j = -1; j <= 1; j++) {
        ctx.beginPath();
        for (let t = 0; t <= 1.0001; t += 0.05) {
          const wx = r * 1.05 + t * r * 2.2, wy = j * r * 0.34 + Math.sin(t * Math.PI * 4) * r * 0.08;
          if (t === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  // a speaker's portrait as a stamp on the corner of a postcard
  D.portraitStamp = function (ctx, who, x, y, mood, holes) {
    D.stamp(ctx, x, y, 122, 124, { holes, margin: 6, art: (c, ix, iy) => D.portrait(c, who, ix - 1, iy, mood, { bare: true }) });
  };

  // The one button: an ink-pad key. Selected or hovered fills with postmark violet; held sinks onto its base.
  D.button = function (ctx, x, y, w, h, label, o = {}) {
    const P = D.pal(), hov = o.hover, off = o.disabled;
    const M = CK.Input && CK.Input.mouse;
    const held = !off && M && M.down && D.inRect(M.x, M.y, x, y, w, h);
    const base = 4, dy = held ? base - 1 : 0;
    const fill = off ? P.off : hov ? P.accent : o.color || P.sheet;
    const edge = off ? P.offText : hov ? P.accentD : P.edge;
    const r = Math.min(12, h / 2);
    if (!off) {
      D.rr(ctx, x, y + base, w, h, r);
      ctx.fillStyle = edge;
      ctx.fill();
    }
    D.rr(ctx, x, y + dy, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = edge;
    ctx.lineWidth = off ? 2 : 2.5;
    // disabled reads as "not yet" by shape too (dashed edge, flat), not just by colour
    if (off) ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    const size = o.size || 18;
    D.text(ctx, label, x + w / 2, y + dy + h / 2 + size * 0.36, {
      size, weight: 800, align: 'center', color: off ? P.offText : hov ? P.onAccent : o.color ? C.text : P.text, display: false,
    });
  };
  // a drawn chevron for "this value can change" (used instead of ◀ ▶ text glyphs)
  D.chevron = function (ctx, x, y, dir, col) {
    D.poly(ctx, [x + dir * 4, y, x - dir * 3, y - 5, x - dir * 3, y + 5], col || C.ink);
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
    for (const ex of [x - sp, x + sp]) {
      D.circle(ctx, ex + r * 0.28, y - r * 0.4, r * 0.36, '#fff');
      D.circle(ctx, ex - r * 0.3, y + r * 0.45, r * 0.15, 'rgba(255,255,255,.85)');
    }
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
