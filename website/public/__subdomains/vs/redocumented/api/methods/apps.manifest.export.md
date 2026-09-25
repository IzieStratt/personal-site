# apps.manifest.export

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.manifest.export

Export an app manifest from an existing app. When called with a manager app token, this method can only export apps that were created by that manager app.

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | yes | string | The ID of the app whose configuration you want to export as a manifest. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `manifest` | { |
| `display_information` | { |
| `name` | string |
| `description` | string |
| `background_color` | string |
| `long_description` | string |
| `features` | { |
| `app_home` | { |
| `home_tab_enabled` | boolean |
| `messages_tab_enabled` | boolean |
| `messages_tab_read_only_enabled` | boolean |
| `bot_user` | { |
| `display_name` | string |
| `always_online` | boolean |
| `unfurl_domains` | string[] |
| `rich_previews` | { |
| `is_active` | boolean |
| `oauth_config` | { |
| `redirect_urls` | string[] |
| `scopes` | { |
| `user` | string[] |
| `bot` | string[] |
| `settings` | { |
| `org_deploy_enabled` | boolean |
| `socket_mode_enabled` | boolean |
| `token_rotation_enabled` | boolean |
| `allowed_ip_address_ranges` | string[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.manifest.export.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
