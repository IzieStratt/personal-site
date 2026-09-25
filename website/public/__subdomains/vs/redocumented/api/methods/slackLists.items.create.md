# slackLists.items.create

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/slackLists.items.create

Add a new item to an existing List.

## Params

| name | required | type | description |
|---|---|---|---|
| `list_id` | yes | string | ID of the List to add the item to. |
| `duplicated_item_id` | no | string | ID of the record to make a copy of. |
| `parent_item_id` | no | string | ID of the parent record for this subtask. |
| `initial_fields` | no | array | Initial item data. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "item": {
        "id": "Rec018ALE9718",
        "list_id": "F1234567",
        "date_created": 1758744345,
        "created_by": "W0AB1CDE2",
        "updated_by": "W0AB1CDE2",
        "fields": [],
        "updated_timestamp": "1758744345"
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/slackLists.items.create.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
