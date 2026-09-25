# admin.workflows.collaborators.add

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.workflows.collaborators.add

Add collaborators to workflows within the team or enterprise

## Params

| name | required | type | description |
|---|---|---|---|
| `workflow_ids` | yes | array | Array of workflow IDs to edit; max 50. |
| `collaborator_ids` | yes | array | Array of collaborators (encoded user IDs) to add; max 50. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.workflows.collaborators.add.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
