# team.profile.get

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/team.profile.get

Retrieve a team's profile.

## Params

| name | required | type | description |
|---|---|---|---|
| `visibility` | no | enum | Filter by visibility. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `profile` | { |
| `fields` | Array<{ |
| `id` | string |
| `ordering` | number |
| `field_name` | string |
| `label` | string |
| `hint` | string |
| `type` | string |
| `possible_values` | null |
| `options` | { |
| `is_scim` | boolean |
| `is_protected` | boolean |
| `is_hidden` | boolean |
| `section_id` | string |
| `permissions` | { |
| `api` | string[] |
| `ui` | boolean |
| `scim` | boolean |
| `is_inverse` | boolean |
| `sections` | Array<{ |
| `team_id` | string |
| `section_type` | string |
| `order` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/team.profile.get.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
