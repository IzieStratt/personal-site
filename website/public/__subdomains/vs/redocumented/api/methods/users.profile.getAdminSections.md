# users.profile.getAdminSections

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/users.profile.getAdminSections

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `result` | { |
| `data` | { |
| `admin` | { |
| `id` | string |
| `profileAdminSections` | Array<{ |
| `label` | string |
| `order` | number |
| `type` | string |
| `isHidden` | boolean |
| `canChangeHidden` | boolean |
| `canEdit` | boolean |
| `profileAdminElements` | Record<UsersProfileGetAdminSectionsResultDataAdminProfileAdminSectionsProfileAdminElementsName, UsersProfileGetAdminSectionsResultDataAdminProfileAdminSectionsProfileAdminElementsEntry>[] |
| `__typename` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.profile.getAdminSections.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
