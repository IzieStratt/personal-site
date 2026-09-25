# usergroups.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/usergroups.list

List all User Groups for a team.

## Params

| name | required | type | description |
|---|---|---|---|
| `include_count` | no | boolean | Include the number of users in each User Group. |
| `include_disabled` | no | boolean | Include results for disabled User Groups. |
| `include_users` | no | boolean | Include the list of users for each User Group. |
| `team_id` | no | string | The user group's encoded team ID. Required if org token is used. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "usergroups": [
        {
            "id": "S0614TZR7",
            "team_id": "T060RNRCH",
            "is_usergroup": true,
            "name": "Team Admins",
            "description": "A group of all Administrators on your team.",
            "handle": "admins",
            "is_external": false,
            "date_create": 1446598059,
            "date_update": 1446670362,
            "date_delete": 0,
            "auto_type": "admin",
            "created_by": "USLACKBOT",
            "updated_by": "U060RNRCZ",
            "deleted_by": null,
            "prefs": {
                "channels": [],
                "groups": []
            },
            "user_count": "2"
        },
        {
            "id": "S06158AV7",
            "team_id": "T060RNRCH",
            "is_usergroup": true,
            "name": "Team Owners",
            "description": "A group of all Owners on your team.",
            "handle": "owners",
            "is_external": false,
            "date_create": 1446678371,
            "date_update": 1446678371,
            "date_delete": 0,
            "auto_type": "owner",
            "created_by": "USLACKBOT",
            "updated_by": "USLACKBOT",
            "deleted_by": null,
            "prefs": {
                "channels": [],
                "groups": []
            },
            "user_count": "1"
        },
        {
            "id": "S0615G0KT",
            "team_id": "T060RNRCH",
            "is_usergroup": true,
            "name": "Marketing Team",
            "description": "Marketing gurus, PR experts and product advocates.",
            "handle": "marketing-team",
            "is_external": false,
            "date_create": 1446746793,
            "date_update": 1446747767,
            "date_delete": 1446748865,
            "auto_type": null,
            "created_by": "U060RNRCZ",
            "updated_by": "U060RNRCZ",
            "deleted_by": null,
            "prefs": {
                "channels": [],
                "groups": []
            },
            "user_count": "0"
        }
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/usergroups.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
