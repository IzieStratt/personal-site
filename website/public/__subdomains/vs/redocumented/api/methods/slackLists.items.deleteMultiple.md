# slackLists.items.deleteMultiple

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/slackLists.items.deleteMultiple

Deletes multiple items from an existing List.

## Params

| name | required | type | description |
|---|---|---|---|
| `list_id` | yes | string | ID of the List containing the items. |
| `ids` | yes | array | IDs of items to delete. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/slackLists.items.deleteMultiple.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
