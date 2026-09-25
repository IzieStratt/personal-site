# admin.analytics.getFile

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.analytics.getFile

Retrieve analytics data for a given date, presented as a compressed JSON file

## Params

| name | required | type | description |
|---|---|---|---|
| `date` | no | date | Date to retrieve the analytics data for, expressed as YYYY-MM-DD in UTC. Required unless metadata_only is set to true. |
| `type` | yes | string | The type of analytics to retrieve. The options are currently limited to member (for Enterprise org member analytics) and public_channel (for public channel analytics). |
| `metadata_only` | no | boolean | Retrieve metadata for the type of analytics indicated. Can be used only with type set to public_channel analytics. See detail below. Omit the date parameter when using this argument. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
""
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.analytics.getFile.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
