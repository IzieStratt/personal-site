# search.enterprise

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/search.enterprise

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `count` | no | number |  |
| `query` | no | string |  |
| `sort` | no | string |  |
| `ignore_guest_accounts` | no | boolean |  |
| `include_bots` | no | boolean |  |
| `include_dangling` | no | boolean |  |
| `include_deleted` | no | number |  |
| `include_team_context` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `teams` | Array<{ |
| `id` | string |
| `name` | string |
| `url` | string |
| `domain` | string |
| `avatar_base_url` | string |
| `is_verified` | boolean |
| `icon` | { |
| `image_default` | boolean |
| `image_34` | string |
| `image_44` | string |
| `image_68` | string |
| `image_88` | string |
| `image_102` | string |
| `image_230` | string |
| `image_132` | string |
| `discoverable` | string |
| `items` | Array<{ |
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
| `fields` | Record<ProfileFieldId, { |
| `value` | string |
| `alt` | string |
| `status_text` | string |
| `status_emoji` | string |
| `status_emoji_display_info` | Array<{ |
| `display_url` | string |
| `unicode` | string |
| `display_alias` | string |
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
| `guest_invited_by` | string |
| `image_original` | string |
| `is_custom_image` | boolean |
| `image_1024` | string |
| `start_date` | string |
| `huddle_state` | string |
| `huddle_state_expiration_ts` | number |
| `pronouns` | string |
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
| `is_invited_user` | boolean |
| `num_found` | number |
| `next_cursor_mark` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/search.enterprise.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
