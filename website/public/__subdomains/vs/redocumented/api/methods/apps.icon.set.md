# apps.icon.set

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.icon.set

Sets the app icon

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | yes | string | The ID of the app whose icon you want to set. |
| `file` | no | file | File contents via multipart/form-data. |
| `url` | no | string | URL of a publicly hosted image. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.icon.set.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
