# assistant.threads.setStatus

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/assistant.threads.setStatus

Set the status for an AI assistant thread.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | yes | string | Channel ID containing the assistant thread. |
| `thread_ts` | yes | string | Message timestamp of the thread of where to set the status. |
| `status` | yes | string | Status of the specified bot user, e.g., 'is thinking...'. A two minute timeout applies, which will cause the status to be removed if no message has been sent. |
| `loading_messages` | no | array | The list of messages to rotate through as a loading indicator. Maximum of 10 messages. |
| `icon_emoji` | no | string | Emoji to use as the icon for this message. Overrides icon_url. |
| `icon_url` | no | string | Image URL to use as the icon for this message. |
| `username` | no | string | The bot's username to display. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/assistant.threads.setStatus.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
