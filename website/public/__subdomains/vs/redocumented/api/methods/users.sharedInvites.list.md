# users.sharedInvites.list

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/users.sharedInvites.list

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `mode` | no | string |  |
| `team_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `invites` | Array<{ |
| `invite_id` | string |
| `inviter_id` | string |
| `date_create` | number |
| `date_delete` | number |
| `date_expire` | number |
| `code` | string |
| `url` | string |
| `max_signups` | number |
| `num_signups` | number |
| `notifications_enabled` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.sharedInvites.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
