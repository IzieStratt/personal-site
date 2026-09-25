# team.externalTeams.disconnect

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/team.externalTeams.disconnect

Disconnect an external organization.

## Params

| name | required | type | description |
|---|---|---|---|
| `target_team` | yes | string | The team ID of the target team. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/team.externalTeams.disconnect.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
