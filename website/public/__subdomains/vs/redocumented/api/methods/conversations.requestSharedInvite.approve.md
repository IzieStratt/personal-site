# conversations.requestSharedInvite.approve

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/conversations.requestSharedInvite.approve

Approves a request to add an external user to a channel and sends them a Slack Connect invite

## Params

| name | required | type | description |
|---|---|---|---|
| `invite_id` | yes | string | ID of the requested shared channel invite to approve. |
| `is_external_limited` | no | boolean | Optional boolean on whether the invited team will have post-only permissions in the channel. Will override the value on the requested invite. |
| `channel_id` | no | string | Optional channel_id to which external user will be invited to. Will override the value on the requested invite. |
| `message` | no | object | Object describing the text to send along with the invite. If this object is specified, both text and is_override are required properties. If is_override is set to true, text will override the original invitation message. Otherwise, text will be appended to the original invitation message. The total length of the message cannot exceed 560 characters. If is_override is set to false, the length of text and the user specified message on the invite request in total must be less than 560 characters. |

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
JSON: https://vs.izie.top/redocumented/api/methods/conversations.requestSharedInvite.approve.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
