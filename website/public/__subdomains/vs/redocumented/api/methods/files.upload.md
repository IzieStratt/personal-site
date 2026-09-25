# files.upload

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/files.upload

Uploads or creates a file.

## Params

| name | required | type | description |
|---|---|---|---|
| `channels` | no | string | Comma-separated list of channel names or IDs where the file will be shared. |
| `content` | no | string | File contents via a POST variable. If omitting this parameter, you must provide a file. |
| `file` | no | file | File contents via multipart/form-data. If omitting this parameter, you must submit content. |
| `filename` | no | string | Filename of file. |
| `filetype` | no | string | A file type identifier. |
| `initial_comment` | no | string | The message text introducing the file in specified channels. |
| `thread_ts` | no | string | Provide another message's ts value to upload this file as a reply. Never use a reply's ts value; use its parent instead. |
| `title` | no | string | Title of file. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "file": {
        "id": "F0TD00400",
        "created": 1532293501,
        "timestamp": 1532293501,
        "name": "dramacat.gif",
        "title": "dramacat",
        "mimetype": "image/jpeg",
        "filetype": "gif",
        "pretty_type": "JPEG",
        "user": "U0L4B9NSU",
        "editable": false,
        "size": 43518,
        "mode": "hosted",
        "is_external": false,
        "external_type": "",
        "is_public": false,
        "public_url_shared": false,
        "display_as_bot": false,
        "username": "",
        "url_private": "https://.../dramacat.gif",
        "url_private_download": "https://.../dramacat.gif",
        "thumb_64": "https://.../dramacat_64.gif",
        "thumb_80": "https://.../dramacat_80.gif",
        "thumb_360": "https://.../dramacat_360.gif",
        "thumb_360_w": 360,
        "thumb_360_h": 250,
        "thumb_480": "https://.../dramacat_480.gif",
        "thumb_480_w": 480,
        "thumb_480_h": 334,
        "thumb_160": "https://.../dramacat_160.gif",
        "image_exif_rotation": 1,
        "original_w": 526,
        "original_h": 366,
        "permalink": "https://.../dramacat.gif",
        "permalink_public": "https://.../More-Path-Components",
        "comments_count": 0,
        "is_starred": false,
        "shares": {
            "private": {
                "D0L4B9P0Q": [
                    {
                        "reply_users": [],
                        "reply_users_count": 0,
                        "reply_count": 0,
                        "ts": "1532293503.000001"
                    }
                ]
            }
        },
        "channels": [],
        "groups": [],
        "ims": [
            "D0L4B9P0Q"
        ],
        "has_rich_preview": false
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/files.upload.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
