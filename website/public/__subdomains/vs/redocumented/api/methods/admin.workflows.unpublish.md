# admin.workflows.unpublish

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.workflows.unpublish

Unpublish workflows within the team or enterprise

## Params

| name | required | type | description |
|---|---|---|---|
| `workflow_ids` | yes | array | Array of workflow IDs to unpublish. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.workflows.unpublish.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
