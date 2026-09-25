# chat.scheduledMessages.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/chat.scheduledMessages.list

Returns a list of scheduled messages.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | no | channel | The channel of the scheduled messages. |
| `cursor` | no | string | For pagination purposes, this is the cursor value returned from a previous call to chat.scheduledmessages.list indicating where you want to start this call from. |
| `latest` | no | timestamp | A Unix timestamp of the latest value in the time range. |
| `limit` | no | integer | Maximum number of original entries to return. |
| `oldest` | no | timestamp | A Unix timestamp of the oldest value in the time range. |
| `team_id` | no | string | encoded team id to list channels in, required if org token is used. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "scheduled_messages": [
        {
            "id": 1298393284,
            "channel_id": "C1H9RESGL",
            "post_at": 1551991428,
            "date_created": 1551891734,
            "text": "Here's a message for you in the future"
        }
    ],
    "response_metadata": {
        "next_cursor": ""
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/chat.scheduledMessages.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
