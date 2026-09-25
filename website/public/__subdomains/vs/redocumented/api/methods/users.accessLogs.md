# users.accessLogs

- status: undocumented
- verified: not-live-tested (source-only, typed but unverified)
- tokens: unknown
- write-shaped name: no
- source: ImShyMike/slack-undoc-client (generated types); see methods/slack-undoc-client-2026.md
- call: POST https://slack.com/api/users.accessLogs

params per slack-undoc-client generated types: (void / no params)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `logins` | Array<{ |
| `date_first` | number |
| `date_last` | number |
| `login_count` | number |
| `ip` | string |
| `user_agent_simple` | string |
| `user_agent_full` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.accessLogs.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
