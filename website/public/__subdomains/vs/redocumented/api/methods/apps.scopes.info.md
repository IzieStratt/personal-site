# apps.scopes.info

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/apps.scopes.info

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `scope_info` | Array<{ |
| `name` | string |
| `description` | string |
| `is_sensitive` | boolean |
| `token_type` | string |
| `is_optional` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.scopes.info.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
