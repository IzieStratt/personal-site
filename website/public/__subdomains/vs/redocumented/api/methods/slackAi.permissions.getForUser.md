# slackAi.permissions.getForUser

- status: undocumented
- verified: partial
- tokens: team xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/slackAi.permissions.getForUser

Slack AI feature permission state

## Params

| name | required | type | description |
|---|---|---|---|
| `permissions` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `allowed` | string[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/slackAi.permissions.getForUser.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
