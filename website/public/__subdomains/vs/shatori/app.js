// UI and controller. Rules live in game-core.js. Game state is saved to localStorage after every move,
// so a reload or a dropped connection resumes the same game. Themes live in cookies.
(() => {
  const C = window.ShiritoriCore;
  const STORE_KEY = "shiritori.game.v1";
  const THEME_COOKIE = "shiritori_theme";
  const THEMES_COOKIE = "shiritori_themes";
  const COOKIE_BUDGET = 3500; // browsers allow about 4 KB per cookie; stay under it
  const HUMAN = 0;

  const BUILTIN = [
    { id: "classic", name: "Classic", color: "#c8102e" },
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
  const CSS_NAME = { bg: "bg", panel: "panel", text: "text", muted: "muted", accent: "accent", accentText: "accent-text", line: "line", p0: "p0", p1: "p1", track: "track" };

  const $ = (id) => document.getElementById(id);
  const els = {
    menu: $("menu"), game: $("game"), over: $("over"), builder: $("builder"),
    resume: $("resume"), resumeBtn: $("resume-btn"), discardBtn: $("discard-btn"),
    form: $("form"), word: $("word"), pass: $("pass"), error: $("error"),
    letter: $("letter"), clockFill: $("clock-fill"), clockText: $("clock-text"),
    status: $("status"), history: $("history"), quit: $("quit"),
    overTitle: $("over-title"), overText: $("over-text"), again: $("again"), toMenu: $("to-menu"),
    themes: $("themes"), makeTheme: $("make-theme"),
    themeName: $("theme-name"), swatches: $("swatches"), themeSave: $("theme-save"),
    themeCancel: $("theme-cancel"), themeDelete: $("theme-delete"), builderError: $("builder-error"),
    suggestText: $("suggest-text"), suggestSend: $("suggest-send"), suggestStatus: $("suggest-status"),
  };

  let dict = null;
  let game = null;
  let botTimer = null;
  let loop = null;
  let lastLetter = undefined;
  let activeId = "classic";
  let custom = [];                     // [{ id, name, vars: { bg, panel, ... } }]
  let editing = null;                  // theme id being edited in the builder, or "new"
  let roundRejects = new Set();        // words typed this round that weren't in the dictionary
  let inlineKeys = [];                 // CSS properties we set inline, so built-in themes can clear them

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

  // ---------- persistence of the game ----------
  function save() {
    try {
      if (game && !game.over) localStorage.setItem(STORE_KEY, JSON.stringify(game));
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

  // Sets the page colors from a vars object. Custom themes sit on top of the classic base.
  function setVars(vars) {
    clearInline();
    const full = { track: vars.line, ...vars };
    for (const [key, prop] of Object.entries(CSS_NAME)) {
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
    els.menu.hidden = true;
    els.game.hidden = true;
    els.over.hidden = true;
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
    if (game && !game.over) showGame();
    else showMenu();
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
    if (game && !game.over) showGame();
    else showMenu();
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
    if (game && !game.over) showGame();
    else showMenu();
  }

  function showBuilderError(msg) {
    els.builderError.textContent = msg;
  }

  // ---------- screens ----------
  function showMenu() {
    stopBot();
    stopLoop();
    els.game.hidden = true;
    els.over.hidden = true;
    els.builder.hidden = true;
    els.menu.hidden = false;
    els.resume.hidden = !loadSaved();
  }

  function startGame(mode, difficulty) {
    difficulty ||= document.querySelector('input[name="difficulty"]:checked').value;
    const names = mode === "bot" ? ["You", "Computer"] : ["Player 1", "Player 2"];
    game = C.newGame({ mode, difficulty, names, now: Date.now() });
    lastLetter = undefined;
    roundRejects = new Set();
    save();
    showGame();
  }

  function resumeSaved(g) {
    game = g;
    // The clock for a human turn keeps running across reloads. The computer's turn restarts,
    // because its move is scheduled in memory and was lost with the page.
    if (game.mode === "bot" && game.turn !== HUMAN) game.turnStart = Date.now();
    lastLetter = undefined;
    roundRejects = new Set();
    showGame();
  }

  function showGame() {
    els.menu.hidden = true;
    els.over.hidden = true;
    els.builder.hidden = true;
    els.game.hidden = false;
    els.error.textContent = "";
    startLoop();
    afterMove(false);
  }

  // ---------- turn flow ----------
  function isBotTurn() {
    return game && game.mode === "bot" && game.turn !== HUMAN;
  }

  function afterMove(persist = true) {
    if (persist) save();
    if (!game) return;
    if (game.over) return showOver();
    render();
    scheduleBot();
    if (!isBotTurn()) {
      els.word.disabled = false;
      els.pass.disabled = false;
      if (!els.game.hidden) els.word.focus({ preventScroll: true });
    }
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
    const now = Date.now();
    if (!isBotTurn()) {
      const rem = C.remainingMs(game, now);
      if (rem <= 0) return humanTimeout();
      renderClock(rem);
    }
  }

  function submitWord(e) {
    e.preventDefault();
    if (!game || game.over || isBotTurn()) return;
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

    for (let i = 0; i < 2; i++) {
      const side = $("side-" + i);
      side.querySelector(".name").textContent = game.names[i];
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
    if (isBotTurn()) status = "Computer is thinking…";
    else if (bot) status = game.letter ? `Your turn. Start with ${game.letter.toUpperCase()}.` : "Your turn. Any letter to start.";
    else status = `${game.names[game.turn]}'s turn.` + (game.letter ? ` Start with ${game.letter.toUpperCase()}.` : " Any letter to start.");
    els.status.textContent = status;

    els.word.disabled = isBotTurn();
    els.pass.disabled = isBotTurn();
    renderClock(isBotTurn() ? C.TURN_SECONDS * 1000 : C.remainingMs(game, Date.now()));
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
    let title;
    let text;
    if (w === null) {
      title = "Stalemate";
      text = "Four passes in a row. Nobody wins.";
    } else if (game.mode === "bot") {
      title = w === HUMAN ? "You win!" : "The computer wins";
      text = w === HUMAN ? "The computer ran out of points first." : "You ran out of points first. Try again?";
    } else {
      title = `${game.names[w]} wins!`;
      text = `${game.names[1 - w]} ran out of points first.`;
    }
    els.overTitle.textContent = title;
    els.overText.textContent = text;

    // end-of-round suggestions: pre-fill with words the player typed that weren't in the list
    els.suggestText.value = [...roundRejects].join(", ");
    els.suggestStatus.textContent = "";
    els.suggestSend.disabled = false;

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
        if (saved) resumeSaved(saved); // pick up a game that was in progress
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
      b.addEventListener("click", () => startGame(b.dataset.mode));
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
      if (!game || game.over || isBotTurn()) return;
      humanTimeout();
    });
    els.quit.addEventListener("click", () => {
      save();
      showMenu();
    });
    els.again.addEventListener("click", () => {
      if (!game) return showMenu();
      startGame(game.mode, game.difficulty);
    });
    els.toMenu.addEventListener("click", () => {
      game = null;
      showMenu();
    });
    els.suggestSend.addEventListener("click", sendSuggestions);
    // Background tabs throttle timers; catch up when the tab comes back.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") tick();
    });
    window.addEventListener("pagehide", save);
    window.addEventListener("beforeunload", save);

    showMenu();
  }

  init();
})();
