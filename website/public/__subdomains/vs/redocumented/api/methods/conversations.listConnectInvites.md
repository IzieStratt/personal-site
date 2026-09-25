# conversations.listConnectInvites

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/conversations.listConnectInvites

Lists shared channel invites that have been generated or received but have not been approved by all parties

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | no | string | Encoded team id for the workspace to retrieve invites for, required if org token is used. |
| `cursor` | no | string | Set to next_cursor returned by previous call to list items in subsequent page. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.listConnectInvites.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
