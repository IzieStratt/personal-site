# search.modules.channels

- status: undocumented
- verified: existence-only
- tokens: enterprise xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/search.modules.channels

Modular channel search

## Params

| name | required | type | description |
|---|---|---|---|
| `module` | no | string |  |
| `query` | no | string |  |
| `page` | no | number |  |
| `client_req_id` | no | string |  |
| `search_session_id` | no | string |  |
| `extracts` | no | number |  |
| `highlight` | no | number |  |
| `max_extract_len` | no | number |  |
| `extra_message_data` | no | number |  |
| `no_user_profile` | no | number |  |
| `count` | no | number |  |
| `file_title_only` | no | boolean |  |
| `query_rewrite_disabled` | no | boolean |  |
| `include_files_shares` | no | number |  |
| `search_context` | no | string |  |
| `search_only_my_channels` | no | boolean |  |
| `channel_type` | no | string |  |
| `external_shared_team_ids` | no | string |  |
| `exclude_my_channels` | no | number |  |
| `request_context` | no | string |  |
| `spell_correction` | no | string |  |
| `sort` | no | string |  |
| `sort_dir` | no | string |  |
| `search_only_team` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `pagination` | { |
| `total_count` | number |
| `page` | number |
| `per_page` | number |
| `page_count` | number |
| `first` | number |
| `last` | number |
| `query` | string |
| `filters` | { |
| `in` | string[] |
| `from` | string[] |
| `ai_filters` | Record<string, unknown> |
| `manual_filters` | { |
| `module` | string |
| `items` | Array<{ |
| `id` | string |
| `name` | string |
| `iid` | string |
| `member_count` | number |
| `is_member` | boolean |
| `context_team_id` | string |
| `purpose` | { |
| `value` | string |
| `creator` | string |
| `last_set` | number |
| `timestamp` | number |
| `previous_name` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/search.modules.channels.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
