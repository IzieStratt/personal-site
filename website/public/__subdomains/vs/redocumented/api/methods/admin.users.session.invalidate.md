# admin.users.session.invalidate

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.users.session.invalidate

Revoke a single session for a user. The user will be forced to login to Slack.

## Params

| name | required | type | description |
|---|---|---|---|
| `user_id` | yes | string | ID of the user that the session belongs to. |
| `session_id` | yes | integer | ID of the session to invalidate. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.users.session.invalidate.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
