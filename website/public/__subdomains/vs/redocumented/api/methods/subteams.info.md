# subteams.info

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/subteams.info

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `include_users` | no | boolean |  |
| `include_count` | no | boolean |  |
| `include_disabled` | no | boolean |  |
| `usergroups` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `subteams` | Array<{ |
| `id` | string |
| `team_id` | string |
| `is_subteam` | boolean |
| `name` | string |
| `description` | string |
| `handle` | string |
| `is_external` | boolean |
| `date_create` | number |
| `date_update` | number |
| `date_delete` | number |
| `auto_type` | null |
| `auto_provision` | boolean |
| `created_by` | string |
| `updated_by` | string |
| `deleted_by` | string |
| `is_section` | boolean |
| `is_editing_restricted` | boolean |
| `is_membership_locked` | boolean |
| `is_idp_group` | boolean |
| `is_visible` | boolean |
| `is_org_level` | boolean |
| `prefs` | { |
| `channels` | unknown[] |
| `groups` | unknown[] |
| `user_count` | number |
| `channel_count` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/subteams.info.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
