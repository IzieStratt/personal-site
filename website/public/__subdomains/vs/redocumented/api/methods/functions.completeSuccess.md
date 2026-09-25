# functions.completeSuccess

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/functions.completeSuccess

Signal the successful completion of a function

## Params

| name | required | type | description |
|---|---|---|---|
| `function_execution_id` | yes | string | Context identifier that maps to the executed function. |
| `outputs` | yes | object | A JSON-based object that conforms to the output parameters schema for the custom function defined in the manifest. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/functions.completeSuccess.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
