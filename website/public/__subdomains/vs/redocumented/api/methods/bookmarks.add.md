# bookmarks.add

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/bookmarks.add

Add bookmark to a channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | no | string | Channel to add bookmark in. Required for public channels. |
| `title` | yes | string | Title for the bookmark. |
| `link` | no | string | Link to bookmark. |
| `type` | yes | string | Type of the bookmark i.e link. |
| `emoji` | no | string | Emoji tag to apply to the link. |
| `entity_id` | no | string | ID of the entity being bookmarked. Only applies to message and file types. |
| `access_level` | no | enum | The level that we are setting the file's permission to (read or write). |
| `parent_id` | no | string | Id of this bookmark's parent. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `bookmark` | { |
| `id` | string |
| `channel_id` | string |
| `title` | string |
| `link` | string |
| `icon_url` | null |
| `type` | string |
| `date_created` | number |
| `date_updated` | number |
| `rank` | string |
| `last_updated_by_user_id` | string |
| `last_updated_by_team_id` | string |
| `shortcut_id` | string |
| `app_id` | string |
| `app_action_id` | string |
| `image_url` | null |
| `date_create` | number |
| `date_update` | number |
| `parent_id` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/bookmarks.add.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
