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
