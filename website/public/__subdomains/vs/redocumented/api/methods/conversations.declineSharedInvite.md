# conversations.declineSharedInvite

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/conversations.declineSharedInvite

Declines a Slack Connect channel invite.

## Params

| name | required | type | description |
|---|---|---|---|
| `invite_id` | yes | string | ID of the Slack Connect invite to decline. Subscribe to the shared_channel_invite_accepted event to receive IDs of Slack Connect channel invites that have been accepted and are awaiting approval. |
| `target_team` | no | string | The team or enterprise id of the other party involved in the invitation you are declining. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.declineSharedInvite.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
