# drafts.delete

- status: undocumented
- verified: live-verified
- tokens: enterprise xoxc/xoxd
- write-shaped name: yes, do not call without a human in the loop
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/drafts.delete

Delete a draft

## Params

| name | required | type | description |
|---|---|---|---|
| `client_last_updated_ts` | no | number |  |
| `draft_id` | no | string |  |
| `skip_file_deletion` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/drafts.delete.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
