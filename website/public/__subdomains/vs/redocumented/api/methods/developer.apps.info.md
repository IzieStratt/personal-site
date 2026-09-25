# developer.apps.info

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/developer.apps.info

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `app` | { |
| `id` | string |
| `team_id` | string |
| `directory_app_id` | null |
| `client_id` | string |
| `date_created` | number |
| `date_deleted` | number |
| `app_type` | string |
| `user_install_count` | number |
| `team_install_count` | number |
| `is_directory_approved` | boolean |
| `is_ai_app` | boolean |
| `is_mcp_enabled` | boolean |
| `is_directory_published` | boolean |
| `display_information` | { |
| `name` | string |
| `short_description` | string |
| `long_description` | string |
| `background_color` | string |
| `youtube_url` | null |
| `categories` | unknown[] |
| `landing_page_url` | string |
| `privacy_policy_url` | null |
| `support_url` | string |
| `support_email` | null |
| `supported_languages` | unknown[] |
| `pricing_info` | null |
| `screenshots` | unknown[] |
| `icons` | { |
| `image_32` | null |
| `image_36` | null |
| `image_64` | null |
| `image_72` | null |
| `image_96` | null |
| `image_128` | null |
| `image_192` | null |
| `image_512` | null |
| `image_1024` | null |
| `image_original` | null |
| `direct_install` | { |
| `is_active` | boolean |
| `url` | null |
| `contact_information` | { |
| `developer_name` | null |
| `developer_email` | null |
| `developer_phone_number` | null |
| `notification_channel_id` | null |
| `collaborator_user_ids` | string[] |
| `redirect_urls` | string[] |
| `scopes` | { |
| `user` | string[] |
| `bot` | string[] |
| `slash_commands` | Array<{ |
| `request_url` | null |
| `description` | string |
| `usage_hint` | string |
| `should_escape` | boolean |
| `interactive_components` | { |
| `message_menu_options_url` | null |
| `app_actions` | unknown[] |
| `is_user_id_translation_enabled` | boolean |
| `is_org_ready` | boolean |
| `is_hosted` | boolean |
| `is_distributed` | boolean |
| `is_privately_distributed` | boolean |
| `is_installed` | boolean |
| `ip_whitelist` | string[] |
| `security_compliance_information` | { |
| `data_center_location` | unknown[] |
| `is_link_enabled` | boolean |
| `bot_user` | { |
| `username` | string |
| `real_name` | string |
| `always_active` | boolean |
| `app_home` | { |
| `beta_opted_in` | boolean |
| `home_tab_enabled` | boolean |
| `messages_tab_disabled` | boolean |
| `messages_tab_read_only_enabled` | boolean |
| `workflow_extensions` | null |
| `use_oauth2_refresh_tokens` | boolean |
| `use_token_management` | boolean |
| `betas_enabled` | unknown[] |
| `test_information` | { |
| `test_account_details` | null |
| `developer_overall_notes` | null |
| `video_demo_url` | null |
| `hermes_app_type` | number |
| `runtime` | string |
| `use_context_team` | boolean |
| `pkce_enabled` | boolean |
| `is_in_developer_sandbox` | boolean |
| `assistant_description` | null |
| `assistant_suggested_prompts` | null |
| `rich_previews` | { |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/developer.apps.info.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
