# admin.apps.mcp.servers.permissions.set

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.apps.mcp.servers.permissions.set

Set the access control permission for who can use an MCP server

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | yes | string | Encoded ID of the app. |
| `server_id` | yes | string | Encoded ID of the MCP server. |
| `permission_type` | yes | enum | The type of permission that defines who can use this MCP server. |
| `user_ids` | no | array | List of user IDs to set for named_entities or named_entities_exclude. |
| `usergroup_ids` | no | array | List of encoded usergroup IDs. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.apps.mcp.servers.permissions.set.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
