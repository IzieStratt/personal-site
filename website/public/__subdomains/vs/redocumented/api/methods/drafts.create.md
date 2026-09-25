# drafts.create

- status: undocumented
- verified: live-verified
- tokens: team OR enterprise xoxc/xoxd
- write-shaped name: yes, do not call without a human in the loop
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/drafts.create

Create a scheduled draft

## Params

| name | required | type | description |
|---|---|---|---|
| `blocks` | no | string |  |
| `client_msg_id` | no | string |  |
| `attachments` | no | string |  |
| `destinations` | no | string |  |
| `file_ids` | no | string |  |
| `unfurl` | no | string |  |
| `is_from_composer` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `draft` | { |
| `id` | string |
| `date_created` | number |
| `user_id` | string |
| `team_id` | string |
| `last_updated_ts` | string |
| `last_updated_client` | string |
| `blocks` | Array<{ |
| `type` | string |
| `block_id` | string |
| `file_ids` | string[] |
| `is_from_composer` | boolean |
| `is_deleted` | boolean |
| `is_sent` | boolean |
| `client_msg_id` | string |
| `date_scheduled` | number |
| `destinations` | Array<{ |
| `channel_id` | string |
| `thread_ts` | string |
| `broadcast` | boolean |
| `user_ids` | string[] |
| `unfurl` | Array<{ |
| `url` | string |
| `files` | Array<{ |
| `created` | number |
| `timestamp` | number |
| `name` | string |
| `title` | string |
| `mimetype` | string |
| `filetype` | string |
| `pretty_type` | string |
| `user` | string |
| `user_team` | string |
| `size` | number |
| `mode` | string |
| `is_external` | boolean |
| `is_public` | boolean |
| `public_url_shared` | boolean |
| `display_as_bot` | boolean |
| `username` | string |
| `url_private` | string |
| `url_private_download` | string |
| `media_display_type` | string |
| `thumb_64` | string |
| `thumb_80` | string |
| `thumb_360` | string |
| `thumb_360_w` | number |
| `thumb_360_h` | number |
| `thumb_480` | string |
| `thumb_480_w` | number |
| `thumb_480_h` | number |
| `thumb_160` | string |
| `original_w` | number |
| `original_h` | number |
| `thumb_tiny` | string |
| `permalink` | string |
| `permalink_public` | string |
| `comments_count` | number |
| `is_starred` | boolean |
| `shares` | Record<string, unknown> |
| `channels` | unknown[] |
| `groups` | unknown[] |
| `ims` | unknown[] |
| `has_more_shares` | boolean |
| `has_rich_preview` | boolean |
| `file_access` | string |
| `thumb_720` | string |
| `thumb_720_w` | number |
| `thumb_720_h` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/drafts.create.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
