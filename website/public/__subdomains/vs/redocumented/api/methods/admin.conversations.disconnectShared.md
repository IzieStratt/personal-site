# admin.conversations.disconnectShared

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.disconnectShared

Disconnect a connected channel from one or more workspaces.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | yes | string | The channel to be disconnected from some workspaces. |
| `leaving_team_ids` | no | array | Used for disconnecting a team from a shared channel. Only one team ID may be passed at a time. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.disconnectShared.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
