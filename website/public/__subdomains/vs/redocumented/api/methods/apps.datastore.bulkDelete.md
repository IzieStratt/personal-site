# apps.datastore.bulkDelete

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.datastore.bulkDelete

Delete items from a datastore in bulk

## Params

| name | required | type | description |
|---|---|---|---|
| `datastore` | yes | string | name of the datastore. |
| `ids` | yes | array | IDs of items to be deleted. |
| `app_id` | no | string |  |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "failed_items": []
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.datastore.bulkDelete.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
