# admin.workflows.permissions.lookup

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.workflows.permissions.lookup

Look up the permissions for a set of workflows

## Params

| name | required | type | description |
|---|---|---|---|
| `workflow_ids` | yes | array | An array of workflow IDs to look up permissions for. |
| `max_workflow_triggers` | no | integer | Maximum number of triggers to fetch for each workflow when determining overall run permissions; max 1000. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.workflows.permissions.lookup.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
