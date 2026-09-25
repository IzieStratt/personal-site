# files.remote.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/files.remote.list

Retrieve information about a remote file added to Slack

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | no | channel | Filter files appearing in a specific channel, indicated by its ID. |
| `cursor` | no | string | Paginate through collections of data by setting the cursor parameter to a next_cursor attribute returned by a previous request's response_metadata. Default value fetches the first "page" of the collection. See pagination for more detail. |
| `limit` | no | integer | The maximum number of items to return. |
| `ts_from` | no | string | Filter files created after this timestamp (inclusive). |
| `ts_to` | no | string | Filter files created before this timestamp (inclusive). |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/files.remote.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
