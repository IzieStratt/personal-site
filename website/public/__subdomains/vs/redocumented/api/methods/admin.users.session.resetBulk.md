# admin.users.session.resetBulk

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.users.session.resetBulk

Enqueues an asynchronous job to wipe all valid sessions on all devices for a given list of users

## Params

| name | required | type | description |
|---|---|---|---|
| `user_ids` | yes | array | The list of up to 1,000 user IDs to wipe sessions for. |
| `mobile_only` | no | boolean | Only expire mobile sessions (default: false). |
| `web_only` | no | boolean | Only expire web sessions (default: false). |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.users.session.resetBulk.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
