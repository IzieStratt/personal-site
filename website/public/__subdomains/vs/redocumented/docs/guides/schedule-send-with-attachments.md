# Guide: schedule a Slack message with attachments using session tokens

This is the working pattern for scheduling a message (with an image/file
attached) on this workspace using browser session tokens (xoxc/xoxd), bypassing
`chat.scheduleMessage` (which returns `not_allowed_token_type` for session
tokens here — see `../methods/chat.md`). It uses the same undocumented
`drafts.*` mechanism the Slack web client itself uses for "Schedule for later."

All IDs below are placeholders — substitute real ones. Never commit real
tokens/cookies/IDs to a file.

```python
import json
import time
import uuid
import requests
from urllib.parse import quote

TEAM_XOXC = "xoxc-REDACTED"          # or ENTERPRISE_XOXC -- drafts.create accepts either
XOXD = "xoxd-REDACTED"               # cookie value, "d="
DEST_CHANNEL_ID = "D0XXXXXXX"        # a channel/DM id -- NOT a user id (U...) or you get invalid_channel

HEADERS = {
    "Authorization": f"Bearer {TEAM_XOXC}",
    "Cookie": f"d={quote(XOXD, safe='')}",
}


def slack_call(method, data):
    r = requests.post(f"https://slack.com/api/{method}", headers=HEADERS, data=data, timeout=30)
    j = r.json()
    if not j.get("ok"):
        raise RuntimeError(f"{method}: {j.get('error')}")
    return j


# 1. Upload the file (three-step external-upload flow)
def upload_file(path, title):
    import os
    length = os.path.getsize(path)
    filename = os.path.basename(path)
    j = slack_call("files.getUploadURLExternal", {"filename": filename, "length": length})
    file_id, upload_url = j["file_id"], j["upload_url"]
    with open(path, "rb") as f:
        requests.post(upload_url, files={"file": f}, timeout=60).raise_for_status()
    slack_call("files.completeUploadExternal", {
        "files": json.dumps([{"id": file_id, "title": title}]),
    })
    return file_id


# 2. Build the draft
def schedule_message(text, file_ids, send_at_unix_ts):
    blocks = [{
        "type": "rich_text",
        "elements": [{"type": "rich_text_section", "elements": [{"type": "text", "text": text}]}],
    }]
    data = {
        "blocks": json.dumps(blocks),
        "destinations": json.dumps([{"channel_id": DEST_CHANNEL_ID}]),
        "date_scheduled": str(int(send_at_unix_ts)),
        "client_msg_id": str(uuid.uuid4()),
        "is_from_composer": "true",   # MUST be literal true, or invalid_arguments /
                                       # scheduled_draft_cannot_be_attached if file_ids is set too
    }
    if file_ids:
        data["file_ids"] = json.dumps(file_ids)
    return slack_call("drafts.create", data)["draft"]


if __name__ == "__main__":
    fid = upload_file("photo.jpg", "photo.jpg")
    send_at = time.time() + 3 * 24 * 3600  # 3 days out
    draft = schedule_message("scheduled via drafts.create", [fid], send_at)
    print("scheduled draft id:", draft["id"])
```

## Cleanup / editing later

- Listing: `drafts.list` — **enterprise xoxc/xoxd only**, even though `create`
  above can use either.
- Deleting: `drafts.delete` with `draft_id` and a **current** timestamp in
  `client_last_updated_ts` (not the draft's stored `last_updated_ts` — that
  gives `draft_has_conflict`):

```python
ENTERPRISE_HEADERS = {
    "Authorization": f"Bearer {ENTERPRISE_XOXC}",
    "Cookie": f"d={quote(XOXD, safe='')}",
}

def delete_draft(draft_id):
    requests.post(
        "https://slack.com/api/drafts.delete",
        headers=ENTERPRISE_HEADERS,
        data={"draft_id": draft_id, "client_last_updated_ts": f"{time.time():.6f}"},
        timeout=30,
    ).json()
```

## Gotchas recap

- `destinations` needs a channel/DM id (`C…`/`D…`/`G…`), not a user id. Resolve
  a user id to a DM id first with `conversations.open(users=U...)`.
- `is_from_composer` must be `true`; `file_ids` + `is_from_composer:false` is
  explicitly rejected.
- `drafts.create` works with team OR enterprise xoxc; `drafts.list`/`update`/
  `delete` need the **enterprise** xoxc specifically (team xoxc ->
  `team_is_restricted`).
- The same uploaded `file_id` can be attached to multiple drafts.
