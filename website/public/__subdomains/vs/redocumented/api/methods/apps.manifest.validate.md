# apps.manifest.validate

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.manifest.validate

Validate an app manifest

## Params

| name | required | type | description |
|---|---|---|---|
| `manifest` | yes | string | The manifest to be validated. Will be validated against the app manifest schema - read our guide. |
| `app_id` | no | string | The ID of the app whose configuration you want to validate. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.manifest.validate.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
