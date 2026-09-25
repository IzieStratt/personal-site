# functions.distributions.permissions.set

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/functions.distributions.permissions.set

Set the access type of a custom slack function and define the users, team or org ids to be granted access if permission_type is set to named_entities

## Params

| name | required | type | description |
|---|---|---|---|
| `function_id` | no | string | The encoded ID of the function. |
| `function_callback_id` | no | string | The callback ID defined in the function's definition file. |
| `function_app_id` | no | string | The encoded ID of the app. |
| `permission_type` | no | enum | The type of permission that defines how the function can be distributed. |
| `user_ids` | no | array | List of encoded user IDs. |
| `team_ids` | no | array | List of team IDs to allow for named_entities permission. |
| `org_ids` | no | array | List of org IDs to allow for named_entities permission. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `distribution_type` | string |
| `permission_type` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/functions.distributions.permissions.set.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
