# team.slackConnectPrefs.set

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/team.slackConnectPrefs.set

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `prefs` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `slack_connect_prefs` | { |
| `allow_sc_file_uploads` | { |
| `value` | boolean |
| `source` | string |
| `profile_visibility` | { |
| `type` | string |
| `allowed_workspaces` | { |
| `team_ids` | unknown[] |
| `allowed_canvas_sharing` | { |
| `allowed_list_sharing` | { |
| `away_team_sc_invite_permissions` | { |
| `away_team_sc_invite_require_2fa` | { |
| `accept_sc_invites` | { |
| `accept_private` | boolean |
| `sc_channel_limited_access` | { |
| `sc_mpdm_to_private` | { |
| `require_sc_channel_for_sc_dm` | { |
| `shared_channel_invite_requested` | { |
| `accept_spaces_invites` | { |
| `spaces_approval_type` | { |
| `interact_with_externally_owned_workflows` | { |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/team.slackConnectPrefs.set.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
