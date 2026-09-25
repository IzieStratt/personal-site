# chat.meMessage

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/chat.meMessage

Share a me message into a channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | Channel to send message to. Can be a public channel, private group or IM channel. Can be an encoded ID, or a name. |
| `text` | yes | string | Text of the message to send. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "channel": "C123ABC456",
    "ts": "1417671948.000006"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/chat.meMessage.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
