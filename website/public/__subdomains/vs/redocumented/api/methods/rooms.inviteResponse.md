# rooms.inviteResponse

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: yes, do not call without a human in the loop
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining); ingoau/huddlefm (source read, commit 2097946; not live-tested)
- call: POST https://slack.com/api/rooms.inviteResponse

Respond to a huddle invite; 'decline' is the only response value seen (huddlefm), sent with _x_reason=respond-to-huddle-invite.

## Params

| name | required | type | description |
|---|---|---|---|
| `response` | no | string |  |
| `channel_id` | no | string |  |
| `room_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified); ingoau/huddlefm (source read, commit 2097946; not live-tested) (response=decline, channel_id, room_id)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/rooms.inviteResponse.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
