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

## Leaving a channel (live-tested 2026-09-28)

All of this was exercised with ordinary **browser-session accounts** (xoxc + `d=`
cookie, no admin/manager rights, no app) driving `conversations.leave` across 51
separate accounts on this workspace, plus the undocumented
`conversations.bulkLeave`. Method: leave a public channel the accounts were
members of, then re-read membership with `users.conversations` and
`conversations.info` to confirm.

### `conversations.leave` — live-verified

Previously `docs-only`. Now confirmed end-to-end: **51 of 51 accounts left a
public channel they were in, 0 failures**, each with its own token.

- **Self-leave needs no special rights.** No `channels:manage`, no
  channel-manager, no admin. This is the practical difference from
  `conversations.kick` below, and it's why "get a bot out of a channel it was
  temporarily invited to" doesn't need an inviter account at all.
- **`cant_leave_general`** on this workspace's one `is_general: true` channel
  (`C0266FRGT`), for every account and on both hosts. This is a hard server-side
  rule, not a permissions problem.
- **`not_in_channel`** when the account was never a member — the normal result
  for a bulk sweep across accounts that weren't all in the target.
- **`channel_not_found`** for a *private* channel the caller isn't in. A private
  channel is invisible to non-members, so a self-leave is impossible precisely
  when someone might most want it; the account can only be removed by somebody
  who can already see the channel.
- **`invalid_arguments`** if you pass a channel *name* (`announcements`) instead
  of an id. Ids only.

### `conversations.bulkLeave` — UNDOCUMENTED, live-verified, and a trap

`params` here were previously "generated TS types, cross-referenced not
independently verified" and `verified` was `existence-only`. Both are now
settled by live calls.

- **Status:** UNDOCUMENTED (`3kh0/slack-datamine` build 132396).
- **Purpose:** the client's bulk "leave channels" flow. Leaves the calling
  account from the conversation(s) named in `channels`.
- **`channels` takes a plain channel id string** — `channels=C…`. Verified: this
  form actually left `#lounge` (membership dropped on re-read; rejoined
  afterwards to restore the original state).
- **A JSON-array encoding silently does nothing.** `channels=["C…"]` returns
  `ok: true` and the account is *still* a member. Since the generated type only
  said "string", the obvious "it's a list, so send a list" reading is a silent
  no-op — worth knowing before trusting a bulk call's success.
- **It lies about #general.** On `C0266FRGT` it returned `ok: true` with **no
  effect**: confirmed by four `users.conversations` reads over ~8s and by
  `conversations.info` still reporting `is_member: true`, while
  `conversations.leave` on the same target errors `cant_leave_general`. So the
  #general block is enforced on both code paths — `bulkLeave` just fails
  quietly instead of loudly. **Do not use `bulkLeave`'s `ok` as evidence a leave
  happened**; re-read membership instead.
- **Tokens:** works with the **enterprise** xoxc on both `hackclub.slack.com`
  and `hackclub.enterprise.slack.com`; the **team** xoxc returns
  `team_is_restricted`. (Fits the team-vs-org split in `../auth-and-tokens.md`.)
- **Not established:** the multi-id form (whether `channels` accepts a
  comma-separated list) was never tested — only the single-id case. A repeated
  `channels` param returned `channel_not_found`, but that call was confounded
  (the account had already left by then, and that error is what a not-a-member
  leave returns), so it proves nothing either way.

### `conversations.kick` — live-verified negative

Kicking **yourself** (`channel` + your own `user` id) returns
**`restricted_action`** on a non-admin account. There is no self-kick shortcut
around `conversations.leave`, and no admin token was available in this pass
(`not_an_admin`/`restricted_action` across the board, see
`methods/admin-write-scope-2026-09.md`). Use self-leave.

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
