# users.discoverableContacts.lookup

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/users.discoverableContacts.lookup

Look up an email address to see if someone is discoverable on Slack

## Params

| name | required | type | description |
|---|---|---|---|
| `email` | yes | string |  |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "is_discoverable": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.discoverableContacts.lookup.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
