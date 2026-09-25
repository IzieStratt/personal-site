# views.publish

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/views.publish

Publish a static view for a User.

## Params

| name | required | type | description |
|---|---|---|---|
| `user_id` | yes | string | id of the user you want publish a view to. |
| `view` | yes | string | A view payload. This must be a JSON-encoded string. |
| `hash` | no | string | A string that represents view state to protect against possible race conditions. |
| `interactivity_pointer` | no | string |  |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "view": {
        "id": "VMHU10V25",
        "team_id": "T8N4K1JN",
        "type": "home",
        "close": null,
        "submit": null,
        "blocks": [
            {
                "type": "section",
                "block_id": "2WGp9",
                "text": {
                    "type": "mrkdwn",
                    "text": "A simple section with some sample sentence.",
                    "verbatim": false
                }
            }
        ],
        "private_metadata": "Shh it is a secret",
        "callback_id": "identify_your_home_tab",
        "state": {
            "values": {}
        },
        "hash": "156772938.1827394",
        "clear_on_close": false,
        "notify_on_close": false,
        "root_view_id": "VMHU10V25",
        "previous_view_id": null,
        "app_id": "AA4928AQ",
        "external_id": "",
        "bot_id": "BA13894H"
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/views.publish.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
