# apps.datastore.bulkGet

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.datastore.bulkGet

Get items from a datastore in bulk

## Params

| name | required | type | description |
|---|---|---|---|
| `datastore` | yes | string | name of the datastore. |
| `ids` | yes | array | items' ids. |
| `app_id` | no | string |  |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "datastore": "delicious_meals",
    "items": [
        {
            "id": "12462",
            "meal": "Shawarma"
        }
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.datastore.bulkGet.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
