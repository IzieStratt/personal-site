# files.getMetadata

- status: undocumented
- verified: existence-only (sample-checked)
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/files.getMetadata

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `file_id` | no | string |  |
| `type` | no | string |  |
| `limit` | no | number |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `private_channel_count` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/files.getMetadata.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
