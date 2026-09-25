# search.autocomplete.files

- status: undocumented
- verified: existence-only
- tokens: session xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/search.autocomplete.files

File search autocomplete

## Params

| name | required | type | description |
|---|---|---|---|
| `query` | no | string |  |
| `include_shares` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `files` | Record<SearchAutocompleteFilesFilesName, SearchAutocompleteFilesFilesEntry>[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/search.autocomplete.files.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
