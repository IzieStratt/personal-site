# admin.emoji.remove

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.emoji.remove

Remove an emoji across an Enterprise organization

## Params

| name | required | type | description |
|---|---|---|---|
| `name` | yes | string | The name of the emoji to be removed. Colons (:myemoji:) around the value are not required, although they may be included. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.emoji.remove.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
