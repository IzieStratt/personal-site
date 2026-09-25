# dnd.teamInfo

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/dnd.teamInfo

Retrieves the Do Not Disturb status for up to 50 users on a team.

## Params

| name | required | type | description |
|---|---|---|---|
| `users` | yes | string | Comma-separated list of users to fetch Do Not Disturb status for. |
| `team_id` | no | string | Encoded team id where passed in users belong, required if org token is used. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `users` | Record<UserId, { |
| `dnd_enabled` | boolean |
| `next_dnd_start_ts` | number |
| `next_dnd_end_ts` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/dnd.teamInfo.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
