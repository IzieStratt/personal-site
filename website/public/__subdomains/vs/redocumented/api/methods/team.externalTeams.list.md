# team.externalTeams.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/team.externalTeams.list

Returns a list of all the external teams connected and details about the connection.

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | integer | The maximum number of items to return per page. |
| `cursor` | no | string | Paginate through collections of data by setting parameter to the team_id attribute returned by a previous request's response_metadata. If not provided, the first page of the collection is returned. See pagination for more detail. |
| `sort_field` | no | enum | Name of the parameter that we are sorting by. |
| `sort_direction` | no | enum | Direction to sort in asc or desc. |
| `slack_connect_pref_filter` | no | array | Filters connected orgs by Slack Connect pref override(s). Value can be: approved_orgs_only allow_sc_file_uploads profile_visibility away_team_sc_invite_permissions accept_sc_invites sc_mpdm_to_private require_sc_channel_for_sc_dm external_awareness_context_bar. |
| `workspace_filter` | no | array | Shows connected orgs which are connected on a specified encoded workspace ID. |
| `connection_status_filter` | no | enum | Status of the connected team. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true,
    "organizations": [
        {
            "team_id": "T123ABC456",
            "team_name": "Sandra Inc.",
            "team_domain": "sandra",
            "public_channel_count": 1,
            "private_channel_count": 1,
            "im_channel_count": 1,
            "mpim_channel_count": 1,
            "connected_workspaces": {
                "workspace_id": "Jesse Inc",
                "workspace_name": "E123ABC456"
            },
            "slack_connect_prefs": {},
            "connection_status": "CONNECTED",
            "last_active_timestamp": 1718656058,
            "is_sponsored": false,
            "canvas": {
                "total_count": 1,
                "ownership_details": [
                    {
                        "team_id": "T123ABC456"
                    },
                    {
                        "count": 1
                    }
                ]
            },
            "lists": {
                "total_count": 1,
                "ownership_details": [
                    {
                        "team_id": "T123ABC456"
                    },
                    {
                        "count": 1
                    }
                ]
            }
        }
    ],
    "total_count": 1,
    "response_metadata": {
        "next_cursor": "T123ABC999"
    }
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/team.externalTeams.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
