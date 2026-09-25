# apps.manifest.create

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.manifest.create

Create an app from an app manifest.

## Params

| name | required | type | description |
|---|---|---|---|
| `manifest` | yes | string | A JSON app manifest encoded as a string. This manifest must use a valid app manifest schema - read our guide to creating one. |
| `team_id` | no | string | When called with an org token, which specific team to create app on. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `app_id` | string |
| `credentials` | { |
| `client_id` | string |
| `client_secret` | string |
| `verification_token` | string |
| `signing_secret` | string |
| `oauth_authorize_url` | string |
| `team_id` | string |
| `team_domain` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.manifest.create.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
