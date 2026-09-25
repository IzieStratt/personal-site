# slackLists.create

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/slackLists.create

Create a List.

## Params

| name | required | type | description |
|---|---|---|---|
| `name` | yes | string | Name of the List. |
| `description_blocks` | no | array | A rich text description of the List. |
| `schema` | no | array | Column definition for the List. |
| `copy_from_list_id` | no | string | ID of the List to copy. |
| `include_copied_list_records` | no | boolean | Boolean indicating whether to include records when a List is copied. |
| `todo_mode` | no | boolean | Boolean indicating whether the List should be used to track todo tasks. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "list_id": "F1234ABCD"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/slackLists.create.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
