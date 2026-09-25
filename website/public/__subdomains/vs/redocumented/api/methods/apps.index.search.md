# apps.index.search

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/apps.index.search

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | number |  |
| `query` | no | string |  |
| `filter` | no | number |  |
| `is_app_launcher` | no | boolean |  |
| `team_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `categories` | Array<{ |
| `id` | string |
| `name` | string |
| `display_name` | string |
| `apps` | Array<{ |
| `short_description` | string |
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
| `app_id` | string |
| `bot_id` | string |
| `bot_user_id` | string |
| `is_installed` | boolean |
| `approval_status` | string |
| `is_enterprise_resolution` | boolean |
| `slug` | string |
| `is_directory_published` | boolean |
| `is_directory_approved` | boolean |
| `is_distributed` | boolean |
| `directory_payload` | { |
| `pricing_info` | string |
| `supported_languages` | Record<string, unknown> |
| `total_apps` | number |
| `next_cursor` | string |
| `warnings` | null |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.index.search.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
