# users.interactions.list

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/users.interactions.list

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `components` | no | string |  |
| `types` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `interactions` | Array<{ |
| `component` | string |
| `type` | string |
| `step` | string |
| `count` | number |
| `date_first_recorded` | number |
| `date_last_recorded` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.interactions.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
