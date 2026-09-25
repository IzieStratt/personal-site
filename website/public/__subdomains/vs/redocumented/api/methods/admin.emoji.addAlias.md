# admin.emoji.addAlias

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.emoji.addAlias

Add an emoji alias.

## Params

| name | required | type | description |
|---|---|---|---|
| `name` | yes | string | The new alias for the specified emoji. Any wrapping whitespace or colons will be automatically trimmed. |
| `alias_for` | yes | string | Name of the emoji for which the alias is being made. Any wrapping whitespace or colons will be automatically trimmed. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.emoji.addAlias.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
