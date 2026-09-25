# views.get

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/views.get

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `view_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `view` | { |
| `id` | string |
| `team_id` | string |
| `type` | string |
| `blocks` | Array<{ |
| `block_id` | string |
| `text` | string |
| `verbatim` | boolean |
| `label` | { |
| `optional` | boolean |
| `dispatch_action` | boolean |
| `accessory` | { |
| `action_id` | string |
| `url` | string |
| `private_metadata` | string |
| `callback_id` | string |
| `state` | { |
| `values` | { |
| `question` | { |
| `value` | { |
| `channel` | { |
| `selected_conversation` | string |
| `response_url_enabled` | boolean |
| `hash` | string |
| `title` | { |
| `clear_on_close` | boolean |
| `notify_on_close` | boolean |
| `close` | { |
| `submit` | { |
| `previous_view_id` | null |
| `root_view_id` | string |
| `app_id` | string |
| `app_installed_team_id` | string |
| `bot_id` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/views.get.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
