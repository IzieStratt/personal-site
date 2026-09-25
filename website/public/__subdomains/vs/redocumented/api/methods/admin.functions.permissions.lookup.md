# admin.functions.permissions.lookup

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.functions.permissions.lookup

Lookup the visibility of multiple Slack functions and include the users if it is limited to particular named entities.

## Params

| name | required | type | description |
|---|---|---|---|
| `function_ids` | yes | array | An array of function IDs to get permissions for. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "errors": {}
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.functions.permissions.lookup.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
