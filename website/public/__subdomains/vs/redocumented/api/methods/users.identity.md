# users.identity

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/users.identity

Get a user's identity.

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

```json
{
    "ok": true,
    "user": {
        "name": "Sonny Whether",
        "id": "U0G9QF9C6"
    },
    "team": {
        "id": "T0G9PQBBK"
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.identity.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
