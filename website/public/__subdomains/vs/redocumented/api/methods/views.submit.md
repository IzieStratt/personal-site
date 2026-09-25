# views.submit

- status: undocumented
- verified: live-verified
- tokens: enterprise xoxc returned ok:true (team xoxc not tried). Live-tested 2026-09-25; see methods/block-actions-and-modals-2026-09.md.
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/views.submit

Submits an open modal as the user: view_id from the RTM view_opened event, state={"values":{block_id:{action_id:{type,value}}}}, fresh client_token.

## Params

| name | required | type | description |
|---|---|---|---|
| `client_token` | no | string |  |
| `view_id` | no | string |  |
| `state` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `view` | null |
| `response_action` | null |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/views.submit.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
