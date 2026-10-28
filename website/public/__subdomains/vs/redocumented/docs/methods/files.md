# `files.*` — files

Documented upload/delete flow (improved with observed gotchas) plus two
undocumented methods (`files.edit`, `files.share`).

## Upload-without-a-channel flow (documented methods, working example)

1. `files.getUploadURLExternal` — params `filename`, `length` (byte count).
   Returns `{"ok": true, "file_id": "F...", "upload_url": "https://..."}`.
2. `POST` the raw file bytes directly to `upload_url` (not `slack.com/api` — a
   separate, short-lived signed upload endpoint). No Slack auth header needed
   for this step; the URL itself is the credential.
3. `files.completeUploadExternal` — params `files` (JSON array of
   `{"id": "F...", "title": "..."}`), and optionally `channel_id` if you want to
   post it immediately. Without a channel, this just finalizes the file object
   so it can be referenced by `file_ids` elsewhere (e.g. `drafts.create`).
- **Gotcha:** the same `file_id` can be attached to **multiple** drafts — files
  aren't consumed/exclusive.

## Hosting an image for a bot's `icon_url` (live-tested 2026-10-23, bot `xoxb`)

Goal: get a Slack-hosted image that `chat.postMessage`'s `icon_url` (or an
image block) can load, because Slack fetches those with no auth.

- **Uploading works with a bot token** (`files:write`). `files.getUploadURLExternal`
  returned `ok:true`; a `multipart/form-data` `POST` (field `file`) to
  `upload_url` returned HTTP 200; `files.completeUploadExternal` with just
  `files: [{id, title}]` returned `ok:true`. The file is then private to the
  uploader: `files.info` shows `channels: []`, `groups: []`, `ims: []`,
  `is_public: false`, `public_url_shared: false`.
- **`permalink_public` is present but dead until a public link exists.**
  `files.info` on that unshared file already returns a
  `https://slack-files.com/T…-F…-<secret>` value in `permalink_public`, but it
  returns HTTP 404 until a public link is actually created.
- **`files.sharedPublicURL` could not create the link from either token we
  have.** The bot `xoxb` got `not_allowed_token_type`. The workspace's
  configured user token got `missing_scope` (we did not capture the
  `needed`/`provided` fields, so which scope is missing is unconfirmed).
- **The web/desktop client's "Copy public link" does work** (tried by hand;
  the workspace allows public file links). It yields
  `https://slack-files.com/T…-F…-<10 hex chars>`. That URL serves an **HTML
  viewer page** (200, `text/html`), not the image. Its `og:image` meta tag
  points at the real bytes:
  `https://files.slack.com/files-pri/T…-F…/<name>?pub_secret=<the same 10 hex chars>`.
  That URL returns the raw PNG (200, `image/png`) with no auth, so it is the
  one to use as `icon_url`.
- **Without `pub_secret`, a `files-pri` URL is not fetchable.** The bare
  `https://files.slack.com/files-pri/T…-F…/<name>` answers `302` to the
  workspace login page (`https://<workspace>.slack.com/?redir=…`).
- **A bot cannot see a file a user uploaded and never shared with it:**
  `files.info` on such a file returned `file_not_found`.
- **Caveats:** the public link only lasts while the workspace allows public
  links and nobody revokes it, and an uploaded file counts as workspace
  storage. We ended up hosting the image on our own CDN instead.
- **Slack's own RSS app icon** is served from
  `https://a.slack-edge.com/80588/img/services/rss_<size>.png`: sizes 72, 96,
  128, 192, 512 and 1024 all returned 200; 256 returned 403 (live `curl`,
  2026-10-23). The `80588` segment is a build id and may change.

## `files.delete` (documented)

- Standard cleanup call, `file` param = file id. Used here for sandbox cleanup
  after test uploads. `{"ok": true}` on success.

## `files.edit`

- **Status:** UNDOCUMENTED.
- **Purpose (inferred):** edit an already-uploaded file's content and/or title
  in place, distinct from re-uploading. Likely powers the web client's "Edit
  this file" action on Slack Canvases/snippets.
- **Existence:** confirmed via oracle.
- **Live-tested:** no — mutating.
- **Provenance:** `slack-ruby/slack-api-ref`,
  `methods/_undocumented/files/files.edit.json`; also listed independently in
  `ErikKalkoken/slackApiDoc`.
- **Params (cross-referenced from `ErikKalkoken/slackApiDoc`, not independently
  verified here):** `token` (required), `file` (required, file ID), `title`
  (required, new title), `filetype` (optional, new filetype). Response is a
  full updated file object.

## `files.share`

- **Status:** UNDOCUMENTED.
- **Purpose (inferred):** share an already-uploaded (unshared) file into one or
  more channels — the step that used to be separate from upload in Slack's
  older (pre-`getUploadURLExternal`) file API, and still appears to exist as an
  internal call.
- **Existence:** confirmed via oracle.
- **Live-tested:** no — mutating (posts into a channel).
- **Provenance:** `slack-ruby/slack-api-ref`,
  `methods/_undocumented/files/files.share.json`; also in
  `ErikKalkoken/slackApiDoc`.
- **Params (cross-referenced from `ErikKalkoken/slackApiDoc`, not independently
  verified here):** `token` (required, legacy token per their notes), `file`
  (required, file ID), `channel` (required — works with both public channel
  IDs and private-channel/group IDs).
