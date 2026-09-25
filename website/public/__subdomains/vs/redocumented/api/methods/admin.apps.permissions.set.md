# admin.apps.permissions.set

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.apps.permissions.set

Set the permission type for who can access an app

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | yes | string | Encoded ID of the app. |
| `permission_type` | yes | enum | The type of permission that defines who can access the app. |
| `user_ids` | no | array | List of user IDs to allow for named_entities visibility. |
| `usergroup_ids` | no | array | List of encoded usergroup IDs. |
| `channel_restriction_mode` | no | enum | The mode that defines where the app can be used in channels. |
| `channel_ids` | no | array | List of encoded channel IDs for channel restrictions. Semantics depend on channel_restriction_mode: allowlist for specific_channels, exclusion list for all_channels_except. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "permission_type": "everyone",
    "channel_restriction_mode": "specific_channels",
    "channel_ids": [
        "C00000001",
        "C00000002"
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.apps.permissions.set.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
