# admin.conversations.convertToPrivate

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.convertToPrivate

Convert a public channel to a private channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | yes | string | The channel to convert to private. |
| `name` | no | string | Name of private channel to create. Only respected when converting an MPIM. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.convertToPrivate.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
