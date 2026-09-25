# admin.inviteRequests.approve

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.inviteRequests.approve

Approve a workspace invite request.

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | no | string | ID for the workspace where the invite request was made. |
| `invite_request_id` | yes | string | ID of the request to invite. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.inviteRequests.approve.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
