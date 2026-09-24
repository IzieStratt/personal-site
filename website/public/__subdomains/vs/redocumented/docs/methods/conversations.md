# `conversations.*` — conversations

Documented `conversations.*` methods (`list`, `info`, `history`, `members`,
`replies`, `open`, etc.) are unchanged from official docs, with one gotcha
worth recording:

- `conversations.open` with `users=U...` returns a `D...` channel id for the
  1:1 DM — used throughout this project to resolve a user id into something
  `drafts.create`'s `destinations` param will accept (which rejects raw `U...`
  ids with `invalid_channel`).

### Proving who posted a message (a bot reading its own DMs)

These are documented behaviours, but the combination is easy to get wrong. The
HMojis server uses it to verify a Slack account: the user's own client posts a
one-time code in a DM with a bot, and the server reads it back with the bot's
token.

- **Author.** `conversations.history` on an IM the bot is part of returns
  each message's author in the message's own `user` field. That is Slack's
  attestation, not something the poster can forge.
- **Bot scopes.** The bot needs `im:history` and `im:read`.
- **Ruling out the bot's own posts.** Messages the bot posted carry
  `bot_id`, `subtype: "bot_message"`, or both.
- **Who the DM is with.** `conversations.info` on the IM (as the bot) returns
  `is_im: true` and `user` set to the other party. Cross-check that against
  the author.
- **Other people's DMs are invisible.** A DM between two other users isn't
  readable by the bot: `conversations.info` and `conversations.history`
  return `channel_not_found`. A client can't point the reader at a DM it
  doesn't share with the bot.
- **Users DMing the bot.** For the user to message the bot at all, the app's
  App Home needs `messages_tab_enabled: true` and
  `messages_tab_read_only_enabled: false`.
- **Verified:** relied on by the HMojis verifier in production since
  2026-09-24, and covered by tests against a Slack mock. Not independently
  probed by this project's `probe.py`.

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
