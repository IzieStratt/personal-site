# views.update

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/views.update

Update an existing view.

## Params

| name | required | type | description |
|---|---|---|---|
| `view_id` | no | string | A unique identifier of the view to be updated. Either view_id or external_id is required. |
| `external_id` | no | string | A unique identifier of the view set by the developer. Must be unique for all views on a team. Max length of 255 characters. Either view_id or external_id is required. |
| `view` | yes | string | A view object. This must be a JSON-encoded string. |
| `hash` | no | string | A string that represents view state to protect against possible race conditions. |

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
            "text": "Updated Modal",
            "emoji": true
        },
        "close": {
            "type": "plain_text",
            "text": "Close",
            "emoji": true
        },
        "submit": null,
        "blocks": [
            {
                "type": "section",
                "block_id": "s_block",
                "text": {
                    "type": "plain_text",
                    "text": "I am but an updated modal",
                    "emoji": true
                },
                "accessory": {
                    "type": "button",
                    "action_id": "button_4",
                    "text": {
                        "type": "plain_text",
                        "text": "Click me"
                    }
                }
            }
        ],
        "private_metadata": "",
        "callback_id": "view_2",
        "external_id": "",
        "state": {
            "values": {}
        },
        "hash": "1569262015.55b5e41b",
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
JSON: https://vs.izie.top/redocumented/api/methods/views.update.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
