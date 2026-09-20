# `drafts.*` — scheduled/unsent message drafts

**UNDOCUMENTED.** Not in the official method list. This is the Slack web
client's actual mechanism for "schedule a message" and "save as draft" — it
supersedes the older, still-technically-documented `chat.scheduleMessage` for
session-token users on this workspace (see `chat.md` for why that path is
blocked here).

All four confirmed to exist via the oracle. `create`/`list`/`delete` were
exercised live this session (list read-only; create+delete only inside the
self-DM sandbox, immediately cleaned up). `update` was confirmed to exist but
never called for real (editing a draft is a mutation with no clear read-only
subset, so it's out of scope for live-testing per the safety rules — documented
from the same field names `create`/`delete` use).

## `drafts.create`

- **Status:** undocumented. **Live-verified** (sandbox: self-DM `D09KUP5M2N7`,
  ≥30 days out, cleaned up after).
- **Token:** works with **either** the team xoxc or the enterprise xoxc (the one
  exception among the `drafts.*` family — see `auth-and-tokens.md`).
- **Endpoint:** `POST https://slack.com/api/drafts.create`, form-encoded.
- **Params:**
  - `blocks` (string, **JSON-encoded** array of Slack Block Kit blocks — a
    `rich_text` block is what the real composer sends for plain text).
  - `file_ids` (string, JSON-encoded array of file ID strings, e.g.
    `["F0XXXXXXX"]`) — optional, attach previously-uploaded files
    (`files.completeUploadExternal`).
  - `destinations` (string, JSON-encoded array of `{"channel_id": "..."}`
    objects). **Must be a channel/DM id (`C...`/`D...`/`G...`), not a user id**
    — passing a `U...` id gives `invalid_channel`. To DM someone, resolve their
    user id to a DM channel id first with `conversations.open`.
  - `date_scheduled` (string/int, unix timestamp — when the draft should send).
  - `client_msg_id` (string, a fresh UUID — client-generated idempotency/id key).
  - `is_from_composer` (**must be the literal `true`**). If omitted/false:
    `invalid_arguments`. If `false` and `file_ids` is also set:
    `scheduled_draft_cannot_be_attached`. The client always sends `true`; there
    doesn't appear to be a supported way to create a draft with
    `is_from_composer:false` that also carries file attachments.
- **Response:** `{"ok": true, "draft": {"id": "...", "date_scheduled": ...,
  "file_ids": [...], "destinations": [...], "last_updated_ts": "...", ...}}`.
- **Gotchas:**
  - `file_ids` can be attached to more than one draft at once (files aren't
    consumed/exclusive to a single draft).
  - `date_scheduled` in the past or too soon may be accepted by `create` but
    rejected at send time by Slack's scheduler — not tested (would require
    waiting for a real send).
- **Provenance:** prior hands-on session work with this account (see `sneply.py`
  in the sibling project), re-confirmed live this session.

```python
import json, time, uuid, requests
from urllib.parse import quote

headers = {
    "Authorization": f"Bearer {xoxc}",              # team OR enterprise xoxc both work here
    "Cookie": f"d={quote(xoxd, safe='')}",
}
blocks = [{"type": "rich_text", "elements": [
    {"type": "rich_text_section", "elements": [{"type": "text", "text": "hello, scheduled"}]}
]}]
data = {
    "blocks": json.dumps(blocks),
    "destinations": json.dumps([{"channel_id": "D0XXXXXXX"}]),  # self-DM or another channel/DM id
    "date_scheduled": str(int(time.time()) + 40 * 24 * 3600),   # >=30 days out for sandbox testing
    "client_msg_id": str(uuid.uuid4()),
    "is_from_composer": "true",
}
r = requests.post("https://slack.com/api/drafts.create", headers=headers, data=data)
```

## `drafts.list`

- **Status:** undocumented. **Live-verified.**
- **Token:** **enterprise xoxc/xoxd only** — team xoxc gives `team_is_restricted`.
- **Params:** none required for a basic listing (may support pagination
  cursors like other `*.list` methods — not explored further).
- **Response:** array of draft objects (same shape as the `draft` object
  returned by `drafts.create`).
- **Gotcha:** this returns the user's **real** drafts — read metadata only when
  actually needed, never dump/persist it, and never modify anything it shows
  that you didn't create yourself.

## `drafts.delete`

- **Status:** undocumented. **Live-verified** (sandbox cleanup only).
- **Token:** enterprise xoxc/xoxd only.
- **Params:**
  - `draft_id` (string).
  - `client_last_updated_ts` — **must be a current timestamp** (e.g.
    `f"{time.time():.6f}"` at call time), **not** the draft's own
    `last_updated_ts` from the `create`/`list` response. Passing the draft's own
    stored timestamp gives `draft_has_conflict` (Slack appears to use this as an
    optimistic-concurrency check: "the timestamp you're deleting as-of must be
    now, not whenever you last read the draft").
- **Response:** `{"ok": true}`.

## `drafts.update`

- **Status:** undocumented. **Not live-tested** (editing an existing draft is a
  pure mutation with no read-only subset — out of scope per safety rules beyond
  confirming it exists).
- **Token:** presumed enterprise xoxc/xoxd only, consistent with `list`/`delete`
  (not independently confirmed).
- **Params (inferred, not confirmed):** likely `draft_id` +
  `client_last_updated_ts` (same conflict-check pattern as `delete`) + whichever
  of `blocks`/`file_ids`/`destinations`/`date_scheduled` are being changed.
- **Provenance:** existence confirmed via oracle only this session; field-shape
  guess is by analogy to `create`/`delete`, not observed.
