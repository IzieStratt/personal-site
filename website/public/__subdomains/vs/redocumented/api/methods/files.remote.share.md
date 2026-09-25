# files.remote.share

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/files.remote.share

Share a remote file into a channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `channels` | yes | string | Comma-separated list of channel IDs where the file will be shared. |
| `external_id` | no | string | The globally unique identifier (GUID) for the file, as set by the app registering the file with Slack.  Either this field or file or both are required. |
| `file` | no | file | Specify a file registered with Slack by providing its ID. Either this field or external_id or both are required. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/files.remote.share.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
