# users.profile.getExtras

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/users.profile.getExtras

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `keys` | no | string |  |
| `user` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `channels` | unknown[] |
| `shared_channels` | unknown[] |
| `full_member_channels` | unknown[] |
| `onboarding_complete` | null |
| `im_mpim_ids` | string[] |
| `has_more_mpims` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.profile.getExtras.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
