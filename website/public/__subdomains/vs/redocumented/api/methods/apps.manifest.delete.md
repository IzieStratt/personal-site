# apps.manifest.delete

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.manifest.delete

Permanently deletes an app created through app manifests. When called with a manager app token, this method can only delete apps that were created by that manager app.

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | yes | string | The ID of the app you want to delete. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.manifest.delete.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
