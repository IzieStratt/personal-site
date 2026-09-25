# workflows.triggers.prefs.get

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/workflows.triggers.prefs.get

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `workflow_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `trippable_by_slack_connected_teams` | { |
| `hermes_triggers_trippable_by_slack_connected_teams` | boolean |
| `hermes_triggers_trippable_by_slack_connected_teams_mcp` | string |
| `allowed_teams` | unknown[] |
| `restricted_teams` | unknown[] |
| `allowed_teams_with_3p_connectors` | unknown[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/workflows.triggers.prefs.get.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
