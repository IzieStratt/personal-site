# search.autocomplete.offlineFeatures

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/search.autocomplete.offlineFeatures

(inferred from name only; see methods/datamine-2026-09.md)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `top_emojis` | Record<EmojiName, number[]> |
| `top_mpims` | Record<ChannelId, number[]> |
| `top_channels` | Record<ChannelId, number[]> |
| `top_users` | Record<UserId, number[]> |
| `top_app_actions` | Record<AppActionId, number[]> |
| `top_channel_actions` | Record<string, unknown> |
| `top_slash_commands` | Record<string, unknown> |
| `top_workflow_triggers` | Record<WorkflowTriggerId, number[]> |
| `top_global_actions` | Record<string, unknown> |
| `mpim_features` | string[] |
| `channel_features` | string[] |
| `user_features` | string[] |
| `mpim_ctr` | number |
| `channel_ctr` | number |
| `user_ctr` | number |
| `other_ctr` | number |
| `app_action_ctr` | number |
| `slash_command_ctr` | number |
| `workflow_trigger_ctr` | number |
| `global_action_ctr` | number |
| `channel_action_ctr` | number |
| `default_features` | string[] |
| `users_has_dmed` | Record<UserId, { |
| `last_read_abs` | number |
| `users_has_mpdmed` | Record<UserId, { |
| `membership_count` | number |
| `channel_priority_28d` | Record<ChannelId, number> |
| `channel_priority_90d` | Record<ChannelId, number> |
| `user_affinity` | Record<UserId, number> |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/search.autocomplete.offlineFeatures.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
