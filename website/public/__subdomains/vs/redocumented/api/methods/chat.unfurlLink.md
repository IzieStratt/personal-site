# chat.unfurlLink

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/chat.unfurlLink

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `url` | no | string |  |
| `channel` | no | string |  |
| `client_msg_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `attachments` | Record<Url, { |
| `fallback` | string |
| `from_url` | string |
| `ts` | string |
| `author_id` | string |
| `author_subname` | string |
| `channel_id` | string |
| `channel_team` | string |
| `channel_name` | string |
| `is_msg_unfurl` | boolean |
| `text` | string |
| `message_blocks` | Array<{ |
| `team` | string |
| `channel` | string |
| `message` | { |
| `blocks` | Array<{ |
| `type` | string |
| `block_id` | string |
| `author_name` | string |
| `author_link` | string |
| `author_icon` | string |
| `mrkdwn_in` | string[] |
| `from_hidden_wksp` | boolean |
| `id` | number |
| `original_url` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/chat.unfurlLink.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
