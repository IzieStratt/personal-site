# chat.getPermalink

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/chat.getPermalink

Retrieve a permalink URL for a specific extant message

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | The ID of the conversation or channel containing the message. |
| `message_ts` | yes | string | A message's ts value, uniquely identifying it within a channel. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "channel": "C123ABC456",
    "permalink": "https://ghostbusters.slack.com/archives/C1H9RESGA/p135854651500008"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/chat.getPermalink.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
