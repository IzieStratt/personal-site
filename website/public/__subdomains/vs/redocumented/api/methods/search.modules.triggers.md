# search.modules.triggers

- status: undocumented
- verified: not-live-tested (source-only, typed but unverified)
- tokens: unknown
- write-shaped name: no
- source: ImShyMike/slack-undoc-client (generated types); see methods/slack-undoc-client-2026.md
- call: POST https://slack.com/api/search.modules.triggers

params per slack-undoc-client generated types: module?: string; query?: string; page?: number; client_req_id?: string; browse_session_id?: string; extracts?: number; highlight?: number; extra_message_data?: number; no_user_profile?: number; count?: number; file_title_only?: boolean; query_rewrite_disabled?: boolean; include_files_shares?: number; browse?: string; search_context?: string; max_filter_suggestions?: number; sort?: string; sort_dir?: string; search_only_my_apps?: boolean; strict_exposure_rules?: number; trigger_types?: string;

## Params

| name | required | type | description |
|---|---|---|---|
| `module` | no | string |  |
| `query` | no | string |  |
| `page` | no | number |  |
| `client_req_id` | no | string |  |
| `browse_session_id` | no | string |  |
| `extracts` | no | number |  |
| `highlight` | no | number |  |
| `extra_message_data` | no | number |  |
| `no_user_profile` | no | number |  |
| `count` | no | number |  |
| `file_title_only` | no | boolean |  |
| `query_rewrite_disabled` | no | boolean |  |
| `include_files_shares` | no | number |  |
| `browse` | no | string |  |
| `search_context` | no | string |  |
| `max_filter_suggestions` | no | number |  |
| `sort` | no | string |  |
| `sort_dir` | no | string |  |
| `search_only_my_apps` | no | boolean |  |
| `strict_exposure_rules` | no | number |  |
| `trigger_types` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `items` | Array<{ |
| `id` | string |
| `inputs` | Record<WorkflowTriggerId, { |
| `value` | string |
| `locked` | boolean |
| `hidden` | boolean |
| `outputs` | Record<string, { |
| `type` | string |
| `name` | string |
| `title` | string |
| `is_required` | boolean |
| `description` | string |
| `available_data` | Record<string, { |
| `date_created` | number |
| `date_updated` | number |
| `owning_team_id` | string |
| `subtype` | string |
| `share_url` | string |
| `channel_ids` | string[] |
| `workflow` | { |
| `callback_id` | string |
| `input_parameters` | Array<{ |
| `output_parameters` | unknown[] |
| `product_level_availability` | { |
| `is_available` | boolean |
| `available_to` | string |
| `category_id` | string |
| `category_label` | string |
| `app_id` | string |
| `app` | { |
| `icons` | { |
| `image_32` | string |
| `image_48` | string |
| `image_64` | string |
| `image_72` | string |
| `is_workflow_app` | boolean |
| `sales_home_workflow_app_type` | number |
| `date_released` | number |
| `date_deleted` | number |
| `form_enabled` | boolean |
| `workflow_id` | string |
| `filter` | { |
| `root` | { |
| `statement` | string |
| `version` | number |
| `pagination` | { |
| `total_count` | number |
| `page` | number |
| `per_page` | number |
| `page_count` | number |
| `first` | number |
| `last` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/search.modules.triggers.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
