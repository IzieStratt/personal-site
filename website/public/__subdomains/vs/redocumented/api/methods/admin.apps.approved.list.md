# admin.apps.approved.list

- status: documented
- verified: live-verified
- tokens: Live-verified 2026-09-20 with the enterprise-scoped xoxc: ok:true, real data returned matching the documented response shape. Important interpretive nuance: this only lists apps going through the org-wide Admin App Approval workflow (3 apps in the tested org), not "every app installed anywhere in the workspace" -- an app installed before that policy existed, or never routed through it, will not appear here even though it's actively installed. Don't use this as a general install-state check; see methods/admin-write-scope-2026-09.md.
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.apps.approved.list

List approved apps for an org or workspace.

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
    "approved_apps": [
        {
            "app": {
                "id": "A0W7UKG8E",
                "name": "My Test App",
                "description": "test app",
                "help_url": "https://www.slack.com",
                "privacy_policy_url": "https://www.slack.com",
                "app_homepage_url": "https://www.slack.com",
                "app_directory_url": "https://myteam.enterprise.slack.com/apps/A0W7UKG8E-my-test-app",
                "is_app_directory_approved": false,
                "is_internal": false,
                "developer_type": "third_party",
                "socket_mode_enabled": false,
                "icons": {
                    "image_32": "https://302674312496446w_2bd4ea1ad1f89a23c242_32.png",
                    "image_36": "https://302674312496446w_2bd4ea1ad1f89a23c242_36.png",
                    "image_48": "https://302674312496446w_2bd4ea1ad1f89a23c242_48.png",
                    "image_64": "https://302674312496446w_2bd4ea1ad1f89a23c242_64.png",
                    "image_72": "https://302674312496446w_2bd4ea1ad1f89a23c242_72.png",
                    "image_96": "https://302674312496446w_2bd4ea1ad1f89a23c242_96.png",
                    "image_128": "https://30267341249446w6_2bd4ea1ad1f89a23c242_128.png",
                    "image_192": "https://30267431249446w6_2bd4ea1ad1f89a23c242_192.png",
                    "image_512": "https://30267431249446w6_2bd4ea1ad1f89a23c242_512.png",
                    "image_1024": "https://3026743124446w96_2bd4ea1ad1f89a23c242_1024.png",
                    "image_original": "https://302674446w12496_2bd4ea1ad1f89a23c242_original.png"
                },
                "additional_info": ""
            },
            "scopes": [
                {
                    "name": "bot",
                    "description": "Add the ability for people to direct message or mention @my_test_app",
                    "is_sensitive": true,
                    "token_type": "bot"
                }
            ],
            "date_updated": 1574296707,
            "last_resolved_by": {
                "actor_id": "W0G82F4FD",
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
JSON: https://vs.izie.top/redocumented/api/methods/admin.apps.approved.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
