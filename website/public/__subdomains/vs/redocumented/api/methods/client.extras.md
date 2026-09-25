# client.extras

- status: undocumented
- verified: partial
- tokens: enterprise xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/client.extras

Auxiliary boot payload

## Params

| name | required | type | description |
|---|---|---|---|
| `extras` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `salesforce_features` | { |
| `is_sfdc_auto_slack` | boolean |
| `is_slack_first_crm` | boolean |
| `lob_sales_home_enabled_for_team` | boolean |
| `lob_sales_home_enabled_for_user` | boolean |
| `plan_info` | { |
| `is_plan_frozen` | boolean |
| `plan_level` | string |
| `user_can_access_admin_billing` | boolean |
| `primary_owner_country_code` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/client.extras.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
