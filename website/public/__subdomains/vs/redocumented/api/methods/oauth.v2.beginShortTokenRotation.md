# oauth.v2.beginShortTokenRotation

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/oauth.v2.beginShortTokenRotation

Call this to rotate the secret on an old API token with a short secret. Must be paired with a call to oauth.v2.completeShortTokenRotation to confirm the change.

## Params

| name | required | type | description |
|---|---|---|---|
| `client_id` | yes | string | Issued when you created your application. Must be the app the token being rotated was issued to. |
| `client_secret` | yes | string | Issued when you created your application. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "new_token": "xoxp-EXAMPLE-FROM-SLACK-DOCS-REDACTED"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/oauth.v2.beginShortTokenRotation.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
