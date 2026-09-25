# admin.apps.restricted.list

- status: documented
- verified: live-verified
- tokens: Live-verified 2026-09-25 with a real admin xoxp: team_id lists workspace restrictions; enterprise_id returned an empty list even with a workspace restriction in place. See methods/grid-admin-sandbox-2026-09.md.
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.apps.restricted.list

List restricted apps for an org or workspace.

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | integer | The maximum number of items to return. Must be between 1 - 1000 both inclusive. |
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |
| `team_id` | no | string |  |
| `enterprise_id` | no | string |  |
| `certified` | no | boolean | Limit the results to only include certified apps. When false, no certified apps will appear in the result. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "restricted_apps": [
        {
            "app": {
                "id": "A0FDLP8M2L",
                "name": "My Test App",
                "description": "A fun test app for Slack",
                "help_url": "https://example.com",
                "privacy_policy_url": "https://example.com",
                "app_homepage_url": "https://example.com",
                "app_directory_url": "https://myteam.enterprise.slack.com/apps/A0FDLP8M2L-my-test-app",
                "is_app_directory_approved": true,
                "is_internal": false,
                "developer_type": "third_party",
                "socket_mode_enabled": false,
                "icons": {
                    "image_32": "https://143326534038rl8788_eb57dbc818daa4ba15d6_32.png",
                    "image_36": "https://143326534038rl8788_eb57dbc818daa4ba15d6_36.png",
                    "image_48": "https://143326534038rl8788_eb57dbc818daa4ba15d6_48.png",
                    "image_64": "https://143326534038rl8788_eb57dbc818daa4ba15d6_64.png",
                    "image_72": "https://143326534038rl8788_eb57dbc818daa4ba15d6_72.png",
                    "image_96": "https://143326534038rl8788_eb57dbc818daa4ba15d6_96.png",
                    "image_128": "https://4332653438rl87808_eb57dbc818daa4ba15d6_128.png",
                    "image_192": "https://4332653438rl87808_eb57dbc818daa4ba15d6_192.png",
                    "image_512": "https://4332653438rl87808_eb57dbc818daa4ba15d6_512.png",
                    "image_1024": "https://1433265338rl878408_eb57dbc818daa4ba15d6_1024.png",
                    "image_original": "https://143338rl8782653408_eb57dbc818daa4ba15d6_original.png"
                },
                "additional_info": ""
            },
            "scopes": [
                {
                    "name": "files:write:user",
                    "description": "Upload, edit, and delete files on the user‟s behalf",
                    "is_sensitive": true,
                    "token_type": "user"
                }
            ],
            "date_updated": 1574296721,
            "last_resolved_by": {
                "actor_id": "W0G82LMFD",
                "actor_type": "user"
            }
        }
    ],
    "response_metadata": {
        "next_cursor": ""
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.apps.restricted.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
