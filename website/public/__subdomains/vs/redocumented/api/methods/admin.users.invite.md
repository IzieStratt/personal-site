# admin.users.invite

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.users.invite

Invite a user to a workspace.

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | yes | string | The ID (T1234) of the workspace. |
| `email` | yes | string | The email address of the person to invite. |
| `channel_ids` | yes | string | A comma-separated list of channel_ids for this user to join. At least one channel is required. |
| `custom_message` | no | string | An optional message to send to the user in the invite email. |
| `real_name` | no | string | Full name of the user. |
| `resend` | no | boolean | Allow this invite to be resent in the future if a user has not signed up yet. Resending can only be done via the UI and has no expiration. (default: false). |
| `is_restricted` | no | boolean | Is this user a multi-channel guest user? (default: false). |
| `is_ultra_restricted` | no | boolean | Is this user a single channel guest user? (default: false). |
| `guest_expiration_ts` | no | string | Timestamp when guest account should be disabled. Only include this timestamp if you are inviting a guest user and you want their account to expire on a certain date. |
| `email_password_policy_enabled` | no | boolean | Allow invited user to sign in via email and password. Only available for Enterprise org teams via admin invite. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.users.invite.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
