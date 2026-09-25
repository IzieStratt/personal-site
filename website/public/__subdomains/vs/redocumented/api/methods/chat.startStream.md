# chat.startStream

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/chat.startStream

Starts a new streaming conversation.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | An encoded ID that represents a channel, thread, or DM. |
| `chunks` | no | array | Array of streaming chunks. Can include markdown text chunk objects, task update chunk objects, plan update chunks, or blocks chunks. |
| `markdown_text` | no | string | Accepts message text formatted in markdown. Limit this field to 12,000 characters. |
| `thread_ts` | no | string | Provide another message's ts value to reply to. Omit it to stream a top-level message instead of a thread reply; this is only supported in channels where the whole channel is one session, such as Slack Code, and returns invalid_thread_ts elsewhere. Passing "0" is equivalent to omitting it. |
| `recipient_user_id` | no | string | The encoded ID of the user to receive the streaming text. Required when streaming to channels. |
| `recipient_team_id` | no | string | The encoded ID of the team the user receiving the streaming text belongs to. Required when streaming to channels. |
| `task_display_mode` | no | enum | Specifies how tasks are displayed in the message. timeline task updates render as individual task cards interleaved with streamed text. plan task updates render together in a plan block. |
| `icon_emoji` | no | string | Emoji to use as the icon for this message. Overrides icon_url. |
| `icon_url` | no | string | Image URL to use as the icon for this message. |
| `username` | no | string | The bot's username to display. |

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
JSON: https://vs.izie.top/redocumented/api/methods/chat.startStream.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
