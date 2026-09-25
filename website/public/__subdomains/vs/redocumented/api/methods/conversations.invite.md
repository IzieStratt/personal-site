# conversations.invite

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/conversations.invite

Invites users to a channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | The ID of the public or private channel to invite user(s) to. |
| `force` | no | boolean | When set to true and multiple user IDs are provided, continue inviting the valid ones while disregarding invalid IDs. Defaults to false. |
| `users` | yes | string | A comma separated list of user IDs. Up to 1000 users may be listed. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `channel` | { |
| `id` | string |
| `created` | number |
| `creator` | string |
| `is_org_shared` | boolean |
| `is_im` | boolean |
| `context_team_id` | string |
| `updated` | number |
| `name` | string |
| `name_normalized` | string |
| `is_channel` | boolean |
| `is_group` | boolean |
| `is_mpim` | boolean |
| `is_private` | boolean |
| `is_archived` | boolean |
| `is_general` | boolean |
| `is_shared` | boolean |
| `is_ext_shared` | boolean |
| `unlinked` | number |
| `is_pending_ext_shared` | boolean |
| `pending_shared` | unknown[] |
| `parent_conversation` | null |
| `purpose` | { |
| `value` | string |
| `last_set` | number |
| `topic` | { |
| `shared_team_ids` | string[] |
| `internal_team_ids` | string[] |
| `pending_connected_team_ids` | unknown[] |
| `is_member` | boolean |
| `is_open` | boolean |
| `last_read` | string |
| `latest` | { |
| `subtype` | string |
| `user` | string |
| `text` | string |
| `inviter` | string |
| `type` | string |
| `ts` | string |
| `unread_count` | number |
| `unread_count_display` | number |
| `properties` | { |
| `canvas` | { |
| `file_id` | string |
| `quip_thread_id` | string |
| `is_migrated` | boolean |
| `meeting_notes` | { |
| `tabs` | Array<{ |
| `data` | { |
| `shared_ts` | string |
| `label` | string |
| `is_disabled` | boolean |
| `tabz` | Array<{ |
| `is_moved` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.invite.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
