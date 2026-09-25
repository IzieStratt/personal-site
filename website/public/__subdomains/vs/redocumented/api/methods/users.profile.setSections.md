# users.profile.setSections

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/users.profile.setSections

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `user` | no | string |  |
| `section` | no | string |  |
| `elements` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `result` | { |
| `data` | { |
| `setProfileSection` | { |
| `id` | string |
| `isSelf` | boolean |
| `profileSections` | Array<{ |
| `sectionId` | string |
| `label` | string |
| `order` | number |
| `type` | string |
| `canEdit` | boolean |
| `profileElements` | Record<UsersProfileSetSectionsResultDataSetProfileSectionProfileSectionsProfileElementsName, UsersProfileSetSectionsResultDataSetProfileSectionProfileSectionsProfileElementsEntry>[] |
| `__typename` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.profile.setSections.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
