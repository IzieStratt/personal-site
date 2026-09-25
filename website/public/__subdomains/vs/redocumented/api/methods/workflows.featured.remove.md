# workflows.featured.remove

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/workflows.featured.remove

Remove featured workflows from a channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | yes | string | Channel to remove featured workflow from. |
| `trigger_ids` | yes | array | Comma-separated array of trigger IDs to remove; max 15. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/workflows.featured.remove.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
