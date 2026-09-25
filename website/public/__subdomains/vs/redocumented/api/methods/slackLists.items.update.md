# slackLists.items.update

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/slackLists.items.update

Updates cells in a List.

## Params

| name | required | type | description |
|---|---|---|---|
| `list_id` | yes | string | ID of the List to add or update cells. |
| `cells` | yes | array | Cells to update. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/slackLists.items.update.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
