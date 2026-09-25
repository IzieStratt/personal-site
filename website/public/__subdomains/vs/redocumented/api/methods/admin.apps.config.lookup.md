# admin.apps.config.lookup

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.apps.config.lookup

Look up the app config for connectors by their IDs

## Params

| name | required | type | description |
|---|---|---|---|
| `app_ids` | no | array | An array of app IDs to get app configs for. |
| `rich_link_preview_types` | no | array | return apps with the corresponding rich link preview layouts. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `configs` | Array<{ |
| `app_id` | string |
| `workflow_auth_strategy` | string |
| `domain_restrictions` | { |
| `urls` | unknown[] |
| `rich_link_preview_type` | null |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.apps.config.lookup.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
