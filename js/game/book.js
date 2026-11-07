// Cardboard Kingdom - the Kingdom Book (v2.22): one place for everything you can do besides the story.
// Six tabs, like a postal ledger: Odd Jobs, Challenges, Field Guide, Places, Tansy's Catalogue (skins)
// and the Garden page (pieces for your patch, garden.js).
// Keys: Q / Tab (or left/right on the tab row) change tabs, arrows move, Z picks, X or Esc closes.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input;
  const W = CK.W, H = CK.H;
  const C = D.C, TAU = Math.PI * 2;
  const stroke = (ctx, lw, col) => { ctx.strokeStyle = col || C.ink; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };
  const TABS = ['Odd Jobs', 'Challenges', 'Field Guide', 'Places', 'Catalogue', 'Garden'];
  const CAT_COLS = 10, GAR_COLS = 8;
  const PT = () => CK.Pastimes;
  const X0 = 40, Y0 = 14, BW = W - 80, BH = H - 28;

  const placeName = (id) => (CK.Chapters[id] ? CK.Chapters[id].name : id);
  const kingdomPlaces = () => Object.keys(CK.World.KITS).filter((id) => CK.Chapters[id]);

  class KingdomBook {
    constructor(tab) {
      this.transparent = true;
      this.tab = tab || 0; this.r = 0; this.c = 0; this.t = 0;
      this.who = 0;
      PT().pt();
      PT().checkChallenges();
    }
    party() { return CK.G.party.map((m) => m.id); }
    // how many columns each row of the current tab has (row -1 is the tab strip)
    rows() {
      switch (this.tab) {
        case 0: return [3];
        case 1: return Array(Math.ceil(PT().CHALLENGES.length / 2)).fill(2);
        case 2: return [5, 5, 5, 5];
        case 3: return kingdomPlaces().map(() => 1);
        case 4: return [this.party().length].concat(Array(Math.ceil(this.items().length / CAT_COLS)).fill(CAT_COLS));
        case 5: return Array(Math.ceil(CK.Garden.DECOR.length / GAR_COLS)).fill(GAR_COLS);
      }
      return [1];
    }
    tabRect(i) { const w = 118; return [X0 + 24 + i * (w + 8), Y0 + 12, w, 36]; }
    setTab(i) { this.tab = (i + TABS.length) % TABS.length; this.r = this.tab === 4 ? 1 : 0; this.c = 0; CK.Audio.sfx('select'); }
    update(dt) {
      this.t += dt;
      const rows = this.rows();
      if (Input.hit('back')) { CK.Audio.sfx('back'); CK.Scenes.remove(this); return; }
      if (Input.key('Tab') || Input.key('KeyR')) return this.setTab(this.tab + 1);
      if (Input.key('KeyQ')) return this.setTab(this.tab - 1);
      // tabs by mouse
      for (let i = 0; i < TABS.length; i++) if (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...this.tabRect(i))) return this.setTab(i);
      if (this.r < 0) {
        if (Input.hit('left')) return this.setTab(this.tab - 1);
        if (Input.hit('right')) return this.setTab(this.tab + 1);
        if (Input.hit('down') || Input.hit('ok')) { this.r = 0; this.c = 0; CK.Audio.sfx('blip'); }
        return;
      }
      const n = rows[this.r] || 1;
      if (Input.hit('left')) { this.c = (this.c + n - 1) % n; CK.Audio.sfx('blip'); }
      if (Input.hit('right')) { this.c = (this.c + 1) % n; CK.Audio.sfx('blip'); }
      if (Input.hit('up')) { this.r--; CK.Audio.sfx('blip'); if (this.r >= 0) this.c = Math.min(this.c, rows[this.r] - 1); }
      if (Input.hit('down') && this.r < rows.length - 1) { this.r++; this.c = Math.min(this.c, rows[this.r] - 1); CK.Audio.sfx('blip'); }
      // the mouse picks cells directly
      const cells = this.cells();
      for (const cell of cells) {
        if (Input.mouse.moved && D.inRect(Input.mouse.x, Input.mouse.y, ...cell.rect)) { this.r = cell.r; this.c = cell.c; }
        if (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...cell.rect)) { this.r = cell.r; this.c = cell.c; this.act(); return; }
      }
      if (Input.hit('ok')) this.act();
    }
    // clickable cells for the current tab
    cells() {
      const out = [];
      if (this.tab === 2) for (let i = 0; i < 20; i++) out.push({ r: Math.floor(i / 5), c: i % 5, rect: this.guideRect(i) });
      if (this.tab === 4) {
        this.party().forEach((id, i) => out.push({ r: 0, c: i, rect: this.memberRect(i) }));
        for (let i = 0; i < this.items().length; i++) out.push({ r: 1 + Math.floor(i / CAT_COLS), c: i % CAT_COLS, rect: this.itemRect(i) });
      }
      if (this.tab === 5) for (let i = 0; i < CK.Garden.DECOR.length; i++) out.push({ r: Math.floor(i / GAR_COLS), c: i % GAR_COLS, rect: this.gardenRect(i) });
      if (this.tab === 3) kingdomPlaces().forEach((id, i) => out.push({ r: i, c: 0, rect: [X0 + 26, Y0 + 92 + i * 34, BW - 52, 32] }));
      return out;
    }
    act() {
      if (this.tab === 3) {
        // read a treasure map you've found here (the first one not dug up yet, else any)
        const id = kingdomPlaces()[this.r], S = PT().pt(), maps = CK.Garden.treasuresIn(id).filter((t) => S.maps && S.maps[t.id]);
        const t = maps.find((q) => !S.dug[q.id]) || maps[0];
        if (!t) { CK.Audio.sfx('back'); CK.toast('No treasure maps from ' + placeName(id) + ' yet. Look behind signposts and at landmarks.'); return; }
        CK.Audio.sfx('select'); CK.Garden.openMap(t.id);
        return;
      }
      if (this.tab === 5) {
        const d = CK.Garden.DECOR[this.r * GAR_COLS + this.c];
        if (!d) return;
        if (d.loot) { CK.Audio.sfx('back'); CK.toast('Not for sale: this one is only found in buried treasure.'); return; }
        if (CK.Garden.buy(d.id)) { CK.Audio.sfx('chest'); CK.toast(`Ordered from Tansy: ${d.name}! (-${d.cost} caps) It's waiting at your patch.`); }
        else { CK.Audio.sfx('back'); CK.toast(`Need ${d.cost - CK.G.caps} more bottle caps`); }
        return;
      }
      if (this.tab === 4) {
        if (this.r === 0) { this.who = this.c; CK.Audio.sfx('select'); return; }
        const it = this.items()[(this.r - 1) * CAT_COLS + this.c];
        if (!it) return;
        const K = CK.Closet, who = this.party()[this.who];
        if (K.owns(it.id)) {
          K.wear(who, it.id); CK.Audio.sfx('tape');
          CK.toast(`${CK.Data.speakers[who].name} is wearing ${it.name}`);
        } else if (it.earn) {
          CK.Audio.sfx('back');
          CK.toast(earnText(it));
        } else if (CK.G.caps >= it.cost) {
          CK.G.caps -= it.cost; K.give(it.id); K.wear(who, it.id);
          CK.Audio.sfx('chest');
          CK.toast(`Ordered from Tansy: ${it.name}! (-${it.cost} caps)`);
          PT().tally('bought');
          CK.saveGame();
        } else {
          CK.Audio.sfx('back');
          CK.toast(`Need ${it.cost - CK.G.caps} more bottle caps`);
        }
      }
    }
    items() { return CK.Closet.PAINTS.concat(CK.Closet.TOPS); }
    guideRect(i) { const cw = 166, ch = 70; return [X0 + 26 + (i % 5) * (cw + 8), Y0 + 76 + Math.floor(i / 5) * (ch + 8), cw, ch]; }
    memberRect(i) { return [X0 + 26 + i * 78, Y0 + 72, 70, 30]; }
    itemRect(i) { const cw = 50, ch = 46; return [X0 + 340 + (i % CAT_COLS) * (cw + 3), Y0 + 70 + Math.floor(i / CAT_COLS) * (ch + 4), cw, ch]; }
    gardenRect(i) { const cw = 60, ch = 54; return [X0 + 336 + (i % GAR_COLS) * (cw + 6), Y0 + 70 + Math.floor(i / GAR_COLS) * (ch + 6), cw, ch]; }

    // ---------------------------------------------------------------- draw
    draw(ctx) {
      const P = D.pal();
      ctx.fillStyle = P.scrim; ctx.fillRect(0, 0, W, H);
      D.panel(ctx, X0, Y0, BW, BH, { theme: true });
      // tabs, like the index tabs of a ledger
      TABS.forEach((name, i) => {
        const [x, y, w, h] = this.tabRect(i), on = i === this.tab, foc = on && this.r < 0;
        D.rr(ctx, x, y, w, h, 10); ctx.fillStyle = on ? P.accent : P.sheetHi; ctx.fill();
        stroke(ctx, foc ? 3 : 1.5, foc ? P.text : on ? P.accentD : P.line);
        D.text(ctx, name, x + w / 2, y + 24, { size: D.T.ui, weight: 800, align: 'center', color: on ? P.onAccent : P.text });
      });
      // the purse, always visible
      D.cap(ctx, X0 + BW - 96, Y0 + 30, 1.1);
      D.text(ctx, '' + CK.G.caps, X0 + BW - 80, Y0 + 37, { size: D.T.body, weight: 800, color: P.text });
      [this.drawJobs, this.drawChallenges, this.drawGuide, this.drawPlaces, this.drawCatalogue, this.drawGarden][this.tab].call(this, ctx, P);
      if (this.tab !== 3) D.text(ctx, this.tab === 1 ? 'Q / Tab · X' : 'Q / Tab: change page   ·   X: close', X0 + BW - 24, Y0 + BH - 14, { size: D.T.small, weight: 700, align: 'right', color: P.soft });
    }
    sel(r, c) { return this.r === r && this.c === c; }
    hi(ctx, x, y, w, h, P, on) {
      D.rr(ctx, x, y, w, h, 10); ctx.fillStyle = on ? P.sheetHi : 'rgba(255,255,255,0)'; ctx.fill();
      stroke(ctx, on ? 3 : 1.5, on ? P.accent : P.line);
    }

    drawJobs(ctx, P) {
      const jobs = PT().jobs();
      D.text(ctx, 'Three small jobs at a time. Finish them for bottle caps.', X0 + 30, Y0 + 84, { size: D.T.ui, weight: 700, color: P.soft });
      jobs.forEach((j, i) => {
        const x = X0 + 30 + i * 278, y = Y0 + 104, w = 262, h = 220;
        this.hi(ctx, x, y, w, h, P, this.sel(0, i));
        // a pinned job slip with a postmark when it's done
        D.text(ctx, 'Job ' + (i + 1), x + 18, y + 32, { size: D.T.small, weight: 800, color: P.label });
        D.wrap(ctx, j.text, w - 36, D.T.body, 800).slice(0, 3).forEach((l, k) => D.text(ctx, l, x + 18, y + 64 + k * 26, { size: D.T.body, weight: 800, color: P.text }));
        const bw = w - 36, by = y + 150;
        D.rr(ctx, x + 18, by, bw, 14, 7); ctx.fillStyle = P.sheet; ctx.fill(); stroke(ctx, 1.5, P.line);
        if (j.have > 0) { D.rr(ctx, x + 18, by, Math.max(14, (bw * j.have) / j.n), 14, 7); ctx.fillStyle = j.done ? '#7cc76a' : P.accent; ctx.fill(); }
        D.text(ctx, j.done ? 'Done!' : j.have + ' of ' + j.n, x + 18, by + 38, { size: D.T.ui, weight: 800, color: j.done ? '#3f8a3a' : P.text });
        D.cap(ctx, x + w - 72, by + 32, 0.9);
        D.text(ctx, '+' + j.pay, x + w - 58, by + 38, { size: D.T.ui, weight: 800, color: P.text });
        if (j.done) D.postmark(ctx, x + w - 50, y + 46, 30, ['PAID'], { color: P.accent, waves: false, rot: -0.25, alpha: 0.85 });
      });
      const lines = ['New jobs get pinned up when you rest at a campfire, once the old ones are done.', 'Unfinished jobs never expire. Take as long as you like.'];
      lines.forEach((l, i) => D.text(ctx, l, X0 + 30, Y0 + 368 + i * 24, { size: D.T.ui, weight: 600, color: P.text }));
      D.text(ctx, 'Odd jobs done so far: ' + (PT().pt().tally.jobsDone || 0), X0 + 30, Y0 + 430, { size: D.T.small, weight: 700, color: P.soft });
    }

    drawChallenges(ctx, P) {
      const L = PT().CHALLENGES, claimed = PT().pt().claimed;
      const per = Math.ceil(L.length / 2);
      L.forEach((ch, i) => {
        const col = Math.floor(i / per), row = i % per;
        const x = X0 + 26 + col * 430, y = Y0 + 60 + row * 47, w = 420, h = 43;
        this.hi(ctx, x, y, w, h, P, this.sel(row, col));
        const v = ch.val(), next = ch.tiers.find((t) => v < t);
        D.text(ctx, ch.name, x + 14, y + 19, { size: D.T.ui, weight: 800, color: P.text });
        D.text(ctx, (next ? Math.min(v, next) + ' / ' + next + ' ' : 'All done: ' + v + ' ') + ch.what, x + 14, y + 37, { size: D.T.small, weight: 700, color: P.soft });
        ch.tiers.forEach((t, ti) => {
          const got = !!claimed[ch.id + '_' + ti], cx = x + w - 98 + ti * 30, cy = y + 22;
          D.circle(ctx, cx, cy, 11, got ? PT().TIER_COL[ti] : P.sheet, got ? C.ink : P.line, got ? 2 : 1.5);
          if (got) D.star(ctx, cx, cy, 5.5, '#fffaf0', 5, 0);
        });
        if (ch.gold) {
          const has = CK.Closet.owns(ch.gold);
          D.text(ctx, has ? '✓' : '★', x + w - 14, y + 27, { size: D.T.small, weight: 900, align: 'right', color: has ? '#3f8a3a' : PT().TIER_COL[2], outline: has ? null : C.ink, ow: 2 });
        }
      });
      const ch = L[this.r + this.c * per] || L[0];
      if (ch) {
        const reward = 'Bronze, silver, gold: +' + PT().TIER_PAY.join(', +') + ' caps' + (ch.gold ? '. Gold also earns ' + CK.Closet.item(ch.gold).name + ' (★).' : '.');
        D.text(ctx, reward, X0 + 30, Y0 + BH - 14, { size: D.T.small, weight: 700, color: P.text });
      }
    }

    drawGuide(ctx, P) {
      const ids = Object.keys(PT().CRITTERS), seen = PT().pt().seen;
      ids.forEach((id, i) => {
        const [x, y, w, h] = this.guideRect(i), on = this.sel(Math.floor(i / 5), i % 5), got = seen[id];
        this.hi(ctx, x, y, w, h, P, on);
        D.circle(ctx, x + 36, y + h / 2, 26, got ? '#f6efe0' : P.sheetHi, P.line, 1.5);
        if (got) PT().drawCritter(ctx, id, x + 36, y + h / 2 + 14, this.t, 1.7);
        else D.text(ctx, '?', x + 36, y + h / 2 + 10, { size: 28, weight: 900, align: 'center', color: P.soft });
        D.wrap(ctx, got ? PT().CRITTERS[id].name : '???', w - 78, D.T.small, 800).slice(0, 2).forEach((l, k) => D.text(ctx, l, x + 70, y + 30 + k * 18, { size: D.T.small, weight: 800, color: P.text }));
        if (got) D.text(ctx, 'seen ' + got, x + 70, y + h - 10, { size: 12, weight: 700, color: P.soft });
      });
      const id = ids[this.r * 5 + this.c] || ids[0], cr = PT().CRITTERS[id];
      const when = cr.time === 'night' ? 'Comes out at night' : cr.time === 'day' ? 'Out in the daytime' : 'Out day and night';
      const where = { meadow: 'in flowery meadows', grove: 'under trees and bushes', wet: 'by the water', sand: 'on the sand', plain: 'on open grass' }[cr.home];
      const places = cr.places.map(placeName).join(', ');
      const y = Y0 + 400;
      D.line(ctx, X0 + 26, y - 14, X0 + BW - 26, y - 14, P.line, 1.5);
      if (seen[id]) {
        D.text(ctx, cr.name, X0 + 30, y + 10, { size: D.T.ui, weight: 800, color: P.text });
        D.wrap(ctx, cr.fact, BW - 60, D.T.small, 600).slice(0, 2).forEach((l, k) => D.text(ctx, l, X0 + 30, y + 32 + k * 18, { size: D.T.small, weight: 600, color: P.text }));
      } else {
        D.text(ctx, 'Not sketched yet. ' + when + ', ' + where + '.', X0 + 30, y + 10, { size: D.T.ui, weight: 800, color: P.text });
        D.text(ctx, 'Try: ' + places + '. Walk up slowly, running spooks them.', X0 + 30, y + 32, { size: D.T.small, weight: 700, color: P.soft });
      }
      D.text(ctx, Object.keys(seen).length + ' of ' + ids.length + ' sketched', X0 + BW - 30, Y0 + 72 - 10, { size: D.T.small, weight: 800, align: 'right', color: P.soft });
    }

    drawPlaces(ctx, P) {
      const S = PT().pt(), ids = kingdomPlaces();
      const hx = [X0 + 40, X0 + 290, X0 + 400, X0 + 520, X0 + 630, X0 + 750];
      ['Place', 'Cranes', 'Landmarks', 'Critters', 'Signposts', 'Treasure'].forEach((h, i) => D.text(ctx, h, hx[i], Y0 + 82, { size: D.T.small, weight: 800, color: P.label }));
      ids.forEach((id, i) => {
        const y = Y0 + 92 + i * 34, on = this.sel(i, 0), visited = S.visited[id];
        if (on) { D.rr(ctx, X0 + 26, y, BW - 52, 32, 8); ctx.fillStyle = P.sheetHi; ctx.fill(); }
        D.line(ctx, X0 + 26, y + 33, X0 + BW - 26, y + 33, P.line, 1);
        D.text(ctx, visited ? placeName(id) : '? ? ?', hx[0], y + 22, { size: D.T.ui, weight: 800, color: visited ? P.text : P.soft });
        if (!visited) { D.text(ctx, 'Not visited yet', hx[1], y + 22, { size: D.T.small, weight: 700, color: P.soft }); return; }
        const wd = CK.World.get(CK.Chapters[id]);
        const cr = wd.cranes.filter((c) => S.cranes[c.id]).length, lm = wd.landmarks.filter((l) => S.marks[l.mark]).length;
        const kinds = Object.keys(PT().CRITTERS).filter((k) => PT().CRITTERS[k].places.includes(id)), ks = kinds.filter((k) => S.seen[k]).length;
        const sg = wd.signposts.filter((s) => S.signs[id + '_' + s.x + '_' + s.y]).length;
        const cell = (x, have, of) => { const full = have >= of; D.text(ctx, have + ' / ' + of + (full ? '  ✓' : ''), x, y + 22, { size: D.T.ui, weight: 800, color: full ? '#3f8a3a' : P.text }); };
        cell(hx[1], cr, wd.cranes.length); cell(hx[2], lm, wd.landmarks.length); cell(hx[3], ks, kinds.length); cell(hx[4], sg, wd.signposts.length);
        const dug = wd.treasures.filter((t) => S.dug && S.dug[t.id]).length, maps = wd.treasures.filter((t) => S.maps && S.maps[t.id]).length;
        cell(hx[5], dug, wd.treasures.length);
        if (maps > dug) D.text(ctx, 'map!', hx[5] + 64, y + 22, { size: D.T.small, weight: 800, color: '#c0502a' });
      });
      D.text(ctx, 'Tip: a lookout shows where cranes hide. Treasure maps hide behind signposts and at landmarks.', X0 + 30, Y0 + BH - 40, { size: D.T.small, weight: 700, color: P.soft });
      D.text(ctx, 'Z on a place: read its treasure map   ·   Q / Tab: change page   ·   X: close', X0 + 30, Y0 + BH - 14, { size: D.T.small, weight: 700, color: P.soft });
    }

    drawCatalogue(ctx, P) {
      const party = this.party(), who = party[this.who] || party[0], K = CK.Closet;
      // who to dress
      party.forEach((id, i) => {
        const [x, y, w, h] = this.memberRect(i), on = this.sel(0, i), cur = i === this.who;
        D.rr(ctx, x, y, w, h, 15); ctx.fillStyle = cur ? P.accent : P.sheetHi; ctx.fill(); stroke(ctx, on ? 3 : 1.5, on ? P.text : P.line);
        D.text(ctx, CK.Data.speakers[id].name.replace('Sir ', ''), x + w / 2, y + 21, { size: D.T.small, weight: 800, align: 'center', color: cur ? P.onAccent : P.text });
      });
      // preview: the hovered item tried on, on the map and as a giant
      const items = this.items(), it = this.r >= 1 ? items[(this.r - 1) * CAT_COLS + this.c] : null;
      const m = CK.G.party.find((q) => q.id === who);
      const c = K.closet(), saved = c.wear[who] ? Object.assign({}, c.wear[who]) : null;
      if (it) K.wear(who, it.id);
      D.rr(ctx, X0 + 26, Y0 + 112, 300, 300, 14); ctx.fillStyle = P.sheetHi; ctx.fill(); stroke(ctx, 1.5, P.line);
      ctx.save(); D.rr(ctx, X0 + 26, Y0 + 112, 300, 300, 14); ctx.clip();
      D.ellipse(ctx, X0 + 90, Y0 + 380, 40, 9, 'rgba(0,0,0,.12)');
      D.char(ctx, who, X0 + 90, Y0 + 378, { s: 2.2, costume: m.costume, dir: 'down', still: true });
      D.giant(ctx, m.costume, X0 + 236, Y0 + 396, { s: 0.82, who, still: true });
      ctx.restore();
      if (saved) c.wear[who] = saved; else delete c.wear[who];
      // the catalogue grid: paints, then toppers
      items.forEach((s, i) => {
        const [x, y, w, h] = this.itemRect(i), on = this.sel(1 + Math.floor(i / CAT_COLS), i % CAT_COLS);
        const own = K.owns(s.id), wearing = (c.wear[who] || {})[K.isPaint(s.id) ? 'paint' : 'top'] === s.id || (!(c.wear[who] || {}).paint && s.id === 'fresh') || (!(c.wear[who] || {}).top && s.id === 'none');
        D.rr(ctx, x, y, w, h, 8); ctx.fillStyle = wearing ? '#eafbe6' : P.sheet; ctx.fill(); stroke(ctx, on ? 3 : 1.5, on ? P.accent : wearing ? '#5aa04a' : P.line);
        if (K.isPaint(s.id)) {
          ctx.save(); D.rr(ctx, x + 10, y + 6, w - 20, 22, 6); ctx.clip();
          ctx.fillStyle = '#d9a66b'; ctx.fillRect(x + 10, y + 6, w - 20, 22);
          swatch(ctx, s.id, x + 10, y + 6, w - 20, 22);
          ctx.restore(); D.rr(ctx, x + 10, y + 6, w - 20, 22, 6); stroke(ctx, 1.5);
        } else if (s.id === 'none') {
          D.text(ctx, '—', x + w / 2, y + 26, { size: 20, weight: 800, align: 'center', color: P.soft });
        } else K.drawTopper(ctx, s.id, x + w / 2, y + 28, 0.95, 'down');
        const tag = own ? (wearing ? 'on' : 'own') : s.earn ? '★' : s.cost;
        if (!own && !s.earn) { D.cap(ctx, x + 12, y + h - 9, 0.5); D.text(ctx, '' + tag, x + 21, y + h - 4, { size: 13, weight: 800, color: P.text }); }
        else D.text(ctx, '' + tag, x + w / 2, y + h - 4, { size: 13, weight: 800, align: 'center', color: s.earn && !own ? PT().TIER_COL[2] : '#3f8a3a' });
      });
      // details for the hovered item
      const y = Y0 + 330;
      if (it) {
        D.text(ctx, it.name, X0 + 344, y + 18, { size: D.T.heading, weight: 700, color: P.text });
        D.wrap(ctx, it.blurb, 520, D.T.small, 600).slice(0, 2).forEach((l, k) => D.text(ctx, l, X0 + 344, y + 42 + k * 18, { size: D.T.small, weight: 600, color: P.text }));
        let how;
        if (K.owns(it.id)) how = 'Z: wear it (' + CK.Data.speakers[who].name + ')';
        else if (it.earn) how = earnText(it);
        else how = CK.G.caps >= it.cost ? `Z: order it for ${it.cost} bottle caps` : `${it.cost} bottle caps (you have ${CK.G.caps})`;
        D.text(ctx, how, X0 + 344, y + 90, { size: D.T.ui, weight: 800, color: P.accent });
      } else {
        D.text(ctx, 'Tansy\'s Catalogue', X0 + 344, y + 18, { size: D.T.heading, weight: 700, color: P.text });
        D.text(ctx, 'Pick a friend, then a paint job or a topper. Orders arrive by post, instantly.', X0 + 344, y + 42, { size: D.T.small, weight: 600, color: P.text });
      }
      D.text(ctx, 'Bottle caps come from playing: critters, cranes, jobs, challenges and battles. Never real money.', X0 + 26, Y0 + 470, { size: D.T.small, weight: 700, color: P.soft });
    }

    drawGarden(ctx, P) {
      const G = CK.Garden, S = G.st(), list = G.DECOR, it = list[this.r * GAR_COLS + this.c];
      // your patch, from above: what's out, and who has visited
      D.rr(ctx, X0 + 26, Y0 + 70, 300, 186, 14); ctx.fillStyle = P.sheetHi; ctx.fill(); stroke(ctx, 1.5, P.line);
      D.text(ctx, 'Your Patch, Blossom Hollow', X0 + 40, Y0 + 94, { size: D.T.small, weight: 800, color: P.label });
      const cs = 48, gx = X0 + 26 + (300 - cs * 5) / 2, gy = Y0 + 106;
      D.rr(ctx, gx - 4, gy - 4, cs * 5 + 8, cs * 3 + 8, 10); ctx.fillStyle = 'rgba(150,105,60,.18)'; ctx.fill(); stroke(ctx, 1.5, 'rgba(110,80,50,.5)');
      for (const q of S.patch) G.drawDecor(ctx, q.id, gx + q.i * cs + cs / 2, gy + q.j * cs + cs - 6, 0.74, U.hash(q.i, q.j, 3));
      if (!S.patchIntro) D.text(ctx, 'Find it by the road in Blossom Hollow', gx + cs * 2.5, gy + cs * 1.6, { size: D.T.small, weight: 800, align: 'center', color: P.soft });
      const guests = Object.keys(S.guests), kinds = Object.keys(PT().CRITTERS).length;
      D.text(ctx, 'Visitors so far: ' + guests.length + ' of ' + kinds + ' kinds', X0 + 26, Y0 + 284, { size: D.T.small, weight: 800, color: P.text });
      guests.slice(0, 10).forEach((id, i) => { D.circle(ctx, X0 + 44 + i * 28, Y0 + 312, 13, '#f6efe0', P.line, 1.2); PT().drawCritter(ctx, id, X0 + 44 + i * 28, Y0 + 320, this.t, 0.8); });
      // the grid of pieces
      list.forEach((d, i) => {
        const [x, y, w, h] = this.gardenRect(i), on = this.sel(Math.floor(i / GAR_COLS), i % GAR_COLS), have = G.owned(d.id);
        D.rr(ctx, x, y, w, h, 8); ctx.fillStyle = have ? '#eafbe6' : P.sheet; ctx.fill(); stroke(ctx, on ? 3 : 1.5, on ? P.accent : have ? '#5aa04a' : P.line);
        ctx.save(); D.rr(ctx, x, y, w, h, 8); ctx.clip();
        if (d.loot && !have) { ctx.globalAlpha = 0.25; }
        G.drawDecor(ctx, d.id, x + w / 2, y + h - 15, 0.6, 0.3);
        ctx.restore();
        if (have) D.text(ctx, '×' + have, x + w - 5, y + 14, { size: 12, weight: 800, align: 'right', color: '#3f8a3a' });
        if (d.loot) D.text(ctx, have ? '★' : '?', x + w / 2, y + h - 3, { size: 12, weight: 900, align: 'center', color: PT().TIER_COL[2], outline: C.ink, ow: 2 });
        else { D.cap(ctx, x + 14, y + h - 8, 0.5); D.text(ctx, '' + d.cost, x + 23, y + h - 3, { size: 12, weight: 800, color: P.text }); }
      });
      const y = Y0 + 316;
      if (it) {
        const fans = G.likedBy(it.id).map((c) => (S.seen[c] ? PT().CRITTERS[c].name : '???'));
        D.text(ctx, it.name + (G.owned(it.id) ? '   (you have ' + G.owned(it.id) + ', ' + G.placed(it.id) + ' out)' : ''), X0 + 344, y + 18, { size: D.T.ui, weight: 800, color: P.text });
        D.text(ctx, it.blurb, X0 + 344, y + 40, { size: D.T.small, weight: 600, color: P.text });
        D.text(ctx, 'Liked by: ' + fans.join(', '), X0 + 344, y + 60, { size: D.T.small, weight: 700, color: P.soft });
        const how = it.loot ? 'Not for sale. Only found in buried treasure.' : CK.G.caps >= it.cost ? `Z: order one for ${it.cost} bottle caps` : `${it.cost} bottle caps (you have ${CK.G.caps})`;
        D.text(ctx, how, X0 + 344, y + 86, { size: D.T.ui, weight: 800, color: P.accent });
      }
      D.text(ctx, 'Put pieces out at your patch. Critters you\'ve sketched visit when there\'s something they like.', X0 + 26, Y0 + 470, { size: D.T.small, weight: 700, color: P.soft });
    }
  }
  // how to get a skin that isn't for sale
  function earnText(it) {
    if (it.earn === 'loot') return 'Not for sale. It\'s buried somewhere (look for treasure maps).';
    if (it.earn.startsWith('friend:')) { const R = CK.Neighbors9 && CK.Neighbors9.N[it.earn.slice(7)]; return 'Not for sale. A keepsake from ' + (R ? R.name : 'a neighbor') + ', for becoming best friends (five hearts).'; }
    const ch = PT().CHALLENGES.find((q) => q.id === it.earn);
    return 'Not for sale. Earn gold in ' + (ch ? ch.name : 'a challenge') + '.';
  }
  // a swatch is the paint pattern over plain cardboard, in screen space
  function swatch(ctx, id, x, y, w, h) {
    if (id === 'fresh') return;
    const m = ctx.getTransform(), k = Math.hypot(m.a, m.b);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    CK.Closet.paintPattern(ctx, id, x * k + m.e, y * k + m.f, w * k, h * k, k);
    ctx.restore();
  }
  CK.KingdomBook = KingdomBook;
})();
