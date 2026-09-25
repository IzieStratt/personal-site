# admin.conversations.removeCustomRetention

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.removeCustomRetention

This API endpoint can be used by any admin to remove a conversation's retention policy.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | yes | string | The conversation to set the retention policy for. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.removeCustomRetention.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
