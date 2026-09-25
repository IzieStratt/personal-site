# apps.auth.external.delete

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.auth.external.delete

Delete external auth tokens only on the Slack side

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | no | string | The id of the app whose tokens you want to delete. |
| `provider_key` | no | string | The provider key of the provider whose tokens you want to delete. |
| `external_token_id` | no | string | The id of the token that you want to delete. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.auth.external.delete.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
