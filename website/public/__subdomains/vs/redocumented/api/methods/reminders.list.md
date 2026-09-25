# reminders.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/reminders.list

Lists all reminders created by or for a given user.

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | no | string | Encoded team id, required if org token is passed. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/reminders.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
