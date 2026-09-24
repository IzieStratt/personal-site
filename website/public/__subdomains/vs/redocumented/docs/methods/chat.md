# `chat.*` — messages

Mix of officially documented methods (improved here with observed quirks) and
one undocumented method (`chat.command`).

## `chat.scheduleMessage` (documented)

- **Docs:** https://docs.slack.dev/reference/methods/chat.scheduleMessage
- **Observed quirk not obvious from the docs:** on this workspace (Hack Club,
  Enterprise Grid), calling this with a session token — **either** the team xoxc
  or the enterprise xoxc, on **either** `slack.com` or `hackclub.slack.com` —
  always returns `{"ok": false, "error": "not_allowed_token_type"}`. This is a
  hard token-class gate, not a scope/permission issue: no xoxc/xoxd combination
  gets through it. The web client itself does not use this method for its
  "Schedule for later" UI — it uses the undocumented `drafts.create` instead
  (see `drafts.md`). If you have a real xoxb/xoxp app token with
  `chat:write` scope, that's the supported path for this method; we did not
  test that here (out of scope — this project only had session tokens for chat
  scheduling work).
- **Live-verified this session:** the `not_allowed_token_type` rejection, both
  token scopes, both hosts. Not verified: successful use with xoxb/xoxp (no
  such call was made against this method).

## `chat.scheduledMessages.list` (documented)

- **Docs:** https://docs.slack.dev/reference/methods/chat.scheduledMessages.list
- **Same quirk:** `not_allowed_token_type` for both xoxc token scopes, both
  hosts. Use `drafts.list` (enterprise xoxc only) instead to see what the web
  client itself considers "scheduled" on this workspace.

## `chat.command`

- **Status:** UNDOCUMENTED.
- **Purpose (inferred from name + source):** runs a slash command server-side,
  as if it had been typed into the message composer and submitted — i.e. the
  server-side counterpart to typing `/remind ...` and hitting enter, rather than
  the outbound webhook mechanism apps register for (`commands.list` /
  `POST /interactive-endpoint`-style command dispatch is documented; this is the
  reverse, client-invoking direction).
- **Existence:** confirmed via oracle (`invalid_auth` for a garbage token, not
  `unknown_method`).
- **Live-tested:** **no.** Running an arbitrary slash command is inherently
  state-changing (many slash commands post messages, some do much more) — this
  is explicitly excluded from live-testing under the hard safety rules. Do not
  call this against real tokens without first confirming exactly which command
  string you're passing and that its effect is something you want.
- **Token type:** unknown/not tested.
- **Provenance:** `slack-ruby/slack-api-ref`,
  `methods/_undocumented/chat/chat.command.json`.
- **Params (cross-referenced from `ErikKalkoken/slackApiDoc`, not independently
  verified here):** `token` (required — their notes say the `post` scope isn't
  available through normal OAuth app config, so a legacy token is needed),
  `channel` (required, public channel ID to run the command in), `command`
  (required, e.g. `/who`, leading slash required), `text` (optional, args to
  the command). Response: `{"ok": true, "response": "..."}` for commands that
  answer inline (e.g. `/who`); most slash commands instead just post their
  output into the channel and `response` is absent.

## `chat.postMessage` with Block Kit: review-card gotchas (documented method)

- **Docs:** https://docs.slack.dev/reference/methods/chat.postMessage
- **What it's from:** the HMojis submission review cards, which a bot posts
  into a review channel with approve and decline buttons. Observed on the
  Hack Club workspace on 2026-09-23 and 2026-09-24.
- **`action_id` must be unique within a message.** Four buttons sharing one
  `action_id` (with the verb carried in `value`) make Slack reject the
  entire message. Give each button its own id, for example
  `hm_review:yes` and `hm_review:no`.
- **Image blocks only render PNG, JPEG and GIF.** For other types (WebP was
  the case hit), post a section with a link instead, or convert the image
  first.
- **Linking an image you also show makes Slack show it twice.** The card's
  text linked the same URL the image block used, and Slack unfurled that
  link as a second copy. Two fixes, both now used:
  - keep the URL out of the text
  - pass `unfurl_links=false` and `unfurl_media=false`
- **Image URLs are fetched with no auth headers.** An `image_url` has to be
  reachable without an `Authorization` header, so a private image needs a
  capability in the URL instead: a random, per-image `?cap=` value written
  only into the card and checked by the server.
- **Posting to a user id as the bot.** `chat.postMessage` with
  `channel=U…` (bot token, `chat:write`) delivers to the bot's DM with that
  user, with no `conversations.open` step needed.

