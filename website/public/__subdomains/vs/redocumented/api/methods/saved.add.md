# saved.add

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: yes, do not call without a human in the loop
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/saved.add

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `item_type` | no | string |  |
| `description` | no | string |  |
| `client_id` | no | string |  |
| `date_due` | no | number |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `item` | { |
| `item_id` | string |
| `item_type` | string |
| `date_created` | number |
| `date_due` | number |
| `date_completed` | number |
| `date_updated` | number |
| `is_archived` | boolean |
| `date_snoozed_until` | number |
| `description` | Array<{ |
| `type` | string |
| `block_id` | string |
| `state` | string |
| `ts` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/saved.add.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
