# apps.event.authorizations.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.event.authorizations.list

Get a list of authorizations for the given event context. Each authorization represents an app installation that the event is visible to.

## Params

| name | required | type | description |
|---|---|---|---|
| `event_context` | yes | string |  |
| `cursor` | no | string |  |
| `limit` | no | integer |  |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "authorizations": [
        {
            "enterprise_id": "string",
            "team_id": "string",
            "user_id": "string",
            "is_bot": "string"
        },
        {
            "enterprise_id": "string2",
            "team_id": "string2",
            "user_id": "string2",
            "is_bot": "string2"
        }
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.event.authorizations.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
