# slackLists.download.start

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/slackLists.download.start

Initiate a job to export List contents.

## Params

| name | required | type | description |
|---|---|---|---|
| `list_id` | yes | string | ID of the List to export. |
| `include_archived` | no | boolean |  |
| `format` | no | string | Format of the export. Defaults to csv for backward compatibility. Use json for a complete, hierarchical export. |
| `include_threads` | no | boolean | Include each item's conversation thread in the export. Only applies when format is json. |
| `include_attachments` | no | boolean | Include file attachment metadata and access paths in the export. Only applies when format is json. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "job_id": "LeF1234567"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/slackLists.download.start.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
