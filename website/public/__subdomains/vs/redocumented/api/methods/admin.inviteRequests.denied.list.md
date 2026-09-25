# admin.inviteRequests.denied.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.inviteRequests.denied.list

List all denied workspace invite requests.

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | no | string | ID for the workspace where the invite requests were made. |
| `cursor` | no | string | Value of the next_cursor field sent as part of the previous api response. |
| `limit` | no | integer | The number of results that will be returned by the API on each invocation. Must be between 1 - 1000 both inclusive. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.inviteRequests.denied.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
