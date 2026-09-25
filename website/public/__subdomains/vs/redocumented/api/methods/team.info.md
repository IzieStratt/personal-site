# team.info

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/team.info

Gets information about the current team.

## Params

| name | required | type | description |
|---|---|---|---|
| `domain` | no | string | Query by domain instead of team (only when team is null). This only works for domains in the same enterprise as the querying team token. This also expects the domain to belong to a team and not the enterprise itself. This is the value set up for the 'Joining This Workspace' workspace setting. If it contains more than one domain, the field will contain multiple comma-separated domain values. If no domain is set, the field is empty. |
| `team` | no | string | Team to get info about; if omitted, will return information about the current team. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `team` | { |
| `id` | string |
| `name` | string |
| `url` | string |
| `domain` | string |
| `avatar_base_url` | string |
| `is_verified` | boolean |
| `plan` | string |
| `is_plan_frozen` | boolean |
| `icon` | { |
| `image_default` | boolean |
| `image_34` | string |
| `image_44` | string |
| `image_68` | string |
| `image_88` | string |
| `image_102` | string |
| `image_230` | string |
| `image_132` | string |
| `discoverable` | string |
| `lob_sales_home_enabled` | boolean |
| `is_sfdc_auto_slack` | boolean |
| `primary_owner` | { |
| `sso_provider` | { |
| `type` | string |
| `label` | string |
| `pay_prod_cur` | string |
| `locale` | string |
| `teams` | Array<{ |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/team.info.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
