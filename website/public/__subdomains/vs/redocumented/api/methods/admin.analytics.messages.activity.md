# admin.analytics.messages.activity

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.analytics.messages.activity

Retrieves activity metrics for messages from a given channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | Channel ID for channel of the message activity to query. |
| `oldest_ts` | no | string | Oldest timestamp to include in the results. Defaults to 7 days before current time. If not passed while still passing the latest_ts parameter, defaults to 7 days before latest_ts. |
| `latest_ts` | no | string | Most recent timestamp to include in results. Defaults to current time. If not passed while still passing the oldest_ts parameter, defaults to 7 days after oldest_ts. |
| `cursor` | no | string | Paginate through collections of data by setting the cursor parameter to a next_cursor attribute returned by a previous request's response_metadata. Default value fetches the first "page" of the collection. |
| `limit` | no | integer | Maximum number of entries to return. Defaults to 50 if not passed. Max allowed is 100. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "message_activities": [
        {
            "channel_id": "C123ABC456",
            "timestamp": "1234567890.123456",
            "unique_user_reactions_count": 15,
            "unique_user_shares_count": 8,
            "unique_user_views_count": 142,
            "unique_user_clicks_count": 23,
            "unique_views_client": {
                "desktop_views_count": 89,
                "mobile_views_count": 42,
                "web_views_count": 11
            },
            "unique_stats_by_department": [
                {
                    "department": "Engineering",
                    "views": 45,
                    "reactions": 8,
                    "shares": 3,
                    "clicks": 12
                },
                {
                    "department": "Product",
                    "views": 32,
                    "reactions": 4,
                    "shares": 2,
                    "clicks": 7
                }
            ],
            "unique_stats_by_org": [
                {
                    "team_id": "T123ABC456",
                    "views": 98,
                    "reactions": 12,
                    "shares": 5,
                    "clicks": 18
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
JSON: https://vs.izie.top/redocumented/api/methods/admin.analytics.messages.activity.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
