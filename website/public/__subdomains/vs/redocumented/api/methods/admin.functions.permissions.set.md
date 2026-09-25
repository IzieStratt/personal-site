# admin.functions.permissions.set

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.functions.permissions.set

Set the visibility of a Slack function and define the users or workspaces if it is set to named_entities.

## Params

| name | required | type | description |
|---|---|---|---|
| `function_id` | yes | string | The function ID to set permissions for. |
| `visibility` | no | enum | The function visibility. |
| `user_ids` | no | array | List of user IDs to allow for named_entities visibility. |
| `permissions` | no | array | Array of permissions for the function. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.functions.permissions.set.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
