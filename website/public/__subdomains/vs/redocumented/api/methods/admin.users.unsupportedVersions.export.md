# admin.users.unsupportedVersions.export

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.users.unsupportedVersions.export

Ask Slackbot to send you an export listing all workspace members using unsupported software, presented as a zipped CSV file.

## Params

| name | required | type | description |
|---|---|---|---|
| `date_sessions_started` | no | integer | Unix timestamp of a date to start looking for user sessions. If not provided will start six months ago. |
| `date_end_of_support` | no | integer | Unix timestamp of the date of past or upcoming end of support cycles. If not provided will include all announced end of support cycles. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.users.unsupportedVersions.export.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
