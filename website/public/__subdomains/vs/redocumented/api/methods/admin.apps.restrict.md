# admin.apps.restrict

- status: documented
- verified: live-verified
- tokens: Live-verified 2026-09-25 with a real admin xoxp: app_id + team_id ok (shows up in admin.apps.restricted.list for that team). request_id + team_id is checked (invalid_request_id for a fake ID) -- this is how to deny a pending request. Doesn't stop admins installing the app. See methods/grid-admin-sandbox-2026-09.md.
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.apps.restrict

Restrict an app for installation on a workspace.

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | no | string | The id of the app to restrict. |
| `request_id` | no | string | The id of the request to restrict. |
| `team_id` | no | string | The ID of the workspace to approve the app on. |
| `enterprise_id` | no | string | The ID of the enterprise to approve the app on. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.apps.restrict.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
