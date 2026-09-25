# signin.findWorkspaces

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/signin.findWorkspaces

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `only_logged_in_teams` | no | boolean |  |
| `ssb_signin` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `current_teams` | unknown[] |
| `current_orgs` | Array<{ |
| `org` | { |
| `id` | string |
| `name` | string |
| `url` | string |
| `domain` | string |
| `user_email` | string |
| `user_type` | string |
| `two_factor_required` | boolean |
| `sso_required` | boolean |
| `icon_44` | string |
| `icon_88` | string |
| `image_default` | boolean |
| `is_logged_out` | boolean |
| `last_login_ts` | number |
| `associated_user` | string |
| `user_14d_messages` | number |
| `user_workspace_signal_score` | number |
| `variant` | string |
| `can_apply_canvas` | boolean |
| `can_apply_workflow` | boolean |
| `can_apply_list` | boolean |
| `icon` | { |
| `image_34` | string |
| `image_44` | string |
| `image_68` | string |
| `image_88` | string |
| `image_102` | string |
| `image_230` | string |
| `image_132` | string |
| `user_name` | string |
| `user_title` | string |
| `user_icon` | { |
| `image_24` | string |
| `image_32` | string |
| `image_48` | string |
| `image_72` | string |
| `image_192` | string |
| `image_512` | string |
| `avatar_hash` | string |
| `auth_mode` | string |
| `sso_provider` | string |
| `profile_photos` | string[] |
| `active_users` | number |
| `ia_version` | number |
| `teams` | Array<{ |
| `invited_teams` | unknown[] |
| `domain_enabled_teams` | unknown[] |
| `has_valid_cookie` | boolean |
| `confirmed_email` | string |
| `privacy_consent_group` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/signin.findWorkspaces.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
