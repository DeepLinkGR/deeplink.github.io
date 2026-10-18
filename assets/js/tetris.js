/**
 * DeepLink chatbot easter egg: a small, dependency-free Tetris.
 * Loaded on demand by chatbot.js; exposes window.DeepLinkTetris.open({ lang, onClose }).
 * Nothing touches the DOM until open() is called, so the core can be tested in Node.
 */
(function (root) {
  "use strict";

  /* ================= Core (pure functions) ================= */
  const COLS = 10;
  const ROWS = 20;

  // Spawn shapes (rotation state 0). Values are the piece type index + 1.
  const SHAPES = {
    I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    O: [[2, 2], [2, 2]],
    T: [[0, 3, 0], [3, 3, 3], [0, 0, 0]],
    S: [[0, 4, 4], [4, 4, 0], [0, 0, 0]],
    Z: [[5, 5, 0], [0, 5, 5], [0, 0, 0]],
    J: [[6, 0, 0], [6, 6, 6], [0, 0, 0]],
    L: [[0, 0, 7], [7, 7, 7], [0, 0, 0]]
  };
  const TYPES = Object.keys(SHAPES);
  const COLORS = [null, "#2db6fa", "#f6c90e", "#b50edf", "#08da4e", "#e9445a", "#4154f1", "#f68c09"];
  const KICKS = [[0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0], [0, -1]];
  const LINE_POINTS = [0, 100, 300, 500, 800];

  function createBoard() {
    const b = [];
    for (let y = 0; y < ROWS; y++) b.push(new Array(COLS).fill(0));
    return b;
  }

  function rotateCW(shape) {
    const n = shape.length;
    const out = [];
    for (let y = 0; y < n; y++) {
      out.push([]);
      for (let x = 0; x < n; x++) out[y].push(shape[n - 1 - x][y]);
    }
    return out;
  }

  function collides(board, shape, px, py) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue;
        const bx = px + x;
        const by = py + y;
        if (bx < 0 || bx >= COLS || by >= ROWS) return true;
        if (by >= 0 && board[by][bx]) return true;
      }
    }
    return false;
  }

  function spawn(type) {
    const shape = SHAPES[type].map(function (r) { return r.slice(); });
    return { type: type, shape: shape, x: Math.floor((COLS - shape.length) / 2), y: type === "I" ? -1 : 0 };
  }

  // Returns the rotated piece (with wall kick applied) or null if it can't rotate.
  function tryRotate(board, piece) {
    const shape = rotateCW(piece.shape);
    for (let i = 0; i < KICKS.length; i++) {
      const nx = piece.x + KICKS[i][0];
      const ny = piece.y + KICKS[i][1];
      if (!collides(board, shape, nx, ny)) return { type: piece.type, shape: shape, x: nx, y: ny };
    }
    return null;
  }

  function merge(board, piece) {
    const b = board.map(function (r) { return r.slice(); });
    piece.shape.forEach(function (row, y) {
      row.forEach(function (v, x) {
        if (v && piece.y + y >= 0) b[piece.y + y][piece.x + x] = v;
      });
    });
    return b;
  }

  // Removes full rows; returns the new board, how many were cleared and which rows they were.
  function clearLines(board) {
    const rows = [];
    const kept = board.filter(function (row, y) {
      const full = row.every(function (v) { return v; });
      if (full) rows.push(y);
      return !full;
    });
    while (kept.length < ROWS) kept.unshift(new Array(COLS).fill(0));
    return { board: kept, cleared: rows.length, rows: rows };
  }

  function scoreFor(lines, level) { return LINE_POINTS[lines] * level; }

  function dropInterval(level) { return Math.max(70, 800 - (level - 1) * 75); }

  // "7-bag" randomiser: every piece appears once per bag of 7.
  function makeBag(rng) {
    rng = rng || Math.random;
    let bag = [];
    return function next() {
      if (!bag.length) {
        bag = TYPES.slice();
        for (let i = bag.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          const t = bag[i]; bag[i] = bag[j]; bag[j] = t;
        }
      }
      return bag.pop();
    };
  }

  function ghostY(board, piece) {
    let y = piece.y;
    while (!collides(board, piece.shape, piece.x, y + 1)) y++;
    return y;
  }

  const core = {
    COLS: COLS, ROWS: ROWS, TYPES: TYPES, createBoard: createBoard, rotateCW: rotateCW, collides: collides,
    spawn: spawn, tryRotate: tryRotate, merge: merge, clearLines: clearLines, scoreFor: scoreFor,
    dropInterval: dropInterval, makeBag: makeBag, ghostY: ghostY
  };

  /* ================= UI ================= */
  const TEXT = {
    el: {
      title: "Tetris", close: "Κλείσιμο", score: "Σκορ", level: "Επίπεδο", lines: "Γραμμές", best: "Ρεκόρ",
      next: "Επόμενο", start: "Έναρξη", resume: "Συνέχεια", again: "Παίξε ξανά", pause: "Παύση",
      ready: "Έτοιμοι;", paused: "Παύση", over: "Τέλος παιχνιδιού", record: "Νέο ρεκόρ! 🏆",
      left: "Αριστερά", right: "Δεξιά", rotate: "Περιστροφή", down: "Κάτω", drop: "Πτώση",
      help: "← → μετακίνηση · ↑ περιστροφή · ↓ κάτω · Space πτώση · P παύση · Esc κλείσιμο"
    },
    en: {
      title: "Tetris", close: "Close", score: "Score", level: "Level", lines: "Lines", best: "Best",
      next: "Next", start: "Start", resume: "Resume", again: "Play again", pause: "Pause",
      ready: "Ready?", paused: "Paused", over: "Game over", record: "New record! 🏆",
      left: "Left", right: "Right", rotate: "Rotate", down: "Down", drop: "Drop",
      help: "← → move · ↑ rotate · ↓ soft drop · Space hard drop · P pause · Esc close"
    }
  };
  const BEST_KEY = "deeplink-tetris-best";

  let ui = null;   // DOM references, built on first open
  let g = null;    // game state
  let t = TEXT.el;
  let opts = {};
  let rafId = 0;
  let prevOverflow = "";

  function loadBest() { try { return parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch (e) { return 0; } }
  function saveBest(v) { try { localStorage.setItem(BEST_KEY, String(v)); } catch (e) { /* ignore */ } }

  function newGame() {
    const next = makeBag();
    g = {
      board: createBoard(), bag: next, piece: spawn(next()), next: next(),
      score: 0, lines: 0, level: 1, best: loadBest(), state: "ready",
      lastDrop: 0, flash: null, record: false
    };
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function button(cls, label, html) {
    const b = el("button", cls);
    b.type = "button";
    b.setAttribute("aria-label", label);
    b.innerHTML = html;
    return b;
  }

  function stat(label) {
    const box = el("div", "dlt-stat");
    const l = el("span", "dlt-stat-label", label);
    const v = el("span", "dlt-stat-value", "0");
    box.append(l, v);
    return { box: box, label: l, value: v };
  }

  function build() {
    const overlay = el("div", "dlt-overlay");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.hidden = true;

    const win = el("div", "dlt-window");
    const header = el("div", "dlt-header");
    const title = el("strong", null, "Tetris");
    const pauseBtn = button("dlt-icon-btn", "", '<i class="bi bi-pause-fill" aria-hidden="true"></i>');
    const closeBtn = button("dlt-icon-btn", "", '<i class="bi bi-x-lg" aria-hidden="true"></i>');
    header.append(title, pauseBtn, closeBtn);

    const body = el("div", "dlt-body");
    const wrap = el("div", "dlt-board-wrap");
    wrap.tabIndex = -1;
    const canvas = el("canvas", "dlt-board");
    const msg = el("div", "dlt-msg");
    const msgTitle = el("strong", "dlt-msg-title");
    const msgSub = el("span", "dlt-msg-sub");
    const msgBtn = el("button", "dlt-msg-btn");
    msgBtn.type = "button";
    msg.append(msgTitle, msgSub, msgBtn);
    wrap.append(canvas, msg);

    const side = el("aside", "dlt-side");
    const sScore = stat(""), sLevel = stat(""), sLines = stat(""), sBest = stat("");
    const nextBox = el("div", "dlt-stat dlt-next");
    const nextLabel = el("span", "dlt-stat-label");
    const nextCanvas = el("canvas", "dlt-next-canvas");
    nextBox.append(nextLabel, nextCanvas);
    side.append(sScore.box, sLevel.box, sLines.box, sBest.box, nextBox);
    body.append(wrap, side);

    const controls = el("div", "dlt-controls");
    const cRotate = button("dlt-ctl", "", '<i class="bi bi-arrow-clockwise" aria-hidden="true"></i>');
    const cLeft = button("dlt-ctl", "", '<i class="bi bi-chevron-left" aria-hidden="true"></i>');
    const cDown = button("dlt-ctl", "", '<i class="bi bi-chevron-down" aria-hidden="true"></i>');
    const cRight = button("dlt-ctl", "", '<i class="bi bi-chevron-right" aria-hidden="true"></i>');
    const cDrop = button("dlt-ctl dlt-ctl-drop", "", '<i class="bi bi-chevron-double-down" aria-hidden="true"></i>');
    controls.append(cRotate, cLeft, cDown, cRight, cDrop);

    const help = el("p", "dlt-help");
    win.append(header, body, controls, help);
    overlay.append(win);
    document.body.append(overlay);

    ui = {
      overlay: overlay, win: win, header: header, side: side, controls: controls, title: title, pauseBtn: pauseBtn, closeBtn: closeBtn, wrap: wrap,
      canvas: canvas, ctx: canvas.getContext("2d"), msg: msg, msgTitle: msgTitle, msgSub: msgSub, msgBtn: msgBtn,
      sScore: sScore, sLevel: sLevel, sLines: sLines, sBest: sBest, nextLabel: nextLabel,
      nextCanvas: nextCanvas, nextCtx: nextCanvas.getContext("2d"), help: help,
      cRotate: cRotate, cLeft: cLeft, cDown: cDown, cRight: cRight, cDrop: cDrop, cell: 24
    };

    closeBtn.addEventListener("click", close);
    pauseBtn.addEventListener("click", togglePause);
    msgBtn.addEventListener("click", function () {
      if (g.state === "over") { newGame(); start(); }
      else start();
    });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });

    holdRepeat(cLeft, function () { move(-1); });
    holdRepeat(cRight, function () { move(1); });
    holdRepeat(cDown, softDrop);
    tap(cRotate, rotate);
    tap(cDrop, hardDrop);
    swipe(canvas);
    window.addEventListener("resize", function () { if (!ui.overlay.hidden) { layout(); draw(); } });
    document.addEventListener("visibilitychange", function () { if (document.hidden && g && g.state === "playing") pause(); });
  }

  function applyText() {
    ui.overlay.setAttribute("aria-label", t.title);
    ui.closeBtn.setAttribute("aria-label", t.close);
    ui.pauseBtn.setAttribute("aria-label", t.pause);
    ui.sScore.label.textContent = t.score;
    ui.sLevel.label.textContent = t.level;
    ui.sLines.label.textContent = t.lines;
    ui.sBest.label.textContent = t.best;
    ui.nextLabel.textContent = t.next;
    ui.cRotate.setAttribute("aria-label", t.rotate);
    ui.cLeft.setAttribute("aria-label", t.left);
    ui.cDown.setAttribute("aria-label", t.down);
    ui.cRight.setAttribute("aria-label", t.right);
    ui.cDrop.setAttribute("aria-label", t.drop);
    ui.help.textContent = t.help;
  }

  /* ---------- Input helpers ---------- */
  function tap(btn, fn) {
    btn.addEventListener("pointerdown", function (e) { e.preventDefault(); if (g.state === "playing") fn(); });
  }

  function holdRepeat(btn, fn) {
    let timer = 0;
    const stop = function () { clearTimeout(timer); clearInterval(timer); timer = 0; };
    btn.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      if (g.state !== "playing") return;
      fn();
      stop();
      timer = setTimeout(function () { timer = setInterval(function () { if (g.state === "playing") fn(); else stop(); }, 60); }, 170);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { btn.addEventListener(ev, stop); });
  }

  function swipe(target) {
    let sx = 0, sy = 0, active = false;
    target.addEventListener("pointerdown", function (e) { active = true; sx = e.clientX; sy = e.clientY; });
    target.addEventListener("pointerup", function (e) {
      if (!active || g.state !== "playing") return;
      active = false;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) { rotate(); return; }
      if (dy > 40 && dy > Math.abs(dx)) { hardDrop(); return; }
      const steps = Math.round(dx / ui.cell);
      for (let i = 0; i < Math.abs(steps); i++) move(steps > 0 ? 1 : -1);
    });
    target.addEventListener("pointercancel", function () { active = false; });
  }

  function onKey(e) {
    if (!ui || ui.overlay.hidden) return;
    const k = e.key;
    // Keys handled here must not reach the chatbot (its Esc would close the chat too).
    const handled = function () { e.preventDefault(); e.stopPropagation(); };
    if (k === "Escape") { handled(); close(); return; }
    if (k === "p" || k === "P") { handled(); togglePause(); return; }
    if ((k === "Enter" || k === " ") && g.state !== "playing" && document.activeElement !== ui.msgBtn) {
      handled(); ui.msgBtn.click(); return;
    }
    if (g.state !== "playing") return;
    const actions = {
      ArrowLeft: function () { move(-1); }, ArrowRight: function () { move(1); },
      ArrowDown: softDrop, ArrowUp: rotate, x: rotate, X: rotate, " ": hardDrop
    };
    if (actions[k]) { handled(); actions[k](); }
  }

  /* ---------- Game actions ---------- */
  function move(dx) {
    if (!collides(g.board, g.piece.shape, g.piece.x + dx, g.piece.y)) { g.piece.x += dx; draw(); }
  }

  function rotate() {
    const r = tryRotate(g.board, g.piece);
    if (r) { g.piece = r; draw(); }
  }

  function softDrop() {
    if (!collides(g.board, g.piece.shape, g.piece.x, g.piece.y + 1)) {
      g.piece.y++; g.score += 1; g.lastDrop = performance.now(); updateStats(); draw();
    } else lock();
  }

  function hardDrop() {
    const y = ghostY(g.board, g.piece);
    g.score += 2 * (y - g.piece.y);
    g.piece.y = y;
    lock();
  }

  function lock() {
    g.board = merge(g.board, g.piece);
    const res = clearLines(g.board);
    if (res.cleared) {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        g.flash = { rows: res.rows, until: performance.now() + 140, board: g.board };
      }
      g.lines += res.cleared;
      g.score += scoreFor(res.cleared, g.level);
      g.level = 1 + Math.floor(g.lines / 10);
      g.board = res.board;
    }
    g.piece = spawn(g.next);
    g.next = g.bag();
    g.lastDrop = performance.now();
    if (collides(g.board, g.piece.shape, g.piece.x, g.piece.y)) gameOver();
    updateStats();
    draw();
  }

  function gameOver() {
    g.state = "over";
    if (g.score > g.best) { g.best = g.score; g.record = true; saveBest(g.best); }
    showMsg(t.over, (g.record ? t.record + " " : "") + t.score + ": " + g.score, t.again);
  }

  function start() {
    g.state = "playing";
    g.lastDrop = performance.now();
    hideMsg();
    loop();
  }

  function pause() {
    if (g.state !== "playing") return;
    g.state = "paused";
    cancelAnimationFrame(rafId);
    showMsg(t.paused, "", t.resume);
  }

  function togglePause() {
    if (g.state === "playing") pause();
    else if (g.state === "paused") start();
  }

  function loop() {
    cancelAnimationFrame(rafId);
    const tick = function (now) {
      if (g.state !== "playing") return;
      if (g.flash && now < g.flash.until) { draw(); rafId = requestAnimationFrame(tick); return; }
      g.flash = null;
      if (now - g.lastDrop >= dropInterval(g.level)) {
        g.lastDrop = now;
        if (!collides(g.board, g.piece.shape, g.piece.x, g.piece.y + 1)) g.piece.y++;
        else lock();
      }
      draw();
      if (g.state === "playing") rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  /* ---------- Rendering ---------- */
  function showMsg(title, sub, btn) {
    ui.msgTitle.textContent = title;
    ui.msgSub.textContent = sub;
    ui.msgSub.hidden = !sub;
    ui.msgBtn.textContent = btn;
    ui.msg.hidden = false;
    ui.msgBtn.focus();
  }
  function hideMsg() { ui.msg.hidden = true; ui.wrap.focus(); }

  function updateStats() {
    ui.sScore.value.textContent = g.score;
    ui.sLevel.value.textContent = g.level;
    ui.sLines.value.textContent = g.lines;
    ui.sBest.value.textContent = Math.max(g.best, g.score);
    drawNext();
  }

  function layout() {
    const phone = window.matchMedia("(max-width: 575px)").matches;
    let cell;
    if (phone) {
      // Height left for the board after header, stats row, controls and padding.
      const reserved = ui.header.offsetHeight + ui.side.offsetHeight + ui.controls.offsetHeight + 48;
      const availH = window.innerHeight - reserved;
      const availW = window.innerWidth - 32;
      cell = Math.floor(Math.min(availW / COLS, availH / ROWS));
    } else {
      cell = Math.floor(Math.min(26, (window.innerHeight - 200) / ROWS));
    }
    cell = Math.max(12, cell);
    ui.cell = cell;
    sizeCanvas(ui.canvas, ui.ctx, cell * COLS, cell * ROWS);
    sizeCanvas(ui.nextCanvas, ui.nextCtx, 4 * 16, 4 * 16);
  }

  function sizeCanvas(c, ctx, w, h) {
    const dpr = window.devicePixelRatio || 1;
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    c.style.width = w + "px";
    c.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function cellRect(ctx, x, y, size, color, alpha) {
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
    if (alpha == null) {
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(x * size + 1, y * size + 1, size - 2, Math.max(2, size * 0.18));
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    if (!ui || !g) return;
    const ctx = ui.ctx, s = ui.cell;
    ctx.fillStyle = "#0b1a4a";
    ctx.fillRect(0, 0, COLS * s, ROWS * s);
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let x = 1; x < COLS; x++) { ctx.beginPath(); ctx.moveTo(x * s + 0.5, 0); ctx.lineTo(x * s + 0.5, ROWS * s); ctx.stroke(); }
    for (let y = 1; y < ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * s + 0.5); ctx.lineTo(COLS * s, y * s + 0.5); ctx.stroke(); }

    if (g.flash) {
      g.flash.board.forEach(function (row, y) {
        const flashing = g.flash.rows.indexOf(y) !== -1;
        row.forEach(function (v, x) { if (v) cellRect(ctx, x, y, s, flashing ? "#ffffff" : COLORS[v]); });
      });
      return;
    }

    g.board.forEach(function (row, y) { row.forEach(function (v, x) { if (v) cellRect(ctx, x, y, s, COLORS[v]); }); });

    if (g.state === "playing" || g.state === "paused") {
      const gy = ghostY(g.board, g.piece);
      g.piece.shape.forEach(function (row, y) {
        row.forEach(function (v, x) { if (v && gy + y >= 0) cellRect(ctx, g.piece.x + x, gy + y, s, COLORS[v], 0.22); });
      });
      g.piece.shape.forEach(function (row, y) {
        row.forEach(function (v, x) { if (v && g.piece.y + y >= 0) cellRect(ctx, g.piece.x + x, g.piece.y + y, s, COLORS[v]); });
      });
    }
  }

  function drawNext() {
    const ctx = ui.nextCtx, s = 16, shape = SHAPES[g.next];
    ctx.clearRect(0, 0, 64, 64);
    const ox = (4 - shape.length) / 2, rows = shape.filter(function (r) { return r.some(Boolean); });
    const oy = (4 - rows.length) / 2 - shape.indexOf(rows[0]);
    shape.forEach(function (row, y) { row.forEach(function (v, x) { if (v) cellRect(ctx, x + ox, y + oy, s, COLORS[v]); }); });
  }

  /* ---------- Open / close ---------- */
  function open(options) {
    opts = options || {};
    t = TEXT[opts.lang === "en" ? "en" : "el"];
    if (!ui) build();
    if (!g) newGame();
    applyText();
    ui.overlay.hidden = false;
    prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.addEventListener("keydown", onKey, true);
    layout();
    updateStats();
    draw();
    if (g.state === "ready") showMsg(t.ready, "", t.start);
    else if (g.state === "paused") showMsg(t.paused, "", t.resume);
    else if (g.state === "over") showMsg(t.over, t.score + ": " + g.score, t.again);
  }

  function close() {
    if (!ui || ui.overlay.hidden) return;
    if (g.state === "playing") pause();
    cancelAnimationFrame(rafId);
    ui.overlay.hidden = true;
    document.documentElement.style.overflow = prevOverflow;
    document.removeEventListener("keydown", onKey, true);
    if (typeof opts.onClose === "function") opts.onClose();
  }

  root.DeepLinkTetris = { open: open, close: close, _core: core };
})(typeof window !== "undefined" ? window : globalThis);
