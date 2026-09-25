# usergroups.users.update

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/usergroups.users.update

Update the list of users for a user group.

## Params

| name | required | type | description |
|---|---|---|---|
| `include_count` | no | boolean | Include the number of users in the user group. |
| `team_id` | no | string | encoded team id where the user group exists, required if org token is used. |
| `usergroup` | yes | string | The encoded ID of the user group to update. |
| `users` | yes | array | A comma separated string of encoded user IDs that represent the entire list of users for the user group. |
| `additional_channels` | no | array | A comma separated string of encoded channel IDs for which the User Group can custom add usergroup members too. |
| `is_shared` | no | boolean | Boolean to identify if the API is getting called when a shared section is getting shared. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `usergroup` | { |
| `id` | string |
| `team_id` | string |
| `is_usergroup` | boolean |
| `is_subteam` | boolean |
| `name` | string |
| `description` | string |
| `handle` | string |
| `is_external` | boolean |
| `date_create` | number |
| `date_update` | number |
| `date_delete` | number |
| `auto_type` | null |
| `auto_provision` | boolean |
| `created_by` | string |
| `updated_by` | string |
| `deleted_by` | null |
| `is_section` | boolean |
| `is_editing_restricted` | boolean |
| `is_membership_locked` | boolean |
| `is_idp_group` | boolean |
| `is_visible` | boolean |
| `is_org_level` | boolean |
| `prefs` | { |
| `channels` | string[] |
| `groups` | unknown[] |
| `users` | string[] |
| `user_count` | number |
| `channel_count` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/usergroups.users.update.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
