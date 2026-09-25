# conversations.kick

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/conversations.kick

Removes a user from a conversation.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | ID of conversation to remove user from. |
| `user` | no | user | User ID to be removed. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.kick.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
