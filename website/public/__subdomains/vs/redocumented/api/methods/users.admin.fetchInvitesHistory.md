# users.admin.fetchInvitesHistory

- status: undocumented
- verified: not-live-tested (source-only, typed but unverified)
- tokens: unknown
- write-shaped name: no
- source: ImShyMike/slack-undoc-client (generated types); see methods/slack-undoc-client-2026.md
- call: POST https://slack.com/api/users.admin.fetchInvitesHistory

params per slack-undoc-client generated types: type?: string; query?: string; sort_dir?: string; sort_by?: string;

## Params

| name | required | type | description |
|---|---|---|---|
| `type` | no | string |  |
| `query` | no | string |  |
| `sort_dir` | no | string |  |
| `sort_by` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `next_cursor` | null |
| `invites` | unknown[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.admin.fetchInvitesHistory.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
