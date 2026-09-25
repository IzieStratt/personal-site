# admin.apps.search

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/admin.apps.search

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `query` | no | string |  |
| `legacy_integrations` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `apps` | Array<{ |
| `id` | string |
| `name` | string |
| `description` | string |
| `help_url` | string |
| `privacy_policy_url` | string |
| `app_homepage_url` | string |
| `app_directory_url` | string |
| `is_granular_bot_app` | boolean |
| `is_app_directory_approved` | boolean |
| `is_internal` | boolean |
| `developer_type` | string |
| `socket_mode_enabled` | boolean |
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
| `additional_info` | string |
| `date_create` | number |
| `functions` | Array<{ |
| `callback_id` | string |
| `title` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.apps.search.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
