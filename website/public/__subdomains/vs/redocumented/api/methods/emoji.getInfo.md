# emoji.getInfo

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/emoji.getInfo

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `name` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `name` | string |
| `is_alias` | number |
| `alias_for` | null |
| `url` | string |
| `team_id` | string |
| `user_id` | string |
| `user_display_name` | string |
| `can_delete` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/emoji.getInfo.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
