# files.comments.delete

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/files.comments.delete

Deletes an existing comment on a file.

## Params

| name | required | type | description |
|---|---|---|---|
| `file` | yes | file | File to delete a comment from. |
| `id` | yes | string | The comment to delete. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/files.comments.delete.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
