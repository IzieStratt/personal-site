# dnd.endSnooze

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/dnd.endSnooze

Ends the current user's snooze mode immediately.

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `dnd_enabled` | boolean |
| `next_dnd_start_ts` | number |
| `next_dnd_end_ts` | number |
| `snooze_enabled` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/dnd.endSnooze.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
