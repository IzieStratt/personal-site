# slackLists.download.get

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/slackLists.download.get

Retrieve List download URL from an export job to download List contents.

## Params

| name | required | type | description |
|---|---|---|---|
| `list_id` | yes | string | ID of the List to export. |
| `job_id` | yes | string | The ID of the recently started job to export the List. |
| `format` | no | string | Format the export was started with. Must match the format passed to slackLists.download.start. Defaults to csv. |
| `include_threads` | no | boolean | Must match the include_threads passed to slackLists.download.start. The returned download_url carries this through so the served export matches what was generated. Only applies when format is json. |
| `include_attachments` | no | boolean | Must match the include_attachments passed to slackLists.download.start. The returned download_url carries this through so the served export matches what was generated. Only applies when format is json. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "status": "COMPLETED",
    "download_url": "https://files.com/files-pri/1234567890-F12345678/csv/list?origin_team=T1234567890"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/slackLists.download.get.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
