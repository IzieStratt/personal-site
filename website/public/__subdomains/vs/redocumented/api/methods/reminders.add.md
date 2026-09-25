# reminders.add

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/reminders.add

Creates a reminder.

## Params

| name | required | type | description |
|---|---|---|---|
| `text` | yes | string | The content of the reminder. |
| `time` | yes | string | Can also take a type of integer. When this reminder should happen: the Unix timestamp (up to five years from now), the number of seconds until the reminder (if within 24 hours), or a natural language description (Ex. "in 15 minutes," or "every Thursday"). |
| `user` | no | user | No longer supported - reminders cannot be set for other users. Previously, was the user who would receive the reminder. |
| `team_id` | no | string | Encoded team id, required if org token is used. |
| `recurrence` | no | object | Specify the repeating behavior of a reminder. Available options: daily, weekly, monthly, or yearly. If weekly, may further specify the days of the week. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "reminder": {
        "id": "Rm12345678",
        "creator": "U123ABC456",
        "user": "U123ABC456",
        "text": "eat a banana",
        "recurring": false,
        "time": 1602288000,
        "complete_ts": 0
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/reminders.add.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
