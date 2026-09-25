# conversations.members

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/conversations.members

Retrieve members of a conversation.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | ID of the conversation to retrieve members for. |
| `cursor` | no | string | Paginate through collections of data by setting the cursor parameter to a next_cursor attribute returned by a previous request's response_metadata. Default value fetches the first "page" of the collection. See pagination for more detail. |
| `limit` | no | number | The maximum number of items to return. Fewer than the requested number of items may be returned, even if the end of the users list hasn't been reached. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "members": [
        "U023BECGF",
        "U061F7AUR",
        "W012A3CDE"
    ],
    "response_metadata": {
        "next_cursor": "e3VzZXJfaWQ6IFcxMjM0NTY3fQ=="
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.members.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
