// Cardboard Kingdom - Tansy's Catalogue: skins for your costumes (v2.22).
// Two kinds of skin, both purely cosmetic and both bought with bottle caps you earn by playing
// (there is no real money anywhere in this game, and there never will be):
//  * Paint jobs recolour whatever costume a friend wears, on the map and as a giant in battle. The
//    costume is drawn to a scratch canvas, tinted with a "color" blend (so the ink lines and shading
//    stay), clipped back to its own outline, and the kid's face in the window is put back untouched.
//  * Toppers sit on top: a flower crown, a traffic cone, a paper crown... On the map they replace the
//    little costume hat; in battle they perch on top of the giant.
// A few skins can't be bought at all. They're earned from gold challenges (see pastimes.js).
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U;
  const C = D.C, TAU = Math.PI * 2;
  const stroke = (ctx, lw, col) => { ctx.strokeStyle = col || C.ink; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };

  // ================================================================ CATALOGUE
  const PAINTS = [
    { id: 'fresh', name: 'Fresh Cardboard', cost: 0, swatch: '#d9a66b', blurb: 'The costume as it was made: brown, honest, a little dented.' },
    { id: 'mint', name: 'Mint Wash', cost: 40, swatch: '#7fe0c0', blurb: 'A cool green wash. Smells faintly of toothpaste, somehow.' },
    { id: 'sky', name: 'Sky Blue', cost: 40, swatch: '#8fd0ff', blurb: 'The colour of a good day for building.' },
    { id: 'peach', name: 'Peach Fuzz', cost: 40, swatch: '#ffb38a', blurb: 'Soft and warm, like the last hour of sun.' },
    { id: 'sunset', name: 'Sunset Fade', cost: 60, swatch: '#ff8f8f', blurb: 'Pink at the top, gold at the bottom. Tansy dip-dyed it twice.' },
    { id: 'polka', name: 'Polka Party', cost: 70, swatch: '#ffb7d5', blurb: 'Pink with white dots. Pip counted them: 212.' },
    { id: 'gingham', name: 'Picnic Gingham', cost: 70, swatch: '#ef6b6b', blurb: 'Red and white checks, borrowed from a picnic blanket (returned, washed).' },
    { id: 'candy', name: 'Candy Stripe', cost: 80, swatch: '#ff8fb1', blurb: 'Diagonal stripes, like a seaside rock.' },
    { id: 'leafy', name: 'Leaf Camo', cost: 80, swatch: '#6cbf5a', blurb: 'For hiding in hedges. Corry still sticks out. Corry is very large.' },
    { id: 'snowknit', name: 'Snowflake Knit', cost: 90, swatch: '#6f9fdc', blurb: 'Winter blue with white flakes, like a jumper Grandma would make.' },
    { id: 'stars', name: 'Starry Night', cost: 100, swatch: '#3a3480', blurb: 'Deep blue with gold stars. Looks best after dark.' },
    { id: 'rainbow', name: 'Rainbow Tape', cost: 120, swatch: '#c9a7ff', blurb: 'Every colour of tape in Patchwork Hall, in order.' },
    { id: 'denim', name: 'Patched Denim', cost: 90, swatch: '#5a7ab0', blurb: 'Blue denim with a stitched-on patch. Builders\' favourite.' },
    { id: 'pawprint', name: 'Helping Paws', earn: 'favours', swatch: '#c9a27a', blurb: 'Warm cardboard brown, covered in little paw prints. Every neighbor you helped left one.' },
    { id: 'sweetheart', name: 'Sweetheart', earn: 'bestfriends', swatch: '#ff9fbf', blurb: 'Pink, with tiny hearts all over. For being a true friend to the whole Kingdom.' },
    { id: 'field', name: 'Field Notes', earn: 'critters', swatch: '#fff4dc', blurb: 'Ruled notebook paper with a red margin. For true naturalists.' },
    { id: 'cranes', name: 'Thousand Cranes', earn: 'cranes', swatch: '#ffd1e8', blurb: 'Grandma\'s paper cranes, all over. For finding every one.' },
    { id: 'gold', name: 'Gold Leaf', earn: 'jobs', swatch: '#ffd25a', blurb: 'Shiny gold, for someone who never turns down an odd job.' },
    { id: 'mapcloth', name: 'Old Map', earn: 'treasure', swatch: '#e8cf98', blurb: 'Faded parchment with dotted trails and a red X. For digging up every treasure.' },
    { id: 'bloom', name: 'Garden Party', earn: 'guests', swatch: '#9fd18a', blurb: 'Spring green, sprinkled with tiny flowers. For the best host in Blossom Hollow.' },
  ];
  const TOPS = [
    { id: 'none', name: 'Costume hat', cost: 0, blurb: 'The hat that came with the costume.' },
    { id: 'sprout', name: 'Little Sprout', cost: 25, blurb: 'Two leaves. It might grow. (It will not grow.)' },
    { id: 'flowers', name: 'Flower Crown', cost: 30, blurb: 'Blossom Hollow daisies, woven by Clover.' },
    { id: 'party', name: 'Party Hat', cost: 30, blurb: 'For no reason at all. Those are the best parties.' },
    { id: 'acorn', name: 'Acorn Cap', cost: 35, blurb: 'A very large acorn. The squirrels have questions.' },
    { id: 'bunny', name: 'Bunny Ears', cost: 40, blurb: 'Cardboard ears with pink felt inside.' },
    { id: 'cone', name: 'Traffic Cone', cost: 45, blurb: 'Every engineer\'s favourite hat. Site safety first.' },
    { id: 'sailor', name: 'Sailor\'s Cap', cost: 45, blurb: 'Captain Bess approves. She saluted.' },
    { id: 'chef', name: 'Chef\'s Hat', cost: 45, blurb: 'Tall, white, and slightly floppy at the top.' },
    { id: 'crown', name: 'Paper Crown', cost: 60, blurb: 'Queen Corrina has the same one. She says it suits you.' },
    { id: 'tricorn', name: 'Pirate Tricorn', cost: 70, blurb: 'Not for flooding villages. For dressing up only.' },
    { id: 'lanternhat', name: 'Lantern Hat', cost: 80, blurb: 'A little paper lantern on a stick. Glows at night.' },
    { id: 'beanie', name: 'Bobble Beanie', cost: 40, blurb: 'A knitted hat with a big bobble. Pip wants one in every colour.' },
    { id: 'explorer', name: 'Explorer Helmet', earn: 'landmarks', blurb: 'For visiting every quiet corner of the Kingdom.' },
    { id: 'gradcap', name: 'Graduation Cap', earn: 'neighbors', blurb: 'Not yet. But one day. For knocking on every door.' },
    { id: 'leafcrown', name: 'Autumn Crown', earn: 'trees', blurb: 'Maple leaves, for shaking more trees than seems wise.' },
    { id: 'buckethat', name: 'Fishing Hat', earn: 'fish', blurb: 'A bucket hat with a bottle-cap lure, for a full Fish Count.' },
    { id: 'strawhat', name: 'Gardener\'s Straw Hat', earn: 'garden', blurb: 'Wide and floppy with a daisy in the band. For a patch full of things.' },
    { id: 'bandana', name: 'Treasure Bandana', earn: 'loot', blurb: 'Red with white spots, knotted at the back. Buried in Frostfold Peak, of all places.' },
    // v2.24: keepsakes. A neighbour gives you one when you become best friends (five hearts).
    { id: 'paperboat', name: 'Paper Boat Hat', earn: 'friend:clover', blurb: 'Folded from the Blossom Hollow Gazette by Clover, who learned it from Skipper. It is brave. So are you.' },
    { id: 'mailcap', name: 'Postie\'s Cap', earn: 'friend:robin', blurb: 'Robin\'s spare cap, with a little envelope badge. Shiny seal not included (Robin is keeping that).' },
    { id: 'tophat', name: 'Mossworth\'s Top Hat', earn: 'friend:mayor', blurb: 'The Mayor\'s second-best hat. Slightly squashed from fifty years of speeches.' },
    { id: 'visor', name: 'Juice Stand Visor', earn: 'friend:dabble', blurb: 'Striped like a beach umbrella. Dabble made one for every regular. You are the first regular.' },
    { id: 'hardhat', name: 'Junior Engineer Hat', earn: 'friend:nib', blurb: 'A yogurt pot, painted yellow. It says SAM in marker on the front, and NIB, smaller, on the back.' },
    { id: 'beret', name: 'Ember\'s Beret', earn: 'friend:ember', blurb: 'Pumpkin-spice-at-dusk orange (it is NOT just orange) with a leaf pin.' },
    { id: 'prickles', name: 'Prickle Hood', earn: 'friend:bristle', blurb: 'Cardboard spikes, just like Bristle\'s. Bristle apologised for making it. Twice.' },
    { id: 'specs', name: 'Hoot\'s Reading Glasses', earn: 'friend:hoot', blurb: 'Pushed up on your head, the way the Professor wears his while he looks for them.' },
    { id: 'earmuffs', name: 'Burrow Earmuffs', earn: 'friend:mama', blurb: 'Hand-knitted by Mama Burrow. Very warm. Smell faintly of cocoa.' },
  ];
  const byId = (list, id) => list.find((s) => s.id === id);
  const WHO = ['sam', 'corry', 'pip', 'jules'];

  const closet = () => {
    const G = CK.G;
    if (!G.closet) G.closet = { owned: ['fresh', 'none'], wear: {} };
    return G.closet;
  };
  const wearOf = (who) => (CK.G && CK.G.closet && CK.G.closet.wear[who]) || null;
  CK.Closet = { PAINTS, TOPS, closet, wearOf, WHO,
    owns: (id) => closet().owned.includes(id),
    give(id) { const c = closet(); if (!c.owned.includes(id)) c.owned.push(id); },
    count: () => closet().owned.filter((id) => id !== 'fresh' && id !== 'none').length,
    item: (id) => byId(PAINTS, id) || byId(TOPS, id),
    isPaint: (id) => !!byId(PAINTS, id),
    wear(who, id) {
      const c = closet(), w = (c.wear[who] = c.wear[who] || {});
      if (byId(PAINTS, id)) w.paint = id === 'fresh' ? undefined : id; else w.top = id === 'none' ? undefined : id;
    },
  };

  // ================================================================ PAINT
  // Scratch canvases the size of the real one; reused every frame.
  let s1 = null, s2 = null;
  const scratch = (cv) => {
    if (!s1) { s1 = document.createElement('canvas'); s2 = document.createElement('canvas'); }
    for (const s of [s1, s2]) if (s.width !== cv.width || s.height !== cv.height) { s.width = cv.width; s.height = cv.height; }
    return [s1.getContext('2d'), s2.getContext('2d')];
  };
  // a paint's pattern, filled into device-space box (x, y, w, h); k = pixels per game pixel
  function paintPattern(g, id, x, y, w, h, k) {
    const fill = (col, mode, a) => { g.globalCompositeOperation = mode || 'color'; g.globalAlpha = a == null ? 1 : a; g.fillStyle = col; g.fillRect(x, y, w, h); };
    const over = (fn) => { g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 1; fn(); };
    const step = (n) => n * k;
    switch (id) {
      case 'mint': fill('#62d6ae'); fill('#d8fff0', 'soft-light', 0.5); break;
      case 'sky': fill('#5fb6f0'); fill('#e6f6ff', 'soft-light', 0.5); break;
      case 'peach': fill('#ff9a6a'); fill('#fff0e0', 'soft-light', 0.5); break;
      case 'sunset': {
        const gr = g.createLinearGradient(0, y, 0, y + h);
        gr.addColorStop(0, '#ff6f9f'); gr.addColorStop(0.55, '#ff9a5a'); gr.addColorStop(1, '#ffd25a');
        fill(gr); break;
      }
      case 'polka':
        fill('#ff8fb8');
        over(() => { g.fillStyle = 'rgba(255,255,255,.85)'; const d = step(9); for (let yy = y; yy < y + h; yy += d) for (let xx = x + ((yy - y) / d % 2 ? d / 2 : 0); xx < x + w; xx += d) { g.beginPath(); g.arc(xx, yy, step(2.2), 0, TAU); g.fill(); } });
        break;
      case 'gingham':
        fill('#ffffff', 'color', 0.9); fill('#fff4f0', 'soft-light', 0.6);
        over(() => { g.fillStyle = 'rgba(232,80,80,.32)'; const d = step(10); for (let xx = x; xx < x + w; xx += d) g.fillRect(xx, y, d / 2, h); for (let yy = y; yy < y + h; yy += d) g.fillRect(x, yy, w, d / 2); });
        break;
      case 'candy':
        fill('#ff86ad');
        over(() => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = step(5); const d = step(14); for (let t = -h; t < w + h; t += d) { g.beginPath(); g.moveTo(x + t, y); g.lineTo(x + t - h, y + h); g.stroke(); } g.restore(); });
        break;
      case 'leafy':
        fill('#5aa04a');
        over(() => { for (let i = 0; i < 40; i++) { const lx = x + U.hash(i, 1, 9) * w, ly = y + U.hash(i, 2, 9) * h; g.fillStyle = ['rgba(40,90,40,.45)', 'rgba(150,200,90,.4)', 'rgba(90,60,30,.3)'][i % 3]; g.beginPath(); g.ellipse(lx, ly, step(7), step(4), U.hash(i, 3, 9) * 6, 0, TAU); g.fill(); } });
        break;
      case 'snowknit':
        fill('#4f86d0');
        over(() => { for (let i = 0; i < 26; i++) { const sx = x + U.hash(i, 1, 4) * w, sy = y + U.hash(i, 2, 4) * h; g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = step(1.2); for (let a = 0; a < 3; a++) { g.beginPath(); g.moveTo(sx + Math.cos(a * 1.05) * step(4), sy + Math.sin(a * 1.05) * step(4)); g.lineTo(sx - Math.cos(a * 1.05) * step(4), sy - Math.sin(a * 1.05) * step(4)); g.stroke(); } } });
        break;
      case 'stars':
        fill('#2e2a78', 'multiply', 0.85); fill('#3a3490');
        over(() => { for (let i = 0; i < 30; i++) D.star(g, x + U.hash(i, 1, 7) * w, y + U.hash(i, 2, 7) * h, step(2 + U.hash(i, 3, 7) * 2.5), 'rgba(255,220,110,.95)', 5, 0); });
        break;
      case 'rainbow': {
        const gr = g.createLinearGradient(x, y, x + w, y + h);
        ['#ff6f6f', '#ffb14f', '#ffe066', '#7ad67a', '#5ab4ff', '#a98bff'].forEach((c, i, a) => gr.addColorStop(i / (a.length - 1), c));
        fill(gr); break;
      }
      case 'field':
        fill('#fff6e0', 'color', 0.9); fill('#fffaf0', 'soft-light', 0.7);
        over(() => { g.fillStyle = 'rgba(90,140,220,.45)'; for (let yy = y; yy < y + h; yy += step(7)) g.fillRect(x, yy, w, Math.max(1, step(0.8))); g.fillStyle = 'rgba(230,80,80,.5)'; g.fillRect(x + w * 0.28, y, Math.max(1, step(1.2)), h); });
        break;
      case 'cranes':
        fill('#ffd8ea', 'color', 0.85); fill('#fff6fa', 'soft-light', 0.5);
        over(() => { for (let i = 0; i < 18; i++) { const cx = x + U.hash(i, 1, 5) * w, cy = y + U.hash(i, 2, 5) * h, r = step(5); D.poly(g, [cx - r, cy, cx, cy - r * 0.6, cx + r, cy, cx, cy + r * 0.25], i % 2 ? 'rgba(239,107,140,.75)' : 'rgba(255,255,255,.85)'); } });
        break;
      case 'denim':
        fill('#4f72aa'); fill('#dfe8ff', 'soft-light', 0.35);
        over(() => { g.fillStyle = 'rgba(255,255,255,.08)'; for (let yy = y; yy < y + h; yy += step(2.5)) g.fillRect(x, yy, w, Math.max(1, step(0.8))); const px = x + w * 0.55, py = y + h * 0.5, r = step(9); g.fillStyle = 'rgba(239,107,107,.75)'; g.fillRect(px - r, py - r, r * 2, r * 2); g.strokeStyle = 'rgba(255,255,255,.8)'; g.setLineDash([step(2), step(2)]); g.lineWidth = Math.max(1, step(1)); g.strokeRect(px - r + step(1.5), py - r + step(1.5), r * 2 - step(3), r * 2 - step(3)); g.setLineDash([]); });
        break;
      case 'mapcloth':
        fill('#e8cf98', 'color', 0.9); fill('#fff4dc', 'soft-light', 0.6);
        over(() => { g.strokeStyle = 'rgba(120,80,40,.5)'; g.lineWidth = Math.max(1, step(1.2)); g.setLineDash([step(3), step(3)]); g.beginPath(); for (let i = 0; i < 4; i++) { const sx = x + U.hash(i, 1, 11) * w, sy = y + U.hash(i, 2, 11) * h; g.moveTo(sx, sy); g.quadraticCurveTo(sx + step(20), sy - step(14), sx + step(36), sy + step(6)); } g.stroke(); g.setLineDash([]); g.strokeStyle = 'rgba(220,60,60,.85)'; g.lineWidth = step(2.4); for (let i = 0; i < 3; i++) { const cx = x + U.hash(i, 3, 11) * w, cy = y + U.hash(i, 4, 11) * h, r = step(4); g.beginPath(); g.moveTo(cx - r, cy - r); g.lineTo(cx + r, cy + r); g.moveTo(cx + r, cy - r); g.lineTo(cx - r, cy + r); g.stroke(); } });
        break;
      case 'pawprint':
        fill('#c08a5a'); fill('#fff0dc', 'soft-light', 0.5);
        over(() => { g.fillStyle = 'rgba(90,50,30,.55)'; const d = step(16); for (let yy = y + d / 2, r = 0; yy < y + h; yy += d, r++) for (let xx = x + (r % 2 ? d : d / 2); xx < x + w; xx += d) { const s = step(1.3), rot = (r * 7 + xx) % 3 - 1; g.save(); g.translate(xx, yy); g.rotate(rot * 0.3); g.beginPath(); g.ellipse(0, s * 1.2, s * 2, s * 1.6, 0, 0, TAU); g.fill(); for (const [ox, oy] of [[-2, -1.4], [-0.7, -2.6], [0.7, -2.6], [2, -1.4]]) { g.beginPath(); g.arc(ox * s, oy * s, s * 0.75, 0, TAU); g.fill(); } g.restore(); } });
        break;
      case 'sweetheart':
        fill('#ff9fbf'); fill('#fff0f5', 'soft-light', 0.5);
        over(() => { const d = step(14); g.fillStyle = 'rgba(255,255,255,.88)'; for (let yy = y + d / 2; yy < y + h; yy += d) for (let xx = x + ((Math.round((yy - y) / d) % 2) ? d : d / 2); xx < x + w; xx += d) { const r = step(2.4); g.beginPath(); g.moveTo(xx, yy + r * 1.2); g.bezierCurveTo(xx - r * 2, yy - r * 0.2, xx - r, yy - r * 1.6, xx, yy - r * 0.5); g.bezierCurveTo(xx + r, yy - r * 1.6, xx + r * 2, yy - r * 0.2, xx, yy + r * 1.2); g.fill(); } });
        break;
      case 'bloom':
        fill('#86c86e'); fill('#f0ffe0', 'soft-light', 0.5);
        over(() => { for (let i = 0; i < 34; i++) { const fx = x + U.hash(i, 1, 13) * w, fy = y + U.hash(i, 2, 13) * h, col = ['#ffffff', '#ffb7d5', '#ffe38a'][i % 3]; g.fillStyle = col; for (let p = 0; p < 5; p++) { g.beginPath(); g.arc(fx + Math.cos(p * 1.26) * step(2), fy + Math.sin(p * 1.26) * step(2), step(1.5), 0, TAU); g.fill(); } g.fillStyle = '#ffcf3a'; g.beginPath(); g.arc(fx, fy, step(1), 0, TAU); g.fill(); } });
        break;
      case 'gold':
        fill('#e8b52a'); fill('#fff2b0', 'soft-light', 0.6);
        over(() => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.strokeStyle = 'rgba(255,255,230,.5)'; g.lineWidth = step(3); for (let t = 0; t < w + h; t += step(26)) { g.beginPath(); g.moveTo(x + t, y); g.lineTo(x + t - h, y + h); g.stroke(); } g.restore(); });
        break;
    }
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  }
  CK.Closet.paintPattern = paintPattern;

  // Draw `draw(ctx)` with a paint job on top. box = [x0, y0, x1, y1] in the ctx's current space.
  function withPaint(ctx, paint, box, draw) {
    if (!paint || paint === 'fresh' || !ctx.canvas || !ctx.getTransform) return draw(ctx);
    const cv = ctx.canvas, m = ctx.getTransform();
    const [g, g2] = scratch(cv);
    const pts = [[box[0], box[1]], [box[2], box[1]], [box[0], box[3]], [box[2], box[3]]].map(([px, py]) => [m.a * px + m.c * py + m.e, m.b * px + m.d * py + m.f]);
    const bx = Math.max(0, Math.floor(Math.min(...pts.map((p) => p[0])))), by = Math.max(0, Math.floor(Math.min(...pts.map((p) => p[1]))));
    const bx1 = Math.min(cv.width, Math.ceil(Math.max(...pts.map((p) => p[0])))), by1 = Math.min(cv.height, Math.ceil(Math.max(...pts.map((p) => p[1]))));
    const bw = bx1 - bx, bh = by1 - by;
    if (bw <= 0 || bh <= 0) return draw(ctx);
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(bx, by, bw, bh);
    g2.setTransform(1, 0, 0, 1, 0, 0); g2.clearRect(bx, by, bw, bh);
    g.setTransform(m); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = ctx.filter || 'none';
    const faces = (D._faceRec = []);
    try { draw(g); } finally { D._faceRec = null; g.filter = 'none'; }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g2.drawImage(s1, bx, by, bw, bh, bx, by, bw, bh); // keep the unpainted original
    paintPattern(g, paint, bx, by, bw, bh, Math.hypot(m.a, m.b));
    // back to the costume's own outline...
    g.globalCompositeOperation = 'destination-in';
    g.drawImage(s2, bx, by, bw, bh, bx, by, bw, bh);
    g.globalCompositeOperation = 'source-over';
    // ...and the kids' faces in their windows go back exactly as they were
    for (const [fx, fy, fr] of faces) {
      g.save(); g.beginPath(); g.arc(fx, fy, fr, 0, TAU); g.clip();
      g.clearRect(fx - fr, fy - fr, fr * 2, fr * 2);
      g.drawImage(s2, bx, by, bw, bh, bx, by, bw, bh);
      g.restore();
    }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(s1, bx, by, bw, bh, bx, by, bw, bh);
    ctx.restore();
  }
  CK.Closet.withPaint = withPaint;

  // who is being drawn right now (D.char sets it), so costume pieces know whose skin to use
  let cur = null;
  const baseChar = D.char;
  D.char = function (ctx, look, x, y, o) {
    const prev = cur; cur = WHO.includes(look) && !(o && o.portrait) ? look : null;
    try { return baseChar.call(this, ctx, look, x, y, o); } finally { cur = prev; }
  };
  const baseBody = D.costumeBody;
  D.costumeBody = function (ctx, c, x, top, bot, s, dir) {
    const w = cur && wearOf(cur);
    if (!w || !w.paint) return baseBody.call(this, ctx, c, x, top, bot, s, dir);
    withPaint(ctx, w.paint, [x - 22 * s, top - 14 * s, x + 22 * s, bot + 8 * s], (g) => baseBody.call(this, g, c, x, top, bot, s, dir));
  };
  const baseHat = D.costumeHat;
  D.costumeHat = function (ctx, c, x, hy, s, dir) {
    const w = cur && wearOf(cur);
    if (w && w.top) return drawTopper(ctx, w.top, x, hy - 12 * s, s * 0.95, dir);
    if (!w || !w.paint) return baseHat.call(this, ctx, c, x, hy, s, dir);
    withPaint(ctx, w.paint, [x - 26 * s, hy - 52 * s, x + 26 * s, hy + 6 * s], (g) => baseHat.call(this, g, c, x, hy, s, dir));
  };

  // giants: paint the whole costume, put the face back, then the topper on top
  const tops = {};
  function giantTop(type) {
    if (tops[type] != null) return tops[type];
    const c = document.createElement('canvas'); c.width = 400; c.height = 420;
    const g = c.getContext('2d');
    baseGiant(g, type, 200, 400, { still: true, who: 'sam' });
    const d = g.getImageData(0, 0, 400, 420).data;
    let top = -200;
    outer: for (let y = 0; y < 420; y++) for (let x = 192; x < 208; x++) if (d[(y * 400 + x) * 4 + 3] > 60) { top = y - 400; break outer; }
    return (tops[type] = top);
  }
  let baseGiant = D.giant;
  CK.Closet.hookGiant = function () {
    baseGiant = D.giant;
    D.giant = function (ctx, type, x, y, o = {}) {
      const w = wearOf(o.who || 'sam');
      if (!w || (!w.paint && !w.top)) return baseGiant.call(this, ctx, type, x, y, o);
      const s = o.s || 1;
      withPaint(ctx, w.paint, [x - 175 * s, y - 320 * s, x + 175 * s, y + 2 * s], (g) => baseGiant.call(this, g, type, x, y, o));
      if (w.top) {
        const bob = D.calm() || o.still ? 0 : Math.sin(CK.time * 2.2 + (o.seed || 0)) * 2;
        drawTopper(ctx, w.top, x, y + (giantTop(type) + 6 + bob) * s, 2.3 * s, 'down');
      }
    };
  };

  // ================================================================ TOPPERS
  // (x, y) is the top of the head; s = 1 is map size
  function drawTopper(ctx, id, x, y, s, dir) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const lw = 1.8;
    switch (id) {
      case 'sprout':
        D.line(ctx, 0, 2, 0, -10, '#4f9a3a', 2.4);
        D.egg(ctx, -6, -12, 6, 3.2, '#7cc76a', { lw: 1.4, rot: -0.5 }); D.egg(ctx, 6, -13, 6, 3.2, '#7cc76a', { lw: 1.4, rot: 0.5 });
        break;
      case 'flowers':
        ctx.beginPath(); ctx.ellipse(0, 0, 17, 5, 0, 0, TAU); stroke(ctx, 3, '#5a9a3a');
        [['#ffffff', -14], ['#ffb7d5', -7], ['#ffe38a', 0], ['#c9a7ff', 7], ['#ffffff', 14]].forEach(([c, ox]) => { for (let p = 0; p < 5; p++) D.circle(ctx, ox + Math.cos(p * 1.26) * 3, -2 + Math.sin(p * 1.26) * 3, 2.6, c); D.circle(ctx, ox, -2, 1.6, '#ffcf3a'); });
        break;
      case 'party':
        D.poly(ctx, [-9, 2, 9, 2, 0, -24], '#5aa9e6', C.ink, lw);
        ctx.save(); ctx.beginPath(); ctx.moveTo(-9, 2); ctx.lineTo(9, 2); ctx.lineTo(0, -24); ctx.closePath(); ctx.clip();
        for (let k = 0; k < 4; k++) D.line(ctx, -12, -2 - k * 7, 12, -6 - k * 7, k % 2 ? '#ffd25a' : '#ef6b6b', 3);
        ctx.restore(); D.poly(ctx, [-9, 2, 9, 2, 0, -24], null, C.ink, lw);
        D.ball(ctx, 0, -25, 3.4, '#ff8fb1', { lw: 1.4 });
        break;
      case 'acorn':
        ctx.beginPath(); ctx.arc(0, 2, 15, Math.PI, 0); ctx.closePath(); D.fillVol(ctx, -3, -6, 15, '#a8774c', lw);
        for (let k = -2; k <= 2; k++) D.line(ctx, k * 5, -10 + Math.abs(k) * 2, k * 5 + 3, 0, 'rgba(60,30,10,.4)', 1.2);
        D.line(ctx, 0, -13, 2, -19, '#6a4a2e', 3);
        break;
      case 'bunny':
        for (const k of [-1, 1]) { ctx.save(); ctx.translate(k * 7, 0); ctx.rotate(k * 0.18); D.egg(ctx, 0, -14, 5.5, 14, '#fffaf0', { lw }); D.egg(ctx, 0, -13, 2.6, 9, '#ffb7d5', { lw: 0 }); ctx.restore(); }
        break;
      case 'cone':
        D.poly(ctx, [-11, 2, 11, 2, 3, -24, -3, -24], '#ff8a3a', C.ink, lw);
        D.poly(ctx, [-7.5, -8, 7.5, -8, 5.2, -15, -5.2, -15], '#ffffff');
        D.rr(ctx, -15, 0, 30, 5, 2); ctx.fillStyle = '#ff8a3a'; ctx.fill(); stroke(ctx, lw);
        break;
      case 'sailor':
        D.rr(ctx, -14, -8, 28, 10, 5); ctx.fillStyle = '#ffffff'; ctx.fill(); stroke(ctx, lw);
        D.rr(ctx, -16, -1, 32, 4, 2); ctx.fillStyle = '#5aa9e6'; ctx.fill(); stroke(ctx, 1.4);
        D.circle(ctx, 0, -4, 2.6, '#ef6b6b');
        break;
      case 'chef':
        D.rr(ctx, -10, -12, 20, 14, 2); ctx.fillStyle = '#ffffff'; ctx.fill(); stroke(ctx, lw);
        for (const [ox, oy, r] of [[-8, -16, 7], [0, -20, 8], [8, -16, 7]]) D.ball(ctx, ox, oy, r, '#ffffff', { lw: 1.6, k: 0.3 });
        D.rr(ctx, -10, -12, 20, 5, 1); ctx.fillStyle = '#ffffff'; ctx.fill();
        break;
      case 'crown':
        D.poly(ctx, [-13, 2, 13, 2, 13, -12, 7, -5, 0, -15, -7, -5, -13, -12], '#ffd25a', C.ink, lw);
        D.circle(ctx, 0, -4, 2.4, '#ef6b6b'); D.circle(ctx, -8, -1, 1.8, '#5aa9e6'); D.circle(ctx, 8, -1, 1.8, '#7cc76a');
        break;
      case 'tricorn':
        D.poly(ctx, [-20, 0, -10, -12, 0, -8, 10, -12, 20, 0, 0, 4], '#3a2a3a', C.ink, lw);
        D.line(ctx, -16, -1, 16, -1, '#ffd25a', 1.6);
        D.circle(ctx, 0, -5, 3, '#fffaf0', C.ink, 1.2);
        break;
      case 'lanternhat': {
        D.line(ctx, 0, 2, 0, -18, '#8a5a3a', 2.4); D.line(ctx, 0, -18, 10, -18, '#8a5a3a', 2);
        const night = CK.OW && CK.OW.night;
        if (night) D.circle(ctx, 10, -10, 12, 'rgba(255,220,120,.25)');
        D.egg(ctx, 10, -10, 5.5, 7, night ? '#ffe38a' : '#ff9f6a', { lw: 1.4 });
        break;
      }
      case 'beanie':
        ctx.beginPath(); ctx.arc(0, 2, 14, Math.PI, 0); ctx.closePath(); D.fillVol(ctx, -3, -6, 14, '#ef6b6b', lw);
        for (let k = -2; k <= 2; k++) D.line(ctx, k * 5, -10 + Math.abs(k) * 1.5, k * 5, 0, 'rgba(120,30,30,.35)', 1.2);
        D.rr(ctx, -15, -2, 30, 6, 3); ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 1.4);
        D.ball(ctx, 0, -14, 5, '#fffaf0', { lw: 1.4 });
        break;
      case 'strawhat':
        D.ellipse(ctx, 0, 0, 22, 5.5, '#f0d48f', C.ink, lw);
        ctx.beginPath(); ctx.arc(0, 0, 11, Math.PI, 0); ctx.closePath(); D.fillVol(ctx, -3, -6, 11, '#f0d48f', lw);
        D.line(ctx, -11, -2, 11, -2, '#ef6b6b', 2.4);
        for (let p = 0; p < 5; p++) D.circle(ctx, 7 + Math.cos(p * 1.26) * 2.6, -4 + Math.sin(p * 1.26) * 2.6, 2, '#ffffff'); D.circle(ctx, 7, -4, 1.4, '#ffcf3a');
        break;
      case 'bandana':
        ctx.beginPath(); ctx.arc(0, 2, 14, Math.PI, 0); ctx.closePath(); D.fillVol(ctx, -3, -6, 14, '#e8403a', lw);
        for (const [ox, oy] of [[-7, -4], [0, -9], [6, -3], [-2, -1]]) D.circle(ctx, ox, oy, 1.6, '#fffaf0');
        D.poly(ctx, [12, -2, 21, -6, 19, 2], '#e8403a', C.ink, 1.4); D.poly(ctx, [12, 0, 20, 6, 15, 7], '#e8403a', C.ink, 1.4);
        break;
      case 'paperboat':
        D.poly(ctx, [-20, 0, 20, 0, 13, -7, -13, -7], '#f4f0e6', C.ink, lw);
        D.poly(ctx, [-12, -6, 0, -22, 12, -6], '#fbf8f0', C.ink, lw);
        for (let k = 0; k < 3; k++) D.line(ctx, -8 + k * 2, -9 - k * 2.5, 6 - k * 2, -9 - k * 2.5, 'rgba(60,60,70,.35)', 1);
        D.line(ctx, -15, -3, 15, -3, 'rgba(60,60,70,.3)', 1);
        break;
      case 'mailcap':
        ctx.beginPath(); ctx.arc(0, 0, 13, Math.PI, 0); ctx.closePath(); D.fillVol(ctx, -3, -6, 13, '#3f5fa8', lw);
        D.poly(ctx, [4, 0, 22, 1, 20, 4, 4, 3], '#2a3f7a', C.ink, 1.4);
        D.rr(ctx, -5, -9, 10, 7, 1.5); ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(ctx, 1.1);
        D.poly(ctx, [-5, -9, 5, -9, 0, -5], null, C.ink, 1);
        break;
      case 'tophat':
        D.ellipse(ctx, 0, 0, 17, 4, '#3a3a48', C.ink, lw);
        D.rr(ctx, -10, -22, 20, 22, 2); ctx.fillStyle = '#4a4a5a'; ctx.fill(); stroke(ctx, lw);
        D.line(ctx, -10, -5, 10, -5, '#ef6b6b', 3.2);
        D.circle(ctx, 7, -5, 2.2, '#9bd07a', C.ink, 1);
        break;
      case 'visor':
        ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 16, 5, 0, 0, TAU); ctx.clip();
        for (let k = -4; k < 4; k++) { ctx.fillStyle = k % 2 ? '#fffaf0' : '#ff8f6a'; ctx.fillRect(k * 4, -6, 4, 12); }
        ctx.restore(); ctx.beginPath(); ctx.ellipse(0, 0, 16, 5, 0, 0, TAU); stroke(ctx, lw);
        D.poly(ctx, [-14, 1, 14, 1, 22, 7, -22, 7], '#ff8f6a', C.ink, lw);
        break;
      case 'hardhat':
        ctx.beginPath(); ctx.arc(0, 0, 14, Math.PI, 0); ctx.closePath(); D.fillVol(ctx, -3, -7, 14, '#ffc93c', lw);
        D.rr(ctx, -19, -2, 38, 5, 2.5); ctx.fillStyle = '#f0b52a'; ctx.fill(); stroke(ctx, 1.4);
        D.text(ctx, 'SAM', 0, -4, { size: 7, weight: 900, align: 'center', color: '#3a2a1a' });
        break;
      case 'beret':
        D.egg(ctx, 2, -5, 17, 7, '#f28a3c', { lw, rot: -0.12 });
        D.line(ctx, 3, -12, 4, -16, C.ink, 1.6);
        ctx.save(); ctx.translate(-9, -5); ctx.rotate(-0.5); D.poly(ctx, [0, -6, 3, -2, 2, 0, 0, 2, -2, 0, -3, -2], '#c94f2c', C.ink, 1); ctx.restore();
        break;
      case 'prickles':
        for (let i = -3; i <= 3; i++) D.poly(ctx, [i * 4.6 - 4.5, 1, i * 5.4, -16 + Math.abs(i) * 2.4, i * 4.6 + 4.5, 1], '#b98a5a', C.ink, 1.3);
        ctx.beginPath(); ctx.arc(0, 2, 14, Math.PI, 0); ctx.closePath(); D.fillVol(ctx, -3, -5, 14, '#d9a66b', lw);
        break;
      case 'specs':
        D.ellipse(ctx, 0, 0, 14, 3, 'rgba(0,0,0,.12)');
        for (const k of [-1, 1]) { ctx.beginPath(); ctx.arc(k * 7, -4, 6, 0, TAU); ctx.fillStyle = 'rgba(220,240,255,.55)'; ctx.fill(); stroke(ctx, 2, '#5a3a22'); }
        D.line(ctx, -1, -5, 1, -5, '#5a3a22', 2);
        D.line(ctx, -8, -7, -5, -9, 'rgba(255,255,255,.9)', 1.4); D.line(ctx, 6, -7, 9, -9, 'rgba(255,255,255,.9)', 1.4);
        break;
      case 'earmuffs':
        ctx.beginPath(); ctx.arc(0, 4, 15, Math.PI * 1.05, Math.PI * 1.95); stroke(ctx, 5, C.ink); ctx.beginPath(); ctx.arc(0, 4, 15, Math.PI * 1.05, Math.PI * 1.95); stroke(ctx, 3, '#ef6b6b');
        for (const k of [-1, 1]) { D.ball(ctx, k * 15, 3, 7, '#ef6b6b', { lw: 1.6 }); D.line(ctx, k * 15 - 3, 1, k * 15 + 3, 5, 'rgba(255,255,255,.45)', 1.2); }
        break;
      case 'explorer':
        ctx.beginPath(); ctx.arc(0, 0, 14, Math.PI, 0); ctx.closePath(); D.fillVol(ctx, -3, -7, 14, '#e8d6a8', lw);
        D.ellipse(ctx, 0, 1, 20, 4.5, '#e8d6a8', C.ink, lw);
        D.line(ctx, -13, -3, 13, -3, '#8a5a3a', 2.4);
        break;
      case 'gradcap':
        D.rr(ctx, -9, -6, 18, 8, 3); ctx.fillStyle = '#2a2a3a'; ctx.fill(); stroke(ctx, lw);
        D.poly(ctx, [-20, -8, 0, -15, 20, -8, 0, -1], '#2a2a3a', C.ink, lw);
        D.line(ctx, 0, -8, 13, -6, '#ffd25a', 1.4); D.line(ctx, 13, -6, 14, 3, '#ffd25a', 1.6);
        D.circle(ctx, 14, 4, 2, '#ffd25a');
        break;
      case 'leafcrown':
        ctx.beginPath(); ctx.ellipse(0, 0, 16, 4.5, 0, 0, TAU); stroke(ctx, 2.6, '#8a5a3a');
        for (let k = -2; k <= 2; k++) { ctx.save(); ctx.translate(k * 7, -3); ctx.rotate(k * 0.3); D.poly(ctx, [0, -11, 5, -3, 3, 0, 0, 3, -3, 0, -5, -3], ['#e8743b', '#f2a93b', '#c94f2c'][(k + 3) % 3], C.ink, 1.1); ctx.restore(); }
        break;
      case 'buckethat':
        D.poly(ctx, [-11, -12, 11, -12, 14, 0, -14, 0], '#7a9a6a', C.ink, lw);
        D.ellipse(ctx, 0, 0, 19, 4.5, '#7a9a6a', C.ink, lw);
        D.line(ctx, 8, -8, 14, -18, C.ink, 1); D.ball(ctx, 14, -18, 2.6, '#ef6b6b', { lw: 1 });
        break;
    }
    ctx.restore();
  }
  CK.Closet.drawTopper = drawTopper;

  // a little bottle cap, the Kingdom's pocket money
  D.cap = function (ctx, x, y, s, col) {
    s = s || 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); for (let i = 0; i < 28; i++) { const a = (i / 28) * TAU, r = i % 2 ? 8.6 : 10; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath();
    ctx.fillStyle = col || '#ef6b6b'; ctx.fill(); stroke(ctx, 1.6);
    D.circle(ctx, 0, 0, 6, D.shade(col || '#ef6b6b', 0.25), C.ink, 1.2);
    D.star(ctx, 0, 0, 3.2, '#fffaf0', 5, -Math.PI / 2);
    ctx.restore();
  };
  CK.Closet.hookGiant();
})();
