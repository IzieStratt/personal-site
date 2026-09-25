# oauth.v2.user.access

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/oauth.v2.user.access

Exchanges a temporary OAuth verifier code for a user access token.

## Params

| name | required | type | description |
|---|---|---|---|
| `client_id` | no | string | Issued when you created your application. If possible, avoid sending client_id and client_secret as parameters in your request and instead supply the Client ID and Client Secret using the HTTP Basic authentication scheme. |
| `client_secret` | no | string | Issued when you created your application. If possible, avoid sending client_id and client_secret as parameters in your request and instead supply the Client ID and Client Secret using the HTTP Basic authentication scheme. |
| `code` | no | string | The code param returned via the OAuth callback. |
| `code_verifier` | no | string | The code_verifier param used to generate the code_challenge originally. Used for PKCE. |
| `redirect_uri` | no | string | This must match the originally submitted URI (if one was sent). |
| `grant_type` | no | string | The grant_type param as described in the OAuth spec. |
| `refresh_token` | no | string | The refresh_token param as described in the OAuth spec. |
| `assertion` | no | string | Identity assertion JWT authorization grant. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "access_token": "xoxp-123456789...",
    "token_type": "user",
    "id_token": "eyJhbGciOiJSUzI1Ni...",
    "authed_user": {
        "id": "U12345",
        "scope": "openid,email,profile"
    },
    "team": {
        "id": "T012345"
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/oauth.v2.user.access.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
