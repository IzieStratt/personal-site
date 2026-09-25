# blocks.validate

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/blocks.validate

Validates blocks, messages, and views Block Kit JSON payloads.

## Params

| name | required | type | description |
|---|---|---|---|
| `blocks` | no | string | A JSON-encoded array of structured blocks. Provide exactly one of blocks, view, or message. |
| `message` | no | string | A JSON-encoded message payload to validate. Provide exactly one of blocks, view, or message. |
| `view` | no | string | A JSON-encoded view payload to validate. Provide exactly one of blocks, view, or message. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/blocks.validate.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
