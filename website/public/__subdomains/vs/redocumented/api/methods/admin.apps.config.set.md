# admin.apps.config.set

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.apps.config.set

Set the app config for a connector

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | yes | string | The encoded app ID to set the app config for. |
| `workflow_auth_strategy` | no | enum | The workflow auth permission. Can be one of builder_choice or end_user_only. |
| `rich_link_preview_type` | no | enum | Indicates the app-level override for rich link preview. Unsupported for free teams. |
| `domain_restrictions` | no | object | Domain restrictions for the app. Should be an object with two properties: urls and emails. Each is an array of strings, and each sets the allowed URLs and emails for connector authorization, respectively. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.apps.config.set.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
