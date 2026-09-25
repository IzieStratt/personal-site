# calls.update

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/calls.update

Updates information about a Call.

## Params

| name | required | type | description |
|---|---|---|---|
| `id` | yes | string | id returned by the calls.add method. |
| `title` | no | string | The name of the Call. |
| `join_url` | no | string | The URL required for a client to join the Call. |
| `desktop_app_join_url` | no | string | When supplied, available Slack clients will attempt to directly launch the 3rd-party Call with this URL. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/calls.update.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
