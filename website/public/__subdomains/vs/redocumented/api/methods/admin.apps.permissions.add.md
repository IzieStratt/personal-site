# admin.apps.permissions.add

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.apps.permissions.add

Grant permission for entities to access an app that has its permission type set to named_entities

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | yes | string | Encoded ID of the app. |
| `user_ids` | no | array | List of user IDs to allow for named_entities visibility. |
| `usergroup_ids` | no | array | List of encoded usergroup IDs. |
| `channel_ids` | no | array | List of encoded channel IDs to add to the channel restriction list. Interpretation depends on the app's channel_restriction_mode, which is configured via the admin.apps.permissions.set method. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.apps.permissions.add.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
