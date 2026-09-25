# im.list

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/im.list

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `get_latest` | no | boolean |  |
| `get_read_state` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `ims` | Array<{ |
| `id` | string |
| `created` | number |
| `is_frozen` | boolean |
| `is_archived` | boolean |
| `is_im` | boolean |
| `is_org_shared` | boolean |
| `context_team_id` | string |
| `updated` | number |
| `is_shared` | boolean |
| `user` | string |
| `last_read` | string |
| `is_open` | boolean |
| `latest` | string |
| `priority` | number |
| `properties` | { |
| `tabs` | Array<{ |
| `type` | string |
| `label` | string |
| `data` | { |
| `file_id` | string |
| `shared_ts` | string |
| `tabz` | Array<{ |
| `meeting_notes` | { |
| `is_dormant` | boolean |
| `response_metadata` | { |
| `next_cursor` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/im.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
