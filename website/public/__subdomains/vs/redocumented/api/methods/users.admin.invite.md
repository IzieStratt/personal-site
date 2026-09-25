# users.admin.invite

- status: undocumented
- verified: not-live-tested
- tokens: admin session
- write-shaped name: yes, do not call without a human in the loop
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/users.admin.invite

Legacy admin user invite

## Params

| name | required | type | description |
|---|---|---|---|
| `email` | yes | string | Email address of the new user |
| `channels` | no | string | Comma-separated list of IDs (not names!) for channels, which the new user will auto-join. Both channel IDs for public channels and group IDs for private chanels work. |
| `first_name` | no | string | Prefilled input for the "First name" field on the "new user registration" page. |
| `last_name` | no | string | Prefilled input for the "Last name" field on the "new user registration" page. |
| `resend` | no | string | Resend the invitation email if the user has already been invited and the email was sent some time ago. |
| `restricted` | no | string | Invite a guest that can use multiple channels |
| `ultra_restricted` | no | string | Invite a guest that can use one channel only |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.admin.invite.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
