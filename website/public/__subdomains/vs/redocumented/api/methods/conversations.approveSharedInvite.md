# conversations.approveSharedInvite

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/conversations.approveSharedInvite

Approves an invitation to a Slack Connect channel

## Params

| name | required | type | description |
|---|---|---|---|
| `invite_id` | yes | string | ID of the shared channel invite to approve. |
| `target_team` | no | string | The team or enterprise ID of the receiving party involved in the invitation you are approving. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.approveSharedInvite.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
