# admin.conversations.createForObjects

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.createForObjects

Create a Salesforce channel for the corresponding object provided.

## Params

| name | required | type | description |
|---|---|---|---|
| `object_id` | yes | string | Object / Record ID (15 or 18 digit accepted). See here for how to look up an ID. |
| `salesforce_org_id` | yes | string | Salesforce org ID (15 or 18 digit accepted). See here for how to look up Salesforce org ID. |
| `invite_object_team` | no | boolean | Optional flag to add all team members related to the object to the newly created Salesforce channel. When true, adds a maximum of 100 team members to the channel. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "channel_id": "C12345"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.createForObjects.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
