# bookmarks.list

- status: undocumented
- verified: partial
- tokens: session xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/bookmarks.list

List channel bookmarks (also may be official)

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | no | string | Channel to list bookmarks in. Required for public channels. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `bookmarks` | Array<{ |
| `id` | string |
| `channel_id` | string |
| `title` | string |
| `link` | string |
| `icon_url` | string |
| `type` | string |
| `date_created` | number |
| `date_updated` | number |
| `rank` | string |
| `last_updated_by_user_id` | string |
| `last_updated_by_team_id` | string |
| `shortcut_id` | string |
| `app_id` | string |
| `app_action_id` | string |
| `image_url` | string |
| `date_create` | number |
| `date_update` | number |
| `parent_id` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/bookmarks.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
