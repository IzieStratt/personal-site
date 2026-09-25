# users.profile.setAdminSections

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/users.profile.setAdminSections

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `sections` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `result` | { |
| `data` | { |
| `setProfileAdmin` | { |
| `id` | string |
| `profileAdminSections` | Array<{ |
| `label` | string |
| `order` | number |
| `type` | string |
| `isHidden` | boolean |
| `canChangeHidden` | boolean |
| `canEdit` | boolean |
| `profileAdminElements` | Record<UsersProfileSetAdminSectionsResultDataSetProfileAdminProfileAdminSectionsProfileAdminElementsName, UsersProfileSetAdminSectionsResultDataSetProfileAdminProfileAdminSectionsProfileAdminElementsEntry>[] |
| `__typename` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.profile.setAdminSections.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
