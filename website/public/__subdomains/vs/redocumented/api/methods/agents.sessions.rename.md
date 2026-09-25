# agents.sessions.rename

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/agents.sessions.rename

Rename an agent session.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | no | string | ID of the channel containing the agent session. Required for public channels. |
| `title` | yes | string | New title for the agent session (1-200 characters). For a session channel, this also renames the channel. |
| `thread_ts` | no | string | Timestamp of the thread root message the session is scoped to. Required for thread-based sessions in regular channels and DMs. Must be omitted for session channels. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "title": "Bora Bora trip prep"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/agents.sessions.rename.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
