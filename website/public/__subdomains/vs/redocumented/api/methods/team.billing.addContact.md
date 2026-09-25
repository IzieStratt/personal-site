# team.billing.addContact

- status: undocumented
- verified: not-live-tested (source-only, typed but unverified)
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: ImShyMike/slack-undoc-client (generated types); see methods/slack-undoc-client-2026.md
- call: POST https://slack.com/api/team.billing.addContact

params per slack-undoc-client generated types: email?: string;

## Params

| name | required | type | description |
|---|---|---|---|
| `email` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `primary_owner` | boolean |
| `contacts` | Array<{ |
| `id` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/team.billing.addContact.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
