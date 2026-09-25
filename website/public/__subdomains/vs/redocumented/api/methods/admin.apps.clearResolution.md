# admin.apps.clearResolution

- status: documented
- verified: live-verified
- tokens: Live-verified 2026-09-25 with a real admin xoxp: app_id + team_id ok, undoes admin.apps.restrict. See methods/grid-admin-sandbox-2026-09.md.
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.apps.clearResolution

Clear an app resolution

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | yes | string | The id of the app whose resolution you want to clear/undo. |
| `team_id` | no | string | The workspace to clear the app resolution from. |
| `enterprise_id` | no | string | The enterprise to clear the app resolution from. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.apps.clearResolution.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
