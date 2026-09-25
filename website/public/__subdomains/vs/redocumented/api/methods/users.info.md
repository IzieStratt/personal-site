# users.info

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/users.info

Gets information about a user.

## Params

| name | required | type | description |
|---|---|---|---|
| `include_locale` | no | boolean | Set this to true to receive the locale for this user. Defaults to false. |
| `user` | no | user | User to get info on. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `user` | { |
| `id` | string |
| `name` | string |
| `is_bot` | boolean |
| `updated` | number |
| `is_app_user` | boolean |
| `team_id` | string |
| `deleted` | boolean |
| `color` | string |
| `is_email_confirmed` | boolean |
| `real_name` | string |
| `tz` | string |
| `tz_label` | string |
| `tz_offset` | number |
| `is_admin` | boolean |
| `is_owner` | boolean |
| `is_primary_owner` | boolean |
| `is_restricted` | boolean |
| `is_ultra_restricted` | boolean |
| `has_2fa` | boolean |
| `who_can_share_contact_card` | string |
| `profile` | { |
| `display_name` | string |
| `avatar_hash` | string |
| `real_name_normalized` | string |
| `display_name_normalized` | string |
| `image_24` | string |
| `image_32` | string |
| `image_48` | string |
| `image_72` | string |
| `image_192` | string |
| `image_512` | string |
| `image_1024` | string |
| `image_original` | string |
| `is_custom_image` | boolean |
| `first_name` | string |
| `last_name` | string |
| `team` | string |
| `title` | string |
| `pronouns` | string |
| `phone` | string |
| `skype` | string |
| `fields` | Record<ProfileFieldId, { |
| `value` | string |
| `alt` | string |
| `status_text` | string |
| `status_text_canonical` | string |
| `status_emoji` | string |
| `status_emoji_display_info` | Array<{ |
| `display_url` | string |
| `unicode` | string |
| `status_expiration` | number |
| `guest_invited_by` | string |
| `huddle_state` | string |
| `huddle_state_expiration_ts` | number |
| `start_date` | string |
| `ooo_message` | string |
| `huddle_state_call_id` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.info.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
