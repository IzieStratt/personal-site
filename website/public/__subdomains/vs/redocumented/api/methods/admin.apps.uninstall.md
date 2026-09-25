# admin.apps.uninstall

- status: documented
- verified: live-verified
- tokens: Live-verified 2026-09-20: team-scoped xoxc + team_id (singular -- not the documented team_ids) got ok:true against a real app in this account's own workspace. Enterprise-scoped xoxc + enterprise_id got permission_denied on the same account/app -- a real per-identity permission check, distinct from the usual team_is_restricted/enterprise_is_restricted Grid-routing split (this account's enterprise xoxc works fine on other org-wide methods). See auth-and-tokens.md 'admin.* is not uniformly org-scoped' and methods/admin-write-scope-2026-09.md. | Live-verified 2026-09-25 with a real admin xoxp (admin.apps:write) on a Grid sandbox: team_ids works for workspace-level installs, but an org-deployed app gives must_revoke_access; enterprise_id then succeeds (unlike the enterprise xoxc's permission_denied). Rate-limits after roughly ten calls in a few minutes. See methods/grid-admin-sandbox-2026-09.md.
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.apps.uninstall

Uninstall an app from one or many workspaces, or an entire enterprise organization.

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | yes | string | The ID of the app to uninstall. |
| `team_ids` | no | string | IDs of the teams to uninstall from (max 100). With an org-level token, this or enterprise_id is required. |
| `enterprise_id` | no | string | The enterprise to completely uninstall the application from (across all workspaces). With an org-level token, this or team_ids is required. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified) -- confirmed live 2026-09-20, body was exactly {"ok": true}, no extra fields.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.apps.uninstall.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
