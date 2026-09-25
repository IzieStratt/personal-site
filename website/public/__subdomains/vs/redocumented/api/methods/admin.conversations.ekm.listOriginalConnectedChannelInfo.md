# admin.conversations.ekm.listOriginalConnectedChannelInfo

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.ekm.listOriginalConnectedChannelInfo

List all disconnected channels—i.e., channels that were once connected to other workspaces and then disconnected—and the corresponding original channel IDs for key revocation with EKM.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_ids` | no | string | A comma-separated list of channels to filter to. |
| `team_ids` | no | string | A comma-separated list of the workspaces to which the channels you would like returned belong. |
| `limit` | no | integer | The maximum number of items to return. Must be between 1 - 1000 both inclusive. |
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "channels": [
        {
            "id": "string",
            "internal_team_ids": "array",
            "original_connected_host_id": "string",
            "original_connected_channel_id": "string"
        }
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.ekm.listOriginalConnectedChannelInfo.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
