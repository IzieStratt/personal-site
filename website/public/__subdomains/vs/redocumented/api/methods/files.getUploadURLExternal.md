# files.getUploadURLExternal

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/files.getUploadURLExternal

Gets a URL for an edge external file upload

## Params

| name | required | type | description |
|---|---|---|---|
| `length` | yes | integer | Size in bytes of the file being uploaded. |
| `filename` | yes | string | Name of the file being uploaded. |
| `snippet_type` | no | string | Syntax type of the snippet being uploaded. |
| `alt_txt` | no | string | Description of image for screen-reader. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "upload_url": "https://files.slack.com/upload/v1/ABC123...",
    "file_id": "F123ABC456"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/files.getUploadURLExternal.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
