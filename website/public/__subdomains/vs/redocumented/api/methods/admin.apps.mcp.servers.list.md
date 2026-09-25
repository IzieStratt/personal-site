# admin.apps.mcp.servers.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.apps.mcp.servers.list

List third-party app MCP servers approved for an organization, derived from the org's MCP server allowlist. Entries reflect allowlist state, not install/scope liveness: servers of apps that are uninstalled (but not deleted) are still listed.

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | integer | The maximum number of items to return. Must be between 1 - 1000 both inclusive. |
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.apps.mcp.servers.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
