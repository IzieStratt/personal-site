# rtm.connect

- status: documented
- verified: docs + live-tested
- tokens: team xoxc works (connect with the d= cookie header); enterprise xoxc returns enterprise_is_restricted. Live-tested 2026-09-25; see methods/block-actions-and-modals-2026-09.md.
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/rtm.connect

Starts a Real Time Messaging session.

## Params

| name | required | type | description |
|---|---|---|---|
| `batch_presence_aware` | no | boolean | Batch presence deliveries via subscription. Enabling changes the shape of presence_change events. See batch presence. |
| `presence_sub` | no | boolean | Only deliver presence events when requested by subscription. See presence subscriptions. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "self": {
        "id": "U4X318ZMZ",
        "name": "robotoverlord"
    },
    "team": {
        "domain": "slackdemo",
        "id": "T2U81E2FP",
        "name": "SlackDemo"
    },
    "url": "wss://..."
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/rtm.connect.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
