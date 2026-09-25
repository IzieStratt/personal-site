# users.prefs.setNotifications

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: yes, do not call without a human in the loop
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/users.prefs.setNotifications

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `name` | no | string |  |
| `value` | no | boolean |  |
| `channel_ids` | no | string |  |
| `global` | no | boolean |  |
| `sync` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `all_notifications_prefs` | { |
| `channels` | Record<ChannelId, { |
| `muted` | boolean |
| `global` | { |
| `desktop_sound` | string |
| `priority_desktop_sound` | string |
| `global_desktop` | string |
| `global_keywords` | string |
| `global_mobile` | string |
| `global_mpdm_desktop` | string |
| `global_mpdm_mobile` | string |
| `mobile_sound` | string |
| `no_text_in_notifications` | boolean |
| `push_idle_wait` | number |
| `push_show_preview` | boolean |
| `threads_everything` | boolean |
| `global_desktop_push_enabled` | boolean |
| `global_channels_in_activity` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.prefs.setNotifications.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
