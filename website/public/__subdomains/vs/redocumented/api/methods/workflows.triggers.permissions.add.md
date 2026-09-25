# workflows.triggers.permissions.add

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/workflows.triggers.permissions.add

Allows users to run a trigger that has its permission type set to named_entities

## Params

| name | required | type | description |
|---|---|---|---|
| `trigger_id` | yes | string | Encoded ID of the trigger. |
| `user_ids` | no | array | List of encoded user IDs. |
| `channel_ids` | no | array | List of encoded channel IDs. |
| `team_ids` | no | array | List of encoded workspace IDs. |
| `org_ids` | no | array | List of encoded organization IDs. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "permission_type": "named_entities",
    "user_ids": [
        "U014KLZE350",
        "U01565LTEBD"
    ],
    "channel_ids": [
        "C014LMDP71R"
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/workflows.triggers.permissions.add.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
