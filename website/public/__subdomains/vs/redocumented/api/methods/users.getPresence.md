# users.getPresence

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/users.getPresence

Gets user presence information.

## Params

| name | required | type | description |
|---|---|---|---|
| `user` | no | user | User to get presence info on. Defaults to the authed user. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "presence": "active"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.getPresence.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
