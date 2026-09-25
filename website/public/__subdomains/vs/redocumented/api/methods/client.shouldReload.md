# client.shouldReload

- status: undocumented
- verified: partial
- tokens: enterprise xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/client.shouldReload

Client build-staleness check

## Params

| name | required | type | description |
|---|---|---|---|
| `build_manifest_last_modified` | no | number |  |
| `team_ids` | no | string |  |
| `build_version_ts` | no | number |  |
| `prev_client_recommended_build_version` | no | number |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `build_version_enabled` | boolean |
| `should_reload` | boolean |
| `client_min_version` | number |
| `client_min_build_version` | number |
| `client_min_config_version` | number |
| `recommended_build_version` | number |
| `build_manifest_last_modified` | number |
| `should_fetch_new_service_worker` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/client.shouldReload.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
