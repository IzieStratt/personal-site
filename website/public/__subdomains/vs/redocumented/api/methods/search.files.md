# search.files

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/search.files

Searches for files matching a query.

## Params

| name | required | type | description |
|---|---|---|---|
| `highlight` | no | boolean | Pass a value of true to enable query highlight markers (see below). |
| `query` | yes | string | Search query. |
| `sort` | no | string | Return matches sorted by either score or timestamp. |
| `sort_dir` | no | enum | Change sort direction to ascending (asc) or descending (desc). |
| `team_id` | no | string | encoded team id to search in, required if org token is used. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "files": {
        "matches": [
            {
                "channels": [],
                "comments_count": 1,
                "created": 1507850315,
                "deanimate_gif": "https://files.slack.com/files-tmb/T2U81E2BB-F7H0D7ZBB-21624821e6/computer_deanimate_gif.png",
                "display_as_bot": false,
                "editable": false,
                "external_type": "",
                "filetype": "gif",
                "groups": [],
                "id": "F7H0D7ZBB",
                "image_exif_rotation": 1,
                "ims": [],
                "is_external": false,
                "is_public": true,
                "mimetype": "image/gif",
                "mode": "hosted",
                "name": "computer.gif",
                "original_h": 313,
                "original_w": 500,
                "permalink": "https://eventsdemo.slack.com/files/U2U85N1RZ/F7H0D7ZBB/computer.gif",
                "permalink_public": "https://slack-files.com/T2U81E2BB-F7H0D7ZBB-85b7f5557e",
                "pretty_type": "GIF",
                "preview": null,
                "public_url_shared": false,
                "reactions": [
                    {
                        "count": 1,
                        "name": "stuck_out_tongue_winking_eye",
                        "users": [
                            "U2U85N1RZ"
                        ]
                    }
                ],
                "score": "0.38899223746309",
                "size": 1639034,
                "thumb_160": "https://files.slack.com/files-tmb/T2U81E2BB-F7H0D7ZBB-21624821e6/computer_160.png",
                "thumb_360": "https://files.slack.com/files-tmb/T2U81E2BB-F7H0D7ZBB-21624821e6/computer_360.png",
                "thumb_360_gif": "https://files.slack.com/files-tmb/T2U81E2BB-F7H0D7ZBB-21624821e6/computer_360.gif",
                "thumb_360_h": 225,
                "thumb_360_w": 360,
                "thumb_480": "https://files.slack.com/files-tmb/T2U81E2BB-F7H0D7ZBB-21624821e6/computer_480.png",
                "thumb_480_gif": "https://files.slack.com/files-tmb/T2U81E2BB-F7H0D7ZBB-21624821e6/computer_480.gif",
                "thumb_480_h": 300,
                "thumb_480_w": 480,
                "thumb_64": "https://files.slack.com/files-tmb/T2U81E2BB-F7H0D7ZBB-21624821e6/computer_64.png",
                "thumb_80": "https://files.slack.com/files-tmb/T2U81E2BB-F7H0D7ZBB-21624821e6/computer_80.png",
                "timestamp": 1507850315,
                "title": "computer.gif",
                "top_file": false,
                "url_private": "https://files.slack.com/files-pri/T2U81E2BB-F7H0D7ZBB/computer.gif",
                "url_private_download": "https://files.slack.com/files-pri/T2U81E2BB-F7H0D7ZBB/download/computer.gif",
                "user": "U2U85N1RZ",
                "username": ""
            }
        ],
        "pagination": {
            "first": 1,
            "last": 3,
            "page": 1,
            "page_count": 1,
            "per_page": 20,
            "total_count": 3
        },
        "paging": {
            "count": 20,
            "page": 1,
            "pages": 1,
            "total": 3
        },
        "total": 3
    },
    "ok": true,
    "query": "computer.gif"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/search.files.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
