// Cardboard Kingdom website: the night-desk switch, the postcard dam, and the stamp viewer.
// No libraries; each part fails on its own without taking the page down.
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const calm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, calm() ? Math.min(ms, 120) : ms));

  // ------------------------------------------------------------ night desk
  function setupLamp() {
    const btn = $('#lamp'), root = document.documentElement;
    const dark = () => root.dataset.theme ? root.dataset.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    const sync = () => btn.setAttribute('aria-pressed', String(dark()));
    sync();
    btn.addEventListener('click', () => {
      const next = dark() ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('ck-desk', next); } catch (e) { /* private window: it just won't be remembered */ }
      sync();
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', sync);
  }

  // ------------------------------------------------------------ pictures that fail to arrive
  function setupImages() {
    const missing = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect width="320" height="180" fill="#eadbbb"/><text x="160" y="96" font-family="sans-serif" font-size="16" font-weight="700" fill="#5a5070" text-anchor="middle">This picture got lost in the post</text></svg>');
    document.querySelectorAll('img').forEach((img) => {
      img.addEventListener('error', function once() {
        img.removeEventListener('error', once);
        img.src = missing;
      });
    });
  }

  // ------------------------------------------------------------ the postcard dam
  // Same rules as the game's Chapter 1 check dam: the water pushes 1 at the top row and 4 at the
  // bottom, a row must be at least as strong as the push on it, and nothing may float.
  const ROWS = 4, COLS = 3, BUDGET = 12;
  const NAMES = ['empty', 'single-wall', 'double-wall', 'triple-wall'];
  const ROW_NAMES = ['top row', 'second row', 'third row', 'bottom row'];
  const push = (r) => r + 1;

  function setupDam() {
    const stage = $('#stage'), gridEl = $('#grid'), status = $('#status');
    const water = $('#water'), meter = $('#meter'), spent = $('#spent');
    const testBtn = $('#test'), clearBtn = $('#clear'), againBtn = $('#again');
    const flip = $('#flip'), back = $('#dam-card'), front = $('#dam-front'), stamped = $('#stamped');
    const grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
    let focus = [ROWS - 1, 0], testing = false;

    const mat = () => +document.querySelector('input[name="mat"]:checked').value;
    const rowStrength = (r) => grid[r].reduce((a, b) => a + b, 0);
    const cost = () => grid.flat().reduce((a, b) => a + b, 0);
    const floating = () => {
      const out = [];
      for (let r = 0; r < ROWS - 1; r++) for (let c = 0; c < COLS; c++) if (grid[r][c] && !grid[r + 1][c]) out.push([r, c]);
      return out;
    };

    // build the cells, the push labels and the row checks once
    const cells = [];
    for (let r = 0; r < ROWS; r++) {
      cells.push([]);
      for (let c = 0; c < COLS; c++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'cell';
        b.dataset.r = r; b.dataset.c = c;
        b.tabIndex = -1;
        gridEl.appendChild(b);
        cells[r].push(b);
      }
      const p = document.createElement('span');
      p.style.setProperty('--p', push(r));
      p.textContent = 'push ' + push(r);
      $('#pushes').appendChild(p);
      $('#checks').appendChild(document.createElement('span'));
    }

    function settle() {
      // anything the last test left behind goes away as soon as the design changes
      stage.classList.remove('flooded', 'wet');
      water.style.setProperty('--lvl', 0.35);
      cells.flat().forEach((b) => b.classList.remove('leak', 'float'));
      stamped.classList.remove('on');
    }

    function render() {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const v = grid[r][c], b = cells[r][c];
          b.className = 'cell' + (v ? ' s' + v : '') + (b.classList.contains('float') ? ' float' : '') + (b.classList.contains('leak') ? ' leak' : '');
          b.textContent = v ? String(v) : '';
          b.setAttribute('aria-label', `${ROW_NAMES[r]}, column ${c + 1}: ${NAMES[v]}`);
          b.tabIndex = r === focus[0] && c === focus[1] ? 0 : -1;
        }
        const s = rowStrength(r), chk = $('#checks').children[r];
        chk.textContent = s + '/' + push(r);
        chk.className = s >= push(r) ? 'ok' : s ? 'short' : '';
      }
      const n = cost();
      meter.value = Math.min(n, BUDGET);
      spent.textContent = n + ' of ' + BUDGET;
      spent.parentElement.classList.toggle('over', n > BUDGET);
      stage.classList.toggle('blank', n === 0);
    }

    function put(r, c, v) {
      if (testing) return;
      grid[r][c] = grid[r][c] === v ? 0 : v;
      settle();
      say('');
      render();
    }

    function say(text, tone) {
      status.textContent = text;
      status.className = 'status' + (tone ? ' ' + tone : '');
    }

    function moveFocus(r, c) {
      focus = [Math.max(0, Math.min(ROWS - 1, r)), Math.max(0, Math.min(COLS - 1, c))];
      render();
      cells[focus[0]][focus[1]].focus();
    }

    gridEl.addEventListener('click', (e) => {
      const b = e.target.closest('.cell');
      if (!b) return;
      focus = [+b.dataset.r, +b.dataset.c];
      put(focus[0], focus[1], mat());
    });
    gridEl.addEventListener('keydown', (e) => {
      const [r, c] = focus;
      const k = e.key;
      if (k === 'ArrowUp') moveFocus(r - 1, c);
      else if (k === 'ArrowDown') moveFocus(r + 1, c);
      else if (k === 'ArrowLeft') moveFocus(r, c - 1);
      else if (k === 'ArrowRight') moveFocus(r, c + 1);
      else if (k === '1' || k === '2' || k === '3') {
        document.querySelector(`input[name="mat"][value="${k}"]`).checked = true;
        grid[r][c] = 0;
        put(r, c, +k);
      } else if (k === '0' || k === 'Delete' || k === 'Backspace') { if (grid[r][c]) put(r, c, grid[r][c]); }
      else return;
      e.preventDefault();
    });

    clearBtn.addEventListener('click', () => {
      if (testing) return;
      grid.forEach((row) => row.fill(0));
      settle();
      say('Cleared. The brook is still rising.');
      render();
    });

    testBtn.addEventListener('click', async () => {
      if (testing) return;
      settle();
      render();
      const n = cost();
      if (!n) return say('Nothing to test yet. Start with the bottom row, where the water pushes hardest.', 'bad');
      if (n > BUDGET) return say(`That's ${n} scraps, and there are only ${BUDGET}. Strong cardboard low down lets you go lighter up top.`, 'bad');
      const fl = floating();
      if (fl.length) {
        fl.forEach(([r, c]) => cells[r][c].classList.add('float'));
        return say(fl.length === 1 ? 'One block is floating. Every block needs something under it.' : `${fl.length} blocks are floating. Every block needs something under it.`, 'bad');
      }
      testing = true;
      testBtn.disabled = clearBtn.disabled = true;
      say('Testing. Here comes the water...');
      stage.classList.add('wet');
      // the water climbs a row at a time, checking each row as it reaches it
      let failed = -1;
      for (let i = 1; i <= ROWS; i++) {
        const r = ROWS - i;
        water.style.setProperty('--lvl', i);
        $('#pushes').children[r].classList.add('under');
        await wait(560);
        if (rowStrength(r) < push(r)) { failed = r; break; }
      }
      if (failed >= 0) {
        cells[failed].forEach((b) => b.classList.add('leak'));
        stage.classList.add('flooded');
        say(`It leaked through the ${ROW_NAMES[failed]}. The water pushes ${push(failed)} there, and that row only holds ${rowStrength(failed)}.`, 'bad');
      } else {
        stamped.classList.add('on');
        say(`It held, for ${n} scraps. Strong at the bottom, light at the top, like a real dam.`, 'good');
        testBtn.disabled = clearBtn.disabled = false;
        await wait(1100);
        showFront(true);
      }
      $('#pushes').querySelectorAll('.under').forEach((s) => s.classList.remove('under'));
      testing = false;
      testBtn.disabled = clearBtn.disabled = false;
    });

    function showFront(on) {
      flip.classList.toggle('flipped', on);
      front.inert = !on;
      back.inert = on;
      if (on) { front.tabIndex = -1; front.focus({ preventScroll: true }); }
      else testBtn.focus({ preventScroll: true });
    }
    againBtn.addEventListener('click', () => { showFront(false); settle(); render(); say('Back to the drawing board. Can you do it for fewer scraps?'); });

    render();
  }

  // ------------------------------------------------------------ stamp viewer
  function setupViewer() {
    const dlg = $('#viewer'), cap = $('#viewer-cap');
    // the picture is made on first open, so the page never ships an empty <img>
    let img = null;
    document.querySelectorAll('#sheet button').forEach((b) => {
      b.classList.add('perf');
      b.addEventListener('click', () => {
        if (typeof dlg.showModal !== 'function') return window.open(b.dataset.full, '_blank');
        if (!img) {
          img = document.createElement('img');
          img.width = 960; img.height = 540;
          cap.before(img);
        }
        img.src = b.dataset.full;
        img.alt = b.dataset.cap;
        cap.textContent = b.dataset.cap;
        dlg.showModal();
      });
    });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  }

  function guard(name, fn) {
    try { fn(); } catch (err) {
      console.error(name, err);
      if (name === 'dam') {
        const card = $('#dam-card');
        if (card) card.innerHTML = '<p class="dam-broken">The dam didn\'t load this time. The real one is in Chapter 1: <a href="play.html">play the game</a>.</p>';
      }
    }
  }
  guard('lamp', setupLamp);
  guard('images', setupImages);
  guard('dam', setupDam);
  guard('viewer', setupViewer);
})();
