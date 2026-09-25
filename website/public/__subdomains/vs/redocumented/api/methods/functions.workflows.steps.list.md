# functions.workflows.steps.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/functions.workflows.steps.list

List the steps of a specific function of a workflow's versions

## Params

| name | required | type | description |
|---|---|---|---|
| `workflow_id` | no | string | The workflow ID, starts with Wf*. |
| `workflow` | no | string | The workflow encoded ID or workflow reference. |
| `workflow_app_id` | no | string | The app tied to the workflow reference. |
| `function_id` | yes | string | The ID of the function to query. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `steps_versions` | Array<{ |
| `title` | { |
| `workflow_id` | string |
| `step_id` | string |
| `is_deleted` | boolean |
| `workflow_version_created` | string |
| `inputs` | { |
| `value` | string |
| `hidden` | boolean |
| `locked` | boolean |
| `fields` | { |
| `required` | string[] |
| `interactivity` | { |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/functions.workflows.steps.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
