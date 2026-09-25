# admin.teams.settings.setIcon

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.teams.settings.setIcon

Sets the icon of a workspace.

## Params

| name | required | type | description |
|---|---|---|---|
| `image_url` | yes | string | Image URL for the icon. |
| `team_id` | yes | string | ID for the workspace to set the icon for. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.teams.settings.setIcon.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
