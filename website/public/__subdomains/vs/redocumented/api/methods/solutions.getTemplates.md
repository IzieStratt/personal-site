# solutions.getTemplates

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/solutions.getTemplates

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `templates` | Array<{ |
| `id` | string |
| `icon` | string |
| `name` | string |
| `description` | string |
| `prefix` | string |
| `categories` | string[] |
| `template_items` | { |
| `workflows` | Array<{ |
| `workflow_template_id` | string |
| `title` | string |
| `is_composer_default` | boolean |
| `dependent_items` | Array<{ |
| `object_id` | string |
| `object_type` | string |
| `lists` | Array<{ |
| `list_template_id` | string |
| `canvases` | Array<{ |
| `canvas_template_id` | string |
| `toplevel_team_id` | string |
| `status` | string |
| `creator_id` | string |
| `default_tab` | { |
| `type` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/solutions.getTemplates.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
