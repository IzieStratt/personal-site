# users.profile.set

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/users.profile.set

Set a user's profile information, including custom status.

## Params

| name | required | type | description |
|---|---|---|---|
| `name` | no | string | Name of a single key to set. Usable only if profile is not passed. |
| `profile` | no | string | Collection of key:value pairs presented as a URL-encoded JSON hash. At most 50 fields may be set. Each field name is limited to 255 characters. |
| `user` | no | user | ID of user to change. This argument may only be specified by admins on paid teams. |
| `value` | no | string | Value to set a single key to. Usable only if profile is not passed. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `profile` | { |
| `title` | string |
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
| `unicode` | string |
| `status_expiration` | number |
| `avatar_hash` | string |
| `start_date` | string |
| `ooo_message` | string |
| `guest_invited_by` | string |
| `image_original` | string |
| `is_custom_image` | boolean |
| `pronouns` | string |
| `who_can_share_contact_card` | string |
| `huddle_state` | string |
| `huddle_state_expiration_ts` | number |
| `first_name` | string |
| `last_name` | string |
| `image_24` | string |
| `image_32` | string |
| `image_48` | string |
| `image_72` | string |
| `image_192` | string |
| `image_512` | string |
| `image_1024` | string |
| `status_text_canonical` | string |
| `username` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.profile.set.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
