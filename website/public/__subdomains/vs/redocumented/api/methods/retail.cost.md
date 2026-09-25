# retail.cost

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/retail.cost

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `state` | no | string |  |
| `product_id` | no | string |  |
| `is_final_review` | no | boolean |  |
| `checkout_step` | no | string |  |
| `is_future_switch` | no | boolean |  |
| `country` | no | string |  |
| `street1` | no | string |  |
| `zip` | no | string |  |
| `is_business` | no | boolean |  |
| `is_vat_registered` | no | boolean |  |
| `vat_id` | no | string |  |
| `regional_tax_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `plan_cost` | { |
| `product_id` | string |
| `currency` | string |
| `unit_price` | number |
| `billable_active_users` | number |
| `paid_seats` | number |
| `subtotal` | number |
| `undiscounted_subtotal` | number |
| `credits` | { |
| `total_credits` | number |
| `credits_remaining` | number |
| `credits_applied` | number |
| `additional_credits_remaining` | number |
| `total_credits_remaining` | number |
| `total_credits_applied` | number |
| `credit_balance` | number |
| `tax` | { |
| `is_vat` | boolean |
| `tax_name` | string |
| `sales_tax_amt` | number |
| `tax_percentage` | number |
| `suretax_txn_id` | number |
| `recurring_tax_amt` | number |
| `total_recurring` | number |
| `total_due_today` | number |
| `quoted_term_end` | string |
| `quoted_term_start` | string |
| `pre_tax_total` | number |
| `outstanding_invoice_amount` | number |
| `prorated_refund` | number |
| `discounted_unit_price` | number |
| `discount` | { |
| `percentage` | number |
| `duration` | number |
| `type` | string |
| `name` | string |
| `promo_type` | string |
| `amount` | number |
| `addons` | { |
| `purchase` | Record<string, unknown> |
| `refund` | Record<string, unknown> |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/retail.cost.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
