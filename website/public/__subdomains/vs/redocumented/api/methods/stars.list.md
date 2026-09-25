# stars.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/stars.list

Listed a user's saved items, formerly known as stars.

## Params

| name | required | type | description |
|---|---|---|---|
| `cursor` | no | string | Parameter for pagination. Set cursor equal to the next_cursor attribute returned by the previous request's response_metadata. This parameter is optional, but pagination is mandatory: the default value simply fetches the first "page" of the collection. See pagination for more details. |
| `limit` | no | integer | The maximum number of items to return. Fewer than the requested number of items may be returned, even if the end of the list hasn't been reached. |
| `team_id` | no | string | encoded team id to list stars in, required if org token is used. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "items": [
        {
            "type": "message",
            "channel": "C123ABC456",
            "message": {
                "type": "message",
                "subtype": "bot_message",
                "text": "",
                "ts": "1655762568.324229",
                "username": "username",
                "icons": {
                    "emoji": ":test:"
                },
                "bot_id": "BSLACKBOT",
                "attachments": [
                    {
                        "color": "ecb438",
                        "ts": 1655762568,
                        "id": 1,
                        "fallback": "some text",
                        "text": "some text",
                        "pretext": "*chat.postMessage*",
                        "mrkdwn_in": [
                            "pretext",
                            "text"
                        ]
                    }
                ],
                "permalink": "https://your-workspace.slack.com/archives/C123ABC456/p123456789"
            },
            "date_create": 1656014995
        }
    ],
    "paging": {
        "per_page": 100,
        "spill": 0,
        "page": 1,
        "total": 1,
        "pages": 1
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/stars.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
