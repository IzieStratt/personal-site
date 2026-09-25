# apps.datastore.put

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.datastore.put

Creates a new item, or replaces an old item with a new item.

## Params

| name | required | type | description |
|---|---|---|---|
| `datastore` | yes | string | name of the datastore. |
| `item` | yes | object | attribute names and values of the item. |
| `app_id` | no | string |  |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "datastore": "good_tunes",
    "item": {
        "artist": "Whitney Houston",
        "song": "I Will Always Love You",
        "id": "4"
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.datastore.put.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
