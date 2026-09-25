# apps.profile.get

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/apps.profile.get

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `app` | no | string |  |
| `bot` | no | string |  |
| `bot_home_team` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `app_profile` | { |
| `id` | string |
| `name` | string |
| `developer_name` | string |
| `desc` | string |
| `commands` | Record<string, { |
| `usage` | string |
| `type` | string |
| `app` | string |
| `is_xoxa_app` | boolean |
| `app_user_id` | string |
| `long_desc` | string |
| `long_desc_formatted` | string |
| `url` | string |
| `support_url` | string |
| `config_url` | string |
| `is_directory_published` | boolean |
| `is_directory_approved` | boolean |
| `is_distributed` | boolean |
| `is_slack_integration` | boolean |
| `youtube_url` | string |
| `app_card_color` | string |
| `installation_summary` | string |
| `user_can_manage` | boolean |
| `team_id` | string |
| `is_external` | boolean |
| `is_installed` | boolean |
| `is_workflow_app` | boolean |
| `owner_ids` | unknown[] |
| `org_status` | string |
| `security_compliance` | { |
| `company_developer_name` | string |
| `company_location` | string |
| `tos_url` | string |
| `data_retention_policy` | string |
| `data_archival_removal_policy` | string |
| `data_storage_policy` | string |
| `cert_comply_soc_cert_url` | string |
| `cert_comply_hipaa_compliant` | string |
| `cert_comply_sub_processors` | string |
| `cert_comply_guidelines_sub_processors_url` | string |
| `cert_comply_data_deletion_requests_handling` | string |
| `security_support_sso` | string |
| `security_what_sso` | string |
| `security_support_saml` | string |
| `security_dedicated_security` | string |
| `security_email` | string |
| `security_vulnerability_program` | string |
| `security_vulnerability_url` | string |
| `security_bug_bounty_program` | string |
| `security_bug_bounty_url` | string |
| `security_vulnerability_program_slack` | string |
| `security_third_party_auths_required` | string |
| `use_llm` | string |
| `cert_comply_gdpr_commitment_url` | string |
| `data_center_location` | string[] |
| `data_how_host` | string |
| `data_host_company` | string |
| `cert_comply_iso_iec_27001_cert_url` | string |
| `cert_comply_iso_iec_27017_cert_url` | string |
| `cert_comply_iso_iec_27018_cert_url` | string |
| `cert_comply_fedramp_cert_url` | string |
| `cert_comply_csa_star_level_cert_url` | string |
| `cert_comply_privacy_shield_notice_url` | string |
| `security_third_party_services` | string |
| `is_certified` | boolean |
| `is_ai_app` | boolean |
| `is_agent_app` | boolean |
| `is_search_app` | boolean |
| `date_installed` | number |
| `categories` | Record<Timestamp, { |
| `screenshots` | Array<{ |
| `image_original` | string |
| `image_440` | string |
| `image_1000` | string |
| `image_1600` | string |
| `icons` | { |
| `image_32` | string |
| `image_48` | string |
| `image_64` | string |
| `image_72` | string |
| `image_96` | string |
| `image_128` | string |
| `image_192` | string |
| `image_512` | string |
| `image_1024` | string |
| `image_36` | string |
| `bot_user` | { |
| `username` | string |
| `memberships_count` | number |
| `auth` | { |
| `created_by` | string |
| `date_created` | number |
| `scopes` | string[] |
| `full_name` | string |
| `real_name` | string |
| `image_24` | string |
| `work_objects` | { |
| `is_active` | number |
| `app_home_metadata` | { |
| `home_tab_enabled` | boolean |
| `messages_tab_enabled` | boolean |
| `messages_tab_read_only_enabled` | boolean |
| `user_is_creation_team_member` | boolean |
| `config` | { |
| `bot_id` | string |
| `descriptive_label` | string |
| `date_deleted` | number |
| `is_owned_by_viewer` | boolean |
| `is_public` | boolean |
| `is_custom_integration` | boolean |
| `permissions` | Record<string, unknown> |
| `directory_payload_public` | { |
| `privacy_link` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.profile.get.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
