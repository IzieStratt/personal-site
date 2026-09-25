# teams.company.info

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/teams.company.info

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `is_l28` | boolean |
| `team_type` | string |
| `state` | string |
| `country_iso_code` | string |
| `company_name` | string |
| `company_size` | number |
| `industry` | string |
| `primary_email_domain` | string |
| `size_segmentation` | string |
| `company_size_group` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/teams.company.info.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
