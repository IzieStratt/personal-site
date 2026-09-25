# reactions.get

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/reactions.get

Gets reactions for an item.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | no | channel | Channel where the message to get reactions for was posted. |
| `file` | no | file | File to get reactions for. |
| `file_comment` | no | string | File comment to get reactions for. |
| `full` | no | boolean | If true always return the complete reaction list. |
| `timestamp` | no | string | Timestamp of the message to get reactions for. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "type": "message",
    "message": {
        "type": "message",
        "text": "Hi there!",
        "user": "W123456",
        "ts": "1648602352.215969",
        "team": "T123456",
        "reactions": [
            {
                "name": "grinning",
                "users": [
                    "W222222"
                ],
                "count": 1
            },
            {
                "name": "question",
                "users": [
                    "W333333"
                ],
                "count": 1
            }
        ],
        "permalink": "https://xxx.slack.com/archives/C123456/p1648602352215969"
    },
    "channel": "C123ABC456"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/reactions.get.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
