# admin.usergroups.addTeams

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.usergroups.addTeams

Associate one or more default workspaces with an organization-wide IDP group.

## Params

| name | required | type | description |
|---|---|---|---|
| `usergroup_id` | yes | string | An encoded usergroup (IDP Group) ID. |
| `team_ids` | yes | array | A comma separated list of encoded team (workspace) IDs. Each workspace MUST belong to the organization associated with the token. |
| `auto_provision` | no | boolean | When true, this method automatically creates new workspace accounts for the IDP group members. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

```json
{
    "ok": true
}
```

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev response example)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.usergroups.addTeams.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
