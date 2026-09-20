# `conversations.*` — conversations

Documented `conversations.*` methods (`list`, `info`, `history`, `members`,
`replies`, `open`, etc.) are unchanged from official docs, with one gotcha
worth recording:

- `conversations.open` with `users=U...` returns a `D...` channel id for the
  1:1 DM — used throughout this project to resolve a user id into something
  `drafts.create`'s `destinations` param will accept (which rejects raw `U...`
  ids with `invalid_channel`).

This file also covers three undocumented additions.

## `conversations.view`

- **Status:** UNDOCUMENTED.
- **Purpose (inferred from name):** likely marks a conversation as
  "viewed"/opened in the client — analogous to (but possibly distinct from) the
  documented `conversations.mark` read-cursor call.
- **Existence:** confirmed via oracle.
- **Live-tested:** **deliberately no.** Its name strongly suggests a
  view/read-state side effect (marking something read/opened is exactly the
  kind of thing the safety rules call out — "never mark anything read"), so
  even though it might resolve to a GET-shaped info call, we couldn't rule that
  out from the name alone and skipped it.
- **Provenance:** reverse-engineering gist, "Conversations & Channels" section.

## `conversations.listPrefs`

- **Status:** UNDOCUMENTED.
- **Purpose (inferred):** list per-conversation client preferences (mute state,
  notification overrides, etc.) — plural/list counterpart to a per-conversation
  prefs object.
- **Existence:** confirmed via oracle.
- **Live-tested:** no (time/scope — plausibly read-only but not confirmed).
- **Provenance:** reverse-engineering gist.

## `conversations.bulkReacjiTriggers`

- **Status:** UNDOCUMENTED.
- **Purpose (inferred):** bulk-fetch of "reacji" (automatic emoji-reaction)
  trigger configuration across conversations — config for the feature where
  certain message patterns auto-react.
- **Existence:** confirmed via oracle.
- **Live-tested:** no.
- **Provenance:** reverse-engineering gist.
