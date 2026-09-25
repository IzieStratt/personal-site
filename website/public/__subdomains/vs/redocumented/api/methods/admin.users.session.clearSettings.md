# admin.users.session.clearSettings

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.users.session.clearSettings

Clear user-specific session settings—the session duration and what happens when the client closes—for a list of users.

## Params

| name | required | type | description |
|---|---|---|---|
| `user_ids` | yes | array | The IDs of users you'd like to clear session settings for. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.users.session.clearSettings.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
