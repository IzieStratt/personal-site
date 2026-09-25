# team.accessLogs

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/team.accessLogs

Gets the access logs for the current team.

## Params

| name | required | type | description |
|---|---|---|---|
| `before` | no | ['string', 'string'] | End of time range of logs to include in results (inclusive). |
| `cursor` | no | string | Parameter for pagination. Set cursor equal to the next_cursor attribute returned by the previous request's response_metadata. This parameter is optional, but pagination is mandatory: the default value simply fetches the first "page" of the collection. See pagination for more details. |
| `limit` | no | integer | The maximum number of items to return. Fewer than the requested number of items may be returned, even if the end of the list hasn't been reached. If specified, result is returned using a cursor-based approach instead of a classic one. |
| `team_id` | no | string | encoded team id to get logs from, required if org token is used. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "logins": [
        {
            "user_id": "U45678",
            "username": "alice",
            "date_first": 1422922864,
            "date_last": 1422922864,
            "count": 1,
            "ip": "127.0.0.1",
            "user_agent": "SlackWeb Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.35 Safari/537.36",
            "isp": "BigCo ISP",
            "country": "US",
            "region": "CA"
        },
        {
            "user_id": "U12345",
            "username": "white_rabbit",
            "date_first": 1422922493,
            "date_last": 1422922493,
            "count": 1,
            "ip": "127.0.0.1",
            "user_agent": "SlackWeb Mozilla/5.0 (iPhone; CPU iPhone OS 8_1_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12B466 Safari/600.1.4",
            "isp": "BigCo ISP",
            "country": "US",
            "region": "CA"
        }
    ],
    "paging": {
        "count": 100,
        "total": 2,
        "page": 1,
        "pages": 1
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/team.accessLogs.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
