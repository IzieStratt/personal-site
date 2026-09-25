# admin.workflows.search

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.workflows.search

Search workflows within the team or enterprise

## Params

| name | required | type | description |
|---|---|---|---|
| `query` | no | string | A search query to filter for workflow name or description. |
| `app_id` | no | string | The parent app ID for which to return workflows. |
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |
| `limit` | no | integer | The number of results that will be returned by the API on each invocation. |
| `no_collaborators` | no | boolean | Only include workflows with no collaborators in the result; default is false. |
| `collaborator_ids` | no | array | Only include workflows where all of the provided user IDs are a manager/collaborator of that workflow. |
| `num_trigger_ids` | no | integer | Number of trigger IDs to fetch for each workflow; default is 10. |
| `is_sales_elevate` | no | boolean | Filter workflows by their Sales Elevate status. |
| `source` | no | enum | Source of workflow creation, either from code or workflow builder. |
| `sort` | no | enum | The field used to sort the returned workflows. |
| `sort_dir` | no | enum | Sort direction. Possible values are asc for ascending order like (1, 2, 3) or (a, b, c), and desc for descending order like (3, 2, 1) or (c, b, a). |
| `trigger_type_id` | no | string | Only include workflows with this trigger type. |
| `publish_status` | no | enum | Filter workflows by their published status. |
| `step_function_ids` | no | array | Only include workflows that use all of the provided step function ids. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `workflows` | unknown[] |
| `total_found` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.workflows.search.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
