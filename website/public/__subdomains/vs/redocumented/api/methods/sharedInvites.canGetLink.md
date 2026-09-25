# sharedInvites.canGetLink

- status: undocumented
- verified: live-verified
- tokens: team xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/sharedInvites.canGetLink

Eligibility to generate shared invite link

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `is_eligible` | boolean |
| `reason` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/sharedInvites.canGetLink.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
