# helpdesk.getArticle

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/helpdesk.getArticle

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `article_id` | no | number |  |
| `locale` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `article` | { |
| `article_id` | number |
| `title` | string |
| `body` | string |
| `is_draft` | boolean |
| `label_names` | string[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/helpdesk.getArticle.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
