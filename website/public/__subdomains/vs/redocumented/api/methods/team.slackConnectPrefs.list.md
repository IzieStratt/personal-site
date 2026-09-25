# team.slackConnectPrefs.list

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/team.slackConnectPrefs.list

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `defaults` | { |
| `allow_sc_file_uploads` | boolean |
| `profile_visibility` | string |
| `allowed_workspaces` | { |
| `type` | string |
| `team_ids` | unknown[] |
| `allowed_canvas_sharing` | boolean |
| `allowed_list_sharing` | boolean |
| `away_team_sc_invite_permissions` | { |
| `away_team_sc_invite_require_2fa` | boolean |
| `accept_sc_invites` | { |
| `accept_private` | boolean |
| `sc_channel_limited_access` | string |
| `sc_mpdm_to_private` | { |
| `require_sc_channel_for_sc_dm` | boolean |
| `shared_channel_invite_requested` | Record<string, unknown> |
| `accept_spaces_invites` | boolean |
| `spaces_approval_type` | string |
| `interact_with_externally_owned_workflows` | string |
| `approved_org_info` | string |
| `partner_overrides` | unknown[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/team.slackConnectPrefs.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
