# slackbot.responses.add

- status: undocumented
- verified: not-live-tested (source-only, typed but unverified)
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: ImShyMike/slack-undoc-client (generated types); see methods/slack-undoc-client-2026.md
- call: POST https://slack.com/api/slackbot.responses.add

params per slack-undoc-client generated types: triggers?: string; responses?: string;

## Params

| name | required | type | description |
|---|---|---|---|
| `triggers` | no | string |  |
| `responses` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `response` | { |
| `id` | string |
| `creator` | string |
| `created` | number |
| `responses` | string[] |
| `triggers` | string[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/slackbot.responses.add.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
