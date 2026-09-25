# developer.apps.appLevelTokens.revoke

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/developer.apps.appLevelTokens.revoke

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | no | string |  |
| `token_id` | no | number |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `id` | number |
| `description` | string |
| `scope` | string |
| `creator_display_name` | string |
| `creator_user_id` | string |
| `date_created` | number |
| `date_revoked` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/developer.apps.appLevelTokens.revoke.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
