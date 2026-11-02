# Shiritori

A browser version of the Japanese word-chain game, in English. Plays against the computer or a second player on the same device. Runs entirely in the browser: no server calls during play, so a dropped connection doesn't interrupt a game.

## Files

- `index.html`: page and layout
- `style.css`: layout and five themes (Classic, Night, Sakura, Matcha, Indigo) as CSS variables
- `game-core.js`: rules, scoring, and the computer player (no DOM; testable in Node)
- `app.js`: UI, turn clock, saving to `localStorage`
- `words.txt`: dictionary, one lowercase word per line (4 to 29 letters)

## Rules

Same as shiritorigame.com, as implemented in `bots/shiritori/src/rules.js`:

- Each side starts at 150 points. The first to reach 0 wins.
- A word costs the seconds left on the clock (rounded) plus its letters beyond 4.
- Timing out (or pressing Pass) is a pass: your score goes up by 5 and the next player gets the same letter.
- Four passes in a row is a stalemate.

## Resuming

Every move is saved to `localStorage`. Reloading or closing the tab resumes the game. A human's clock keeps running while the page is closed, so a turn that expired counts as a pass. The computer's turn restarts after a reload.

## Run it

Open `index.html` through any static server (the dictionary is fetched, so `file://` won't load it):

    python3 -m http.server 8000

## Rebuild the dictionary

`words.txt` was exported from `bots/shiritori/data/dict.json`, keeping words that are 4 to 29 lowercase letters.
