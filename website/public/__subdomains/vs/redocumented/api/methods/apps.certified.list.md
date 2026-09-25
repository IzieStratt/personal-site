# apps.certified.list

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/apps.certified.list

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `apps` | Array<{ |
| `id` | string |
| `namespace` | string |
| `app_resolution` | null |
| `is_installed` | boolean |
| `is_request_pending` | boolean |
| `has_slow_execution` | boolean |
| `requires_config` | boolean |
| `missing_required_config` | boolean |
| `config_options` | { |
| `variables` | Array<{ |
| `name` | string |
| `title` | string |
| `description` | string |
| `hint` | string |
| `min_length` | number |
| `max_length` | number |
| `is_required` | boolean |
| `is_secret` | boolean |
| `is_config_request_pending` | boolean |
| `admin_app_config` | { |
| `workflow_auth_strategy` | string |
| `profile` | { |
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
| `can_user_manage_app` | boolean |
| `is_aaa_enabled` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.certified.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
