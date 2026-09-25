# slackLists.access.set

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/slackLists.access.set

Set the access level to a List for specified entities.

## Params

| name | required | type | description |
|---|---|---|---|
| `list_id` | yes | string | Encoded ID of the List. |
| `access_level` | yes | string | Desired level of access. |
| `channel_ids` | no | array | List of channels you wish to update access for. Can only be used if user_ids is not provided. |
| `user_ids` | no | array | List of users you wish to update access for. Can only be used if channel_ids is not provided. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/slackLists.access.set.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
