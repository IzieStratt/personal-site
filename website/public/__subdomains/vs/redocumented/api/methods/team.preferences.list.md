# team.preferences.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/team.preferences.list

Retrieve a list of a workspace's team preferences.

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

```json
{
    "ok": true,
    "display_real_names": false,
    "disable_file_uploads": "disable_all",
    "msg_edit_window_mins": 25,
    "who_can_post_general": "everyone"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/team.preferences.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
