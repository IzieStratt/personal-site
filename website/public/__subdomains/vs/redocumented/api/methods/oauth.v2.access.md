# oauth.v2.access

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/oauth.v2.access

Exchanges a temporary OAuth verifier code for an access token.

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
    "access_token": "xoxb-EXAMPLE-FROM-SLACK-DOCS-REDACTED",
    "token_type": "bot",
    "scope": "commands,incoming-webhook",
    "bot_user_id": "U0KRQLJ9H",
    "app_id": "A0KRD7HC3",
    "team": {
        "name": "Slack Softball Team",
        "id": "T9TK3CUKW"
    },
    "enterprise": {
        "name": "slack-sports",
        "id": "E12345678"
    },
    "authed_user": {
        "id": "U1234",
        "scope": "chat:write",
        "access_token": "xoxp-1234",
        "token_type": "user"
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/oauth.v2.access.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
