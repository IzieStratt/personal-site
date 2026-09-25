# workflows.templates.list

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/workflows.templates.list

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | number |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `restricted_app_ids` | unknown[] |
| `templates` | Array<{ |
| `id` | string |
| `name` | string |
| `description` | string |
| `small_icon_url` | string |
| `state` | string |
| `localization_state` | string |
| `weight` | number |
| `madlib_sentence` | string |
| `has_restricted_trigger_types` | boolean |
| `localization` | { |
| `locale` | string |
| `has_restricted_apps` | boolean |
| `categories` | string[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/workflows.templates.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
