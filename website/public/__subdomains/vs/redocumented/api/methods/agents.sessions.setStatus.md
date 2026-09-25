# agents.sessions.setStatus

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/agents.sessions.setStatus

Set an agent session's lifecycle status, creating the session if needed.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | no | string | ID of the channel containing the agent session. Required for public channels. |
| `status` | yes | enum | The lifecycle status to set. |
| `thread_ts` | no | string | Timestamp of the thread root message the session is scoped to. Required for thread-based sessions in regular channels and DMs. Must be omitted for session channels. |
| `title` | no | string | Title for the agent session (max 200 characters). Only used when creating a new session; ignored if the session already exists. To rename an existing session, use agents.sessions.rename. |
| `initiator_user_id` | no | string | The user who initiated the session. Only used when creating a new session; ignored if the session already exists. Must be a member of the channel. |
| `icon_emoji` | no | string | Emoji to use as the agent's icon. Takes priority over icon_url. Remains in effect until you clear it (pass null) or set a new value. Requires the chat:write.customize scope. |
| `icon_url` | no | string | URL to an image to use as the agent's icon. Remains in effect until you clear it (pass null) or set a new value. Requires the chat:write.customize scope. |
| `username` | no | string | Display name override for the agent (max 200 characters). Remains in effect until you clear it (pass null) or set a new value. Requires the chat:write.customize scope. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "status": "processing",
    "agent_status": "processing",
    "title": "Scuba diving research"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/agents.sessions.setStatus.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
