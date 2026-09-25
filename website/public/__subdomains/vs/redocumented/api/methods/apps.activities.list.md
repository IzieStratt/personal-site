# apps.activities.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/apps.activities.list

Get logs for a specified app

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | yes | string | The id of the app to get activities from. |
| `team_id` | no | string | The team who owns this log. |
| `cursor` | no | string | Paginate through collections of data by setting the cursor parameter to a next_cursor attribute returned by a previous request's response_metadata. See pagination for more detail. |
| `limit` | no | integer | The maximum number of items to return. |
| `min_log_level` | no | string | The minimum log level of the log events to be returned. Defaults to 'info'. Acceptable values (in order of relative importance from smallest to largest) are ('trace', 'debug', 'info', 'warn', 'error', 'fatal'). |
| `log_event_type` | no | string | The event type of log events to be returned. |
| `source` | no | string | The source of log events to be returned. Acceptable values are ('slack', 'developer'). |
| `component_type` | no | string | The component type of log events to be returned. Acceptable values are ('events_api', 'workflows', 'functions', 'tables'). |
| `component_id` | no | string | The component id of log events to be returned. Will be 'FnXXXXXX' for functions, and 'WfXXXXXX' for workflows. |
| `trace_id` | no | string | The trace id of log events to be returned. |
| `min_date_created` | no | integer | The earliest timestamp of the log to retrieve (epoch microseconds). |
| `max_date_created` | no | integer | The latest timestamp of the log to retrieve (epoch microseconds). |
| `sort_direction` | no | enum | The direction you want the data sorted by (always by timestamp). |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "activities": [
        {
            "level": "info",
            "event_type": "function_execution_started",
            "source": "slack",
            "component_type": "functions",
            "component_id": "Fn123",
            "payload": {
                "function_name": "Reverse",
                "function_type": "app"
            },
            "created": 1650463798824317,
            "trace_id": "Tr123"
        }
    ],
    "response_metadata": {
        "next_cursor": ""
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.activities.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
