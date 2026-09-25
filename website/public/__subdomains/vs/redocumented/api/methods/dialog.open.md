# dialog.open

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/dialog.open

Open a dialog with a user

## Params

| name | required | type | description |
|---|---|---|---|
| `dialog` | yes | string | The dialog definition. This must be a JSON-encoded string. |
| `trigger_id` | yes | string | Exchange a trigger to post to the user. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/dialog.open.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
