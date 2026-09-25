# conversations.requestSharedInvite.deny

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/conversations.requestSharedInvite.deny

Denies a request to invite an external user to a channel

## Params

| name | required | type | description |
|---|---|---|---|
| `invite_id` | yes | string | ID of the requested shared channel invite to deny. |
| `message` | no | string | Optional message explaining why the request to invite was denied. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "invite_id": "I012345ABCD"
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.requestSharedInvite.deny.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
