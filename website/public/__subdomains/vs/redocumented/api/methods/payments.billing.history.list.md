# payments.billing.history.list

- status: undocumented
- verified: not-live-tested (source-only, typed but unverified)
- tokens: unknown
- write-shaped name: no
- source: ImShyMike/slack-undoc-client (generated types); see methods/slack-undoc-client-2026.md
- call: POST https://slack.com/api/payments.billing.history.list

params per slack-undoc-client generated types: limit?: number; cursor?: string;

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | number |  |
| `cursor` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `billing_items` | Array<{ |
| `id` | number |
| `type` | string |
| `date_create` | number |
| `status` | string |
| `credits` | { |
| `amount` | number |
| `currency` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/payments.billing.history.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
