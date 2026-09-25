# canvases.sections.lookup

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/canvases.sections.lookup

Find sections matching the provided criteria

## Params

| name | required | type | description |
|---|---|---|---|
| `canvas_id` | yes | string | Encoded ID of the canvas. |
| `criteria` | yes | string | Filtering criteria. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "sections": [
        {
            "id": "temp:C:eBa219af721c664422cb90a52fac"
        }
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/canvases.sections.lookup.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
