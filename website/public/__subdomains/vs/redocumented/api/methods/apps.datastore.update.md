# apps.datastore.update

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.datastore.update

Edits an existing item's attributes, or adds a new item if it does not already exist.

## Params

| name | required | type | description |
|---|---|---|---|
| `datastore` | yes | string | name of the datastore. |
| `item` | yes | object | attribute names and values to be updated. |
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
JSON: https://vs.izie.top/redocumented/api/methods/apps.datastore.update.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
