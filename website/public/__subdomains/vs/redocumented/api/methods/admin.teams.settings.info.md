# admin.teams.settings.info

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.teams.settings.info

Fetch information about settings in a workspace

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | yes | string |  |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "team": {
        "id": "string",
        "name": "string",
        "domain": "string",
        "email_domain": "string",
        "icon": "array",
        "enterprise_id": "string",
        "enterprise_name": "string",
        "default_channels": "array"
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.teams.settings.info.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
