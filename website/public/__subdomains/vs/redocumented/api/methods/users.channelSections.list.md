# users.channelSections.list

- status: undocumented
- verified: live-verified
- tokens: enterprise xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/users.channelSections.list

Sidebar channel-section definitions

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `channel_sections` | Array<{ |
| `channel_section_id` | string |
| `name` | string |
| `type` | string |
| `next_channel_section_id` | string |
| `last_updated` | number |
| `channel_ids_page` | { |
| `channel_ids` | string[] |
| `count` | number |
| `cursor` | string |
| `is_redacted` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.channelSections.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
