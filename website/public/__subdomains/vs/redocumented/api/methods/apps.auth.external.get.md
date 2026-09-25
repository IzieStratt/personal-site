# apps.auth.external.get

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.auth.external.get

Get the access token for the provided token ID

## Params

| name | required | type | description |
|---|---|---|---|
| `external_token_id` | yes | string | The id of the token you want to get the token for. |
| `force_refresh` | no | boolean | Always refresh existing token before returning even when the token has not expired. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "external_token": "00D3j00000025Zh!EXAMPLE-FROM-SLACK-DOCS-REDACTED"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.auth.external.get.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
