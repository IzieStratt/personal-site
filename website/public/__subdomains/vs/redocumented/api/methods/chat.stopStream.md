# chat.stopStream

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/chat.stopStream

Stops a streaming conversation.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | An encoded ID that represents a channel, private group, or DM. |
| `chunks` | no | array | Array of streaming chunks. Can include markdown text chunk objects, task update chunk objects, plan update chunks, or blocks chunks. |
| `ts` | yes | timestamp | The timestamp of the streaming message. |
| `markdown_text` | no | string | Accepts message text formatted in markdown. Limit this field to 12,000 characters. |
| `blocks` | no | string | A list of blocks that will be rendered at the bottom of the finalized message. |
| `metadata` | no | string | JSON object with event_type and event_payload fields, presented as a URL-encoded string. Metadata you post to Slack is accessible to any app or user who is a member of that workspace. |
| `session_status` | no | enum | The session status to set after stopping the stream. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "channel": "C123ABC456",
    "ts": "1503435956.000247",
    "message": {
        "text": "Here's the final streamed message content",
        "bot_id": "B123ABC456",
        "ts": "1503435956.000247",
        "type": "message",
        "subtype": "bot_message"
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/chat.stopStream.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
