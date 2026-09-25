# admin.conversations.getTeams

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.getTeams

Get all the workspaces a given public or private channel is connected to within this Enterprise org.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | yes | string | The channel to determine connected workspaces within the organization for. |
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |
| `limit` | no | integer | The maximum number of items to return. Must be between 1 - 1000 both inclusive. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "team_ids": [
        "T1234",
        "T5679"
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.getTeams.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
