# calls.end

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/calls.end

Ends a Call.

## Params

| name | required | type | description |
|---|---|---|---|
| `id` | yes | string | id returned when registering the call using the calls.add method. |
| `duration` | no | integer | Call duration in seconds. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/calls.end.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
