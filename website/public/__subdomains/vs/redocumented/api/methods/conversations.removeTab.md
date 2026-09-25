# conversations.removeTab

- status: undocumented
- verified: existence-only
- tokens: Live-tested 2026-09-25 with an xoxb: not_allowed_token_type. App tokens can't remove channel tabs. See methods/grid-admin-sandbox-2026-09.md.
- write-shaped name: yes, do not call without a human in the loop
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/conversations.removeTab

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `id` | no | string |  |
| `channel_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `tabs` | Array<{ |
| `id` | string |
| `label` | string |
| `type` | string |
| `data` | { |
| `file_id` | string |
| `shared_ts` | string |
| `is_disabled` | boolean |
| `tabz` | Array<{ |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.removeTab.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
