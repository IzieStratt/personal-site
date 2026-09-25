# apps.datastore.query

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.datastore.query

Query a datastore for items

## Params

| name | required | type | description |
|---|---|---|---|
| `datastore` | yes | string | Name of the datastore. |
| `expression` | no | string | A query filter expression. |
| `expression_attributes` | no | object | A map of attributes referenced in expression. |
| `expression_values` | no | object | A map of values referenced in expression. |
| `app_id` | no | string | Required if calling with user token. |
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |
| `limit` | no | integer | The maximum number of items to evaluate for a given request (not necessarily the number of matching items). If the given request dataset size exceeds 1 MB before reaching the limit, the returned item count will likely be less than the limit. In any case where there are more items available beyond an imposed limit, a next_cursor value will be provided for use in subsequent requests. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "datastore": "good_tunes",
    "items": [
        {
            "artist": "Whitney Houston",
            "song": "I Will Always Love You",
            "id": "4"
        },
        {
            "artist": "Fred Rogers",
            "song": "Won't You Be My Neighbor?",
            "id": "5"
        }
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.datastore.query.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
