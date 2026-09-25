# admin.apps.requests.list

- status: documented
- verified: live-verified
- tokens: Live-verified 2026-09-25 with a real admin xoxp + team_id: ok. See methods/grid-admin-sandbox-2026-09.md.
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.apps.requests.list

List app requests for a team/workspace.

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | integer | The maximum number of items to return. Must be between 1 - 1000 both inclusive. |
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |
| `team_id` | no | string |  |
| `enterprise_id` | no | string |  |
| `certified` | no | boolean | Include requests for certified apps. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "app_requests": [
        {
            "id": "Ar0XJGFLMLS",
            "app": {
                "id": "A061BL8RQ0",
                "name": "Test App",
                "description": "",
                "help_url": "",
                "privacy_policy_url": "https://testapp.com/privacy",
                "app_homepage_url": "",
                "app_directory_url": "https://acmecorp.slack.com/apps/A061BL8RQ0-test-app",
                "is_app_directory_approved": true,
                "is_internal": true,
                "developer_type": "internal",
                "socket_mode_enabled": false,
                "icons": {
                    "image_32": "/cdn/157658203/img/testapp/service_32.png",
                    "image_36": "/cdn/157658203/img/testapp/service_36.png",
                    "image_48": "/cdn/157658203/img/testapp/service_48.png",
                    "image_64": "/cdn/157658203/img/testapp/service_64.png",
                    "image_72": "/cdn/157658203/img/testapp/service_72.png",
                    "image_96": "/cdn/157658203/img/testapp/service_96.png",
                    "image_128": "/cdn/157258203/img/testapp/service_128.png",
                    "image_192": "/cdn/157258203/img/testapp/service_192.png",
                    "image_512": "/cdn/15758203/img/testapp/service_512.png",
                    "image_1024": "/cdn/15258203/img/testapp/service_1024.png"
                },
                "additional_info": ""
            },
            "previous_resolution": null,
            "user": {
                "id": "W08RA9G5HR",
                "name": "Jane Doe",
                "email": "janedoe@example.com"
            },
            "team": {
                "id": "T0M94LNUCR",
                "name": "Acme Corp",
                "domain": "acmecorp"
            },
            "scopes": [
                {
                    "name": "incoming-webhook",
                    "description": "Post messages to specific channels in Slack",
                    "is_sensitive": false,
                    "token_type": "user",
                    "is_optional": true,
                    "is_approved": false
                }
            ],
            "message": "Could you please install this app for me, it does everything I need.",
            "is_user_app_collaborator": false,
            "date_created": 1578956327
        }
    ],
    "response_metadata": {
        "next_cursor": ""
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.apps.requests.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
