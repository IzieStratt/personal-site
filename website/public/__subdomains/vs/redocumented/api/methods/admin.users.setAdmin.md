# admin.users.setAdmin

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.users.setAdmin

Set an existing regular user or owner to be a workspace or org admin.

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | yes | string | The ID of the workspace or organization. |
| `user_id` | yes | string | The ID of the user to designate as an admin. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.users.setAdmin.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
