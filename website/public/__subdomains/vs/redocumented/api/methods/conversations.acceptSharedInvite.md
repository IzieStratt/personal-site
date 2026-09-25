# conversations.acceptSharedInvite

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/conversations.acceptSharedInvite

Accepts an invitation to a Slack Connect channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_name` | yes | string | Name of the channel. If the channel does not exist already in your workspace, this name is the one that the channel will take. |
| `is_private` | no | boolean | Whether the channel should be private. |
| `free_trial_accepted` | no | boolean | Whether you'd like to use your workspace's free trial to begin using Slack Connect. |
| `invite_id` | no | string | ID of the invite that you'd like to accept. Must provide either invite_id or channel_id. See the shared_channel_invite_received event payload for more details on how to retrieve the ID of the invitation. |
| `channel_id` | no | string | ID of the channel that you'd like to accept. Must provide either invite_id or channel_id. |
| `team_id` | no | string | The ID of the workspace to accept the channel in. If an org-level token is used to call this method, the team_id argument is required. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.acceptSharedInvite.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
