# users.setPresence

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/users.setPresence

Manually sets user presence.

## Params

| name | required | type | description |
|---|---|---|---|
| `presence` | yes | enum | Either auto or away. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.setPresence.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
