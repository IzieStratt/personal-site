# conversations.pendingInvites.list

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/conversations.pendingInvites.list

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | number |  |
| `query` | no | string |  |
| `sort` | no | string |  |
| `sort_dir` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `invites` | unknown[] |
| `total_count` | number |
| `response_metadata` | { |
| `next_cursor` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.pendingInvites.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
