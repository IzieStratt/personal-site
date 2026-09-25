# admin.apps.approve

- status: documented
- verified: docs-only (live-tested 2026-09-20, only error paths observed)
- tokens: Live-tested 2026-09-20 with app_id, request_id, team_id, and enterprise_id in various combinations, both team- and enterprise-scoped xoxc: every combination returned either team_not_found or not_an_admin, never ok:true. not_an_admin is the interesting one -- a plain statement that this account, despite an Organization-level authenticated CLI session, is not an actual admin for this governance action. Contrast with admin.apps.uninstall, which succeeded for the same account. See methods/admin-write-scope-2026-09.md.
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.apps.approve

Approve an app for installation on a workspace.

## Params

| name | required | type | description |
|---|---|---|---|
| `allow_child_auto_install` | no | boolean | Auto-create an Admin-Approved App automation rule that pre-approves future child app installs from this manager app. |
| `app_id` | no | string | The id of the app to approve. |
| `request_id` | no | string | The id of the request to approve. |
| `team_id` | no | string | The ID of the workspace to approve the app on. |
| `enterprise_id` | no | string | The ID of the enterprise to approve the app on. |
| `user_scopes` | no | string | User scopes to approve for the app. |
| `bot_scopes` | no | string | Bot scopes to approve for the app. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.apps.approve.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
