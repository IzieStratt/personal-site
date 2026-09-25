# tooling.tokens.rotate

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/tooling.tokens.rotate

Exchanges a refresh token for a new app configuration token.

## Params

| name | required | type | description |
|---|---|---|---|
| `refresh_token` | yes | string | The xoxe refresh token that was issued along with the old app configuration token. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "token": "xoxe.xoxp-...",
    "refresh_token": "xoxe-...",
    "team_id": "...",
    "user_id": "...",
    "iat": 1633095660,
    "exp": 1633138860
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/tooling.tokens.rotate.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
