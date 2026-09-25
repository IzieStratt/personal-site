# payments.checkout.config

- status: undocumented
- verified: not-live-tested (source-only, typed but unverified)
- tokens: unknown
- write-shaped name: no
- source: ImShyMike/slack-undoc-client (generated types); see methods/slack-undoc-client-2026.md
- call: POST https://slack.com/api/payments.checkout.config

params per slack-undoc-client generated types: is_business_plus_trial?: boolean; is_autocharge_trial?: boolean;

## Params

| name | required | type | description |
|---|---|---|---|
| `is_business_plus_trial` | no | boolean |  |
| `is_autocharge_trial` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `allowed_payment_methods` | string[] |
| `available_terms` | string[] |
| `product` | { |
| `id` | string |
| `level` | string |
| `is_trial` | boolean |
| `currency` | string |
| `term` | string |
| `is_future_switch` | boolean |
| `redirect_url` | string |
| `selected_payment_method` | string |
| `is_eligible_for_data_deletion` | boolean |
| `current_product` | { |
| `is_invoice` | boolean |
| `auto_detected_country_code` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/payments.checkout.config.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
