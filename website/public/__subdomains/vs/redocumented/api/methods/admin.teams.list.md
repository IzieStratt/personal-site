# admin.teams.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.teams.list

List all teams in an Enterprise organization

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | integer | The maximum number of items to return. Must be a positive integer no larger than 1000. |
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "teams": [
        {
            "id": "T1234",
            "name": "My Team",
            "discoverability": "hidden",
            "primary_owner": {
                "user_id": "W1234",
                "email": "bront@slack.com"
            },
            "team_url": "https://subarachnoid.slack.com/"
        }
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.teams.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
