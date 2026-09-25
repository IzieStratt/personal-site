# admin.conversations.search

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.conversations.search

Search for public or private channels in an Enterprise organization.

## Params

| name | required | type | description |
|---|---|---|---|
| `team_ids` | no | array | Comma separated string of team IDs, signifying the internal workspaces to search through. |
| `connected_team_ids` | no | array | Array of encoded team IDs, signifying the external orgs to search through. |
| `query` | no | string | Name of the the channel to query by. |
| `limit` | no | integer | Maximum number of items to be returned. Must be between 1 - 20 both inclusive. Default is 10. |
| `cursor` | no | string | Set cursor to next_cursor returned by the previous call to list items in the next page. |
| `search_channel_types` | no | array | The type of channel to include or exclude in the search. For example private will search private channels, while private_exclude will exclude them. For a full list of types, check the Types section. |
| `sort` | no | string | Possible values are relevant (search ranking based on what we think is closest), name (alphabetical), member_count (number of users in the channel), and created (date channel was created). You can optionally pair this with the sort_dir arg to change how it is sorted . |
| `sort_dir` | no | string | Sort direction. Possible values are asc for ascending order like (1, 2, 3) or (a, b, c), and desc for descending order like (3, 2, 1) or (c, b, a). |
| `total_count_only` | no | boolean | Only return the total_count of channels. Omits channel data and allows access for admins without channel manager permissions. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "conversations": [
        {
            "id": "GSEV0B5PY",
            "name": "privacy-channel",
            "purpose": "Group messaging with: @rita @nwhere @meanie",
            "member_count": -1,
            "created": 1578423973,
            "creator_id": "WPQ65MVKK",
            "is_private": true,
            "is_archived": true,
            "is_general": false,
            "last_activity_ts": 1583198954000200,
            "is_ext_shared": false,
            "is_global_shared": true,
            "is_org_default": false,
            "is_org_mandatory": false,
            "is_org_shared": true,
            "is_frozen": false,
            "connected_team_ids": [],
            "internal_team_ids_count": 4,
            "internal_team_ids_sample_team": "T013F30DBAB",
            "pending_connected_team_ids": [],
            "is_pending_ext_shared": false
        },
        {
            "id": "C013JDPD6CR",
            "name": "proj-decomposed-monolith",
            "purpose": "",
            "member_count": 1,
            "created": 1588786531,
            "creator_id": "WPQ65MVKK",
            "is_private": false,
            "is_archived": false,
            "is_general": false,
            "last_activity_ts": 1589854024000200,
            "is_ext_shared": false,
            "is_global_shared": false,
            "is_org_default": false,
            "is_org_mandatory": false,
            "is_org_shared": true,
            "is_frozen": false,
            "connected_team_ids": [],
            "internal_team_ids_count": 1,
            "internal_team_ids_sample_team": "TPQ67R81F",
            "pending_connected_team_ids": [],
            "is_pending_ext_shared": false
        }
    ],
    "next_cursor": "aWQ6Mw==",
    "total_count": 14823
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.conversations.search.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
