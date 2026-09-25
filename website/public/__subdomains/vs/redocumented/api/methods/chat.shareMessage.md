# chat.shareMessage

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/chat.shareMessage

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `timestamp` | no | string |  |
| `channel` | no | string |  |
| `text` | no | string |  |
| `blocks` | no | string |  |
| `share_channel` | no | string |  |
| `skip_dlp_user_warning` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `channel` | string |
| `ts` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/chat.shareMessage.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
