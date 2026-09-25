# admin.conversations.bulkSetProperties

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.bulkSetProperties

Set properties on channels in bulk.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_ids` | yes | array | An array of channel IDs on which to set the property. |
| `property` | yes | string | The property for this channel in a key value format. Only one property can be updated at a time. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.bulkSetProperties.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
