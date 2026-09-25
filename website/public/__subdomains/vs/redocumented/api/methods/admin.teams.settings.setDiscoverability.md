# admin.teams.settings.setDiscoverability

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.teams.settings.setDiscoverability

An API method that allows admins to set the discoverability of a given workspace

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | yes | string | The ID of the workspace to set discoverability on. |
| `discoverability` | yes | string | This workspace's discovery setting. It must be set to one of open, invite_only, closed, or unlisted. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.teams.settings.setDiscoverability.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
