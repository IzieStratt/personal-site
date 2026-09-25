# admin.workflows.triggers.types.permissions.lookup

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.workflows.triggers.types.permissions.lookup

List the permissions for using each trigger type.

## Params

| name | required | type | description |
|---|---|---|---|
| `trigger_type_ids` | yes | array | The trigger type IDs for which to get the permissions. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `permissions` | { |
| `Ftt0101` | { |
| `trigger_type` | { |
| `permission` | string |
| `private_channel_access` | { |
| `private_channel_message` | { |
| `Ftt0107` | { |
| `Ftt0104` | { |
| `Ftt010C` | { |
| `Ftt010D` | { |
| `Ftt010E` | { |
| `Ftt010F` | { |
| `Ftt010G` | { |
| `Ftt010J` | { |
| `Ftt0109` | { |
| `Ftt0106` | { |
| `Ftt010L` | { |
| `Ftt010H` | { |
| `Ftt0103` | { |
| `Ftt010V` | { |
| `Ftt010U` | { |
| `Ftt010M` | { |
| `Ftt07DZQN5VHC` | { |
| `metadata` | { |
| `date_released` | number |
| `workflows_using` | number |
| `available_in_workflow_builder` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.workflows.triggers.types.permissions.lookup.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
