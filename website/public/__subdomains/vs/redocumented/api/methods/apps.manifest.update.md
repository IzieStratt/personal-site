# apps.manifest.update

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.manifest.update

Update an app from an app manifest. When called with a manager app token, this method can only update apps that were created by that manager app.

## Params

| name | required | type | description |
|---|---|---|---|
| `manifest` | yes | string | A JSON app manifest encoded as a string. This manifest must use a valid app manifest schema - read our guide to creating one. As this method entirely _replaces_ any previous configuration, manifest must contain both unmodified and modified fields. |
| `app_id` | yes | string | The ID of the app whose configuration you want to update. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `app_id` | string |
| `permissions_updated` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.manifest.update.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
