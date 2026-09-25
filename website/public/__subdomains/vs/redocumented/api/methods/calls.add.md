# calls.add

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/calls.add

Registers a new Call.

## Params

| name | required | type | description |
|---|---|---|---|
| `external_unique_id` | yes | string | An ID supplied by the 3rd-party Call provider. It must be unique across all Calls from that service. |
| `external_display_id` | no | string | An optional, human-readable ID supplied by the 3rd-party Call provider. If supplied, this ID will be displayed in the Call object. |
| `join_url` | yes | string | The URL required for a client to join the Call. |
| `desktop_app_join_url` | no | string | When supplied, available Slack clients will attempt to directly launch the 3rd-party Call with this URL. |
| `date_start` | no | integer | Unix timestamp of the call start time. |
| `title` | no | string | The name of the Call. |
| `created_by` | no | string | The valid Slack user ID of the user who created this Call. When this method is called with a user token, the created_by field is optional and defaults to the authed user of the token. Otherwise, the field is required. |
| `users` | no | array | The list of users to register as participants in the Call. Read more on how to specify users here. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/calls.add.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
