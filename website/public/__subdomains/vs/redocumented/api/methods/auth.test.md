# auth.test

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/auth.test

Checks authentication & identity.

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `url` | string |
| `team` | string |
| `user` | string |
| `team_id` | string |
| `user_id` | string |
| `is_enterprise_install` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/auth.test.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
