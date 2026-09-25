# users.admin.fetchTeamUsers

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/users.admin.fetchTeamUsers

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `count` | no | number |  |
| `include_bots` | no | number |  |
| `exclude_slackbot` | no | boolean |  |
| `include_deleted` | no | number |  |
| `sort_dir` | no | string |  |
| `sort` | no | string |  |
| `target_team` | no | string |  |
| `query` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `items` | Array<{ |
| `id` | string |
| `team_id` | string |
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
| `image_original` | string |
| `is_custom_image` | boolean |
| `image_1024` | string |
| `start_date` | string |
| `is_admin` | boolean |
| `is_owner` | boolean |
| `is_primary_owner` | boolean |
| `is_restricted` | boolean |
| `is_ultra_restricted` | boolean |
| `is_bot` | boolean |
| `is_app_user` | boolean |
| `updated` | number |
| `is_email_confirmed` | boolean |
| `has_2fa` | boolean |
| `who_can_share_contact_card` | string |
| `created` | number |
| `is_inactive` | number |
| `app_count` | number |
| `username_is_editable` | boolean |
| `two_factor_auth_enabled` | boolean |
| `is_invited_email_bounced` | boolean |
| `is_auto_provisioned` | boolean |
| `is_invited_user` | boolean |
| `teams` | unknown[] |
| `num_found` | number |
| `next_cursor_mark` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.admin.fetchTeamUsers.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
