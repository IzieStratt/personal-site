# entity.presentDetails

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/entity.presentDetails

Provide custom flexpane behavior for Work Objects. Apps call this endpoint to send per-user flexpane metadata to the client.

## Params

| name | required | type | description |
|---|---|---|---|
| `metadata` | no | object | URL-encoded JSON object containing flexpane metadata from the app that will be conformed to a Work Object metadata schema, keyed by entity ID. |
| `trigger_id` | yes | string | A reference to the original user action that initiated the request. |
| `user_auth_required` | no | boolean | Set to true (or 1) to indicate that the user must authenticate to view full flexpane data. |
| `user_auth_url` | no | string | A custom URL to which users are directed for authentication if required. |
| `error` | no | string |  |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/entity.presentDetails.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
