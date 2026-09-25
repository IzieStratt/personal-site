# admin.teams.create

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.teams.create

Create an Enterprise team.

## Params

| name | required | type | description |
|---|---|---|---|
| `team_domain` | yes | string | Team domain (for example, slacksoftballteam). Domains are limited to 21 characters. |
| `team_name` | yes | string | Team name (for example, Slack Softball Team). |
| `team_description` | no | string | Description for the team. |
| `team_discoverability` | no | string | Who can join the team. A team's discoverability can be open, closed, invite_only, or unlisted. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "team": "T12345"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.teams.create.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
