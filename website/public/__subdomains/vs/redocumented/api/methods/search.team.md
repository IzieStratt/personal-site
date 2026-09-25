# search.team

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/search.team

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `query` | no | string |  |
| `count` | no | number |  |
| `include_usergroups` | no | number |  |
| `include_guest_expiration_date` | no | boolean |  |
| `include_team_context` | no | number |  |
| `include_deleted` | no | number |  |
| `include_bots` | no | number |  |
| `set_active` | no | boolean |  |
| `ignore_guest_accounts` | no | number |  |
| `include_invited` | no | number |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `items` | Array<{ |
| `id` | string |
| `name` | string |
| `deleted` | boolean |
| `color` | string |
| `real_name` | string |
| `tz` | string |
| `tz_label` | string |
| `tz_offset` | number |
| `profile` | { |
| `title` | string |
| `phone` | string |
| `skype` | string |
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
| `team` | string |
| `is_admin` | boolean |
| `is_owner` | boolean |
| `is_primary_owner` | boolean |
| `is_restricted` | boolean |
| `is_ultra_restricted` | boolean |
| `is_bot` | boolean |
| `is_app_user` | boolean |
| `updated` | number |
| `is_email_confirmed` | boolean |
| `who_can_share_contact_card` | string |
| `guest_expiration` | number |
| `teams` | unknown[] |
| `num_found` | number |
| `next_cursor_mark` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/search.team.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
