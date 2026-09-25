# assistant.threads.startThread

- status: undocumented
- verified: existence-only (sample-checked)
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/assistant.threads.startThread

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `source` | no | string |  |
| `bot_user_id` | no | string |  |
| `context` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `channel_id` | string |
| `thread_ts` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/assistant.threads.startThread.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
