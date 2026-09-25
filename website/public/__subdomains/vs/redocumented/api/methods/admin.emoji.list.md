# admin.emoji.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.emoji.list

List emoji for an Enterprise organization.

## Params

| name | required | type | description |
|---|---|---|---|
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |
| `limit` | no | integer | The maximum number of items to return. Must be between 1 - 1000 both inclusive. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "emoji": {
        "workflow": {
            "url": "https://emoji.slack-edge.com/TM315QLU8/workflow/530de66adccc59c5.png",
            "date_created": 1591720632,
            "uploaded_by": "WLWLQDAL9"
        },
        "welcome": {
            "url": "https://emoji.slack-edge.com/TM315QLU8/welcome/763d3659699d2ef7.gif",
            "date_created": 1593383451,
            "uploaded_by": "WPU7MCTFH"
        },
        "person": {
            "url": "https://emoji.slack-edge.com/TM315QLU8/person/81295a4f69d8b122.png",
            "date_created": 1593383817,
            "uploaded_by": "WPU7MCTFH"
        },
        "people": {
            "url": "https://emoji.slack-edge.com/TM315QLU8/people/0b40796ab677b47f.png",
            "date_created": 1593383822,
            "uploaded_by": "WPU7MCTFH"
        },
        "slackbot": {
            "url": "https://emoji.slack-edge.com/TM315QLU8/slackbot/561d6e545263d92b.png",
            "date_created": 1593383989,
            "uploaded_by": "WPU7MCTFH"
        },
        "plus1": {
            "url": "https://emoji.slack-edge.com/TM315QLU8/plus1/42b92e57a79eb27e.png",
            "date_created": 1593724572,
            "uploaded_by": "WPU7MCTFH"
        },
        "bc": {
            "url": "https://emoji.slack-edge.com/TM315QLU8/bc/fb3dfdea697528b9.png",
            "date_created": 1594854289,
            "uploaded_by": "WPU7MCTFH"
        },
        "wf": {
            "url": "https://emoji.slack-edge.com/TM315QLU8/wf/04dad3aa28b57cd3.png",
            "date_created": 1594854443,
            "uploaded_by": "WPU7MCTFH"
        },
        "kb": {
            "url": "https://emoji.slack-edge.com/TM315QLU8/kb/bab417c375703f7b.png",
            "date_created": 1598467537,
            "uploaded_by": "WPU7MCTFH"
        },
        "ignore": {
            "url": "https://emoji.slack-edge.com/TM315QLU8/ignore/9506cda43addbad8.png",
            "date_created": 1598467835,
            "uploaded_by": "WPU7MCTFH"
        }
    },
    "response_metadata": {
        "next_cursor": ""
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.emoji.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
