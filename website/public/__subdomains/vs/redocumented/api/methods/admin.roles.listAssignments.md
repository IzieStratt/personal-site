# admin.roles.listAssignments

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.roles.listAssignments

Lists assignments for all roles across entities. Options to scope results by any combination of roles or entities

## Params

| name | required | type | description |
|---|---|---|---|
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |
| `limit` | no | integer | The maximum number of items to return. Must be between 1 - 200 both inclusive. |
| `role_ids` | no | array | collection of role ids to scope results by. |
| `entity_ids` | no | array | The entities for which the roles apply. |
| `sort_dir` | no | string | Sort direction. Default is descending on date_create, can be either ASC or DESC. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "role_assignments": [
        {
            "role_id": "Rl0C",
            "entity_id": "T123ABC456",
            "user_id": "U123ABC456",
            "date_create": 1677038902
        },
        {
            "role_id": "Rl0C",
            "entity_id": "T123ABC456",
            "user_id": "U123ABC456",
            "date_create": 1677038902
        },
        {
            "role_id": "Rl0A",
            "entity_id": "C123ABC456",
            "user_id": "U123ABC456",
            "date_create": 1666624374
        },
        {
            "role_id": "Rl03",
            "entity_id": "E123ABC456",
            "user_id": "U123ABC456",
            "date_create": 1663617026
        },
        {
            "role_id": "Rl01",
            "entity_id": "E123ABC456",
            "user_id": "U123ABC456",
            "date_create": 1643231331
        }
    ],
    "response_metadata": {
        "next_cursor": "dXNlcl9pZDozMDA1NjIwNTc0MjYyO2VudGl0eV90eXBlOjE7ZW50aXR5X2lkOjMwMDUxODcyMTczNjY7ZGF0ZV9jcmVhdGU6MTY0MzIzMTMzMQ=="
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.roles.listAssignments.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
