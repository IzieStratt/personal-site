# apps.datastore.bulkPut

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.datastore.bulkPut

Creates or replaces existing items in bulk

## Params

| name | required | type | description |
|---|---|---|---|
| `datastore` | yes | string | name of the datastore. |
| `items` | yes | array | attribute names and values of the items; limit of 25. |
| `app_id` | no | string |  |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "datastore": "delicious_meals",
    "failed_items": []
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.datastore.bulkPut.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
