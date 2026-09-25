# admin.barriers.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.barriers.list

Get all Information Barriers for your organization

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | integer | The maximum number of items to return. Must be between 1 - 1000 both inclusive. |
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "barriers": [
        {
            "id": "Ba03T70KB2H3",
            "enterprise_id": "E03055H6DAS",
            "primary_usergroup": {
                "id": "S03TZK4A9H6",
                "name": "Company That Pays Contracting Teams"
            },
            "barriered_from_usergroups": [
                {
                    "id": "S03TNHF56UR",
                    "name": "External Contracting Team"
                },
                {
                    "id": "S03TNHGAUGZ",
                    "name": "Another External Contracting Team"
                }
            ],
            "restricted_subjects": [
                "im",
                "mpim",
                "call"
            ],
            "date_update": 1660224825
        }
    ]
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.barriers.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
