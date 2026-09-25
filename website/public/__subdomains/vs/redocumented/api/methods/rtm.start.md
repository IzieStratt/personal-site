# rtm.start

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/rtm.start

Deprecated: Starts a Real Time Messaging session. Use rtm.connect instead.

## Params

| name | required | type | description |
|---|---|---|---|
| `simple_latest` | no | boolean | Return timestamp only for latest message object of each channel (improves performance). |
| `no_unreads` | no | boolean | Skip unread counts for each channel (improves performance). |
| `mpim_aware` | no | boolean | Returns MPIMs to the client in the API response. |
| `presence_sub` | no | boolean | Only deliver presence events when requested by subscription. See presence subscriptions. |
| `batch_presence_aware` | no | boolean | Batch presence deliveries via subscription. Enabling changes the shape of presence_change events. See batch presence. |
| `no_latest` | no | boolean | Exclude latest timestamps for channels, groups, mpims, and ims. Automatically sets no_unreads to 1. |
| `include_locale` | no | boolean | Set this to true to receive the locale for users and channels. Defaults to false. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/rtm.start.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
