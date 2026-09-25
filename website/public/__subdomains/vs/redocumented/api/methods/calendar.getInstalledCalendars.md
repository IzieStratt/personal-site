# calendar.getInstalledCalendars

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/calendar.getInstalledCalendars

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `gcal` | { |
| `is_installed` | boolean |
| `app_id` | string |
| `is_manageable_by_user` | boolean |
| `ocal` | { |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/calendar.getInstalledCalendars.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
