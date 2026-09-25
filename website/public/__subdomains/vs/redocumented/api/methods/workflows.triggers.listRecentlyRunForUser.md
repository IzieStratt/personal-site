# workflows.triggers.listRecentlyRunForUser

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/workflows.triggers.listRecentlyRunForUser

(inferred from name only; see methods/datamine-2026-09.md)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `recently_run_triggers` | unknown[] |
| `recently_run_triggers_with_timestamps` | unknown[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/workflows.triggers.listRecentlyRunForUser.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
