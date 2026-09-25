# oauth.v2.exchange

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/oauth.v2.exchange

Exchanges a legacy access token for a new expiring access token and refresh token

## Params

| name | required | type | description |
|---|---|---|---|
| `client_id` | yes | string | Issued when you created your application. |
| `client_secret` | yes | string | Issued when you created your application. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/oauth.v2.exchange.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
