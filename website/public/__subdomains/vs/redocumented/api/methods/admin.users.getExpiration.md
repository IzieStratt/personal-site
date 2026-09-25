# admin.users.getExpiration

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.users.getExpiration

Fetches the expiration timestamp for a guest

## Params

| name | required | type | description |
|---|---|---|---|
| `user_id` | yes | string | The ID of the guest user to get the expiration for. |
| `target_team` | no | string | If an org token is passed in and this team is on the org, it will operate on the workspace level on the specified team. Otherwise it will operate on the org or team in context. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "user": {
        "id": "U123ABC456",
        "email": "deactivate_user2@email.com",
        "is_restricted": false,
        "is_ultra_restricted": true,
        "expiration_ts": 0
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.users.getExpiration.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
