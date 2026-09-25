# calls.participants.add

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/calls.participants.add

Registers new participants added to a Call.

## Params

| name | required | type | description |
|---|---|---|---|
| `id` | yes | string | id returned by the calls.add method. |
| `users` | yes | array | The list of users to add as participants in the Call. Read more on how to specify users here. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/calls.participants.add.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
