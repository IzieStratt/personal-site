# search.autocomplete

- status: undocumented
- verified: existence-only
- tokens: session xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/search.autocomplete

Search box autocomplete

## Params

| name | required | type | description |
|---|---|---|---|
| `query` | no | string |  |
| `limit` | no | number |  |
| `use_hash` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `suggestions` | Array<{ |
| `hash` | string |
| `text` | string |
| `type` | string |
| `ts` | number |
| `count` | number |
| `query_suggestions` | unknown[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/search.autocomplete.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
