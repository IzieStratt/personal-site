# files.remote.add

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/files.remote.add

Adds a file from a remote service

## Params

| name | required | type | description |
|---|---|---|---|
| `external_id` | yes | string | Creator defined GUID for the file. |
| `external_url` | yes | string | URL of the remote file. |
| `filetype` | no | string | type of file. |
| `indexable_file_contents` | no | string | A text file (txt, pdf, doc, etc.) containing textual search terms that are used to improve discovery of the remote file. |
| `preview_image` | no | string | Preview of the document via multipart/form-data. |
| `title` | yes | string | Title of the file being shared. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/files.remote.add.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
