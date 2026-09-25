# functions.distributions.permissions.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/functions.distributions.permissions.list

List the access type of a custom slack function and include the users, team or org ids with access if its permission_type is set to named_entities

## Params

| name | required | type | description |
|---|---|---|---|
| `function_id` | no | string | The encoded ID of the function. |
| `function_callback_id` | no | string | The callback ID defined in the function's definition file. |
| `function_app_id` | no | string | The encoded ID of the app. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `distribution_type` | string |
| `permission_type` | string |
| `users` | Array<{ |
| `user_id` | string |
| `username` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/functions.distributions.permissions.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
