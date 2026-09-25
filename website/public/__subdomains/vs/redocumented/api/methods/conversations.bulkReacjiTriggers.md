# conversations.bulkReacjiTriggers

- status: undocumented
- verified: not-live-tested
- tokens: session xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/conversations.bulkReacjiTriggers

Bulk reacji trigger config

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_ids` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `channel_triggers` | Array<{ |
| `channel_id` | string |
| `triggers` | unknown[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.bulkReacjiTriggers.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
