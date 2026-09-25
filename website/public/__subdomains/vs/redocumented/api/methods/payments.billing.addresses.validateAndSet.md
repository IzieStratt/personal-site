# payments.billing.addresses.validateAndSet

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/payments.billing.addresses.validateAndSet

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `abn_id` | no | string |  |
| `city` | no | string |  |
| `company_name` | no | string |  |
| `country` | no | string |  |
| `is_business` | no | boolean |  |
| `is_vat_registered` | no | boolean |  |
| `state` | no | string |  |
| `street1` | no | string |  |
| `street2` | no | string |  |
| `vat_id` | no | string |  |
| `waiting_for_vat` | no | boolean |  |
| `zip` | no | string |  |
| `checkout_step` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `id` | number |
| `team_id` | number |
| `date_create` | number |
| `date_update` | number |
| `date_delete` | number |
| `fields` | { |
| `country_code` | string |
| `city` | string |
| `state` | string |
| `street1` | string |
| `street2` | string |
| `zip` | string |
| `date_validate` | null |
| `is_business` | boolean |
| `waiting_for_vat` | boolean |
| `is_vat_registered` | boolean |
| `country` | string |
| `notes` | null |
| `company_name` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/payments.billing.addresses.validateAndSet.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
