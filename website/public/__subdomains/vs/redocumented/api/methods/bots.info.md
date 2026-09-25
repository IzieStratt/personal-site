# bots.info

- status: documented
- verified: live-verified
- tokens: Live-verified 2026-09-20. team_id was NOT required despite the docs saying it's 'required if org token is used' -- omitting it worked fine, with either xoxc scope. Correction from testing a second app the same day: which xoxc scope can actually see a given bot is NOT uniform -- one app's bot only resolved via the team-scoped xoxc, a second app's bot only resolved via the enterprise-scoped one (bot_not_found on the wrong scope either way). Try both, don't assume either is universal. The response's deleted field is a clean, low-privilege signal for whether a bot/app is currently installed vs uninstalled (false = active, true = removed), without needing any admin.* scope at all. See methods/admin-write-scope-2026-09.md. | Addendum 2026-09-25: with an org-level xoxb (Grid, CLI install), team_id IS required (missing_argument, arg: team_id). After an org-wide admin.apps.uninstall it returns bot_not_found rather than deleted:true; the bot user still exists with profile.bot_id/api_app_id. See methods/grid-admin-sandbox-2026-09.md.
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/bots.info

Gets information about a bot user.

## Params

| name | required | type | description |
|---|---|---|---|
| `bot` | no | user | Bot user to get info on. |
| `team_id` | no | string | encoded team id or enterprise id where the bot exists, required if org token is used. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "bot": {
        "id": "B123456",
        "deleted": false,
        "name": "beforebot",
        "updated": 1449272004,
        "app_id": "A123456",
        "user_id": "U123456",
        "icons": {
            "image_36": "https://...",
            "image_48": "https://...",
            "image_72": "https://..."
        }
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/bots.info.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
