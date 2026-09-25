# admin.teams.admins.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.teams.admins.list

List all of the admins on a given workspace.

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | integer | The maximum number of items to return. |
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |
| `team_id` | yes | string |  |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "admin_ids": [
        "U1234"
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.teams.admins.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
