# files.remote.update

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/files.remote.update

Updates an existing remote file.

## Params

| name | required | type | description |
|---|---|---|---|
| `external_id` | no | string | Creator defined GUID for the file. |
| `external_url` | no | string | URL of the remote file. |
| `file` | no | file | Specify a file by providing its ID. |
| `filetype` | no | string | type of file. |
| `indexable_file_contents` | no | string | File containing contents that can be used to improve searchability for the remote file. |
| `preview_image` | no | string | Preview of the document via multipart/form-data. |
| `title` | no | string | Title of the file being shared. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/files.remote.update.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
