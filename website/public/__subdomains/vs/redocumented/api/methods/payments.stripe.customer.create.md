# payments.stripe.customer.create

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/payments.stripe.customer.create

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `country_code` | no | string |  |
| `currency` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

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
JSON: https://vs.izie.top/redocumented/api/methods/payments.stripe.customer.create.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
