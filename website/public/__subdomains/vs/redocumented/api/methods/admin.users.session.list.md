# admin.users.session.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.users.session.list

List active user sessions for an organization

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | no | string | The ID of the workspace you'd like active sessions for. If you pass a team_id, you'll need to pass a user_id as well. |
| `user_id` | no | string | The ID of user you'd like active sessions for. If you pass a user_id, you'll need to pass a team_id as well. |
| `limit` | no | integer | The maximum number of items to return. Must be between 1 - 1000 both inclusive. |
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "active_sessions": [
        {
            "user_id": "U012S9M77JP",
            "team_id": "E011E2SBBFC",
            "session_id": 1112275520242,
            "recent": {
                "device_hardware": "Intel",
                "os": "OS X",
                "os_version": "10.15.7",
                "slack_client_version": "91.0.4472.77",
                "ip": "24.6.145.138"
            },
            "created": {
                "device_hardware": "Intel",
                "os": "OS X",
                "os_version": "10.15.7",
                "slack_client_version": "91.0.4472.77",
                "ip": "24.6.145.138"
            }
        }
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.users.session.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
