# chat.command

- status: undocumented
- verified: not-live-tested
- tokens: Live-tested 2026-09-25 with an xoxp: missing_scope, needed: post (the legacy scope modern apps can't request). See methods/grid-admin-sandbox-2026-09.md.
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/chat.command

Run a slash command server-side

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | Channel to execute the command in. |
| `command` | yes | string | Slash command to be executed. Leading backslash is required. |
| `text` | no | string | Additional parameters provided to the slash command. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `keep_input` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/chat.command.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
