# admin.functions.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.functions.list

Look up functions by a set of apps.

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | no | string | The team context to retrieve functions from. |
| `app_ids` | yes | array | Comma-separated array of app IDs to get functions for; max 50. |
| `include_non_distributed_functions` | no | boolean | Whether to also include functions that are not yet distributed to any users in the function list. This is needed for admins that are approving an app request and will only work if the team owns the app. |
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |
| `limit` | no | integer | The number of results that will be returned by the API on each invocation. Must be between 1 and 1000, both inclusive. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `functions` | unknown[] |
| `response_metadata` | { |
| `next_cursor` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.functions.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
