# auth.teams.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/auth.teams.list

Obtain a full list of workspaces your org-wide app has been approved for.

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | integer | The maximum number of workspaces to return. Must be a positive integer no larger than 1000. |
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |
| `include_icon` | no | boolean | Whether to return icon paths for each workspace. An icon path represents a URI pointing to the image signifying the workspace. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "teams": [
        {
            "name": "Shinichi's workspace",
            "id": "T12345678"
        },
        {
            "name": "Migi's workspace",
            "id": "T12345679"
        }
    ],
    "response_metadata": {
        "next_cursor": "dXNlcl9pZDo5MTQyOTI5Mzkz"
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/auth.teams.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
