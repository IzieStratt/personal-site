# admin.analytics.messages.metadata

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.analytics.messages.metadata

Retrieves metadata for a list of messages from a given channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | Channel ID for channel containing the messages to query. |
| `oldest_ts` | no | string | Oldest timestamp to include in the results. |
| `latest_ts` | no | string | Most recent timestamp to include in the results. If not passed, defaults to current time. |
| `cursor` | no | string | Paginate through collections of data by setting the cursor parameter to a next_cursor attribute returned by a previous request's response_metadata. Default value fetches the first "page" of the collection. See pagination for more detail. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "messages": [
        {
            "type": "message",
            "ts": "1234567890.123456",
            "user_id": "U123ABC456",
            "text_character_count": 42,
            "subtype": "bot_message",
            "thread_ts": "1234567890.123456",
            "reactions": [
                {
                    "name": "thumbsup",
                    "count": 5
                }
            ],
            "files": [
                {
                    "id": "F123ABC456",
                    "created": 1234567890,
                    "timestamp": 1234567890,
                    "mimetype": "image/png",
                    "filetype": "png",
                    "pretty_type": "PNG"
                }
            ]
        }
    ],
    "response_metadata": {
        "next_cursor": "abcd..."
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.analytics.messages.metadata.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
