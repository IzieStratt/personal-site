# dnd.info

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/dnd.info

Retrieves a user's current Do Not Disturb status.

## Params

| name | required | type | description |
|---|---|---|---|
| `user` | no | user | User to fetch status for (defaults to current user). |
| `team_id` | no | string | Encoded team id where passed in user param belongs, required if org token is used. If no user param is passed, then a team which has access to the app should be passed. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `dnd_enabled` | boolean |
| `next_dnd_start_ts` | number |
| `next_dnd_end_ts` | number |
| `snooze_enabled` | boolean |
| `snooze_endtime` | number |
| `snooze_remaining` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/dnd.info.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
