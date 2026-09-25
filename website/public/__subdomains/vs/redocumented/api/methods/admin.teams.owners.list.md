# admin.teams.owners.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.teams.owners.list

List all of the owners on a given workspace.

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | yes | string |  |
| `limit` | no | integer | The maximum number of items to return. Must be between 1 - 1000 both inclusive. |
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "owner_ids": [
        "U1234"
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.teams.owners.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
