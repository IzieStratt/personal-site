# admin.usergroups.listChannels

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.usergroups.listChannels

List the channels linked to an org-level IDP group (user group).

## Params

| name | required | type | description |
|---|---|---|---|
| `usergroup_id` | yes | string | ID of the IDP group to list default channels for. |
| `team_id` | no | string | ID of the the workspace. |
| `include_num_members` | no | boolean | Flag to include or exclude the count of members per channel. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "channels": [
        {
            "id": "C024BE91L",
            "name": "fun",
            "team_id": "T024BE911",
            "num_members": 34
        },
        {
            "id": "C024BE91K",
            "name": "more fun",
            "team_id": "T024BE912"
        },
        {
            "id": "C024BE91M",
            "name": "public-channel",
            "team_id": "T024BE911",
            "is_redacted": true,
            "num_members": 34
        },
        {
            "id": "C024BE91N",
            "name": "some more fun",
            "team_id": "T024BE921"
        }
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.usergroups.listChannels.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
