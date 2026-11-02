// UI and controller. Rules live in game-core.js. Vs-computer games run in the browser and are saved to
// localStorage after every move. Online games are run by the server (shiritori-lobby.js): the browser
// renders what the server sends and reconnects with a saved token if the connection drops.
(() => {
  const C = window.ShiritoriCore;
  const STORE_KEY = "shiritori.game.v1";
  const SESSION_KEY = "shiritori.online.v1";
  const NAME_KEY = "shiritori.name";
  const THEME_COOKIE = "shiritori_theme";
  const THEMES_COOKIE = "shiritori_themes";
  const COOKIE_BUDGET = 3500; // browsers allow about 4 KB per cookie; stay under it
  const HUMAN = 0;

  const BUILTIN = [
    { id: "classic", name: "Original", color: "#ff3019" },
    { id: "dark", name: "Night", color: "#ff6b81" },
    { id: "sakura", name: "Sakura", color: "#e0457b" },
    { id: "matcha", name: "Matcha", color: "#4b8b2f" },
    { id: "indigo", name: "Indigo", color: "#7aa2ff" },
  ];

  // The colors a custom theme sets. Everything else is derived (track = line, status colors = classic).
  const KEYS = [
    ["bg", "Background"], ["panel", "Panel"], ["text", "Text"], ["muted", "Muted text"],
    ["accent", "Accent"], ["accentText", "Accent text"], ["line", "Lines"], ["p0", "Player 1"], ["p1", "Player 2"],
  ];
  const CSS_NAME = { bg: "bg", panel: "panel", text: "text", muted: "muted", accent: "accent", accentText: "accent-text", line: "line", p0: "p0", p1: "p1" };
  const FULL_NAME = {
    ...CSS_NAME, track: "track", panel2: "panel-2", input: "input", heading: "heading", hi: "hi",
    card: "card", card2: "card-2", cardText: "card-text", glow: "glow",
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    menu: $("menu"), game: $("game"), over: $("over"), builder: $("builder"), lobby: $("lobby"),
    resume: $("resume"), resumeBtn: $("resume-btn"), discardBtn: $("discard-btn"),
    form: $("form"), word: $("word"), pass: $("pass"), error: $("error"),
    letter: $("letter"), clockFill: $("clock-fill"), clockText: $("clock-text"),
    status: $("status"), history: $("history"), quit: $("quit"),
    overTitle: $("over-title"), overText: $("over-text"), again: $("again"), toMenu: $("to-menu"),
    themes: $("themes"), makeTheme: $("make-theme"),
    themeName: $("theme-name"), swatches: $("swatches"), themeSave: $("theme-save"),
    themeCancel: $("theme-cancel"), themeDelete: $("theme-delete"), builderError: $("builder-error"),
    suggestText: $("suggest-text"), suggestSend: $("suggest-send"), suggestStatus: $("suggest-status"),
    lobbyConn: $("lobby-conn"), lobbyName: $("lobby-name"), hostBtn: $("host-btn"), lobbyList: $("lobby-list"),
    lobbyEmpty: $("lobby-empty"), joinForm: $("join-form"), joinCode: $("join-code"), lobbyWaiting: $("lobby-waiting"),
    lobbyCode: $("lobby-code"), lobbyCancel: $("lobby-cancel"), lobbyBrowse: $("lobby-browse"),
    lobbyError: $("lobby-error"), lobbyBack: $("lobby-back"),
  };

  let dict = null;
  let game = null;                     // the state being shown: local (vs computer) or from the server (online)
  let botTimer = null;
  let loop = null;
  let lastLetter = undefined;
  let activeId = "classic";
  let custom = [];                     // [{ id, name, vars: { bg, panel, ... } }]
  let editing = null;                  // theme id being edited in the builder, or "new"
  let roundRejects = new Set();        // words typed this round that weren't in the dictionary
  let inlineKeys = [];                 // CSS properties we set inline, so built-in themes can clear them

  // online state
  let ws = null;
  let wsRetry = null;
  let wsDelay = 1000;
  let online = null;                   // { room, seat, token, waiting, clockOffset }
  let lobbyRooms = [];

  // ---------- cookies ----------
  function readCookie(name) {
    const hit = document.cookie.split("; ").find((c) => c.startsWith(name + "="));
    if (!hit) return null;
    try { return decodeURIComponent(hit.slice(name.length + 1)); } catch (_) { return null; }
  }

  // Returns false when the value is too big for a cookie.
  function writeCookie(name, value) {
    const encoded = encodeURIComponent(value);
    if (encoded.length > COOKIE_BUDGET) return false;
    document.cookie = `${name}=${encoded}; max-age=31536000; path=/; SameSite=Lax`;
    return true;
  }

  function loadCustom() {
    try {
      const list = JSON.parse(readCookie(THEMES_COOKIE) || "[]");
      if (!Array.isArray(list)) return [];
      return list.filter((t) => t && typeof t.id === "string" && typeof t.name === "string" && isHexVars(t.vars));
    } catch (_) {
      return [];
    }
  }

  function isHexVars(vars) {
    return !!vars && KEYS.every(([k]) => /^#[0-9a-f]{6}$/i.test(vars[k] || ""));
  }

  function saveCustom(list) {
    return writeCookie(THEMES_COOKIE, JSON.stringify(list));
  }

  // ---------- persistence ----------
  function save() {
    try {
      if (game && !game.over && game.mode !== "online") localStorage.setItem(STORE_KEY, JSON.stringify(game));
      else localStorage.removeItem(STORE_KEY);
    } catch (_) { /* storage full or disabled: the game still works, it just won't survive a reload */ }
  }

  function loadSaved() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      const g = JSON.parse(raw);
      if (!g || g.over || !Array.isArray(g.left) || !Array.isArray(g.used)) return null;
      return g;
    } catch (_) {
      return null;
    }
  }

  function loadSession() {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      return s && s.room && s.token ? s : null;
    } catch (_) {
      return null;
    }
  }

  function saveSession(s) {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (_) {}
  }

  function clearSession() {
    try { localStorage.removeItem(SESSION_KEY); } catch (_) {}
  }

  // ---------- themes ----------
  function allThemes() {
    return [...BUILTIN, ...custom];
  }

  function findTheme(id) {
    return allThemes().find((t) => t.id === id);
  }

  function clearInline() {
    for (const prop of inlineKeys) document.documentElement.style.removeProperty(prop);
    inlineKeys = [];
  }

  // Sets the page colors from a vars object. Custom themes sit on top of the original base.
  // The builder picks 9 colors; the rest are derived here so every theme keeps the same look.
  function setVars(vars) {
    clearInline();
    const full = {
      track: vars.line,
      panel2: vars.panel,
      input: vars.bg,
      heading: vars.text,
      hi: vars.p0,
      card: "#d4d4d4",
      card2: "#bbbbbb",
      cardText: "#444444",
      glow: `color-mix(in srgb, ${vars.p0} 55%, transparent)`,
      ...vars,
    };
    for (const [key, prop] of Object.entries(FULL_NAME)) {
      if (!full[key]) continue;
      const name = `--${prop}`;
      document.documentElement.style.setProperty(name, full[key]);
      inlineKeys.push(name);
    }
    document.documentElement.dataset.theme = "classic";
  }

  function applyTheme(id, { persist = true } = {}) {
    const t = findTheme(id) || BUILTIN[0];
    clearInline();
    if (t.vars) {
      setVars(t.vars);
    } else {
      document.documentElement.dataset.theme = t.id;
    }
    activeId = t.id;
    markButtons();
    if (persist) writeCookie(THEME_COOKIE, t.id);
  }

  function markButtons() {
    for (const b of els.themes.querySelectorAll("button")) b.setAttribute("aria-pressed", String(b.dataset.theme === activeId));
  }

  function buildThemeBar() {
    els.themes.textContent = "";
    for (const t of allThemes()) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "theme-btn";
      b.dataset.theme = t.id;
      const color = t.vars ? t.vars.accent : t.color;
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.style.background = color;
      b.append(dot, document.createTextNode(t.name));
      b.addEventListener("click", () => {
        if (!els.builder.hidden) closeBuilder(false);
        applyTheme(t.id);
      });
      els.themes.appendChild(b);
    }
    markButtons();
  }

  // Reads a color the way the browser normalizes it (named colors, rgb(), etc.) into #rrggbb.
  function toHex(value) {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillStyle = value;
    return /^#[0-9a-f]{6}$/i.test(ctx.fillStyle) ? ctx.fillStyle : "#000000";
  }

  // ---------- theme builder ----------
  function currentVars() {
    const style = getComputedStyle(document.documentElement);
    const vars = {};
    for (const [key, prop] of Object.entries(CSS_NAME)) {
      if (key === "track") continue;
      vars[key] = toHex(style.getPropertyValue(`--${prop}`).trim() || "#000000");
    }
    return vars;
  }

  function readBuilderVars() {
    const vars = {};
    for (const [key] of KEYS) vars[key] = $("swatch-" + key).value;
    return vars;
  }

  function openBuilder() {
    // editing the active theme if it's custom, otherwise starting from the current look
    const current = findTheme(activeId);
    const edit = current && current.vars ? current : null;
    editing = edit ? edit.id : "new";
    const base = edit ? edit.vars : currentVars();
    els.themeName.value = edit ? edit.name : "";
    els.swatches.textContent = "";
    for (const [key, label] of KEYS) {
      const wrap = document.createElement("label");
      wrap.className = "swatch";
      const input = document.createElement("input");
      input.type = "color";
      input.id = "swatch-" + key;
      input.value = base[key];
      input.addEventListener("input", preview);
      wrap.append(input, document.createTextNode(label));
      els.swatches.appendChild(wrap);
    }
    els.themeDelete.hidden = !edit;
    els.builderError.textContent = "";
    hideScreens();
    els.builder.hidden = false;
    els.themeName.focus();
    preview();
  }

  // Live preview: paint the page with the builder colors without saving anything.
  function preview() {
    setVars(readBuilderVars());
  }

  function closeBuilder(restore = true) {
    els.builder.hidden = true;
    editing = null;
    if (restore) applyTheme(activeId, { persist: false });
    returnToCurrent();
  }

  // After the builder closes, go back to whatever screen was showing before.
  function returnToCurrent() {
    if (online) return showGame();
    if (game && !game.over) return showGame();
    showMenu();
  }

  function saveBuilder() {
    const name = els.themeName.value.trim();
    if (!name) return showBuilderError("Give your theme a name.");
    const vars = readBuilderVars();
    let id = editing && editing !== "new" ? editing : null;
    if (!id) id = "c-" + Math.random().toString(36).slice(2, 8);

    const next = custom.filter((t) => t.id !== id).concat([{ id, name, vars }]);
    if (!saveCustom(next)) {
      return showBuilderError("Cookie space is full. Delete a theme you don't use, then try again.");
    }
    custom = next;
    buildThemeBar();
    applyTheme(id);
    els.builder.hidden = true;
    editing = null;
    returnToCurrent();
  }

  function deleteBuilderTheme() {
    if (!editing || editing === "new") return;
    const next = custom.filter((t) => t.id !== editing);
    saveCustom(next);
    custom = next;
    buildThemeBar();
    applyTheme(BUILTIN[0].id);
    els.builder.hidden = true;
    editing = null;
    returnToCurrent();
  }

  function showBuilderError(msg) {
    els.builderError.textContent = msg;
  }

  // ---------- screens ----------
  function hideScreens() {
    els.menu.hidden = true;
    els.game.hidden = true;
    els.over.hidden = true;
    els.builder.hidden = true;
    els.lobby.hidden = true;
  }

  function showMenu() {
    stopBot();
    stopLoop();
    hideScreens();
    els.menu.hidden = false;
    els.resume.hidden = !loadSaved();
  }

  function startGame(mode, difficulty) {
    difficulty ||= document.querySelector('input[name="difficulty"]:checked').value;
    const names = ["You", "Computer"];
    game = C.newGame({ mode, difficulty, names, now: Date.now() });
    lastLetter = undefined;
    roundRejects = new Set();
    save();
    showGame();
  }

  function resumeSaved(g) {
    game = g;
    // The computer's turn restarts after a reload, because its move was scheduled in memory.
    if (game.mode === "bot" && game.turn !== HUMAN) game.turnStart = Date.now();
    lastLetter = undefined;
    roundRejects = new Set();
    showGame();
  }

  function showGame() {
    hideScreens();
    els.game.hidden = false;
    els.error.textContent = "";
    startLoop();
    afterMove(false);
  }

  // ---------- turn flow (vs computer) ----------
  function isBotTurn() {
    return !!game && game.mode === "bot" && game.turn !== HUMAN;
  }

  // Whether the local player may type or pass right now.
  function myTurn() {
    if (!game || game.over) return false;
    if (game.mode === "online") return online && game.turn === online.seat;
    return !isBotTurn();
  }

  // Current time on the clock's own scale. Online games use the server's clock.
  function clockNow() {
    return Date.now() + (online ? online.clockOffset : 0);
  }

  function afterMove(persist = true) {
    if (persist) save();
    if (!game) return;
    if (game.over) return showOver();
    render();
    scheduleBot();
    els.word.disabled = !myTurn();
    els.pass.disabled = !myTurn();
    if (myTurn() && !els.game.hidden) els.word.focus({ preventScroll: true });
  }

  function scheduleBot() {
    stopBot();
    if (!isBotTurn()) return;
    const delay = C.botThinkMs(game.difficulty);
    botTimer = setTimeout(() => {
      botTimer = null;
      if (!game || game.over || !isBotTurn()) return;
      const word = C.chooseBotWord(game, dict, game.difficulty);
      const now = Date.now();
      if (word) C.playWord(game, word, now - game.turnStart, now);
      else C.passTurn(game, now);
      afterMove();
    }, delay);
  }

  function stopBot() {
    if (botTimer) clearTimeout(botTimer);
    botTimer = null;
  }

  function humanTimeout() {
    C.passTurn(game, Date.now());
    afterMove();
  }

  function startLoop() {
    stopLoop();
    loop = setInterval(tick, 100);
  }

  function stopLoop() {
    if (loop) clearInterval(loop);
    loop = null;
  }

  function tick() {
    if (!game || game.over) return;
    if (game.mode === "online") return renderClock(C.remainingMs(game, clockNow()));
    if (!isBotTurn()) {
      const rem = C.remainingMs(game, Date.now());
      if (rem <= 0) return humanTimeout();
      renderClock(rem);
    }
  }

  function submitWord(e) {
    e.preventDefault();
    if (!myTurn()) return;
    if (game.mode === "online") {
      const verdict = C.validateWord(els.word.value, game, dict); // instant feedback; the server checks again
      if (!verdict.ok) {
        if (verdict.code === "not-in-dict") roundRejects.add(verdict.word || els.word.value.trim().toLowerCase());
        return showError(verdict.reason);
      }
      send({ t: "word", word: verdict.word });
      els.word.value = "";
      return;
    }
    const now = Date.now();
    if (C.remainingMs(game, now) <= 0) return humanTimeout();
    const verdict = C.validateWord(els.word.value, game, dict);
    if (!verdict.ok) {
      if (verdict.code === "not-in-dict") roundRejects.add(verdict.word || els.word.value.trim().toLowerCase());
      return showError(verdict.reason);
    }
    C.playWord(game, verdict.word, now - game.turnStart, now);
    els.word.value = "";
    els.error.textContent = "";
    afterMove();
  }

  function showError(msg) {
    els.error.textContent = msg;
    els.error.classList.remove("shake");
    void els.error.offsetWidth;
    els.error.classList.add("shake");
  }

  // ---------- rendering ----------
  function render() {
    if (!game) return;
    const bot = game.mode === "bot";
    const online_ = game.mode === "online";

    for (let i = 0; i < 2; i++) {
      const side = $("side-" + i);
      side.querySelector(".name").textContent = game.names[i] + (online_ && online && online.seat === i ? " (you)" : "");
      side.querySelector(".fill").style.width = `${(game.left[i] / C.START_SCORE) * 100}%`;
      side.querySelector(".pts").textContent = `${game.left[i]} left`;
      side.classList.toggle("active", !game.over && game.turn === i);
    }

    const letterText = game.letter ? game.letter.toUpperCase() : "Any";
    els.letter.textContent = letterText;
    if (lastLetter !== undefined && lastLetter !== game.letter) {
      els.letter.classList.remove("bump");
      void els.letter.offsetWidth;
      els.letter.classList.add("bump");
    }
    lastLetter = game.letter;

    let status;
    if (online_) {
      const who = game.names[game.turn];
      status = myTurn()
        ? (game.letter ? `Your turn. Start with ${game.letter.toUpperCase()}.` : "Your turn. Any letter to start.")
        : `${who}'s turn.` + (game.letter ? ` Start with ${game.letter.toUpperCase()}.` : "");
      if (online && online.notice) status = online.notice;
    } else if (isBotTurn()) status = "Computer is thinking…";
    else if (bot) status = game.letter ? `Your turn. Start with ${game.letter.toUpperCase()}.` : "Your turn. Any letter to start.";
    else status = "";
    els.status.textContent = status;

    renderClock(isBotTurn() ? C.TURN_SECONDS * 1000 : C.remainingMs(game, clockNow()));
    renderHistory();
  }

  function renderClock(rem) {
    const ms = Math.max(0, rem);
    els.clockFill.style.width = `${(ms / (C.TURN_SECONDS * 1000)) * 100}%`;
    els.clockFill.className = "clock-fill" + (ms < 3000 ? " low" : ms < 6000 ? " mid" : "");
    els.clockText.textContent = `${(ms / 1000).toFixed(1)}s`;
  }

  function renderHistory() {
    const list = els.history;
    list.textContent = "";
    if (!game.history.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "No moves yet.";
      list.appendChild(li);
      return;
    }
    for (let i = game.history.length - 1; i >= 0; i--) {
      const m = game.history[i];
      const li = document.createElement("li");
      li.className = (m.pass ? "pass " : "") + "p" + m.by;
      const left = document.createElement("div");
      const who = document.createElement("span");
      who.className = "who";
      who.textContent = game.names[m.by] + " ";
      const word = document.createElement("span");
      word.className = "word";
      word.textContent = m.pass ? "passed" : m.word;
      left.append(who, word);
      const cost = document.createElement("span");
      cost.className = "cost";
      cost.textContent = m.pass ? `+${-m.cost}` : `−${m.cost}`;
      li.append(left, cost);
      list.appendChild(li);
    }
  }

  function showOver() {
    stopBot();
    stopLoop();
    save();
    render();
    const w = game.winner;
    const mine = game.mode === "online" ? online?.seat : HUMAN;
    let title;
    let text;
    if (w === null) {
      title = "Stalemate";
      text = "Four passes in a row. Nobody wins.";
    } else if (w === mine) {
      title = "You win!";
      text = game.reason === "opponent left" ? "Your opponent left the game." : `${game.names[1 - w]} ran out of points first.`;
    } else {
      title = game.mode === "bot" ? "The computer wins" : `${game.names[w]} wins`;
      text = game.reason === "opponent left" ? "You left the game." : `${game.names[w]} ran out of points first.`;
    }
    els.overTitle.textContent = title;
    els.overText.textContent = text;

    // end-of-round suggestions: pre-fill with words the player typed that weren't in the list
    els.suggestText.value = [...roundRejects].join(", ");
    els.suggestStatus.textContent = "";
    els.suggestSend.disabled = false;

    if (game.mode === "online") {
      clearSession();
      stopSocketIfIdle();
    }

    els.over.hidden = false;
    els.again.focus();
  }

  // ---------- word suggestions ----------
  function parseWords(text) {
    return [...new Set(text.toLowerCase().split(/[\s,;]+/).map((w) => w.trim()).filter(Boolean))];
  }

  async function sendSuggestions() {
    const words = parseWords(els.suggestText.value);
    if (!words.length) {
      els.suggestStatus.textContent = "Type a word first.";
      return;
    }
    // words already on the list don't need sending
    const fresh = words.filter((w) => !dict.set.has(w));
    const known = words.length - fresh.length;
    if (!fresh.length) {
      els.suggestStatus.textContent = known ? "Those are already in the list." : "Type a word first.";
      return;
    }

    els.suggestSend.disabled = true;
    els.suggestStatus.textContent = "Sending…";
    try {
      const res = await fetch("api/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ words: fresh.slice(0, 20) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const sent = data.accepted.length;
      els.suggestText.value = "";
      els.suggestStatus.textContent = sent
        ? `Thanks! ${sent} word${sent === 1 ? "" : "s"} sent to izie for review.`
        : "Nothing new to send.";
      if (data.rejected.length) els.suggestStatus.textContent += " Skipped: " + data.rejected.map((r) => `${r.word} (${r.reason})`).join(", ");
    } catch (err) {
      els.suggestStatus.textContent = `Couldn't send right now: ${err.message}`;
      els.suggestSend.disabled = false;
    }
  }

  // ---------- online: connection ----------
  function wsUrl() {
    return (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/shatori/ws";
  }

  // Moves are never queued: if the socket is down, the player retries once it's back, so a
  // word can't land twice or late.
  function send(msg) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
      return true;
    }
    setLobbyConn("Reconnecting…");
    if (msg.t === "word" || msg.t === "pass") showError("Reconnecting. Try again in a moment.");
    connect();
    return false;
  }

  const HEARTBEAT_MS = 25000;
  const SILENT_MS = 60000; // no message for this long means the socket is dead even if it looks open
  let heartbeat = null;
  let lastHeard = 0;

  function startHeartbeat() {
    stopHeartbeat();
    lastHeard = Date.now();
    heartbeat = setInterval(() => {
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      if (Date.now() - lastHeard > SILENT_MS) {
        ws.close(); // onclose schedules the reconnect
        return;
      }
      ws.send(JSON.stringify({ t: "ping" }));
    }, HEARTBEAT_MS);
  }

  function stopHeartbeat() {
    if (heartbeat) clearInterval(heartbeat);
    heartbeat = null;
  }

  function setLobbyConn(text) {
    els.lobbyConn.textContent = text;
  }

  // Opens the socket if needed. When a game is saved, it rejoins with the saved token.
  function connect() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
    clearTimeout(wsRetry);
    try {
      ws = new WebSocket(wsUrl());
    } catch (_) {
      return scheduleReconnect();
    }
    const socket = ws;
    socket.onopen = () => {
      wsDelay = 1000;
      startHeartbeat();
      const session = loadSession();
      if (session) {
        socket.send(JSON.stringify({ t: "resume", room: session.room, token: session.token }));
      } else {
        socket.send(JSON.stringify({ t: "list" }));
        setLobbyConn("Connected.");
      }
      if (online && game && !game.over) setNotice(null);
    };
    socket.onmessage = (e) => {
      lastHeard = Date.now();
      let msg;
      try { msg = JSON.parse(e.data); } catch (_) { return; }
      if (msg.t === "pong") return;
      handle(msg);
    };
    socket.onclose = () => {
      if (ws === socket) ws = null;
      stopHeartbeat();
      const playing = online && game && !game.over;
      if (playing) setNotice("Connection lost. Reconnecting, your clock keeps running…");
      if (!els.lobby.hidden) setLobbyConn("Connection lost. Reconnecting…");
      // always keep trying while the player is in a game, a lobby, or holding a saved seat
      if (playing || !els.lobby.hidden || loadSession()) scheduleReconnect();
    };
    socket.onerror = () => {
      /* onclose follows and handles reconnecting */
    };
  }

  // Exponential backoff with jitter, capped at 10 seconds, and it never gives up.
  function scheduleReconnect() {
    clearTimeout(wsRetry);
    const jitter = Math.random() * 500;
    wsRetry = setTimeout(connect, wsDelay + jitter);
    wsDelay = Math.min(wsDelay * 2, 10000);
  }

  // The browser knows when it's back online: skip the wait.
  window.addEventListener("online", () => {
    wsDelay = 1000;
    connect();
  });

  function stopSocketIfIdle() {
    if (!ws) return;
    if (!els.lobby.hidden) return;
    ws.close();
    ws = null;
  }

  function setNotice(text) {
    if (!online) return;
    online.notice = text;
    if (game && game.mode === "online" && !game.over) render();
  }

  function handle(msg) {
    switch (msg.t) {
      case "lobbies":
        lobbyRooms = msg.rooms || [];
        renderLobbyList();
        break;

      case "joined":
        online = { room: msg.room, seat: msg.seat, token: msg.token, waiting: msg.seat === 0, clockOffset: 0, notice: null };
        saveSession({ room: msg.room, token: msg.token, seat: msg.seat });
        if (msg.seat === 0) {
          els.lobbyCode.textContent = msg.room;
          els.lobbyWaiting.hidden = false;
          els.lobbyBrowse.hidden = true;
          setLobbyConn("Your lobby is open.");
        }
        break;

      case "state":
        if (!online) return;
        online.clockOffset = (msg.serverNow || Date.now()) - Date.now();
        if (msg.waiting && !msg.state) return;
        if (msg.state) {
          const first = !game || game.mode !== "online";
          game = { ...msg.state, mode: "online", difficulty: "normal", names: msg.state.names };
          if (msg.notice) online.notice = msg.notice;
          else if (!msg.state.over) online.notice = null;
          if (first) {
            lastLetter = undefined;
            roundRejects = new Set();
            els.lobbyWaiting.hidden = true;
            els.lobbyBrowse.hidden = false;
            showGame();
          } else if (!game.over) {
            afterMove(false);
          } else {
            showOver();
          }
        }
        break;

      case "error":
        if (!els.game.hidden) showError(msg.msg);
        else setLobbyError(msg.msg);
        // a saved session that the server no longer knows: forget it
        if (/gone|ended|seat in that game/.test(msg.msg)) {
          clearSession();
          online = null;
          send({ t: "list" });
        }
        break;
    }
  }

  function setLobbyError(msg) {
    els.lobbyError.textContent = msg;
  }

  // ---------- online: lobby screens ----------
  function showLobby() {
    stopBot();
    stopLoop();
    hideScreens();
    els.lobby.hidden = false;
    els.lobbyName.value = localStorage.getItem(NAME_KEY) || "";
    els.lobbyError.textContent = "";
    els.lobbyWaiting.hidden = true;
    els.lobbyBrowse.hidden = false;
    setLobbyConn("Connecting…");
    connect();
    renderLobbyList();
  }

  function renderLobbyList() {
    els.lobbyList.textContent = "";
    els.lobbyEmpty.hidden = lobbyRooms.length > 0;
    for (const r of lobbyRooms) {
      const li = document.createElement("li");
      const label = document.createElement("span");
      label.textContent = `${r.host}'s lobby `;
      const code = document.createElement("span");
      code.className = "code";
      code.textContent = r.room;
      label.appendChild(code);
      const join = document.createElement("button");
      join.type = "button";
      join.className = "primary";
      join.textContent = "Join";
      join.addEventListener("click", () => joinRoom(r.room));
      li.append(label, join);
      els.lobbyList.appendChild(li);
    }
  }

  function currentName() {
    const name = els.lobbyName.value.trim();
    if (!name) {
      setLobbyError("Type your name first.");
      return null;
    }
    localStorage.setItem(NAME_KEY, name);
    return name;
  }

  function hostRoom() {
    const name = currentName();
    if (!name) return;
    setLobbyError("");
    send({ t: "host", name });
  }

  function joinRoom(code) {
    const name = currentName();
    if (!name) return;
    setLobbyError("");
    send({ t: "join", room: String(code || "").toUpperCase(), name });
  }

  function cancelLobby() {
    send({ t: "leave" });
    clearSession();
    online = null;
    els.lobbyWaiting.hidden = true;
    els.lobbyBrowse.hidden = false;
    setLobbyConn("Lobby closed.");
    send({ t: "list" });
  }

  // Leaving a live game forfeits it, so the button says so.
  function quitOnline() {
    if (!game.over && !confirm("Leaving now counts as a forfeit. Leave the game?")) return;
    send({ t: "leave" });
    clearSession();
    online = null;
    game = null;
    stopLoop();
    showLobby();
  }

  // ---------- events ----------
  function init() {
    activeId = readCookie(THEME_COOKIE) || (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "classic");
    custom = loadCustom();
    if (!findTheme(activeId)) activeId = BUILTIN[0].id;
    buildThemeBar();
    applyTheme(activeId, { persist: false });

    els.word.setAttribute("maxlength", String(C.MAX_LENGTH));
    document.querySelectorAll("button.card").forEach((b) => (b.disabled = true));
    els.resumeBtn.disabled = true;
    const loading = document.createElement("p");
    loading.id = "loading";
    loading.className = "status";
    loading.textContent = "Loading dictionary…";
    els.menu.querySelector(".modes").before(loading);

    // the base list plus any words izie has accepted from suggestions (the second file may not exist yet)
    Promise.all([
      fetch("words.txt").then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      }),
      fetch("words-extra.txt").then((r) => (r.ok ? r.text() : "")).catch(() => ""),
    ])
      .then(([base, extra]) => {
        dict = C.buildDictionary(base + "\n" + extra);
        loading.remove();
        document.querySelectorAll("button.card").forEach((b) => (b.disabled = false));
        els.resumeBtn.disabled = false;
        const saved = loadSaved();
        if (saved) resumeSaved(saved); // pick up a vs-computer game that was in progress
        else if (loadSession()) {
          showLobby(); // an online game is still saved: rejoin it through the socket
        }
      })
      .catch(() => {
        loading.textContent = "Couldn't load the dictionary. Check your connection and reload.";
        loading.style.color = "var(--danger)";
      });

    els.makeTheme.addEventListener("click", openBuilder);
    els.themeSave.addEventListener("click", saveBuilder);
    els.themeCancel.addEventListener("click", () => closeBuilder(true));
    els.themeDelete.addEventListener("click", deleteBuilderTheme);

    document.querySelectorAll("button.card").forEach((b) => {
      b.addEventListener("click", () => {
        if (b.dataset.mode === "online") showLobby();
        else startGame(b.dataset.mode);
      });
    });
    els.resumeBtn.addEventListener("click", () => {
      const g = loadSaved();
      if (g) resumeSaved(g);
      else showMenu();
    });
    els.discardBtn.addEventListener("click", () => {
      localStorage.removeItem(STORE_KEY);
      game = null;
      showMenu();
    });
    els.form.addEventListener("submit", submitWord);
    els.pass.addEventListener("click", () => {
      if (!myTurn()) return;
      if (game.mode === "online") return send({ t: "pass" });
      humanTimeout();
    });
    els.quit.addEventListener("click", () => {
      if (game && game.mode === "online") return quitOnline();
      save();
      showMenu();
    });
    els.again.addEventListener("click", () => {
      if (game && game.mode === "online") {
        game = null;
        online = null;
        return showLobby();
      }
      if (!game) return showMenu();
      startGame(game.mode, game.difficulty);
    });
    els.toMenu.addEventListener("click", () => {
      game = null;
      online = null;
      clearSession();
      showMenu();
    });

    els.hostBtn.addEventListener("click", hostRoom);
    els.joinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      joinRoom(els.joinCode.value.trim());
    });
    els.lobbyCancel.addEventListener("click", cancelLobby);
    els.lobbyBack.addEventListener("click", () => {
      if (!online) {
        // not in a lobby: close the socket and go back
        if (ws) ws.close();
        ws = null;
      }
      showMenu();
    });

    els.suggestSend.addEventListener("click", sendSuggestions);
    // Background tabs throttle timers; catch up when the tab comes back.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        tick();
        if (!online && !els.lobby.hidden) connect();
      }
    });
    window.addEventListener("pagehide", save);
    window.addEventListener("beforeunload", save);

    showMenu();
  }

  init();
})();
