# helpcenter.getWhatsNew

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/helpcenter.getWhatsNew

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `locale` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `articles` | Array<{ |
| `zendesk_id` | number |
| `title` | string |
| `body` | string |
| `section_id` | number |
| `draft` | boolean |
| `user_segment_id` | number |
| `label_names` | string[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/helpcenter.getWhatsNew.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
