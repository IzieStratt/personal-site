// Pure game rules for Shiritori. No DOM, no timers: the UI passes in the clock.
// Rules follow shiritorigame.com (as implemented in bots/shiritori/src/rules.js):
//  - Each side starts at 150 points. Whoever's own score reaches 0 first wins.
//  - A word costs the seconds left on the clock (rounded) plus (length - 4).
//  - Words must be 4-29 letters, start with the last letter of the previous word, and be unused.
//  - Timing out is a pass that costs -5 (your score goes up by 5); the next player gets the same letter.
//  - Four passes in a row is a stalemate (draw).

(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ShiritoriCore = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const START_SCORE = 150;
  const TURN_SECONDS = 12;
  const MIN_LENGTH = 4;
  const MAX_LENGTH = 29;
  const TIMEOUT_COST = -5;
  const MAX_PASSES = 4;

  // Cost of a word submitted with `secondsLeft` on the clock.
  function wordCost(word, secondsLeft = TURN_SECONDS) {
    return Math.round(secondsLeft) + (word.length - 4);
  }

  // Cost of a word submitted `elapsedMs` after the turn started.
  function moveCost(word, elapsedMs) {
    return wordCost(word, TURN_SECONDS - elapsedMs / 1000);
  }

  // words: newline-separated text. Returns { set, byLetter } where byLetter[a] is longest-first.
  function buildDictionary(text) {
    const set = new Set();
    const byLetter = {};
    for (const raw of String(text).split("\n")) {
      const w = raw.trim();
      if (w.length < MIN_LENGTH || w.length > MAX_LENGTH || !/^[a-z]+$/.test(w)) continue;
      if (set.has(w)) continue;
      set.add(w);
      (byLetter[w[0]] ||= []).push(w);
    }
    for (const k of Object.keys(byLetter)) byLetter[k].sort((a, b) => b.length - a.length || (a < b ? -1 : 1));
    return { set, byLetter };
  }

  // Checks a typed word against the position. Returns { ok, word } or { ok: false, reason }.
  function validateWord(raw, state, dict) {
    const word = String(raw || "").trim().toLowerCase();
    if (!/^[a-z]+$/.test(word)) return { ok: false, reason: "Letters a to z only." };
    if (word.length < MIN_LENGTH) return { ok: false, reason: `Words need at least ${MIN_LENGTH} letters.` };
    if (word.length > MAX_LENGTH) return { ok: false, reason: `Words can have at most ${MAX_LENGTH} letters.` };
    if (state.letter && word[0] !== state.letter) return { ok: false, reason: `It has to start with "${state.letter.toUpperCase()}".` };
    if (state.used.includes(word)) return { ok: false, reason: `"${word}" was already used.` };
    if (!dict.set.has(word)) return { ok: false, code: "not-in-dict", reason: `"${word}" isn't in the dictionary.` };
    return { ok: true, word };
  }

  // A fresh game. names: [human-or-first, second]. mode: "bot" | "pair". difficulty: "easy" | "normal" | "hard".
  function newGame({ mode, difficulty = "normal", names, now }) {
    return {
      mode,
      difficulty,
      names,
      left: [START_SCORE, START_SCORE],
      turn: 0,
      letter: null,
      used: [],
      history: [],
      passes: 0,
      turnStart: now,
      over: false,
      winner: null, // index of the winning player, or null for a draw
      reason: null,
    };
  }

  function remainingMs(state, now) {
    return TURN_SECONDS * 1000 - (now - state.turnStart);
  }

  function finish(state, winner, reason) {
    state.over = true;
    state.winner = winner;
    state.reason = reason;
  }

  function nextTurn(state, now) {
    state.turn = 1 - state.turn;
    state.turnStart = now;
  }

  // Plays `word` for the side to move. elapsedMs is the time since the turn started.
  function playWord(state, word, elapsedMs, now) {
    const who = state.turn;
    const cost = moveCost(word, elapsedMs);
    state.left[who] = Math.max(0, state.left[who] - cost);
    state.used.push(word);
    state.letter = word[word.length - 1];
    state.passes = 0;
    state.history.push({ by: who, word, cost, left: state.left[who] });
    if (state.left[who] === 0) return finish(state, who, "reached zero");
    nextTurn(state, now);
  }

  // The side to move passes (timed out or no word). Their score goes up by 5 and the letter stays.
  function passTurn(state, now) {
    const who = state.turn;
    state.left[who] = Math.max(0, state.left[who] - TIMEOUT_COST);
    state.passes += 1;
    state.history.push({ by: who, pass: true, cost: TIMEOUT_COST, left: state.left[who] });
    if (state.passes >= MAX_PASSES) return finish(state, null, "stalemate");
    nextTurn(state, now);
  }

  // The computer's pick. Returns a word or null (it then passes).
  //   easy:   short words, so it runs out of points slowly
  //   normal: random among the 8 longest valid words
  //   hard:   the longest valid word
  function chooseBotWord(state, dict, difficulty, rng = Math.random) {
    const used = new Set(state.used);
    const letters = state.letter ? [state.letter] : Object.keys(dict.byLetter);
    if (!state.letter) letters.sort(() => rng() - 0.5);
    const valid = [];
    const want = difficulty === "normal" ? 8 : difficulty === "easy" ? 40 : 1;
    for (const letter of letters) {
      for (const w of dict.byLetter[letter] || []) {
        if (used.has(w)) continue;
        if (difficulty === "easy" && w.length > 6) continue;
        valid.push(w);
        if (valid.length >= want) break;
      }
      if (valid.length >= want) break;
      if (state.letter) break;
    }
    if (valid.length === 0) return null;
    if (difficulty === "hard") return valid[0];
    return valid[Math.floor(rng() * valid.length)];
  }

  // Computer's think time in ms, by difficulty (always under the 12-second clock).
  function botThinkMs(difficulty, rng = Math.random) {
    const [lo, hi] = difficulty === "easy" ? [4000, 7000] : difficulty === "hard" ? [1200, 2500] : [2500, 4500];
    return Math.round(lo + rng() * (hi - lo));
  }

  return {
    START_SCORE,
    TURN_SECONDS,
    MIN_LENGTH,
    MAX_LENGTH,
    TIMEOUT_COST,
    MAX_PASSES,
    wordCost,
    moveCost,
    buildDictionary,
    validateWord,
    newGame,
    remainingMs,
    playWord,
    passTurn,
    chooseBotWord,
    botThinkMs,
  };
});
