# payments.billing.addresses.locations

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/payments.billing.addresses.locations

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `checkout_step` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `countries` | string[] |
| `us_states` | Record<PaymentsBillingAddressesLocationsUsStatesName, PaymentsBillingAddressesLocationsUsStatesEntry> |
| `canada_states` | { |
| `Alberta` | string |
| `Manitoba` | string |
| `Nunavut` | string |
| `Ontario` | string |
| `Quebec` | string |
| `Saskatchewan` | string |
| `Yukon` | string |
| `taxable_zipcodes` | Record<string, unknown> |
| `vat_countries` | Record<PaymentsBillingAddressesLocationsVatCountriesName, PaymentsBillingAddressesLocationsVatCountriesEntry> |
| `abn_countries` | { |
| `Australia` | string |
| `country_map` | Record<PaymentsBillingAddressesLocationsCountryMapName, PaymentsBillingAddressesLocationsCountryMapEntry> |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/payments.billing.addresses.locations.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
