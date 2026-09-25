# admin.apps.requests.cancel

- status: documented
- verified: docs-only (live-tested 2026-09-20, not_an_admin on every combination)
- tokens: Live-tested 2026-09-20 with request_id + team_id and request_id + enterprise_id, both xoxc scopes: not_an_admin every time, same as admin.apps.approve. See methods/admin-write-scope-2026-09.md.
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.apps.requests.cancel

Cancel app request for team

## Params

| name | required | type | description |
|---|---|---|---|
| `request_id` | yes | string | The id of the request to cancel. |
| `team_id` | no | string | The ID of the workspace where this request belongs. |
| `enterprise_id` | no | string | The ID of the enterprise where this request belongs. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.apps.requests.cancel.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
