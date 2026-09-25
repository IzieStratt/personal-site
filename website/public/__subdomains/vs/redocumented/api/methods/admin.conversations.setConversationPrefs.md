# admin.conversations.setConversationPrefs

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.setConversationPrefs

Set the posting permissions for a public or private channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | yes | string | The channel to set the prefs for. |
| `prefs` | yes | string | The prefs for this channel in a stringified JSON format. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.setConversationPrefs.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
