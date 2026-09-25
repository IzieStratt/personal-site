# admin.auth.policy.getEntities

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.auth.policy.getEntities

Fetch all the entities assigned to a particular authentication policy by name.

## Params

| name | required | type | description |
|---|---|---|---|
| `policy_name` | yes | string | The name of the policy to fetch entities for. Currently, email_password is the only policy that may be used with this method. |
| `entity_type` | no | string | The type of entity to assign to the policy. Currently, USER is supported. |
| `limit` | no | integer | The maximum number of items to return. Must be between 1 and 1000, both inclusive. |
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "entities": [
        {
            "entity_type": "USER",
            "entity_id": "U1234",
            "date_added": 1620836993
        }
    ],
    "entity_total_count": 1
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.auth.policy.getEntities.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
