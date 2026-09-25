# pins.remove

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/pins.remove

Un-pins an item from a channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | Channel where the item is pinned to. |
| `timestamp` | no | string | Timestamp of the message to un-pin. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/pins.remove.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
