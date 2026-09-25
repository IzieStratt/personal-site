# developer.apps.events.subscriptions.updateSubs

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/developer.apps.events.subscriptions.updateSubs

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `app` | no | string |  |
| `url` | no | string |  |
| `app_event_types` | no | string |  |
| `bot_event_types` | no | string |  |
| `enable` | no | boolean |  |
| `unfurl_domains` | no | string |  |
| `is_delayed_events_enabled` | no | boolean |  |
| `filter_teams` | no | string |  |
| `set_active` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `url` | string |
| `url_verified` | boolean |
| `app_event_types` | string[] |
| `bot_event_types` | string[] |
| `filter_teams` | unknown[] |
| `is_active` | boolean |
| `unfurl_domains` | string[] |
| `is_delayed_events_enabled` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/developer.apps.events.subscriptions.updateSubs.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
