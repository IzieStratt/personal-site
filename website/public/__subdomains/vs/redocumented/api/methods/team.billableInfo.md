# team.billableInfo

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/team.billableInfo

Gets billable users information for the current team.

## Params

| name | required | type | description |
|---|---|---|---|
| `cursor` | no | string | Set cursor to next_cursor returned by previous call, to indicate from where you want to list next page of users list. Default value fetches the first page. |
| `limit` | no | integer | The maximum number of items to return. |
| `user` | no | user | A user to retrieve the billable information for. Defaults to all users. |
| `team_id` | no | string | encoded team id to get the billable information from, required if org token is used. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "billable_info": {
        "U0632EWRW": {
            "billing_active": false
        },
        "U02UCPE1R": {
            "billing_active": true
        },
        "U02UEBSD2": {
            "billing_active": true
        }
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/team.billableInfo.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
