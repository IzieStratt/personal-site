# admin.teams.settings.setDefaultChannels

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.teams.settings.setDefaultChannels

Set the default channels of a workspace.

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | yes | string | ID for the workspace to set the default channel for. |
| `channel_ids` | yes | array | An array of channel IDs. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.teams.settings.setDefaultChannels.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
