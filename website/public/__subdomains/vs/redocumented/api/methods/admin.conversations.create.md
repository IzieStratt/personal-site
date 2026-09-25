# admin.conversations.create

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.create

Create a public or private channel-based conversation.

## Params

| name | required | type | description |
|---|---|---|---|
| `name` | yes | string | Name of the public or private channel to create. |
| `description` | no | string | Description of the public or private channel to create. |
| `is_private` | yes | boolean | When true, creates a private channel instead of a public channel. |
| `org_wide` | no | boolean | When true, the channel will be available org-wide. Note: if the channel is not org_wide=true, you must specify a team_id for this channel. |
| `team_id` | no | string | The workspace to create the channel in. Note: this argument is required unless you set org_wide=true. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "channel_id": "C12345"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.create.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
