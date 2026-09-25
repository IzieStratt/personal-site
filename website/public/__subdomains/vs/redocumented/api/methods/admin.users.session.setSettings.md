# admin.users.session.setSettings

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.users.session.setSettings

Configure the user-level session settings—the session duration and what happens when the client closes—for one or more users.

## Params

| name | required | type | description |
|---|---|---|---|
| `user_ids` | yes | array | The list of up to 1,000 user IDs to apply the session settings for. |
| `duration` | no | integer | The session duration, in seconds. The minimum value is 28800, which represents 8 hours; the max value is 315569520 or 10 years (that's a long Slack session). |
| `desktop_app_browser_quit` | no | boolean | Terminate the session when the client—either the desktop app or a browser window—is closed. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.users.session.setSettings.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
