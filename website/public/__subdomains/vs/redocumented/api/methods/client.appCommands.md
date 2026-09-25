# client.appCommands

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/client.appCommands

(inferred from name only; see methods/datamine-2026-09.md)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `app_actions` | Array<{ |
| `app_id` | string |
| `app_name` | string |
| `team_id` | string |
| `icons` | { |
| `image_32` | string |
| `image_48` | string |
| `image_64` | string |
| `image_72` | string |
| `actions` | Array<{ |
| `action_id` | string |
| `name` | string |
| `desc` | string |
| `description` | string |
| `payload` | null |
| `callback_id` | string |
| `type` | string |
| `teams` | string[] |
| `is_enterprise_install` | boolean |
| `commands` | Array<{ |
| `canonical_name` | string |
| `usage` | string |
| `name_normalized` | string |
| `is_workspace_agnostic` | boolean |
| `alias_of` | string |
| `alias_of_normalized` | string |
| `cache_ts` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/client.appCommands.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
