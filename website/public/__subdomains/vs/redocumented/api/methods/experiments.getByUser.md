# experiments.getByUser

- status: undocumented
- verified: live-verified
- tokens: team xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/experiments.getByUser

A/B experiment bucket assignments

## Params

| name | required | type | description |
|---|---|---|---|
| `web_client_version` | no | number |  |
| `force_cold_boot` | no | number |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `assignments` | Record<ExperimentsGetByUserAssignmentsName, ExperimentsGetByUserAssignmentsEntry> |
| `config_version_ts` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/experiments.getByUser.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
