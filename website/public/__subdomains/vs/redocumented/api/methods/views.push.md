# views.push

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/views.push

Push a view onto the stack of a root view.

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
        "id": "VNM522E2U",
        "team_id": "T9M4RL1JM",
        "type": "modal",
        "title": {
            "type": "plain_text",
            "text": "Pushed Modal",
            "emoji": true
        },
        "close": {
            "type": "plain_text",
            "text": "Back",
            "emoji": true
        },
        "submit": {
            "type": "plain_text",
            "text": "Save",
            "emoji": true
        },
        "blocks": [
            {
                "type": "input",
                "block_id": "edit_details",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "detail_input"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Edit details"
                }
            }
        ],
        "private_metadata": "",
        "callback_id": "view_4",
        "external_id": "",
        "state": {
            "values": {}
        },
        "hash": "1569362015.55b5e41b",
        "clear_on_close": true,
        "notify_on_close": false,
        "root_view_id": "VNN729E3U",
        "previous_view_id": null,
        "app_id": "AAD3351BQ",
        "bot_id": "BADF7A34H"
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/views.push.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
