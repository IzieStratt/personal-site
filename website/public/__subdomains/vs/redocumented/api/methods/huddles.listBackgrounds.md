# huddles.listBackgrounds

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/huddles.listBackgrounds

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `backgrounds` | Array<{ |
| `id` | string |
| `category_id` | string |
| `category_name` | string |
| `category_order` | number |
| `url` | string |
| `preview_url` | string |
| `artist` | string |
| `name` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/huddles.listBackgrounds.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
