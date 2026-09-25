# apps.datastore.count

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.datastore.count

Count the number of items in a datastore that match a query

## Params

| name | required | type | description |
|---|---|---|---|
| `datastore` | yes | string | Name of the datastore. |
| `expression` | no | string | A query filter expression. |
| `expression_attributes` | no | object | A map of attributes referenced in expression. |
| `expression_values` | no | object | A map of values referenced in expression. |
| `app_id` | no | string | Required if calling with user token. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "datastore": "good_tunes",
    "count": 2
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.datastore.count.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
