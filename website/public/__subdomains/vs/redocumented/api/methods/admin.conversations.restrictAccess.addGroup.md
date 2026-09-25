# admin.conversations.restrictAccess.addGroup

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.restrictAccess.addGroup

Add an allowlist of IDP groups for accessing a channel

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | no | string | The workspace where the channel exists. This argument is required for channels only tied to one workspace, and optional for channels that are shared across an organization. |
| `group_id` | yes | string | The IDP Group ID to be an allowlist for the private channel. |
| `channel_id` | yes | string | The channel to link this group to. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.restrictAccess.addGroup.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
