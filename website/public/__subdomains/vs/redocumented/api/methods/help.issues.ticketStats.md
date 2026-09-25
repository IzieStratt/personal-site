# help.issues.ticketStats

- status: undocumented
- verified: live-verified
- tokens: team xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/help.issues.ticketStats

Open/unread support ticket counts

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `unread_count` | number |
| `open_count` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/help.issues.ticketStats.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
