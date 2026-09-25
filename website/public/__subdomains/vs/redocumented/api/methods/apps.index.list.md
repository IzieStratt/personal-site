# apps.index.list

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/apps.index.list

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | number |  |
| `filter` | no | number |  |
| `is_app_launcher` | no | boolean |  |
| `team_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `total_apps_installed` | number |
| `categories` | Array<{ |
| `id` | string |
| `name` | string |
| `display_name` | string |
| `apps` | Array<{ |
| `short_description` | string |
| `app_id` | string |
| `bot_id` | string |
| `bot_user_id` | string |
| `icons` | { |
| `image_32` | string |
| `image_36` | string |
| `image_48` | string |
| `image_64` | string |
| `image_72` | string |
| `image_96` | string |
| `image_128` | string |
| `image_192` | string |
| `image_512` | string |
| `image_1024` | string |
| `is_installed` | boolean |
| `slug` | string |
| `is_directory_approved` | boolean |
| `is_directory_published` | boolean |
| `is_distributed` | boolean |
| `directory_payload` | { |
| `pricing_info` | string |
| `supported_languages` | Record<string, unknown> |
| `total_apps` | number |
| `next_cursor` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.index.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
