# payments.status.get

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/payments.status.get

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `provisions_status` | { |
| `level` | string |
| `renewal_level` | string |
| `term_info` | { |
| `term` | string |
| `start_dt` | string |
| `start_ts` | number |
| `total_time` | number |
| `total_days` | number |
| `remaining_days` | number |
| `fraction` | number |
| `product_name_for_display` | string |
| `payment_method` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/payments.status.get.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
