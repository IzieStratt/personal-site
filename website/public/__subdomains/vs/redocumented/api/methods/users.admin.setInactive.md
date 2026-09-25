# users.admin.setInactive

- status: undocumented
- verified: not-live-tested
- tokens: admin session
- write-shaped name: yes, do not call without a human in the loop
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/users.admin.setInactive

Legacy admin user deactivation

## Params

| name | required | type | description |
|---|---|---|---|
| `user` | yes | user | User to disable |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.admin.setInactive.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
