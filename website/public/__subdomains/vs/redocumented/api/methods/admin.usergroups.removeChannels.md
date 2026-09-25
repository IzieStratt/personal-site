# admin.usergroups.removeChannels

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.usergroups.removeChannels

Remove one or more default channels from an org-level IDP group (user group).

## Params

| name | required | type | description |
|---|---|---|---|
| `usergroup_id` | yes | string | ID of the IDP Group. |
| `channel_ids` | yes | array | Comma-separated string of channel IDs. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.usergroups.removeChannels.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
