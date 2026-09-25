# channels.prefs.set

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: yes, do not call without a human in the loop
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining); ingoau/huddlefm (source read, commit 2097946; not live-tested)
- call: POST https://slack.com/api/channels.prefs.set

Set per-channel prefs from a JSON string (who_can_post, can_thread, enable_at_here, enable_at_channel); huddlefm uses it on its private companion controls channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | no | string |  |
| `prefs` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified); ingoau/huddlefm (source read, commit 2097946; not live-tested)

## Response

| field | type |
|---|---|
| `ok` | true |
| `prefs` | { |
| `who_can_post` | { |
| `type` | string[] |
| `user` | string[] |
| `can_thread` | { |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/channels.prefs.set.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
