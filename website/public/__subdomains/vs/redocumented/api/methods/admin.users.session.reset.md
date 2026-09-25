# admin.users.session.reset

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.users.session.reset

Wipes all valid sessions on all devices for a given user

## Params

| name | required | type | description |
|---|---|---|---|
| `user_id` | yes | string | The ID of the user to wipe sessions for. |
| `mobile_only` | no | boolean | Only expire mobile sessions (default: false). |
| `web_only` | no | boolean | Only expire web sessions (default: false). |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.users.session.reset.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
