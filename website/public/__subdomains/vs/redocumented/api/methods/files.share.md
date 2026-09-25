# files.share

- status: undocumented
- verified: not-live-tested
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/files.share

Share an already-uploaded file into a channel

## Params

| name | required | type | description |
|---|---|---|---|
| `file` | yes | string | ID of the file to be shared |
| `channel` | yes | channel | Channel to share the file in. Works with both public (channel ID) and private channels (group ID). |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `file_msg_ts` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/files.share.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
