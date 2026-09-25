# admin.barriers.delete

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.barriers.delete

Delete an existing Information Barrier

## Params

| name | required | type | description |
|---|---|---|---|
| `barrier_id` | yes | string | The ID of the barrier you're trying to delete. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.barriers.delete.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
