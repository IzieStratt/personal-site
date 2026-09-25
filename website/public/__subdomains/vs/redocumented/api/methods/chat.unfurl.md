# chat.unfurl

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/chat.unfurl

Provide custom unfurl behavior for user-posted URLs

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | no | channel | Channel ID of the message. Both channel and ts must be provided together, or unfurl_id and source must be provided together. Required for public channels. |
| `ts` | no | timestamp | Timestamp of the message to add unfurl behavior to. Required for public channels. |
| `unfurls` | no | string | URL-encoded JSON map with keys set to URLs featured in the message, pointing to their unfurl blocks or message attachments. Required for public channels. |
| `user_auth_message` | no | string | Provide a simply-formatted string to send as an ephemeral message to the user as invitation to authenticate further and enable full unfurling behavior. Provides two buttons, Not now or Never ask me again. |
| `user_auth_required` | no | boolean | Set to true or 1 to indicate the user must install your Slack app to trigger unfurls for this domain. |
| `user_auth_url` | no | string | Send users to this custom URL where they will complete authentication in your app to fully trigger unfurling. Value should be properly URL-encoded. |
| `user_auth_blocks` | no | string | Provide a JSON based array of structured blocks presented as URL-encoded string to send as an ephemeral message to the user as invitation to authenticate further and enable full unfurling behavior. |
| `unfurl_id` | no | string | The ID of the link to unfurl. Both unfurl_id and source must be provided together, or channel and ts must be provided together. |
| `source` | no | enum | The source of the link to unfurl. The source may either be composer, when the link is inside the message composer, or conversations_history, when the link has been posted to a conversation. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/chat.unfurl.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
