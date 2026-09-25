# gif.featured

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/gif.featured

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | number |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `gifs` | Array<{ |
| `id` | string |
| `url` | string |
| `content_description` | string |
| `media_formats` | { |
| `gif` | { |
| `duration` | number |
| `dims` | number[] |
| `size` | number |
| `preview` | string |
| `tinygifpreview` | { |
| `mp4` | { |
| `tinygif` | { |
| `gifpreview` | { |
| `response_metadata` | { |
| `next_cursor` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/gif.featured.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
