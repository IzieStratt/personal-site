# features.access.policies.list

- status: undocumented
- verified: live-verified
- tokens: team xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/features.access.policies.list

Feature-flag/entitlement access policies

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `feature_policies` | { |
| `analytics_all_channels_in_org__view` | { |
| `is_enabled` | boolean |
| `reason` | string |
| `name` | string |
| `canvas_standalone__edit` | { |
| `canvas_standalone__create` | { |
| `canvas_channel__delete` | { |
| `canvas_channel__edit` | { |
| `canvas_channel__create` | { |
| `canvas_huddle__edit` | { |
| `canvas_huddle__create` | { |
| `webhook_trigger__create` | { |
| `workflow_connector__use` | { |
| `rosi_app__create` | { |
| `hermes__write` | { |
| `hermes__read` | { |
| `trigger__trip` | { |
| `workflow_custom_steps__use` | { |
| `workflow_conditional_steps__use` | { |
| `workflow_repeater_steps__use` | { |
| `slack_ai__access` | { |
| `slack_ai_exclude_from_slack_ai_property__access` | { |
| `huddle__start` | { |
| `user_groups__manage` | { |
| `slack_connect_dm__access` | { |
| `slack_connect_channel__access` | { |
| `salesforce__access` | { |
| `salesforce_multi_org__access` | { |
| `salesforce_standalone_lists__access` | { |
| `salesforce_seamless_auth__access` | { |
| `salesforce_data_fields__access` | { |
| `salesforce_org_slack_first_crm__access` | { |
| `slack_ai_apps_assistant_view__access` | { |
| `audit_log__access` | { |
| `audit_log_addon__access` | { |
| `discovery_api__access` | { |
| `discovery_api_addon__access` | { |
| `manage_channel_posting__access` | { |
| `search_query_audit__access` | { |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/features.access.policies.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
