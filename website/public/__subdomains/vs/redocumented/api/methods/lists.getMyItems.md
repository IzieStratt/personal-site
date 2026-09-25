# lists.getMyItems

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/lists.getMyItems

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `include_subtasks` | no | boolean |  |
| `include_approvals` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `records` | unknown[] |
| `lists` | unknown[] |
| `counts` | { |
| `todos_count` | number |
| `incomplete_todos_count` | number |
| `incomplete_overdue_todos_count` | number |
| `completed_todos_this_week_count` | number |
| `completed_todos_this_month_count` | number |
| `incomplete_overdue_assigned_count` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/lists.getMyItems.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
