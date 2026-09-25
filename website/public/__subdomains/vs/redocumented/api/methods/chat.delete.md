# chat.delete

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/chat.delete

Deletes a message.

## Params

| name | required | type | description |
|---|---|---|---|
| `as_user` | no | boolean | (Legacy) Pass true to delete the message as the authed user with chat:write:user scope. Bot users in this context are considered authed users. See legacy as_user parameter below. |
| `channel` | yes | channel | Channel containing the message to be deleted. |
| `ts` | yes | timestamp | Timestamp of the message to be deleted. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `channel` | string |
| `ts` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/chat.delete.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
