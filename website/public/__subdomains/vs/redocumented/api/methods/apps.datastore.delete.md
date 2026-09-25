# apps.datastore.delete

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.datastore.delete

Delete an item from a datastore

## Params

| name | required | type | description |
|---|---|---|---|
| `datastore` | yes | string | name of the datastore. |
| `id` | yes | string | item id. |
| `app_id` | no | string |  |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.datastore.delete.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
