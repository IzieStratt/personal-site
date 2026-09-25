# reactions.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/reactions.list

Lists reactions made by a user.

## Params

| name | required | type | description |
|---|---|---|---|
| `user` | no | user | Show reactions made by this user. Defaults to the authed user. |
| `full` | no | boolean | If true always return the complete reaction list. |
| `cursor` | no | string | Parameter for pagination. Set cursor equal to the next_cursor attribute returned by the previous request's response_metadata. This parameter is optional, but pagination is mandatory: the default value simply fetches the first "page" of the collection. See pagination for more details. |
| `limit` | no | integer | The maximum number of items to return. Fewer than the requested number of items may be returned, even if the end of the list hasn't been reached. |
| `team_id` | no | string | encoded team id to list reactions in, required if org token is used. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "items": [
        {
            "type": "message",
            "channel": "C123ABC456",
            "message": {
                "bot_id": "B123ABC456",
                "reactions": [
                    {
                        "count": 1,
                        "name": "robot_face",
                        "users": [
                            "U123ABC456"
                        ]
                    }
                ],
                "subtype": "bot_message",
                "text": "Hello from Python! :tada:",
                "ts": "1507849573.000090",
                "username": "Shipit Notifications"
            }
        },
        {
            "comment": {
                "type": "file_comment",
                "comment": "This is a file comment",
                "created": 1508286096,
                "id": "Fc123ABC456",
                "reactions": [
                    {
                        "count": 1,
                        "name": "white_check_mark",
                        "users": [
                            "U123ABC456"
                        ]
                    }
                ],
                "timestamp": 1508286096,
                "user": "U123ABC456"
            },
            "file": {
                "channels": [
                    "C123ABC456"
                ],
                "comments_count": 1,
                "created": 1507850315,
                "reactions": [
                    {
                        "count": 1,
                        "name": "stuck_out_tongue_winking_eye",
                        "users": [
                            "U123ABC456"
                        ]
                    }
                ],
                "title": "computer.gif",
                "user": "U123ABC456",
                "username": ""
            }
        },
        {
            "file": {
                "channels": [
                    "C123ABC456"
                ],
                "comments_count": 1,
                "created": 1507850315,
                "id": "F123ABC456",
                "name": "computer.gif",
                "reactions": [
                    {
                        "count": 1,
                        "name": "stuck_out_tongue_winking_eye",
                        "users": [
                            "U123ABC456"
                        ]
                    }
                ],
                "size": 1639034,
                "title": "computer.gif",
                "user": "U123ABC456",
                "username": ""
            },
            "type": "file"
        }
    ],
    "ok": true,
    "response_metadata": {
        "next_cursor": "dGVhbTpDMUg5UkVTR0w="
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/reactions.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
