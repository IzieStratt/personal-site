# dnd.setSnooze

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/dnd.setSnooze

Turns on Do Not Disturb mode for the current user, or changes its duration.

## Params

| name | required | type | description |
|---|---|---|---|
| `num_minutes` | yes | string | This argument is required. Number of minutes, from now, to snooze until. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `snooze_enabled` | boolean |
| `snooze_endtime` | number |
| `snooze_remaining` | number |
| `snooze_is_indefinite` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/dnd.setSnooze.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
