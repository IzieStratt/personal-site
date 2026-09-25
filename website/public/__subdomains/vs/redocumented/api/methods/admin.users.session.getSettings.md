# admin.users.session.getSettings

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.users.session.getSettings

Get user-specific session settings—the session duration and what happens when the client closes—given a list of users.

## Params

| name | required | type | description |
|---|---|---|---|
| `user_ids` | yes | array | The IDs of users you'd like to fetch session settings for. Note: if a user does not have any active sessions, they will not be returned in the response. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "session_settings": [
        {
            "user_id": "U1234",
            "desktop_app_browser_quit": true,
            "duration": 315569520
        }
    ],
    "no_settings_applied": []
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.users.session.getSettings.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
