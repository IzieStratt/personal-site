# chat.appendStream

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/chat.appendStream

Appends text to an existing streaming conversation.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | An encoded ID that represents a channel, private group, or DM. |
| `chunks` | no | array | Array of streaming chunks. |
| `ts` | yes | timestamp | The timestamp of the streaming message. |
| `markdown_text` | no | string | Accepts message text formatted in markdown. Limit this field to 12,000 characters. This text is what will be appended to the message received so far. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "channel": "C123ABC456",
    "ts": "1503435956.000247"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/chat.appendStream.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
