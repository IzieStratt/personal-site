# admin.conversations.lookup

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.lookup

Returns channels on the given team using the filters.

## Params

| name | required | type | description |
|---|---|---|---|
| `team_ids` | yes | array | Array of team IDs to filter by. |
| `max_member_count` | no | integer | Filter by public channels with member count equal to or less than the specified number. |
| `last_message_activity_before` | yes | integer | Filter by public channels where the most recent message was sent before last_message_activity. |
| `cursor` | no | string | Set cursor to next_cursor returned in the previous call, to fetch the next page. |
| `limit` | no | integer | Maximum number of results. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.lookup.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
