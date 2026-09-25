# workflows.featured.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/workflows.featured.list

List the featured workflows for specified channels.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_ids` | yes | array | Comma-separated array of channel IDs to list featured workflows for. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "featured_workflows": [
        {
            "channel_id": "C012345678",
            "triggers": [
                {
                    "id": "Ft1234",
                    "title": "Tabby workflow"
                },
                {
                    "id": "Ft5678",
                    "title": "Tortoise workflow"
                }
            ]
        },
        {
            "channel_id": "C987654321",
            "triggers": [
                {
                    "id": "Ft1234",
                    "title": "Ragdoll workflow"
                },
                {
                    "id": "Ft5678",
                    "title": "Calico workflow"
                }
            ]
        }
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/workflows.featured.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
