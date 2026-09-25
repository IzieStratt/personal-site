# functions.completeError

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/functions.completeError

Signal that a function failed to complete

## Params

| name | required | type | description |
|---|---|---|---|
| `function_execution_id` | yes | string | Context identifier that maps to the executed function. |
| `error` | yes | string | A human-readable error message that contains information about why the function failed to complete. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/functions.completeError.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
