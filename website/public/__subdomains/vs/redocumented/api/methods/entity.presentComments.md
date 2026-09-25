# entity.presentComments

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/entity.presentComments

Provide comments for work objects. Apps call this endpoint to send per-user flexpane comment data to the client.

## Params

| name | required | type | description |
|---|---|---|---|
| `comments` | yes | array | Array of comments to present to the user. See the comment schema for the full list of properties. |
| `cursor` | no | string | App supplied cursor used for pagination, will be sent in the next request for comments. |
| `can_post_comment` | no | boolean | Indicates whether the user has permissions to post comments. |
| `trigger_id` | yes | string | A reference to the original user action that initiated the request. |
| `delete_action_id` | no | string | The block action id that will be sent when a delete request is initiated for a comment. |
| `user_auth_required` | no | boolean | Set to true (or 1) to indicate that the user must authenticate to see the comments data. |
| `user_auth_url` | no | string | A custom URL to which users are directed for authentication if required. |
| `error` | no | string |  |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/entity.presentComments.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
