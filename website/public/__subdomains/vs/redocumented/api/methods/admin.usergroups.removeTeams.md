# admin.usergroups.removeTeams

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.usergroups.removeTeams

Remove one or more default workspaces from an organization-wide IDP Group or Admin Group.

## Params

| name | required | type | description |
|---|---|---|---|
| `usergroup_id` | yes | string | An encoded usergroup (IDP Group) ID. |
| `team_ids` | yes | array | A comma separated list of encoded team (workspace) IDs. Each workspace MUST belong to the organization associated with the token. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.usergroups.removeTeams.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
