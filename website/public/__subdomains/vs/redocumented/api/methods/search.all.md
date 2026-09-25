# search.all

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/search.all

Searches for messages and files matching a query.

## Params

| name | required | type | description |
|---|---|---|---|
| `highlight` | no | boolean | Pass a value of true to enable query highlight markers (see below). |
| `query` | yes | string | Search query. May contains booleans, etc. |
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
                "created": 1508804330,
                "display_as_bot": false,
                "editable": false,
                "external_type": "",
                "filetype": "png",
                "groups": [],
                "id": "F7PKF1NR7",
                "image_exif_rotation": 1,
                "ims": [],
                "initial_comment": {
                    "comment": "Sure! Here's the workflow diagram!",
                    "created": 1508804330,
                    "id": "Fc7NLL52E7",
                    "is_intro": true,
                    "timestamp": 1508804330,
                    "user": "U2U85N1RZ"
                },
                "is_external": false,
                "is_public": true,
                "mimetype": "image/png",
                "mode": "hosted",
                "name": "slack workflow diagram.png",
                "original_h": 117,
                "original_w": 128,
                "permalink": "https://example.slack.com/files/U2U85N1RZ/F7PKF1NR7/slack_workflow_diagram.png",
                "permalink_public": "https://slack-files.com/T2U81E2FZ-F7PKF1NR7-bea9143f18",
                "pretty_type": "PNG",
                "preview": null,
                "public_url_shared": false,
                "score": "0.99982661240974",
                "size": 35705,
                "thumb_160": "https://files.slack.com/files-tmb/T2U81E2FZ-F7PKF1NR7-19f33fc256/slack_workflow_diagram_160.png",
                "thumb_360": "https://files.slack.com/files-tmb/T2U81E2FZ-F7PKF1NR7-19f33fc256/slack_workflow_diagram_360.png",
                "thumb_360_h": 117,
                "thumb_360_w": 128,
                "thumb_64": "https://files.slack.com/files-tmb/T2U81E2FZ-F7PKF1NR7-19f33fc256/slack_workflow_diagram_64.png",
                "thumb_80": "https://files.slack.com/files-tmb/T2U81E2FZ-F7PKF1NR7-19f33fc256/slack_workflow_diagram_80.png",
                "timestamp": 1508804330,
                "title": "slack workflow diagram",
                "top_file": false,
                "url_private": "https://files.slack.com/files-pri/T2U81E2FZ-F7PKF1NR7/slack_workflow_diagram.png",
                "url_private_download": "https://files.slack.com/files-pri/T2U81E2FZ-F7PKF1NR7/download/slack_workflow_diagram.png",
                "user": "U2U85N1RZ",
                "username": "amy"
            }
        ],
        "pagination": {
            "first": 1,
            "last": 1,
            "page": 1,
            "page_count": 1,
            "per_page": 20,
            "total_count": 1
        },
        "paging": {
            "count": 20,
            "page": 1,
            "pages": 1,
            "total": 1
        },
        "total": 1
    },
    "messages": {
        "matches": [
            {
                "channel": {
                    "id": "C2U86NC6M",
                    "is_ext_shared": false,
                    "is_mpim": false,
                    "is_org_shared": false,
                    "is_pending_ext_shared": false,
                    "is_private": false,
                    "is_shared": false,
                    "name": "general",
                    "pending_shared": []
                },
                "iid": "35692677-e60e-43d9-ac45-1987cea88975",
                "next": {
                    "iid": "6f510ea1-e1d3-4f3f-bdb9-f9c6f6e9d609",
                    "text": "Thanks!",
                    "ts": "1508804378.000219",
                    "type": "message",
                    "user": "U2U85HJ7R",
                    "username": "john"
                },
                "permalink": "https://example.slack.com/archives/C2U86NC6M/p1508804330000296",
                "previous": {
                    "iid": "aba8603c-0543-4fb2-9118-a5ac85f3d138",
                    "text": "Can you send me the Slack workflow diagram?",
                    "ts": "1508804301.000026",
                    "type": "message",
                    "user": "U2U85HJ7R",
                    "username": "john"
                },
                "team": "T2U81E2FZ",
                "text": "uploaded a file: <https://example.slack.com/files/U2U85N1RZ/F7PKF1NR7/slack_workflow_diagram.png|slack workflow diagram> and commented: Sure! Here's the workflow diagram!",
                "ts": "1508804330.000296",
                "type": "message",
                "user": "U2U85N1RZ",
                "username": "amy"
            }
        ],
        "pagination": {
            "first": 1,
            "last": 1,
            "page": 1,
            "page_count": 1,
            "per_page": 20,
            "total_count": 1
        },
        "paging": {
            "count": 20,
            "page": 1,
            "pages": 1,
            "total": 1
        },
        "total": 1
    },
    "ok": true,
    "posts": {
        "matches": [],
        "total": 0
    },
    "query": "diagram"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/search.all.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
