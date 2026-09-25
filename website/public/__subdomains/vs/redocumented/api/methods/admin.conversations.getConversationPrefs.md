# admin.conversations.getConversationPrefs

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.getConversationPrefs

Get conversation preferences for a public or private channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | yes | string | The channel to get preferences for. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "prefs": {
        "who_can_post": {
            "type": "admin",
            "user": "U1234"
        },
        "can_thread": {
            "type": "admin, owner",
            "user": "U1234,U5678"
        }
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.getConversationPrefs.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
