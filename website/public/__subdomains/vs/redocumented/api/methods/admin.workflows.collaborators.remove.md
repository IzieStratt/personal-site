# admin.workflows.collaborators.remove

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.workflows.collaborators.remove

Remove collaborators from workflows within the team or enterprise

## Params

| name | required | type | description |
|---|---|---|---|
| `workflow_ids` | yes | array | Array of workflow IDs to edit; max 50. |
| `collaborator_ids` | yes | array | Array of collaborators (encoded user IDs) to remove; max 50. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.workflows.collaborators.remove.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
