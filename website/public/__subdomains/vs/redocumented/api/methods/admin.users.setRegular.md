# admin.users.setRegular

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.users.setRegular

Set an existing guest user, admin user, or owner to be a regular user.

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | yes | string | The ID of the workspace or organization. |
| `user_id` | yes | string | The ID of the user to designate as a regular user. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.users.setRegular.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
