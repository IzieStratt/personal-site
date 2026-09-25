# openid.connect.userInfo

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/openid.connect.userInfo

Get the identity of a user who has authorized Sign in with Slack.

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

```json
{
    "ok": true,
    "sub": "U0R7JM",
    "https://slack.com/user_id": "U0R7JM",
    "https://slack.com/team_id": "T0R7GR",
    "email": "krane@slack-corp.com",
    "email_verified": true,
    "date_email_verified": 1622128723,
    "name": "krane",
    "picture": "https://secure.gravatar.com/....png",
    "given_name": "Bront",
    "family_name": "Labradoodle",
    "locale": "en-US",
    "https://slack.com/team_name": "kraneflannel",
    "https://slack.com/team_domain": "kraneflannel",
    "https://slack.com/user_image_24": "...",
    "https://slack.com/user_image_32": "...",
    "https://slack.com/user_image_48": "...",
    "https://slack.com/user_image_72": "...",
    "https://slack.com/user_image_192": "...",
    "https://slack.com/user_image_512": "...",
    "https://slack.com/team_image_34": "...",
    "https://slack.com/team_image_44": "...",
    "https://slack.com/team_image_68": "...",
    "https://slack.com/team_image_88": "...",
    "https://slack.com/team_image_102": "...",
    "https://slack.com/team_image_132": "...",
    "https://slack.com/team_image_230": "...",
    "https://slack.com/team_image_default": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/openid.connect.userInfo.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
