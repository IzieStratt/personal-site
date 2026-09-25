# reminders.info

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/reminders.info

Gets information about a reminder.

## Params

| name | required | type | description |
|---|---|---|---|
| `reminder` | yes | string | The ID of the reminder. |
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
JSON: https://vs.izie.top/redocumented/api/methods/reminders.info.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
