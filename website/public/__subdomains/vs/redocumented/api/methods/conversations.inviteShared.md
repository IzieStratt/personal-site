# conversations.inviteShared

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/conversations.inviteShared

Sends an invitation to a Slack Connect channel

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | ID of the channel on your team that you'd like to share. |
| `emails` | no | array | Optional email to receive this invite. Either emails or user_ids must be provided. Only one email or one user ID may be invited at a time. |
| `user_ids` | no | array | Optional user_id to receive this invite. Either emails or user_ids must be provided. Only one email or one user ID may be invited at a time. |
| `external_limited` | no | boolean | Optional boolean on whether invite is to an external limited member. Defaults to true. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "invite_id": "I02UKAJ6RJA",
    "is_legacy_shared_channel": false
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.inviteShared.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
