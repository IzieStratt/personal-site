# functions.workflows.steps.responses.export

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/functions.workflows.steps.responses.export

Download form responses of a workflow

## Params

| name | required | type | description |
|---|---|---|---|
| `workflow_id` | no | string | The workflow ID, starts with Wf*. |
| `workflow` | no | string | The workflow encoded ID or workflow reference. |
| `workflow_app_id` | no | string | The app tied to the workflow reference. |
| `step_id` | yes | string | The ID of the OpenForm step to export. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/functions.workflows.steps.responses.export.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
