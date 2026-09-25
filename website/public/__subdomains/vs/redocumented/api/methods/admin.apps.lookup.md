# admin.apps.lookup

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/admin.apps.lookup

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | no | string |  |
| `app_ids` | no | string |  |
| `include_non_distributed_functions` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `apps` | Record<string, { |
| `status` | string |
| `function_count` | number |
| `domain_allowlisting_enabled` | boolean |
| `is_email_domain_restriction_allowed` | boolean |
| `has_3p_oauth_provider` | boolean |
| `is_work_object_enabled` | boolean |
| `trigger_type_count` | number |
| `is_ai_app` | boolean |
| `is_agent_app` | boolean |
| `is_search_app` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.apps.lookup.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
