# pins.add

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/pins.add

Pins an item to a channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | Channel to pin the messsage to. You must also include a timestamp when pinning messages. |
| `timestamp` | no | string | Timestamp of the message to pin. You must also include the channel. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/pins.add.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
