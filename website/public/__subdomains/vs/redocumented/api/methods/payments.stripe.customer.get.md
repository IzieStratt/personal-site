# payments.stripe.customer.get

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/payments.stripe.customer.get

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `account_code` | string |
| `id` | string |
| `created` | number |
| `invoice_settings` | { |
| `default_payment_method` | null |
| `payment_method` | { |
| `types` | unknown[] |
| `wallet` | { |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/payments.stripe.customer.get.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
