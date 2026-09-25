# admin.conversations.setTeams

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.setTeams

Set the workspaces in an Enterprise org that connect to a public or private channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | yes | string | The encoded channel_id to add or remove to workspaces. |
| `team_id` | no | string | The workspace to which the channel belongs if the channel is a local workspace channel. Omit this argument if the channel is a cross-workspace or org-wide shared channel. |
| `target_team_ids` | no | array | A comma-separated list of workspaces to which the channel should be shared. Not required if the channel is being shared org-wide. |
| `org_channel` | no | boolean | True if channel has to be converted to an org channel. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.setTeams.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
