# users.profile.get

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/users.profile.get

Retrieve a user's profile information, including their custom status.

## Params

| name | required | type | description |
|---|---|---|---|
| `include_labels` | no | boolean | Include labels for each ID in custom profile fields. Using this parameter will heavily rate-limit your requests and is not recommended. |
| `user` | no | user | User to retrieve profile info for. |

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
| `display_alias` | string |
| `status_expiration` | number |
| `avatar_hash` | string |
| `image_original` | string |
| `is_custom_image` | boolean |
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
| `start_date` | string |
| `guest_invited_by` | string |
| `pronouns` | string |
| `ooo_message` | string |
| `who_can_share_contact_card` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.profile.get.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
