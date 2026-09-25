# mpim.list

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/mpim.list

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `get_latest` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `groups` | Array<{ |
| `id` | string |
| `created` | number |
| `creator` | string |
| `is_org_shared` | boolean |
| `is_im` | boolean |
| `context_team_id` | string |
| `updated` | number |
| `name` | string |
| `name_normalized` | string |
| `is_channel` | boolean |
| `is_group` | boolean |
| `is_mpim` | boolean |
| `is_private` | boolean |
| `is_archived` | boolean |
| `is_general` | boolean |
| `is_shared` | boolean |
| `is_ext_shared` | boolean |
| `unlinked` | number |
| `is_pending_ext_shared` | boolean |
| `pending_shared` | unknown[] |
| `parent_conversation` | null |
| `members` | string[] |
| `purpose` | { |
| `value` | string |
| `last_set` | number |
| `topic` | { |
| `pending_connected_team_ids` | unknown[] |
| `is_global_shared` | boolean |
| `is_org_default` | boolean |
| `is_org_mandatory` | boolean |
| `is_member` | boolean |
| `is_open` | boolean |
| `last_read` | string |
| `latest` | string |
| `properties` | { |
| `canvas` | { |
| `file_id` | string |
| `is_empty` | boolean |
| `quip_thread_id` | string |
| `is_migrated` | boolean |
| `meeting_notes` | { |
| `tabs` | Array<{ |
| `label` | string |
| `type` | string |
| `data` | { |
| `shared_ts` | string |
| `is_disabled` | boolean |
| `tabz` | Array<{ |
| `is_dormant` | boolean |
| `priority` | number |
| `is_moved` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/mpim.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
