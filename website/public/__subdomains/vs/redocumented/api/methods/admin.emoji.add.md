# admin.emoji.add

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.emoji.add

Add an emoji.

## Params

| name | required | type | description |
|---|---|---|---|
| `name` | yes | string | The name of the emoji to be added (using lower-case letters only). Colons (:myemoji:) around the value are not required, although they may be included. |
| `url` | no | string | The URL of a file to use as an image for the emoji. Square images under 128KB and with transparent backgrounds work best. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.emoji.add.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
