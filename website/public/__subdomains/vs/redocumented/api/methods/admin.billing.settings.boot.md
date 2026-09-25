# admin.billing.settings.boot

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/admin.billing.settings.boot

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `can_change_purchase_settings` | boolean |
| `current_product_id` | string |
| `is_current_product_trial` | boolean |
| `is_team_in_dunning` | boolean |
| `next_product_id` | string |
| `should_show_billing_email_daily_setting` | boolean |
| `should_show_billing_email_monthly_setting` | boolean |
| `should_show_request_settings` | boolean |
| `auto_detected_country_code` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.billing.settings.boot.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
