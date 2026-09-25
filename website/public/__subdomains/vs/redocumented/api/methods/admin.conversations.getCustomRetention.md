# admin.conversations.getCustomRetention

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.getCustomRetention

This API endpoint can be used by any admin to get a conversation's retention policy.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | yes | string | The conversation to get the retention policy for. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "is_policy_enabled": true,
    "duration_days": 70
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.getCustomRetention.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
