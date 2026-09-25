# users.list

- status: documented
- verified: live-verified
- tokens: Live-verified 2026-09-25: with an org-level xoxb, team_id is required (missing_argument, arg: team_id). See methods/grid-admin-sandbox-2026-09.md.
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/users.list

Lists all users in a Slack team.

## Params

| name | required | type | description |
|---|---|---|---|
| `cursor` | no | string | Paginate through collections of data by setting the cursor parameter to a next_cursor attribute returned by a previous request's response_metadata. Default value fetches the first "page" of the collection. See pagination for more detail. |
| `include_locale` | no | boolean | Set this to true to receive the locale for users. Defaults to false. |
| `limit` | no | number | The maximum number of items to return. Fewer than the requested number of items may be returned, even if the end of the users list hasn't been reached. Providing no limit value will result in Slack attempting to deliver you the entire result set. If the collection is too large you may experience limit_required or HTTP 500 errors. |
| `team_id` | no | string | encoded team id to list users in, required if org token is used. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `members` | Array<{ |
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
| `who_can_share_contact_card` | string |
| `profile` | { |
| `display_name` | string |
| `avatar_hash` | string |
| `real_name_normalized` | string |
| `display_name_normalized` | string |
| `team` | string |
| `title` | string |
| `phone` | string |
| `skype` | string |
| `fields` | Record<string, unknown> |
| `status_text` | string |
| `status_text_canonical` | string |
| `status_emoji` | string |
| `status_emoji_display_info` | unknown[] |
| `status_expiration` | number |
| `always_active` | boolean |
| `image_original` | string |
| `is_custom_image` | boolean |
| `has_2fa` | boolean |
| `cache_ts` | number |
| `response_metadata` | { |
| `next_cursor` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
