# chat.postEphemeral

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/chat.postEphemeral

Sends an ephemeral message to a user in a channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `as_user` | no | boolean | (Legacy) Pass true to post the message as the authed user. Defaults to true if the chat:write:bot scope is not included. Otherwise, defaults to false. |
| `attachments` | no | string | A JSON-based array of structured attachments, presented as a URL-encoded string. |
| `blocks` | no | string | A JSON-based array of structured blocks, presented as a URL-encoded string. |
| `channel` | yes | channel | Channel, private group, or IM channel to send message to. Can be an encoded ID, or a name. |
| `icon_emoji` | no | string | Emoji to use as the icon for this message. Overrides icon_url. |
| `icon_url` | no | string | URL to an image to use as the icon for this message. |
| `link_names` | no | boolean | Find and link channel names and usernames. |
| `markdown_text` | no | string | Accepts message text formatted in markdown. This argument should not be used in conjunction with blocks or text. Limit this field to 12,000 characters. |
| `metadata` | no | string | JSON object with an entities array of work object entity metadata, presented as a URL-encoded string. Only entity metadata is supported: ephemeral messages are not persisted and never dispatch message_metadata_* events, so event_type/event_payload message metadata is ignored here. Each entity requires entity_type, entity_payload, external_ref, and url. |
| `parse` | no | string | Change how messages are treated. Defaults to none. See below. |
| `text` | no | string | How this field works and whether it is required depends on other fields you use in your API call. See below for more detail. |
| `thread_ts` | no | string | Provide another message's ts value to post this message in a thread. Avoid using a reply's ts value; use its parent's value instead. Ephemeral messages in threads are only shown if there is already an active thread. |
| `user` | yes | user | id of the user who will receive the ephemeral message. The user should be in the channel specified by the channel argument. |
| `username` | no | string | Set your bot's user name. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "message_ts": "1502210682.580145"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/chat.postEphemeral.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
