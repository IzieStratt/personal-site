# migration.exchange

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/migration.exchange

For Enterprise organization workspaces, map local user IDs to global user IDs

## Params

| name | required | type | description |
|---|---|---|---|
| `users` | yes | array | A comma-separated list of user ids, up to 400 per request. |
| `team_id` | no | string | Specify team_id starts with T in case of Org Token. |
| `to_old` | no | boolean | Specify true to convert W global user IDs to workspace-specific U IDs. Defaults to false. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "team_id": "T1KR7PE1W",
    "enterprise_id": "E1KQTNXE1",
    "user_id_map": {
        "U06UBSUN5": "W06M56XJM",
        "U06UEB62U": "W06PTT6GH",
        "U06UBSVB3": "W06PUUDLY",
        "U06UBSVDX": "W06PUUDMW",
        "W06UAZ65Q": "W06UAZ65Q"
    },
    "invalid_user_ids": [
        "U21ABZZXX"
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/migration.exchange.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
