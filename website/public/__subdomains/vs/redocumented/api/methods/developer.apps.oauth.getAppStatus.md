# developer.apps.oauth.getAppStatus

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/developer.apps.oauth.getAppStatus

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | no | string |  |
| `scopes` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `allowlist_requests_owners` | unknown[] |
| `status` | string |
| `org_status` | string |
| `org_installer_can_install_org_app` | boolean |
| `app_has_functions` | boolean |
| `install_url_single_team` | string |
| `install_url_enterprise` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/developer.apps.oauth.getAppStatus.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
