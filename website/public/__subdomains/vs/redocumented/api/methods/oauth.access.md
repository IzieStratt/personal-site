# oauth.access

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/oauth.access

Exchanges a temporary OAuth verifier code for an access token.

## Params

| name | required | type | description |
|---|---|---|---|
| `client_id` | no | string | Issued when you created your application. If possible, avoid sending client_id and client_secret as parameters in your request and instead supply the Client ID and Client Secret using the HTTP Basic authentication scheme. |
| `client_secret` | no | string | Issued when you created your application. If possible, avoid sending client_id and client_secret as parameters in your request and instead supply the Client ID and Client Secret using the HTTP Basic authentication scheme. |
| `code` | no | string | The code param returned via the OAuth callback. |
| `redirect_uri` | no | string | This must match the originally submitted URI (if one was sent). |
| `single_channel` | no | boolean | Request the user to add your app only to a single channel. Only valid with a legacy workspace app. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "access_token": "xoxp-XXXXXXXX-XXXXXXXX-XXXXX",
    "scope": "groups:write",
    "team_name": "Wyld Stallyns LLC",
    "team_id": "TXXXXXXXXX",
    "enterprise_id": null
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/oauth.access.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
