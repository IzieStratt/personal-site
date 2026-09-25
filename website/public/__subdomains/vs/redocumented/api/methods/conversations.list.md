# conversations.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/conversations.list

Lists all channels in a Slack team.

## Params

| name | required | type | description |
|---|---|---|---|
| `cursor` | no | string | Paginate through collections of data by setting the cursor parameter to a next_cursor attribute returned by a previous request's response_metadata. Default value fetches the first "page" of the collection. See pagination for more detail. |
| `exclude_archived` | no | boolean | Set to true to exclude archived channels from the list. |
| `limit` | no | number | The maximum number of items to return. Fewer than the requested number of items may be returned, even if the end of the list hasn't been reached. Must be an integer under 1000. |
| `team_id` | no | string | encoded team id to list channels in, required if token belongs to org-wide app. |
| `types` | no | string | Mix and match channel types by providing a comma-separated list of any combination of public_channel, private_channel, mpim, im. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `channels` | Array<{ |
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
| `pending_connected_team_ids` | unknown[] |
| `is_member` | boolean |
| `num_members` | number |
| `properties` | { |
| `tabs` | Array<{ |
| `type` | string |
| `label` | string |
| `tabz` | Array<{ |
| `use_case` | string |
| `previous_names` | unknown[] |
| `response_metadata` | { |
| `next_cursor` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
