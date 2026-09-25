# admin.users.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.users.list

List users on a workspace

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | no | string | The ID (T1234) of a workspace. Filters results to just the specified workspace. |
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |
| `is_active` | no | boolean | If true, only active users will be returned. If false, only deactivated users will be returned. Default is true. |
| `include_deactivated_user_workspaces` | no | boolean | Only applies with org token and no team_id. If true, return workspaces for a user even if they may be deactivated on them. If false, return workspaces for a user only when user is active on them. Default is false. |
| `only_guests` | no | boolean | If true, returns only guests and their expiration dates that belong to the team_id. |
| `include_admins` | no | boolean | If true, only admin users will be returned (excludes owners). Returns all admins and owners when combined with include_owners. Cannot be used together with only_guests. |
| `include_owners` | no | boolean | If true, only owner users will be returned. Cannot be used together with only_guests. |
| `limit` | no | integer | Limit for how many users to be retrieved per page. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "users": [
        {
            "id": "W0L3P31SP",
            "email": "john.doe@slack.com",
            "is_admin": false,
            "is_owner": false,
            "is_primary_owner": false,
            "is_restricted": false,
            "is_ultra_restricted": false,
            "is_bot": false,
            "username": "john_doe",
            "full_name": "John Doe",
            "is_active": true,
            "date_created": 1566922090,
            "deactivated_ts": 1678435283,
            "expiration_ts": 0,
            "workspaces": [
                "T123"
            ],
            "has_2fa": false,
            "has_sso": false
        }
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.users.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
