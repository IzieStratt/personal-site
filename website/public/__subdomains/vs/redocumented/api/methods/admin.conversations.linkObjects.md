# admin.conversations.linkObjects

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.linkObjects

Link a Salesforce record to a channel

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | Channel ID for Slack channel that will be linked to a Salesforce record. |
| `record_id` | yes | string | Salesforce record ID (15 or 18 digit accepted). See here for how to look up record ID. |
| `salesforce_org_id` | yes | string | Salesforce org ID (15 or 18 digit accepted). See here for how to look up Salesforce org ID. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.linkObjects.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
