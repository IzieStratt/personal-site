# emoji.collections.list

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/emoji.collections.list

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `installed_only` | no | number |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `installed` | Array<{ |
| `id` | string |
| `name` | string |
| `author` | string |
| `team_id` | string |
| `locale` | string |
| `date_create` | number |
| `is_draft` | boolean |
| `available` | Array<{ |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/emoji.collections.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
