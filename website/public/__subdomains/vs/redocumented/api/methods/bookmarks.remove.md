# bookmarks.remove

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/bookmarks.remove

Remove bookmark from the channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | no | string | Channel to remove bookmark. Required for public channels. |
| `bookmark_id` | no | string | Bookmark to remove. Required for public channels. |
| `quip_section_id` | no | string | Quip section ID to unbookmark. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/bookmarks.remove.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
