# views.open

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/views.open

Open a view for a user.

## Params

| name | required | type | description |
|---|---|---|---|
| `trigger_id` | no | string | Exchange a trigger to post to the user. |
| `interactivity_pointer` | no | string | Exchange an interactivity pointer to post to the user. |
| `view` | yes | string | A view payload. This must be a JSON-encoded string. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "view": {
        "id": "VMHU10V25",
        "team_id": "T8N4K1JN",
        "type": "modal",
        "title": {
            "type": "plain_text",
            "text": "Quite a plain modal"
        },
        "submit": {
            "type": "plain_text",
            "text": "Create"
        },
        "blocks": [
            {
                "type": "input",
                "block_id": "a_block_id",
                "label": {
                    "type": "plain_text",
                    "text": "A simple label",
                    "emoji": true
                },
                "optional": false,
                "element": {
                    "type": "plain_text_input",
                    "action_id": "an_action_id"
                }
            }
        ],
        "private_metadata": "Shh it is a secret",
        "callback_id": "identify_your_modals",
        "external_id": "",
        "state": {
            "values": {}
        },
        "hash": "156772938.1827394",
        "clear_on_close": false,
        "notify_on_close": false,
        "root_view_id": "VMHU10V25",
        "app_id": "AA4928AQ",
        "bot_id": "BA13894H"
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/views.open.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
