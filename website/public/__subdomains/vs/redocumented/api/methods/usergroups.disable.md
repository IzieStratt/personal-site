# usergroups.disable

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/usergroups.disable

Disable an existing User Group.

## Params

| name | required | type | description |
|---|---|---|---|
| `include_count` | no | boolean | Include the number of users in the User Group. |
| `team_id` | no | string | Encoded target team id where the user group is, required if org token is used. |
| `usergroup` | yes | string | The encoded ID of the User Group to disable. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/usergroups.disable.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
