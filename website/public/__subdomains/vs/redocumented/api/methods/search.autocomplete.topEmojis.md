# search.autocomplete.topEmojis

- status: undocumented
- verified: existence-only
- tokens: session xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/search.autocomplete.topEmojis

Emoji picker autocomplete ranking

## Params

| name | required | type | description |
|---|---|---|---|
| `count` | no | number |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `user` | string[] |
| `org` | string[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/search.autocomplete.topEmojis.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
