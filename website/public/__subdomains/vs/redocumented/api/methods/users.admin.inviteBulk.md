# users.admin.inviteBulk

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/users.admin.inviteBulk

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `invites` | no | string |  |
| `team_id` | no | string |  |
| `restricted` | no | boolean |  |
| `ultra_restricted` | no | boolean |  |
| `campaign` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | boolean |
| `invites` | Array<{ |
| `invite_id` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.admin.inviteBulk.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
