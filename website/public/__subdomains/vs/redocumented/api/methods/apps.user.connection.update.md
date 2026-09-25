# apps.user.connection.update

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.user.connection.update

Updates the connection status between a user and an app.

## Params

| name | required | type | description |
|---|---|---|---|
| `user_id` | yes | string | The ID of the user for the status update. |
| `status` | yes | enum | The status that should be set for the user. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.user.connection.update.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
