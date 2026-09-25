# admin.conversations.unlinkObjects

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.unlinkObjects

Unlink a Salesforce record from a channel

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | Channel ID for Slack channel that will be unlinked from the Salesforce record. |
| `new_name` | yes | string | Channel name you would like to give to the channel that is being unlinked from the Salesforce record. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.unlinkObjects.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
