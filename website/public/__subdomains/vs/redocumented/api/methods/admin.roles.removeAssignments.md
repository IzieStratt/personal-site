# admin.roles.removeAssignments

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.roles.removeAssignments

Removes a set of users from a role for the given scopes and entities

## Params

| name | required | type | description |
|---|---|---|---|
| `role_id` | yes | string | ID of the role to which users will be assigned. |
| `entity_ids` | yes | array | List of the entity IDs for which roles will be revoked. These can be Org IDs, Team IDs or Channel IDs. |
| `user_ids` | yes | array | List of IDs of the users whose roles will be revoked. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.roles.removeAssignments.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
