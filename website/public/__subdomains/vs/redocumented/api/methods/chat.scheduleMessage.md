# chat.scheduleMessage

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/chat.scheduleMessage

Schedules a message to be sent to a channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `as_user` | no | boolean | Set to true to post the message as the authed user, instead of as a bot. Defaults to false. Cannot be used by new Slack apps. See chat.postMessage. |
| `attachments` | no | string | A JSON-based array of structured attachments, presented as a URL-encoded string. |
| `blocks` | no | string | A JSON-based array of structured blocks, presented as a URL-encoded string. |
| `channel` | yes | channel | Channel, private group, or DM channel to send message to. Can be an encoded ID, or a name. See below for more details. |
| `link_names` | no | boolean | Find and link user groups. No longer supports linking individual users; use syntax shown in Mentioning Users instead. |
| `markdown_text` | no | string | Accepts message text formatted in markdown. This argument should not be used in conjunction with blocks or text. Limit this field to 12,000 characters. |
| `parse` | no | enum | Change how messages are treated. See chat.postMessage. |
| `post_at` | yes | integer | Unix timestamp representing the future time the message should post to Slack. |
| `reply_broadcast` | no | boolean | Used in conjunction with thread_ts and indicates whether reply should be made visible to everyone in the channel or conversation. Defaults to false. |
| `text` | no | string | How this field works and whether it is required depends on other fields you use in your API call. See below for more detail. |
| `thread_ts` | no | string | Provide another message's ts value to make this message a reply. Avoid using a reply's ts value; use its parent instead. |
| `unfurl_links` | no | boolean | Pass true to enable unfurling of primarily text-based content. |
| `unfurl_media` | no | boolean | Pass false to disable unfurling of media content. |
| `metadata` | no | string | JSON object with event_type and event_payload fields, presented as a URL-encoded string. Metadata you post to Slack is accessible to any app or user who is a member of that workspace. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "channel": "C123ABC456",
    "scheduled_message_id": "Q1298393284",
    "post_at": "1562180400",
    "message": {
        "text": "Here's a message for you in the future",
        "username": "ecto1",
        "bot_id": "B123ABC456",
        "attachments": [
            {
                "text": "This is an attachment",
                "id": 1,
                "fallback": "This is an attachment's fallback"
            }
        ],
        "type": "delayed_message",
        "subtype": "bot_message"
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/chat.scheduleMessage.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
