# admin.teams.settings.setDescription

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.teams.settings.setDescription

Set the description of a given workspace.

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | yes | string | ID for the workspace to set the description for. |
| `description` | yes | string | The new description for the workspace. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.teams.settings.setDescription.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
