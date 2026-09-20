# `search.*` — search

Documented `search.messages`/`search.all`/`search.files` are unchanged from
official docs. This file covers the undocumented `search.*` family that
powers the modern in-app search UI (search-as-you-type, modular result panes,
autocomplete, saved searches).

## `search.modules.messages`

- **Status:** UNDOCUMENTED. **Live-verified (existence + param requirement).**
- **Purpose:** modular message search — the backend for the current search UI's
  "Messages" results pane, as distinct from the older unified `search.messages`.
- **Token:** **enterprise xoxc/xoxd only** — team xoxc gives `team_is_restricted`.
- **Params:** at minimum a query string; called with none (enterprise xoxc) ->
  `invalid_arguments`. Exact param name (`query`? `q`?) not confirmed — didn't
  want to guess-and-check against a search backend repeatedly.
- **Provenance:** reverse-engineering gist (sshh12), "Search" section.

## `search.modules.files` / `search.modules.channels` / `search.modules.people` / `search.modules.dms`

- **Status:** UNDOCUMENTED. **Existence confirmed via oracle only** — not
  live-called (same reasoning as `search.modules.messages`: needs a real query
  and we didn't want to iterate blindly against several search backends).
- **Purpose:** the modular-search siblings of `search.modules.messages`, one
  per result-pane type in the current search UI.
- **Token:** presumed enterprise xoxc/xoxd by analogy with `search.modules.messages`
  (not independently confirmed for each).
- **Provenance:** same reverse-engineering gist.

## `search.inline`

- **Status:** UNDOCUMENTED. **Existence confirmed via oracle.**
- **Purpose:** inline/as-you-type search suggestions (e.g. the dropdown while
  typing in the top search box before you hit enter).
- **Not live-tested** beyond existence.
- **Provenance:** reverse-engineering gist.

## `search.autocomplete` / `search.autocomplete.topEmojis` / `search.autocomplete.files`

- **Status:** UNDOCUMENTED. **Existence confirmed via oracle.**
- **Purpose:** autocomplete backends for the general search box, the emoji
  picker's "top emojis" ranking, and file-search autocomplete respectively.
- **Not live-tested** beyond existence — autocomplete endpoints generally
  qualify as read-only by function, but weren't called live this pass simply
  for time/scope reasons (each likely needs a partial-query param to return
  anything meaningful).
- **Provenance:** reverse-engineering gist.

## `search.save`

- **Status:** UNDOCUMENTED. **Existence confirmed via oracle.**
- **Purpose:** save a search query (recent/pinned searches feature).
- **Live-tested:** **no** — writes a record ("save"), treated as mutating.
- **Provenance:** reverse-engineering gist.

## `search.precache`

- **Status:** UNDOCUMENTED. **Existence confirmed via oracle.**
- **Purpose:** pre-warm search result caches (perf optimization call the client
  fires speculatively, e.g. on hover/focus of the search box).
- **Not live-tested** — ambiguous whether it has server-side write effects
  (cache population); treated cautiously as not clearly read-only for this pass.
- **Provenance:** reverse-engineering gist.
