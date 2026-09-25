# auth.revoke

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/auth.revoke

Revokes a token.

## Params

| name | required | type | description |
|---|---|---|---|
| `test` | no | boolean | Setting this parameter to 1 triggers a _testing mode_ where the specified token will not actually be revoked. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `revoked` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/auth.revoke.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
