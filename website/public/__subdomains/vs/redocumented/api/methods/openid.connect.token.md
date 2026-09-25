# openid.connect.token

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/openid.connect.token

Exchanges a temporary OAuth verifier code for an access token for Sign in with Slack.

## Params

| name | required | type | description |
|---|---|---|---|
| `client_id` | no | string | Issued when you created your application. |
| `client_secret` | no | string | Issued when you created your application. |
| `code` | no | string | The code param returned via the OAuth callback. |
| `redirect_uri` | no | string | This must match the originally submitted URI (if one was sent). |
| `grant_type` | no | enum | The grant_type param as described in the OAuth spec. |
| `refresh_token` | no | string | The refresh_token param as described in the OAuth spec. |
| `code_verifier` | no | string | PKCE code verifier (RFC 7636). Required when the authorization request included a code_challenge. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "access_token": "xoxp-1234",
    "token_type": "Bearer",
    "id_token": "eyJhbGcMjY5OTA2MzcWNrLmNvbVwvdGVhbV9p..."
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/openid.connect.token.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
