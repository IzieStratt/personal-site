# files.remote.info

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/files.remote.info

Retrieve information about a remote file added to Slack

## Params

| name | required | type | description |
|---|---|---|---|
| `external_id` | no | string | Creator defined GUID for the file. |
| `file` | no | file | Specify a file by providing its ID. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/files.remote.info.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
