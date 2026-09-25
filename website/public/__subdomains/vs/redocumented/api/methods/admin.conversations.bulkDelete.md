# admin.conversations.bulkDelete

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.bulkDelete

Delete public or private channels in bulk

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_ids` | yes | array | An array of channel IDs. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "bulk_action_id": "Ab123456",
    "not_added": [
        {
            "channel_id": "C12346",
            "error": "invalid_channel"
        }
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.bulkDelete.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
