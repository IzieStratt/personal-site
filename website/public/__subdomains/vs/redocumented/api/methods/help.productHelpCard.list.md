# help.productHelpCard.list

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/help.productHelpCard.list

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `count` | no | number |  |
| `type` | no | string |  |
| `locale` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `cards` | Array<{ |
| `id` | string |
| `type` | string |
| `title` | string |
| `subtitle` | string |
| `image` | string |
| `link_url` | string |
| `is_badged` | boolean |
| `audience` | string |
| `is_show_new_user` | boolean |
| `is_show_upgrade_trial` | boolean |
| `date_released` | string |
| `houston_toggle` | string |
| `status` | string |
| `author` | string |
| `date_published` | number |
| `card_order` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/help.productHelpCard.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
