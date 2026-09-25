# admin.auth.policy.removeEntities

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.auth.policy.removeEntities

Remove specified entities from a specified authentication policy.

## Params

| name | required | type | description |
|---|---|---|---|
| `policy_name` | yes | string | The name of the policy to remove entities from. Currently, email_password is the only policy that may be used with this method. |
| `entity_type` | yes | string | The type of entity to assign to the policy. Currently, USER is supported. |
| `entity_ids` | yes | array | Encoded IDs of the entities you'd like to remove from the policy. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.auth.policy.removeEntities.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
