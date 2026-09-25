# entity.acknowledgeCommentAction

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/entity.acknowledgeCommentAction

Acknowledge a comment mutation (edit, delete, or post) on a work object entity. Apps call this endpoint to confirm they have processed a comment action, and the backend emits a dedicated RTM event to the user.

## Params

| name | required | type | description |
|---|---|---|---|
| `trigger_id` | yes | string | A reference to the original user action that initiated the comment mutation. |
| `comment` | no | object | The full comment data. Required for edit and post actions. See the comment schema for the full list of properties. |
| `error` | no | string | Error message if the action failed in the app. When present, signals that the mutation could not be completed. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/entity.acknowledgeCommentAction.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
