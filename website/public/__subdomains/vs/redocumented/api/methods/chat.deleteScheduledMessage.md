# chat.deleteScheduledMessage

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/chat.deleteScheduledMessage

Deletes a pending scheduled message from the queue.

## Params

| name | required | type | description |
|---|---|---|---|
| `as_user` | no | boolean | Pass true to delete the message as the authed user with chat:write:user scope. Bot users in this context are considered authed users. If unused or false, the message will be deleted with chat:write:bot scope. |
| `channel` | yes | channel | The channel the scheduled_message is posting to. |
| `scheduled_message_id` | yes | string | scheduled_message_id returned from call to chat.scheduleMessage. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/chat.deleteScheduledMessage.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
