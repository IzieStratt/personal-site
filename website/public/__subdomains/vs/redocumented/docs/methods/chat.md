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

## `chat.postMessage` as an RSS-style bot: identity, newer blocks, threads (documented method)

Observed 2026-10-28 on the Hack Club workspace with a bot `xoxb` that has
`chat:write`, `chat:write.customize` and `files:write`. Everything below was
called for real unless marked otherwise.

- **Custom name and icon.** `username` and `icon_url` were accepted on the
  same call as `blocks`, and again on a **thread reply** (`thread_ts` set), so a
  reply can look like it came from the same persona. We did not test a bot
  without `chat:write.customize`, so what happens without it is unconfirmed.
- **Newer blocks post fine as a bot.** A message with a `section` (button
  `accessory`) and a `context` block, then a thread reply with a
  `data_visualization` block (a `bar` chart with a negative series, and a
  `line` chart), a `table` block and a `section`, all returned `ok:true`.
  `conversations.replies` then listed the reply's blocks as
  `['data_visualization', 'table', 'section']`. We did not check how they
  render. Per the docs a message may hold at most 2 `data_visualization`
  blocks, and `alert` blocks are modal-only (docs, not tested).
- **`table` + `column_settings`.** The docs say to use `null` for a column
  that should keep the defaults. `blocks.validate` rejects that:
  `invalid_blocks`, `{"code":"invalid_type","message":"must provide an object","pointer":"/1/column_settings/0"}`.
  An explicit object per column (`{"align": "left"}`, `{"align": "right"}`)
  passed. A table cell used here was `{"type":"raw_text","text":"…"}`.
- **Top-level `text` is still the notification fallback** when `blocks` are
  present; send a short plain summary there.
- **Escape feed text.** `&`, `<` and `>` in text you did not write must be
  escaped (`&amp;`, `&lt;`, `&gt;`) or `<!channel>` / `<@U…>` in it will
  notify people.
- **Attachments with mrkdwn.** For legacy `attachments`, `text` is only parsed
  as mrkdwn if the attachment lists it in `mrkdwn_in` (`["text"]`); the
  `<url|label>` link syntax, `*bold*` and bullets then render.

### `blocks.validate` (documented method)

- **It needs no token.** Called with no `Authorization` header, it returned
  `{"ok": true}` for valid blocks and the `invalid_blocks` shape above for
  invalid ones (live, 2026-10-28). It also works with a bot token.
- **Error shape.** `{"ok":false,"error":"invalid_blocks","errors":[{"code":…,"message":…,"pointer":"/1/column_settings/0"}]}`
  — `pointer` is a JSON pointer into the `blocks` array you sent.
- **Passes:** `section` with a `button` accessory, `context` with `mrkdwn`,
  `table`, and `data_visualization` (`bar` and `line`) validated `ok:true`.
- **Pass the array as `blocks=<json>`** (form-encoded). A whole message works
  as `message=`, a modal/home view as `view=`, per the docs.

### What Slack's own RSS app posts (source: a message event the site owner pasted, not an API call)

- `subtype: "bot_message"` with the feed item title as `text`, the feed's name
  as `username` (for example `xkcd.com`), `bot_id`, and an `edited` object stamped
  about 2 seconds after `ts` (presumably Slack adding the unfurl; not confirmed).
- `icons.image_36`, `image_48`, `image_72`: `https://a.slack-edge.com/…/img/services/rss_<size>.png`.
- One `attachments` entry per item: `title`, `title_link`, `from_url`,
  `original_url`, `fallback` (`"<feed>: <title>"`), `author_name`/`author_link`
  (the feed's site), `service_icon`, `text` (here the xkcd alt text),
  `image_url` with `image_width`/`image_height`/`image_bytes`, and
  `media_type: "external_link"`. The `blocks` are a single `rich_text` link to
  the item. That is the shape to copy for an RSS-like bot.
- **Where the native bot's fields come from** (inferred by putting a native post next to the item's feed XML on 2026-10-28; not tested by
  subscribing a feed): xkcd's item `description` is only
  `<img src="…" title="…" alt="…">`, and the native post's `image_url` is that `src` while its `text` is
  `[Title text] "<the img title>"`. So the bot reads the first `<img>` for the image and an image's `title` attribute for the text. For a feed
  whose `description` is a whole HTML document (sdmp.izie.top before 2026-10-28), the post's text was the tags stripped with nothing
  between list items (`…(6)+ ai.alpha.…`), so a plain-text `description` with its own separators reads far better, with the full markup
  in `content:encoded` for readers.
- **Legacy attachment fields accepted by `chat.postMessage`** (xoxb, live 2026-10-28, `ok:true`; rendering not inspected): `footer`,
  `footer_icon` (we passed a site's `.ico` favicon, which may not render, since the docs list image types), `ts` (shown beside the
  footer), `author_name`/`author_link`, `color`, `title_link`, `from_url`, `image_url`, and `mrkdwn_in: ["text"]`.
- **Slack's RSS app, per its help page** (docs, not tested by us; <https://slack.com/help/articles/218688467>): `/feed subscribe <address>`,
  `/feed list` (shows each feed's unique ID number), `/feed remove <ID>`, `/feed help`; feeds can also be managed across channels from the
  app's page in the Marketplace. It keeps a bookmark with the date of the last item and only posts items dated later, so an item that
  arrives with an older date is never posted. Everyone except guests can use it. RSS and Atom only.
- **Guests in the API** (docs): `users.info` returns `is_restricted` (multi-channel guest) and `is_ultra_restricted` (single-channel guest) on the
  `user` object; either being true is how you recognise a guest. We use that to keep guests out of a feed command.
- **`footer` text is linkified.** A bare domain sent as `footer` (`xkcd.com`) came back from `conversations.history` as
  `<http://xkcd.com|xkcd.com>` (live, 2026-10-28), so Slack auto-links it. Sent `ts` came back unchanged as the attachment's `ts`.
- **`conversations.history` shows custom-identity posts with a `username`** (the persona name) alongside the bot's `bot_id`; the text and
  attachments are returned as sent.
- **`blocks` and `attachments` in one `chat.postMessage`** (xoxb, live 2026-10-28): both are accepted, and `blocks` render above the
  attachment card. Passing `blocks` means Slack no longer adds its own `rich_text` block for `text`; `text` is then only the notification
  fallback. A `section` with a `button` accessory that has a `url` and an `action_id` passed `blocks.validate` and posted. Use it to
  keep a call to action (a podcast's Listen button) from being cut off under a long attachment `text`.
- **Where a button ends up** (observed 2026-10-28 in the site owner's client): a `section` block's `accessory` button is drawn on the **right** of
  its text, and blocks are drawn **above** a message's `attachments`, so a button put in `blocks` next to an attachment card sits at the
  very top of the message. Buttons in an `actions` block are drawn at the **left**, under the content above them. To get a card with the
  button at the bottom left, build the whole card from blocks and drop the attachment.
- **The `container` block works in a bot message** (xoxb, live 2026-10-28; `blocks.validate` `ok:true`, `chat.postMessage` ok, and
  `conversations.history` returns it as `blocks[0].type == "container"`): `title` (plain_text, 150), `subtitle` (we sent `mrkdwn`, including a
  `<!date^…|fallback>` token), `width: "wide"`, an `icon` image, and `child_blocks` of `section`, `image`, `context` and `actions` were all
  accepted. This is the block `ingoau/huddlefm` builds its player message from (`src/coordinator.ts`). Not tested: the `card` block (docs: up
  to 3 buttons, `danger` left, `primary`/default right) and `carousel`. An icon URL ending in `.ico` is a poor bet; stick to png/jpg/gif.
- **Link buttons still send a click to the app.** A button with `url` opens the link in the client, but Slack also delivers a
  `block_actions` payload for it, so the app should acknowledge it. Give the button a fixed `action_id` and register one no-op handler; with a
  Bolt app and no handler the click is "unhandled" (the app returns a 404). We did not test how the client shows an unacknowledged click.
- **Reading custom-identity posts back.** `conversations.history` returned each message's own `username` correctly with both a bot and a
  user token (live, 2026-10-28). A reader that labels messages by `bot_id` can show them all under one name: the Slack MCP channel reader we
  tried named every message from our bot after the oldest custom `username` in the page it read (6 messages -> the first name; the newest 3 ->
  the oldest of those 3). The site owner's own Slack client showed the correct names, so this is the reader, not what Slack stores. Don't
  trust a bot_id-keyed name when checking what a persona posted; read `username` per message.
- **A pasted bare domain** (`blog.izie.top/feed.xml`) arrives with `text` as the
  bare text and a `rich_text` `link` element whose `url` is the full
  `https://…` and `truncated: true` (message event, pasted by the site owner).
