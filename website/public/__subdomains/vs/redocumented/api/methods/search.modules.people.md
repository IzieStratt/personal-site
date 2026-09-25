# search.modules.people

- status: undocumented
- verified: existence-only
- tokens: enterprise xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/search.modules.people

Modular people search

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
| `tz` | no | string |  |
| `external_shared_team_ids` | no | string |  |
| `custom_fields` | no | string |  |
| `hide_deactivated_users` | no | number |  |
| `request_context` | no | string |  |
| `spell_correction` | no | string |  |
| `sort` | no | string |  |
| `sort_dir` | no | string |  |
| `search_only_team` | no | string |  |
| `profile_location` | no | string |  |
| `profile_title` | no | string |  |
| `profile_division` | no | string |  |
| `profile_department` | no | string |  |
| `profile_celebration` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `query` | string |
| `filters` | { |
| `in` | string[] |
| `from` | string[] |
| `ai_filters` | Record<string, unknown> |
| `manual_filters` | { |
| `module` | string |
| `items` | Array<{ |
| `iid` | string |
| `id` | string |
| `profile` | { |
| `title` | Array<{ |
| `phone` | string |
| `skype` | string |
| `real_name` | string |
| `real_name_normalized` | string |
| `display_name` | string |
| `display_name_normalized` | string |
| `fields` | Record<ProfileFieldId, { |
| `value` | string |
| `alt` | string |
| `status_text` | string |
| `status_emoji` | string |
| `status_emoji_display_info` | Array<{ |
| `display_url` | string |
| `display_alias` | string |
| `unicode` | string |
| `status_expiration` | number |
| `avatar_hash` | string |
| `first_name` | string |
| `last_name` | string |
| `image_24` | string |
| `image_32` | string |
| `image_48` | string |
| `image_72` | string |
| `image_192` | string |
| `image_512` | string |
| `status_text_canonical` | string |
| `team` | string |
| `start_date` | string |
| `image_original` | string |
| `is_custom_image` | boolean |
| `huddle_state` | string |
| `huddle_state_expiration_ts` | number |
| `image_1024` | string |
| `pronouns` | string |
| `guest_invited_by` | string |
| `ooo_message` | string |
| `who_can_share_contact_card` | string |
| `username` | string |
| `is_restricted` | boolean |
| `is_ultra_restricted` | boolean |
| `timestamp` | number |
| `top_terms` | boolean |
| `similar` | boolean |
| `pagination` | { |
| `total_count` | number |
| `page` | number |
| `per_page` | number |
| `page_count` | number |
| `first` | number |
| `last` | number |
| `filter_suggestions` | { |
| `facet_count` | number |
| `checked` | boolean |
| `department` | Array<{ |
| `location` | Array<{ |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/search.modules.people.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
