# admin.emoji.rename

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.emoji.rename

Rename an emoji.

## Params

| name | required | type | description |
|---|---|---|---|
| `name` | yes | string | The name of the emoji to be renamed. Colons (:myemoji:) around the value are not required, although they may be included. |
| `new_name` | yes | string | The new name of the emoji. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.emoji.rename.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
