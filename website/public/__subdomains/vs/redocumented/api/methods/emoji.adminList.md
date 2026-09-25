# emoji.adminList

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/emoji.adminList

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `page` | no | number |  |
| `count` | no | number |  |
| `queries` | no | string |  |
| `user_ids` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `disabled_emoji` | Array<{ |
| `name` | string |
| `is_alias` | number |
| `alias_for` | string |
| `url` | string |
| `team_id` | string |
| `user_id` | string |
| `created` | number |
| `is_bad` | boolean |
| `user_display_name` | string |
| `avatar_hash` | string |
| `can_delete` | boolean |
| `synonyms` | unknown[] |
| `custom_emoji_total_count` | number |
| `paging` | { |
| `count` | number |
| `total` | number |
| `page` | number |
| `pages` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/emoji.adminList.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
