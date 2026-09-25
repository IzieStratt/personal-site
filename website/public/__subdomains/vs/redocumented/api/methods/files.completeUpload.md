# files.completeUpload

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/files.completeUpload

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `files` | no | string |  |
| `channel` | no | string |  |
| `blocks` | no | string |  |
| `client_msg_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `files` | Array<{ |
| `id` | string |
| `title` | string |
| `subtype` | string |
| `client_msg_id` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/files.completeUpload.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
