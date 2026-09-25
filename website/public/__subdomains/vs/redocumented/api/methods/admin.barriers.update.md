# admin.barriers.update

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.barriers.update

Update an existing Information Barrier

## Params

| name | required | type | description |
|---|---|---|---|
| `barrier_id` | yes | string | The ID of the barrier you're trying to modify. |
| `primary_usergroup_id` | yes | string | The id of the primary IDP Group. |
| `barriered_from_usergroup_ids` | yes | array | A list of IDP Groups ids that the primary usergroup is to be barriered from. |
| `restricted_subjects` | yes | array | What kind of interactions are blocked by this barrier? For v1, we only support a list of all 3, eg im, mpim, call. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "barrier": {
        "id": "Ba03T70KB2H3",
        "enterprise_id": "E03055H6DAS",
        "primary_usergroup": {
            "id": "S03TZK4A9H6",
            "name": "Company That Pays Contracting Teams"
        },
        "barriered_from_usergroups": [
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
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.barriers.update.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
