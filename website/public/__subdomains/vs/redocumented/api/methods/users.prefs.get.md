# users.prefs.get

- status: undocumented
- verified: live-verified
- tokens: session xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/users.prefs.get

Fetch user's client preference blob

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `prefs` | Record<UsersPrefsGetPrefsName, UsersPrefsGetPrefsEntry> |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.prefs.get.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
