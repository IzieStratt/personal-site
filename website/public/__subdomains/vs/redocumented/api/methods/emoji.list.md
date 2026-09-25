# emoji.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/emoji.list

Lists custom emoji for a team.

## Params

| name | required | type | description |
|---|---|---|---|
| `include_categories` | no | boolean | Include a list of categories for Unicode emoji and the emoji in each category. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/emoji.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
