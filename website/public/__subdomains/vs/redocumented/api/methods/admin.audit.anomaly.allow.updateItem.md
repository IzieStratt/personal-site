# admin.audit.anomaly.allow.updateItem

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.audit.anomaly.allow.updateItem

API to allow Enterprise org admins to write/overwrite the allow list of IP blocks and ASNs from the enterprise configuration.

## Params

| name | required | type | description |
|---|---|---|---|
| `trusted_cidr` | no | array | allow list of IPv4 addresses using cidr notation in the Enterprise organization configuration. |
| `trusted_asns` | no | array | allow list of Autonomous System Numbers (ASN) in the Enterprise organization configuration. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

Unknown.

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.audit.anomaly.allow.updateItem.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
