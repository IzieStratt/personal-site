# onboarding.updateTeam

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/onboarding.updateTeam

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `field_name` | no | string |  |
| `field_value` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `team_data` | { |
| `initial_channel_id` | string |
| `tractor_channel_name` | null |
| `initial_invite_list` | string |
| `created_with_google` | boolean |
| `use_case_onboarding_selection` | string |
| `solutions_onboarding_canvas_card_tracking` | string |
| `solutions_onboarding_list_card_tracking` | string |
| `creator_straight_to_paid_exp` | null |
| `is_stp_no_discount_group` | boolean |
| `has_redeemed_solutions_gallery_trial` | null |
| `has_redeemed_ai_workspace_setup_trial` | null |
| `has_started_feature_auto_charge_trial` | null |
| `creator_guided_setup` | string |
| `setup_query_string` | string |
| `ai_workspace_setup` | string |
| `ai_workspace_team_creation_flow_cards` | string |
| `has_redeemed_auto_slack_trial` | boolean |
| `all_company_channel_handbook_card` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/onboarding.updateTeam.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
