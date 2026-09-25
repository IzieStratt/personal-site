# functions.distributions.permissions.add

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/functions.distributions.permissions.add

Grant users access to a custom slack function if its permission_type is set to named_entities

## Params

| name | required | type | description |
|---|---|---|---|
| `function_id` | no | string | The encoded ID of the function. |
| `function_callback_id` | no | string | The callback ID defined in the function's definition file. |
| `function_app_id` | no | string | The encoded ID of the app. |
| `user_ids` | no | array | List of encoded user IDs. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "permission_type": "named_entities",
    "users": [
        {
            "user_id": "U01565LTEBD",
            "username": "joe_smith",
            "email": "joesmith@salesforce.com"
        }
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/functions.distributions.permissions.add.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
