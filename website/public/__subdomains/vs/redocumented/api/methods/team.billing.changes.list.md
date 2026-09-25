# team.billing.changes.list

- status: undocumented
- verified: not-live-tested (source-only, typed but unverified)
- tokens: unknown
- write-shaped name: no
- source: ImShyMike/slack-undoc-client (generated types); see methods/slack-undoc-client-2026.md
- call: POST https://slack.com/api/team.billing.changes.list

params per slack-undoc-client generated types: page?: number;

## Params

| name | required | type | description |
|---|---|---|---|
| `page` | no | number |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `changes` | Array<{ |
| `statelog` | { |
| `id` | number |
| `date_create` | number |
| `user_info` | { |
| `user` | string |
| `username` | string |
| `user_profile` | { |
| `title` | string |
| `phone` | string |
| `skype` | string |
| `real_name` | string |
| `real_name_normalized` | string |
| `display_name` | string |
| `display_name_normalized` | string |
| `fields` | Record<string, unknown> |
| `status_text` | string |
| `status_emoji` | string |
| `status_emoji_display_info` | unknown[] |
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
| `image_original` | string |
| `is_custom_image` | boolean |
| `image_1024` | string |
| `pagination` | { |
| `total_count` | number |
| `page` | number |
| `per_page` | number |
| `page_count` | number |
| `first` | number |
| `last` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/team.billing.changes.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
