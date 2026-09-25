# slackLists.update

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/slackLists.update

Update a List.

## Params

| name | required | type | description |
|---|---|---|---|
| `id` | yes | string | The ID of the List to update. |
| `name` | no | string | The updated name of the List. |
| `description_blocks` | no | array | A rich text description of the List. |
| `todo_mode` | no | boolean | Boolean indicating whether the List should be in todo mode. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/slackLists.update.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
