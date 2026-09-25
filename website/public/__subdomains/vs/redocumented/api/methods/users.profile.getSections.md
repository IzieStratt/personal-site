# users.profile.getSections

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/users.profile.getSections

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `user` | no | string |  |
| `preview_mode` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `result` | { |
| `data` | { |
| `user` | { |
| `id` | string |
| `isSelf` | boolean |
| `profileSections` | Array<{ |
| `sectionId` | string |
| `label` | string |
| `order` | number |
| `type` | string |
| `canEdit` | boolean |
| `profileElements` | Record<UsersProfileGetSectionsResultDataUserProfileSectionsProfileElementsName, UsersProfileGetSectionsResultDataUserProfileSectionsProfileElementsEntry>[] |
| `__typename` | string |
| `team` | { |
| `prefs` | { |
| `scVisibility` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.profile.getSections.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
