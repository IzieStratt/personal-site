# conversations.externalInvitePermissions.set

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/conversations.externalInvitePermissions.set

Upgrade or downgrade Slack Connect channel permissions between 'can post only' and 'can post and invite'.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | The channel ID to change external invite permissions for. |
| `target_team` | yes | string | The encoded team ID of the target team.  Must be in the specified channel. |
| `action` | yes | enum | Type of action to be taken: upgrade or downgrade. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.externalInvitePermissions.set.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
