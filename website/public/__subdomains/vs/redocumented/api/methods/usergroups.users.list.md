# usergroups.users.list

- status: documented
- verified: live-verified
- tokens: Live-verified 2026-09-25: with an org-level xoxb, team_id is required (missing_argument, arg: team_id). See methods/grid-admin-sandbox-2026-09.md.
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/usergroups.users.list

List all users in a User Group.

## Params

| name | required | type | description |
|---|---|---|---|
| `include_disabled` | no | boolean | Include results for disabled User Groups. |
| `usergroup` | yes | string | The encoded ID of the User Group. |
| `team_id` | no | string | The user group's encoded team ID. Required if org token is used. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `users` | string[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/usergroups.users.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
