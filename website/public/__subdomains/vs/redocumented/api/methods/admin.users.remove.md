# admin.users.remove

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.users.remove

Remove a user from a workspace.

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | yes | string | The ID (T1234) of the workspace. |
| `user_id` | yes | string | The ID of the user to remove. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.users.remove.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
