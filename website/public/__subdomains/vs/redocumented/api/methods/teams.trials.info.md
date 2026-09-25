# teams.trials.info

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/teams.trials.info

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `trial_info` | { |
| `date_end` | number |
| `date_start` | number |
| `days_extended` | number |
| `has_future_switch` | boolean |
| `is_active` | boolean |
| `product_level` | string |
| `next_product_level` | string |
| `type` | string |
| `subtype` | string |
| `days_remaining` | number |
| `has_base_plan_ai_entitlements` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/teams.trials.info.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
