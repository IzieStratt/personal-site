# client.counts

- status: undocumented
- verified: live-verified
- tokens: enterprise xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/client.counts

Unread/mention counts

## Params

| name | required | type | description |
|---|---|---|---|
| `thread_counts_by_channel` | no | boolean |  |
| `org_wide_aware` | no | boolean |  |
| `include_file_channels` | no | boolean |  |
| `include_all_unreads` | no | boolean |  |
| `dry_run_last_fetched` | no | number |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `threads` | { |
| `has_unreads` | boolean |
| `mention_count` | number |
| `vip_count` | number |
| `mention_count_by_channel` | Record<string, unknown> |
| `unread_count_by_channel` | Record<ChannelId / GroupId, number> |
| `channels` | number |
| `id` | string |
| `last_read` | string |
| `latest` | string |
| `updated` | string |
| `history_invalid` | string |
| `mpims` | Array<{ |
| `ims` | Array<{ |
| `file_channels` | { |
| `quip` | { |
| `list` | { |
| `channel_badges` | { |
| `dms` | number |
| `app_dms` | number |
| `thread_mentions` | number |
| `thread_unreads` | number |
| `alerts` | { |
| `generic_system_alert` | number |
| `saved` | { |
| `uncompleted_count` | number |
| `uncompleted_overdue_count` | number |
| `archived_count` | number |
| `completed_count` | number |
| `total_count` | number |
| `counts_last_fetched` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/client.counts.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
