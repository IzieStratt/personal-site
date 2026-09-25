# views.close

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: yes, do not call without a human in the loop
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/views.close

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `client_token` | no | string |  |
| `view_id` | no | string |  |
| `root_view_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/views.close.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
