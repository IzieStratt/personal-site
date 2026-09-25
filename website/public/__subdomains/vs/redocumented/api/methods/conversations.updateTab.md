# conversations.updateTab

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/conversations.updateTab

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `id` | no | string |  |
| `channel_id` | no | string |  |
| `label` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `tabs` | Array<{ |
| `id` | string |
| `type` | string |
| `data` | { |
| `file_id` | string |
| `shared_ts` | string |
| `folder_bookmark_id` | string |
| `label` | string |
| `is_disabled` | boolean |
| `tabz` | Array<{ |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.updateTab.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
