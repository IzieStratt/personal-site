# users.sharedInvites.renew

- status: undocumented
- verified: not-live-tested (source-only, typed but unverified)
- tokens: unknown
- write-shaped name: no
- source: ImShyMike/slack-undoc-client (generated types); see methods/slack-undoc-client-2026.md
- call: POST https://slack.com/api/users.sharedInvites.renew

params per slack-undoc-client generated types: code?: string; team_id?: string;

## Params

| name | required | type | description |
|---|---|---|---|
| `code` | no | string |  |
| `team_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
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
JSON: https://vs.izie.top/redocumented/api/methods/users.sharedInvites.renew.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
